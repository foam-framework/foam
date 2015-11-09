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
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'id',
    },
    {
      model_: 'StringProperty',
      name: 'name',
    },
    {
      model_: 'StringProperty',
      name: 'summary',
    },
  ],

  methods: [
    function toOrderItem(n) {
      var c = this.clone();
      c.name = c.summary = '';
      return this.OrderItem.create({ product: c, quantity: n }, this.Y);
    },
  ],
});
