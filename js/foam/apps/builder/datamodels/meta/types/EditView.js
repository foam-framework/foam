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
  name: 'EditView',
  package: 'foam.apps.builder.datamodels.meta.types',
  extends: 'foam.ui.md.DetailView',
  traits: [
    'foam.ui.md.ToolbarViewTrait'
  ],

  imports: [
    'dao',
    'metaEditModelTitle',
    'metaEditPropertyTitle',
    'mode',
    'stack',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'meta-edit-view',
    },
    {
      name: 'mode',
      defaultValue: 'read-write',
    },
    {
      type: 'Boolean',
      name: 'showHeader',
      defaultValue: true,
    },
  ],

  actions: [
    {
      name: 'delete',
      help: 'Delete this item.',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAO0lEQVQ4y2NgGPwgUSHxQeJ/KHyQqIBP6X/ckDoayHE/qeaPahjVgEvDK6waXuDW4J/4ElN5ou8gz/MAREwU2Wrzn1YAAAAASUVORK5CYII=',
      ligature: 'delete',
      isAvailable: function() { return (this.mode == 'read-write') && (this.dao && this.dao.remove) },
      code: function() {
        if (this.dao && this.dao.remove) {
          this.dao.remove(this.data);
          // our parent view should now destroy this view
          this.stack && this.stack.popView();
        }
      }
    }
  ],

  templates: [
    function headerHTML(out) {/*
      <% if ( this.showHeader ) { %>
      <div class="meta-edit-heading md-style-trait-standard">
        <div class="md-title">$$name{
          model_: 'foam.ui.md.TextFieldView',
          inlineStyle: true,
          floatingLabel: false,
        }</div>
        <div class="meta-edit-view-right-title-icon">$$delete</div>
      </div>
      <% } %>
    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
          $$label{ mode: this.mode }
      </div>
    */},
    function CSS() {/*
      .meta-edit-view {
        display: flex;
        flex-direction: column;
        align-content: baseline;
        flex-grow: 1;
        background: white;
      }
      .meta-edit-heading {
        display: flex;
        align-items: baseline;
      }
      .meta-edit-heading .md-title {
        flex-grow: 1;
      }
      .meta-edit-view-right-title-icon {
        flex-shrink: 0;
        padding-left: 8px;
      }
      .meta-edit-view .md-card {
        flex-grow: 1;
      }
    */},

  ]

});
