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
  package: 'foam.apps.builder.events',
  name: 'AppConfig',
  extendsModel: 'foam.apps.builder.AppConfig',

  requires: [
    'foam.apps.builder.DataConfig',
    'foam.apps.builder.events.Event',
    'foam.apps.builder.events.Presenter',
  ],

  exports: [
    'presentersDAO',
    'eventsDAO',
  ],

  constants: {
    EXISTING_SOURCES: [
      'foam.js',
      'app_bg.js',
      'app_view.html',
    ],
    DC_EVENTS: 'event',
    DC_PRESENTERS: 'presenter',
  },

  properties: [
    {
      name: 'appName',
      defaultValue: 'New Event Calendar App'
    },
    {
      name: 'dataConfigs',
      lazyFactory: function() {
        return [
          this.DataConfig.create({
            name: this.DC_EVENTS,
            parent: this,
            model: this.Event,

          }),
          this.DataConfig.create({
            name: this.DC_PRESENTERS,
            parent: this,
            model: this.Presenter,
          })
        ];
      }
    },
    {
      name: 'defaultView',
      defaultValue: 'foam.apps.builder.events.EventsView',
    },
    {
      type: 'foam.apps.builder.AppWindow',
      name: 'appWindow',
      lazyFactory: function() {
        return this.AppWindow.create({
          id: this.model_.id,
          name: 'Event Window',
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
