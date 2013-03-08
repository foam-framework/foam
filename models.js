/*
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

/**
 * Only completely modelled models here.
 * All models in this file can be stored and loaded in a DAO.
 **/
var Timer = FOAM.create({
   model_: 'Model',

   name: 'Timer',
   label: 'Timer',

   properties: [
      {
	 name:  'interval',
	 label: 'Interval',
	 type:  'int',
	 view:  'IntFieldView',
	 help:  'Interval of time between updating time.',
	 units: 'ms',
	 defaultValue: 10
      },
      {
	 name:  'i',
	 label: 'I',
         type:  'int',
         view:  'IntFieldView',
	 defaultValue: 0
      },
      {
	 name:  'timeWarp',
	 label: 'Time Warp',
         type:  'float',
         view:  'FloatFieldView',
	 defaultValue: 1.0
      },
      {
	 name:  'duration',
	 label: 'Duration',
	 type:  'int',
         view:  'IntFieldView',
         units: 'ms',
	 defaultValue: -1
      },
      {
	 name: 'percent',
	 label: 'Percent',
	 type: 'float',
         view:  'FloatFieldView',
	 defaultValue: 0
      },
      {
	 name:  'startTime',
	 label: 'Start Time',
         type:  'int',
         view:  'IntFieldView',
	 defaultValue: 0
      },
      {
	 name:  'time',
	 label: 'Time',
         type:  'int',
         help:  'The current time in milliseconds since epoch.',
         view:  'IntFieldView',
	 defaultValue: 0
      },
      {
	 name:  'second',
	 label: 'Second',
         type:  'int',
         help:  'The second of the current minute.',
         view:  'IntFieldView',
	 defaultValue: 0
      },
      {
	 name:  'minute',
	 label: 'Minute',
         type:  'int',
         help:  'The minute of the current hour.',
         view:  'IntFieldView',
	 defaultValue: 0
      },
      {
	 name:  'hour',
	 label: 'Hour',
         type:  'int',
         help:  'The hour of the current day.',
         view:  'IntFieldView',
	 defaultValue: 0
      }
   ],

   actions: [
      {
         model_: 'ActionModel',
	 name:  'start',
	 label: 'Start',
	 help:  'Start the timer.',

	 isAvailable: function() { return true; },
	 isEnabled:   function() { return ! this.isStarted; },
	 action:      function() { this.isStarted = true; this.tick(); }
      },
      {
         model_: 'ActionModel',
	 name:  'step',
	 label: 'Step',
	 help:  'Step the timer.',

	 isAvailable: function() { return true; },
	 isEnabled: function()   { return ! this.isStarted; },
	 action: function()      {
	    this.i++;
	    this.time  += this.interval * this.timeWarp;
	    this.second = this.time /    1000 % 60 << 0;
	    this.minute = this.time /   60000 % 60 << 0;
	    this.hour   = this.time / 3600000 % 24 << 0;
	 }
      },
      {
         model_: 'ActionModel',
	 name:  'stop',
	 label: 'Stop',
	 help:  'Stop the timer.',

	 isAvailable: function() { return true; },
	 isEnabled: function()   { return this.isStarted; },
	 action: function()      { this.isStarted = false; }
      }
   ],

   methods: {
      tick: function()
      {
	 if ( ! this.isStarted ) return;

	 this.step();
	 setTimeout(this.tick.bind(this), this.interval);
      }
   }
});


var Mouse = FOAM.create({
   model_: 'Model',

   name: 'Mouse',
   label: 'Mouse',

   properties: [
      {
	 name:  'x',
	 label: 'X',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 10
      },
      {
	 name:  'y',
	 label: 'Y',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 10
      }
   ],
   methods: {
      connect: function(e) {
         e.addEventListener('mousemove', EventService.merged(this.onMouseMove,1));
      }
   },

   listeners:
   [
      {
	 model_: 'MethodModel',

	 name: 'onMouseMove',
	 code: function(evt) {
	    this.x = evt.offsetX;
	    this.y = evt.offsetY;
	 }
      }
   ]
});


