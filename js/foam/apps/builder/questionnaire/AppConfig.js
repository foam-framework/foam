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

  properties: [
    {
      name: 'model',
      label: 'Questions',
      view: 'foam.ui.md.DetailView',
      factory: function() {
        return this.Model.create({
          extendsModel: 'foam.apps.builder.questionnaire.Questionnaire',
        });
      },
    },
    {
      name: 'enableReloadBttn',
      help: 'Enables the reload button in the toolbar.',
      defaultValue: true,
    },
    {
      name: 'enableHomeBttn',
      help: 'Enables the home(save) button in the toolbar.',
      defaultValue: true,
    },

  ]
});
