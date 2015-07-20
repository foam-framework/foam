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
  name: 'Vector3',

  properties: [
    {
      name: 'flat',
      help: 'The vector contents in a flat array.',
      getter: function() {
        if ( ! this.instance_.flat ) {
          this.instance_.flat = this.recalculate_();
        }
        return this.instance_.flat;
      },
      postSet: function(old,nu) {
        this.instance_.x = nu[0];
        this.instance_.y = nu[1];
        this.instance_.z = nu[2];
      }
    },
    {
      name: 'x',
      postSet: function() {
        this.reset_();
      }
    },
    {
      name: 'y',
      postSet: function() {
        this.reset_();
      }
    },
    {
      name: 'z',
      postSet: function() {
        this.reset_();
      }
    },
  ],

  methods: [
    function flatten() {
      /* convenience for backward compatibility */
      return this.flat.slice();
    },

    function reset_() {
      /* trigger a recalculate on next access */
      this.instance_.flat = null;
      this.propertyChange('flat', true, null);
    },

    function recalculate_() {
      return [this.x, this.y, this.z];
    },

    function cross(vec) {
      var u = this.flat;
      var v = vec.flat;
      return this.model_.create({ flat: this.cross_(u,v) });
    },
    function cross_(u, v) {
      return [
        u[1]*v[2] - u[2]*v[1],
        u[2]*v[0] - u[0]*v[2],
        u[0]*v[1] - u[1]*v[0],
      ];
    },

    function dot(vec) {
      var u = this.flat;
      var v = vec.flat;
      return this.model_.create({ flat: this.dot_(u,v) });
    },
    function dot_(u, v) {
      return
        u[0] * v[0]+
        u[1] * v[1]+
        u[2] * v[2];
    },

    function subtract(vec) {
      var u = this.flat;
      var v = vec.flat;
      return this.model_.create({ flat: this.subtract_(u,v) });
    },
    function subtract_(u, v) {
      return [
        u[0] - v[0],
        u[1] - v[1],
        u[2] - v[2],
      ]
    },

    function add(vec) {
      var u = this.flat;
      var v = vec.flat;
      return this.model_.create({ flat: this.add_(u,v) });
    },
    function add_(u, v) {
      return [
        u[0] + v[0],
        u[1] + v[1],
        u[2] + v[2],
      ]
    },

    function multiply_(src, by, into) {
      /* multiply 'src' * 'by', results written to 'into' */
      if ( ! into ) into = [];
      for (var j=0; j < 3; ++j) {
        into[j] = src[j] * by[j];
      }
      return into;
    },

    function multiply(vec) {
      return this.model_.create({ flat: this.multiply_(this.flat, vec.flat) });
    },

    function normalize_(a) {
      var l = Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);
      return [ a[0]/l, a[1]/l, a[2]/l ];
    },

    function scale_(a, s) {
      return [ a[0]*s, a[1]*s, a[2]*s ];
    },

    function toString() {
      var f = this.flat;
      return "["+f[0]+", "+f[1]+", "+f[2]+"]";
    }


  ]

});
