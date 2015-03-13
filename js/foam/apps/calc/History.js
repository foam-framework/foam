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
  name: 'History',
  package: 'foam.apps.calc',

  requires: [
    'foam.apps.calc.NumberFormatter'
  ],

  properties: [
    'numberFormatter',
    'op',
    {
      name: 'a2',
      preSet: function(_, n) { return this.formatNumber(n); }
    }
  ],
  methods: {
    formatNumber: function(n) {
      var nu = this.numberFormatter.formatNumber(n) || '0';
      // strip off trailing "."
      nu = nu.replace(/(.+?)(?:\.$|$)/, "$1");
      return this.numberFormatter.i18nNumber(nu);
    }
  }
});
