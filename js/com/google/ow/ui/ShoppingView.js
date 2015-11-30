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
    'com.google.ow.model.Envelope',
    'com.google.ow.model.CustomerOrder',
    'com.google.ow.ui.CustomerOrderSummaryView',
    'com.google.ow.ui.ShoppingItemView',
    'com.google.plus.ShareList',
    'foam.u2.DAOListView',
    'foam.u2.DetailView',
    'foam.u2.md.ActionButton',
    'foam.u2.md.Select',
  ],
  imports: [
    'stack',
    'streamDAO',
  ],
  exports: [
    'data',
    'products',
    'purchaseOrder'
  ],

  properties: [
    [ 'nodeName', 'SHOPPING' ],
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'products',
      toPropertyE: function(X) {
        return X.lookup('foam.u2.DAOListView').create({
          data: X.products
        }, X.sub({
          selection$: undefined,
        }));
      },
    },
    {
      type: 'com.google.ow.model.CustomerOrder',
      name: 'purchaseOrder',
      factory: function() {
        return this.CustomerOrder.create({
          customer: this.X.envelope.owner,
          merchant: this.X.envelope.source,
        }, this.Y);
      },
      toPropertyE: function(X) {
        return X.lookup('com.google.ow.ui.CustomerOrderSummaryView').create({
          data: X.purchaseOrder,
        }, X);
      }
    }
  ],

  methods: [
    function init() {
      // For *EnumProperty.toPropertyE(), Action.toE().
      this.Y.registerModel(this.Select, 'foam.u2.Select');

      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');
      this.SUPER();
    },
    function initE() {
      return this.x({ data: this }).add(this.PRODUCTS)
          .start('div').cls('order-container').cls(function() {
            return this.purchaseOrder.isEmpty ? '' : 'visible';
          }.bind(this))
            .add(this.PURCHASE_ORDER)
            .start('div').cls('actions').add(this.CHECKOUT).end()
          .end();
    }
  ],

  actions: [
    {
      name: 'checkout',
      ligature: 'attach_money',
      isAvailable: function() {
        return ! this.purchaseOrder.isEmpty;
      },
      code: function(X) {
        // Customer's order stream.
        var stream = X.purchaseOrder.toStream(X);
        X.streamDAO.put(stream.toEnvelope(X));
        // Order for customer's stream.
        X.streamDAO.put(X.purchaseOrder.toEnvelope(X.sub({
          sid: stream.substreams[0],
        })));
        // Order for server connection.
        X.streamDAO.put(X.purchaseOrder.toEnvelope(X.sub({
          sid: X.data.adStream,
        })));
        X.stack.popView();
      }
    }
  ],

  templates: [
    function CSS() {/*
      shopping {
        display: block;
        position: relative;
      }
      shopping .order-container {
        display: none;
      }
      shopping .order-container.visible {
        display: block;
      }
      shopping .actions {
        display: flex;
        justify-content: flex-end;
      }
    */}
  ]
});
