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
  name: 'OrthoMatrix4',
  extends: 'foam.graphics.webgl.matrix.Matrix4',

  properties: [
    {
      name: 'left',
      help: 'The left of the viewport.',
      defaultValue: 0,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'width',
      help: 'The width of the viewport.',
      defaultValue: 1000,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'top',
      help: 'The top of the viewport.',
      defaultValue: 0,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'height',
      help: 'The left of the viewport.',
      defaultValue: 500,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'znear',
      help: 'The near z clipping plane.',
      defaultValue: -1000,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'zfar',
      help: 'The far z clipping plane.',
      defaultValue: 1000,
      postSet: function() { this.reset_(); }
    },
  ],

  methods: [
    function recalculate_() {
      /* Implement in your submodels to calculate and return the contents
          of this matrix.  */
      this.instance_.flat = this.makeOrtho(this.left, this.left+this.width, (this.top+this.height), this.top, this.znear, this.zfar);
    },
    
    //
    // glOrtho
    //
    function makeOrtho(left, right,
                       bottom, top,
                       znear, zfar)
    {
        var tx = -(right+left)/(right-left);
        var ty = -(top+bottom)/(top-bottom);
        var tz = -(zfar+znear)/(zfar-znear);

        return  [ 2/(right-left), 0,              0,               0,
                  0,              2/(top-bottom), 0,               0,
                  0,              0,              -2/(zfar-znear), 0,
                  tx,             ty,             tz,              1];
    },

  ]

});
