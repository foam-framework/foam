FOAModel({
  name: 'CViewView',
  extendsModel: 'View',

  properties: [
    {
      name: 'cview',
      postSet: function(_, cview) {
        cview.view = this;
        cview.x$.addListener(this.resize);
        cview.y$.addListener(this.resizeP);
        cview.width$.addListener(this.resize);
        cview.height$.addListener(this.resize);
        this.resize();
      }
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 100,
      postSet: function(_, width) {
        if ( this.$ ) this.$.width = width;
      }
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 100,
      postSet: function(_, height) {
        if ( this.$ ) this.$.height = height;
      }
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
        this.width  = this.cview.x + this.cview.width;
        this.height = this.cview.y + this.cview.height;
      }
    },
    {
      name: 'paint',
      isAnimated: true,
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.canvas.save();
        this.cview.paint();
        this.canvas.restore();
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<canvas id="' + this.id + '" width="' + this.width + '" height="' + this.height + '"> </canvas>';
    },

    initHTML: function() {
      if ( ! this.$ ) return;
      this.canvas = this.$.getContext('2d');
      this.paint();
    }
  }
});


// Should CViews' have a cparent?
FOAModel({
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
    toView: function() { return this.view || this.X.CViewView.create({cview: this}); },

    initCView: function() { },

    write: function(document) {
      var v = this.toView();
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

    removeChild: function(child) {
      this.children.deleteI(child);
      child.view = undefined;
      child.removeListener(this.view.paint);
      // child.parent = undefined;
      return this;
    },

    erase: function() {
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
      this.erase();
      this.paintSelf();
      this.paintChildren();
    }
  }
});


FOAModel({
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


FOAModel({
  name: 'ActionButtonCView',

  extendsModel: 'CView2',

  properties: [
    {
      name: 'action',
      postSet: function(oldValue, action) {
        //  oldValue && oldValue.removeListener(this.render)
        // action.addListener(this.render);
      }
    },
    {
      name: 'data',
      setter: function(_, d) { this.value = SimpleValue.create(d); }
    },
    {
      name:  'font',
      type:  'String',
      defaultValue: ''
    },
    {
      name: 'value',
      type: 'Value',
      factory: function() { return SimpleValue.create(); }
    },
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() { return this.action.iconUrl; }
    },
    {
      name: 'pressCircle',
      factory: function() { return Circle2.create({
        alpha: 0,
        x: this.width/2,
        y: this.width/2,
        r: 15,
        color: 'rgb(241, 250, 65)'
      });}
    }
  ],

  listeners: [
    {
      name: 'onClick',
      code: function() { this.action.callIfEnabled(this.value.get()); }
    },
    {
      name: 'onMouseDown',
      code: function() {
        Movement.animate(50, function() {
          this.pressCircle.r = this.width/2-7;
          this.pressCircle.alpha = 1;
        }.bind(this))();
      }
    },
    {
      name: 'onMouseUp',
      code: function() {
        Movement.animate(
          200,
          function() { this.pressCircle.alpha = 0; }.bind(this),
          undefined,
          function() { this.pressCircle.r = 15; }.bind(this))();
      }
    }
  ],

  methods: {
    initCView: function() {
      this.addChild(this.pressCircle);

      this.$.addEventListener('click',     this.onClick);
      this.$.addEventListener('mousedown', this.onMouseDown);
      this.$.addEventListener('mouseup',   this.onMouseUp);
    },
    paintChildren: function() { },
    paintSelf: function() {
      var c = this.canvas;

      c.save();
      this.pressCircle.paint();
      c.restore();

      if ( this.font ) c.font = this.font;

      c.textAlign    = 'center';
      c.textBaseline = 'middle';
      c.fillStyle    = this.color;
      c.fillText(
        this.action.labelFn.call(this.value, this.action),
        this.x+this.width/2,
        this.y+this.height/2);
    }
  }
});
