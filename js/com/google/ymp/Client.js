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
    'foam.core.dao.AuthenticatedWebSocketDAO',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.dao.EasyClientDAO',
    'foam.dao.CachingDAO',
    'foam.core.dao.SyncDAO',
    'com.google.ymp.bb.Post',
    'com.google.ymp.bb.Reply',
    'com.google.ymp.DynamicImage',
    'com.google.ymp.Person',
    'com.google.ymp.Market',
    'foam.ui.DAOListView',
    'com.google.ymp.dao.DynamicWhereDAO',
  ],

  exports: [
    'postDAO',
    'replyDAO',
    'dynamicImageDAO',
    'personDAO',
    'marketDAO',
    'highResImageDAO',
    
    'clearCache',
  ],

  properties: [
    {
      name: 'postDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() {
        return this.DynamicWhereDAO.create({
          sourceDelegate: this.EasyDAO.create({
            model: this.Post,
            name: 'posts',
            caching: true,
            syncWithServer: true,
            sockets: true,
          }),
          predicate: IN,
          property: this.Post.MARKET,
          parameter$: this.subscribedMarkets$
        });
      },
    },
    {
      name: 'replyDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() {
        return this.DynamicWhereDAO.create({
          sourceDelegate: this.EasyDAO.create({
            model: this.Reply,
            name: 'replies',
            caching: true,
            syncWithServer: true,
            sockets: true,
          }),
          predicate: IN,
          property: this.Reply.MARKET,
          parameter$: this.subscribedMarkets$
        });
      },
    },
    {
      name: 'dynamicImageDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.DynamicImage,
          name: 'dynamicImages',
          caching: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
    {
      name: 'highResImageDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() { /* Allow access to unfiltered images, but don't sync */
        var d = this.EasyClientDAO.create({
            model: this.DynamicImage,
            subject: 'com.google.ymp.highResImageDAO',
            sockets: true,
        });
        return d;
      },
    },
    {
      name: 'personDAO',
      view: {
        factory_:  'foam.ui.DAOListView',
        rowView: 'foam.ui.DetailView'
      },
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          caching: true,
          syncWithServer: true,
          sockets: true,
        });
      },
    },
    {
      name: 'marketDAO',
      view: 'foam.ui.DAOListView',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Market,
          name: 'markets',
          caching: true,
          // make remote
        });
      },
    },
    {
      model_: 'StringProperty',
      name: 'currentUserId',
      postSet: function(old, nu) {
        
        if ( ! nu ) {
          this.clearCache();
        }
        
        if ( old === nu ) return;
        if ( ! this.currentUser || nu !== this.currentUser.id ) {
          // There's a delay on boot that caused the fine() to fail. TODO: This listener is pointless
          // after boot, once we have the user loaded.
          this.personDAO.where(EQ(this.Person.ID, nu)).pipe({ put: function(user) {
            this.currentUser = user;
          }.bind(this) });
        }
      },
    },
    {
      name: 'currentUser',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu ) {
          if ( nu.id !== this.currentUserId ) this.currentUserId = nu.id;
        }
        this.subscribedMarkets = nu.subscribedMarkets;
        
        if ( old ) {
          this.clearCache();
        }
      }
    },
    {
      type: 'Array',
      name: 'subscribedMarkets',
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var WebSocket = this.AuthenticatedWebSocketDAO.xbind({
        authToken$: this.currentUserId$,
      });
      this.Y.registerModel(WebSocket, 'foam.core.dao.WebSocketDAO'); 

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
        name: 'dynamicImages',
      }).removeAll();
      this.IDBDAO.create({
        model: this.SyncDAO.SyncRecord,
        name: 'dynamicImages_SyncRecords',
      }).removeAll();
    }
  ]
});
