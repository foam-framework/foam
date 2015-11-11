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
  package: 'com.google.plus.ui',
  name: 'ChipListView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DAOListView',
    'com.google.plus.ui.ChipView',
  ],

  imports: [ 'data' ],

  properties: [ [ 'nodeName', 'PLUS-CHIP-LIST' ] ],

  methods: [
    function initE() {
      this.Y.registerModel(this.ChipView, 'foam.u2.DetailView');
      return this.add(this.DAOListView.create({
        data: this.data,
        rowView: this.ChipView
      }));
    },
  ],

  templates: [
    function CSS() {/*
      plus-chip-list {
        display: flex;
        flex-direction: row-wrap;
      }
    */},
  ],
});
