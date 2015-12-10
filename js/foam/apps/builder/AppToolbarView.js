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
  package: 'foam.apps.builder',
  name: 'AppToolbarView',
  extends: 'foam.ui.View',

  requires: [
    'foam.ui.md.FlatButton',
  ],

  properties: [
    {
      name: 'data',
      documentation: 'A list of view factory properties to render in the toolbar. You must pre-bind their data.',
    },
    {
      name: 'className',
      defaultValue: 'md-app-toolbar',
    }
  ],

  methods: [
    function init() {
      this.SUPER();
    },

    function toInnerHTML() {
      var ret = "";
      if (this.data.length) {
        for(var i=0; i < this.data.length; ++i) {
          var v = this.data[i]();
          this.addChild(v);
          ret += v.toHTML();
        }
      }
      return ret;
    },
  ],

  templates: [
    function CSS() {/*
      .md-app-toolbar {
        display: flex;
        align-items: center;
        flex-grow: 0;
        flex-shrink: 0;
        padding: 0px 6px;
        box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.38);
      }
      .md-app-toolbar .actionButtonCView {
        flex-grow: 0;
        flex-shrink: 0;
        margin: 12px 6px;
      }
      .md-app-toolbar .md-text-field-container {
        flex-grow: 1;
        flex-shrink: 1;
      }
      .md-app-toolbar .actionButtonCView[width="0"][height="0"] {
        margin: 0px;
      }
    */},
  ]
});
