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
  name: 'OrderCitationView',
  extends: 'com.google.ow.ui.OrderView',

  requires: [
    'foam.u2.md.Select',
  ],
  exports: [ 'data' ],

  properties: [
    [ 'nodeName', 'ORDER-CITATION' ],
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'items',
      factory: function() {
        return this.data ? this.data.items : [].dao;
      },
      onDAOUpdate: function() {
        var sink = [].sink;
        this.items.select(sink)(function() {
          this.itemsText = sink.map(this.itemToText.bind(this)).join(', ');
        }.bind(this));
      },
    },
    {
      type: 'String',
      name: 'itemsText',
    },
  ],

  methods: [
    function itemToText(item) {
      return (item.quantity > 1 ? item.quantity.toString() + ' ' : '') +
          item.summary;
    },
    function initE() {
      return this
          .start('div').cls('md-grey').cls('items').add(this.itemsText$).end()
          .start('div').cls('md-body').add(this.data.TOTAL).end()
          .start('div').cls('md-body').add(this.data.METHOD_OF_PAYMENT).end()
          .start('div').cls('md-body').add(this.data.STATUS).end();
    },
    function init() {
      // For *EnumProperty.toPropertyE().
      this.Y.registerModel(this.Select, 'foam.u2.Select');

      this.SUPER();
    }
  ],

  templates: [
    function CSS() {/*
      order-citation { display: block; }
      order-citation .items {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    */}
  ]
});
