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
  requires: [
    'foam.graphics.webgl.Shader',
    'foam.graphics.webgl.ArrayBuffer',
    'foam.graphics.webgl.Program',
  ],

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
        // auto-set translucent rendering mode
        this.translucent = this.color[3] < 1.0;
        this.instance_.alpha = this.color[3];
      }
    },
    {
      name: 'alpha',
      postSet: function() {
        if ( this.instance_.color ) this.color = [this.color[0], this.color[1], this.color[2], this.instance_.alpha];
        this.translucent = this.alpha < 1.0;
      }
    },
    {
      name: 'width',
      defaultValue: 10,
      postSet: function() {
        if ( this.meshMatrix && this.meshMatrix.elements ) {
          this.meshMatrix.elements[0][0] = this.width;
        }
      }
    },
    {
      name: 'height',
      defaultValue: 10,
      postSet: function() {
        if ( this.meshMatrix && this.meshMatrix.elements ) {
          this.meshMatrix.elements[1][1] = this.height;
          this.meshMatrix.elements[1][3] = -this.height;
        }
      }
    },


  ],

  methods: [
    function init() {
      this.SUPER();

      this.meshMatrix = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
      ]

      Events.dynamic(function() { this.sylvesterLib.loaded; }.bind(this),
        function() {
          this.width = this.width;
          this.height = this.height;
        }.bind(this)
      );


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
          uniform mat4 relativeMatrix;
          uniform mat4 projectionMatrix;
          uniform mat4 meshMatrix;

          void main(void) {
            gl_Position = projectionMatrix * positionMatrix * relativeMatrix * meshMatrix * vec4(aVertexPosition, 1.0);
          }
        */}
        });

    }

  ]

});