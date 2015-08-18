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
  name: 'EditView',
  extendsModel: 'foam.ui.md.DetailView',

  exports: [
    'metaEditModelTitle',
    'metaEditPropertyTitle',
  ],

  requires: [
    'foam.apps.builder.datamodels.ModelPickerView',
    'foam.apps.builder.dao.DAOPickerView',
  ],

  properties: [
    {
      name: 'metaEditModelTitle',
      defaultValue: 'Edit your Questionnaire: Click the red "+" button below to add a new question.',
    },
    {
      name: 'metaEditPropertyTitle',
      defaultValue: 'Add a new Question: Enter a descriptive name (such as "first name" or "home phone number"), then select the type of input (such as a "StringProperty" for text, or "BooleanProperty" for a yes/no checkbox).',
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        $$appName
        $$model{ model_: 'foam.apps.builder.datamodels.ModelPickerView', baseModel: this.data.baseModelId }
        $$dao{ model_: 'foam.apps.builder.dao.DAOPickerView', baseModel: this.data.baseModelId }
        $$version
        $$termsOfService
        $$rotation
        $$kioskEnabled
      </div>
    */},
    function CSS() {/*
    */},
  ],
});
