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
  package: 'com.google.ymp.generators',
  name: 'ProductNameGenerator',
  extends: 'com.google.ymp.generators.Generator',

  documentation: 'Simple generator for product names. Generates null after exhausted.',

  properties: [
    {
      type: 'StringArray',
      name: 'productNames',
      lazyFactory: function() {
        return [
          'computer',
          'phone',
          'produce',
          'apartment',
          'flute',
          'stove',
          'jeans',
          'glasses',
          'bed',
          'pillows',
          'TV',
          'fridge',
          'apples',
          'potatoes',
          'berries',
          'carrots',
          'avocado',
          'tomatoes',
        ];
      },
    },
    {
      type: 'Int',
      name: 'idx_',
      defaultValue: 0,
    },
  ],

  methods: [
    function generate(ret) {
      if ( this.idx_ >= this.productNames.length ) {
        ret(null);
        return;
      }
      var name = this.productNames[this.idx_];
      ++this.idx_;
      ret(name);
    },
  ],
});
