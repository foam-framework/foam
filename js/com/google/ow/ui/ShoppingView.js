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
  name: 'ShoppingView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ow.model.Order',
    'com.google.ow.ui.ShoppingItemView',
    'foam.ui.DAOListView',
  ],

  exports: [ 'purchaseOrder' ],

  properties: [
    [ 'nodeName', 'SHOPPING' ],
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'products',
    },
    {
      type: 'com.google.ow.model.Order',
      name: 'purchaseOrder',
      factory: function() {
        console.log('Instantiate order');
        return this.Order.create(null, this.Y);
      },
    },
  ],

  methods: [
    function initE() {
      var E = this.Y.E;
      return this.add(this.DAOListView.create({
        dao: this.products,
        rowView: 'com.google.ow.ui.ShoppingItemView',
      }, this.Y));
      // TODO(markdittmer): Add view of order + pay/checkout action.
    },
  ],

  templates: [
    function CSS() {/* shopping { display: block; } */},
  ],
});
