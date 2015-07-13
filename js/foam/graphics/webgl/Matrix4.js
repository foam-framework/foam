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
  package: 'foam.graphics.webgl',
  name: 'Matrix4',

  properties: [
    {
      name: 'flat',
      help: 'The matrix contents in a flat array.',
      getter: function() {
        if ( ! this.instance_.flat ) {
          this.instance_.flat = this.recalculate_();
        }
        return this.instance_.flat;
      }
    },
    {
      name: 'elements',
      help: 'The matrix contents in an array of row arrays.',
      getter: function() { return this.elementsFromFlat_(this.flat); },
      setter: function(nu) { console.warn("Matrix4: .elements property is read only."); },
      mode: 'read-only'
    },
  ],

  methods: [
    function reset_() {
      /* trigger a recalculate on next access */
      this.instance_.flat = null;
      this.propertyChange('flat', true, null);
    },

    function recalculate_() {
      /* Implement in your submodels to calculate and return the contents
          of this matrix.  */
      // Identity
      return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]];
    },

    function elementsFromFlat_(flat) {
      if ( ! this.instance_.elements ) this.instance_.elements = [[],[],[],[]];
      var e = this.instance_.elements;

      for (var i=0; i < 4; ++i) {
        for (var j=0; i < 4; ++j) {
          e[i][j] = flat[i*4 + j];
        }
      }

      return e;
    },

    function elementsFromFlat_(els) {
      var flat = [];

      for (var i=0; i < 4; ++i) {
        for (var j=0; i < 4; ++i) {
          flat[i*4 + j] = els[i][j];
        }
      }

      return flat;
    },

    function multiply(src, by, into) {
      /* multiply 'src' * 'by', results written to 'into' */
      if ( ! into ) into = [];
      for (var i=0; i < 4; ++i) {
        for (var j=0; i < 4; ++j) {
          into[i*4 + j] = 0;
          for (var k = 0; k < 4; ++k) {
            into[i*4 + j] += src[i*4 + k] * by[j + k*4];
          }
        }
      }
      return into;
    }


  ]

});
