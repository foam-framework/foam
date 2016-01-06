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
  name: 'CustomerOrderDetailView',
  extends: 'com.google.ow.ui.OrderDetailView',

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
    function titleE(prev) {
      return prev.start('div').cls('heading').cls('md-headline')
            .add('Order (')
            .add(this.dynamic(function(merchant) {
              return merchant ? merchant.displayName : '';
            }.bind(this), this.merchant$))
            .add(')')
          .end();
    },
    function mainE(prev) {
      return this.SUPER(prev)
          .start('span').x({ controllerMode: 'modify' }).add(this.data.METHOD_OF_PAYMENT).end()
          .start('span').x({ controllerMode: 'view' }).add(this.data.STATUS).end();
    }
  ]
});
