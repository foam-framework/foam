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
  name: 'Program',
  requires: [
    'foam.graphics.webgl.core.Shader',
    'foam.graphics.webgl.Matrix4Uniform'
  ],
  imports: [
    'gl$',
    'projectionMatrix$'
  ],

  properties: [
    {
      name: 'vertexShader',
      postSet: function(old, nu) {
        this.destroy();
      }
    },
    {
      name: 'fragmentShader',
      postSet: function(old, nu) {
        this.destroy();
      }
    },
    {
      name: 'program',
      getter: function() {
        if ( ! this.instance_.program ) {
          this.compile();
        }
        return this.instance_.program;
      }
    },
  ],

  methods: [
    function use() {
      if ( ! this.gl ) return;
      /* Call this to use the program and set up shader attributes and uniform variables. Call after
        $$DOC{ref:'foam.graphics.webgl.core.ArrayBuffer'}.bind() and before
        $$DOC{ref:'foam.graphics.webgl.core.ArrayBuffer'}.draw(). */
      this.gl.useProgram(this.program);
    },
    function compile() {
      if ( ! this.gl ) return;
      var prog = this.gl.createProgram();
      this.gl.attachShader(prog, this.vertexShader.shader);
      this.gl.attachShader(prog, this.fragmentShader.shader);
      this.gl.linkProgram(prog);
      if ( ! this.gl.getProgramParameter(prog, this.gl.LINK_STATUS) ) {
        console.warn("Could not create shader program.");
        this.instance_.program = null;
      } else {
        this.instance_.program = prog;
      }
      return this.instance_.program;
    },
    function destroy() {
      if ( this.instance_.program ) {
        this.gl.deleteProgram(this.instance_.program);
        delete this.instance_.program;
        //this.uniformValues_ = {};
      }
    },

  ]

});

