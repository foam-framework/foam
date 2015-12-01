/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


CLASS({
  name: 'PropertyEditView',
  package: 'foam.apps.builder.model.ui',
  extends: 'foam.ui.md.DetailView',

  requires: [
  ],

  imports: [
    'dao', // the property array of our model
    'stack',
    'mdToolbar as toolbar',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'property-edit-view',
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
    },
  ],

  actions: [

  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <% this.propertyEditHTML(out) %>
      </div>
    */},
    function propertyEditHTML() {/*
      <div>Property Editor</div>
    */},
    function CSS() {/*
      .property-edit-view {
        display: flex;
        flex-direction: column;
        align-content: baseline;
        flex-grow: 1;
        background: white;
      }
    */},

  ]

});
