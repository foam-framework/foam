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

// TODO: Take auto-complete information from autocompleter in Property.
CLASS({
  name: 'AutocompleteListView',
  package: 'foam.ui.md',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.md.AddRowView',
    'foam.ui.md.ToolbarCSS'
  ],
  imports: [ 'stack' ],
  exports: [
    'acRowView as rowView',
    'removeRowFromList'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(oldValue, newValue) {
        this.updateHTML();
      }
    },
    {
      name: 'srcDAO',
      documentation: 'Optional DAO to use for adding new rows.'
    },
    {
      name: 'queryFactory'
    },
    {
      name: 'prop'
    },
    {
      name: 'label',
      defaultValueFn: function() { return this.prop ? this.prop.label : ''; }
    },
    {
      type: 'ViewFactory',
      name: 'acRowView',
      defaultValue: 'foam.ui.md.DefaultACRowView'
    },
    {
      type: 'ViewFactory',
      name: 'rowView',
      defaultValue: 'DefaultRowView'
    },
    {
      name: 'inline',
      documentation: 'When true, no header is displayed.',
      defaultValue: false
    },
    {
      name: 'className',
      defaultValueFn: function() {
        return 'md-autocomplete-list ' + (Array.isArray(this.data) ? 'array' : 'single');
      }
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    }
  ],

  templates: [
    // TODO: cleanup CSS
    function CSS() {/*
      .md-autocomplete-list {
      }
      .md-autocomplete-list-row {
        align-items: center;
        display: flex;
        height: 72px;
        justify-content: space-between;
        line-height: 48px;
        padding: 4px 0 4px 8px;
      }

      .md-autocomplete-list-inline-header {
        align-items: center;
        display: flex;
      }
      .md-autocomplete-list-inline-header .text {
        color: #999;
        flex-grow: 1;
        flex-shrink: 0;
        font-size: 14px;
        font-weight: 500;
        padding: 0 16px;
      }
      .md-autocomplete-list-inline-header .actionButtonCView-addRow {
        opacity: 0.76;
      }
      .md-autocomplete-list-body {
        display: flex;
        flex-wrap: wrap;
      }
    */},
    function toInnerHTML() {/*
      <% var isArray = Array.isArray(this.data); %>
      <% if ( this.inline ) { %>
        <div class="md-autocomplete-list-inline-header">
          <span class="text">%%label</span>
          <% if ( isArray ) { %> $$addRow{ iconUrl: 'images/ic_add_black_24dp.png' } <% } %>
        </div>
      <% } else { %>
        <div class="md-autocomplete-list-header">
          $$back
          <span class="grow header-text">%%label</span>
          <% if ( isArray ) { %> $$addRow <% } %>
        </div>
      <% } %>
      <div id="<%= this.scrollerID %>" class="md-autocomplete-list-body"
          <% if (!this.inline) { %> style="overflow-y: auto" <% } %>
          >
        <% if ( isArray ) { %>
          <% for ( var i = 0 ; i < this.data.length ; i++ ) { %>
            <%= this.rowView({data: this.data[i]}, this.Y) %>
          <% } %>
        <% } else { %>
          <div id="<%= this.on('click', function() { self.addRow(); }) %>" <%= this.rowView({data: this.data}, this.Y) %></div>
        <% } %>
      </div>
    */}
  ],

  methods: {
    addRowToList: function(d) {
      if ( d ) this.data = Array.isArray(this.data) ? this.data.union([d]) : d;
    },
    removeRowFromList: function(d) { this.data = this.data.deleteF(d); }
  },

  actions: [
    {
      name: 'back',
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png',
      code: function() {
        this.stack.back();
      }
    },
    {
      name: 'addRow',
      label: '',
      iconUrl: 'images/ic_add_24dp.png',
      code: function() {
        var subY = this.srcDAO ? this.Y.sub({ dao: this.srcDAO }) : this.Y;
        var view = this.AddRowView.create(this.prop, subY);
        view.data$.addListener(function(obj, topic, old, nu) {
          this.addRowToList(nu);
        }.bind(this));

        this.stack.pushView(view);
        view.focus();
      }
    }
  ]
});
