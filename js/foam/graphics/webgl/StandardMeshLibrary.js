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
  name: 'StandardMeshLibrary',

  requires: ['foam.graphics.webgl.ArrayBuffer'],

  documentation: function() {/* Generates and caches ArrayBuffer objects
    for various meshes. Typically meshes are unit sized and scaled as needed
    to avoid generating a new mesh. */},

  properties: [
    {
      name: 'cache_',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function getMesh(name) {
      /* Call this method with the name of the mesh and the arguments
         to supply (if needed). The results are cached and each instance
         shared between all calls for a particular mesh. */
      var args = Array.prototype.slice.call(arguments, 1);
      var cacheName = name +"_"+ args.join('-');
      if ( ! this.cache_[cacheName] ) {
        this.cache_[cacheName] = this[name].apply(this, args);
      }
      return this.cache_[cacheName];
    },

    function flatUnitRectangle() {
      return this.ArrayBuffer.create({
        drawMode: 'triangle strip',
        vertices: [
          1.0, 1.0, 0.0,
          0.0, 1.0, 0.0,
          1.0, 0.0, 0.0,
          0.0, 0.0, 0.0
        ]
      });
    },

    function flatCenteredRectangle() {
      return this.ArrayBuffer.create({
        drawMode: 'triangle strip',
        vertices: [
          1.0, 1.0, 0.0,
          -1.0, 1.0, 0.0,
          1.0, -1.0, 0.0,
          -1.0, -1.0, 0.0
        ]
      });

    },

    function flatRing(segments, borderRatio) {
      /* Create a mesh for a 'triangle strip' hollow circle */
      var v = [].slice();
      var segs = segments || 64;
      var r = 1.0;
      var b = 1.0 - (borderRatio || 1.0);
      function circPt(i) {
        return [
           (Math.sin(2 * Math.PI * i / segs) * r),
          -(Math.cos(2 * Math.PI * i / segs) * r),
          0.0
        ];
      };
      function innerPt(i) {
        return [
           (Math.sin(2 * Math.PI * i / segs) * b),
          -(Math.cos(2 * Math.PI * i / segs) * b),
          0.0
        ];
      };
      // start with the center
      v = v.concat(innerPt(0));
      v = v.concat(circPt(0));
      v = v.concat(innerPt(1));

      // add the rest of the edge vertices to complete the fan
      for (var i = 1; i < segs; i++) {
        v = v.concat(circPt(i));
        v = v.concat(innerPt(i));
      }
      v = v.concat(circPt(0));
      v = v.concat(innerPt(0));

      return this.ArrayBuffer.create({
          drawMode: 'triangle strip',
          vertices: v
      });
    },

    function flatCircle(segments) {
      /* Create a mesh for a 'triangle fan' circle. This would be the case where borderRatio == 1.0 */
      var segs = segments || 64;
      var r = 1;

      return this.ArrayBuffer.create({
          drawMode: 'triangle fan',
          vertices: this._circle_(segs, r, 0, 0, 0)
      });
    },

    function flatUnitCircle(segments) {
      /* Create a mesh for a 'triangle fan' circle. This would be the case where borderRatio == 1.0 */
      var segs = segments || 64;
      var r = 0.5;

      return this.ArrayBuffer.create({
          drawMode: 'triangle fan',
          vertices: this._circle_(segs, r, 0.5, 0.5, 0.0)
      });
    },



    function _circle_(s, r, x, y, z) {
      var v = [].slice();
      function circPt(i) {
        return [
          x + (Math.sin(2 * Math.PI * i / s) * r),
          y - (Math.cos(2 * Math.PI * i / s) * r),
          z
        ];
      };
      // start with the center
      v = v.concat([x, y, z]);

      // add the rest of the edge vertices to complete the fan
      for (var i = 0; i < s; i++) {
        v = v.concat(circPt(i));
      }
      v = v.concat(circPt(0));

      return v;
    }

  ]

});