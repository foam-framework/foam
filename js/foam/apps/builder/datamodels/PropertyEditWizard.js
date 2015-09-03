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
  package: 'foam.apps.builder.datamodels',
  name: 'PropertyEditWizard',
  extendsModel: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.ui.md.PopupChoiceView',
  ],

  imports: [ 'dao' ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: null,
    },
    {
      name: 'title',
      defaultValue: 'Edit',
    },
  ],

  actions: [
    {
      name: 'nextAction',
      isAvailable: function() { return false; },
    },
    {
      name: 'back',
      label: 'Continue editing Model',
    }
  ],


  methods: [
    function init() {
      this.SUPER();
      // put old EditView back
      this.Y.registerModel(this.X.ModelWizardEditView_foam_meta_types_EditView, 'foam.meta.types.EditView')
      this.Y.registerModel(this.PopupChoiceView, 'foam.ui.ChoiceView');
    },

  ],

  templates: [
    function contentHTML() {/*
        $$data{ model_: 'foam.meta.types.EditView', model: this.data.model_ }
    */},
  ],


});
