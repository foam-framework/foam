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
  name: 'MerchantOrderCitationView',
  extends: 'com.google.ow.ui.OrderCitationView',

  requires: [
    'foam.u2.Element',
  ],

  imports: [ 'dynamic' ],

  properties: [
    'customer',
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.getPerson(nu.customer, this.customer$);
      }
    }
  ],

  methods: [
    function initE() {
      return this.SUPER()
          .add(this.dynamic(function(customer) {
            if ( ! customer ) return '';
            return this.Element.create({ nodeName: 'div' }).cls('md-grey')
                .add('Customer: ')
                .add(customer.displayName);
          }.bind(this), this.customer$));
    }
  ]
});
