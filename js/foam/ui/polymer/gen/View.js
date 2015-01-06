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

  extendsModel: 'foam.ui.polymer.View',

  properties: [
    {
      model_: 'StringProperty',
      name: 'content',
      defaultValue: ''
    }
  ],

  methods: [
    {
    name: 'postSet',
    code: function(propName) {
      if ( ! this.$ ) return;
      this.$[propName] = this[propName];
      if ( this[propName] ) {
        if ( this[propName] === true ) {
          this.$.setAttribute(propName, '');
        } else {
          this.$.setAttribute(propName, this[propName]);
        }
      } else {
        this.$.removeAttribute(propName);
      }
    }
    }
    ],

  templates: [
    function toHTML() {/*
      <{{{this.tagName}}} id="{{{this.id}}}"
      <% for ( var i = 0; i < this.POLYMER_PROPERTIES.length; ++i ) {
           var propName = this.POLYMER_PROPERTIES[i];
           if ( this[propName] ) { %>
             <%= propName %>
             <% if ( this[propName] !== true ) { %>
               ="<%= this[propName] %>"
             <% }
           }
         } %>
      >{{this.content}}
     </{{{this.tagName}}}>
    */}
  ]
});
