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
    'com.google.ow.ui.ImageView',
    'foam.ui.KeyView',
  ],
  imports: [ 'imageDAO' ],
  exports: [ 'data' ],

  properties: [ [ 'nodeName', 'PRODUCT' ] ],

  methods: [
    function initE() {
      return this.start('div').cls('md-subhead').cls('heading')
          .add(this.data.name)
        .end()
        // TODO(markdittmer): u2-ify KeyView.
        .add(this.KeyView.create({
          dao: this.imageDAO,
          data: this.data.colorableImage,
          subType: 'com.google.ow.model.Image',
          subKey: 'ID',
          innerView: function(args, X) {
            return this.ImageView.create(args, X || this.Y)
                .cls('colorable-img').style({
                  'float': 'right',
                  'margin-left': '5px',
                  background: this.data.color$,
                });
          }.bind(this),
        }, this.Y))
        .start('div').cls('md-body').style({ 'padding-left': '16px' })
          .add(this.data.summary)
        .end()
        .add(this.data.COLOR);
    },
  ],

  templates: [
    function CSS() {/*
      product {
        display: block;
        width: 100%;
      }
      product .colorable-img {
        float: right;
        background: #000;
        margin: 10px;
        width: 200px;
        height: 200px;
      }
      product .heading {
        padding: 10px 0 5px 10px;
      }
      product .content {
        padding: 5px 10px;
        white-space: pre-line;
      }
    */},
  ],
});
