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
  name: 'AdminController',

  imports: [
    'masterAppDAO',
  ],

  requires: [
    'foam.browser.BrowserConfig',
  ],

  properties: [
    {
      name: 'targetAppId',
      label: 'Administered App ID',
      postSet: function(old,nu) {
        if ( old !== nu ) this.findAppConfig();
      }
    },
    {
      name: 'targetAppConfig',
      postSet: function(old, nu) {
        if ( nu && old !== nu &&
            old.appId !== nu.appId ) {
          this.loadedAppConfig(nu);
          this.targetAppId = nu.appId;
        }
      }
    },
    {
      name: 'targetDAOInstance',
    },
    {
      name: 'targetModel',
    },
    {
      name: 'browserConfig',
    },
    {
      name: 'masterAppDAO',
      transient: true,
      hidden: true,
      postSet: function(old,nu) {
        if ( old !== nu ) this.findAppConfig();
      },
      propertyToJSON: function() { return ''; },
      getter: function() {
        return this.X.masterAppDAO;
      },
    }
  ],

  listeners: [
    {
      name: 'findAppConfig',
      code: function() {
        this.masterAppDAO && this.targetAppId && this.masterAppDAO.find(this.targetAppId, {
          put: this.loadedAppConfig,
          error: function() {
            console.warn(this.appName,"select failed for",this.targetAppId);
          }.bind(this)
        });
      }
    },
    {
      name: 'loadedAppConfig',
      code: function(cfg) {
        if ( ! cfg ) {
          console.warn(this.appName,"Could not load",this.targetAppId);
          return;
        }
        if ( this.targetAppConfig.appId !== cfg.appId ) this.targetAppConfig = cfg;
        this.targetDAOInstance = cfg.createDAO();
        this.targetModel = cfg.model;

        this.browserConfig = this.BrowserConfig.create({
          title$: this.appName$,
          label$: this.appName$,
          model$: this.targetModel$,
          dao$: this.targetDAOInstance$,
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
