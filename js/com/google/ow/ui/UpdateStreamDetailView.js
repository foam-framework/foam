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

  exports: [ 'data' ],

  properties: [
    [ 'nodeName', 'UPDATE-STREAM' ],
  ],

  methods: [
    function initE() {
      // TODO(markdittmer): Add differences between versions.
      return this.add(function (versions) {
        var version = versions[versions.length - 1];
        return version ? version.toDetailE(this.Y) : '';
      }.bind(this).on$(this.X, this.versions$));
    },
  ],

  templates: [
    function CSS() {/*
      update-stream { display: block; }
    */},
  ],
});