/** A Panel is a container of other CViews. **/
var PanelCView = FOAM.create({
   model_: 'Model',

   name:  'PanelCView',
   label: 'Panel',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
         type:  'CView',
	 hidden: true
      },
      {
	 name:  'x',
	 label: 'X',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 10
      },
      {
	 name:  'y',
	 label: 'Y',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 10
      },
      {
	 name:  'children',
	 label: 'Children',
	 type:  'CView[]',
	 valueFactory: function() { return []; }
      },
      {
	 name:  'canvas',
	 label: 'Canvas',
	 type:  'CView',
	 getter: function() {
	   return this.parent.canvas;
	 },
	 setter: undefined
      }
   ],

   methods: {
      toHTML: function() {
//	 this.canvasView = Canvas.create(this);
	 this.canvasView = Canvas.create({width:this.width+1, height:this.height+2});
	 if ( this.backgroundColor ) this.canvasView.backgroundColor = this.backgroundColor;
	 return this.canvasView.toHTML();
      },

      initHTML: function() {
	 this.canvasView.initHTML();
	 this.canvasView.addChild(this);
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
	 this.children.remove(child);
	 child.parent = undefined;
	 return this;
      },

      paint: function() {
	 for ( var i = 0 ; i < this.children.length ; i++ ) {
	    var child = this.children[i];

	    child.paint();
	 }
      }
   }
});


/** Abstract CViews. **/
var CView = FOAM.create({
   model_: 'Model',

   name:  'CView',
   label: 'Panel',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
         type:  'CView',
	 hidden: true
      },
      {
	 name:  'x',
	 label: 'X',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 10
      },
      {
	 name:  'y',
	 label: 'Y',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 10
      },
      {
	 name:  'width',
	 label: 'Width',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 10
      },
      {
	 name:  'height',
	 label: '',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 10
      },
      {
	 name:  'children',
	 label: 'Children',
	 type:  'CView[]',
	 valueFactory: function() { return []; },
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
	 label: 'Canvas',
	 type:  'CView',
	 getter: function() {
	   return this.parent.canvas;
	 },
	 setter: undefined,
	 hidden: true
      }
   ],

   methods: {
      toHTML: function() {

         // If being added to HTML directly, then needs to create own Canvas as parent.
	 this.parent = Canvas.create();
	 return this.parent.toHTML();
      },

      initHTML: function() {
         var self = this;
         var parent = this.parent;

	 parent.initHTML();
	 parent.addChild(this);
         Events.dynamic(
           function() { self.x; self.y; self.width; self.height; }, function() {
             parent.width = self.x + self.width + 1;
             parent.height = self.y + self.height + 2;
           });
         Events.dynamic(
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
	 this.children.remove(child);
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

      paint: function() {
	 this.erase();
         this.paintChildren();
      }
   }
});


var ProgressCView = FOAM.create({

   model_: 'Model',

   extendsModel: 'PanelCView',

   name:  'ProgressCView',
   label: 'ProgressCView',

   properties: [
      {
	 name:  'value',
	 label: 'Value',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); },
         postSet: function(newValue, oldValue) {
	   oldValue && oldValue.removeListener(this.updateValue);
	   newValue.addListener(this.updateValue);
         }
      }
   ],

   listeners: {
     updateValue: function() {
       this.paint();
     }
   },

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

    destroy: function() {
      this.value.removeListener(this.listener_);
    }
   }
});


