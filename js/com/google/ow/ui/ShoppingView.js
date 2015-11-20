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
    'com.google.ow.model.Order',
    'com.google.ow.ui.OrderSummaryView',
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
      type: 'com.google.ow.model.Order',
      name: 'purchaseOrder',
      factory: function() {
        return this.Order.create({
          customer: this.X.envelope.owner,
          merchant: this.X.envelope.source,
        }, this.Y);
      },
      toPropertyE: function(X) {
        return X.lookup('com.google.ow.ui.OrderSummaryView').create({
          data: X.purchaseOrder,
        }, X);
      },
    },
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
          .start('div').cls('order-container').cls2(function() {
            return this.purchaseOrder.isEmpty ? '' : 'visible';
          }.bind(this))
            .add(this.PURCHASE_ORDER)
            .start('div').cls('actions').add(this.CHECKOUT).end()
          .end();
    },
  ],

  actions: [
    {
      name: 'checkout',
      ligature: 'attach_money',
      isAvailable: function() {
        return ! this.purchaseOrder.isEmpty;
      },
      code: function(X) {
        var envelope = X.envelope;
        var envSid = envelope.sid;
        // X.data.id = ad id.
        var adSid = envSid + ((X.data && X.data.id) ? '/' + X.data.id : '');
        var orderSid = envSid + ((X.purchaseOrder && X.purchaseOrder.id) ?
            '/' + X.purchaseOrder.id : '');
        // Customer's order stream.
        X.streamDAO.put(X.purchaseOrder.toStream(X).toEnvelope(X.sub({
          substreams: [orderSid],
        })));
        // Order processed by order streams.
        X.streamDAO.put(X.purchaseOrder.toEnvelope(X.sub({
          sid: orderSid,
        })));
        // Notification of order for ad stream.
        X.streamDAO.put(X.lookup('com.google.ow.model.Envelope').create({
          source: envelope.owner,
          owner: envelope.owner,
          sid: adSid,
          data: orderSid,
        }));
        X.stack.popView();
      },
    },
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
    */},
  ],
});
