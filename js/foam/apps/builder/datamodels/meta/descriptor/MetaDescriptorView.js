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
  package: 'foam.apps.builder.datamodels.meta.descriptor',

  requires: [
    'foam.ui.md.PopupChoiceView',
    'foam.ui.md.DAOListView',
  ],

  exports: [
    'selection',
  ],

  extends: 'foam.apps.builder.datamodels.meta.types.EditView',

  properties: [
    {
      name: 'className',
      defaultValue: 'md-meta-descriptor-view',
    },
    {
      name: 'selection',
      postSet: function(old,nu) {
        if ( nu && this.data ) {
          this.data.model = nu.id;
        }
      }
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
      <% if ( this.data.model_.NAME ) { %>
        <div class="name-editor">
          $$name
        </div>
      <% } %>
        <div class="md-card-heading-content-spacer"></div>
        <div class="scroll-container">
          $$selectionsDAO
        </div>
      </div>
    */},
    function CSS() {/*
      .md-meta-descriptor-view {
        flex-grow: 9999999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .md-meta-descriptor-view .name-editor {
        padding: 0 24px;
      }

      .md-meta-descriptor-view .scroll-container {
        position: relative;
        flex-grow: 1;
        overflow-y: auto;
        overflow-x: hidden;
        background-color: #e9e9e9;
        border-top: 1px solid rgba(0,0,0,0.25);
        border-bottom: 1px solid rgba(0,0,0,0.25);
        padding: 0 24px;
      }
      .md-meta-descriptor-view .scroll-container > :first-child {
        width: 100%;
        overflow-y: hidden;
        overflow-x: hidden;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
    */}
  ]

});
