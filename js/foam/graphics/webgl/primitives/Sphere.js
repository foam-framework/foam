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
  package: 'foam.graphics.webgl.primitives',
  name: 'Sphere',
  requires: [
    'foam.graphics.webgl.core.Shader',
    'foam.graphics.webgl.core.ArrayBuffer',
    'foam.graphics.webgl.core.Program',
    'foam.graphics.webgl.matrix.ScaleMatrix4'
  ],

  imports: [
    'glMeshLibrary'
  ],

  extends: 'foam.graphics.webgl.core.Object',

  properties: [
    {
      name: 'color',
      defaultValueFn: function() { return [1.0, 1.0, 1.0, 1.0]; }, // white
      postSet: function() {
        // auto-set translucent rendering mode
        this.translucent = this.color[3] < 1.0;
      }
    },
    {
      name: 'segments',
      defaultValue: 64,
    },
    {
      name: 'r',
      defaultValue: 1,
    },
    {
      name: 'meshMatrix',
      lazyFactory: function() {
        return this.ScaleMatrix4.create({ sx$: this.r$, sy$: this.r$, sz$: this.r$ });
      }
    },

  ],

  methods: [

    function init() {
      this.SUPER();

      this.mesh = this.glMeshLibrary.getMesh('sphere', this.segments);
      this.meshNormals = this.glMeshLibrary.getNormals('sphere', this.segments );

//       this.program = this.Program.create();
//       this.program.fragmentShader = this.Shader.create({
//         type: "fragment",
//         source:
//           "precision lowp float;\n"+
//           "uniform vec4 color;\n"+
//           "void main(void) {\n" +
//           "  gl_FragColor = color;\n"+
//           "}\n"
//       });
//       this.program.vertexShader = this.Shader.create({
//         type: "vertex",
//         source: function() {/*
//           attribute vec3 aVertexPosition;

//           uniform mat4 positionMatrix;
//           uniform mat4 relativeMatrix;
//           uniform mat4 projectionMatrix;
//           uniform mat4 meshMatrix;

//           void main(void) {
//             gl_Position = projectionMatrix * positionMatrix * relativeMatrix * meshMatrix * vec4(aVertexPosition, 1.0);
//           }
//         */}
//         });
      this.program = this.Program.create();
      this.program.fragmentShader = this.Shader.create({
        type: "fragment",
        source: function() {/*
          precision lowp float;
          uniform vec4 color;

          varying vec3 vNormal;
          varying vec3 vPosition;

          void main(void) {
            vec4 dark = vec4(0.0, 0.0, 0.0, 1.0);
            vec3 uLight = vec3(-10, -10, 15);

            // Mix in diffuse light
            float diffuse = dot(normalize(uLight), normalize(vNormal));
            diffuse = max(0.0, diffuse);

            gl_FragColor = mix(dark, color, 0.5 + 0.9 * diffuse);
          }
        */},
      });
      this.program.vertexShader = this.Shader.create({
        type: "vertex",
        source: function() {/*

          attribute vec3 aVertexPosition;
          attribute vec3 aNormal;

          uniform mat4 positionMatrix;
          uniform mat4 relativeMatrix;
          uniform mat4 projectionMatrix;
          uniform mat4 meshMatrix;

          uniform mat4 normalMatrix;

          varying vec3 vNormal;
          varying vec3 vPosition;

          //vec3 aNormal = vec3(0.5, 0.5, 1);


          void main(void) {
            mat4 matrix = projectionMatrix * positionMatrix * relativeMatrix * meshMatrix;
            vNormal = vec3(normalMatrix * vec4(aNormal, 1.0));
            vPosition = vec3(matrix * vec4(aVertexPosition, 1.0));
            gl_Position = matrix * vec4(aVertexPosition, 1.0);
          }
        */},
        });
    },

    function intersects(c) {
      var r = this.r + c.r;
      var dx = this.x-c.x;
      var dy = this.y-c.y;
      return ( ((dx+dy) < r) ) && ( Movement.distance(dx, dy) < r );
    },


  ]

});