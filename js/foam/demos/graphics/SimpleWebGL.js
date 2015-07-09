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
  package: 'foam.demos.graphics',
  name: 'SimpleWebGL',
  extendsModel: 'foam.graphics.webgl.Scene',

  requires: [
    'foam.graphics.webgl.Object',
    'foam.graphics.webgl.Shader',
    'foam.graphics.webgl.Program',
    'foam.graphics.webgl.ArrayBuffer',
    'foam.graphics.webgl.GLCView',
    'foam.graphics.Circle as CViewCircle',
    'foam.graphics.webgl.Circle',
    'foam.graphics.webgl.Rectangle',
  ],

  properties: [
    { name: 'width', defaultValue: 1024  },
    { name: 'height', defaultValue: 800  },
    { name: 'ring' },
    { name: 'object' },
  ],

  methods: [
    function init() {
      //////////////////////////////////////////////
      var obj = this.Object.create();
      var bigSquare = obj;

      var prog = this.Program.create({}, obj.Y);
      var frag = this.Shader.create({
        type: "fragment",
        source: function() {/*
          void main(void) {
            gl_FragColor = vec4(0.8, 0.5, 0.5, 0.9);
          }
        */}
        }, prog.Y);
      var vert = this.Shader.create({
        type: "vertex",
        source: function() {/*
          attribute vec3 aVertexPosition;

          uniform mat4 positionMatrix;
          uniform mat4 projectionMatrix;

          void main(void) {
            gl_Position = projectionMatrix * positionMatrix * vec4(aVertexPosition, 1.0);
          }
        */}
        }, prog.Y);
      prog.vertexShader = vert;
      prog.fragmentShader = frag;

      var mesh = this.ArrayBuffer.create({
        drawMode: 'triangle strip',
        vertices: [
          1.0,  1.0,  0.0,
          -1.0, 1.0,  0.0,
          1.0,  -1.0, 0.0,
          -1.0, -1.0, 0.0
        ]
      });

      obj.program = prog;
      obj.mesh = mesh;
      obj.translucent = true;

      this.addChild(obj);
      this.object = obj;

      ////////////////////////////////////////////////
      // another object
//       var obj = this.Object.create();

//       var prog = this.Program.create({}, obj.Y);
//       var frag = this.Shader.create({
//         type: "fragment",
//         source: function() {/*
//           void main(void) {
//             gl_FragColor = vec4(0.5, 0.9, 0.9, 1.0);
//           }
//         */}
//         }, prog.Y);
//       var vert = this.Shader.create({
//         type: "vertex",
//         source: function() {/*
//           attribute vec3 aVertexPosition;

//           uniform mat4 positionMatrix;
//           uniform mat4 projectionMatrix;

//           void main(void) {
//             gl_Position = projectionMatrix * positionMatrix * vec4(aVertexPosition, 1.0);
//           }
//         */}
//         }, prog.Y);
//       prog.vertexShader = vert;
//       prog.fragmentShader = frag;

//       var mesh = this.ArrayBuffer.create({
//         drawMode: 'triangle strip',
//         vertices: [
//           0.6,  0.6,  0.0,
//           -0.6, 0.6,  0.0,
//           0.6,  -0.6, 0.0,
//           -0.6, -0.6, 0.0
//         ]
//       });

//       obj.program = prog;
//       obj.mesh = mesh;

//       obj.relativePosition = [
//         [1.0, 0.0, 0.0, 0.3],
//         [0.0, 1.0, 0.0, 0.0],
//         [0.0, 0.0, 1.0, -0.3],
//         [0.0, 0.0, 0.0, 1.0]
//       ]

//       this.addChild(obj);

      var rect = this.Rectangle.create({ width: 4, height: 3, color: [0.4,0.4,0.6,0.8]});
      this.addChild(rect);

      ////////////////////////////////////////////


//       var circle = this.CViewCircle.create({
//         color: 'red', radius: 0.001, x: 0.5, y: 0.5, width: 1, height: 1
//       });

//       bigSquare.addChild(circle);

      ///////////////////////////////////////////////

      var circ3d = this.Circle.create({ r: 1, color: [0.5,0.87,0.5,1.0], borderRatio: 0.05 });
      this.ring = circ3d;
      this.addChild(circ3d);

      ///////////////////////////////////////////////

      this.update();
    }
  ],

  listeners: [
    {
      name: 'update',
      framed: true,
      code: function() {
        this.view && this.view.paint();

        if ( this.ring.relativePosition ) {
          this.ring.relativePosition =
            this.ring.relativePosition.x(Matrix.RotationX(0.1).ensure4x4())
          this.ring.relativePosition =
            this.ring.relativePosition.x(Matrix.RotationZ(0.02).ensure4x4());
          this.ring.relativePosition =
            this.ring.relativePosition.x(Matrix.RotationZ(0.04).ensure4x4());
        }
        if ( this.object.relativePosition ) {
          this.object.relativePosition =
            this.object.relativePosition.x(Matrix.RotationX(0.01).ensure4x4())
        }

        this.X.setTimeout(this.update, 16);
      }
    }
  ]

});

