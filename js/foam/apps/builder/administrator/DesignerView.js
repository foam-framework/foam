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
  package: 'foam.apps.builder.administrator',
  name: 'DesignerView',
  extendsModel: 'foam.apps.builder.DesignerView',

  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'foam.apps.builder.administrator.ChangeDAOWizard',
    'foam.apps.builder.administrator.ChangeModelWizard',
    'foam.apps.builder.administrator.AdminView',
    'foam.apps.builder.templates.AppView',
    'foam.apps.builder.templates.PanelView',
  ],

  properties: [
    'data',
    {
      model_: 'ViewFactoryProperty',
      name: 'panel',
      defaultValue: 'foam.apps.builder.templates.PanelView',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'app',
      defaultValue: {
        factory_: 'foam.apps.builder.templates.AppView',
        delegate: 'foam.apps.builder.administrator.AdminView',
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      // ModelSummaryView will use this, redirect to Admin version
      this.Y.registerModel(this.ChangeModelWizard, 'foam.apps.builder.wizard.ChangeModelWizard');
      this.Y.registerModel(this.ChangeDAOWizard, 'foam.apps.builder.wizard.ChangeDAOWizard');

      this.Y.set('mdToolbar', null);
    }
  ],
});
