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

    'com.google.ymp.bb.ContactProfile',
    'com.google.ymp.bb.Post',
    'com.google.ymp.bb.PostFilter',
    'com.google.ymp.bb.Reply',
    'com.google.ymp.geo.Location',
    'com.google.ymp.DynamicImage',
    'com.google.ymp.Person',
    'com.google.ymp.Market',
    'com.google.ymp.dao.MarketSubAuthorizer',
    'com.google.ymp.dao.DynamicImageAuthorizer',


    'foam.dao.AuthorizedDAO',
    'foam.dao.DebugAuthDAO',
    'foam.dao.EasyDAO',
    'foam.dao.EasyDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.PrivateOwnerAuthorizer',
    'foam.dao.ProxyDAO',
    'foam.mlang.PropertySequence',

    'com.google.ymp.test.DataLoader',
    'com.google.ymp.test.ServerDebug',
  ],
  imports: [
    'console',
    'exportDAO',
    'exportFile',
    'setInterval',
  ],
  exports: [ // the DAO_ exports are for fake data injects from test/DataLoader
    'postDAO_',
    'replyDAO_',
    'postFilterDAO_',
    'postRelationDAO_',
    'personDAO as personDAO_',
    'contactProfileDAO as contactProfileDAO_',
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
          // logging: true,
        });
      },
    },
    {
      name: 'postDAO',
      lazyFactory: function() {
        return this.authorizeMarketSubFactory(this.postDAO_);
      }
    },
    {
      name: 'postFilterDAO_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.PostFilter,
          name: 'posts',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
      },
    },
    {
      name: 'postFilterDAO',
      lazyFactory: function() {
        return this.authorizePersonFactory(this.postFilterDAO_);
      },
    },
    {
      name: 'postRelationDAO_',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.PostRelation,
          name: 'posts',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
        });
      },
    },
    {
      name: 'postRelationDAO',
      lazyFactory: function() {
        return this.authorizeMarketSubFactory(
            this.postRelationDAO_,
            [
              this.PostRelation.POST.dot(this.Post.MARKET),
              this.PostRelation.RELATED.dot(this.Post.MARKET),
            ]);
      },
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
      },
    },
    {
      name: 'dynamicImageDAO',
      lazyFactory: function() {
        return this.authorizeDynamicImageFactory(this.dynamicImageDAO_);
      }
    },
    {
      name: 'highResImageDAO',
      lazyFactory: function() {
        return this.dynamicImageDAO_;
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
        });
        // TODO: how much to sync?
      },
    },
    {
      name: 'contactProfileDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.ContactProfile,
          name: 'contactProfiles',
          daoType: this.MDAO,
          guid: true,
          sockets: true,
          isServer: true,
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
          autoIndex: true,
        });
      },
    },

    // Used if auto-generating markets from locations.
    // Provides locationDAO_ for generators.MarketGenerator.
    {
      name: 'locationDAO',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.Location,
          name: 'locations',
          daoType: this.MDAO,
          guid: true,
        });
      },
    },
  ],

  methods: [
    function execute() {
      this.console.log('Executing instance of', this.model_.id);

      var dataLoader = this.DataLoader.create();
      dataLoader.loadServerData();

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
      this.exportDAO(this.contactProfileDAO);
      this.exportDAO(this.marketDAO);
      this.exportDAO(this.highResImageDAO, 'com.google.ymp.highResImageDAO');

      // HACK(markdittmer): Copies market.location data into market.
      // var marketData = [];
      // this.marketDAO.select({
      //   put: function(market) {
      //     market.longitude = market.location.longitude;
      //     market.latitude = market.location.latitude;
      //     marketData.push(market);
      //   },
      // })(function() {
      //   dataLoader.saveData('market', JSONUtil.stringify(marketData));
      //   console.log('Re-saved market data');
      // }.bind(this));

      this.console.log('DAO data loaded');

      // Run any custom hard-coded server logic.
      this.ServerDebug.create().execute();
    },
    function authorizeMarketSubFactory(delegate, opt_marketProps) {
      this.console.assert(
          opt_marketProps || delegate.model.MARKET,
          'Market subscription authorization factory requires one or more "market" properties');
      var marketProps = opt_marketProps || [delegate.model.MARKET];
      return this.DebugAuthDAO.create({
        delegate: this.AuthorizedDAO.create({
          model: delegate.model,
          delegate: delegate,
          authorizer: this.MarketSubAuthorizer.create({ marketProps: marketProps }),
        }, this.Y),
      }, this.Y);
    },
    function authorizeUserFactory(delegate, opt_ownerProp) {
      this.console.assert(
          opt_ownerProp || delegate.model.PERSON,
          'User authorization factory requires "person" (user) property');
      return this.DebugAuthDAO.create({
        delegate: this.AuthorizedDAO.create({
          model: delegate.model,
          delegate: delegate,
          authorizer: this.PrivateOwnerAuthorizer.create({
            ownerProp: opt_ownerProp || delegate.model.PERSON,
          }),
        }),
      });
    },
    function authorizeDynamicImageFactory(delegate) {
      // filter by user's subscribed markets
      //delegate = this.authorizeMarketSubFactory(delegate);

      // and by user's default image quality
      return this.DebugAuthDAO.create({
        delegate: this.AuthorizedDAO.create({
          model: delegate.model,
          delegate: delegate,
          authorizer: this.DynamicImageAuthorizer.create()
        }, this.Y),
      }, this.Y);
    },
  ],
});
