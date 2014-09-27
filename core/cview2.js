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
      isAnimated: true,
      code: function() {
        if ( ! this.$ ) return;
        this.$.width = this.canvasWidth();
        this.$.style.width = this.styleWidth();
        this.$.height = this.canvasHeight();
        this.$.style.height = this.styleHeight();
        this.paint();
      }
    },
    {
      name: 'paint',
      isAnimated: true,
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

    styleWidth: function() { return (this.width) + 'px'; },
    canvasWidth: function() { return this.width * this.scalingRatio; },
    styleHeight: function() { return (this.height) + 'px'; },
    canvasHeight: function() { return this.height * this.scalingRatio; },

    toString: function() { return 'CViewView(' + this.cview + ')'; },

    toHTML: function() {
      var className = this.className ? ' class="' + this.className + '"' : '';
      return '<canvas id="' + this.id + '"' + className + ' width="' + this.canvasWidth() + '" height="' + this.canvasHeight() + '" style="width:' + this.styleWidth() + ';height:' + this.styleHeight() + '"></canvas>';
    },
    initHTML: function() {
      if ( ! this.$ ) return;
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
      isAnimated: true,
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
          this.width = cview.x + cview.width;
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
      child.view = this.view;
      child.addListener(this.view.paint);
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
      name: 'pressCircle',
      factory: function() { return Circle2.create({
        alpha: 0,
        r: 10,
        color: 'rgb(241, 250, 65)'
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
      factory: function() {
        return this.X.GestureTarget.create({
          container: this,
          handler: this,
          gesture: 'tap'
        });
      }
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
          this.pressCircle.x = t.pageX - rect.left;
          this.pressCircle.y = t.pageY - rect.top;
        } else {
          this.pressCircle.x = evt.offsetX;
          this.pressCircle.y = evt.offsetY;
        }
        this.pressCircle.r = 5;
        Movement.animate(150, function() {
          this.pressCircle.x = this.width/2;
          this.pressCircle.y = this.height/2;
          this.pressCircle.r = Math.min(28, Math.min(this.width, this.height)/2-1);
          this.pressCircle.alpha = 1;
        }.bind(this), Movement.easeIn(1))();
      }
    },
    {
      name: 'onMouseUp',
      code: function() {
        if ( ! this.down_ ) return;
        this.down_ = false;
        Movement.animate(
          300,
          function() { this.pressCircle.alpha = 0; }.bind(this))();
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
          if ( this.canvas ) this.paint();
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
          if ( self.action.isAvailable.call(self.data, self.action) &&
               self.oldWidth_ && self.oldHeight_ ) {
            self.x = self.oldX_;
            self.y = self.oldY_;
            self.width = self.oldWidth_;
            self.height = self.oldHeight_;
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

    containsPoint: function(x, y, e) {
      if ( this.$ === e ) return true;
    },

    tapClick: function() {
      this.onClick();
    },

    initCView: function() {
      this.addChild(this.pressCircle);

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
    paint: function() {
      var c = this.canvas;
      c.save();
      c.globalAlpha = this.alpha;

      if ( this.radius ) {
        this.canvas.clearRect(0, 0, this.width, this.height);

        c.beginPath();
        c.arc(this.x+this.radius, this.y+this.radius, this.radius-1, 0, Math.PI*2, false);
        c.strokeStyle = this.background;
        c.lineWidth = 1;
        c.stroke();
        c.clip();
      }

      this.SUPER();
      this.paintChildren();
      c.restore();
    },
    paintSelf: function() {
      var c = this.canvas;

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
      name: 'scrollTop'
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
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.X.dynamic(function() { this.width; this.renderer; }.bind(this),
                     function() { this.renderer.width = this.width; }.bind(this));
    },
    initCView: function() {
      this.X.dynamic(
        function() {
          this.scrollTop; this.height; this.renderer;
        }.bind(this), this.onDAOUpdate);
    },
    paintSelf: function() {
      var self = this;
      var offset = -(this.scrollTop % this.renderer.height);
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

        var limit = Math.floor(this.height / this.renderer.height) + 1;
        var skip = Math.floor(this.scrollTop / this.renderer.height);
        var self = this;


        var offset = -(this.scrollTop % this.renderer.height);

        console.log('skip, limit, offset: ', skip, limit, offset);

        var i = 0;
        this.dao.skip(skip).limit(limit).select([])(function(objs) {
          self.objs = objs;
          self.view.paint();
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
