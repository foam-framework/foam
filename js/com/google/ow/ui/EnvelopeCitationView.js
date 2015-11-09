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
  name: 'EnvelopeCitationView',
  extends: 'foam.u2.View',

  requires: [ 'com.google.plus.ui.ShareListView' ],

  exports: [ 'data' ],

  properties: [ [ 'nodeName', 'ENVELOPE-CITATION' ] ],

  methods: [
    function initE() {
      var d = this.data ? this.data.data : {};
      return this.cls('md-card-shell').cls('md-body')
        .start('div').cls('md-subhead').cls('heading')
          .add(d.titleText)
          .start('div').cls('envelope-spacer').end()
          .start().add('Shared:').cls('md-grey').end()
          .add(this.data.SHARES)
        .end()
        .start('div').cls('content')
          .add(d.toCitationE())
        .end();
    },
  ],

  templates: [
    function CSS() {/*
      envelope-citation {
        display: block;
        padding: 0 0 5px 0;
        -webkit-user-select: none;
        -ms-user-select': none;
        -moz-user-select': none;
        white-space: pre-line;
        cursor: pointer;
      }
      envelope-citation .heading {
        font-weight: 500;
        padding: 10px 10px 5px 10px;
        background: #EEEEEE;
        display: flex;
        flex-direction: row;
      }
      envelope-citation .content {
        padding: 5px 10px;
      }
      envelope-citation .envelope-spacer {
        flex-grow: 10;
      }
    */},
  ],
});
