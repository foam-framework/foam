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
  package: 'foam.apps.builder.questionnaire',
  name: 'AppWizard',
  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.questionnaire.DAOWizard',
    'foam.ui.md.UpdateDetailView',
  ],

  imports: [ 'stack' ],

  properties: [

  ],

  actions: [
    {
      name: 'next',
      label: 'Next: Choose Data Source',
      action: function() {
        this.stack.replaceView(
          this.UpdateDetailView.create({
            data: this.data,
            innerView: {
              factory_: 'foam.apps.builder.questionnaire.DAOWizard',
              //data: this.data,
            }
          })
        );
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <wizard id="%%id" <%= this.cssClassAttr() %>>
        <div class="wizard-content">
          <p class="md-style-trait-standard">Choose a name for your new Questionnaire. The name should
            be a few words to indicate the purpose, such as &quot;new patient&quot;
            or &quot;customer service survey&quot;
          </p>
          $$appName
        </div>
        <div class="wizard-footer">
          <div class="wizard-footer-items">
            $$next{ model_: 'foam.ui.md.FlatButton' }
          </div>
        </div>
      </wizard>
    */},
    function CSS() {/*
      wizard {
        padding: 8px;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }

      wizard .wizard-content {
        flex-grow: 1;
      }
      wizard .wizard-footer {
        flex-grow: 0;
        display: flex;
        flex-direction: row;
        align-items: baseline;
        align-content: space-between;
        justify-content: flex-end;
      }
      wizard .wizard-footer-items {
        flex-grow: 0;
      }

    */},
  ],


});
