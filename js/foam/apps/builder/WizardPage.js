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
  name: 'WizardPage',
  extendsModel: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.md.UpdateDetailView',
  ],

  imports: [ 'stack', 'dao' ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'nextViewFactory',
    },
  ],

  actions: [
    {
      name: 'next',
      label: 'Next',
      action: function() {
        this.dao && this.dao.put(this.data);
        if ( this.nextViewFactory ) {
          this.stack.replaceView(
            this.UpdateDetailView.create({
              data: this.data,
              innerView: this.nextViewFactory,
              immutable: true,
            })
          );
        } else {
          // no next view, so we're finished
          this.stack.popView();
        }
      }
    }
  ],

  templates: [
    function contentHTML() {/*

    */},
    function toHTML() {/*
      <wizard id="%%id" <%= this.cssClassAttr() %>>
        <div class="wizard-content">
          <% this.contentHTML(out); %>
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
