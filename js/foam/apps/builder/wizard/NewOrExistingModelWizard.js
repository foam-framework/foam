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
  package: 'foam.apps.builder.wizard',
  name: 'NewOrExistingModelWizard',
  extendsModel: 'foam.apps.builder.wizard.NewOrExistingWizard',

  requires: [
    'foam.apps.builder.wizard.ModelWizard',
    'foam.apps.builder.wizard.ModelPreviewWizard',
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
      name: 'data',
      postSet: function(old,nu) {
        if ( nu.baseModelId ) this.baseModel = nu.baseModelId;
      }
    },
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
      defaultValue: { factory_: 'foam.apps.builder.wizard.ModelWizard' },
    },
    {
      name: 'existingViewFactory',
      label: 'Copy an existing Data Model',
      defaultValue: null,
    },
    {
      name: 'nextViewFactory',
      lazyFactory: function() { return this.newViewFactory; },
    },
    {
      name: 'selection',
    },
    {
      name: 'existingDAO',
      view: {
        factory_: 'foam.ui.md.DAOListView',
        rowView: 'foam.apps.builder.datamodels.ModelCitationView',
      }
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'editView',
      defaultValue: { factory_: 'foam.apps.builder.wizard.ModelPreviewWizard' },
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'innerEditView',
      defaultValue: function() {},
    },
  ],

  methods: [
    function onNext() {
      this.SUPER();
      if ( this.selection && this.nextViewFactory === this.existingViewFactory ) {
        this.data.getDataConfig().model = this.selection;
      }
    }
  ],


});
