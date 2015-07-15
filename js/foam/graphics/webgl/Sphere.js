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
  name: 'Sphere',
  requires: [
    'foam.graphics.webgl.Shader',
    'foam.graphics.webgl.ArrayBuffer',
    'foam.graphics.webgl.Program',
    'foam.graphics.webgl.ScaleMatrix4'
  ],

  imports: [
    'glMeshLibrary'
  ],

  extendsModel: 'foam.graphics.webgl.Object',

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

      this.program = this.Program.create();
      this.program.fragmentShader = this.Shader.create({
        type: "fragment",
        source:
          "precision lowp float;\n"+
          "uniform vec4 color;\n"+
          "void main(void) {\n" +
          "  gl_FragColor = color;\n"+
          "}\n"
      });
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

    },

    function intersects(c) {
      var r = this.r + c.r;
      var dx = this.x-c.x;
      var dy = this.y-c.y;
      return ( ((dx+dy) < r) ) && ( Movement.distance(dx, dy) < r );
    },


  ]

});