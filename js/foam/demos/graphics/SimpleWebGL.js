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
  extends: 'foam.graphics.webgl.core.Scene',

  requires: [
    'foam.graphics.webgl.core.Object',
    'foam.graphics.webgl.core.Shader',
    'foam.graphics.webgl.core.Program',
    'foam.graphics.webgl.core.ArrayBuffer',
    'foam.graphics.webgl.CViewGLView',
    'foam.graphics.Circle as CViewCircle',
    'foam.graphics.webgl.primitives.Circle',
    'foam.graphics.webgl.primitives.Rectangle',
    'foam.graphics.webgl.matrix.RotMatrix4',
    'foam.graphics.webgl.matrix.TransMatrix4',
    'foam.graphics.webgl.matrix.StackMatrix4',
  ],

  properties: [
    { name: 'width', defaultValue: 1024  },
    { name: 'height', defaultValue: 800  },
    { name: 'ring' },
    { name: 'object' },
    { name: 'time', defaultValue: 0 },
    { name: 'cameraAngle', defaultValue: 0 },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.positionMatrix = this.StackMatrix4.create({ stack: [
        this.RotMatrix4.create({ axis:[0,1,0], angle$: this.cameraAngle$ }) , this.positionMatrix
      ]});


      //////////////////////////////////////////////
      var obj = this.Object.create();
      var bigSquare = obj;

      var prog = this.Program.create({}, obj.Y);
      var frag = this.Shader.create({
        type: "fragment",
        source: function() {/*
          void main(void) {
            gl_FragColor = vec4(0.6, 0.6, 0.8, 0.9);
          }
        */}
        }, prog.Y);
      var vert = this.Shader.create({
        type: "vertex",
        source: function() {/*
          attribute vec3 aVertexPosition;

          uniform mat4 positionMatrix;
          uniform mat4 relativeMatrix;
          uniform mat4 projectionMatrix;
          uniform mat4 meshMatrix;

          void main(void) {
            gl_Position = projectionMatrix * positionMatrix * relativeMatrix * meshMatrix * vec4(aVertexPosition, 1.0);
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

      //var rect = this.Rectangle.create({ width: 4, height: 3, color: [0.4,0.4,0.6,0.8]});
      //this.addChild(rect);

      ////////////////////////////////////////////


//       var circle = this.CViewCircle.create({
//         color: 'red', radius: 0.001, x: 0.5, y: 0.5, width: 1, height: 1
//       });

//       bigSquare.addChild(circle);

      ///////////////////////////////////////////////
      var create = function(rad) {
        var circ3d = this.Circle.create({
          r: rad,
          color: [rad,rad,0.5,1.0],
          borderRatio: 0.05,
          axis: [1,1,1]
        });
        Events.map(this.time$, circ3d.angle$, function(a) { return a * rad * 0.1; });
        this.addChild(circ3d);
      }.bind(this);
      for (var rad = 0.5; rad <= 1; rad+= 0.05) {
        create(rad);
      }
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

        this.time += 1;

        this.cameraAngle = this.time * 0.01;

        this.X.setTimeout(this.update, 16);
      }
    }
  ]

});

