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
  name: 'ModelPreviewWizard',
  extendsModel: 'foam.apps.builder.WizardPage',

  properties: [
    {
      name: 'data',
      adapt: function(old,nu) {
        return nu.deepClone();
      }
    },
    {
      name: 'nextViewFactory',
      defaultValue: null,
    },
  ],

  actions: [
    {
      name: 'next',
      label: 'Done with Preview',
    },
    {
      name: 'exit',
      isAvailable: function() { return false; }
    }
  ],

  methods: [
    function onNext() {
      // skip SUPER(), we don't want to save
    }
  ],

  templates: [
    function contentHTML() {/*
        <p class="md-style-trait-standard md-title">Preview</p>
        <p class="md-style-trait-standard">Here is a preview of
        <%= this.data.name %>
        </p>
        $$data{ model_: 'foam.meta.types.ModelEditView', mode: 'read-only' }
    */},
  ],


});
