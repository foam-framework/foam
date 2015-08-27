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
  name: 'PropertyWizard',
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
  ],

  actions: [
    {
      name: 'next',
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
      this.Y.registerModel(this.PopupChoiceView, 'foam.ui.ChoiceView');
    },

    function onBack() {
      this.dao && this.dao.put(this.data);
      this.SUPER();
    }
  ],

  templates: [
    function contentHTML() {/*
        <p class="md-style-trait-standard md-title">Create a new Property</p>
        <p class="md-style-trait-standard">Choose a name to describe the purpose,
        such as "first name", "catalogue number" or "home phone". Choose the type
        that most closely matches the value you expect, such as a number, text,
        yes/no, or web URL.
        </p>
        $$data{ model_: 'foam.meta.descriptor.MetaDescriptorView', metaEditPropertyTitle: '' }
    */},
  ],


});
