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
  name: 'ColorableProduct',
  extends: 'com.google.ow.model.Product',

  requires: [
    'com.google.ow.ui.ColorableProductView',
  ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'hash',
      defaultValueFn: function() {
        return (this.id + '$'  + this.color).hashCode();
      },
    },
    {
      model_: 'ReferenceProperty',
      name: 'colorableImage',
      defaultValue: null,
    },
    {
      // TODO(markdittmer): This should be an enum property.
      model_: 'foam.core.types.StringEnumProperty',
      name: 'color',
    },
    {
      model_: 'ArrayProperty',
      name: 'colors',
      factory: function() {
        return [
          ['#212121', 'Black'],
          ['#E91E63', 'Pink'],
          ['#D50000', 'Red'],
          ['#03A9F4', 'Blue'],
          ['#4CAF50', 'Green'],
        ];
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.COLOR.choices = nu;
      },
    },
  ],

  methods: [
    function toOrderItem(n) {
      var item = this.SUPER(n);
      item.summary += ' ' + this.COLOR.choiceLabel(this.color);
      return item;
    },
    function toDetailE() {
      return this.ColorableProductView.create({ data: this }, this.Y);
    },
  ],
});
