/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'GLViewView',

  extends: 'foam.graphics.AbstractCViewView',

  documentation: function() {  /*
    The base canvas for WebGL content. Used by GLViews.
  */},

  properties: [
    {
      name: 'canvas',
      getter: function() {
        return null;
      },
      documentation: 'The HTML canvas context. Use this to render.'
    },
    {
      name: 'gl',
      getter: function() {
        if ( this.instance_.gl ) return this.instance_.gl;

        var glc = null;
        try {
          glc = this.$ && (this.$.getContext("webgl") || this.$.getContext("experimental-webgl"));
        } catch(e) {}

        if (glc) {
          glc.clearColor(0.0, 0.0, 0.0, 0.0); // Set clear color to black, fully transparent
          glc.enable(glc.DEPTH_TEST); // Enable depth testing
          glc.depthFunc(glc.LEQUAL); // Near things obscure far things
          glc.clear(glc.COLOR_BUFFER_BIT|glc.DEPTH_BUFFER_BIT); // Clear the color/depth buffer.
          glc.viewport(0,0,this.width, this.height);
          this.instance_.gl = glc;
        } else {
          console.warn("WebGL requested but not supported.")
        }
        return glc;
      }
    }
  ],

  listeners: [
    {
      name: 'resize',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
        this.$.width           = this.canvasWidth();
        this.$.style.width     = this.styleWidth();
        this.$.style.minWidth  = this.styleWidth();
        this.$.height          = this.canvasHeight();
        this.$.style.height    = this.styleHeight();
        this.$.style.minHeight = this.styleHeight();
        this.gl.viewport(0,0,this.width, this.height);

        this.paint();
      },
      documentation: 'Reacts to resize events to fix the size of the canvas.'
    },
    {
      name: 'paint',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.cview.paint(false); // opaque items draw
        this.cview.paint(true); // translucent items draw
      },
      documentation: function() {/*
          Clears the canvas and triggers a repaint of the root $$DOC{ref:'foam.graphics.CView'}
          and its children.
        */}
    }
  ],

  methods: {

    toString: function() { /* The description of this. */ return 'GLViewView(' + this.cview + ')'; },


    initHTML: function() { /* Computes the scaling ratio from the window.devicePixelRatio
                              and canvas.backingStoreRatio. */
      if ( ! this.$ ) return;

      this.maybeInitTooltip();

      this.paint();
    },

    destroy: function( isParentDestroyed ) { /* Call to clean up this and child views. */
      this.SUPER(isParentDestroyed);
      //if ( this.cview ) this.cview.destroy(isParentDestroyed); // child cviews are in a different tree than we are (the parent BaseView tree)
    }
  }
});
