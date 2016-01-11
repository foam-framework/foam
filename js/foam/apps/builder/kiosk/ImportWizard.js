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
  name: 'ImportWizard',
  extends: 'foam.apps.builder.wizard.WizardPage',

  imports: [
    'importExportManager$',
  ],

  requires: [
    'foam.apps.builder.ImportExportFlow',
    'foam.apps.builder.ImportExportFlowView',
    'foam.apps.builder.kiosk.ChromeWizard',
  ],

  properties: [
    'importExportManager',
    {
      name: 'title',
      defaultValue: 'Import existing app',
    },
    {
      type: 'Int',
      name: 'appBuilderVersion',
      defaultValue: 1,
    },
    {
      name: 'importFlow',
      lazyFactory: function() {
        return this.ImportExportFlow.create({
          config$: this.data$,
          dao$: this.dao$,
          actionName: this.getActionName(),
          title: 'Import App',
        }, this.Y);
      },
    },
  ],

  methods: [
    function getActionName() {
      return 'importV' + this.appBuilderVersion.toString() + 'App';
    },
    function onCancel() {
      this.SUPER();
      // remove the unfinished app. The user must have backed out of
      // every other wizard page to get back here.
      this.dao && this.dao.remove(this.data);
    },

  ],

  actions: [
    {
      name: 'chooseFolder',
      code: function() {
        var view = this.ImportExportFlowView.create({
          data: this.importFlow,
          showHeader: false,
          showFooter: false,
        }, this.Y);
        var content = this.X.$(this.id + '-centered-content');
        content.innerHTML = view.toHTML();
        view.initHTML();
        this.importExportManager[this.getActionName()](this.importFlow);
      },
    },
    {
      name: 'nextAction',
      isEnabled: function() {
        this.importFlow;
        return this.importFlow && (this.importFlow.state === 'FAILED' ||
            this.importFlow.state === 'COMPLETED');
      },
    },
  ],

  templates: [
    function instructionHTML() {/*
      <span>
        Click the button below to select the folder that contains the unpackaged
        source of your <% if ( this.appBuilderVersion === 1 ) { %>Chrome App
        Builder Version 1<% } else { %>App Builder Version 2<% } %> app. App
        Builder will automatically lookup your app configuration
        <% if ( this.appBuilderVersion === 1 ) { %>and upgrade it to App Builder
        2.0<% } %>.
      </span>
    */},
    function contentHTML() {/*
      <div id="%%id-centered-content" class="centered-content">
        $$chooseFolder
      </div>
    */},
    function CSS() {/*
      .centered-content {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    */},
  ],
});
