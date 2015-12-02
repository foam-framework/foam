/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

/** A Canvas View for embedding CView's in. **/
// TODO: add a 'mouse' property which creates and connects a Mouse model.
CLASS({
  name: 'Canvas',
  extends: 'foam.ui.View',

  properties: [
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white'
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
    }
  ],

  listeners: [
    {
      name: 'paint',
      isFramed: true,
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.erase();
        this.paintChildren();
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
    },

    addChild: function(child) {
      child.parent = null; // needed because super.addChild() skips childen with parents already

      this.SUPER(child);

      try {
        child.addListener(this.paint);
      } catch (x) { console.log(x); }

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
    }
  }
});


/**
 * Abstract Canvas View (CView).
 *
 * CView's can also be used as regular (DOM) Views because if you call
 * toHTML() on them they will create their own 'Canvas' View parent.
 **/
CLASS({
  name:  'CView',
  label: 'CView',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'x',
      type:  'int',
      view:  'foam.ui.IntFieldView',
      defaultValue: 10
    },
    {
      name:  'y',
      type:  'int',
      view:  'foam.ui.IntFieldView',
      defaultValue: 10
    },
    {
      name:  'width',
      type:  'int',
      view:  'foam.ui.IntFieldView',
      defaultValue: 10
    },
    {
      name:  'height',
      type:  'int',
      view:  'foam.ui.IntFieldView',
      defaultValue: 10
    },
    {
      name:  'children',
      type:  'CView[]',
      factory: function() { return []; },
      hidden: true
    },
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'canvas',
      type:  'Canvas',
      getter: function() {
        return this.parent && this.parent.canvas;
      },
      setter: undefined,
      hidden: true
    }
  ],

  listeners: [
    {
      name: 'resizeParent',
      code: function(evt) {
        this.parent.width  = this.x + this.width + 1;
        this.parent.height = this.y + this.height + 2;
      }
    }
  ],

  methods: {
    toView_: function() { return this; },
    toHTML: function() {
      // If being added to HTML directly, then needs to create own Canvas as parent.
      // Calling addChild() will set this.parent = canvas.
      if ( ! this.parent ) {
        this.parent = this.X.Canvas.create(undefined, this.Y);

        this.x$.addListener(this.resizeParent);
        this.y$.addListener(this.resizeParent);
        this.width$.addListener(this.resizeParent);
        this.height$.addListener(this.resizeParent);

        this.resizeParent();
      }
      return this.parent.toHTML();
    },

    initHTML: function() {
      var self = this;
      var parent = this.parent;

      parent.addChild(this);
      parent.initHTML();
      this.X.dynamicFn(
        function() { self.background; }, function() {
          parent.background = self.background;
        });
    },

    write: function(document) {
      document.writeln(this.toHTML());
      this.initHTML();
    },

    addChild: function(child) {
      this.children.push(child);
      child.parent = this;
      return this;
    },

    removeChild: function(child) {
      this.children.deleteI(child);
      child.parent = undefined;
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
      if ( ! this.parent.$ ) return;
      this.erase();
      this.paintSelf();
      this.paintChildren();
    }
  }
});


CLASS({
  name:  'Label',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'text',
      type:  'String',
      defaultValue: ''
    },
    {
      name:  'align',
      label: 'Alignment',
      type:  'String',
      defaultValue: 'start' // values: left, right, center, start, end
    },
    {
      name:  'font',
      type:  'String',
      defaultValue: ''
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'maxWidth',
      label: 'Maximum Width',
      type:  'int',
      defaultValue: -1
    }
  ],

  methods: {
    paint: function() {
      var canvas = this.parent.canvas;
      var oldFont = canvas.font;
      var oldAlign = canvas.textAlign;

      if ( this.font ) canvas.font = this.font;

      canvas.textAlign = this.align;
      canvas.fillStyle = this.color;
      canvas.fillText(this.text, this.x, this.y);

      canvas.font = oldFont;
      canvas.textAlign = oldAlign;
    }
  }
});


