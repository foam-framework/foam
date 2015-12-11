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
  name: 'InlineView',
  package: 'foam.apps.builder.model.ui',
  extends: 'foam.ui.md.DetailView',

  requires: [
    'foam.ui.md.FlatButton',
    'foam.apps.builder.model.ui.PropertyView',
    'foam.apps.builder.model.ui.IntPropertyView',
    'foam.apps.builder.model.ui.FloatPropertyView',
    'foam.apps.builder.model.ui.StringPropertyView',
    'foam.apps.builder.model.ui.BooleanPropertyView',
    'IntProperty',
    'FloatProperty',
    'BooleanProperty',
    'StringProperty',
  ],

  imports: [
    'stack',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'inline-view',
    },
    {
      name: 'mode',
      defaultValue: 'read-only',
    },
    {
      name: 'label',
    },
    {
      name: 'prop',
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-subhead">
          $$label{
            model_: 'foam.ui.md.TextFieldView',
            floatingLabel: false,
            mode: 'read-only',
          }
        </div>
        $$data{ model_: this.prop.view || 'foam.apps.builder.model.ui.View',
                model: this.prop.model_ }
      </div>
    */},
    function CSS() {/*
      .inline-view {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        background: white;
      }
    */},

  ]

});