var ScrollCView = FOAM.create({

   model_: 'Model',

   extendsModel: 'CView',

   name:  'ScrollCView',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
         type:  'CView',
	 hidden: true,
         postSet: function(newValue, oldValue) {
//	   oldValue && oldValue.removeListener(this.updateValue);
//	   newValue.addListener(this.updateValue);
           var e = newValue.element();
           if ( ! e ) return;
           e.addEventListener('mousedown', this.mouseDown, false);
           e.addEventListener('touchstart', this.touchStart, false);
//           e.addEventListener('mouseup',   this.mouseUp,   false);
         }
      },
      {
	name:  'vertical',
        type:  'boolean',
        defaultValue: true
      },
      {
	name:  'value',
        type:  'int',
        help:  'The first element being shown, starting at zero.',
        defaultValue: 0
      },
      {
	name:  'extent',
        help:  'Number of elements shown.',
        type:  'int',
        defaultValue: 10
      },
      {
	 name:  'size',
         type:  'int',
         defaultValue: 0,
         help:  'Total number of elements being scrolled through.',
         postSet: function() { console.log('ScrollCView size:', this.size, 'height: ', this.height); this.paint(); }
      },
      {
        name: 'startY',
        type: 'int',
        defaultValue: 0
      },
      {
        name: 'startValue',
        help: 'Starting value or current drag operation.',
        type: 'int',
        defaultValue: 0
      }
   ],

   listeners: {
     mouseDown: function(e) {
//       this.parent.element().addEventListener('mousemove', this.mouseMove, false);
       this.startY = e.y - e.offsetY;
       window.addEventListener('mouseup', this.mouseUp, true);
       window.addEventListener('mousemove', this.mouseMove, true);
       window.addEventListener('touchstart', this.touchstart, true);
       this.mouseMove(e);
     },
     mouseUp: function(e) {
       e.preventDefault();
       window.removeEventListener('mousemove', this.mouseMove, true);
       window.removeEventListener('mouseup', this.mouseUp, true);
//       this.parent.element().removeEventListener('mousemove', this.mouseMove, false);
     },
     mouseMove: function(e) {
       var y = e.y - this.startY;
       e.preventDefault();

       this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(( y - this.y ) / (this.height-4) * this.size)));
     },
     touchStart: function(e) {
       this.startY = e.targetTouches[0].pageY;
       this.startValue = this.value;
       window.addEventListener('touchmove', this.touchMove, false);
//       this.parent.element().addEventListener('touchmove', this.touchMove, false);
       this.touchMove(e);
     },
     touchEnd: function(e) {
       window.removeEventListener('touchmove', this.touchMove, false);
       window.removeEventListener('touchend', this.touchEnd, false);
//       this.parent.element().removeEventListener('touchmove', this.touchMove, false);
     },
     touchMove: function(e) {
       var y = e.targetTouches[0].pageY;
       e.preventDefault();
       this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(this.startValue + (y - this.startY) / (this.height-4) * this.size )));
     },
     updateValue: function() {
       this.paint();
     }
   },

   methods: {

    paint: function() {
      var c = this.canvas;

      if ( ! c ) return;

      c.fillStyle = '#0f0';
      c.fillRect(this.x, this.w, this.width, this.height);

      if ( this.extent >= this.size ) return;

      c.strokeStyle = '#555';
      c.strokeRect(this.x, this.y, this.width-2, this.height);
      c.fillStyle = 'rgb(107,136,173)';
      c.fillRect(
        this.x + 2,
        this.y + 2 + this.value / this.size * this.height,
        this.width - 6,
        this.y - 6 + this.extent / this.size * this.height);
    },

    destroy: function() {
//      this.value.removeListener(this.listener_);
    }
   }
});


/** Add a scrollbar around an inner-view. **/
var ScrollBorder = FOAM.create({

   model_: 'Model',

   extendsModel: 'AbstractView2',

   name:  'ScrollBorder',
   label: 'Scroll Border',

   properties: [
       {
	   name: 'view',
	   label: 'View',
	   type: 'view',
           postSet: function(view) {
             this.scrollbar.extent = this.view.rows;
           }
       },
       {
	   name: 'scrollbar',
	   label: 'Scrollbar',
	   type: 'ScrollCView',
           valueFactory: function() {
             var sb = ScrollCView.create({height:1800, width: 20, x: 2, y: 2, extent: 10});

	     if ( this.dao ) this.dao.select(COUNT())(function(c) { sb.size = c.count; });

	     return sb;
           }
       },
       {
         name:  'dao',
         label: 'DAO',
         type: 'DAO',
	 hidden: true,
         required: true,
         postSet: function(newValue, oldValue) { 
          this.view.dao = newValue;
           var self = this;

           this.dao.select(COUNT())(function(c) {
               self.scrollbar.size = c.count;
               self.scrollbar.value = 0;
           });
           /*
           if ( oldValue && this.listener ) oldValue.unlisten(this.listener);
           this.listener && val.listen(this.listener);
           this.repaint_ && this.repaint_();
            */
         }
       }
   ],

   methods: {
     layout: function() {
       this.view.layout();
//       var view = window.getComputedStyle(this.view.element().children[0]);
       this.scrollbar.height = (toNum(this.view.rows) * 28) - 40;
       this.scrollbar.paint();
     },
     toHTML: function() {
       return '<table width=100% border=0><tr><td valign=top>' +
         this.view.toHTML() +
         '</td><td valign=top><div class="scrollSpacer"></div>' +
         this.scrollbar.toHTML() +
         '</td></tr></table>';
     },
     initHTML: function() {
       this.view.initHTML();
       this.scrollbar.initHTML();
       this.scrollbar.paint();

       var view = this.view;
       var scrollbar = this.scrollbar;
       var self = this;

       Events.dynamic(function() {scrollbar.value;}, function() {
         if ( self.dao ) self.view.dao = self.dao.skip(scrollbar.value); });

       Events.dynamic(function() {view.rows;}, function() {
           scrollbar.extent = view.rows;
         });
     }
   }
});


