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
  name: 'PostContentGenerator',
  extends: 'com.google.ymp.generators.Generator',

  documentation: function() {/*
    Generator for post content. Loads from and puts to a JSON file. When a query
    not previously seen is issued, then (and only then) a Google Custom Search
    API is used to generate content. JSON file actually caches the first list of
    results and a random result is chosen for each request.

    NOTE: At the moment, it is assumed that all relevant queries are cached and
    an error is thrown before we hit the network. If new queries need to be
    supported, first comment-out the error-throwing line of code.
  */},

  requires: [
    'MDAO',
    'com.google.ymp.test.DataLoader',
    'com.google.ymp.test.PostContent',
    'foam.dao.EasyDAO',
    'foam.net.NodeHTTPRequest',
  ],

  properties: [
    {
      type: 'String',
      name: 'baseName',
      defaultValue: 'postContent',
    },
    {
      subType: 'com.google.ymp.test.DataLoader',
      name: 'dataLoader',
      documentation: 'Data loader used to load from/save to JSON file',
      lazyFactory: function() { return this.DataLoader.create(); },
    },
    {
      type: 'foam.core.types.DAO',
      name: 'dao',
      documentation: 'In-memory DAO where query result sets are cached',
      lazyFactory: function() {
        return this.EasyDAO.create({
          daoType: this.MDAO,
          model: this.PostContent,
        });
      },
    },
    {
      type: 'foam.core.types.DAO',
      name: 'daoFuture',
      documentation: 'Future resolved after data is loaded from JSON file.',
      lazyFactory: function() {
        return afuture();
      },
    },
    {
      type: 'String',
      name: 'apiKey',
      documentation: 'API Key for Google Custom Search engine.',
      defaultValue: 'AIzaSyBWapcWoWSOAEgzf0vHL4dRTMnma98jveA',
    },
    {
      type: 'String',
      name: 'searchId',
      documentation: 'Search Engine ID for Google Custom Search engine.',
      defaultValue: '017970475687133860770:mvnyvzrqbic',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.dataLoader.loadData(
          this.baseName, this.dao, this.PostContent,
          function() { this.daoFuture.set(this.dao); }.bind(this));
    },

    function generate(ret, query) {
      this.daoFuture.get(function(dao) {
        this.dao.find(query, {
          put: this.deliverResult.bind(this, ret),
          error: this.commitQuery.bind(this, ret, query),
        });
      }.bind(this));
    },

    function commitQuery(ret, query) {
      // Remove this line if you intend to generate new data from the Google
      // Custom Search API (limit 100 queries / day).
      throw new Error('PostContentGenerator: Expected all queries to hit cache');

      var url = 'https://www.googleapis.com/customsearch/v1?q=' +
          encodeURIComponent(query) + '&cx=' + this.searchId +
          '&key=' + this.apiKey;
      this.NodeHTTPRequest.create()
          .fromUrl(url)
          .asend()(function(response) {
            if ( response.status < 200 || response.status >= 300 ) {
              ret(null);
              return;
            }
            var data = JSON.parse(response.payload);
            if ( ! (data && data.items) ) {
              ret(null);
              return;
            }
            var contents = this.PostContent.create({
              query: query,
              result: data,
            });
            this.dao.put(contents);
            this.onPut();
            ret(contents);
          }.bind(this));
    },

    function deliverResult(ret, contents) {
      var results = contents.result;
      ret(results && results.items ? this.randArrElem(results.items).snippet :
          null);
    },
  ],

  listeners: [
    {
      name: 'onPut',
      isMerged: 1000,
      code: function() {
        var data = [];
        this.dao.select(data)(function() {
          this.dataLoader.saveData(this.baseName, JSONUtil.stringify(data));
        }.bind(this));
      },
    },
  ],
});
