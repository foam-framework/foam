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
  package: 'foam.browser.ui',
  name: 'DAOController',
  extends: 'foam.ui.View',
  requires: [
    'foam.ui.DAOListView',
    'foam.ui.md.TextFieldView',
    'foam.ui.md.UpdateDetailView',
  ],
  imports: [
    'stack',
  ],
  exports: [
    'data as dao',
    'selection$',
  ],

  properties: [
    {
      type: 'ViewFactory',
      name: 'newView',
      documentation: 'The view used for creating new instances. Will be ' +
          'pushed onto the stack view. Defaults to $$DOC{ref:".editView"}.',
      defaultValueFn: function() { return this.editView; }
    },
    {
      type: 'ViewFactory',
      name: 'innerNewView',
      documentation: 'The view used as the inner view (where relevant) of ' +
          'the creation view. Defaults to $$DOC{ref:".innerEditView"}.',
      defaultValueFn: function() { return this.innerEditView; }
    },
    {
      type: 'ViewFactory',
      name: 'editView',
      documentation: 'The view used for editing selected items. Will be ' +
          'pushed onto the stack view. Defaults to ' +
          '$$DOC{ref:"foam.ui.md.UpdateDetailView"}. $$DOC{ref:".innerEditView"} ' +
          'will be passed the innerView, if one exists on this view.',
      defaultValue: 'foam.ui.md.UpdateDetailView'
    },
    {
      type: 'ViewFactory',
      name: 'innerEditView',
      documentation: 'The view used as the inner view (where relevant) of ' +
          'the edit view. Defaults to $$DOC{ref:"foam.ui.md.DetailView"}.',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      type: 'ViewFactory',
      name: 'rowView',
      documentation: 'The view used the render each item from the DAO.',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      name: 'selection',
    },
    {
      name: 'label',
      defaultValueFn: function() { return capitalize(this.name); },
      mode: 'read-only',
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        floatingLabel: false
      }
    },
    {
      name: 'name',
    },
    {
      name: 'className',
      defaultValue: 'dao-controller'
    },
  ],

  actions: [
    {
      name: 'add',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAHUlEQVR4AWNAgFHwHwhHNWBVhBtSqgETjMbDKAAA6iwzzdTyG+0AAAAASUVORK5CYII=',
      code: function() {
        var newObj = this.data.model.create();
        this.stack.pushView(this.newView({
          data: newObj,
          innerView: this.innerNewView
        }, this.Y.sub({ dao: this.data })));
      }
    },
  ],

  listeners: [
    {
      name: 'onRowClick',
      code: function() {
        this.data.find(this.selection.id, {
          put: function(obj) {
            this.stack.pushView(this.editView({
              data: obj,
              innerView: this.innerEditView
            }, this.Y));
          }.bind(this)
        });
      }
    }
  ],

  templates: [
    function CSS() {/*
      .dao-controller {
      }
      .dao-controller-header {
        align-items: center;
        display: flex;
        padding-right: 12px;
      }
      .dao-controller-header .md-text-field-read-only {
        font-size: 16px;
      }
      .dao-controller-body {
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <div class="dao-controller-header">
          $$label{ extraClassName: 'expand' }
          $$add
        </div>
        <div class="dao-controller-body">
          <%
            var list = this.DAOListView.create({
              data: this.data,
              rowView: this.rowView
            }, this.Y);
            out(list);
            list.subscribe(list.ROW_CLICK, this.onRowClick);
          %>
        </div>
      </div>
    */},
  ]
});
