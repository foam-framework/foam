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
  name: 'UpdateStreamCitationView',
  extends: 'com.google.ow.ui.UpdateStreamView',

  exports: [ 'data' ],

  properties: [
    [ 'nodeName', 'UPDATE-STREAM-CITATION' ],
  ],

  methods: [
    function initE() {
      // TODO(markdittmer): Add differences between versions.
      return this.add(function (versions) {
        if ( ! (versions[versions.length - 1] &&
            versions[versions.length - 1].data) ) return '';
        var versionEnv = versions[versions.length - 1];
        var versionData = versionEnv.data;
        return versionData.toCitationE(this.Y.sub({ envelope: versionEnv }));
      }.bind(this).on$(this.X, this.versions$));
    },
  ],

  templates: [
    function CSS() {/*
      update-stream-citation { display: block; }
    */},
  ],
});
