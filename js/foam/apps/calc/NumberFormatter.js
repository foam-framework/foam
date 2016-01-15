/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.calc',
  name: 'NumberFormatter',
  messages: [
    {
      name: 'nan',
      value: 'Not a number',
      translationHint: 'description of a value that isn\'t a number'
    }
  ],
  properties: [
    {
      type: 'Boolean',
      name: 'useComma'
    }
  ],
  methods: [
    {
      name: 'init',
      code: function() {
        if  ( window.chrome && chrome.i18n ) {
          chrome.i18n.getAcceptLanguages(function(m){ this.useComma = (0.5).toLocaleString(m[0]).substring(1,2) == ','; }.bind(this))
        } else {
          var lang = window.navigator.languages ? window.navigator.languages[0] : window.navigator.language;
          this.useComma = (0.5).toLocaleString(lang).substring(1,2) == ',';
        }
      }
    },
    {
      name: 'formatNumber',
      todo: multiline(function() {/* Add "infinity" to NumberFormatter
        messages; this requires messages speechLabel support */}),
      code: function(n) {
        // the regex below removes extra zeros from the end,
        // or middle of exponentials
        return typeof n === 'string' ? n :
            Number.isNaN(n)       ? this.nan :
            ! Number.isFinite(n)  ? '∞' :
            parseFloat(n).toPrecision(12)
            .replace( /(?:(\d+\.\d*[1-9])|(\d+)(?:\.))(?:(?:0+)$|(?:0*)(e.*)$|$)/ ,"$1$2$3");
      }
    },
    {
      name: 'i18nNumber',
      code: function(n) {
        return this.useComma ? n.replace(/\./g, ',') : n;
      }
    }
  ]

});
