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
  package: 'com.google.ow.model',
  name: 'Order',

  requires: [
    'com.google.ow.model.Envelope',
    'com.google.ow.model.OrderItem',
    'com.google.ow.model.Product',
    'com.google.ow.ui.OrderCitationView',
    'com.google.ow.ui.OrderView',
    'foam.dao.EasyDAO',
  ],

  properties: [
    {
      name: 'id',
      lazyFactory: function() { return createGUID(); },
    },
    {
      model_: 'ArrayProperty',
      subType: 'com.google.ow.model.OrderItem',
      name: 'items',
      lazyFactory: function() { return []; },
    },
    {
      model_: 'FloatProperty',
      name: 'total',
      defaultValue: 0.0,
      toPropertyE: function(X) {
        // TODO(markdittmer): This should be a "currency E" of some kind.
        return X.lookup('foam.u2.Element').create(null, X)
            .add('$')
            .add(function(num) {
              return num.toFixed(2);
            }.bind(this).on$(X, X.data[this.name + '$']));
      },
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'methodOfPayment',
      choices: [
        [ 'COD', 'Cash on delivery' ],
      ],
    },
    {
      model_: 'BooleanProperty',
      name: 'isEmpty',
      defaultValue: true,
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'items_',
      transient: true,
      lazyFactory: function() {
        var dao = this.EasyDAO.create({
          model: this.OrderItem,
          daoType: 'MDAO',
          seqNo: true,
        }, this.Y);
        this.items.select(dao);
        return dao;
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.unlisten(this.onItemsUpdate);
        if ( nu ) {
          // First, put existing items to MDAO, then listen for puts on MDAO and push updates to ArrayDAO.
          this.items.select(nu)(function() {
            nu.listen(this.onItemsUpdate);
          }.bind(this));
        }
      },
    },
  ],

  methods: [
    function add(item) {
      var itemFound = false;
      this.items_.where(EQ(
          this.OrderItem.PRODUCT.dot(this.Product.HASH),
          item.product.hash)).limit(1)
          .select({
            put: function(o) {
              itemFound = true;
              o.quantity += item.quantity;
              this.items_.put(o);
            }.bind(this),
            eof: function() {
              if ( ! itemFound ) {
                this.items_.put(item);
              }
            }.bind(this)
          })(nop);
    },
    function toE(X) {
      return this.OrderView.create({ data: this }, X);
    },
    function toDetailE(X) {
      return this.OrderView.create({ data: this }, X);
    },
    function toCitationE(X) {
      return this.OrderCitationView.create({ data: this }, X);
    },
    function toEnvelope(X) {
      var envelope = X.envelope;
      var Envelope = X.lookup('com.google.ow.model.Envelope');
      return Envelope.create({
        sid: X.sid || '',
        owner: envelope.owner,
        source: envelope.owner,
        data: this,
      }, X);
    },
    function toStream(X) {
      var envelope = X.envelope;
      var Envelope = X.lookup('com.google.ow.model.Envelope');
      var UpdateStream = X.lookup('com.google.ow.content.UpdateStream');
      return UpdateStream.create(null, X);
    },
  ],

  listeners: [
    {
      name: 'onItemsUpdate',
      isFramed: true,
      code: function() {
        // Update this.items.
        var items = [];
        this.items_.select(items)(function() {
          this.items = items;
        }.bind(this));
        // Update this.isEmpty.
        this.items_.select(COUNT())(function(c) {
          this.isEmpty = c.count === 0;
        }.bind(this));
        // Update this.total.
        this.items_.select(SUM(this.OrderItem.TOTAL))
        (function(result) {
          this.total = result.value;
        }.bind(this));
      },
    },
  ],
});
