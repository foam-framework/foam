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
    'foam.ui.md.Toolbar',
  ],

  imports: [ 'dao' ],
  exports: [ 'toolbar as mdToolbar' ],

  properties: [
    {
      name: 'nextViewFactory',
      defaultValue: null,
    },
    {
      type: 'foam.ui.md.Toolbar',
      name: 'toolbar',
    },
    {
      name: 'title',
      defaultValueFn: function() { return this.data.name; }
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

      this.toolbar = this.Toolbar.create({
          data$: this.data$,
          title$: this.title$,
          hideOwnActions: true,
      }, this.Y);
      this.Y.set('mdToolbar', this.toolbar);
    },

  ],

  templates: [
    function titleHTML() {/* */},
    function contentHTML() {/*
        %%toolbar
        $$data{ model_: 'foam.meta.types.EditView', model: this.data.model_, showHeader: false }
    */},
  ],


});
