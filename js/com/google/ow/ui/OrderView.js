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
  name: 'OrderView',
  extends: 'foam.u2.View',

  requires: [ 'foam.u2.DAOListView' ],
  exports: [ 'data' ],

  properties: [
    [ 'nodeName', 'ORDER' ]
  ],

  methods: [
    function initE() {
      return this.start('div').cls('heading').cls('md-headline')
            .add('Order')
          .end()
          .add(this.DAOListView.create({ data: this.data.items_ }, this.Y.sub({
            selection$: undefined,
          })))
          .start('div').cls('total').cls('md-body')
            .start('div').add('TOTAL:').end()
            .add(this.data.TOTAL)
          .end()
          .add(this.data.METHOD_OF_PAYMENT);
    },
  ],

  templates: [
    function CSS() {/*
      order {
        display: flex;
        flex-direction: column;
      }
      order .heading, order .total {
        padding: 10px 5px;
      }
      order .total {
        display: flex;
        justify-content: space-between;
      }
    */},
  ],
});
