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

  extendsModel: 'foam.ui.View',

  properties: [
    {
      name: 'prop',
      hidden: true
    },
    {
      name:  'choices',
      type:  'Array[StringField]',
      documentation: 'Array of [value, text] choices.  Simple String values will be upgraded to [value, value]. Can also be a map, in which case this becomes a [key, value] map in enumeration order.',
      defaultValue: [],
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

        if ( Object.keys(set) !== Object.keys(newSet) ) this.data = newSet;

        this.updateHTML();
      }
    },
    {
      model_: 'FunctionProperty',
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
      code: function() {
        console.log('********* args: ', arguments);
      }
    },
    {
      name: 'onDAOUpdate',
      isMerged: 100,
      code: function() {
        this.dao.select(MAP(this.objToChoice))(function(map) {
          // console.log('***** Update Choices ', map.arg2, this.choices);
          this.choices = map.arg2;
        }.bind(this));
      }
    }
  ],

  templates: [
    function toHTML() {/*
<select id="%%id" name="%%name" size="%%size"><% this.toInnerHTML(out); %></select>*/},
    function toInnerHTML() {/*
<% var set = this.data %>
<% if ( this.helpText ) { %>
<option disabled="disabled"><%= escapeHTML(this.helpText) %></option>
<% } %>
<% this.choices.forEach(function(choice) { 
  var id = this.nextID(); %>
 <option id="<%= id %>" <% if ( set[choice[0]] ) { %>selected<% } %> value="<%= i %>"><%= escapeHTML(choice[1].toString()) %></option>
<% } %>
*/}
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.onDAOUpdate();
    }
  }
});
