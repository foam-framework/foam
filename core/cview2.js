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
MODEL({
  name: 'AbstractCViewView',
  extendsModel: 'View',

  documentation: function() {  /*
    Forming the DOM component for a $$DOC{ref:'CView2',text:'canvas view'},
    the $$DOC{ref:'.'} provides a canvas and DOM event integration. When you
    create a $$DOC{ref:'CView2'} and $$DOC{ref:'CView2.write'} it into your
    document, an $$DOC{ref:'.'} is created automatically to host your view.</p>
    <p>Changes to your $$DOC{ref:'CView2'} or its children ripple down and
    cause a repaint, starting with a $$DOC{ref:'AbstractCViewView.paint'} call.
  */},


  properties: [
    {
      name: 'cview',
      type: 'CView2',
      postSet: function(_, cview) {
        cview.view = this;
      },
      documentation: function() {/*
          The $$DOC{ref:'CView2'} root node that contains all the content to render.
        */}
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated.',
      defaultValue: '',
      documentation: function() {/*
          CSS class name(s), space separated.
        */}
    },
    {
      model_: 'IntProperty',
      name: 'scalingRatio',
      preSet: function(_, v) { if ( v < 0 ) return 1; return v; },
      postSet: function(_, v) { console.log('Scaling to: ' , v); },
      defaultValue: 1,
      documentation: function() {/*
          If scaling is required to render the canvas at a higher resolution than
          CSS pixels (for high DPI devices, for instance), the scaling value can
          be used to set the pixel scale. This is set automatically by
          $$DOC{ref:'.initHTML'}.
        */}
    },
    {
      model_: 'IntProperty',
      name:  'width',
      defaultValue: 100,
      documentation: function() {/*
          The CSS width of the canvas. See also $$DOC{ref:'.canvasWidth'} and
          $$DOC{ref:'.styleWidth'}.
        */}
    },
    {
      model_: 'IntProperty',
      name:  'height',
      defaultValue: 100,
      documentation: function() {/*
          The CSS height of the canvas. See also $$DOC{ref:'.canvasHeight'} and
          $$DOC{ref:'.styleHeight'}.
        */}
    },
    {
      name: 'canvas',
      getter: function() { return this.$ && this.$.getContext('2d'); },
      documentation: function() {/*
          The HTML canvas context. Use this to render.
        */}
    }
  ],

  listeners: [
    {
      name: 'resize',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
        this.$.width        = this.canvasWidth();
        this.$.style.width  = this.styleWidth();
        this.$.height       = this.canvasHeight();
        this.$.style.height = this.styleHeight();
        this.paint();
      },
      documentation: function() {/*
          Reacts to resize events to fix the size of the canvas.
        */}
    },
    {
      name: 'paint',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.canvas.save();
        this.canvas.scale(this.scalingRatio, this.scalingRatio);
        this.cview.erase();
        this.cview.paint();
        this.canvas.restore();
      },
      documentation: function() {/*
          Clears the canvas and triggers a repaint of the root $$DOC{ref:'CView2'}
          and its children.
        */}
    }
  ],

  methods: {
    init: function() { /* Connects resize listeners. */
      this.SUPER();
      this.X.dynamic(function() { this.scalingRatio; this.width; this.height; }.bind(this),
                     this.resize);
    },

    styleWidth:   function() { /* The CSS width string */ return (this.width) + 'px'; },
    canvasWidth:  function() { /* The scaled width */ return this.width * this.scalingRatio; },
    styleHeight:  function() { /* The CSS height string */ return (this.height) + 'px'; },
    canvasHeight: function() { /* The scaled height */ return this.height * this.scalingRatio; },

    toString: function() { /* The description of this. */ return 'CViewView(' + this.cview + ')'; },

    toHTML: function() { /* Creates the canvas element. */
      var className = this.className ? ' class="' + this.className + '"' : '';
      return '<canvas id="' + this.id + '"' + className + ' width="' + this.canvasWidth() + '" height="' + this.canvasHeight() + '" style="width:' + this.styleWidth() + ';height:' + this.styleHeight() + '"></canvas>';
    },

    initHTML: function() { /* Computes the scaling ratio from the window.devicePixelRatio
                              and canvas.backingStoreRatio. */
      if ( ! this.$ ) return;

      this.maybeInitTooltip();

      this.canvas = this.$.getContext('2d');

      var devicePixelRatio = this.X.window.devicePixelRatio|| 1;
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

    destroy: function() { /* Call to clean up this and child views. */
      this.SUPER();
      this.cview.destroy();
    }
  }
});


