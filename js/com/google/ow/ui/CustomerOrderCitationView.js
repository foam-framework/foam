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
  package: 'com.google.ow.ui',
  name: 'CustomerOrderCitationView',
  extends: 'com.google.ow.ui.OrderCitationView',

  requires: [
    'foam.u2.Element'
  ],

  imports: [ 'dynamic' ],

  properties: [
    'merchant',
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.getPerson(nu.merchant, this.merchant$);
      }
    }
  ],

  methods: [
    function initE() {
      return this.SUPER()
          .add(this.dynamic(function(merchant) {
            if ( ! merchant ) return '';
            return this.Element.create({ nodeName: 'div' }).cls('md-grey')
                .add('Merchant: ')
                .add(merchant.displayName);
          }.bind(this), this.merchant$));
    }
  ]
});
