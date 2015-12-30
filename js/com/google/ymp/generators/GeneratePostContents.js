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
  name: 'GeneratePostContents',

  documentation: function() {/*
    Execution class for generating post content. Invokes
    com.google.ymp.generators.PostContentGenerator.
  */},

  requires: [
    'com.google.ymp.generators.PostContentGenerator',
    'com.google.ymp.generators.ProductNameGenerator',
  ],

  methods: [
    function execute() {
      var pnGenerator = this.ProductNameGenerator.create();
      var go = true;
      var productNames = [];
      awhile(
          function() { return go; },
          function(ret) {
            pnGenerator.generate(function(productName) {
              if ( ! productName ) {
                go = false;
                ret(productNames);
                return;
              }
              productNames.push(productName);
              ret(productNames);
            });
          })(this.execute_.bind(this));
    },
    function execute_(productNames) {
      var generator = this.PostContentGenerator.create();
      var par = productNames.map(function(productName) {
        return function(ret) {
          generator.generate(ret, productName + ' for sale');
        };
      }.bind(this));
      apar.apply(null, par)(function() {
        console.log('Arguments after apar', arguments);
      });
    },
  ],
});