MODEL({
  name: 'PositionedCViewView',
  extendsModel: 'AbstractCViewView',
  traits: ['PositionedDOMViewTrait'],
  properties: [
    {
      name: 'tagName',
      factory: function() { return 'canvas'; }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamic(function() {
        this.cview; this.width; this.height;
      }.bind(this), function() {
        if ( ! this.cview ) return;
        this.cview.width = this.width;
        this.cview.height = this.height;
      }.bind(this));
    },
    toHTML: function() {
      var className = this.className ? ' class="' + this.className + '"' : '';
      return '<canvas id="' + this.id + '"' + className + ' width="' + this.canvasWidth() + '" height="' + this.canvasHeight() + '" ' + this.layoutStyle() + '></canvas>';
    }
  },
  listeners: [
    {
      name: 'resize',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) return;
        this.$.width = this.canvasWidth();
        this.$.style.width = this.styleWidth();
        this.$.height = this.canvasHeight();
        this.$.style.height = this.styleHeight();
        this.cview.width = this.width;
        this.cview.height = this.height;
        this.paint();
      }
    }
  ]
});


MODEL({
  name: 'CViewView',
  extendsModel: 'AbstractCViewView',
  help: 'DOM wrapper for a CView2, auto adjusts it size to fit the given cview.',
  documentation: function() {/*
      DOM wrapper for a $$DOC{ref:'CView2'}, that auto adjusts it size to fit
      he given view.
    */},
  properties: [
    {
      name: 'cview',
      postSet: function(_, cview) {
        this.X.dynamic(function() {
          this.width  = cview.x + cview.width;
          this.height = cview.y + cview.height;
        }.bind(this));
      }
    }
  ]
});


