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
  package: 'foam.grammars',
  name: 'CSSRewriteURLTest',

  requires: [
    'XHR',
    'foam.grammars.CSSRewriteURL',
  ],
  imports: [ 'assert' ],

  properties: [
    {
      type: 'foam.grammars.CSSRewriteURL',
      name: 'css',
      defaultValue: ''
    }
  ],

  methods: [
    function testSetUp() {
      this.css = this.CSSRewriteURL.create();
    },
    function testTearDown() {
      this.css = '';
    },
    function parseString(str, opt_production) {
      var production = opt_production || 'START';
      var p = this.css.parser;
      var ps = p.stringPS;
      ps.str = str;
      var res = p.parse(p[production], ps);

      return res;
    },
    function testProduction(production, posEg, opt_negEg) {
      var negEg = opt_negEg || [], results = [];
      var res, i;
      for ( i = 0; i < posEg.length; ++i ) {
        res = this.parseString(posEg[i], production);
        this.assert(res && typeof res.value === 'string' &&
            res.toString() === '',
                    'Expected parse from "' + posEg[i] + '" on production "' +
                        production + '"');
        console.log(res.value);
        results.push(res);
      }
      for ( i = 0; i < negEg.length; ++i ) {
        try {
          res = this.parseString(negEg[i], production);
          this.assert(!(res && res.value) || res.toString() !== '',
                      'Expected parse failure from "' + negEg[i] +
                          '" on production "' + production + '"');
          results.push(res);
        } catch (e) {
          results.push(res);
        }
      }
      return results;
    },
  ],

  tests: [
    {
      model_: 'UnitTest',
      name: 'URL value',
      description: 'Test url value',
      code: function() {
        var url = 'http://localhost:8000/index.html?model=foam.testing.WebRunner&targets=foam.grammars.CSSRewriteURLTest';
        var posEgs = [
          '@foo { bar: url(' + url + ') }',
          '@foo { bar: url("' + url + '") }',
          "@foo { bar: url('" + url + "') }",
        ];
        var negEgs = [];

        this.testProduction('stylesheet', posEgs, negEgs);
        var urls = Object.keys(this.css.urls);
        this.assert(urls.length === 1, 'Expected 1 URL and got ' + urls.length);
        this.assert(urls[0] === url, 'Expect URL to be "' + url +
            '" and got "' + urls[0] + '"');
      }
    },
    {
      model_: 'UnitTest',
      name: 'Stylesheet',
      description: 'Test stylesheet',
      code: function() {
        var posEgs = [
                    multiline(function() {/*
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  src: local('Roboto'), local('Roboto-Regular'), url(http://fonts.gstatic.com/s/roboto/v15/sTdaA6j0Psb920Vjv-mrzH-_kf6ByYO6CLYdB4HQE-Y.woff2) format('woff2');
  unicode-range: U+0460-052F, U+20B4, U+2DE0-2DFF, U+A640-A69F;
}
          */}),
        ];
        var negEgs = [];

        this.testProduction('stylesheet', posEgs, negEgs);
      }
    },
    {
      model_: 'UnitTest',
      name: 'Stylesheet (async)',
      description: 'Test stylesheet async',
      async: true,
      code: function(ret) {
        var self = this;
        var urls = [
          'http://fonts.googleapis.com/icon?family=Material+Icons+Extended',
          'http://fonts.googleapis.com/css?family=Roboto:400,500',
        ];
        apar.apply(null, urls.map(function(url) {
          return function(ret) {
            self.css.afromUrl(function(css) {
              self.assert(!!css, 'Expanded stylesheet from URL "' +
                  url + '": "' + css + '"');
              ret(css);
            }, url);
          };
        }))(ret);
      },
    },
  ]
});
