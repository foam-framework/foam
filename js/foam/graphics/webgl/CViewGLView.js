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
  name: 'CViewGLView',
  requires: [
    'foam.graphics.webgl.core.ArrayBuffer',
    'foam.graphics.webgl.core.Shader',
    'foam.graphics.webgl.core.Program',
    'foam.graphics.webgl.matrix.ScaleMatrix4'
  ],

  imports: [
    'glMeshLibrary'
  ],

  extends: 'foam.graphics.webgl.flat.Object',

  properties: [
    {
      name: 'sourceView',
      postSet: function() {
        this.$canvas = this.X.document.createElement('canvas');
        //this.X.document.body.appendChild(this.$canvas); // Debug

        this.sourceView.addListener(this.resize);
        //this.sourceView.height$.addListener(this.resize);

        this.canvas = this.$canvas.getContext('2d');

        this.sourceView.canvas = this.canvas;
        this.sourceView.view = this.glueView;

        this.sourceView.initCView();

          // update x,y from CView
        this.relativePosition = this.StackMatrix4.create({
            stack: [
              this.TransMatrix4.create({
                x$: this.sourceView.x$, y$: this.sourceView.y$
               }),
               this.ScaleMatrix4.create({
                 sx$: this.sourceView.scaleX$, sy$: this.sourceView.scaleY$
               })
            ]
        });


        this.resize();
      }
    },
    {
      name: 'meshMatrix',
      lazyFactory: function() {
        var sc = this.ScaleMatrix4.create();
        Events.map(this.width$, sc.sx$, function(v) { return v; });
        Events.map(this.height$, sc.sy$, function(v) { return -v; });

        return this.StackMatrix4.create({ stack: [
          this.TransMatrix4.create({ x: -0.5, y: -0.5  }),
          sc
        ]});
      }
    },
    {
      name: 'glueView',
      help: 'Provides a CViewView stand-in for the CViews inside sourceView.',
      getter: function() {
        return {
          canvas: this.canvas,
          $: this.$,
          paint: this.resize,
        };
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
    },
    {
      name: 'textureCoords'
    },
    {
      name: 'painting',
      type: 'Boolean',
      defaultValue: false
    },
    {
      name: 'translucent',
      defaultValue: true
    },
    {
      name: 'shapeName',
      defaultValue: 'flatCenteredRectangle'
    }
  ],

  methods: [
    function init() {
      this.SUPER();

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

    },

    function render() {

      // TODO: better re-render detection.

      this.canvas.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
      this.canvas.fillStyle = 'transparent';
      this.canvas.fillRect(0, 0, this.$canvas.width, this.$canvas.height);

      // paint into our off-canvas buffer
      this.canvas.save();
      this.canvas.translate(
          -this.sourceView.x + this.sourceView.width,
          -this.sourceView.y + this.sourceView.height);
      this.painting = true;
      this.sourceView.paint(this.canvas);
      this.painting = false;
      this.canvas.restore();

      // sourceView had a chance to initialize, but if gl isn't ready we can't copy to texture yet
      if ( ! this.gl ) return;

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
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.$canvas);
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

    // destroy texture?
  ],

  listeners: [
    {
      name: 'resize',
      framed: true,
      code: function(obj, topic, old, nu) {
        // avoid listener events caused by us: during painting, or specifically x, y, scaleX, scaleY, etc.
        if ( this.painting ||
            topic && topic[0] && topic[1] && topic[0] == 'property' &&
           ( topic[1] == 'x' || topic[1] == 'y' || topic[1] == 'scaleX' || topic[1] == 'scaleY' ||
           topic[1] == 'vx' || topic[1] == 'vy' || topic[1] == 'state' || topic[1] == 'canvas')) {
            return;
        }
        //console.log("rendering due to ", obj && obj.name_, topic && topic[1], old, nu);
        this.$canvas.width = this.sourceView.width*2 + 10;
        this.$canvas.height = this.sourceView.height*2 + 10;

        this.$canvas.style.width = this.sourceView.width*2 + 10;
        this.$canvas.style.height = this.sourceView.height*2 + 10;

        this.width = (this.sourceView.width)*2;
        this.height = (this.sourceView.height)*2;

//          this.mesh = this.ArrayBuffer.create({
//            drawMode: 'triangle strip',
//            vertices: [
//              w,   h, 0.0,
//              -w,  h, 0.0,
//              w,  -h, 0.0,
//              -w, -h, 0.0
//            ]
//          });


        this.render();
      }
    }
  ]

});