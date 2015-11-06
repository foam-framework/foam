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

  requires: [
    'com.google.ow.ui.ImageView',
    'foam.ui.KeyView',
  ],
  imports: [ 'imageDAO' ],

  properties: [ [ 'nodeName', 'ENVELOPE-CITATION' ] ],

  methods: [
    function initE() {
      var d = this.data ? this.data.data : {};
      return this.cls('md-card-shell').cls('md-body')
        .start('div').cls('md-subhead').cls('heading').add(d.titleText).end()
        .start('div').cls('content')
          .add(this.KeyView.create({
            dao: this.imageDAO,
            data: d.image,
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
          .start('div').cls('md-body').add(d.summaryText).end()
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
      }
      envelope-citation .content {
        padding: 5px 10px;
      }
    */},
  ],
});
