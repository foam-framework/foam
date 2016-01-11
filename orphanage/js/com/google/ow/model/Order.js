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
    'com.google.ow.content.UpdateStream',
    'com.google.ow.model.Envelope',
    'com.google.ow.model.OrderItem',
    'com.google.ow.model.Product',
    'foam.dao.EasyDAO',
  ],

  properties: [
    {
      name: 'id',
      lazyFactory: function() { return createGUID(); },
    },
    {
      type: 'Reference',
      type: 'com.google.plus.Person',
      name: 'customer',
    },
    {
      type: 'Reference',
      type: 'com.google.plus.Person',
      name: 'merchant',
    },
    {
      type: 'Array',
      subType: 'com.google.ow.model.OrderItem',
      name: 'items',
      lazyFactory: function() { return []; },
    },
    {
      type: 'Float',
      name: 'total',
      defaultValue: 0.0,
      toPropertyE: function(X) {
        // TODO(markdittmer): This should be a "currency E" of some kind.
        return X.lookup('foam.u2.Element').create(null, X)
            .add('$')
            .add(X.dynamic(function(num) {
              return num.toFixed(2);
            }.bind(this), X.data[this.name + '$']));
      },
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'methodOfPayment',
      choices: [
        [ 'COD', 'Cash on delivery' ],
      ],
    },
    // TODO(markdittmer): Status choice modeling needs clean-up.
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'status',
      defaultValue: 'PENDING',
      choices: [
        [ 'PENDING', 'Pending' ],
        [ 'SUBMITTED', 'Submitted' ],
        [ 'CANCELED', 'Canceled' ],
        [ 'ACCEPTED', 'Accepted' ],
        [ 'READY', 'Ready for pick-up' ],
        [ 'DELIVERED', 'Delivered' ],
      ],
    },
    {
      type: 'Boolean',
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
      return this.UpdateStream.create({
        substreams: [ '/' + this.id ],
      });
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
