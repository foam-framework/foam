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
  name: 'TestView',
  package: 'foam.apps.builder.model.ui',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.apps.builder.model.ui.InlineEditView',
    'StringProperty',
    'foam.ui.md.DAOListView',
  ],

  exports: ['testArray as dao'],

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'testArray',
      subType: 'Property',
      factory: function() {
        return [ this.StringProperty.create() ];
      }
    },
    {
      name: 'className',
      defaultValue: 'test-view',
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
        $$testArray{ model_: 'foam.ui.md.DAOListView',
          rowView: 'foam.apps.builder.model.ui.InlineEditView' }
      </div>
    */},
    function CSS() {/*
      .property-validate-view {
        display: flex;
        flex-direction: column;
        align-content: baseline;
        flex-grow: 1;
        width: 500px;
        height: 100%;
      }
    */},

  ]

});
