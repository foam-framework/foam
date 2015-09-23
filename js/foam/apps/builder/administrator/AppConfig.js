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
  package: 'foam.apps.builder.administrator',
  name: 'AppConfig',
  extendsModel: 'foam.apps.builder.AppConfig',

  traits: [
//    'foam.apps.builder.AppConfigModelOwnerTrait',
//    'foam.apps.builder.AppConfigDAOOwnerTrait',
  ],

  requires: [
    'foam.browser.BrowserConfig',
  ],

  constants: {
    EXISTING_SOURCES: [
      'foam.js',
      'app_bg.js',
      'app_view.html',
    ],
  },

  properties: [
//     {
//       name: 'baseModelId',
//       defaultValue: 'Model',
//     },
    {
      name: 'appName',
      defaultValue: 'New Admin App'
    },
    {
      name: 'defaultView',
      defaultValue: 'foam.apps.builder.administrator.AdminView',
    },
    {
      name: 'model',
      label: 'Data Model',
    },
    {
      name: 'dao',
      postSet: function(old, nu) {
        if ( nu ) {
          this.daoInstance = nu.factory();
          this.baseModelId = nu.modelType;
        }
      }
    },
    {
      name: 'daoInstance',
      lazyFactory: function() {
        return this.dao && this.dao.factory();
      }
    },
    {
      name: 'browserConfig',
      lazyFactory: function() {
        return this.BrowserConfig.create({
          title$: this.appName$,
          label$: this.appName$,
          model$: this.model$,
          dao$: this.daoInstance$,
          detailView: {
            factory_: 'foam.ui.md.UpdateDetailView',
            liveEdit: true,
            minWidth: 600,
            preferredWidth: 10000
          },
          innerDetailView: { factory_: 'foam.apps.builder.AppConfigActionsView',
            delegate: 'foam.ui.md.DetailView' // per app editor view, or specialized per model?
          },
        });
      }
    },
    {
      type: 'foam.apps.builder.AppWindow',
      name: 'appWindow',
      lazyFactory: function() {
        return this.AppWindow.create({
          id: this.model_.id,
          name: 'Admin Window',
        }, this.Y);
      },
      hidden: true,
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
  ]
}*/}
  ],



});
