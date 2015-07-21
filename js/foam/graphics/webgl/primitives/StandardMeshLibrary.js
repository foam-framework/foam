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
  package: 'foam.graphics.webgl.primitives',
  name: 'StandardMeshLibrary',

  requires: [
    'foam.graphics.webgl.core.ArrayBuffer',
    'foam.graphics.webgl.matrix.Vector3',
  ],

  documentation: function() {/* Generates and caches ArrayBuffer objects
    for various meshes. Typically meshes are unit sized and scaled as needed
    to avoid generating a new mesh. */},

  properties: [
    {
      name: 'cache_',
      factory: function() { return {}; }
    },
    {
      name: 'normalCache_',
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
    function getNormals(name) {
      /* Call with the same arguments as getMesh() to retrieve matching normals */
      var args = Array.prototype.slice.call(arguments, 1);
      var cacheName = name +"_"+ args.join('-');
      if ( ! this.normalCache_[cacheName] ) {
        if (this[name+"_normals"]) {
          this.normalCache_[cacheName] = this[name+"_normals"].apply(this, args);
        } else {
          this.normalCache_[cacheName] =
              this.ArrayBuffer.create({
                  vertices: this.calcNormals(this.getMesh.apply(this, arguments).vertices),
                  drawMode: 'points'
              });
        }
      }
      return this.normalCache_[cacheName];
    },

    function calcNormals(vertices) {
      var cross_ = this.Vector3.getPrototype().cross_;
      var sub_ = this.Vector3.getPrototype().subtract_;
      var norm_ = this.Vector3.getPrototype().normalize_;
      var scale_ = this.Vector3.getPrototype().scale_;
      var nv = [];

      var curPt = vertices.slice(0, 3);
      var nextPt = vertices.slice(3, 6);
      var vec1 = norm_(sub_(vertices.slice(6, 9), curPt));
      var vec2;
      var flip = 1;
      // take the cross product of each pair of adjacent vectors
      // Since the triangle strip alternates directions, every other normal must be flipped
      for (var i = 0; i < vertices.length-3; i+=3) {
        nextPt = vertices.slice(i+3, i+6);
        vec2 = norm_(sub_(nextPt, curPt));

        nv = nv.concat(scale_(cross_(vec1, vec2), flip));
        flip = -flip;
        vec1 = vec2;
        curPt = nextPt;
      }
      nextPt = vertices.slice(vertices.length-9, vertices.length-6);
      flip = -flip;
      vec2 = norm_(sub_(nextPt, curPt));
      nv = nv.concat(cross_(vec1, vec2));


      return nv;
    },


    function flatUnitRectangle() {
      return this.ArrayBuffer.create({
        drawMode: 'triangle strip',
        vertices: [
          1.0, 1.0, 0.0,
          0.0, 1.0, 0.0,
          1.0, 0.0, 0.0,
          0.0, 0.0, 0.0,
        ]
      });
    },
    function flatUnitRectangle_normals() {
      return this.ArrayBuffer.create({
        drawMode: 'points',
        vertices: [
          0.0, 0.0, 1,
          0.0, 0.0, 1,
          0.0, 0.0, 1,
          0.0, 0.0, 1,
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
          -1.0, -1.0, 0.0,
        ]
      });
    },
    function flatCenteredRectangle_normals() {
      return this.flatUnitRectangle_normals()
    },


    function _chamferRing_(segs, r, b, z) {
      var v = [].slice();
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
          z
        ];
      };
      // start with the center
      v = v.concat(innerPt(0));
      v = v.concat(circPt(0));

      // add the rest of the edge vertices to complete the fan
      for (var i = segs-1; i > 0; i--) {
        v = v.concat(innerPt(i));
        v = v.concat(circPt(i));
      }
      v = v.concat(innerPt(0));
      v = v.concat(circPt(0));

      return v;
    },

    function flatRing(segments, borderRatio, raiseInner) {
      /* Create a mesh for a 'triangle strip' hollow circle */
      var segs = segments || 64;
      var r = 1.0;
      var b = 1.0 - (borderRatio || 1.0);
      var z = raiseInner || 0;


      return this.ArrayBuffer.create({
          drawMode: 'triangle strip',
          vertices: this._chamferRing_(segs, r, b, z)
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
    function flatCircle_normals(segments) {
      var segs = segments || 64;
      return this.ArrayBuffer.create({
          drawMode: 'points',
          vertices: this._circle_normals(segs)
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
    function flatUnitCircle_normals(segments) {
      var segs = segments || 64;
      return this.ArrayBuffer.create({
          drawMode: 'points',
          vertices: this._circle_normals(segs)
      });
    },


    function _circle_normals(s) {
      var v = [];
      for (var i = 0; i < s+3; ++i) {
        v = v.concat([0,0,1]);
      }
      return v;
    },


    function _circle_(s, r, x, y, z, w) {
      var v = [].slice();
      var wind = w || -1; // winding direction, -1 or 1
      function circPt(i) {
        return [
          x + (Math.sin(2 * Math.PI * i / s) * r),
          y - (Math.cos(2 * Math.PI * i / s) * r),
          z
        ];
      };
      // start with the center
      v = v.concat([x, y, z]);

      var start;
      var end;
      if (wind > 0) {
        start = 0; end = s;
      } else{
        start = s; end = 0;
      }

      // add the rest of the edge vertices to complete the fan
      for (var i = start; i !== end; i+=wind) {
        v = v.concat(circPt(i));
      }
      v = v.concat(circPt(start));

      return v;
    },


    function sphere(segments) {
      var segs = segments || 64;

      return this.ArrayBuffer.create({
          drawMode: 'triangle strip',
          vertices: this._sphere_(segs)
      });
    },
    function sphere_normals(segments) {
      var segs = segments || 64;

      return this.ArrayBuffer.create({
          drawMode: 'points',
          vertices: this._sphere_(segs)
      });
    },

    function _sphere_(s) {
      var v = [].slice();
      var circPt = function(i, j) {
        var r = + Math.sin(Math.PI * j / s);
        return [
           + (Math.sin(2 * Math.PI * i / s) * r),
           - (Math.cos(2 * Math.PI * i / s) * r),
           - Math.cos(Math.PI * j / s)
        ];
      };

      for (var j = 1; j < s+1; ++j) { // slices, from north pole to south pole
        for (var i = 0; i < s; ++i) {
          v = v.concat( circPt(i,j-1) );
          v = v.concat( circPt(i,j) );
        }
        v = v.concat( circPt(0,j-1) );
        v = v.concat( circPt(0,j) );
      }

      return v;
    },

    function _grid_(w, h) {
      var v = [].slice();
      var cw = 1/w;
      var ch = 1/h;

      for (var j = 1; j < h-1; ++j) {
        for (var i = 0; i < w; ++i) {
          v = v.concat( [ i*cw, j*ch, 0 ] );
          v = v.concat( [ i*cw, (j+1)*ch, 0 ] );
        }
      }

      return v;
    },


  ]

});