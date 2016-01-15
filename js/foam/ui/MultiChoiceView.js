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
  package: 'foam.ui',
  name: 'MultiChoiceView',

  extends: 'foam.ui.View',

  documentation: 'A View for selecting a set of keys from an array of choices or from a DAO.',

  properties: [
    {
      name: 'prop',
      hidden: true
    },
    {
      name:  'choices',
      type:  'Array[StringField]',
      documentation: 'Array of [value, text] choices.  Simple String values will be upgraded to [value, value]. Can also be a map, in which case this becomes a [key, value] map in enumeration order.',
      factory: function() { return []; },
      preSet: function(_, a) {
        // If a is a map, instead of an array, we make [key, value] pairs.
        if ( typeof a === 'object' && ! Array.isArray(a) ) {
          var out = [];
          for ( var key in a ) {
            if ( a.hasOwnProperty(key) )
              out.push([key, a[key]]);
          }
          return out;
        }

        a = a.clone();
        // Upgrade single values to [value, value]
        for ( var i = 0 ; i < a.length ; i++ )
          if ( ! Array.isArray(a[i]) )
            a[i] = [a[i], a[i]];
        return a;
      },

      postSet: function(_, choices) {
        var set = this.data;
        var newSet = {};

        for ( var i = 0 ; i < choices.length ; i++ ) {
          var key = choices[i][0];

          if ( set[key] ) newSet[key] = set[key];
        }

        if ( Object.keys(set).toString() !== Object.keys(newSet).toString() ) this.data = newSet;

        this.updateHTML();
      }
    },
    {
      type: 'Function',
      name: 'objToChoice',
      help: 'A Function which adapts an object from the DAO to a [key, value, ...] choice.'
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate'
    },
    {
      name: 'name',
      type: 'String',
      defaultValue: 'field'
    },
    {
      name: 'helpText',
      type: 'String',
      defaultValue: undefined
    },
    {
      name: 'size',
      type: 'int',
      defaultValue: 1
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function(select) {
        var set = {};
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.getTarget(select)[i].selected ) set[this.choices[i][0]] = true;
        }
        this.data = set;
      }
    },
    {
      name: 'onDAOUpdate',
      isMerged: 100,
      code: function() {
        if ( ! this.dao ) return;
        this.dao.select(MAP(this.objToChoice))(function(map) {
          // console.log('***** Update Choices ', map.arg2, this.choices);
          this.choices = map.arg2;
        }.bind(this));
      }
    }
  ],

  templates: [
    function CSS() {/*
      .multi-choice-view {
        overflow: auto;
        margin-right: 6px;
      }
    */},
    function toHTML() {/*
<select class="multi-choice-view" id="%%id" name="%%name" size="%%size" multiple><% this.toInnerHTML(out); %></select>*/},
    function toInnerHTML() {/*
<% if ( this.helpText ) { %>
<option disabled="disabled"><%= escapeHTML(this.helpText) %></option>
<% } %>
<% this.choices.forEach(function(choice) {
  var id = self.nextID();
  self.data$.addListener(function() { if ( ! self.X.$(id) ) return; self.X.$(id).selected = self.data[choice[0]]; });
 %>
 <option id="<%= id %>" <% if ( self.data[choice[0]] ) { %> selected="selected"<% } %>><%= escapeHTML(choice[1].toString()) %></option>
<% }); %>
*/}
  ],

  methods: [
    function initHTML() {
      this.SUPER();
      this.onDAOUpdate();
      this.$.addEventListener('change', this.onValueChange);
    },
    function shouldDestroy(old) { return false; },
    function getTarget(e) {
      var t = e.target || e.srcElement;
      if ( t.nodeType == 3 ) t = t.parentNode; // Opera fix
      return t;
    }
  ]
});
