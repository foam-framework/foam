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
  package: 'foam.ui',
  name: 'EditColumnsView',

  extends: 'foam.ui.View',

  properties: [
    {
      name: 'model',
      type: 'Model'
    },
    {
      type: 'StringArray',
      name: 'properties'
    },
    {
      type: 'Array',
      name: 'availableProperties'
    }
  ],

  listeners: [
    {
      name: 'onAddColumn',
      code: function(propName) {
        this.properties = this.availableProperties.filter(function(prop) {
          return this.properties.indexOf(prop.name) >= 0 ||
              prop.name === propName;
        }.bind(this)).map(function(prop) { return prop.name; });
      }
    },
    {
      name: 'onRemoveColumn',
      code: function(prop) {
        this.properties = this.properties.deleteF(prop);
      }
    }
  ],

  methods: {
    toHTML: function() {
      var s = '<span id="' + this.id + '" class="editColumnView" style="overflow-y: scroll;position: absolute;right: 0.96;background: white;top: 138px;border: 1px solid black;">'

      s += 'Show columns:';
      s += '<table>';

      // Currently Selected Properties
      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var p = this.model.getProperty(this.properties[i]);
        s += '<tr><td id="' + this.on('click', this.onRemoveColumn.bind(this, p.name)) + '">&nbsp;&#x2666;&nbsp;' + p.label + '</td></tr>';
      }

      // Available but not Selected Properties
      for ( var i = 0 ; i < this.availableProperties.length ; i++ ) {
        var p = this.availableProperties[i];
        if ( this.properties.indexOf(p.name) == -1 ) {
          s += '<tr><td id="' + this.on('click', this.onAddColumn.bind(this, p.name)) + '">&nbsp;&nbsp;&nbsp;&nbsp;' + p.label + '</td></tr>';
        }
      }

      s += '</table>';
      s += '</span>';

      return s;
    }
  }
});
