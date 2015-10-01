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
  package: 'foam.apps.builder.questionnaire',
  name: 'AppConfig',
  extendsModel: 'foam.apps.builder.AppConfig',

  requires: [
    'foam.apps.builder.questionnaire.Questionnaire',
    'foam.apps.builder.AppWindow',
    'foam.apps.builder.DataConfig',
  ],

  constants: {
    EXISTING_SOURCES: [
      'foam.js',
      'app_bg.js',
      'app_view.html',
    ],
  },

  ids: ['appId'],

  properties: [
    {
      name: 'baseModelId',
      defaultValue: 'foam.apps.builder.questionnaire.Questionnaire',
    },
    {
      name: 'appName',
      defaultValue: 'New Questionnaire App'
    },
    {
      name: 'defaultView',
      defaultValue: 'foam.apps.builder.questionnaire.QuestionnaireView',
    },
    {
      name: 'dataConfigs',
      lazyFactory: function() {
        var dc = this.DataConfig.create({
          parent: this,
          name: 'questions',
          model: this.Event,
        });
        return [dc];
      }
    },
    {
      type: 'foam.apps.builder.AppWindow',
      name: 'appWindow',
      lazyFactory: function() {
        return this.AppWindow.create({
          id: this.model_.id,
          name: 'Questionnaire Window',
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