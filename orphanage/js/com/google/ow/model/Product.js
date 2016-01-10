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
  name: 'Product',

  requires: [
    'com.google.ow.model.OrderItem',
    'com.google.ow.ui.ShoppingItemView',
  ],

  properties: [
    {
      type: 'String',
      name: 'id',
    },
    {
      type: 'String',
      name: 'name',
    },
    {
      type: 'String',
      name: 'summary',
    },
    {
      type: 'Float',
      name: 'price',
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
      type: 'Int',
      name: 'hash',
      defaultValueFn: function() {
        return this.id.hashCode();
      },
    },
  ],

  methods: [
    function toOrderItem(n) {
      var c = this.clone();
      var name = c.name;
      c.name = c.summary = '';
      return this.OrderItem.create({
        product: c,
        summary: name,
        quantity: n,
      }, this.Y);
    },
    function toE(X) {
      // TODO(markdittmer): This may not always be what we want. We should
      // use some contextual hints to choose a view.
      return this.ShoppingItemView.create({ data: this }, X);
    },
  ],
});
