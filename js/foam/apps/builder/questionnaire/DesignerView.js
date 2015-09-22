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
  extendsModel: 'foam.apps.builder.DesignerView',

  traits: [
    'foam.metrics.ScreenViewTrait',
  ],

  requires: [
    'foam.apps.builder.questionnaire.ChangeDAOWizard',
    'foam.apps.builder.questionnaire.ChangeModelWizard',
    'foam.apps.builder.questionnaire.EditView',
    'foam.apps.builder.questionnaire.QuestionnaireView',
    'foam.apps.builder.templates.AppView',
    'foam.apps.builder.templates.PanelView',
  ],

  listeners: [
    {
      name: 'dataChange',
      code: function() {
        if (this.dataView) {
          // bind this better
          this.data.model.instance_.prototype_ = null;
          this.dataView.updateHTML();
        }
      }
    }
  ],

  properties: [
    {
      name: 'data',
      postSet: function(old, nu) {
        if (nu) {
          nu.addListener(this.dataChange);
        }
        if (old) {
          old.removeListener(this.dataChange);
        }
        this.data.model.instance_.prototype_ = null;
      },
    },
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
