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
  package: 'foam.apps.builder.kiosk',
  name: 'NewOrExistingWizard',
  extendsModel: 'foam.apps.builder.wizard.NewOrExistingWizard',

  requires: [
    'foam.apps.builder.kiosk.BasicInfoWizard',
    'foam.apps.builder.kiosk.ImportWizard',
  ],

  properties: [
    {
      name: 'nextViewFactory',
      lazyFactory: function() {
        return this.newViewFactory;
      },
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'newViewFactory',
      label: 'Create new kiosk app',
      defaultValue: 'foam.apps.builder.kiosk.BasicInfoWizard',
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'existingViewFactory',
      label: 'Import existing Chrome App Builder Version 1 app',
      defaultValue: {
        factory_: 'foam.apps.builder.kiosk.ImportWizard',
        appBuilderVersion: 1,
      },
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'existingViewFactory2',
      label: 'Import existing App Builder Version 2 app',
      defaultValue: {
        factory_: 'foam.apps.builder.kiosk.ImportWizard',
        appBuilderVersion: 2,
      },
    },
    {
      name: 'title',
      defaultValue: 'Create or Import Kiosk App',
    },
  ],

  methods: [ function onNext() {}, ],

  actions: [
    {
      name: 'nextAction',
      isEnabled: function() {
        return true;
      },
    }
  ],

  templates: [
    function contentHTML() {/*
      <div class="md-card-heading-content-spacer"></div>
      <div class="new-existing-wizard-dao-page-scroller">
        <div class="new-existing-wizard-dao-page">
          $$nextViewFactory{ model_: 'foam.ui.md.ChoiceRadioView',
            orientation: 'vertical',
            choices: [
              [this.newViewFactory, this.model_.NEW_VIEW_FACTORY.label],
              [this.existingViewFactory, this.model_.EXISTING_VIEW_FACTORY.label ],
              [this.existingViewFactory2, this.model_.EXISTING_VIEW_FACTORY2.label ],
            ]
          }
          <% if ( this.existingDAO ) { %>
            <div id="<%= this.id %>-container">
              $$existingDAO
            </div>
          <%  } %>
        </div>
      </div>
      <%
        if ( this.existingDAO ) {
          this.setClass('existing-hidden', function() { return self.nextViewFactory === self.newViewFactory; }, this.id+'-container');
          this.setClass('new-existing-wizard-dao-container', function() { return true; }, this.id+'-container');
        }
      %>
    */},
  ],
});
