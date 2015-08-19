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

  traits: [
    'foam.apps.builder.AppConfigModelOwnerTrait',
    'foam.apps.builder.AppConfigDAOOwnerTrait',
  ],

  requires: [
    'foam.apps.builder.questionnaire.Questionnaire',
  ],

  constants: {
    EXISTING_SOURCES: [
      'foam.js',
      'questionnaire_bg.js',
      'kiosk_view.html',
    ],
  },

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
      name: 'model',
      label: 'Questions',
    }
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
        "questionnaire_bg.js"
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
