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
  name: 'NewOrExistingModelWizard',
  extendsModel: 'foam.apps.builder.wizard.NewOrExistingModelWizard',

  requires: [
    'foam.apps.builder.questionnaire.ModelWizard',
    'foam.apps.builder.questionnaire.ModelPreviewWizard',
  ],

  properties: [
    {
      name: 'newViewFactory',
      label: 'Create a new Question Set',
      defaultValue: { factory_: 'foam.apps.builder.questionnaire.ModelWizard' },
    },
    {
      name: 'existingViewFactory',
      label: 'Use existing Question Set',
      defaultValue: null, //function() { },
    },
    {
      name: 'editView',
      defaultValue: { factory_: 'foam.apps.builder.questionnaire.ModelPreviewWizard' },
    },
  ],

  templates: [
    function titleHTML() {/*
        <p class="md-style-trait-standard md-title">Choose the Question Set</p>
    */},
    function instructionHTML() {/*
        <p class="md-style-trait-standard">Create a new set of questions, or share
        an existing set of questions with one of your other Questionnaire Apps.
        If you pick an existing set of questions, changes to the questions will
        also show up in the other apps that use that set.
        </p>
    */},

  ],



});
