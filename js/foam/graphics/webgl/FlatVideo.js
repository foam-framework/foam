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
  name: 'FlatVideo',
  extendsModel: 'foam.graphics.webgl.FlatObject',

  requires: [
    'foam.graphics.webgl.ArrayBuffer',
    'foam.graphics.webgl.Shader',
    'foam.graphics.webgl.Program',
    'foam.graphics.webgl.ScaleMatrix4',
  ],

  properties: [
    {
      name: 'src',
      label: 'Source',
      postSet: function() {
        this.$video = this.X.document.createElement('video');
        this.$video.src = 'Google in Waterloo Region - Ontario  Canada.mp4'
        this.$video.preload = true;
        this.$video.autoplay = true;
      }
    },
    {
      name: '$video'
    },
    {
      name: 'texture'
    },
    {
      name: 'textureCoords'
    },
    {
      name: 'translucent',
      defaultValue: false
    },

  ],

  methods: [
    function init() {
      this.SUPER();

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
      this.program.fragmentShader = this.Shader.create({
        type: "fragment",
        source: function() {/*
          precision mediump float;

          varying vec2 vTextureCoord;

          uniform sampler2D uSampler;

          void main(void) {

            vec4 texel = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
            if(texel.a < 0.01)
               discard;
            gl_FragColor = texel;
          }
        */}
      });
      this.program.vertexShader = this.Shader.create({
        type: "vertex",
        source: function() {/*
          attribute vec3 aVertexPosition;
          attribute vec3 aTexPosition;

          uniform mat4 positionMatrix;
          uniform mat4 relativeMatrix;
          uniform mat4 projectionMatrix;
          uniform mat4 meshMatrix;

          varying vec2 vTextureCoord;

          void main(void) {
            gl_Position = projectionMatrix * positionMatrix * relativeMatrix * meshMatrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = vec2(aTexPosition.x, aTexPosition.y);
          }
        */}
      });


    },

    function render() {
      if ( ! this.gl || ! this.$video || ! (this.$video.readyState == 4) ) return;
      var gl = this.gl;


      if ( ! this.texture ) {
        // Create a texture object that will contain the image.
        this.texture = this.gl.createTexture();
      }

      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.$video);

      //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      //gl.generateMipmap(gl.TEXTURE_2D);
      //gl.bindTexture(gl.TEXTURE_2D, null);
    },

    function paintSelf(translucent) {
      if ( this.translucent !== translucent ) return;

      var gl = this.gl;
      if ( ! gl || ! this.$video ) return;

      this.render();

      if ( ! this.texture ) return;

      this.program.use();
      var sampler = gl.getUniformLocation(this.program.program, "uSampler");
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(sampler, 0);

      // attribute vars
      this.textureCoords.bind();
      var texPositionAttribute = this.gl.getAttribLocation(this.program.program, "aTexPosition");
      this.gl.vertexAttribPointer(texPositionAttribute, 3, gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(texPositionAttribute);

      this.SUPER(translucent);

    },

    function destroy() {
      if ( this.$video ) {
        this.$video.pause();
        this.$video = null;
        this.texture = null;
      }
    }
  ]
});
