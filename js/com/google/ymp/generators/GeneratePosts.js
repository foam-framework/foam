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
  name: 'GeneratePosts',

  documentation: function() {/*
    Execution class for generating posts. Invokes
    com.google.ymp.generators.PostGenerator.
  */},

  requires: [
    'com.google.ymp.generators.PostGenerator',
    'com.google.ymp.generators.ProductNameGenerator',
    'com.google.ymp.test.DataLoader',
  ],
  imports: ['console'],

  properties: [
    {
      type: 'String',
      name: 'imgDataBaseName',
      defaultValue: 'postDynamicImage',
    },
    {
      subType: 'com.google.ymp.test.DataLoader',
      name: 'dataLoader',
      documentation: 'Data loader used to load from/save to JSON file',
      lazyFactory: function() { return this.DataLoader.create(); },
    },
  ],

  methods: [
    function execute() {
      var pGenerator = this.PostGenerator.create();
      var pnGenerator = this.ProductNameGenerator.create();
      var f = function(productName, ret) {
        return pGenerator.generate(ret, productName);
      };

      var productNames = [];
      var pnFn = function(productName) {
        if ( ! productName ) return;
        productNames.push(productName);
        pnGenerator.generate(pnFn);
      };
      pnGenerator.generate(pnFn);

      var numPosts = 3;
      var posts = new Array(numPosts);
      var par = new Array(numPosts);

      for ( var i = 0; i < numPosts; ++i ) {
        par[i] = function(i, ret) {
          pGenerator.generate(function(post) {
            posts[i] = post;
            ret(posts);
          }, pnGenerator.randArrElem(productNames));
        }.bind(this, i);
      }

      apar.apply(null, par)(function() {
        this.console.log(JSONUtil.stringify(posts));
      }.bind(this));
    },
  ],
});
