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
  package: 'foam.apps.builder',
  name: 'NewOrExistingWizard',
  extendsModel: 'foam.apps.builder.WizardPage',

  requires: [
    'foam.ui.md.ChoiceRadioView',
    'foam.apps.builder.dao.DAOFactoryView',
  ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'newViewFactory',
      label: 'New',
      defaultValue: null,
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'existingViewFactory',
      label: 'Existing',
      defaultValue: null,
    },
    {
      name: 'existingDAO',
      documentation: 'The list of existing options to display',
    },
  ],

  actions: [
    {
      name: 'next',
      labelFn: function() {
        this.nextViewFactory; //TODO: add i18n "Next: %1" to the label
        return ( this.nextViewFactory === this.newViewFactory ) ?
          this.model_.NEW_VIEW_FACTORY.label : this.model_.EXISTING_VIEW_FACTORY.label ;
      },
    }
  ],

  templates: [
    function contentHTML() {/*
      <div class="new-existing-wizard-dao-page">
        <p class="md-style-trait-standard md-title">New or Existing</p>
        <p class="md-style-trait-standard">Choose one of the following options:
        </p>
        $$nextViewFactory{ model_: 'foam.ui.md.ChoiceRadioView',
          orientation: 'vertical',
          choices: [
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
        this.setClass('existing-hidden', function() { return self.nextViewFactory === self.newViewFactory; }, this.id+'-container');
        this.setClass('new-existing-wizard-dao-container', function() { return true; }, this.id+'-container');
      %>
    */},
    function CSS() {/*
      .new-existing-wizard-dao-page {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      .new-existing-wizard-dao-container {
        flex-grow: 1;
        overflow-y: scroll;
        transition: opacity 300ms ease;
      }

      .existing-hidden {
        opacity: 0.4;
        pointer-events: none;
      }

      @media (max-width: 600px) {
        .new-existing-wizard-dao-container {
          padding: 8px;
        }
      }

      @media (min-width: 600px) {
        .new-existing-wizard-dao-container {
          padding: 0px 8px 16px 60px;
        }
      }
    */},
  ],


});
