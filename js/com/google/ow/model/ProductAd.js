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
  name: 'ProductAd',
  extends: 'com.google.ow.model.Ad',

  requires: [
    'com.google.ow.ui.ShoppingView',
    'foam.u2.Element',
    'com.google.ow.ui.ImageView',
    'foam.ui.KeyView',
  ],
  exports: [ 'imageDAO' ],

  properties: [
    {
      name: 'imageDAO'
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'products',
    },
    {
      type: 'com.google.ow.model.Order',
      name: 'order',
    },
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE() {
      return this.ShoppingView.create({
        order: this.order,
        products: this.products,
      }, this.Y);
    },
    function toCitationE() {
      return this.Element.create(null, this.Y)
        .start()
          .add(this.KeyView.create({
            dao: this.imageDAO,
            data: this.image,
            subType: 'com.google.ow.model.Image',
            subKey: 'ID',
            innerView: function(args, X) {
              return this.ImageView.create(args, X || this.Y).style({
                background: '#000',
                float: 'left',
                'margin-right': '10px',
              });
            }.bind(this),
          }, this.Y))
          .start('div').cls('md-body').add(this.summaryText).end()
        .end();
    },
  ],
});