/*
var FilteredModel = FOAM.create({

   model_: 'Model',

   name: 'FilteredModel',
   label: 'Filtered Model',

   properties: [
      {
	 name:  'delegate',
	 label: 'Delegate',
	 type:  'Model',
	 postSet: function(model) {
	    this.filteredValue = undefined;
	 }
      },
      {
	 name:  'filteredValue',
	 label: 'FilteredValue',
	 type:  'Array[Object]'
      },
      {
	 name:  'predicate',
	 label: 'Predicate',
	 type:  'predicate',
	 defaultValue: function() {
	     return true;
	 },
	 postSet: function() {
	    this.filteredValue = undefined;
	 }
      }
   ],

   methods: {
      get: function() {
	 if ( ! this.filteredValue )
	 {
	    var val = this.delegate.get();

	    this.filteredValue = [];

	    for ( var i = 0 ; i < val.length ; i++ )
	    {
	       if ( this.predicate(val[i]) ) this.filteredValue.push(val[i]);
	    }
	 }

	 return this.filteredValue;
      },

      set: function(val) {
	 this.delegate.set(val);

	 this.filteredValue = undefined;

	 return this;
      }

      addListener: function(listener)
      {
	 return this.delegate.addListener(val);
      },

      removeListener: function(listener)
      {

      }

   }
});
*/