// Should CViews' have a cparent?
MODEL({
  name:  'CView2',
  label: 'CView2',
  documentation: function() {/*
      The base class for a canvas item. A $$DOC{ref:'.'} can be directly inserted
      into the DOM with $$DOC{ref:'.write'}, and will generate a $$DOC{ref:'CViewView'}
      wrapper.</p>
      <p>$$DOC{ref:'.'} submodels directly nest inside each other, with a single
      root $$DOC{ref:'.'} attached to the canvas. Use $$DOC{ref:'.addChild'} to attach a new
      $$DOC{ref:'.'} to the scene graph:</p>
      <p><code>
            var rootNode = this.X.CView2.create({width:300, height:200});<br/>
            <br/>
            rootNode.write(document); // a CViewView wrapper is created for us<br/>
            <br/>
            rootNode.addChild(this.X.Circle2.create({x:30, y:50, radius: 30, color: 'blue'});<br/>
            rootNode.addChild(this.X.Label.create({x: 50, y: 30, text: "Hello", color: 'black'});<br/>
      </code></p>
      <p>When modeling your own $$DOC{ref:'CView2'} submodel, override $$DOC{ref:'.paintSelf'}
      to render your content. Children will automatically be painted for you. For more direct
      control over child rendering, override $$DOC{ref:'.paint'}.
    */},

  properties: [
    {
      name:  'view',
      type:  'Canvas2',
      postSet: function(_, view) {
        for ( var key in this.children ) {
          var child = this.children[key];
          child.view = view;
          child.addListener(view.paint);
        }
      },
      hidden: true,
      documentation: function() {/* The canvas view this scene draws into */ }
    },
    {
      name:  'canvas',
      getter: function() { return this.view && this.view.canvas; },
      hidden: true,
      documentation: function() {/* Safe getter for the canvas view this scene draws into */ }
    },
    {
      name:  '$',
      getter: function() { return this.view && this.view.$; },
      hidden: true,
      documentation: function() {/* Safe getter for the canvas DOM element this scene draws into */ }
    },
    {
      name: 'state',
      defaultValue: 'initial',
      documentation: function() {/* Indicates if canvas setup is in progress ('initial'),
                                  or ready to paint ('active'). */}
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated. Used if adapted with a CViewView.',
      defaultValue: '',
      documentation: function() {/* CSS class name(s), space separated.
          Only used if this is the root node adapted with a $$DOC{ref:'CViewView'}. */}
    },
    {
      name:  'x',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 0,
      documentation: function() {/*
          The X offset of this view relative to its parent. */}
    },
    {
      name:  'y',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 0,
      documentation: function() {/*
          The Y offset of this view relative to its parent. */}
    },
    {
      name:  'width',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10,
      documentation: function() {/*
          The width of this view. Painting is not automatically clipped, so a view
          may render outside of its apparent rectangle. */},
      postSet: function() { console.log("width ", this.width); }
    },
    {
      name:  'height',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10,
      documentation: function() {/*
          The height of this view. Painting is not automatically clipped, so a view
          may render outside of its apparent rectangle. */}
    },
//    {
//      name: 'parent',
//      type: 'CView2'
//    },
    {
      name:  'children',
      type:  'CView2[]',
      factory: function() { return []; },
      hidden: true,
      documentation: function() {/*
          Child views render relative to their parent, but are not clipped
          by the parent's apparent rectangle. */}
    },
    {
      name:  'alpha',
      type:  'float',
      defaultValue: 1,
      documentation: function() {/*
          The desired opacity of the content, from 0:transparent to 1:opaque.
          Child views do not inherit and are not limited by this value. */}
    },
    {
      name:  'color',
      label: 'Foreground Color',
      type:  'String',
      defaultValue: 'black',
      documentation: function() {/*
          The foreground color for rendering primary content. */}
    },
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white',
      documentation: function() {/*
          The optional background color for opaque items that $$DOC{ref:'.erase'}
          their background. */}
    },
    {
      name: 'font',
      documentation: function() {/*
          The font to use for rendering text, in CSS string format: <code>'24px Roboto'</code>. */}
    }
  ],

  methods: {
    toView_: function() { /* Internal. Creates a CViewView wrapper. */
      if ( ! this.view ) {
        var params = {cview: this};
        if ( this.className ) params.className = this.className;
        if ( this.tooltip )   params.tooltip   = this.tooltip;
        this.view = this.X.CViewView.create(params);
      }
      return this.view;
    },

    toPositionedView_: function() { /* Internal. Creates a PositionedCViewView wrapper. */
      if ( ! this.view ) {
        var params = {cview: this};
        if ( this.className ) params.className = this.className;
        this.view = this.X.PositionedCViewView.create(params);
      }
      return this.view;
    },

    initCView: function() { /* Override in submodels for initialization. Callled
          once on first $$DOC{ref:'.paint'} when transitioning from 'initial'
          to 'active' '$$DOC{ref:'.state'}. */ },

    write: function(document) { /* Inserts this $$DOC{ref:'CView2'} into the DOM
                                   with an $$DOC{ref:'AbstractCViewView'} wrapper. */
      var v = this.toView_();
      document.writeln(v.toHTML());
      v.initHTML();
    },

    addChild: function(child) { /* Adds a child $$DOC{ref:'CView2'} to the scene
                                   under this. */
      this.children.push(child);
      if ( this.view ) {
        child.view = this.view;
        child.addListener(this.view.paint);
      }
      //child.parent = this;
      return this;
    },

    addChildren: function() { /* Calls $$DOC{ref:'.addChild'} for each parameter. */
      for ( var key in arguments ) this.addChild(arguments[key]);
      return this;
    },

    removeChild: function(child) { /* Removes a child from the scene. */
      this.children.deleteI(child);
      child.view = undefined;
      child.removeListener(this.view.paint);
      //child.parent = undefined;
      return this;
    },

    erase: function() { /* Wipes the canvas area of this $$DOC{ref:'.'}. Primarily used
                          by the root node to clear the entire canvas, but an opaque child
                          may choose to erase its own area, if required. */
      this.canvas.clearRect(0, 0, this.width, this.height);
      this.canvas.fillStyle = this.background;
      this.canvas.fillRect(0, 0, this.width, this.height);
    },

    paintChildren: function() { /* Paints each child. */
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        this.canvas.save();
        child.paint();
        this.canvas.restore();
      }
    },

    paintSelf: function() { /* Implement this in sub-models to do your painting. */ },

    paint: function() { /* Translates the canvas to our ($$DOC{ref:'.x'}, $$DOC{ref:'.y'}),
                          does a $$DOC{ref:'.paintSelf'} then paints all the children. */
      if ( ! this.$ ) return;
      if ( this.state === 'initial' ) {
        this.initCView();
        this.state = 'active';
      }
      this.canvas.translate(this.x, this.y);
      //this.erase(); // let the canvas AbstractCViewView take care of erasing the root node
      this.paintSelf();
      this.paintChildren();
    },

    destroy: function() {
      /* Implement me in submodels to do cleanup when the view is removed. */
    }
  }
});


