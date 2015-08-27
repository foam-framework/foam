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
  extendsModel: 'foam.apps.builder.wizard.NewOrExistingModelWizard',

  properties: [
    {
      name: 'newViewFactory',
      label: 'Create a new Data Model',
      defaultValue: { factory_: 'foam.apps.builder.wizard.ModelWizard' },
    },
    {
      name: 'existingViewFactory',
      label: 'Use existing Data Model',
      defaultValue: null, //function() { },
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'editViewFactory',
      label: 'Edit the current Data Model',
      defaultValue: { factory_: 'foam.apps.builder.wizard.ModelWizard' },
    },
    {
      name: 'nextViewFactory',
      defaultValueFn: function() { return this.editViewFactory; },
    },
  ],

  actions: [
    {
      name: 'next',
      labelFn: function() {
        this.nextViewFactory;
        this.newViewFactory;
        this.existingViewFactory;
        this.editViewFactory;
        return ( this.nextViewFactory === this.newViewFactory ) ?
          this.model_.NEW_VIEW_FACTORY.label :
            ( this.nextViewFactory === this.editViewFactory ) ?
              this.model_.EDIT_VIEW_FACTORY.label : this.model_.EXISTING_VIEW_FACTORY.label;
      },
    }
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
      <div class="new-existing-wizard-dao-page">
        $$nextViewFactory{ model_: 'foam.ui.md.ChoiceRadioView',
          orientation: 'vertical',
          choices: [
            [this.editViewFactory, this.model_.EDIT_VIEW_FACTORY.label],
            [this.newViewFactory, this.model_.NEW_VIEW_FACTORY.label],
            [this.existingViewFactory, this.model_.EXISTING_VIEW_FACTORY.label ],
          ]
        }
        <% if ( this.existingDAO ) { %>
          <div id="<%= this.id %>-container">
            $$existingDAO
          </div>
        <%  } %>
      </div>
      <%
        this.setClass('existing-hidden', function() { return self.nextViewFactory !== self.existingViewFactory; }, this.id+'-container');
        this.setClass('new-existing-wizard-dao-container', function() { return true; }, this.id+'-container');
      %>
    */},
  ],

});