CLASS({
  name:  'Box',
  extends: 'Label',

  properties: [
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'border',
      label: 'Border Color',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'a',
      label: 'Angle',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 100
    }
  ],

  methods: {
    paint: function() {
      var c = this.parent.canvas;

      c.save();

      if ( this.a ) {
        c.translate(this.x+this.width/2, this.y+this.height/2);
        c.rotate(this.a);
        c.translate(-this.x-this.width/2, -this.y-this.height/2);
      }

      c.fillStyle = this.background;
      c.fillRect(this.x, this.y, this.width, this.height);

      if ( this.border && this.width && this.height ) {
        c.strokeStyle = this.border;
        c.strokeRect(this.x, this.y, this.width, this.height);
      }

      var oldFont = c.font;
      var oldAlign = c.textAlign;

      if ( this.font ) c.font = this.font;

      c.textAlign = 'center'; //this.align;
      c.fillStyle = this.color;
      c.fillText(
        this.text,
        this.x + this.width/2,
        this.y+this.height/2+10);

      c.font = oldFont;
      c.textAlign = oldAlign;

      var grad = c.createLinearGradient(this.x, this.y, this.x+this.width, this.y+this.height);

      grad.addColorStop(  0, 'rgba(0,0,0,0.35)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0)');
      grad.addColorStop(  1, 'rgba(255,255,255,0.45)');
      c.fillStyle = grad;
      c.fillRect(this.x, this.y, this.width, this.height);

      c.restore();
    }
  }
});


CLASS({
  name:  'Circle',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'white'
    },
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
      name:  'alpha',
      type:  'int',
      defaultValue: 1
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    },
    {
      name: 'r',
      label: 'Radius',
      type: 'int',
      defaultValue: 20
    }
  ],

  methods: {

    paint3d: function() {
      var canvas = this.parent.canvas;

      var radgrad = canvas.createRadialGradient(this.x+this.r/6,this.y+this.r/6,this.r/3,this.x+2,this.y,this.r);
      radgrad.addColorStop(0, '#a7a7a7'/*'#A7D30C'*/);
      radgrad.addColorStop(0.9, this.color /*'#019F62'*/);
      radgrad.addColorStop(1, 'black');

      canvas.fillStyle = radgrad;;

      canvas.beginPath();
      canvas.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
      canvas.closePath();
      canvas.fill();
    },

    paint: function() {
      var canvas = this.parent.canvas;

      canvas.save();

      canvas.globalAlpha = this.alpha;

      canvas.fillStyle = this.color;

      if ( this.border && this.r ) {
        canvas.lineWidth = this.borderWidth;
        canvas.strokeStyle = this.border;
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
        canvas.closePath();
        canvas.stroke();
      }

      if ( this.color ) {
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
        canvas.closePath();
        canvas.fill();
      }

      canvas.restore();
    }
  }
});


CLASS({
  name:  'ImageCView',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'alpha',
      type:  'int',
      defaultValue: 1
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'scale',
      type:  'int',
      defaultValue: 1
    },
    {
      name: 'src',
      label: 'Source',
      type: 'String'
    }
  ],

  methods: {

    init: function() {
      this.SUPER();

      this.image_ = new Image();
      this.image_.src = this.src;
    },

    paint: function() {
      var c = this.parent.canvas;

      c.translate(this.x, this.y);
      c.scale(this.scale, this.scale);
      c.translate(-this.x, -this.y);
      c.drawImage(this.image_, this.x, this.y);
    }
  }
});


CLASS({
  name: 'Rectangle',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'white',
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 1000
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 100
    }
  ],

  methods: {
    paint: function() {
      var canvas = this.parent.canvas;

      canvas.fillStyle = this.color;
      canvas.fillRect(this.x, this.y, this.width, this.height);
    }
  }
});


