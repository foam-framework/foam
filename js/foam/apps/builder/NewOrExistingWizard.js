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
  package: 'foam.apps.builder',
  name: 'NewOrExistingWizard',
  extendsModel: 'foam.apps.builder.WizardPage',

  properties: [
    {
      name: 'newViewFactory',
      label: 'New',
      defaultValue: null,
    },
    {
      name: 'existingViewFactory',
      label: 'Existing',
      defaultValue: null,
    },
    
  ],

  actions: [
    {
      name: 'next',
      labelFn: function() {
        this.nextViewFactory;
        return 'Next: Create the Questions';
      },
    }
  ],

  templates: [
    function contentHTML() {/*
        <p class="md-style-trait-standard md-title">New or Existing</p>
        <p class="md-style-trait-standard">Choose one of the following options:
        </p>
        $$nextViewFactory{ model_: 'foam.ui.md.ChoiceRadioView', 
          orientation: 'vertical',
          choices: [
            [this.newViewFactory, this.NEW_VIEW_FACTORY.label],
            [this.existingViewFactory, this.EXISTING_VIEW_FACTORY.label ],
          ]
         }
    */},
  ],


});
