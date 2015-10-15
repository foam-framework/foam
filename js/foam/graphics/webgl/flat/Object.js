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
  package: 'foam.graphics.webgl.flat',
  name: 'Object',
  extends: 'foam.graphics.webgl.core.Object',

  requires: [
    'foam.graphics.webgl.core.ArrayBuffer',
    'foam.graphics.webgl.core.Shader',
    'foam.graphics.webgl.core.Program',
    'foam.graphics.webgl.matrix.ScaleMatrix4',
    'foam.graphics.webgl.matrix.StackMatrix4',
    'foam.graphics.webgl.matrix.TransMatrix4',
  ],

  properties: [
    {
      name: 'texture'
    },
    {
      name: 'textureCoords'
    },
    {
      name: 'width',
      defaultValue: 10,
    },
    {
      name: 'height',
      defaultValue: 10,
    },
    {
      name: 'meshMatrix',
      lazyFactory: function() {
        var sc = this.ScaleMatrix4.create();
        Events.map(this.width$, sc.sx$, function(v) { return v; });
        Events.map(this.height$, sc.sy$, function(v) { return -v; });
        Events.map(this.width$, sc.sz$, function(v) { return v; });

        return this.StackMatrix4.create({ stack: [
          this.TransMatrix4.create({ y: -1  }),
          sc
        ]});
      }
    },
    {
      name: 'shapeName',
      defaultValue: 'flatUnitRectangle',
      postSet: function() {
        this.mesh = this.glMeshLibrary.getMesh(this.shapeName);
        this.meshNormals = this.glMeshLibrary.getNormals(this.shapeName);
        this.textureCoords = this.mesh;
      }
    },

  ],

  methods: [
    function init() {
      this.SUPER();
      this.shapeName = this.shapeName;

      this.program = this.Program.create();
      this.program.fragmentShader = this.Shader.create({
        type: "fragment",
        source: function() {/*
          precision mediump float;

          varying vec3 vNormal;
          varying vec3 vPosition;

          varying vec2 vTextureCoord;
          uniform sampler2D uSampler;

          void main(void) {
            vec4 texel = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
            if(texel.a < 0.01)
              discard;

            vec4 dark = vec4(0.0, 0.0, 0.0, 1.0);
            vec3 uLight = vec3(-10, -10, 15);

            // Mix in diffuse light
            float diffuse = dot(normalize(uLight), normalize(vNormal));
            diffuse = max(0.0, diffuse);

            gl_FragColor = mix(dark, texel, 0.5 + 0.9 * diffuse);
          }
        */},

      });
      this.program.vertexShader = this.Shader.create({
        type: "vertex",
        source: function() {/*
          attribute vec3 aVertexPosition;
          attribute vec3 aTexPosition;
          attribute vec3 aNormal;

          uniform mat4 positionMatrix;
          uniform mat4 relativeMatrix;
          uniform mat4 projectionMatrix;
          uniform mat4 meshMatrix;
          uniform mat4 normalMatrix;

          varying vec2 vTextureCoord;
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main(void) {
            mat4 matrix = projectionMatrix * positionMatrix * relativeMatrix * meshMatrix;
            vNormal = vec3(normalMatrix * vec4(aNormal, 1.0));
            vPosition = vec3(matrix * vec4(aVertexPosition, 1.0));
            gl_Position = matrix * vec4(aVertexPosition, 1.0);
            vTextureCoord = vec2(aTexPosition.x, aTexPosition.y);
          }
        */}
      });
    },

    function textureSource() {
      /* return the image or video element to extract the texture from */
    },

    function render() {
      var gl = this.gl;
      if ( ! gl ) return;

      // Create a texture object that will contain the image.
      if ( ! this.texture ) {
        this.texture = gl.createTexture();
      }

      // Bind the texture the target (TEXTURE_2D) of the active texture unit.
      gl.bindTexture(gl.TEXTURE_2D, this.texture);

      // Flip the image's Y axis to match the WebGL texture coordinate space.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

      // Set the parameters so we can render any size image.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Upload the resized canvas image into the texture.
      //    Note: a canvas is used here but can be replaced by an image object.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureSource());
    },

    function paintSelf(translucent) {
      if ( this.translucent !== translucent ) return;

      var gl = this.gl;
      if ( ! gl || ! this.texture ) return;

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