CLASS({
  name:  'ProgressCView',
  extends: 'CView',

  properties: [
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.updateValue);
        newValue.addListener(this.updateValue);
      }
    }
  ],

  listeners:  [
    {
      name: 'updateValue',
      code: function() {
        this.paint();
      }
    }
  ],

  methods: {

    paint: function() {
      var c = this.canvas;

      c.fillStyle = '#fff';
      c.fillRect(0, 0, 104, 20);

      c.strokeStyle = '#000';
      c.strokeRect(0, 0, 104, 20);
      c.fillStyle = '#f00';
      c.fillRect(2, 2, parseInt(this.value.get()), 16);
    },

    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      this.value.removeListener(this.listener_);
    }
  }
});


CLASS({
  name:  'Graph',
  extends: 'CView',

  properties: [
    {
      name:  'style',
      type:  'String',
      defaultValue: 'Line',
      // TODO: fix the view, it's not storabe
      view: {
        factory_: 'foam.ui.ChoiceView',
        choices: [
          'Bar',
          'Line',
          'Point'
        ]
      }
    },
    {
      name:  'width',
      type:  'int',
      view:  'foam.ui.IntFieldView',
      defaultValue: 5
    },
    {
      name:  'height',
      type:  'int',
      view:  'foam.ui.IntFieldView',
      defaultValue: 5
    },
    {
      name:  'graphColor',
      type:  'String',
      defaultValue: 'green'
    },
    {
      name:  'backgroundColor',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'lineWidth',
      type:  'int',
      defaultValue: 6
    },
    {
      name:  'drawShadow',
      type:  'boolean',
      defaultValue: true
    },
    {
      name:  'capColor',
      type:  'String',
      defaultValue: ''
    },
    {
      name:  'axisColor',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'gridColor',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'axisSize',
      type:  'int',
      defaultValue: 2
    },
    {
      name:  'xAxisInterval',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'yAxisInterval',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'maxValue',
      label: 'Maximum Value',
      type:  'float',
      defaultValue: -1
    },
    {
      name:  'data',
      type:  'Array[float]',
      factory: function() { return []; }
    },
    {
      name: 'f',
      label: 'Data Function',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'foam.ui.FunctionView',
      defaultValue: function (x) { return x; },
      help: 'The graph\'s data function.'
    }
  ],

  issues: [
    {
      id: 1000,
      severity: 'Major',
      status: 'Open',
      summary: 'Make \'style\' view serializable',
      created: 'Sun Dec 23 2012 18:14:56 GMT-0500 (EST)',
      createdBy: 'kgr',
      assignedTo: 'kgr',
      notes: 'ChoiceView factory prevents Model from being serializable.'
    }
  ],

  methods: {
    paintLineData: function(canvas, x, y, xs, w, h, maxValue) {
      if ( this.graphColor ) {
        canvas.fillStyle = this.graphColor;
        canvas.beginPath();
        canvas.moveTo(x+xs, y+h-xs);
        for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.f(this.data[i]);
          var lx = x+xs+(i==0?0:w*i/(this.data.length-1));
          var ly = this.toY(d, maxValue);

          canvas.lineTo(lx, ly);
        }

        canvas.lineTo(x+this.width-1, y+h-xs);
        canvas.lineTo(x+xs, y+h-xs);
        canvas.fill();
      }

      if ( this.capColor ) {
        if ( this.drawShadow ) {
          canvas.shadowOffsetX = 0;
          canvas.shadowOffsetY = 2;
          canvas.shadowBlur = 2;
          canvas.shadowColor = "rgba(0, 0, 0, 0.5)";
        }

        canvas.strokeStyle = this.capColor;
        canvas.lineWidth = this.lineWidth;
        canvas.lineJoin = 'round';
        canvas.beginPath();
        for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.f(this.data[i]);
          var lx = this.toX(i)+0.5;
          var ly = this.toY(d, maxValue)/*+0.5*/-5;

          if ( i == 0 )
            canvas.moveTo(lx, ly);
          else
            canvas.lineTo(lx, ly);
        }

        canvas.stroke();
      }
    },

    paintPointData: function(canvas, x, y, xs, w, h, maxValue) {
      canvas.shadowOffsetX = 2;
      canvas.shadowOffsetY = 2;
      canvas.shadowBlur = 2;
      canvas.shadowColor = "rgba(0, 0, 0, 0.5)";

      canvas.strokeStyle = this.capColor;
      canvas.lineWidth = 2;
      canvas.lineJoin = 'round';
      canvas.beginPath();
      for ( var i = 0 ; i < this.data.length ; i++ ) {
        var d = this.f(this.data[i]);
        var lx = this.toX(i)+0.5;
        var ly = this.toY(d, maxValue)+0.5;

        if ( i == 0 ) canvas.moveTo(lx, ly); else canvas.lineTo(lx, ly);
      }

      canvas.stroke();

      canvas.lineWidth = 3;
      for ( var i = 0 ; i < this.data.length ; i++ ) {
        var d = this.f(this.data[i]);
        var lx = this.toX(i)+0.5;
        var ly = this.toY(d, maxValue)+0.5;

        canvas.beginPath();
        canvas.arc(lx,ly,4,0,-Math.PI/2);
        canvas.closePath();
        canvas.stroke();
      }
    },

    paintBarData: function(canvas, x, y, xs, w, h, maxValue) {
      canvas.fillStyle = this.graphColor;

      for ( var i = 0 ; i < this.data.length ; i++ ) {
        var d = this.f(this.data[i]);
        var x1 = x+xs+w*i/this.data.length;
        var y1 = this.toY(d, maxValue);

        canvas.fillRect(x1, y1, w/this.data.length+1.5, d*h/maxValue);
      }
    },

    paint: function() {
      var canvas = this.canvas;
      var x  = this.x;
      var y  = this.y;
      var xs = this.axisSize;
      var w  = this.width-xs;
      var h  = this.height-xs;
      var maxValue = this.maxValue;

      if ( this.backgroundColor ) {
        canvas.fillStyle = this.backgroundColor;
        canvas.fillRect(x,y,w,h);
      }

      if ( maxValue == -1 ) {
        maxValue = 0.001;

        for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.f(this.data[i]);

          maxValue = Math.max(maxValue, d);
        }
      }

      if ( this.style == 'Line' ) this.paintLineData(canvas, x, y, xs, w, h, maxValue);
      else if ( this.style == 'Bar' ) this.paintBarData(canvas, x, y, xs, w, h, maxValue);
      else if ( this.style == 'Point' ) this.paintPointData(canvas, x, y, xs, w, h, maxValue);

      if ( this.axisColor && xs != 0 ) {
        canvas.fillStyle = this.axisColor;
        // x-axis
        canvas.fillRect(x, y+h-xs*1.5, this.width, xs);
        // y-axis
        canvas.fillRect(x, y, xs, this.height-xs*1.5);
      }

      if ( this.xAxisInterval ) {
        for ( var i = this.xAxisInterval ; i <= this.data.length ; i += this.xAxisInterval ) {
          var x2 = this.toX(i);

          if ( this.gridColor ) {
            canvas.save();
            canvas.shadowOffsetX = 0;
            canvas.shadowOffsetY = 0;
            canvas.shadowBlur = 0;
            canvas.fillStyle = this.gridColor;
            canvas.fillRect(x2+1.5, this.toY(0,1)-2*xs, 0.5, -this.height);
            canvas.restore();
          }

          canvas.fillRect(x2, this.toY(0,1)-2*xs, xs/2, -xs);
        }
      }

      if ( this.yAxisInterval ) {
        for ( var i = this.yAxisInterval ; i <= maxValue ; i += this.yAxisInterval ) {
          var y = this.toY(i, maxValue);

          if ( this.gridColor ) {
            canvas.save();
            canvas.shadowOffsetX = 0;
            canvas.shadowOffsetY = 0;
            canvas.shadowBlur = 0;
            canvas.fillStyle = this.gridColor;
            canvas.fillRect(x+xs, y+3, this.width, 0.5);
            canvas.restore();
          }

          canvas.fillRect(x+xs, y, xs, xs/2);
        }
      }
    },

    toX: function(val) {
      var w = this.width - this.axisSize;
      return this.x+this.axisSize+(val==0?0:w*val/(this.data.length-1));
    },

    toY: function(val, maxValue) {
      var h = this.height - this.axisSize;
      return this.y+h-val*h/maxValue+0.5;
    },

    lastValue: function() {
      return this.data[this.data.length-1];
    },

    addData: function(value, opt_maxNumValues) {
      var maxNumValues = opt_maxNumValues || this.width;

      if ( this.data.length == maxNumValues ) this.data.shift();
      this.data.push(value);
    },

    watch: function(value, opt_maxNumValues) {
      var graph = this;

      value.addListener(function() {
        graph.addData(value.get(), opt_maxNumValues);
      });
    }
  }
});


