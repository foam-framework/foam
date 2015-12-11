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
  name: 'NewOrExistingWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.ui.md.ChoiceRadioView',
    'foam.apps.builder.dao.DAOFactoryView',
  ],

  exports: [
    'selection'
  ],

  properties: [
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'newViewFactory',
      label: 'New',
      defaultValue: null,
    },
    {
      model_: 'foam.apps.builder.wizard.WizardViewFactoryProperty',
      name: 'existingViewFactory',
      label: 'Existing',
      defaultValue: null,
    },
    {
      name: 'existingDAO',
      documentation: 'The list of existing options to display. If this DAO is empty, the next(new) option will immediately be executed.',
      postSet: function(old,nu) {
        if ( nu ) {
          nu.select(COUNT())(function(c) {
            this.hidden = ! c.count; // if no choices, don't show this page, go straight to 'new thing' page
          }.bind(this));

        }
      },
    },
    {
      name: 'title',
      defaultValue: 'New or Existing',
    },
    {
      name: 'scrollContent',
      defaultValue: true,
    },
  ],

  actions: [
    {
      name: 'nextAction',
      isEnabled: function() {
        // must be creating new OR have selected something
        this.nextViewFactory;
        this.existingViewFactory;
        this.selection;
        return (this.nextViewFactory !== this.existingViewFactory || this.selection);
      },
    }
  ],

  templates: [

    function instructionHTML() {/*
      <p>Choose one of the following options:</p>
    */},

    function contentHTML() {/*
      <div class="md-card-heading-content-spacer"></div>
      <div class="new-existing-wizard-dao-page-scroller">
        <div class="new-existing-wizard-dao-page">
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
      </div>
      <%
        if ( this.existingDAO ) {
          this.setClass('existing-hidden', function() { return self.nextViewFactory === self.newViewFactory; }, this.id+'-container');
          this.setClass('new-existing-wizard-dao-container', function() { return true; }, this.id+'-container');
        }
      %>
    */},
    function CSS() {/*
      .new-existing-wizard-dao-page {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        padding: 0 24px;
      }
      .new-existing-wizard-dao-page-scroller {
        overflow-y: hidden;
        overflow-x: hidden;
        flex-grow: 99999;
        flex-shrink: 1;
        display: flex;
      }

      .new-existing-wizard-dao-container {
        flex-grow: 1;
        transition: opacity 300ms ease;
        overflow-y: auto;
      }

      .existing-hidden {
        opacity: 0;
        pointer-events: none;
        height: 0;
      }

      @media (max-width: 600px) {
        .new-existing-wizard-dao-container {
          padding: 8px;
        }
      }

      @media (min-width: 600px) {
        .new-existing-wizard-dao-container {
          padding: 0px 8px 16px 16px;
        }
      }

      @media (max-width: 1000px) {
        .new-existing-wizard-dao-container {
          overflow-y: hidden;
          flex-shrink: 1;
        }
        .new-existing-wizard-dao-page {
          flex-direction: column;
        }
        .new-existing-wizard-dao-page-scroller {
          display: block;
          overflow-y: auto;
          border-top: 1px solid rgba(0,0,0,0.25);
          border-bottom: 1px solid rgba(0,0,0,0.25);
          flex-basis: 0;
        }

      }


    */},
  ],


});
