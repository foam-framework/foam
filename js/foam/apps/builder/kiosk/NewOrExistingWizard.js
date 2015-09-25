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
  package: 'foam.apps.builder.kiosk',
  name: 'NewOrExistingWizard',
  extendsModel: 'foam.apps.builder.wizard.NewOrExistingWizard',

  requires: [
    'foam.apps.builder.kiosk.BasicInfoWizard',
    'foam.apps.builder.kiosk.ImportWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      lazyFactory: function() {
        return this.newViewFactory;
      },
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'newViewFactory',
      label: 'Create new kiosk app',
      defaultValue: 'foam.apps.builder.kiosk.BasicInfoWizard',
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'existingViewFactory',
      label: 'Import existing Chrome App Builder app',
      defaultValue: 'foam.apps.builder.kiosk.ImportWizard',
    },
    {
      name: 'title',
      defaultValue: 'Create or Import Kiosk App',
    },
  ],

  methods: [ function onNext() {}, ],

  actions: [
    {
      name: 'nextAction',
      isEnabled: function() {
        return true;
      },
    }
  ],
});