var WarpedCanvas = {
  create: function(c, mx, my, w, h, mag) {
    return {
      __proto__: c,
      warp: function(x, y) {
        if ( Math.abs(mag) < 0.01 || ( mx < 1 && my < 1 ) ) { this.x = x; this.y = y; return; }

        var dx = x-mx;
        var dy = y-my;
        var r  = Math.sqrt(dx*dx + dy*dy);
        var t  = Math.atan2(dy, dx);

        var R = 400 * (1+mag);
        r = r/R;
        if ( r < 1 ) r += mag*3*r*Math.pow(1-r, 4);
        r = r*R;

        this.x = mx + Math.cos(t) * r;
        this.y = my + Math.sin(t) * r;
      },
      moveTo: function(x, y) { this.warp(x, y); c.moveTo(this.x, this.y); this.pX = x; this.pY = y; },
      lineTo: function(x2, y2) {
        var N = 100;
        var x1 = this.pX;
        var y1 = this.pY;
        var dx = (x2 - x1)/N;
        var dy = (y2 - y1)/N;
        var x = x1, y = y1;
        for ( var i = 0 ; i < N ; i++ ) {
          x += dx;
          y += dy;
          this.warp(x, y);
          c.lineTo(this.x, this.y);
        }
        this.pX = x2;
        this.pY = y2;
      },
      line: function(x1, y1, x2, y2) {
        c.beginPath();
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
        c.stroke();
      },
      fillText: function(t, x, y) {
        this.warp(x, y);
        c.fillText(t, this.x, this.y);
      },
      fillRect: function(x, y, width, height) {
        c.beginPath();
        this.moveTo(x, y);
        this.lineTo(x+width, y);
        this.lineTo(x+width, y+height);
        this.lineTo(x, y+height);
        this.lineTo(x, y);
        c.closePath();
        c.fill();
      },
      get font()        { return c.linewidth; },   set font(v)        { c.linewidth = v; },
      get lineWidth()   { return c.linewidth; },   set lineWidth(v)   { c.linewidth = v; },
      get strokeStyle() { return c.strokeStyle; }, set strokeStyle(v) { c.strokeStyle = v; },
      get fillStyle()   { return c.fillStyle; },   set fillStyle(v)   { c.fillStyle = v; },
      get textAlign()   { return c.textAlign; },   set textAlign(v)   { c.textAlign = v; }
    };
  }
};


