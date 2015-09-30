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
  name: 'AppConfig',
  extendsModel: 'foam.apps.builder.AppConfig',

  requires: [
    'foam.apps.builder.AppWindow',
  ],

  constants: {
    EXISTING_SOURCES: [
      'foam.js',
      'app_bg.js',
      'app_view.html',
    ],
  },

  properties: [
    {
      name: 'appName',
      defaultValue: 'New Kiosk App',
    },
    {
      type: 'foam.apps.builder.AppWindow',
      name: 'appWindow',
      lazyFactory: function() {
        return this.AppWindow.create({
          id: this.model_.id,
          name: 'Kiosk Window',
        }, this.Y);
      },
      hidden: true,
    },
    {
      model_: 'StringProperty',
      name: 'homepage',
      label: 'Homepage',
      help: multiline(function() {/*
        Initial page for the app that is also associated with 'going home.'
      */}),
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        placeholder: 'http://www.example.com',
        type: 'url',
        required: true
      },
      defaultValue: 'http://www.google.com',
    },
    {
      name: 'defaultView',
      defaultValue: 'foam.apps.builder.kiosk.KioskView',
      hidden: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'enableNavBttns',
      label: 'Enable back/forward navigation buttons',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'enableHomeBttn',
      label: 'Enable home button',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'enableReloadBttn',
      label: 'Enable reload button',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'enableLogoutBttn',
      label: 'Enable restart session button',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'enableNavBar',
      label: 'Enable address bar',
      defaultValue: false,
    },
    {
      model_: 'BooleanProperty',
      name: 'enableURLTracking',
      label: 'Enable URL tracking (requires Google Analytics)',
      defaultValue: false,
    },
  ],

  methods: [
    function getChromePermissions() {
      return this.SUPER().concat([
        'webview',      // To show the <webview>.
        'videoCapture', // To enable <webview> to perform this function.
        'geolocation',  // To enable <webview> to perform this function.
        'pointerLock',  // To enable <webview> to perform this function.
      ]);
    },
  ],

  templates: [
    function toManifest() {/*{
  "version": "%%version",
  "manifest_version": 2,
  "minimum_chrome_version": "43.0.0.0",
  "name": "%%appName",
  "app": {
    "background": {
      "scripts": [
        "foam.js",
        "app_bg.js"
      ]
    }
  },
  "permissions": <%= JSON.stringify(this.getChromePermissions()) %>,
  "kiosk_enabled": %%kioskEnabled
}*/}
  ],
});
