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
  name: 'AppLoader',
  extendsModel: 'foam.ui.View',

  documentation: function() {/*
    Used by exported App Builder apps to load the desired model and view.
  */},

  requires: [
    'foam.ui.md.FlatButton',
    'foam.ui.md.SharedStyles',
  ],
  imports: [
    'appConfig as data',
    'document',
  ],

  constants: {
    CONFIG_PATH: 'config.json',
  },

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.delegate = this.X.lookup(this.data.defaultView).xbind({
          data: this.data
        }, this.Y);
        this.updateHTML();
      },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'delegate',
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.SharedStyles.create({}, this.Y);

      // Mimic behaviour of foam.browser.BrowserView.
      this.Y.registerModel(this.FlatButton.xbind({
        displayMode: 'ICON_ONLY',
        height: 24,
        width: 24,
      }), 'foam.ui.ActionButton');
    },
    function initHTML() {
      this.SUPER();
      if ( ! this.parent ) this.document.title = this.data.appName;
    },
  ],

  templates: [
    function toHTML() {/*
      <app-loader id="%%id" %%cssClassAttr()>
        %%delegate()
      </app-loader>
    */},
    function CSS() {/*
      app-loader { display: block; }
    */},
  ]
});
