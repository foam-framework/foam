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
    'foam.graphics.Circle',
  ],

  properties: [
    { name: 'width', defaultValue: 1024  },
    { name: 'height', defaultValue: 800  },
    { name: 'object' },
  ],

  methods: [
    function init() {
      //////////////////////////////////////////////
      var obj = this.Object.create();

      var prog = this.Program.create({}, obj.Y);
      var frag = this.Shader.create({
        type: "fragment",
        source: function() {/*
          void main(void) {
            gl_FragColor = vec4(1.0, 0.5, 0.5, 0.9);
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
//             gl_FragColor = vec4(0.5, 1.0, 1.0, 1.0);
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

//       this.addChild(obj);


      ////////////////////////////////////////////


      var obj = this.GLCView.create();
      var circle = this.Circle.create({
        color: 'red', radius: 100, x: 50, y: 50, width: 100, height: 100
      });

      obj.sourceView = circle;

      this.addChild(obj);

      ///////////////////////////////////////////////

      this.update();
    }
  ],

  listeners: [
    {
      name: 'update',
      framed: true,
      code: function() {
        this.paint();

        if ( this.object.relativePosition ) {
          this.object.relativePosition =
            this.object.relativePosition.x(Matrix.RotationY(0.02).ensure4x4());
        }

        this.X.setTimeout(this.update, 50);
      }
    }
  ]

});

