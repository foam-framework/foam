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
  name: 'PerspectiveMatrix4',
  extends: 'foam.graphics.webgl.matrix.Matrix4',

  properties: [
    {
      name: 'fov',
      help: 'The the field of view angle in degrees.',
      defaultValue: 45,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'width',
      help: 'The viewport width',
      defaultValue: 1920,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'height',
      help: 'The viewport height',
      defaultValue: 1080,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'znear',
      help: 'The near z clipping plane.',
      defaultValue: 0.1,
      postSet: function() { this.reset_(); }
    },
    {
      name: 'zfar',
      help: 'The far z clipping plane.',
      defaultValue: 100.0,
      postSet: function() { this.reset_(); }
    },
  ],

  methods: [
    function recalculate_() {
      /* Implement in your submodels to calculate and return the contents
          of this matrix.  */
      this.instance_.flat = this.makePerspective(this.fov, this.width/this.height, this.znear, this.zfar);
    },
    
    //
    // gluPerspective
    //
    function makePerspective(fovy, aspect, znear, zfar)
    {
        var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        return this.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
    },

    //
    // glFrustum
    //
    function makeFrustum(left, right,
                         bottom, top,
                         znear, zfar)
    {
        var X = 2*znear/(right-left);
        var Y = 2*znear/(top-bottom);
        var A = (right+left)/(right-left);
        var B = (top+bottom)/(top-bottom);
        var C = -(zfar+znear)/(zfar-znear);
        var D = -2*zfar*znear/(zfar-znear);

        return   [X, 0,  0, 0,
                  0, Y,  0, 0,
                  A, B,  C, -1,
                  0, 0,  D, 0];
    },
  ]

});
