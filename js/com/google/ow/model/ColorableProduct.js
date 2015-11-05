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
    'foam.u2.md.Select',
  ],

  properties: [
    {
      model_: 'ReferenceProperty',
      name: 'colorableImage',
      defaultValue: null,
    },
    {
      // TODO(markdittmer): This should be an enum property.
      model_: 'StringProperty',
      name: 'color',
      toPropertyE: function(opt_X) {
        var X = opt_X || this.Y;
        return X.foam.u2.md.Select.create({
          choices: [
            ['#212121', 'Black'],
            ['#E91E63', 'Pink'],
            ['#D50000', 'Red'],
            ['#03A9F4', 'Blue'],
            ['#4CAF50', 'Green'],
          ],
        }, X);
      },
      defaultValue: '#212121',
    },
    {
      model_: 'ArrayProperty',
      name: 'colors',
      lazyFactory: function() {
        return
      },
      transient: true,
    },
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE() {
      return this.ColorableProductView.create({ data: this }, this.Y);
    },
  ],
});
