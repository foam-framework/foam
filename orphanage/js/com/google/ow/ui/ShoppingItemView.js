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
  name: 'ShoppingItemView',
  extends: 'foam.u2.View',

  requires: [
    'com.google.ow.model.OrderItem',
    'foam.u2.DetailView',
    'foam.u2.md.QuickActionButton as ActionButton',
    'foam.u2.md.TextField',
  ],
  imports: [ 'purchaseOrder' ],
  // Renders property views of "this": Make their data be "this".
  exports : [ 'as data' ],

  properties: [
    [ 'nodeName', 'SHOPPING-ITEM' ],
    {
      type: 'Int',
      name: 'quantity',
      defaultValue: 1,
    },
  ],

  actions: [
    {
      name: 'addToOrder',
      label: 'Add to cart',
      ligature: 'add_shopping_cart',
      isEnabled: function() { return this.quantity > 0; },
      code: function(X) {
        if ( ! this.purchaseOrder ) return;
        // TODO(markdittmer): It would be nice to be able to recover the import
        // from the view here.
        this.purchaseOrder.add(this.data.toOrderItem(this.quantity));
      },
    },
  ],

  methods: [
    function init() {
      // For Action.toE(), Property.toPropertyE().
      this.Y.registerModel(this.TextField, 'foam.u2.TextField');
      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');
      this.SUPER();
    },
   function initE() {
     return this.add(
       this.data && this.data.toDetailE ?
         this.data.toDetailE(this.Y) :
         this.DetailView.create({ data$: this.data$ }, this.Y))
       .start('div').cls('add-to-cart')
         .start('div').style({ 'flex-grow': '1' }).add(this.QUANTITY).end()
         .add(this.ADD_TO_ORDER)
       .end();
    }
  ]

  templates: [
    function CSS() {/*
      shopping-item {
        display: block;
      }
      shopping-item .add-to-cart {
        clear: both;
        display: flex;
        align-items: baseline;
      }
    */}
  ]
});
