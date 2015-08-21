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
  extendsModel: 'foam.apps.builder.WizardPage',

  requires: [
    'foam.apps.builder.questionnaire.ModelWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: {
        factory_: 'foam.apps.builder.questionnaire.ModelWizard',
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
    function contentHTML() {/*
        <p class="md-style-trait-standard md-title">Choose a your Data Source</p>
        <p class="md-style-trait-standard">The data source is where your App will store its data.
        This could be inside the device where it is running, in the cloud with Google Drive, or
        on another device on your network.
        </p>
        $$dao{ model_: 'foam.apps.builder.dao.DAOPickerView', baseModel: this.data.baseModelId }
    */},
  ],


});
