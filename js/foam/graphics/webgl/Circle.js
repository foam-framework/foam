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
  name: 'Circle',
  requires: [
    'foam.graphics.webgl.Shader',
    'foam.graphics.webgl.ArrayBuffer',
    'foam.graphics.webgl.Program'
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
      }
    },
    {
      name: 'segments',
      defaultValue: 32
    },
    {
      name: 'r',
      defaultValue: 20,
      postSet: function() {
        if ( this.relativePosition && this.relativePosition.elements ) {
          this.relativePosition.elements[0][0] = this.r;
          this.relativePosition.elements[1][1] = this.r;
        }
      }
    },
  ],

  methods: [

    function paintSelf(tr) {


      this.SUPER(tr);
    },

    function init() {
      this.SUPER();

      // create the mesh in a -1 to 1 unit box, then scale by the current radius
      this.relativePosition = [
        [this.r, 0.0, 0.0, 0.0],
        [0.0, this.r, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.01],
        [0.0, 0.0, 0.0, 1.0]
      ]

       this.mesh = this.ArrayBuffer.create({
         drawMode: 'triangle fan',
         vertices: this.circleVertices()
       });

      this.program = this.Program.create();
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
      this.color = [ 1.0, 0.5, 0.5, 1.0 ];

    },

    function circleVertices() {
      /* Create a mesh for a 'triangle fan' circle */
      var v = [].slice();
      var segs = this.segments;
      var r = 1;//this.r;
      function circPt(i) {
        return [
           (Math.sin(2 * Math.PI * i / segs) * r),
          -(Math.cos(2 * Math.PI * i / segs) * r),
          0.0
        ];
      };
      // start with the center
      v = v.concat([0.0, 0.0, 0.0]);

      // add the rest of the edge vertices to complete the fan
      for (var i = 0; i < segs; i++) {
        v = v.concat(circPt(i));
      }
      v = v.concat(circPt(0));
      return v;
    },

  ]

});