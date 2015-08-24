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
  package: 'foam.apps.builder.datamodels',
  name: 'ModelCitationView',
  extendsModel: 'foam.ui.DetailView',

  imports: [
    'stack',
    'editView',
    'innerEditView',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'md-model-citation-view'
    },
  ],

  actions: [
    {
      name: 'editButton',
      label: 'Edit',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
      code: function() {
        this.stack.pushView(this.editView({
          data: this.data,
          innerView: this.innerEditView
        }, this.Y));
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class='md-model-citation-view-name'>
          $$id{ model_: 'foam.ui.md.TextFieldView', mode:'read-only', floatingLabel: false }
        </div>
        <div class='md-style-trait-standard'>
          $$editButton
        </div>
      </div>
    */},
    function CSS() {/*
      .md-model-citation-view {
        display: flex;
        align-items: center;
      }
      .md-model-citation-view-name {
        flex-grow: 1;
      }
    */},
  ],

});