MODEL({
  name:  'Circle2',

  extendsModel: 'CView2',

  properties: [
    {
      name:  'border',
      label: 'Border Color',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'borderWidth',
      type:  'int',
      defaultValue: 1
    },
    {
      name: 'r',
      label: 'Radius',
      type: 'int',
      defaultValue: 20
    }
  ],

  methods: {

    paintSelf: function() {
      var c = this.canvas;
      if ( ! c ) return;

      c.globalAlpha = this.alpha;

      if ( this.border && this.r ) {
        c.lineWidth = this.borderWidth;
        c.strokeStyle = this.border;
        c.beginPath();
        c.arc(0, 0, this.r, 0, Math.PI*2, true);
        c.closePath();
        c.stroke();
      }

      if ( this.color ) {
        c.fillStyle = this.color;

        c.beginPath();
        c.arc(0, 0, this.r, 0, Math.PI*2, true);
        c.closePath();
        c.fill();
      }
    }
  }
});


MODEL({
  name: 'ActionButtonCView',

  extendsModel: 'CView2',

  properties: [
    {
      name: 'action',
      postSet: function(oldValue, action) {
        //  oldValue && oldValue.removeListener(this.render)
        // action.addListener(this.render);
        this.bindIsAvailable();
      }
    },
    {
      name:  'font',
      type:  'String',
      defaultValue: ''
    },
    {
      name: 'data',
      postSet: function() {
        this.bindIsAvailable();
      }
    },
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'iconUrl',
      postSet: function(_, v) { this.image_ && (this.image_.src = v); },
      defaultValueFn: function() { return this.action.iconUrl; }
    },
    {
      name: 'haloColor',
      defaultValue: 'rgb(241, 250, 65)'
    },
    {
      name: 'halo',
      factory: function() { return Circle2.create({
        alpha: 0,
        r: 10,
        color: this.haloColor
        /* This gives a ring halo:
        color: 'rgba(0,0,0,0)',
        borderWidth: 12,
        border: this.haloColor
        */
      });}
    },
    {
      name:  'iconWidth',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'iconHeight',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'radius',
      type:  'int',
      defaultValue: 0,
      postSet: function(_, r) {
        if ( r ) this.width = this.height = 2 * r;
      }
    },
    {
      name: 'tapGesture',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.X.GestureTarget.create({
          containerID: this.view.id,
          handler: this,
          gesture: 'tap'
        });
      }
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated.',
      defaultValueFn: function() {
        return 'actionButtonCView actionButtonCView-' + this.action.name;
      }
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action.help; }
    }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function() { this.action.callIfEnabled(this.X, this.data); }
    },
    {
      name: 'onMouseDown',
      code: function(evt) {
        this.down_ = true;
        if ( evt.type === 'touchstart' ) {
          var rect = this.$.getBoundingClientRect();
          var t = evt.touches[0];
          this.halo.x = t.pageX - rect.left;
          this.halo.y = t.pageY - rect.top;
        } else {
          this.halo.x = evt.offsetX;
          this.halo.y = evt.offsetY;
        }
        this.halo.r = 5;
        this.X.animate(150, function() {
          this.halo.x = this.width/2;
          this.halo.y = this.height/2;
          this.halo.r = Math.min(28, Math.min(this.width, this.height)/2);
          this.halo.alpha = 1;
        }.bind(this), Movement.easeIn(1))();
      }
    },
    {
      name: 'onMouseUp',
      code: function() {
        if ( ! this.down_ ) return;
        this.down_ = false;
        this.X.animate(
          300,
          function() { this.halo.r -= 2; this.halo.alpha = 0; }.bind(this))();
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      if ( this.iconUrl ) {
        this.image_ = new Image();

        this.image_.onload = function() {
          if ( ! this.iconWidth  ) this.iconWidth  = this.image_.width;
          if ( ! this.iconHeight ) this.iconHeight = this.image_.height;
          if ( this.canvas ) {
            this.canvas.save();
            this.paint();
            this.canvas.restore();
          }
        }.bind(this);

        this.image_.src = this.iconUrl;
      }
    },

    bindIsAvailable: function() {
      if ( ! this.action || ! this.data ) return;

      var self = this;
      Events.dynamic(
        function() { self.action.isAvailable.call(self.data, self.action); },
        function() {
          if ( self.action.isAvailable.call(self.data, self.action) ) {
            if ( self.oldWidth_ && self.oldHeight_ ) {
              self.x = self.oldX_;
              self.y = self.oldY_;
              self.width = self.oldWidth_;
              self.height = self.oldHeight_;
            }
          } else if ( self.width || self.height ) {
            self.oldX_ = self.x;
            self.oldY_ = self.y;
            self.oldWidth_ = self.width;
            self.oldHeight_ = self.height;
            self.width = 0;
            self.height = 0;
            self.x = 0;
            self.y = 0;
          }
        });
    },

    tapClick: function() { this.onClick(); },

    initCView: function() {
      // Don't add halo as a child because we want to control
      // its paint order, but still set it up as though we had added it.
      // this.addChild(this.halo);
      this.halo.view = this.view;
      this.halo.addListener(this.view.paint);

      if ( this.X.gestureManager ) {
        // TODO: Glow animations on touch.
        this.X.gestureManager.install(this.tapGesture);
      } else {
        this.$.addEventListener('click',      this.onClick);
      }

      this.$.addEventListener('mousedown',   this.onMouseDown);
      this.$.addEventListener('mouseup',     this.onMouseUp);
      this.$.addEventListener('mouseleave',  this.onMouseUp);

      this.$.addEventListener('touchstart',  this.onMouseDown);
      this.$.addEventListener('touchend',    this.onMouseUp);
      this.$.addEventListener('touchleave',  this.onMouseUp);
      this.$.addEventListener('touchcancel', this.onMouseUp);
    },

    destroy: function() {
      this.SUPER();
      if ( this.X.gestureManager ) {
        this.X.gestureManager.uninstall(this.tapGesture);
      }
    },

    erase: function() {
      var c = this.canvas;
      if ( this.radius ) {
        if ( this.halo.r < this.radius-1 ) {
          c.beginPath();
          c.arc(this.x+this.radius, this.y+this.radius, this.radius-1, 0, Math.PI*2, false);
          c.fillStyle = this.background;
          c.lineWidth = 1;
          c.fill();
        }
      } else {
        this.canvas.clearRect(0, 0, this.width, this.height);
        this.canvas.fillStyle = this.background;
        this.canvas.fillRect(0, 0, this.width, this.height);
      }
    },

    paintSelf: function() {
      var c = this.canvas;

      c.save();
      if ( this.radius ) {
        c.beginPath();
        c.arc(this.x+this.radius, this.y+this.radius, this.radius, 0, Math.PI*2, false);
        c.clip();
      }
      this.halo.paint();
      c.restore();

      if ( this.font ) c.font = this.font;

      c.globalAlpha  = this.alpha;
      c.textAlign    = 'center';
      c.textBaseline = 'middle';
      c.fillStyle    = this.color;

      if ( this.image_ && this.image_.width ) {
        c.drawImage(
          this.image_,
          this.x + (this.width  - this.iconWidth)/2,
          this.y + (this.height - this.iconHeight)/2,
          this.iconWidth,
          this.iconHeight);
      }

      c.fillText(
        this.action.labelFn.call(this.data, this.action),
        this.x+this.width/2,
        this.y+this.height/2);
    }
  }
});


