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
  name: 'DAOWizard',
  extendsModel: 'foam.apps.builder.wizard.DAOWizard',

  requires: [
    'foam.apps.builder.questionnaire.NewOrExistingModelWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: {
        factory_: 'foam.apps.builder.questionnaire.NewOrExistingModelWizard',
      },
    },
  ],

  actions: [
    {
      name: 'next',
      label: 'Next: Create the Questions',
    }
  ],

  templates: [
    function titleHTML() {/*
        <p class="md-style-trait-standard md-title">Data Source Settings</p>
    */},
    function instructionHTML() {/*
        <p class="md-style-trait-standard">Set the following options for your Data Source:
        </p>
    */},
  ],


});
