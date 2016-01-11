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
  name: 'StackMatrix4',
  extends: 'foam.graphics.webgl.matrix.Matrix4',

  properties: [
    {
      name: 'stack',
      help: 'The stack of matrices to multiply.',
      preSet: function(old, nu) {
        if ( old && old.length ) {
          for (var i = 0; i < old.length; ++i) {
            //old[i].removeListener(this.matrixChange);
            old[i].removeDirectListener(this);
          }
        }
        return nu;
      },
      postSet: function(old,nu) {
        if ( nu && nu.length ) {
          for (var i = 0; i < nu.length; ++i) {
            //nu[i].addListener(this.matrixChange);
            nu[i].addDirectListener(this);
          }
        }

        //this.matrixCache_ = {};
        this.reset_();
      }
    },
    {
      name: 'temp_',
      lazyFactory: function() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }
    },
  ],

  methods: [

    function recalculate_() {
      /* Recalculate the matrix, starting from the indicated index */
      if ( this.stack.length < 1 ) { return this.SUPER(); } // the identity matrix

      var result = this.temp_;
      this.copyMatrixInto_(this.stack[0].flat, this.instance_.flat);

      for (var i=1; i < this.stack.length; ++i) {
        var m = this.stack[i];
        if ( ! m.identity ) {
          this.multiply(this.instance_.flat, m.flat, result); // combine into result
          this.copyMatrixInto_(result, this.instance_.flat); // copy back
        }
      }
    },

  ],

  listeners: [
    {
      name: 'matrixChange',
      code: function(obj, topic) {
        if ( topic[1] == 'flat' ) {
          //delete this.matrixCache_[obj];
          this.reset_();
        }
      }
    }
  ]

});