MODEL({
  name: 'DAOListCView',
  extendsModel: 'CView2',

  properties: [
    { model_: 'DAOProperty', name: 'dao' },
    { model_: 'IntProperty', name: 'scrollTop', preSet: function(_,t) { return Math.max(t, 0); }, postSet: function() { this.scroll(); } },
    { name: 'rowRenderer' },
    { name: 'objs', postSet: function() { this.view && this.view.paint(); }, factory: function() { return []; } }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.dao.listen(this.scroll);
    },
    paintSelf: function() {
      var renderer = this.rowRenderer;

      var offset = -(this.scrollTop % renderer.height);
      this.canvas.save();
      this.canvas.translate(0, offset);
      for ( var i = 0; i < this.objs.length; i++ ) {
        renderer.render(this.canvas, this.objs[i]);
        this.canvas.translate(0, renderer.height);
      }
      this.canvas.restore();
    }
  },

  listeners: [
    {
      name: 'scroll',
      code: function() {
        var renderer = this.rowRenderer;
        var limit = Math.floor(this.height / renderer.height);
        var skip = Math.floor(this.scrollTop / renderer.height);
        var self = this;
        this.dao.skip(skip).limit(limit).select()(function(objs) {
          self.objs = objs;
        });
      }
    }
  ]
});


