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
  name: 'MetaDescriptorView',
  package: 'foam.meta.descriptor',

  requires: [
    'foam.ui.md.PopupChoiceView',
  ],

  extendsModel: 'foam.meta.types.EditView',

  properties: [
    {
      name: 'className',
      defaultValue: 'md-meta-descriptor-view',
    },
  ],
  
  methods: [
    function init() {
      this.SUPER();
      this.Y.registerModel(this.PopupChoiceView, 'foam.ui.ChoiceView');
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="meta-edit-heading md-style-trait-standard">
          $$metaEditPropertyTitle{ model_: foam.ui.TextFieldView, mode:'read-only' }
        </div>
        $$name
        $$model
      </div>
    */},
    function CSS() {/*
      .md-meta-descriptor-view {
        flex-grow: 1;
        padding: 10px;
      }
    */}
  ]

});

