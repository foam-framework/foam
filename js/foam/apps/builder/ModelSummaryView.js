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
  name: 'ModelSummaryView',
  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.wizard.WizardStackView',
  ],

  actions: [
    {
      name: 'edit',
      label: 'Change',
      width: 100,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
      ligature: 'edit',
      code: function() {
        var view = this.WizardStackView.create({
              firstPage: {
                factory_: 'foam.apps.builder.wizard.ChangeModelWizard',
                data$: this.data$,
          }});
        view.open();
      }
    },
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'md-model-picker-view',
    },
    {
      name: 'model'
    },
    {
      name: 'data',
      postSet: function(old,nu) {
        if (nu) this.model = nu.model;
      }
    }
  ],
  
  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-picker-view-name">
          <p class="md-style-trait-standard">Data Model:</p>
          $$model{ model_: 'foam.apps.builder.datamodels.ModelCitationView' }
          $$edit{ color: 'white' }
        </div>
      </div>
    */},
    function CSS() {/*
      .md-model-picker-view {
        margin: 16px;
        padding: 8px;
        background: #D33;
        box-shadow: 0px 2px 4px #999;
        color: white;
      }
    */},
  ],

});
