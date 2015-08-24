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
  extendsModel: 'foam.apps.builder.NewOrExistingWizard',

  requires: [
    'foam.apps.builder.questionnaire.ModelWizard',
    'foam.apps.builder.questionnaire.ModelPreviewWizard',
  ],

  imports: [
    'modelDAO',
  ],

  exports: [
    'editView',
    'innerEditView',
  ],

  properties: [
    {
      model_: 'ModelProperty',
      name: 'baseModel',
      help: 'The list is filtered to only include models that extend baseModel.',
      postSet: function() {
        if ( this.modelDAO ) {
          this.existingDAO = this.modelDAO.where(EQ(Model.EXTENDS_MODEL, this.baseModel.id));
        }
      }
    },
    {
      name: 'modelDAO',
      postSet: function(old,nu) {
        if ( this.baseModel ) {
          this.existingDAO = this.modelDAO.where(EQ(Model.EXTENDS_MODEL, this.baseModel.id));
        }
      },
    },
    {
      name: 'newViewFactory',
      label: 'Create a new Data Model',
      defaultValue: { factory_: 'foam.apps.builder.questionnaire.ModelWizard' },
    },
    {
      name: 'existingViewFactory',
      label: 'Use existing Data Model',
      defaultValue: function() { },
    },
    {
      name: 'nextViewFactory',
      defaultValueFn: function() { return this.newViewFactory; },
    },
    {
      name: 'selection',
      postSet: function(old,nu) {
        this.data.model = nu;
      }
    },
    {
      name: 'existingDAO',
      view: {
        factory_: 'foam.ui.md.DAOListView',
        rowView: 'foam.apps.builder.datamodels.ModelCitationView',
      }
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'editView',
      defaultValue: { factory_: 'foam.apps.builder.questionnaire.ModelPreviewWizard' },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'innerEditView',
      defaultValue: function() {},
    },
  ],



});
