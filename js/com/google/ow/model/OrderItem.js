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
  name: 'OrderItem',

  requires: [
    'com.google.ow.ui.OrderItemView',
  ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'id',
    },
    {
      type: 'com.google.ow.model.Product',
      name: 'product',
    },
    {
      model_: 'StringProperty',
      name: 'summary',
      toPropertyE: function(X) {
        // TODO(markdittmer): We should have a non-input-element standard for
        // this.
        return X.E('div').add(X.data[this.name + '$']);
      },
    },
    {
      model_: 'IntProperty',
      name: 'quantity',
      defaultValue: 1,
      toPropertyE: function(X) {
        // TODO(markdittmer): We should have a non-input-element standard for
        // this.
        return X.E('div').add(X.data[this.name + '$']);
      },
    },
    {
      model_: 'FloatProperty',
      name: 'total',
      dynamicValue: function() {
        return this.product ? this.product.price * this.quantity : 0.00;
      },
      toPropertyE: function(X) {
        // TODO(markdittmer): This should be a "currency E" of some kind.
        return X.lookup('foam.u2.Element').create(null, X)
            .add('$')
            .add(X.dynamic(function(num) {
              return num.toFixed(2);
            }.bind(this), X.data[this.name + '$']));
      },
    },
  ],

  methods: [
    function toE(X) {
      return this.OrderItemView.create({
        data: this,
        controllerMode: 'view',
      }, X);
    },
  ],
});
