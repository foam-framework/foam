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
  name: 'ChangeModelWizard',
  extends: 'foam.apps.builder.wizard.NewOrExistingModelWizard',

  properties: [
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'editViewFactory',
      label: 'Edit the current Data Model',
      defaultValue: { factory_: 'foam.apps.builder.wizard.ModelWizard' },
    },
    {
      name: 'nextViewFactory',
      lazyFactory: function() { return this.editViewFactory; },
    },
  ],

  methods: [
    function onNext() {
      if ( this.nextViewFactory === this.newViewFactory ) {
        this.data.resetModel();
      }
      this.SUPER();
    }
  ],

  templates: [
    function contentHTML() {/*
      <div class="md-card-heading-content-spacer"></div>
      <div class="new-existing-wizard-dao-page-scroller">
      <div class="new-existing-wizard-dao-page">
        <% if ( this.existingDAO ) { %>
          $$nextViewFactory{ model_: 'foam.ui.md.ChoiceRadioView',
            orientation: 'vertical',
            choices: [
              [this.editViewFactory, this.model_.EDIT_VIEW_FACTORY.label],
              [this.existingViewFactory, this.model_.EXISTING_VIEW_FACTORY.label ],
            ]
          }
        <% } else { %>
          <p>Click Next to change your model, or cancel to leave it unchanged.</p>
        <% } %>
        <% if ( this.existingDAO ) { %>
          <div id="<%= this.id %>-container">
            $$existingDAO
          </div>
        <%  } %>
      </div>
      </div>
      <%
        if ( this.existingDAO ) {
          this.setClass('existing-hidden', function() { return self.nextViewFactory !== self.existingViewFactory; }, this.id+'-container');
          this.setClass('new-existing-wizard-dao-container', function() { return true; }, this.id+'-container');
        }
      %>
    */},
  ],

});
