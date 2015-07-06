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
  name: 'GLCView',
  requires: [
    'foam.graphics.webgl.ArrayBuffer',
    'foam.graphics.webgl.Shader',
    'foam.graphics.webgl.Program',
  ],

  extendsModel: 'foam.graphics.webgl.Object',


  properties: [
    {
      name: 'sourceView',
      type: 'foam.graphics.CView',
      postSet: function() {
        this.$canvas = this.X.document.createElement('canvas');
        this.$canvas.width = this.sourceView.width;
        this.$canvas.height = this.sourceView.height;
        this.canvas = this.$canvas.getContext('2d');

        this.sourceView.canvas = this.canvas;
        this.sourceView.view = this;
        this.render();
      }
    },
    {
      name: 'canvas',
      getter: function() {
        return this.instance_.canvas;
      }
    },
    {
      name: '$canvas'
    },
    {
      name: '$',
      getter: function() { return this.$canvas; }
    },
    {
      name: 'texture'
    }
  ],

  methods: [
    function init() {
      this.mesh = this.ArrayBuffer.create({
        drawMode: 'triangle strip',
        vertices: [
          1.0, 1.0, 0.0,
          0.0, 1.0, 0.0,
          1.0, 0.0, 0.0,
          0.0, 0.0, 0.0
        ]
      });

      this.program = this.Program.create();
      this.program.fragmentShader = this.Shader.create({
        type: "fragment",
        source: function() {/*
          precision mediump float;

          varying vec2 vTextureCoord;

          uniform sampler2D uSampler;

          void main(void) {
            gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
          }
        */}
        });
      this.program.vertexShader = this.Shader.create({
        type: "vertex",
        source: function() {/*
          attribute vec3 aVertexPosition;

          uniform mat4 positionMatrix;
          uniform mat4 projectionMatrix;

          varying vec2 vTextureCoord;

          void main(void) {
            gl_Position = projectionMatrix * positionMatrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = vec2(aVertexPosition.x, aVertexPosition.y);
          }
        */}
        });

    },

    function render() {
      if ( ! this.gl ) return;

      // paint into our off-canvas buffer
      this.sourceView.paint();

      // Create a texture object that will contain the image.
      this.texture = this.gl.createTexture();

      // Bind the texture the target (TEXTURE_2D) of the active texture unit.
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

      // Flip the image's Y axis to match the WebGL texture coordinate space.
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

      // Set the parameters so we can render any size image.
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        // Upload the resized canvas image into the texture.
      //    Note: a canvas is used here but can be replaced by an image object.
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.$canvas);
    },

    function paintSelf() {
      var gl = this.gl;
      if ( ! gl ) return;

      if ( ! this.texture ) this.render();

      this.program.use();
      var sampler = gl.getUniformLocation(this.program.program, "uSampler");
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(sampler, 0);

      this.SUPER();
    },

    // destroy texture?

  ]

});