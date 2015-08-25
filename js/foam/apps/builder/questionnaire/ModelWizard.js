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

  requires: [
    'foam.apps.builder.datamodels.ModelWizardEditView',
  ],

  imports: [
    'modelDAO',
  ],

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


  methods: [
    function onNext() {
      this.modelDAO && this.modelDAO.put(this.data.model);
      this.SUPER();
    }
  ],

  templates: [
    function contentHTML() {/*
        <p class="md-style-trait-standard md-title">Create your Questions</p>
        <p class="md-style-trait-standard">Add questions with the large '+' button.
        </p>
        $$model{ model_: 'foam.apps.builder.datamodels.ModelWizardEditView' }
    */},
  ],


});
