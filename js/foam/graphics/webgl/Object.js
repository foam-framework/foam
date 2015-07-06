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
  name: 'Object',
  requires: ['foam.graphics.webgl.SylvesterLib'],
  extendsModel: 'foam.graphics.CView',

  imports: [
    'positionMatrix$ as basePosMatrix$',
    'projectionMatrix$'
  ],
  exports: [
    'gl$',
    'positionMatrix$'
  ],

  properties: [
    {
      name: 'relativePosition',
      type: 'Matrix',
      getter: function() {
        if ( this.instance_.relativePosition ) return this.instance_.relativePosition;
        if ( GLOBAL.Matrix ) return Matrix.I(4);
        return null;
      }

    },
    {
      name: 'positionMatrix',
      type: 'Matrix',
      dynamicValue: function() {
        this.SylvesterLib.loaded;
        var b = this.basePosMatrix || (GLOBAL.Matrix && GLOBAL.Matrix.I(4));
        var r = this.relativePosition || (GLOBAL.Matrix && GLOBAL.Matrix.I(4));
        return b && r && b.x(r);
      }
    },
    {
      name: 'mesh',
      type: 'foam.graphics.webgl.ArrayBuffer'
    },
    {
      name: 'program',
    }
  ],

  methods: [
    function init() {
      this.SylvesterLib.create();
    },

    function paintSelf() {
      var gl = this.gl;
      if ( ! gl ) return;

      this.mesh.bind();

      this.program.use();

      // attribute vars
      vertexPositionAttribute = this.gl.getAttribLocation(this.program.program, "aVertexPosition");
      this.gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(vertexPositionAttribute);

      // uniform vars
      if ( this.projectionMatrix ) {
        var projUniform = this.gl.getUniformLocation(this.program.program, "projectionMatrix");
        this.gl.uniformMatrix4fv(projUniform, false, new Float32Array(this.projectionMatrix.flatten()));
      }

      if ( this.positionMatrix ) {
        var posUniform = this.gl.getUniformLocation(this.program.program, "positionMatrix");
        this.gl.uniformMatrix4fv(posUniform, false, new Float32Array(this.positionMatrix.flatten()));
      }

      this.mesh.draw();
    },



  ]

});