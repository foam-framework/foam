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
  name: 'StackMatrix4',
  extendsModel: 'foam.graphics.webgl.Matrix4',

  properties: [
    {
      name: 'stack',
      type: 'Array[Matrix4]',
      help: 'The stack of matrices to multiply.',
      postSet: function() {
        this.matrixCache_ = {};
        this.reset_();
      }
    },
  ],

  methods: [

    function recalculate_() {
      /* Recalculate the matrix, starting from the indicated index */
      if ( this.stack.length < 1 ) { return this.SUPER(); } // the identity matrix

      var result = this.stack[0].flat;
      var i = 1;
      // find the last cache hit before we miss
      for (; i < this.stack.length; ++i) {
        var m = this.stack[i];
        if ( this.matrixCache_[m] ) {
          result = this.matrixCache_[m];
        } else {
          break;
        }
      }
      // continue calculating the rest
      for (; i < this.stack.length; ++i) {
        var m = this.stack[i];
        result = this.multiply(result, m.flat);
        this.matrixCache_[m] = result.slice(); // clone
        m.addListener(this.matrixChange);
      }
      return result;
    },
  ],

  listeners: [
    {
      name: 'matrixChange',
      code: function(obj, topic) {
        if ( topic[1] == 'flat' ) {
          delete this.matrixCache_[obj];
          this.reset_();
        }
      }
    }
  ]

});
