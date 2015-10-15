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
  package: 'foam.graphics.webgl.matrix',
  name: 'TransposeMatrix4',

  extends: 'foam.graphics.webgl.matrix.Matrix4',

  properties: [
    {
      name: 'source',
      preSet: function(old, nu) {
        if ( old ) { old.removeDirectListener(this); }
        //if ( old ) { old.removeListener(this.reset); }
        return nu;
      },
      postSet: function(old,nu) {
        if ( nu ) { nu.addDirectListener(this); }
//        if ( nu ) { nu.addListener(this.reset); }
        this.reset_();
      }

    }
  ],

  listeners: [
    {
      name: 'reset',
      code: function() { this.reset_(); }
    }
  ],

  methods: [
    function recalculate_() {
      /* Implement in your submodels to calculate and return the contents
          of this matrix.  */
      if (this.source.identity) return this.source.flat.slice();

      this.transpose(this.source);
    },

    function transpose(matrix) {
      var m = matrix.flat;
      var els = this.instance_.flat;
      // transpose
      for (var j=0; j < 4; ++j) {
        for (var i=0; i < 4; ++i) {
          els[i+j*4] = m[j+i*4];
        }
      }
      return els;
    },


  ]

});
