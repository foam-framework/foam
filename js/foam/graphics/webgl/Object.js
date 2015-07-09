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
  extendsModel: 'foam.graphics.webgl.GLView',

  imports: [
    'projectionMatrix$'
  ],
  exports: [
    'gl$',
  ],

  properties: [
    {
      name: 'sylvesterLib',
      factory: function() {
        return this.SylvesterLib.create();
      }
    },
    {
      name: 'relativePosition',
      type: 'Matrix',
      getter: function() {
        if ( GLOBAL.Matrix ) {
          if ( this.instance_.relativePosition ) {
            if ( Array.isArray(this.instance_.relativePosition) ) {
              // convert to Matrix
              this.instance_.relativePosition = $M(this.instance_.relativePosition);
            }
            return this.instance_.relativePosition;
          } else {
            return Matrix.I(4);
          }
        }

        return null;
      }

    },
    {
      name: 'x',
      getter: function() {
        return this.relativePosition && this.relativePosition.elements && this.relativePosition.elements[0][3];
      },
      postSet: function(old, nu) {
        this.relativePosition && this.relativePosition.elements && (this.relativePosition.elements[0][3] = nu);
      }
    },
    {
      name: 'y',
      getter: function() {
        return this.relativePosition && this.relativePosition.elements && -(this.relativePosition.elements[1][3]);
      },
      postSet: function(old, nu) {
        this.relativePosition && this.relativePosition.elements && (this.relativePosition.elements[1][3] = -nu);
      }
    },
    {
      name: 'positionMatrix',
      type: 'Matrix',
    },
    {
      name: 'mesh',
      type: 'foam.graphics.webgl.ArrayBuffer'
    },
    {
      name: 'program',
    },
    {
      name: 'parent',
      postSet: function(old, nu) {
        if ( old ) {
          old.positionMatrix$.removeListener(this.updatePosition);
        }
        if ( nu ) {
          nu.positionMatrix$.addListener(this.updatePosition);
        }
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'translucent',
      defaultValue: false
    }
  ],

  methods: [
    function init() {

      this.sylvesterLib.loaded$.addListener(this.updatePosition);
      this.relativePosition$.addListener(this.updatePosition);

    },

    function paintSelf(translucent) {
      // only render on the correct pass
      if ( this.translucent !== translucent ) return;

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

      if (translucent) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        //gl.depthMask(false);
        //gl.disable(gl.DEPTH_TEST);
      }

      this.mesh.draw();

      if (translucent) {
        gl.disable(gl.BLEND);
        //gl.depthMask(true);
        //gl.enable(gl.DEPTH_TEST);
      }    },
  ],

  listeners: [
    {
      name: 'updatePosition',
      framed: true,
      code: function() {
        var b = this.parent.positionMatrix || (GLOBAL.Matrix && GLOBAL.Matrix.I(4));
        var r = this.relativePosition || (GLOBAL.Matrix && GLOBAL.Matrix.I(4));
        if ( b && r ) this.positionMatrix = b.x(r);
      },
    }

  ]

});