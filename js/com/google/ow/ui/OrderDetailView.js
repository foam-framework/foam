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
  name: 'OrderDetailView',
  extends: 'com.google.ow.ui.OrderView',

  requires: [
    'com.google.ow.model.Envelope',
    'foam.u2.DAOListView',
    'foam.u2.md.Select',
    'foam.u2.md.ActionButton',
  ],
  imports: [
    'streamDAO',
    'envelope',
  ],
  exports: [ 'data' ],

  properties: [
    [ 'nodeName', 'ORDER-DETAIL' ]
  ],

  methods: [
    function initE() {
      return this.actionE(this.mainE(this.titleE(this)));
    },
    function titleE(prev) {
      return prev.start('div').cls('heading').cls('md-headline')
            .add('Order')
          .end();
    },
    function mainE(prev) {
      return prev
          .add(this.DAOListView.create({ data: this.data.items_ }, this.Y.sub({
            selection$: undefined,
          })))
          .start('div').cls('total').cls('md-body')
            .start('div').add('TOTAL:').end()
            .add(this.data.TOTAL)
          .end();
    },
    function actionE(prev) {
      return this.actionsE(prev.start('div').cls('actions')).end();
    },
    function actionsE(prev) {
      return prev.add(this.CANCEL);
    },
    function init() {
      // For *EnumProperty.toPropertyE(), Action.toE().
      this.Y.registerModel(this.Select, 'foam.u2.Select');
      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');

      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'cancel',
      ligature: 'cancel',
      code: function(X) {
        this.status = 'CANCELED';
        X.streamDAO.put(this.toEnvelope(X.sub({ sid: X.envelope.sid })));
      },
      isAvailable: function() {
        return this.status !== 'CANCELED' && this.status !== 'DELIVERED';
      }
    }
  ],

  templates: [
    function CSS() {/*
      order-detail {
        display: flex;
        flex-direction: column;
      }
      order-detail .heading, order-detail .total {
        padding: 10px 5px;
      }
      order-detail .total {
        display: flex;
        justify-content: space-between;
      }
      order-detail .actions {
        display: flex;
        justify-content: flex-end;
      }
    */}
  ]
});
