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
  name: 'OrderItemView',
  extends: 'foam.u2.View',

  exports: [ 'data' ],

  properties: [ [ 'nodeName', 'ORDER-ITEM' ] ],

  methods: [
    function initE() {
      var data = this.data;
      var product = this.data.product;
      return this
          .start('div').cls('summary').cls('md-body').add(this.data.SUMMARY).end()
          .start('div').cls('quantity').cls('md-body')
              .add(this.data.QUANTITY)
              .add(' @ ')
              .x({ data: product })
                .add(product.PRICE)
              .x({ data: data })
          .end()
          .start('div').cls('total').cls('md-body')
              .add(this.data.TOTAL)
          .end();
    }
  ],

  templates: [
    function CSS() {/*
      order-item { display: flex; }
      order-item .summary, order-item .quantity,
      order-item .total {
        padding: 8px;
        margin: 2px;
        border: 1px solid #EEEEEE;
      }
      order-item .summary {
        flex-grow: 1;
      }
      order-item .summary, order-item .summary *,
      order-item .quantity, order-item .quantity *,
      order-item .total, order-item .total * {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      order-item .quantity, order-item .total {
        min-width: 30%;
        max-width: 30%;
        flex-grow: 0;
        display: flex;
      }
    */}
  ]
});
