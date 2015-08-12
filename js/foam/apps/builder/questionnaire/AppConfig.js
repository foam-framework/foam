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
    'BooleanProperty',
    'StringProperty',
    'IntProperty',
    'FloatProperty',
    'DateProperty',
    'Model',
    'foam.ui.md.DetailView',
    'foam.ui.TableView',
    'foam.apps.builder.questionnaire.Questionnaire',
  ],

  imports: [
    'modelDAO',
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
      name: 'appName',
      postSet: function(old,nu) {
        if ( nu && this.defaultModel_ ) {
          this.model.name = capitalize(camelize(this.appName))+'Questionnaire';
        }
      },
      defaultValue: 'New App'
    },
    {
      model_: 'BooleanProperty',
      name: 'defaultModel_',
      hidden: true,
      transient: true,
      documentation: 'Indicates that .model is still not saved, and the name can be changed.',
    },
    {
      name: 'defaultView',
      defaultValue: 'foam.apps.builder.questionnaire.QuestionnaireView',
    },
    {
      name: 'model',
      label: 'Questions',
      view: 'foam.ui.md.DetailView',
      lazyFactory: function() {
        this.defaultModel_ = true;
        return this.Model.create({
          extendsModel: 'foam.apps.builder.questionnaire.Questionnaire',
          name: capitalize(camelize(this.appName))+'Questionnaire',
        });
      },
      preSet: function(old,nu) {
        if ( ! nu ) return old;
        if ( old ) this.defaultModel_ = false; // it's been set at least once
        return nu;
      },
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