CLASS({
  name:  'GridCView',
  extends: 'CView',
  label: 'GridCView',

  requires: ['foam.input.Mouse'],
  
  properties: [
    {
      name: 'grid',
      type: 'GridByExpr',
    },
    {
      name: 'mag',
      help: 'The current magnification level.  Animates to desiredMag.',
      defaultValue: 0.6
    },
    {
      name: 'desiredMag',
      postSet: function(_, mag) { this.mag = mag; },
      defaultValue: 0.6
    },
    {
      name: 'mouse',
      factory: function() { return this.Mouse.create(); }
    }
  ],

  listeners: [
    {
      name: 'onMouseMove',
      code: function(evt) {
        this.parent.paint()
      }
    }
  ],

  methods: {
    initHTML: function() {
      var self = this;

      this.SUPER();

      this.mouse.connect(this.parent.$);

      this.parent.$.addEventListener('mouseout', function() {
        this.animation_ && this.animation_();
        this.animation_ = Movement.animate(
          800,
          function() { self.mag = 0; },
          Movement.oscillate(0.8, self.mag/4))();
      });

      this.parent.$.addEventListener('mouseenter', function() {
        this.animation_ && this.animation_();
        this.animation_ = Movement.animate(
          400,
          function() { self.mag = self.desiredMag; })();
      });

      this.parent.$.onmousewheel = function(e) {
        if ( e.wheelDeltaY > 0 ) {
          this.desiredMag += 0.05;
        } else {
          this.desiredMag = Math.max(0, this.desiredMag-0.05);
        }
        this.parent.paint();
      }.bind(this);

      this.mouse.addListener(this.onMouseMove);
    },

    // TODO: move to CView
    line: function(x1, y1, x2, y2) {
      var c = this.canvas;

      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.closePath();
      c.stroke();
    },

    paint: function() {
      var ROW_LABEL_WIDTH = 140;
      var COL_LABEL_HEIGHT = 30;

      this.width  = this.parent.$.parentElement.clientWidth;
      this.height = this.parent.$.parentElement.clientHeight;

      var c = this.canvas;

      var g = this.grid;
      var cols = g.cols.groups;
      var rows = g.rows.groups;
      var sortedCols = g.sortedCols();
      var sortedRows = g.sortedRows();
      var w = this.width;
      var h = this.height;
      var wc = WarpedCanvas.create(c, this.mouse.x, this.mouse.y, w, h, this.mag);

      var xw = (w-ROW_LABEL_WIDTH) / sortedCols.length;
      var yw = (h-COL_LABEL_HEIGHT) / sortedRows.length;

      wc.fillStyle = '#eee';
      wc.fillRect(0, 0, this.width, COL_LABEL_HEIGHT);
      wc.fillRect(0, 0, ROW_LABEL_WIDTH, this.height);

      wc.lineWidth = 1;
      wc.strokeStyle = '#000';
      wc.fillStyle = '#000';
      wc.textAlign = 'left';
      wc.font = 'bold 10px arial';

      // Vertical Grid Lines
      for ( var i = 0 ; i < sortedCols.length ; i++ ) {
        var x = ROW_LABEL_WIDTH + i * xw;

        wc.fillText(sortedCols[i], x+2, COL_LABEL_HEIGHT/2+2);

        wc.line(x, 0, x, h);
      }
      // First line
      wc.line(0, 0, 0, h);
      // Last line
      wc.line(w, 0, w, h);

      // Horizontal Grid Lines
      for ( var i = 0 ; i < sortedRows.length ; i++ ) {
        var y = COL_LABEL_HEIGHT + i * yw;

        wc.fillText(sortedRows[i], 5, y + yw/2);

        wc.line(0, y, w, y);
      }

      // First line
      wc.line(0, 0, w, 0);
      // Last line
      wc.line(0, h, w, h);

      function wdist(x1, y1, x2, y2) {
        wc.warp(x2, y2);
        var dx = x1-wc.x;
        var dy = y1-wc.y;
        return dx*dx + dy*dy;
      }

      for ( var j = 0 ; j < sortedRows.length ; j++ ) {
        var y = sortedRows[j];
        for ( var i = 0 ; i < sortedCols.length ; i++ ) {
          var x = sortedCols[i];
          var value = rows[y].groups[x];

          if ( value && value.toCView ) {
            var cv = value.toCView();

            var cx = ROW_LABEL_WIDTH + xw * (i+0.5);
            var cy = COL_LABEL_HEIGHT + yw * (j+0.5);
            wc.warp(cx, cy);
            cv.x = wc.x;
            cv.y = wc.y;
            cv.r = Math.sqrt(Math.min(
              wdist(cv.x, cv.y, cx+xw/2, cy),
              wdist(cv.x, cv.y, cx-xw/2, cy),
              wdist(cv.x, cv.y, cx, cy+yw/2),
              wdist(cv.x, cv.y, cx, cy-yw/2)))-4;
            cv.x -= cv.r;
            cv.y -= cv.r;

            cv.parent = this.parent;

            if ( cv.r > 3 ) cv.paint();
          }
        }
      }
    }
  }
});
