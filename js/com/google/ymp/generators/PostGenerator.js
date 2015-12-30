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
  package: 'com.google.ymp.generators',
  name: 'PostGenerator',
  extends: 'com.google.ymp.generators.Generator',

  documentation: function() {/*
    Generates posts, delegating to
    com.google.ymp.generators.PostContentGenerator for content.

    Assumptions:
    - Market, person, dynamicImage, and contactProfile DAOs already populated
    - Dynamic images has IDs with [product name]_[number:0-10] consistent with
      com.google.ymp.generators.ProductNameGenerator names.
  */},

  requires: [
    'com.google.ymp.bb.Post',
    'com.google.ymp.generators.PostContentGenerator',
    'foam.net.NodeHTTPRequest',
  ],
  imports: [
    'marketDAO_',
    'personDAO_',
    'dynamicImageDAO_',
    'contactProfileDAO_',
  ],

  properties: [
    {
      type: 'StringArray',
      name: 'services',
      lazyFactory: function() {
        return [
          'grocery delivery',
          'housekeeping',
          'childcare',
          'computer repair',
          'cell phone repair',
          'electrician',
          'plumber',
        ];
      },
    },
    {
      type: 'StringArray',
      name: 'qualifiers',
      lazyFactory: function() {
        return [
          'fresh',
          'new',
          'refurbished',
          'pre-owned',
          'miniature',
          'huge',
          '30"',
        ];
      },
    },
    {
      type: 'StringArray',
      name: 'postText',
      lazyFactory: function() {
        return [
          'call to order',
          'today only',
          'on sale this week',
          'cash-on-delivery',
        ];
      },
    },
    {
      subType: 'com.google.ymp.generators.PostContentGenerator',
      name: 'contentGenerator',
      lazyFactory: function() { return this.PostContentGenerator.create(); },
    },
  ],

  methods: [
    function generate(ret, productName) {
      var post = this.Post.create();

      post.id = createGUID();

      var self = this;
      apar(
          function(ret) { self.getTitle(ret, post, productName); },
          function(ret) { self.getContent(ret, post, productName + ' for sale'); },
          function(ret) { self.getMarket(ret, post); },
          function(ret) { self.getAuthor(ret, post); },
          function(ret) { self.getContact(ret, post); })
      (function() { ret(post); });
    },

    function getTitle(ret, post, productName) {
      post.title = this.randArrElem(this.qualifiers) + ' ' +
          productName + ' ' + this.randArrElem(this.postText);
      ret(post);
    },

    function getContent(ret, post, query) {
      this.contentGenerator.generate(function(content) {
        post.content = content;
        ret(post);
      }, query);
    },

    function getMarket(ret, post) {
      var dao = this.marketDAO_;
      dao.select(COUNT())(function(c) {
        var count = c.count;
        if ( count === 0 ) {
          ret(post);
          return;
        }
        var choice = Math.floor(Math.random() * count);
        dao.skip(choice).limit(1).select({
          put: function(market) {
            post.market = market.id;
            ret(post);
          },
        });
      });
    },

    function getAuthor(ret, post) {
      var dao = this.personDAO_;
      dao.select(COUNT())(function(c) {
        var count = c.count;
        if ( count === 0 ) {
          ret(post);
          return;
        }
        var choice = Math.floor(Math.random() * count);
        dao.skip(choice).limit(1).select({
          put: function(person) {
            post.author = person.id;
            ret(post);
          },
        });
      });
    },

    function getImage(ret, post, productName) {
      this.getImage_(ret, post, productName, 10, 10);
    },
    function getImage_(ret, post, productName, ttl, imgCount) {
      if ( ttl <= 0 ) {
        ret(post);
        return;
      }

      var dao = this.dynamicImageDAO_;
      var choice = Math.floor(Math.random() * imgCount);
      var id = productName + '_' + choice;

      var found = false;
      dao.where(EQ(this.DynamicImage.IMAGE_ID, id)).limit(1).select({
        put: function(img) {
          found = true;
          post.image = id;
          ret(post);
        },
        eof: function() {
          if ( found ) return;
          this.getImage(ret, post, productName, ttl - 1, imgCount);
        }.bind(this),
      });
    },

    function getContact(ret, post) {
      var dao = this.contactProfileDAO_;
      dao.select(COUNT())(function(c) {
        var count = c.count;
        if ( count === 0 ) {
          ret(post);
          return;
        }
        var choice = Math.floor(Math.random() * count);
        dao.skip(choice).limit(1).select({
          put: function(contact) {
            post.contact = contact.id;
            ret(post);
          },
        });
      });
    },
  ],
});