var Graph = FOAM.create({
   model_: 'Model',

   extendsModel: 'PanelCView',

   name:  'Graph',
   label: 'Graph',

   properties: [
      {
	 name:  'style',
	 label: 'Style',
	 type:  'String',
	 defaultValue: 'Line',
	 // TODO: fix the view, it's not storabe
	 view: {
	    create: function() { return ChoiceView.create({choices: [
              'Bar',
              'Line',
              'Point'
	    ]});}
	 }
      },
      {
	 name:  'width',
	 label: 'Width',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 5
      },
      {
	 name:  'height',
	 label: 'Height',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 5
      },
      {
	 name:  'graphColor',
	 label: 'Color',
	 type:  'String',
	 defaultValue: 'green'
      },
      {
	 name:  'backgroundColor',
	 label: 'Color',
	 type:  'String',
	 defaultValue: undefined
      },
      {
	 name:  'lineWidth',
	 label: 'Line Width',
	 type:  'int',
	 defaultValue: 6
      },
      {
	 name:  'drawShadow',
	 label: 'Draw Shadow',
	 type:  'boolean',
	 defaultValue: true
      },
      {
	 name:  'capColor',
	 label: 'Color',
	 type:  'String',
	 defaultValue: ''
      },
      {
	 name:  'axisColor',
	 label: 'Axis Color',
	 type:  'String',
	 defaultValue: 'black'
      },
      {
	 name:  'gridColor',
	 label: 'Axis Color',
	 type:  'String',
	 defaultValue: undefined
      },
      {
	 name:  'axisSize',
	 label: 'Axis Size',
	 type:  'int',
	 defaultValue: 2
      },
      {
	 name:  'xAxisInterval',
	 label: 'X Axis Interval',
	 type:  'int',
	 defaultValue: 0
      },
      {
	 name:  'yAxisInterval',
	 label: 'X Axis Interval',
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
	 label: 'Data',
	 type:  'Array[float]',
         valueFactory: function() {
            return [];
         }
//	 defaultValue: []
      },
      {
	 name: 'f',
	 label: 'Data Function',
	 type: 'Function',
         required: false,
	 displayWidth: 70,
         displayHeight: 3,
	 view: 'FunctionView',
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


      paintPointData: function(canvas, x, y, xs, w, h, maxValue)
      {
	 canvas.shadowOffsetX = 2;
	 canvas.shadowOffsetY = 2;
	 canvas.shadowBlur = 2;
	 canvas.shadowColor = "rgba(0, 0, 0, 0.5)";

	 canvas.strokeStyle = this.capColor;
	 canvas.lineWidth = 2;
	 canvas.lineJoin = 'round';
	 canvas.beginPath();
	 for ( var i = 0 ; i < this.data.length ; i++ )
	 {
	    var d = this.f(this.data[i]);
	    var lx = this.toX(i)+0.5;
	    var ly = this.toY(d, maxValue)+0.5;

	    if ( i == 0 )
	       canvas.moveTo(lx, ly);
	    else
	       canvas.lineTo(lx, ly);
	 }

	 canvas.stroke();

	 canvas.lineWidth = 3;
	 for ( var i = 0 ; i < this.data.length ; i++ )
	 {
	    var d = this.f(this.data[i]);
	    var lx = this.toX(i)+0.5;
	    var ly = this.toY(d, maxValue)+0.5;

	    canvas.beginPath();
	    canvas.arc(lx,ly,4,0,-Math.PI/2);
	    canvas.closePath();
	    canvas.stroke();
	 }

      },


      paintBarData: function(canvas, x, y, xs, w, h, maxValue)
      {
	 canvas.fillStyle = this.graphColor;

	 for ( var i = 0 ; i < this.data.length ; i++ )
	 {
	    var d = this.f(this.data[i]);
	    var x1 = x+xs+w*i/this.data.length;
	    var y1 = this.toY(d, maxValue);

	    canvas.fillRect(x1, y1, w/this.data.length+1.5, d*h/maxValue);
	 }
      },


      paint: function()
      {
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

	 if ( this.xAxisInterval )
	 for ( var i = this.xAxisInterval ; i <= this.data.length ; i += this.xAxisInterval )
	 {
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

	 if ( this.yAxisInterval )
	 for ( var i = this.yAxisInterval ; i <= maxValue ; i += this.yAxisInterval )
	 {
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

      },

      toX: function(val) {
	 var w  = this.width-this.axisSize;
	 return this.x+this.axisSize+(val==0?0:w*val/(this.data.length-1));
      },

      toY: function(val, maxValue) {
	 var h  = this.height-this.axisSize;
	 return this.y+h-val*h/maxValue+0.5;
      },

      lastValue: function() {
         return this.data[this.data.length-1];
      },

      addData: function(value, opt_maxNumValues) {
         var maxNumValues = opt_maxNumValues || this.width;

         this.data.push(value);
         if ( this.data.length > maxNumValues ) this.data.shift();
      },

      watch: function(model, opt_maxNumValues) {
         var graph = this;

         model.addListener(function() { this.addData(model.get(), opt_maxNumValues); });
      }

   }
});


var ViewChoice = FOAM.create({

   model_: 'Model',

   name: 'ViewChoice',
   label: 'ViewChoice',

   tableProperties: [
      'label',
      'view'
   ],

    properties: [
       {
	   name: 'label',
	   label: 'Label',
	   type: 'String',
	   displayWidth: 20,
           displayHeight: 1,
	   defaultValue: '',
	   help: "View's label."
       },
       {
	   name: 'view',
	   label: 'View',
	   type: 'view',
	   defaultValue: 'DetailView',
	   help: 'View factory.'
       }
    ]

});


var AlternateView = FOAM.create({

   model_: 'Model',

   extendsPrototype: 'AbstractView',

   name: 'AlternateView',
   label: 'Alternate View',

    properties: [
       {
	  name:  'selection',
	  label: 'Selection'
       },
       {
	   name: 'views',
	   label: 'Views',
	   type: 'Array[ViewChoice]',
           subType: 'ViewChoice',
	   view: 'ArrayView',
	   defaultValue: [],
	   help: 'View choices.'
       },
       {
	  name:  'view',
	  label: 'View',
	  postSet: function(viewChoice) {
	     if ( this.eid_ ) this.installSubView(viewChoice);
	  },
	  hidden: true
       }
    ],

   methods: {
      init: function() {
	 AbstractPrototype.init.call(this);
	 this.value = new SimpleValue("");
      },

      installSubView: function(viewChoice) {
	 var view = GLOBAL[viewChoice.view].create(this.value.get().model_, this.value);
	 this.element().innerHTML = view.toHTML();
	 view.initHTML();
         view.value.set(this.value.get());
//	 if ( view.set ) view.set(this.model.get());
//	 Events.link(this.model, this.view.model);
      },

      toHTML: function() {
	 var str  = [];
	 var viewChoice = this.views[0];

	 for ( var i = 0 ; i < this.views.length ; i++ )
	 {
	    var view = this.views[i];
	    if ( i != 0 ) str.push(' | ');
            var listener = function(altView, view) { return function (e) {
	       console.log("evt: ", e);

               altView.view = view;

	       return false;
	    };}(this,view);
	    str.push('<a href="#top" id="' + this.registerCallback('click', listener) + '">' + view.label + '</a>');
	    if ( view.label == this.selected ) viewChoice = view;
	 }
	 str.push('<br/>');
// console.log("viewChoice: ", viewChoice);

//	 Events.link(this.model, this.view.model);

//	 str.push(this.view.toHTML());
	 str.push('<div id="' + this.getID() + '" class="altView"> </div>');
	 return str.join('');
      },


      initHTML: function() {
         AbstractView.initHTML.call(this);
	 this.installSubView(this.view || this.views[0]);
      }

  }

});



var FloatFieldView = FOAM.create({

   model_: 'Model',

   name:  'FloatFieldView',
   label: 'Float Field View',

   extendsModel: 'TextFieldView',

   methods: {
     textToValue: function(text) {
       return parseFloat(text);
     }
   }
});


var IntFieldView = FOAM.create({

   model_: 'Model',

   name:  'IntFieldView',
   label: 'Int Field View',

   extendsModel: 'TextFieldView',

   methods: {
     textToValue: function(text) {
       return parseInt(text);
     }
   }
});


var StringArrayView = FOAM.create({

   model_: 'Model',

   name:  'StringArrayView',
   label: 'String Array View',

   extendsModel: 'TextFieldView',

   methods: {
     textToValue: function(text) {
       return text.replace(/\s/g,'').split(',');
     },
     valueToText: function(value) {
       return value ? value.toString() : "";
     }
   }
});


var SplitView = FOAM.create({

   model_: 'Model',

   extendsPrototype: 'AbstractView',

   name: 'SplitView',
   label: 'Split View',

    properties: [
       {
	  name:  'view1',
	  label: 'View 1'
       },
       {
	  name:  'view2',
	  label: 'View 2'
       }
    ],

   methods: {
      init: function() {
	 AbstractPrototype.init.call(this);
/*
	 this.view1 = AlternateView.create();
	 this.view2 = AlternateView.create();
*/
	 this.view1 = DetailView2.create();
	 this.view2 = JSView.create();

	 this.setValue(new SimpleValue(""));
      },

      // Sets the Data-Model
      setValue: function(value) {
	 this.value = value;
	 if ( this.view1 ) this.view1.setValue(value);
	 if ( this.view2 ) this.view2.setValue(value);
      },

      set: function(obj) {
	 this.value.set(obj);
      },

      get: function() {
	 return this.value.get();
      },

      toHTML: function() {
	 var str  = [];
         str.push('<table width=80%><tr><td width=40%>');
	 str.push(this.view1.toHTML());
         str.push('</td><td>');
	 str.push(this.view2.toHTML());
         str.push('</td></tr></table><tr><td width=40%>');
	 return str.join('');
      },

      initHTML: function() {
	 this.view1.initHTML();
	 this.view2.initHTML();
      }
  }

});
