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
  name: 'BrowserView',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'foam.browser.BrowserConfig',
    'foam.browser.ui.StackView',
    'foam.ui.DAOListView',
    'foam.ui.TextFieldView',
  ],

  exports: [
    'selection$',
    'stack',
  ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'listView',
      defaultValue: 'foam.ui.DAOListView',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'detailView',
      defaultValue: 'foam.ui.DetailView',
    },
    {
      name: 'selection',
      documentation: 'Used in the list view.',
      postSet: function(old, nu) {
        // TODO(braden): This is a hack, exposing the index-specific methods on
        // the StackView.
        if (nu) {
          this.stack.pushView_(0, this.detailView({ data: nu }, this.Y));
        } else {
          this.stack.popView_(1);
        }
      }
    },
    {
      name: 'stack',
      factory: function() {
        var list = this.listView({ data$: this.data.filteredDAO$ }, this.Y);
        var stack = this.StackView.create();
        stack.pushView(list);
        return stack;
      }
    },
  ],

  templates: [
    function CSS() {/*
      .browser {
      }
      .menu {
        background: #e9e9e9;
      }
      .menu div {
        padding: 8px 12px;
      }
      .search {
        margin: 8px;
      }
      .search input {
        padding: 6px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        <div class="menu">
          <%= this.data.menuFactory() %>
        </div>
        <div class="main">
          <div class="search">
            $$search{ placeholder: 'Search' }
          </div>
          <div class="browser-stack">
            <%= this.stack %>
          </div>
        </div>
      </div>
    */},
  ],
});
