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
  name: 'Circle',
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
      type: 'Int',
      name: 'segments',
      defaultValue: 64,
      postSet: function() {
        this.borderRatio = this.borderRatio;
      }
    },
    {
      name: 'r',
      defaultValue: 1,
    },
    {
      name: 'borderRatio',
      defaultValue: 1.0,
      help: 'The proportion of radius to draw as solid. 1.0 is a filled circle, 0.01 a thin ring. Negative values extend outward.',
      postSet: function() {
        this.mesh = this.glMeshLibrary.getMesh('flatRing', this.segments, this.borderRatio, (this.borderRatio < 1)? this.borderRatio : 0 );
        this.meshNormals = this.glMeshLibrary.getNormals('flatRing', this.segments, this.borderRatio, (this.borderRatio < 1)? this.borderRatio : 0 );
      }
    },
    {
      name: 'meshMatrix',
      lazyFactory: function() {
        return this.ScaleMatrix4.create({ sx$: this.r$, sy$: this.r$, sz$: this.r$ });
      }
    },
    {
      type: 'Int',
      name: 'dynamicLOD',
      help: 'If above zero, scales the segments with the radius. This value acts as a divisor: Log(r/dynamicLOD). Large values mean fewer segments for a given radius.',
      postSet: function(old,nu) {
        Events.unfollow(this.r$, this.segments$);
        if (nu > 0) {
          Events.map(this.r$, this.segments$, function(r) { 
            var n = Math.max(Math.ceil(Math.log( r / nu )), 1);
            n = Math.pow(2,n) * 8;         
            return n;
          });
          
        }
        
      }
      
    }
  ],

  methods: [

    function init() {
      this.SUPER();

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
      //this.color = this.color; // reset the fragment shader
      this.borderRatio = this.borderRatio;
    },

    function intersects(c) {
      var r = this.r + c.r;
      var dx = this.x-c.x;
      var dy = this.y-c.y;
      return ( ((dx+dy) < r) ) && ( Movement.distance(dx, dy) < r );
    },


  ]

});