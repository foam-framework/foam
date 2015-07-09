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
  name: 'Rectangle',
  requires: [ 'foam.graphics.webgl.Shader' ],

  extendsModel: 'foam.graphics.webgl.Object',

  properties: [
    {
      name: 'color',
      defaultValueFn: function() { return [1.0, 1.0, 1.0, 1.0]; }, // white
      postSet: function() {
        this.program.fragmentShader = this.Shader.create({
          type: "fragment",
          source:
            "void main(void) {\n" +
            "  gl_FragColor = vec4("+
                this.color[0]+","+
                this.color[1]+","+
                this.color[2]+","+
                this.color[3]+
               ");\n"+
            "}\n"
        });
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      this.relativePosition = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.01],
        [0.0, 0.0, 0.0, 1.0]
      ]

      this.mesh = this.ArrayBuffer.create({
        drawMode: 'triangle strip',
        vertices: [
          1.0, 1.0, 0.0,
          0.0, 1.0, 0.0,
          1.0, 0.0, 0.0,
          0.0, 0.0, 0.0
        ]
      });
      this.textureCoords = this.mesh;

      this.program = this.Program.create();
      this.color = this.color;
      this.program.vertexShader = this.Shader.create({
        type: "vertex",
        source: function() {/*
          attribute vec3 aVertexPosition;

          uniform mat4 positionMatrix;
          uniform mat4 projectionMatrix;

          void main(void) {
            gl_Position = projectionMatrix * positionMatrix * vec4(aVertexPosition, 1.0);
          }
        */}
        });

    },

    function paintSelf() {
      var gl = this.gl;
      if ( ! gl ) return;



    }
  ]

});