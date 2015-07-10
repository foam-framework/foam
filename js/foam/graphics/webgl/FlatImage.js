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
  name: 'FlatImage',
  extendsModel: 'foam.graphics.webgl.Object',
  
  requires: [
    'foam.graphics.webgl.ArrayBuffer',
    'foam.graphics.webgl.Shader',
    'foam.graphics.webgl.Program',
  ],
  
  properties: [
    {
      name: 'src',
      label: 'Source'
    },
    {
      name: 'texture'
    },
    {
      name: 'textureCoords'
    },
    {
      name: 'translucent',
      defaultValue: true
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

      Events.dynamic(function() { this.sylvesterLib.loaded; }.bind(this),
        function() {
          this.width = this.width;
          this.height = this.height;
        }.bind(this)
      );

      this.program = this.Program.create();
      this.program.fragmentShader = this.Shader.create({
        type: "fragment",
        source: function() {/*
          precision mediump float;

          varying vec2 vTextureCoord;

          uniform sampler2D uSampler;

          void main(void) {

            vec4 texel = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
            //if(texel.a < 0.1)
            //   discard;
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

      this.image_ = new Image();
      this.image_.onload = function() {
        this.render();
      }.bind(this);
      this.image_.src = this.src;
      this.render();
    },
    
    function render() {
      if ( ! this.gl ) return;

      //this.width = this.image_.width;
      //this.height = this.image_.height;

      // Create a texture object that will contain the image.
      this.texture = this.gl.createTexture();

      // Bind the texture the target (TEXTURE_2D) of the active texture unit.
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

      // Flip the image's Y axis to match the WebGL texture coordinate space.
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      //this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

      // Set the parameters so we can render any size image.
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        // Upload the resized canvas image into the texture.
      //    Note: a canvas is used here but can be replaced by an image object.
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image_);
    },

    function paintSelf(translucent) {
      if ( this.translucent !== translucent ) return;

      var gl = this.gl;
      if ( ! gl ) return;

      if ( ! this.texture ) this.resize();

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


  ]
});
