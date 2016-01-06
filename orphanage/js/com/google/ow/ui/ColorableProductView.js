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
  name: 'ColorableProductView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.md.Select'
  ],
  exports: [ 'data' ],

  properties: [ [ 'nodeName', 'PRODUCT' ] ],

  methods: [
    function init() {
      // For *EnumProperty.toPropertyE().
      this.Y.registerModel(this.Select, 'foam.u2.Select');

      this.SUPER();
    },
    function initE() {
      return this.start('div').cls('md-subhead').cls('heading')
          .add(this.data.name)
        .end()

        .start('div').cls('image')
          .add(this.data.COLORABLE_IMAGE_URL)
        .end()
        .start('div').cls('md-body').cls('summary')
          .add(this.data.summary)
        .end()
        .start('div').cls('md-body').cls('price')
          .add('$').add(this.data.price.toFixed(2))
        .end()
        .add(this.data.COLOR);
    }
  ],

  templates: [
    function CSS() {/*
      product {
        display: block;
        width: 100%;
      }
      product .image {
        float: right;
        margin: 10px;
        width: 200px;
        height: 200px;
      }
      product .heading {
        padding: 10px 0 5px 10px;
      }
      product .summary, product.price {
        padding: 5px 10px;
      }
      product .summary {
        white-space: pre-line;
      }
      product .price {
        font-style: italic;
        padding: 5px 10px;
      }
    */}
  ]
});
