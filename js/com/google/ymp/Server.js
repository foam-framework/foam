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
  name: 'Server',

  requires: [
    'MDAO',
    'foam.dao.EasyDAO',
    'com.google.ymp.bb.Post',
    'com.google.ymp.bb.Reply',
    'com.google.ymp.geo.Location',
    'com.google.ymp.DynamicImage',
    'com.google.ymp.Person',
    'com.google.ymp.Market',
    'com.google.ymp.dao.MarketSubAuthorizer',

    'foam.dao.AuthorizedDAO',
    'foam.dao.DebugAuthDAO',
    'foam.dao.EasyDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.ProxyDAO',

    'com.google.ymp.test.DataLoader',
  ],
  imports: [
    'console',
    'exportDAO',
    'exportFile',
    'setInterval',
  ],
  exports: [
    'postDAO_',
    'replyDAO_',
    'personDAO as personDAO_',
    'dynamicImageDAO_',
    'marketDAO as marketDAO_',

    // Used if auto-generating markets from locations.
    'locationDAO as locationDAO_',
  ],

  properties: [
    {
      name: 'postDAO_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Post,
          name: 'posts',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
        // TODO: filter using a variant of PrivateOwnerAuthorizer, to
        // only select posts from the principal's
        // subscribed markets
      },
    },
    {
      name: 'postDAO',
      lazyFactory: function() {
        return this.authorizeMarketSubFactory(this.postDAO_);
      }
    },
    {
      name: 'replyDAO_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Reply,
          name: 'replies',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
        // TODO: filter using a variant of PrivateOwnerAuthorizer,
        // to only select replies to posts from the  principal's subscribed
        // markets. For speed, store the market ID on the reply rather than
        // looking up by market->post->reply, therefore use same authorizer as postDAO
      },
    },
    {
      name: 'replyDAO',
      lazyFactory: function() {
        return this.authorizeMarketSubFactory(this.replyDAO_);
      }
    },
    {
      name: 'dynamicImageDAO_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.DynamicImage,
          name: 'dynamicImages',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
        // TODO: filter by user's requested default LOD, which images they require (which will be slow to calculate)
      },
    },
    {
      name: 'dynamicImageDAO',
      lazyFactory: function() {
        return this.authorizeMarketSubFactory(this.dynamicImageDAO_);
      }
    },
    {
      name: 'personDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
          //syncProperty: 'syncProperty',
          //deletedProperty: 'deletedProperty',
        });
        // TODO: how much to sync?
      },
    },
    {
      name: 'marketDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Market,
          name: 'markets',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
        });
      },
    },

    // Used if auto-generating markets from locations.
    // Provides locationDAO_ for generators.MarketGenerator.
    // {
    //   name: 'locationDAO',
    //   lazyFactory: function() {
    //     return this.EasyDAO.create({
    //       model: this.Location,
    //       name: 'locations',
    //       daoType: this.MDAO,
    //       guid: true,
    //     });
    //   },
    // },
  ],

  methods: [
    function execute() {
      this.console.log('Executing instance of', this.model_.id);

      this.DataLoader.create().loadServerData();

      // Serve "compiled" / "production" YMp (built via apps/ymp/build.sh).
      var staticDir = global.FOAM_BOOT_DIR + '/../apps/ymp/build';
      this.exportFile('/main.html', staticDir + '/main.html');
      this.exportFile('/foam.js', staticDir + '/foam.js');
      this.exportFile('/app.manifest', staticDir + '/app.manifest');
      // Already served by ServeFOAM agent.
      // this.exportFile('/fonts.css', staticDir + '/fonts.css');

      // Serve app data via several DAOs.
      this.exportDAO(this.postDAO);
      this.exportDAO(this.replyDAO);
      this.exportDAO(this.dynamicImageDAO);
      this.exportDAO(this.personDAO);
      this.exportDAO(this.marketDAO);
      // var inc = 0;
      // this.setInterval(function() {
      //   this.postDAO.put(this.Post.create({
      //     syncProperty: 0,
      //     guid: createGUID(),
      //     title: 'new thing' + inc++,
      //   }))
      // }.bind(this), 4000);

      this.console.log('DAO data loaded');
    },
    function authorizeMarketSubFactory(delegate) {
      return this.DebugAuthDAO.create({
        delegate: this.AuthorizedDAO.create({
          model: delegate.model,
          delegate: delegate,
          authorizer: this.MarketSubAuthorizer.create()
        }, this.Y),
      }, this.Y);
    },

  ],
});
