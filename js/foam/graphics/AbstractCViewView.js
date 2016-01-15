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
  package: 'foam.graphics',
  name: 'AbstractCViewView',
  extends: 'foam.ui.View',

  documentation: function() {  /*
    Forming the DOM component for a $$DOC{ref:'foam.graphics.CView',text:'canvas view'},
    the $$DOC{ref:'.'} provides a canvas and DOM event integration. When you
    create a $$DOC{ref:'foam.graphics.CView'} and $$DOC{ref:'foam.graphics.CView.write'} it into your
    document, an $$DOC{ref:'.'} is created automatically to host your view.</p>
    <p>Changes to your $$DOC{ref:'foam.graphics.CView'} or its children ripple down and
    cause a repaint, starting with a $$DOC{ref:'.paint'} call.
  */},

  properties: [
    {
      name: 'cview',
      // type: 'foam.graphics.CView',
      postSet: function(_, cview) {
        cview.view  = this;
        this.width  = cview.x + cview.width;
        this.height = cview.y + cview.height;
      },
      documentation: function() {/*
          The $$DOC{ref:'foam.graphics.CView'} root node that contains all the content to render.
        */}
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated.',
      defaultValue: '',
      documentation: 'CSS class name(s), space separated.'
    },
    {
      type: 'Float',
      name: 'scalingRatio',
      preSet: function(_, v) { return v <= 0 ? 1 : v ; },
      defaultValue: 1,
      documentation: function() {/*
          If scaling is required to render the canvas at a higher resolution than
          CSS pixels (for high DPI devices, for instance), the scaling value can
          be used to set the pixel scale. This is set automatically by
          $$DOC{ref:'.initHTML'}.
        */}
    },
    'speechLabel',
    'role',
    'tabIndex',
    {
      type: 'Int',
      name:  'width',
      defaultValue: 100,
      documentation: function() {/*
          The CSS width of the canvas. See also $$DOC{ref:'.canvasWidth'} and
          $$DOC{ref:'.styleWidth'}.
        */}
    },
    {
      type: 'Int',
      name:  'height',
      defaultValue: 100,
      documentation: function() {/*
          The CSS height of the canvas. See also $$DOC{ref:'.canvasHeight'} and
          $$DOC{ref:'.styleHeight'}.
        */}
    },
    {
      name: 'canvas',
      getter: function() {
        return this.instance_.canvas ?
          this.instance_.canvas :
          this.instance_.canvas = this.$ && this.$.getContext('2d');
      },
      documentation: 'The HTML canvas context. Use this to render.'
    },
    {
      name: 'gl',
      getter: function() {
        return null;
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

        this.paint();
      },
      documentation: 'Reacts to resize events to fix the size of the canvas.'
    },
    {
      name: 'paint',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.canvas.save();

        this.canvas.clearRect(0, 0, this.canvasWidth(), this.canvasHeight());
        this.canvas.fillStyle = this.cview.background;
        this.canvas.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());

        this.canvas.scale(this.scalingRatio, this.scalingRatio);
        this.cview.paint(this.canvas);

        this.canvas.restore();
      },
      documentation: function() {/*
          Clears the canvas and triggers a repaint of the root $$DOC{ref:'foam.graphics.CView'}
          and its children.
        */}
    }
  ],

  methods: {
    init: function() { /* Connects resize listeners. */
      this.SUPER();
      this.X.dynamicFn(
        function() { this.scalingRatio; this.width; this.height; }.bind(this),
        this.resize);
    },

    styleWidth:   function() { /* The CSS width string */ return (this.width) + 'px'; },
    canvasWidth:  function() { /* The scaled width */ return this.width * this.scalingRatio; },
    styleHeight:  function() { /* The CSS height string */ return (this.height) + 'px'; },
    canvasHeight: function() { /* The scaled height */ return this.height * this.scalingRatio; },

    toString: function() { /* The description of this. */ return 'CViewView(' + this.cview + ')'; },

    toHTML: function() { /* Creates the canvas element. */
      var className = this.className ? ' class="' + this.className + '"' : '';
      var title     = this.speechLabel ? ' aria-role="button" aria-label="' + this.speechLabel + '"' : '';
      var tabIndex  = this.tabIndex ? ' tabindex="' + this.tabIndex + '"' : '';
      var role      = this.role ? ' role="' + this.role + '"' : '';

      return '<canvas id="' + this.id + '"' + className + title + tabIndex + role + ' width="' + this.canvasWidth() + '" height="' + this.canvasHeight() + '" style="width:' + this.styleWidth() + ';height:' + this.styleHeight() + ';min-width:' + this.styleWidth() + ';min-height:' + this.styleHeight() + '"></canvas>';
    },

    initHTML: function() { /* Computes the scaling ratio from the window.devicePixelRatio
                              and canvas.backingStoreRatio. */
      if ( ! this.$ ) return;

      this.maybeInitTooltip();

      this.canvas = this.$.getContext('2d');

      var devicePixelRatio = this.X.window.devicePixelRatio || 1;
      var backingStoreRatio = this.canvas.backingStoreRatio ||
        this.canvas.webkitBackingStorePixelRatio || 1;

      if ( devicePixelRatio !== backingStoreRatio )
        this.scalingRatio = devicePixelRatio / backingStoreRatio;

      var style = this.X.window.getComputedStyle(this.$);

      // Copy the background colour from the div styling.
      // TODO: the same thing for other CSS attributes like 'font'
      if ( style.backgroundColor && ! this.cview.hasOwnProperty('background') )
        this.cview.background = style.backgroundColor;

      this.paint();
    },

    destroy: function( isParentDestroyed ) { /* Call to clean up this and child views. */
      this.SUPER(isParentDestroyed);
      //if ( this.cview ) this.cview.destroy(isParentDestroyed); // child cviews are in a different tree than we are (the parent BaseView tree)
    }
  }
});
