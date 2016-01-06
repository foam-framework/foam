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
  name: 'UpdateStreamDetailView',
  extends: 'com.google.ow.ui.UpdateStreamView',

  imports: [ 'dynamic' ],
  exports: [ 'data' ],

  properties: [
    [ 'nodeName', 'UPDATE-STREAM' ],
  ],

  methods: [
    function initE() {
      // TODO(markdittmer): Add differences between items.
      return this.add(this.dynamic(function (items) {
        var item = items[items.length - 1];
        return item ? item.toDetailE(this.Y) : '';
      }.bind(this), this.items$));
    },
  ],

  templates: [
    function CSS() {/*
      update-stream { display: block; }
    */},
  ],
});
