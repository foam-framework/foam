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
    'foam.apps.builder.datamodels.ModelPickerView'
  ],

  properties: [
    {
      name: 'metaEditModelTitle',
      defaultValue: 'Edit your Questionnaire',
    },
    {
      name: 'metaEditPropertyTitle',
      defaultValue: 'Edit Question',
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        $$appName
        $$model{ model_: 'foam.apps.builder.datamodels.ModelPickerView', baseModel: 'foam.apps.builder.questionnaire.Questionnaire' }
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
