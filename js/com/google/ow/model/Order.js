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
    'foam.dao.EasyDAO',
    'com.google.ow.model.OrderItem',
    'com.google.ow.model.Product',
    'com.google.ow.ui.OrderView',
  ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'items',
      lazyFactory: function() {
        return this.EasyDAO.create({
          model: this.OrderItem,
          daoType: 'MDAO',
          seqNo: true,
        }, this.Y);
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.unlisten(this.onItemsUpdate);
        if ( nu ) nu.listen(this.onItemsUpdate);
      },
    },
    {
      model_: 'FloatProperty',
      name: 'total',
      defaultValue: 0.0,
      toPropertyE: function(X) {
        // TODO(markdittmer): We should have a non-input-element standard for
        // this.
        return X.E('div').add(X.data[this.name + '$']);
      },
    },
  ],

  methods: [
    function add(item) {
      console.log('Order.add', item);
      var itemFound = false;
      this.items.where(EQ(
          this.OrderItem.PRODUCT.dot(this.Product.HASH),
          item.product.hash)).limit(1)
          .select({
            put: function(o) {
              console.log('Increment quantity', item);
              itemFound = true;
              o.quantity += item.quantity;
              this.items.put(o);
            }.bind(this),
            eof: function() {
              if ( ! itemFound ) {
                console.log('New item', item);
                this.items.put(item);
              }
            }.bind(this)
          })(nop);
    },
    function toE(X) {
      return this.OrderView.create({ data: this }, X);
    },
  ],

  listeners: [
    {
      name: 'onItemsUpdate',
      isFramed: true,
      code: function() {
        this.items.select(SUM(this.OrderItem.TOTAL))
        (function(result) {
          this.total = result.value;
        }.bind(this));
      },
    },
  ],
});
