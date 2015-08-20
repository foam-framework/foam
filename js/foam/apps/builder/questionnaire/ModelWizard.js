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
  name: 'ModelWizard',
  extendsModel: 'foam.apps.builder.WizardPage',

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: null,
    },
  ],

  actions: [
    {
      name: 'next',
      label: 'Finish',
    }
  ],

  templates: [
    function contentHTML() {/*
        <p class="md-style-trait-standard md-title">Choose a your questions</p>
        <p class="md-style-trait-standard">You can create a new set, or re-use an existing
        set of questions.
        </p>
        $$model{ model_: 'foam.apps.builder.datamodels.ModelPickerView', baseModel: this.data.baseModelId }
    */},
  ],


});
