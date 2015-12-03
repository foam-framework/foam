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
    'foam.u2.Element'
  ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'products'
    },
    {
      type: 'com.google.ow.model.Order',
      name: 'order'
    }
  ],

  methods: [
    // TODO(markdittmer): We should use model-for-model or similar here.
    function toDetailE(X) {
      X = X.sub({ data: this });
      return X.lookup('com.google.ow.ui.ShoppingView').create({
        data: this,
        order: this.order,
        products: this.products,
      }, X);
    },
    function toCitationE(X) {
      X = X.sub({ data: this });
      return X.lookup('foam.u2.Element').create(null, X)
        .start()
          .start('div').style({
            float: 'left',
            background: '#000',
            'margin-right': '10px',
          })
            .add(X.dynamic(function(X, imgUrl) {
              return imgUrl ? this.IMAGE_URL.toE(X) : '';
            }.bind(this, X), this.imageUrl$))
          .end()
          .start('div').cls('md-body').add(this.summaryText).end()
        .end();
    },
    function toString() { return '[rich content]'; }
  ]
});
