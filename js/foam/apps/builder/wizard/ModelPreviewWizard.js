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
  name: 'ModelPreviewWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

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
    {
      name: 'title',
      defaultValue: 'Preview',
    },
  ],

  actions: [
    {
      name: 'nextAction',
      isAvailable: function() { return false; }
    },
    {
      name: 'back',
      label: 'Done with Preview',
    }
  ],

  templates: [

    function instructionHTML() {/*
        <p>Here is a preview of
        <%= this.data.name %>
        </p>
    */},

    function contentHTML() {/*
      <div class="model-preview-wizard-list">
        $$data{ model_: 'foam.apps.builder.datamodels.meta.types.ModelEditView', mode: 'read-only' }
      </div>
    */},

    function CSS() {/*
      .model-preview-wizard-list {
        margin: 16px;
        display: flex;
        flex-grow: 1;
      }
    */},
  ],


});
