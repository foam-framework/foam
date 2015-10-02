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
  package: 'foam.apps.builder.administrator',
  name: 'PickAppWizard',
  extendsModel: 'foam.apps.builder.wizard.WizardPage',

  requires: [
    'foam.apps.builder.AppConfig',
    'foam.ui.md.DAOListView',
    'foam.apps.builder.AppConfigCitationView',
  ],

  imports: [
    'masterAppDAO',
  ],
  exports: [
    'selection$'
  ],

  properties: [
    {
      name: 'existingDAO',
      documentation: 'Administratable apps.',
      lazyFactory: function() {
        return this.masterAppDAO.where(HAS(this.AppConfig.DATA_CONFIGS));
      },
      postSet: function(old,nu) {
        if ( nu ) {
          nu.select(COUNT())(function(c) {
            // no apps, show a message
            this.emptyList = ! c.count;
          }.bind(this));
        }
      },
      view: {
        factory_: 'foam.ui.md.DAOListView',
        rowView: 'foam.apps.builder.AppConfigCitationView',
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'emptyList',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( old !== nu && this.$ ) this.updateHTML();
        if ( nu ) {
          // remove the partially complete Admin app
          this.dao && this.dao.remove(this.data);
        }
      }
    },
    {
      name: 'title',
      defaultValue: 'Pick an App',
    },
    {
      name: 'scrollContent',
      defaultValue: true,
    },
    {
      name: 'selection',
    }
  ],

  methods: [
    function onNext() {
      this.data.targetAppConfig = this.selection;
      this.SUPER();
    },
  ],

  actions: [
    {
      name: 'nextAction',
      isEnabled: function() {
        // must have selected something
        return this.selection;
      },
    }
  ],

  templates: [

    function instructionHTML() {/*
      <% if ( ! this.emptyList ) { %>
        <p>Choose an existing app to manage.</p>
      <% } else { %>
        <p>You have no apps that use a Data Source. Create an app, such as a
        Questionnaire or Events app.</p>
      <% } %>

      <p>Only apps that have a Data Source
      can be used with an Administration App.</p>
    */},

    function contentHTML() {/*
      <div class="md-card-heading-content-spacer"></div>
      <div class="pick-app-wizard-page-scroller">
        <div class="pick-app-wizard-page">
          <div id="<%= this.id %>-container">
            $$existingDAO
          </div>
        </div>
      </div>
      <%
      this.setClass('pick-app-wizard-container', function() { return true; }, this.id+'-container');
      %>
    */},
    function CSS() {/*
      .pick-app-wizard-page {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        padding: 0 24px;
      }
      .pick-app-wizard-page-scroller {
        overflow-y: hidden;
        overflow-x: hidden;
        flex-grow: 99999;
        flex-shrink: 1;
        display: flex;
      }

      .pick-app-wizard-container {
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
        .pick-app-wizard-container {
          padding: 8px;
        }
      }

      @media (min-width: 600px) {
        .pick-app-wizard-container {
          padding: 0px 8px 16px 16px;
        }
      }

      @media (max-width: 1000px) {
        .pick-app-wizard-container {
          overflow-y: hidden;
          flex-shrink: 1;
        }
        .pick-app-wizard-page {
          flex-direction: column;
        }
        .pick-app-wizard-page-scroller {
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
