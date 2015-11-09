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
  ],

  methods: [
    function add(item) {
      console.log('Order.add', item);
      var itemFound = false;
      this.items.where(EQ(
          this.OrderItem.PRODUCT.dot(this.Product.ID),
          item.product.id)).limit(1)
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
    },
  ],
});
