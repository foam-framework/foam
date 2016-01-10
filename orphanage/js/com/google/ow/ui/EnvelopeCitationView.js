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
    'com.google.plus.ui.ShareListView',
    'foam.u2.ActionButton',
    'foam.u2.md.QuickActionButton as ActionButton',
    'foam.ui.md.Toolbar'
  ],

  imports: [ 'dynamic' ],
  exports: [
    'data as envelope',
    'data',
    'toolbar as mdToolbar'
  ],

  properties: [
    [ 'nodeName', 'ENVELOPE-CITATION' ],
    {
      name: 'toolbar',
      lazyFactory: function() {
        return this.Toolbar.create({ title$: this.title$ });
      }
    },
    { type: 'String', name: 'title' },
    {
      name: 'data',
      postSet: function(old,nu) {
        if (nu.data) {
          this.title = nu.data.title || nu.data.titleText;
        }
      }
    }
  ],

  methods: [
    function init() {
      // For Actions.
      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');

      this.SUPER();
    },
    function initE() {
      var d = this.data ? this.data.data : {};
      return this.cls('md-card-shell')
        .start('div').cls('heading')
          .start('span').cls('md-subhead').add(d.titleText$ ?
              this.dynamic(function(titleText) { return titleText; }, d.titleText$) :
              '')
          .end()
          // .start('div').cls('envelope-spacer').end()
          // .start().cls(function() {
          //   return this.data.shares && this.data.shares.length > 0 ?
          //       'show' : 'hide';
          // }.bind(this).on$(this.X, this.data$))
          .add(this.SHARE)
            // .start().add('Shared With:').cls('md-grey').end()
            // .add(this.data.SHARES)
          // .end()
        .end()
        .start('div').cls('content')
          .add(d.toCitationE(this.Y.sub({
            controllerMode: 'view',
          })))
        .end();
    }
  ],

  actions: [
    {
      name: 'share',
      ligature: 'share',
      code: function(X) {
        var env = this.clone();
        env.id = createGUID();
        // HACK(markdittmer): Send to /Chat/All.
        env.sid = '/Chat/All';
        env.timestamp = new Date();
        env.data = env.data.toSharable ? env.data.toSharable(X) : env.data;
        X.streamDAO.put(env);
      }
    }
  ],

  templates: [
    function CSS() {/*
      envelope-citation {
        display: block;
        padding: 0 0 5px 0;
        -webkit-user-select: none;
        -ms-user-select': none;
        -moz-user-select': none;
        cursor: pointer;
      }
      envelope-citation .heading {
        font-weight: 500;
        padding: 10px 10px 5px 10px;
        background: #EEEEEE;
        display: flex;
        flex-direction: row;
        position: relative;
      }
      envelope-citation .content {
        padding: 5px 10px;
      }
      envelope-citation .envelope-spacer {
        flex-grow: 10;
      }
      envelope-citation .hide { display: none; }
      envelope-citation quick-action-button {
        position: absolute;
        right: -8px;
        top: -8px;
      }
    */}
  ]
});
