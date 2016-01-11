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
  name: 'DesignerView',
  extends: 'foam.apps.builder.DesignerView',

  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'foam.apps.builder.questionnaire.ChangeDAOWizard',
    'foam.apps.builder.questionnaire.ChangeModelWizard',
    'foam.apps.builder.questionnaire.QuestionnaireView',
    'foam.apps.builder.templates.AppView',
    'foam.apps.builder.templates.PanelView',
  ],

  properties: [
    'data',
    {
      type: 'ViewFactory',
      name: 'panel',
      defaultValue: 'foam.apps.builder.templates.PanelView',
    },
    {
      type: 'ViewFactory',
      name: 'app',
      defaultValue: {
        factory_: 'foam.apps.builder.templates.AppView',
        delegate: 'foam.apps.builder.questionnaire.QuestionnaireView',
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      // ModelSummaryView will use this, redirect to Questionnaire version
      this.Y.registerModel(this.ChangeModelWizard, 'foam.apps.builder.wizard.ChangeModelWizard');
      this.Y.registerModel(this.ChangeDAOWizard, 'foam.apps.builder.wizard.ChangeDAOWizard');

      this.Y.set('mdToolbar', null);
    }
  ],
});
