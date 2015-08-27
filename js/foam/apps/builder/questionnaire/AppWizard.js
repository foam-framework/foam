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
  name: 'AppWizard',
  extendsModel: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.apps.builder.questionnaire.NewDAOWizard',
    'foam.apps.builder.questionnaire.NewOrExistingDAOWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: {
        factory_: 'foam.apps.builder.questionnaire.NewOrExistingDAOWizard',
      },
    },
    {
      name: 'title',
      defaultValue: 'Name your Questionnaire',
    },
  ],


  templates: [
   

    function instructionHTML() {/*
      <p class="md-style-trait-standard">Choose a name for your new Questionnaire. The name should
        be a few words to indicate the purpose, such as &quot;new patient&quot;
        or &quot;customer service survey&quot;
      </p>
    */},

    function contentHTML() {/*
      $$appName
    */},
  ],


});
