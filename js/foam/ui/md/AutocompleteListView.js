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
  extendsModel: 'foam.ui.DataView',

  traits: ['foam.ui.HTMLViewTrait', 'foam.ui.TemplateSupportTrait'],
  
  requires: [
    'foam.ui.md.AddRowView',
    'SimpleValue'
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
      model_: 'ModelProperty',
      name: 'acRowView',
      defaultValue: 'foam.ui.md.DefaultACRowView'
    },
    {
      model_: 'ViewProperty',
      name: 'rowView',
      defaultValue: 'DefaultRowView'
    },
    {
      name: 'className',
      defaultValue: 'AutocompleteListView'
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'extraClassName',
      defaultValueFn: function() { return Array.isArray(this.data) ? ' array' : ' single'; }
    },
  ],

  templates: [
    // TODO: cleanup CSS
    function CSS() {/*
      .AutocompleteListView {
        padding: 0 0 12px 16px;
        width: 100%;
        border: none;
        position: inherit;
      }
      .AutocompleteListView .acHeader {
        color: #999;
        font-size: 14px;
        font-weight: 500;
        padding: 0 0 16px 0;
        display: flex;
        align-items: center;
        margin-top: -16px;
        padding-bottom: 0;
        flex: 1 0 auto;
      }
      .AutocompleteListView .acHeader .acLabel {
        flex: 1 0 auto;
      }
      .AutocompleteListView .acHeader canvas {
        opacity: 0.76;
      }
      .AutocompleteListView .single canvas {
        display: none;
      }
    */},
    function toInnerHTML() {/*
      <% var isArray = Array.isArray(this.data); %>
      <div class="acHeader"><div class="acLabel">%%label</div><% if ( isArray ) { %> $$addRow <% } %></div>
      <% if ( isArray ) { %>
        <% for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.data[i]; %>
          <div><%= this.rowView({data: d}, this.X) %></div>
        <% } %>
      <% } else { %>
        <div id="<%= this.on('click', function() { self.addRow(); }) %>" <%= this.rowView({data: this.data}, this.X) %></div>
      <% } %>
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
      name: 'addRow',
      label: '',
      iconUrl: 'images/ic_add_24dp.png',
      action: function() {
        var view = this.AddRowView.create(this.prop);
        view.data$.addListener(function(obj, topic, old, nu) {
          this.addRowToList(nu);
        }.bind(this));

        this.stack.pushView(view);
        view.focus();
      }
    }
  ]
});
