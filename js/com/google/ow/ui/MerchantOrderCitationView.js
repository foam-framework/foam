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

  properties: [
    'merchant',
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu && nu.merchant !== this.X.envelope.owner )
          this.getPerson(nu.merchant, this.merchant$);
      },
    },
  ],

  methods: [
    function initE() {
      return this.SUPER()
          .add(function(merchant) {
            if ( ! merchant ) return '';
            return this.start('div').cls('md-grey')
                .add('Merchant: ')
                .add(merchant.displayName)
              .end();
          }.bind(this).on$(this.X, this.merchant$));
    },
  ],
});
