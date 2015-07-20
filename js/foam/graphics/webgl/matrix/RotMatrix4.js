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
  name: 'RotMatrix4',
  extendsModel: 'foam.graphics.webgl.matrix.Matrix4',

  properties: [
    {
      name: 'angle',
      help: 'The angle to rotate.',
      postSet: function() {
        this.reset_();
      }
    },
    {
      name: 'axis',
      help: 'A triple (vector) indicating the axis to rotate about.',
      lazyFactory: function() { return [0,0,1]; },
      adapt: function(old, nu) {
        // ensure unit vector
        var len = Math.sqrt(nu[0]*nu[0] + nu[1]*nu[1] + nu[2]*nu[2]);
        if ( len < 0.999999 || len > 1.000001 ) {
          return [ nu[0]/len, nu[1]/len, nu[2]/len ];
        } else {
          return nu;
        }
      },
      postSet: function() {
        this.reset_();
      }
    },
  ],

  methods: [
    function recalculate_() {
      /* Implement in your submodels to calculate and return the contents
          of this matrix.  */
      if (this.angle < 0.00001) return this.SUPER();

      var axis = this.axis;
      return this.rotation_(axis[0], axis[1], axis[2], this.angle);
      //return this.SUPER();
    },

    function rotation_(x,y,z,a) {
      // rotation axis: unit vector x,y,z. cos(a) sin(a)
      var cos = Math.cos(a);
      var icos = 1 - cos;
      var sin = Math.sin(a);

      return [ x*x*icos+cos,   x*y*icos+z*sin, x*z*icos-y*sin, 0,
               x*y*icos-z*sin, y*y*icos+cos,   y*z*icos+x*sin, 0,
               x*z*icos+y*sin, y*z*icos-x*sin, z*z*icos+cos,   0,
               0,              0,              0,              1 ];
   },


  ]

});
