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
  name: 'ColorPickerView',

  extends: 'foam.ui.SimpleView',

  properties: [
    {
      name: 'data'
    }
  ],

  methods: {
    toHTML: function() {
      var out = '<table>';
      out += '<tr>';
      var self = this;
      var cell = function(r, g, b) {
        var value = 'rgb(' + r + ',' + g + ',' + b + ')';

        out += '<td class="pickerCell"><div id="' +
          self.on('click', function(e) {
            self.data = value;
            e.preventDefault();
          }) +
          '" class="pickerDiv" style="background-color: ' + value + '"></div></td>';
      };
      for ( var col = 0; col < 8; col++ ) {
        var shade = Math.floor(255 * col / 7);
        cell(shade, shade, shade);
      }
      out += '</tr><tr>';
      cell(255, 0, 0);
      cell(255, 153, 0);
      cell(255, 255, 0);
      cell(0, 255, 0);
      cell(0, 255, 255);
      cell(0, 0, 255);
      cell(153, 0, 255);
      cell(255, 0, 255);
      out += '</tr></table>';
      return out;
    }
  }
});
