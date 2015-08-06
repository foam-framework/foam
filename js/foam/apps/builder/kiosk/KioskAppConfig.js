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
  name: 'KioskAppConfig',
  extendsModel: 'foam.apps.builder.AppConfig',

  constants: {
    EXISTING_SOURCES: [
      'foam.js',
      'kiosk_bg.js',
      'kiosk_view.html',
    ],
  },

  properties: [
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
      hidden: true
    },
    {
      model_: 'BooleanProperty',
      name: 'enableNavBttns',
      label: 'Enable back/forward navigation buttons',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'enableHomeBttn',
      label: 'Enable home button',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'enableReloadBttn',
      label: 'Enable reload button',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'enableLogoutBttn',
      label: 'Enable restart session button',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'enableNavBar',
      label: 'Enable navigation bar',
      defaultValue: false
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
        "kiosk_bg.js"
      ]
    }
  },
  "permissions": [
    "webview",
    "power",
    "storage",
    "videoCapture",
    "geolocation",
    "pointerLock",
    "system.display",
    { "fileSystem": [
      "write",
      "retainEntries",
      "directory"
    ] },
    "accessibilityFeatures.read",
    "accessibilityFeatures.modify"
  ],
  "kiosk_enabled": %%kioskEnabled
}*/}
  ],
});
