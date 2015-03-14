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
  extendsModel: 'foam.ui.BaseView',

  traits: ['foam.ui.HTMLViewTrait', 'foam.ui.TemplateSupportTrait', 'foam.ui.ViewActionsTrait'],
  
  requires: [
    'foam.ui.md.AddRowView',
    'foam.ui.md.ToolbarCSS'
  ],
  imports: [ 'stack' ],
  exports: [
    'acRowView as rowView',
    'queryFactory',
    'removeRowFromList',
    'srcDAO as dao'
  ],

  properties: [
    {
      name: 'data',
      postSet: function(oldValue, newValue) {
        this.updateHTML();
      }
    },
    {
      model_: 'DAOProperty',
      name: 'srcDAO'
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
      model_: 'ViewFactoryProperty',
      name: 'acRowView',
      defaultValue: 'foam.ui.md.DefaultACRowView'
    },
    {
      model_: 'ViewFactoryProperty',
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

      .inline-header {
        align-items: center;
        display: flex;
      }
      .inline-header .text {
        flex-grow: 1;
        flex-shrink: 0;
        font-size: 20px;
        padding: 0 10px;
      }
    */},
    function toInnerHTML() {/*
      <% var isArray = Array.isArray(this.data); %>
      <% if ( this.inline ) { %>
        <div class="inline-header">
          <span class="text">%%label</span>
          <% if ( isArray ) { %> $$addRow <% } %>
        </div>
      <% } else { %>
        <div class="header">
          $$back
          <span class="grow header-text">%%label</span>
          <% if ( isArray ) { %> $$addRow <% } %>
        </div>
      <% } %>
      <div id="<%= this.scrollerID %>" class="body" style="overflow-y: auto">
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
      action: function() {
        this.stack.back();
      }
    },
    {
      name: 'addRow',
      label: '',
      iconUrl: 'images/ic_add_24dp.png',
      action: function() {
        var view = this.AddRowView.create(this.prop);
        view.data$.addListener(function(obj, topic, old, nu) {
          this.addRowToList(nu);
        }.bind(this));

        // TODO(braden): This used to slide in from the left, but it has been
        // disabled because mobile browsers try to scroll the input field into
        // view when it's supposed to be offscreen to the right. It results in a
        // really janky flow: the text box appears midway across the screen,
        // slides halfway off to the left, and then jumps back into place.
        this.stack.pushView(view, undefined /* label */, undefined /* back */,
            'none' /* transition */);
        view.focus();
      }
    }
  ]
});
