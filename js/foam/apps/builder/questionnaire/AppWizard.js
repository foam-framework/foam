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
    'foam.apps.builder.wizard.NewDAOWizard',
    'foam.apps.builder.wizard.NewOrExistingDAOWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: {
        factory_: 'foam.apps.builder.wizard.NewOrExistingDAOWizard',
      },
    },
  ],

  actions: [
    {
      name: 'next',
      label: 'Next: Choose Data Source',
    }
  ],

  templates: [
    function contentHTML() {/*
      <p class="md-style-trait-standard md-title">Name your Questionnaire</p>
      <p class="md-style-trait-standard">Choose a name for your new Questionnaire. The name should
        be a few words to indicate the purpose, such as &quot;new patient&quot;
        or &quot;customer service survey&quot;
      </p>
      $$appName
    */},
  ],


});
