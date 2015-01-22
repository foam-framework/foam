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
  name: 'AudioView',
  package: 'foam.navigator.views',
  extendsModel: 'View',

  imports: [
    'PropertyView'
  ],

  properties: [
    {
      name: 'data',
      required: true
    },
    {
      model_: 'BooleanProperty',
      name: 'defaultControls',
      defaultValue: true
    },
    {
      name: 'sourceCollection',
      dynamicValue: function() {
        if ( Array.isArray(this.data) ) return this.data;
        else                            return [this.data];
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <audio <% if ( this.defaultControls ) { %>controls<% } %> >
      <% for ( var i = 0; i < this.sourceCollection.length; ++i ) {
        var src = this.sourceCollection[i]; %>
        <source src="{{{src.src}}}" type="{{{src.type}}}"></source>
      <% } %>
      </audio>
    */}
  ]
});
