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
  name: 'EnvelopeDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.DetailView',
  ],

  exports: [
    'data as envelope',
    'data',
  ],

  properties: [
    [ 'nodeName', 'ENVELOPE-DETAIL' ],
  ],

  methods: [
    function initE() {
      var d = this.data.data;
      return this.add(d.toDetailE ? d.toDetailE(this.Y) :
          this.DetailView.create({ data: d }, this.Y));
    },
  ],

  templates: [
    function CSS() {/*
      envelope-citation {
        display: block;
      }
    */},
  ],
});
