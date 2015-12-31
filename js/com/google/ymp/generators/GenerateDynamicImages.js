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
  name: 'GenerateDynamicImages',

  documentation: function() {/*
    Execution class for generating dynamic images. Invokes
    com.google.ymp.generators.DynamicImageGenerator.
  */},

  requires: [
    'com.google.ymp.generators.DynamicImageGenerator',
    'com.google.ymp.generators.ProductNameGenerator',
  ],
  imports: ['console'],

  properties: [
    {
      type: 'String',
      name: 'query',
      defaultValue: 'produce',
    },
  ],

  actions: [
    {
      name: 'getImages',
      code: function() {
        this.execute();
      },
    },
  ],

  methods: [
    function execute() {
      var diGenerator = this.DynamicImageGenerator.create();
      var f = function(q, ret) {
        return diGenerator.generate(ret, q);
      };

      var pnGenerator = this.ProductNameGenerator.create();
      var qs = [];
      var q = 'start';
      var pnSeq = aseq(
          pnGenerator.generate.bind(pnGenerator),
          function(ret, productName) {
            console.log(productName);
            q = productName;
            if ( q ) qs.push(q);
            ret(q);
          });
      awhile(function() {
        return q;
      }, pnSeq)(function() {
        apar.apply(null, qs.map(function(q) { return f.bind(null, q); }))(this.report.bind(this));
      }.bind(this));
    },
    function report() {
      var args = argsToArray(arguments).reduce(function(acc, a) { return acc.concat(a); }, []);
      this.console.log(JSONUtil.stringify(args));
    },
  ],
});