MODEL({name: 'MotionBlur', methods: {
  paint: function() {
    this.SUPER();
    var c = this.canvas;
    var oldAlpha = this.alpha;

    c.save();
    c.translate(-this.vx, -this.vy);
    this.alpha = 0.6;
    this.SUPER();

    c.translate(-this.vx, -this.vy);
    this.alpha = 0.3;
    this.SUPER();
    c.restore();

    this.alpha = oldAlpha;
  }
}});


MODEL({name: 'Shadow', methods: {
  paint: function() {
    var c = this.canvas;
    var oldAlpha = this.alpha;
    var oldColor = this.color;

    c.save();
    c.translate(4, 4);
    this.alpha = 0.2;
    this.color = 'black';
    this.SUPER();
    c.restore();

    this.alpha = oldAlpha;
    this.color = oldColor;

    this.SUPER();
  }
}});


MODEL({
  name: 'CanvasScrollView',
  extendsModel: 'CView2',
  properties: [
    {
      model_: 'DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate'
    },
    {
      model_: 'IntProperty',
      name: 'scrollTop',
      preSet: function(_, v) { if ( v < 0 ) return 0; return v; }
    },
    {
      name: 'renderer'
    },
    {
      model_: 'IntProperty',
      name: 'selectNumber'
    },
    {
      name: 'objs',
      factory: function() { return []; }
    },
    {
      name: 'offset',
      defaultValue: 0
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamic(function() { this.width; this.renderer; this.offset; this.objs; }.bind(this),
                     function() {
                       this.renderer.width = this.width;
                       this.view && this.view.paint();
                     }.bind(this));
    },
    initCView: function() {
      this.X.dynamic(
        function() {
          this.scrollTop; this.height; this.renderer;
        }.bind(this), this.onDAOUpdate);

      if ( this.X.gestureManager ) {
        var manager = this.X.gestureManager;
        var target = this.X.GestureTarget.create({
          containerID: this.view.id,
          handler: this,
          gesture: 'verticalScrollMomentum'
        });
        manager.install(target);
      }
    },
    verticalScrollMove: function(dy) {
      this.scrollTop -= dy;
    },
    paintSelf: function() {
      var self = this;
      var offset = this.offset;
      for ( var i = 0; i < this.objs.length; i++ ) {
        self.canvas.save();
        self.canvas.translate(0, offset + (i * self.renderer.height));
        self.renderer.render(self.canvas, self.objs[i]);
        self.canvas.restore();
      }
    }
  },
  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        if ( ! this.canvas ) return;

        var selectNumber = this.selectNumber + 1;
        this.selectNumber = selectNumber;

        var limit = Math.floor(this.height / this.renderer.height) + 2;
        var skip = Math.floor(this.scrollTop / this.renderer.height);
        var self = this;


        var offset = -(this.scrollTop % this.renderer.height);

        var i = 0;
        this.dao.skip(skip).limit(limit).select([])(function(objs) {
          self.offset = offset;
          self.objs = objs;
        });

/*{
          put: function(obj, _, fc) {
            if ( selectNumber != self.selectNumber ||
                 ! self.canvas ) {
              fc.stop();
              return;
            }
            if ( i == 0 ) self.erase();

            self.canvas.save();
            self.canvas.translate(0, offset + (i * self.renderer.height));
            i = i + 1;
            self.renderer.render(self.canvas, obj);
            self.canvas.restore();
          }
        });*/
      }
    }
  ]
});
