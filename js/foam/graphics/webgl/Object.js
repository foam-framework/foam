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
  requires: [
    'foam.graphics.webgl.StackMatrix4',
    'foam.graphics.webgl.TransMatrix4',
    'foam.graphics.webgl.RotMatrix4',
    'foam.graphics.webgl.Matrix4',
  ],
  extendsModel: 'foam.graphics.webgl.GLView',

  imports: [
    'projectionMatrix$',
    'glMeshLibrary'
  ],
  exports: [
    'gl$',
  ],

  properties: [
    {
      name: 'relativePosition',
      type: 'foam.graphics.webgl.Matrix4',
      lazyFactory: function() {
        return this.StackMatrix4.create({
            stack: [
              this.RotMatrix4.create({ angle$: this.angle$, axis$: this.axis$ }),
              this.TransMatrix4.create({ x$: this.x$, y$: this.y$, z$: this.z$ })
            ]
        });
      }
    },
    {
      name: 'x',
      defaultValue: 0.0,
    },
    {
      name: 'y',
      defaultValue: 0.0,
    },
    {
      name: 'z',
      defaultValue: -0.01,
    },
    {
      name: 'angle',
      defaultValue: 0.0,
    },
    {
      name: 'axis',
      defaultValueFn: function() { return [0,0,1]; }
    },
    {
      name: 'positionMatrix',
      type: 'foam.graphics.webgl.Matrix4',
      lazyFactory: function() {
        return this.updatePosition();
      }
    },
    {
      name: 'mesh',
      type: 'foam.graphics.webgl.ArrayBuffer'
    },
    {
      name: 'meshMatrix',
      help: 'Transformations to apply to the mesh, but not pass on to children.',
      type: 'foam.graphics.webgl.Matrix4',
      lazyFactory: function() {
        return this.Matrix4.create();
      }
    },
    {
      name: 'program',
    },
    {
      name: 'parent',
      postSet: function(old, nu) {
        if (old) old.positionMatrix$.removeListener(this.doUpdatePosition);
        if (nu) nu.positionMatrix$.addListener(this.doUpdatePosition);
        this.doUpdatePosition();
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'translucent',
      defaultValue: false
    }
  ],

  listeners: [
    {
      name: 'doUpdatePosition',
      code: function(obj, topic) {
        this.positionMatrix = this.updatePosition();
      }
    }

  ],

  methods: [

    function updatePosition() {
      return this.StackMatrix4.create({
          stack: [
            ( this.parent && this.parent.positionMatrix ) ?
              this.parent.positionMatrix :
              this.Matrix4.create(),
            this.relativePosition
          ]
      });
    },

    function paintSelf(translucent) {
      // only render on the correct pass
      if ( this.translucent !== translucent ) return;

      var gl = this.gl;
      if ( ! gl || ! this.mesh ) return;

      this.mesh.bind();

      this.program.use();

      // attribute vars
      vertexPositionAttribute = this.gl.getAttribLocation(this.program.program, "aVertexPosition");
      this.gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(vertexPositionAttribute);

      // uniform vars
      if ( this.projectionMatrix ) {
//         var projUniform = this.gl.getUniformLocation(this.program.program, "projectionMatrix");
//         this.gl.uniformMatrix4fv(projUniform, false, new Float32Array(this.projectionMatrix.flatten()));
        this.program.setUniformMatrix4fv('projectionMatrix', this.projectionMatrix);
      }

      if ( this.parent && this.parent.positionMatrix ) {
//        var posUniform = this.gl.getUniformLocation(this.program.program, "positionMatrix");
//        this.gl.uniformMatrix4fv(posUniform, false, new Float32Array(this.parent.positionMatrix.flatten()));
        this.program.setUniformMatrix4fv('positionMatrix', this.parent.positionMatrix);
      } else {
//        var posUniform = this.gl.getUniformLocation(this.program.program, "positionMatrix");
//        this.gl.uniformMatrix4fv(posUniform, false, new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
//        this.program.setUniformMatrix4fv('positionMatrix', this.parent.positionMatrix);
      }

      if ( this.relativePosition ) {
//        var relUniform = this.gl.getUniformLocation(this.program.program, "relativeMatrix");
//        this.gl.uniformMatrix4fv(relUniform, false, new Float32Array(this.relativePosition.flatten()));
        this.program.setUniformMatrix4fv('relativeMatrix', this.relativePosition);
      }

      if ( this.meshMatrix ) {
//        var meshUniform = this.gl.getUniformLocation(this.program.program, "meshMatrix");
//        this.gl.uniformMatrix4fv(meshUniform, false, new Float32Array(this.meshMatrix.flatten()));
        this.program.setUniformMatrix4fv('meshMatrix', this.meshMatrix);
      }

      if ( this.color && Array.isArray(this.color) ) {
//        var colorUniform = this.gl.getUniformLocation(this.program.program, "color");
//        this.gl.uniform4fv(colorUniform, new Float32Array(this.color));
        this.program.setUniform4fv('color', this.color);
      }
//console.log("Object ", this.$UID, this.name_, " ", this.projectionMatrix.flat, this.parent.positionMatrix.flat, this.relativePosition.flat, this.meshMatrix.flat)
//console.log("Object ", this.$UID, this.name_, " ", this.x, this.y);

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
      }
    },
  ],


});