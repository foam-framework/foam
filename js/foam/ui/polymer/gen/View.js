/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'View',
  package: 'foam.ui.polymer.gen',

  extends: 'foam.ui.polymer.View',

  properties: [
    {
      type: 'String',
      name: 'content',
      defaultValue: '',
      postSet: function() {
        if ( this.$ ) this.$.textContent = this.content;
      }
    },
    {
      name: 'polymerProperties',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      name: 'postSet',
      code: function(propName, old, nu) {
        this.polymerProperties[propName] = nu;
        this.bindData();
      }
    },
    {
      name: 'bindData',
      code: function() {
        if ( ! this.$ ) return;
        Object.getOwnPropertyNames(this.polymerProperties).forEach(function(p) {
          this.$[p] = this[p];
        }.bind(this));
      }
    },
    {
      name: 'initHTML',
      code: function() {
        var rtn = this.SUPER();
        this.bindData();
        return rtn;
      }
    },
    {
      name: 'updateHTML',
      code: function() {
        var rtn = this.SUPER();
        this.bindData();
        return rtn;
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <{{{this.tagName}}}
        id="{{{this.id}}}"
        <%= this.cssClassAttr() %>
        <% for ( var i = 0; i < this.POLYMER_PROPERTIES.length; ++i ) {
             var propName = this.POLYMER_PROPERTIES[i];
             if ( this[propName] ) { %>
               <%= propName %>
               <% if ( this[propName] !== true ) { %>
                 ="<%= this[propName] %>"
               <% }
             }
           } %>
        >
        <%= this.toInnerHTML() %>
      </{{{this.tagName}}}>
    */},
    function toInnerHTML() {/*
      {{this.content}}
    */}
  ]
});
