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
  name: 'Object',
  requires: [
    'foam.graphics.webgl.matrix.StackMatrix4',
    'foam.graphics.webgl.matrix.TransMatrix4',
    'foam.graphics.webgl.matrix.RotMatrix4',
    'foam.graphics.webgl.matrix.InverseMatrix4',
    'foam.graphics.webgl.matrix.TransposeMatrix4',
    'foam.graphics.webgl.matrix.Matrix4',
    'foam.graphics.webgl.Matrix4Uniform'
  ],
  extends: 'foam.graphics.webgl.GLView',

  imports: [
    'projectionMatrix$',
    'glMeshLibrary',
  ],
  exports: [
    'gl$',
  ],

  properties: [
    {
      name: 'relativePosition',
      lazyFactory: function() {
        return this.StackMatrix4.create({
            stack: [
              this.RotMatrix4.create({ angle$: this.angle$, axis$: this.axis$ }),
              this.TransMatrix4.create({ x$: this.x$, y$: this.y$, z$: this.z$ })
            ]
        });
      },
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
      lazyFactory: function() {
        return this.updatePosition();
      }
    },
    {
      name: 'mesh',
    },
    {
      name: 'meshNormals',
      postSet: function(old, nu) {
        this.doUpdatePosition();
      }
    },
    {
      name: 'meshMatrix',
      help: 'Transformations to apply to the mesh, but not pass on to children.',
      lazyFactory: function() {
        return this.Matrix4.create();
      }
    },
    {
      name: 'normalMatrix',
      help: 'The inverse transpose of the positioning matrix (pos*rel*mesh)',
      lazyFactory: function() {
        // only fill this in if normals are set
        return this.Matrix4.create();
      },
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
      name: 'parentPosition_'
    },
    {
      type: 'Boolean',
      name: 'translucent',
      defaultValue: false
    }
  ],

  listeners: [
    {
      name: 'doUpdatePosition',
      code: function(obj, topic) {
        this.positionMatrix = this.updatePosition();
        this.parentPosition_ = this.parent.positionMatrix;

        if (this.meshNormals) {
          this.normalMatrix = this.TransposeMatrix4.create({ source:
            this.InverseMatrix4.create({ source:
                this.positionMatrix
// TODO: adding the mesh matrix can mess up the normals when scaling+rotating
//               this.StackMatrix4.create({ stack: [
//                 this.positionMatrix, this.meshMatrix
//               ]})
            })
          });
        }
      }
    }

  ],

  methods: [
    function init() {
      this.Matrix4Uniform.create({
        name: 'relativeMatrix',
        matrix$: this.relativePosition$,
        program$: this.program$
      });
      this.Matrix4Uniform.create({
        name: 'positionMatrix',
        matrix$: this.parentPosition_$,
        program$: this.program$
      });
      this.Matrix4Uniform.create({
        name: 'meshMatrix',
        matrix$: this.meshMatrix$,
        program$: this.program$
      });
      this.Matrix4Uniform.create({
        name: 'projectionMatrix',
        matrix$: this.projectionMatrix$,
        program$: this.program$
      });
      this.Matrix4Uniform.create({
        name: 'normalMatrix',
        matrix$: this.normalMatrix$,
        program$: this.program$
      });

    },

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

      this.program.use();

      // normals
      if (this.meshNormals) {
        var norms = this.gl.getAttribLocation(this.program.program, "aNormal");
        if (norms >= 0) {
          this.meshNormals.bind();
          this.gl.vertexAttribPointer(norms, 3, gl.FLOAT, false, 0, 0);
          this.gl.enableVertexAttribArray(norms);
        }
      }

      // vertices
      this.mesh.bind();
      vertexPositionAttribute = this.gl.getAttribLocation(this.program.program, "aVertexPosition");
      this.gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(vertexPositionAttribute);

      // color
      if ( this.color && Array.isArray(this.color) ) {
        var colorUniform = this.gl.getUniformLocation(this.program.program, "color");
        this.gl.uniform4fv(colorUniform, new Float32Array(this.color));
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