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
  package: 'foam.graphics.webgl.core',
  name: 'ArrayBuffer',

  imports: ['gl$'],

  properties: [
    {
      name: 'vertices',
      preSet: function(old, nu) {
        if ( Array.isArray(nu) ) {
          return new Float32Array(nu);
        }
        return nu;
      },
      postSet: function(old,nu) {
        if ( ! equals(old, nu) ) {
          this.destroy();
        }
      }
    },
    {
      name: 'drawMode',
      defaultValueFn: function() { return this.gl.TRIANGLES; },
      getter: function() {
        var nu = this.instance_.drawMode;
        if ( nu == 'triangle strip' ) { return this.gl.TRIANGLE_STRIP; }
        if ( nu == 'triangles' )      { return this.gl.TRIANGLES; }
        if ( nu == 'triangle fan' )   { return this.gl.TRIANGLE_FAN; }
        if ( nu == 'lines' )          { return this.gl.LINES; }
        if ( nu == 'line strip' )     { return this.gl.LINE_STRIP; }
        if ( nu == 'line loop' )      { return this.gl.LINE_LOOP; }
        return nu;
      }
    },
    {
      name: 'buffer',
      getter: function() {
        if ( ! this.instance_.buffer ) {
          this.compile();
        }
        return this.instance_.buffer;
      }
    },
  ],

  methods: [
    function bind() {
      if ( ! this.gl ) return;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    },
    function draw() {
      if ( ! this.gl ) return;
      this.gl.drawArrays(this.drawMode, 0, this.vertices.length/3);
    },
    function compile() {
      if ( ! this.gl ) return;
      this.instance_.buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instance_.buffer);
      // dump this.vertices into gl object this.instance_.buffer, static mode (write once, read many)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STATIC_DRAW);
    },

    function destroy() {
      if ( this.instance_.buffer ) {
        this.gl.deleteBuffer(this.instance_.buffer);
        delete this.instance_.buffer;
      }
    }
  ]

});