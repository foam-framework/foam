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
          } else {
            this.instance_.relativePosition = Matrix.I(4);
          }
          return this.instance_.relativePosition;
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
        this.updatePosition();
      }
    },
    {
      name: 'y',
      getter: function() {
        return this.relativePosition && this.relativePosition.elements && -(this.relativePosition.elements[1][3]);
      },
      postSet: function(old, nu) {
        this.relativePosition && this.relativePosition.elements && (this.relativePosition.elements[1][3] = -nu);
        this.updatePosition();
      }
    },
    {
      name: 'z',
      getter: function() {
        return this.relativePosition && this.relativePosition.elements && -(this.relativePosition.elements[2][3]);
      },
      postSet: function(old, nu) {
        this.relativePosition && this.relativePosition.elements && (this.relativePosition.elements[2][3] = -nu);
        this.updatePosition();
      }
    },
    {
      name: 'positionMatrix',
      type: 'Matrix',
      getter: function() {
        if ( GLOBAL.Matrix ) {
          if ( ! this.instance_.positionMatrix ) {
            var b = (this.parent && this.parent.positionMatrix) || Matrix.I(4);
            var r = this.relativePosition || Matrix.I(4);
            this.instance_.positionMatrix = b.x(r);
          }
          return this.instance_.positionMatrix;
        }
        return null;
      }
    },
    {
      name: 'mesh',
      type: 'foam.graphics.webgl.ArrayBuffer'
    },
    {
      name: 'meshMatrix',
      help: 'Transformations to apply to the mesh, but not pass on to children.',
      getter: function() {
        if ( GLOBAL.Matrix ) {
          if ( this.instance_.meshMatrix ) {
            if ( Array.isArray(this.instance_.meshMatrix) ) {
              // convert to Matrix
              this.instance_.meshMatrix = $M(this.instance_.meshMatrix);
            }
          } else {
            this.instance_.meshMatrix = Matrix.I(4);
          }
          return this.instance_.meshMatrix;
        }

        return null;
      }
    },
//     {
//       name: 'finalMatrix_',
//       getter: function() {
//         if ( GLOBAL.Matrix ) {
//           if ( ! this.instance_.finalMatrix_ ) {
//             var m = this.meshMatrix || Matrix.I(4);
//             this.instance_.finalMatrix_ = this.positionMatrix.x(m);
//           }
//           return this.instance_.finalMatrix_;
//         }
//         return null;
//       }
//     },
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
        this.updatePosition();
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

      this.sylvesterLib.loaded$.addListener(this.setMatrices);
      this.relativePosition$.addListener(this.updatePosition);
      //this.meshMatrix$.addListener(this.updateMesh);
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

      if ( this.parent && this.parent.positionMatrix ) {
        var posUniform = this.gl.getUniformLocation(this.program.program, "positionMatrix");
        this.gl.uniformMatrix4fv(posUniform, false, new Float32Array(this.parent.positionMatrix.flatten()));
      } else {
        var posUniform = this.gl.getUniformLocation(this.program.program, "positionMatrix");
        this.gl.uniformMatrix4fv(posUniform, false, new Float32Array(Matrix.I(4)));
      }

      if ( this.relativePosition ) {
        var relUniform = this.gl.getUniformLocation(this.program.program, "relativeMatrix");
        this.gl.uniformMatrix4fv(relUniform, false, new Float32Array(this.relativePosition.flatten()));
      }

      if ( this.meshMatrix ) {
        var meshUniform = this.gl.getUniformLocation(this.program.program, "meshMatrix");
        this.gl.uniformMatrix4fv(meshUniform, false, new Float32Array(this.meshMatrix.flatten()));
      }

//       if ( this.finalMatrix_ ) {
//         var posUniform = this.gl.getUniformLocation(this.program.program, "positionMatrix");
//         this.gl.uniformMatrix4fv(posUniform, false, new Float32Array(this.finalMatrix_.flatten()));
//       }

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
        this.positionMatrix = null;
        //this.finalMatrix_ = null;
      },
    },
    {
      name: 'setMatrices',
      code: function() {      
        this.x = this.instance_.x ? this.instance_.x : 0;
        this.y = this.instance_.y ? this.instance_.y : 0;
        this.z = this.instance_.z ? this.instance_.z : 0;
          
        this.updatePosition();
      },
    },


  ]

});