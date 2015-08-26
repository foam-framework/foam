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
  extendsModel: 'foam.ui.DetailView',

  requires: [
  ],

  methods: [
  ],

  properties: [
  ],

  actions: [
    {
      name: 'edit',
      label: 'Edit',
      width: 100,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
      code: function() {
        var view = X.lookup('foam.ui.md.PopupView').create({
          width: '80%',
          height: '80%',
          delegate: function(args, X) {
            var stack = X.lookup('foam.browser.ui.StackView').create({
                maxVisibleViews: 1,
                noDecoration: true,
                transition: 'fade',
            }, X);
            var Y = X.sub({ stack: stack });
            stack.pushView(
              X.lookup('foam.apps.builder.questionnaire.AppWizard').create({
                data: newObj,
                minWidth: 500,
              }, Y)
            );
            return stack;
          }
        }, X.sub({ dao: this.data.dao }));
        view.open();
      }
    },
    {
      name: 'add',
      label: 'Create New',
      //iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAH0lEQVQ4y2NgGAUw8B8IRjXgUoQLUEfDaDyQqmF4AwADqmeZrHJtnQAAAABJRU5ErkJggg==',
      isAvailable: function() {
        return !! this.newItemDescriptor;
      },
      code: function() {
        this.Y.registerModel(this.PopupChoiceView, 'foam.ui.ChoiceView');
        var edit = this.UpdateDetailView.create({
          data: this.newItemDescriptor.create(),
          exitOnSave: true,
          innerView: 'foam.meta.descriptor.MetaDescriptorView',
        }, this.Y.sub({
          dao: { put: this.putNew.bind(this) }
        }));
        this.stack.pushView(edit);
      }
    },
  ],

  listeners: [
    {
      name: 'selectionChange',
      code: function(obj, topic, old, nu) {
        if (nu) {
          this.data = nu;
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-picker-view-name">
          <div class="md-model-picker-view-edit md-style-trait-standard">
            $$modelLabel{ model_: 'foam.ui.md.TextFieldView', mode:'read-only', floatingLabel: false, inlineStyle: true }
          </div>
          <div class="md-model-picker-view-combo">
            $$modelName{
              model_: 'foam.ui.md.PopupChoiceView',
              objToChoice: this.modelToChoice,
              dao: this.filteredDAO,
              autoSetData: false,
            }
          </div>
          <div class="md-model-picker-view-combo">
            $$edit{ model_: 'foam.ui.md.FlatButton' }
          </div>
          <div class="md-model-picker-view-combo">
            $$add{ model_: 'foam.ui.md.FlatButton' }
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
