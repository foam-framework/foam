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
  package: 'foam.apps.builder.kiosk',
  name: 'KioskApp',
  extendsModel: 'foam.ui.View',

  requires: [
    'XHR',
    'foam.apps.builder.kiosk.KioskAppConfig',
    'foam.apps.builder.kiosk.KioskView',
    'foam.graphics.ActionButtonCView',
    'foam.ui.md.SharedStyles',
  ],

  constants: {
    CONFIG_PATH: 'config.json',
  },

  properties: [
    {
      type: 'foam.apps.builder.kiosk.KioskAppConfig',
      name: 'data',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.replaceView();
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.SharedStyles.create({}, this.Y);

      // Mimic behaviour of foam.browser.BrowserView.
      this.Y.registerModel(this.ActionButtonCView.xbind({
        height: 24,
        width: 24
      }), 'foam.ui.ActionButton');

      this.XHR.create().asend(function(str, xhr, status) {
        if ( ! status ) return;
	aeval('(' + str + ')')(function(data) {
	  this.data = JSONUtil.mapToObj(this.Y, data);
	}.bind(this));
      }.bind(this), this.CONFIG_PATH);
    },
    function initHTML() {
      this.SUPER();
      this.replaceView();
    },
    function replaceView() {
      if ( ! ( this.$ && this.data ) ) return;
      var view = this.KioskView.create({ data: this.data }, this.Y);
      this.$.outerHTML = view.toHTML();
      view.initHTML();
    },
  ],

  templates: [
    function toHTML() {/*
      <kiosk id="%%id"></kiosk>
    */},
  ]
});
