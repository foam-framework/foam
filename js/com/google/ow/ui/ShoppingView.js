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
  name: 'ShoppingView',
  extends: 'foam.u2.View',

  requires: [
    'foam.ui.DAOListView',
    'foam.u2.DetailView',
  ],

  properties: [ [ 'nodeName', 'SHOPPING' ] ],

  methods: [
    function initE() {
      return this.add(this.DAOListView.create({
        dao: this.data.products,
        rowView: function(args, X) {
          return args.data && args.data.toDetailE ?
              args.data.toDetailE() :
              this.DetailView.create({ data: args.data }, X || this.Y);
        },
      }, this.Y));
    },
  ],

  templates: [
    function CSS() {/* shopping { display: block; } */},
  ],
});
