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

  properties: [
    {
      name: 'cview',
      postSet: function(_, cview) {
        cview.view = this;
      }
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated.',
      defaultValue: ''
    },
    {
      model_: 'IntProperty',
      name: 'scalingRatio',
      preSet: function(_, v) { if ( v < 0 ) return 1; return v; },
      postSet: function(_, v) { console.log('Scaling to: ' , v); },
      defaultValue: 1
    },
    {
      model_: 'IntProperty',
      name:  'width',
      defaultValue: 100
    },
    {
      model_: 'IntProperty',
      name:  'height',
      defaultValue: 100
    },
    {
      name: 'canvas',
      getter: function() { return this.$ && this.$.getContext('2d'); }
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
      }
    },
    {
      name: 'paint',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.canvas.save();
        this.canvas.scale(this.scalingRatio, this.scalingRatio);
        this.cview.paint();
        this.canvas.restore();
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamic(function() { this.scalingRatio; this.width; this.height; }.bind(this),
                     this.resize);
    },

    styleWidth:   function() { return (this.width) + 'px'; },
    canvasWidth:  function() { return this.width * this.scalingRatio; },
    styleHeight:  function() { return (this.height) + 'px'; },
    canvasHeight: function() { return this.height * this.scalingRatio; },

    toString: function() { return 'CViewView(' + this.cview + ')'; },

    toHTML: function() {
      var className = this.className ? ' class="' + this.className + '"' : '';
      return '<canvas id="' + this.id + '"' + className + ' width="' + this.canvasWidth() + '" height="' + this.canvasHeight() + '" style="width:' + this.styleWidth() + ';height:' + this.styleHeight() + '"></canvas>';
    },

    initHTML: function() {
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

    destroy: function() {
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
      hidden: true
    },
    {
      name:  'canvas',
      getter: function() { return this.view && this.view.canvas; },
      hidden: true
    },
    {
      name:  '$',
      getter: function() { return this.view && this.view.$; },
      hidden: true
    },
    {
      name: 'state',
      defaultValue: 'initial'
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated. Used if adapted with a CViewView.',
      defaultValue: ''
    },
    {
      name:  'x',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 0
    },
    {
      name:  'y',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 0
    },
    {
      name:  'width',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10
    },
    {
      name:  'height',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10
    },
    {
      name:  'children',
      type:  'CView[]',
      factory: function() { return []; },
      hidden: true
    },
    {
      name:  'alpha',
      type:  'int',
      defaultValue: 1
    },
    {
      name:  'color',
      label: 'Foreground Color',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name: 'font'
    }
  ],

  methods: {
    toView_: function() {
      if ( ! this.view ) {
        var params = {cview: this};
        if ( this.className ) params.className = this.className;
        if ( this.tooltip )   params.tooltip   = this.tooltip;
        this.view = this.X.CViewView.create(params);
      }
      return this.view;
    },

    toPositionedView_: function() {
      if ( ! this.view ) {
        var params = {cview: this};
        if ( this.className ) params.className = this.className;
        this.view = this.X.PositionedCViewView.create(params);
      }
      return this.view;
    },

    initCView: function() { },

    write: function(document) {
      var v = this.toView_();
      document.writeln(v.toHTML());
      v.initHTML();
    },

    addChild: function(child) {
      this.children.push(child);
      if ( this.view ) {
        child.view = this.view;
        child.addListener(this.view.paint);
      }
      // child.parent = this;
      return this;
    },

    addChildren: function() {
      for ( var key in arguments ) this.addChild(arguments[key]);
      return this;
    },

    removeChild: function(child) {
      this.children.deleteI(child);
      child.view = undefined;
      child.removeListener(this.view.paint);
      // child.parent = undefined;
      return this;
    },

    erase: function() {
      this.canvas.clearRect(0, 0, this.width, this.height);
      this.canvas.fillStyle = this.background;
      this.canvas.fillRect(0, 0, this.width, this.height);
    },

    paintChildren: function() {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        this.canvas.save();
        child.paint();
        this.canvas.restore();
      }
    },

    paintSelf: function() {},

    paint: function() {
      if ( ! this.$ ) return;
      if ( this.state === 'initial' ) {
        this.initCView();
        this.state = 'active';
      }
      this.canvas.translate(this.x, this.y);
      this.erase();
      this.paintSelf();
      this.paintChildren();
    },

    destroy: function() {
      // Implement me in submodels to do cleanup when the view is removed.
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

    paint: function() {
      var c = this.canvas;
      if ( ! c ) return;

      c.globalAlpha = this.alpha;

      if ( this.border && this.r ) {
        c.lineWidth = this.borderWidth;
        c.strokeStyle = this.border;
        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
        c.closePath();
        c.stroke();
      }

      if ( this.color ) {
        c.fillStyle = this.color;

        c.beginPath();
        c.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
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
