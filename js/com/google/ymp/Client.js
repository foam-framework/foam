/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'com.google.ymp',
  name: 'Client',

  requires: [
    'Binding',
    'PersistentContext',
    'foam.core.dao.AuthenticatedWebSocketDAO',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.EasyClientDAO',
    'foam.dao.CachingDAO',
    'foam.core.dao.CloningDAO',
    'foam.core.dao.SyncDAO',
    'com.google.ymp.bb.ContactProfile',
    'com.google.ymp.bb.Post',
    'com.google.ymp.bb.Reply',
    'com.google.ymp.DynamicImage',
    'com.google.ymp.Person',
    'com.google.ymp.Market',
    'com.google.ymp.ClientContext',
    'com.google.ymp.dao.DynamicWhereDAO',
    'foam.core.dao.JoinDAO',
  ],

  imports: [
    'appTitle$',
  ],
  exports: [
    'postDAO',
    'replyDAO',
    'dynamicImageDAO',
    'uploadImageDAO',
    'personDAO',
    'marketDAO',
    'highResImageDAO',
    'dynamicImageDataDAO',
    'contactProfileDAO',
    'currentUser',
    'currentUserId_ as currentUserId',

    'clearCache',
  ],

  properties: [
    {
      name: 'postDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Post,
          name: 'posts',
          cache: true,
          syncWithServer: true,
          sockets: true,
        }).orderBy(DESC(this.Post.getPrototype().CREATION_TIME));
      },
    },
    {
      name: 'replyDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Reply,
          name: 'replies',
          cache: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
    {
      name: 'uploadImageDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.DynamicImage,
          name: 'dynamicImageSync',
          daoType: MDAO,
          syncWithServer: true,
          sockets: true,
          cache: false,
        });
      },
    },
    {
      name: 'dynamicImageDAO',
      lazyFactory: function() {
        var e = this.EasyDAO.create({ // the rest of the properties are indexed
          model: this.DynamicImage,
          type: 'MDAO',
          name: 'dynamicImages',
          autoIndex: true,
          cache: true,
        });
        e.addIndex(this.DynamicImage.IMAGE_ID);
        var d = this.CloningDAO.create({
          delegate: this.JoinDAO.create({ // offload image data to separate DAO
            delegate: e,
            property: this.DynamicImage.IMAGE,
            joinToDAO: this.dynamicImageDataDAO,
          })
        });
        this.uploadImageDAO.pipe(d);
        return d;
      },
    },
    {
      name: 'dynamicImageDataDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.DynamicImage,
          name: 'dynamicImageData',
          cache: true,
        });
        // return this.IDBDAO.create({
        //   model: this.DynamicImage,
        //   name: 'dynamicImageData'
        // });
      },
    },
    {
      name: 'highResImageDAO',
      lazyFactory: function() { /* Allow access to unfiltered images, but don't sync */
        return this.EasyClientDAO.create({
          model: this.DynamicImage,
          subject: 'com.google.ymp.highResImageDAO',
          sockets: true,
        });
      },
    },
    {
      name: 'personDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          cache: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
    {
      name: 'contactProfileDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.ContactProfile,
          name: 'contactProfiles',
          cache: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
    {
      name: 'marketDAO',
      lazyFactory: function() {
        return this.EasyClientDAO.create({
            model: this.Market,
            sockets: true,
        });
      },
    },
    {
      name: 'persistentContext',
      transient: true,
      lazyFactory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: this
        });
      },
    },
    {
      subType: 'com.google.ymp.ClientContext',
      name: 'ctx',
      transient: true,
      defaultValue: null,
      postSet: function(old, nu) { this.rebindCtx(old, nu); },
    },
    {
      type: 'String',
      name: 'currentUserId',
      postSet: function(old, nu) {
        if ( nu ) this.currentUserId_ = nu;
      },
    },
    {
      type: 'String',
      name: 'currentUserId_',
      preSet: function(old, nu) {
        // Resist going from some user to no user. Usually caused by initial
        // persistent context.
        return (old && ! nu) ? old : nu;
      },
      postSet: function(old, nu) {
        // Reset memorable value once this value is set.
        if ( this.currentUserId ) this.currentUserId = '';

        if ( ! this.currentUser || nu !== this.currentUser.id ) {
          // There's a delay on boot that caused the fine() to fail. TODO: This listener is pointless
          // after boot, once we have the user loaded.
          this.personDAO.where(EQ(this.Person.ID, nu)).pipe({ put: function(user) {
            this.currentUser = user;
          }.bind(this), eof: function() {
            debugger;
          }, error: function() {
            debugger;
          } });
        }
      },
    },
    {
      name: 'currentUser',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        // if ( nu ) {
        //   if ( nu.id !== this.currentUserId ) this.currentUserId = nu.id;
        // }
        this.subscribedMarkets = nu.subscribedMarkets;

        if ( old ) {
          this.clearCache();
        }
        if ( nu ) {
          this.appTitle = nu.name + '\'s Bulletin Boards';
        }
      },
    },
    {
      type: 'Array',
      name: 'subscribedMarkets',
    },
    {
      type: 'String',
      name: 'appTitle',
      defaultValue: 'Avizi',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      var WebSocket = this.AuthenticatedWebSocketDAO.xbind({
        authToken$: this.currentUserId_$,
      });
      this.Y.registerModel(WebSocket, 'foam.core.dao.WebSocketDAO');
      this.persistentContext.bindObject('ctx', this.ClientContext,
                                        undefined, 1);
    },
    function rebindCtx(old, nu) {
      this.rebindCtxProperties(old, nu, [
        'currentUserId_$',
      ]);
    },
    function rebindCtxProperties(old, nu, propValueNames) {
      var i;
      if ( old ) {
        for ( i = 0; i < propValueNames.length; ++i ) {
          Events.unlink(old[propValueNames[i]], this[propValueNames[i]]);
        }
      }
      if ( nu ) {
        for ( i = 0; i < propValueNames.length; ++i ) {
          Events.link(nu[propValueNames[i]], this[propValueNames[i]]);
        }
      }
    },
    function clearCache() {
      // Changing users, clear out old cache
      console.log("User change: clearing old cached data");
      this.IDBDAO.create({
        model: this.Post,
        name: 'posts',
      }).removeAll();
      this.IDBDAO.create({
        model: this.SyncDAO.SyncRecord,
        name: 'posts_SyncRecords',
      }).removeAll();

      this.IDBDAO.create({
        model: this.Reply,
        name: 'replies',
      }).removeAll();
      this.IDBDAO.create({
        model: this.SyncDAO.SyncRecord,
        name: 'replies_SyncRecords',
      }).removeAll();

      this.IDBDAO.create({
        model: this.DynamicImage,
        name: 'dynamicImageSync',
      }).removeAll();
      this.IDBDAO.create({
        model: this.SyncDAO.SyncRecord,
        name: 'dynamicImageSync_SyncRecords',
      }).removeAll();
      this.IDBDAO.create({
        model: this.DynamicImage,
        name: 'dynamicImages',
      }).removeAll();
      this.IDBDAO.create({
        model: this.DynamicImage,
        name: 'dynamicImageData',
      }).removeAll();
    }
  ]
});
