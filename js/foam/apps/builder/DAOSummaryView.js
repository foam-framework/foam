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
      width: 100,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
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


  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-picker-view-name">
          <div class="md-model-picker-view-edit md-style-trait-standard">
            $$dao{ model_: 'foam.ui.md.TextFieldView', mode:'read-only', floatingLabel: false, inlineStyle: true }
          </div>
          <div class="md-model-picker-view-combo">
            $$edit{ model_: 'foam.ui.md.FlatButton' }
          </div>
        </div>
      </div>
    */},
    function CSS() {/*
      .md-model-picker-view {
      }
      .md-model-picker-view-name {
        display: flex;
        align-items: baseline;
      }
      .md-model-picker-view-title {
        font-size: 120%;
        color: #999;
      }
      .md-model-picker-view-edit {
        flex-grow: 0;
        padding-right: 24px;
      }
      .md-model-picker-view-combo {
        min-width: 200px;
      }
    */},
  ],

});
