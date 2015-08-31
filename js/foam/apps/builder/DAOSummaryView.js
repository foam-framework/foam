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
  name: 'DAOSummaryView',
  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.wizard.WizardStackView',
  ],

  actions: [
    {
      name: 'edit',
      label: 'Change',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
      ligature: 'edit',
      code: function() {
        var view = this.WizardStackView.create({
              firstPage: {
                factory_: 'foam.apps.builder.wizard.ChangeDAOWizard',
                data$: this.data$,
          }});
        view.open();
      }
    },
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'md-dao-picker-view',
    },
    {
      name: 'dao'
    },
    {
      name: 'data',
      postSet: function(old,nu) {
        if (nu) this.dao = nu.dao;
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-picker-view-name">
          <p class="md-style-trait-standard">Data Source:</p>
          $$dao{ model_: 'foam.apps.builder.dao.DAOFactoryView' }
          $$edit{ color: 'white' }
        </div>
      </div>
    */},
    function CSS() {/*
      .md-dao-picker-view {
        margin: 16px;
        padding: 8px;
        background: #77F;
        box-shadow: 0px 2px 4px #999;
        color: white;
      }
      .md-model-picker-view-name {
        align-items: baseline;
        display: flex;
        flex-direction: row;
      }
      .md-model-picker-view-name .md-button {
        margin: 0px;
      }
      .md-model-picker-view-name > :nth-child(1){ min-width: 8em; flex-grow: 0;}
      .md-model-picker-view-name > :nth-child(2){ min-width: 12em; flex-grow: 1; }
      .md-model-picker-view-name > :nth-child(3){ flex-grow: 0; align-self: flex-start; }
    */},
  ],

});
