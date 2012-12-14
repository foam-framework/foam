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
//	 this.canvasView = CanvasModel.create(this);
	 this.canvasView = CanvasModel.create({width:this.width+1, height:this.height+2});
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

   extendsModel: 'PanelCView',

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
           e.addEventListener('mousedown', this.mouseDown, false);
//           e.addEventListener('mouseup',   this.mouseUp,   false);
         }
      },
      {
	 name:  'x',
         type:  'int',
         defaultValue: 0
      },
      {
	 name:  'y',
         type:  'int',
         defaultValue: 0
      },
      {
	 name:  'width',
         type:  'int',
         defaultValue: 20
      },
      {
	 name:  'height',
         type:  'int'
      },
      {
	name:  'vertical',
        type:  'boolean',
        defaultValue: true
      },
      {
	name:  'value',
        type:  'int',
        defaultValue: 0
      },
      {
        name: 'starty',
        type: 'int',
        defaultValue: 0
      },
      {
	name:  'extent',
        type:  'int',
        defaultValue: 10
      },
      {
	 name:  'size',
         type:  'int'
      }
   ],

   listeners: {
     mouseDown: function(e) {
       console.log('mouseDown: ', e);
//       this.parent.element().addEventListener('mousemove', this.mouseMove, false);
       this.starty = e.y - e.offsetY;
       window.addEventListener('mouseup', this.mouseUp, true);
       window.addEventListener('mousemove', this.mouseMove, true);
       this.mouseMove(e);
     },
     mouseUp: function(e) {
       console.log('mouseUp: ', e);
       e.preventDefault();
       window.removeEventListener('mousemove', this.mouseMove, true);
       window.removeEventListener('mouseUp', this.mouseUp, true);
//       this.parent.element().removeEventListener('mousemove', this.mouseMove, false);
     },
     mouseMove: function(e) {
       console.log('mouseMove: ', e);
       var y = e.y - this.starty;
       e.preventDefault();

       this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(( y - this.y ) / (this.height-4) * this.size)));
     },
     touchStart: function(e) {
       console.log('touchStart: ', e);
       window.addEventListener('touchmove', this.touchMove, false);
//       this.parent.element().addEventListener('touchmove', this.touchMove, false);
       this.mouseMove(e);
     },
     touchEnd: function(e) {
       console.log('touchEnd: ', e);
       e.preventDefault();
       window.removeEventListener('touchmove', this.touchMove, false);
       window.removeEventListener('touchend', this.touchEnd, false);
//       this.parent.element().removeEventListener('touchmove', this.touchMove, false);
     },
     touchMove: function(e) {
       console.log('touchMove: ', e);
       var y = e.offsetY;
       e.preventDefault();
       console.log('y: ', y);
       this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(( y - this.y ) / (this.height-4) * this.size)));
     },
     updateValue: function() {
       this.paint();
     }
   },

   methods: {

    paint: function() {
      var c = this.canvas;

      if ( ! c ) {
        debugger;
      }
      c.fillStyle = '#fff';
      c.fillRect(this.x, this.w, this.width, this.height);

      c.strokeStyle = '#000';
      c.strokeRect(this.x, this.y, this.width-2, this.height);
      c.fillStyle = '#039';
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
             return ScrollCView.create({height:800, width: 20, x: 2, y: 2, extent: 10, size: this.dao ? this.dao.length : 100});
           }
       },
       {
         name:  'dao',
         label: 'DAO',
         type: 'DAO',
         required: true,
         postSet: function(newValue, oldValue) {
           this.view.dao = newValue;
           // TODO: only works for []'s
           var self = this;
           var count = COUNT();
           this.dao.select({
             __proto__: count,
             eof: function() {
               self.scrollbar.size = this.count;
               self.scrollbar.value = 0;
             }
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
         if ( self.dao) self.view.dao = self.dao.skip(scrollbar.value); });
       Events.dynamic(function() {view.rows;}, function() {
           scrollbar.extent = view.rows;
         });
     }
   }
});

var EyeCView = FOAM.create({

   model_: 'Model',

   extendsModel: 'PanelCView',

   name:  'EyeCView',
   label: 'Eye',

   properties: [
      {
	 name:  'color',
	 label: 'Color',
	 type:  'String',
	 defaultValue: 'red'
      },
      {
	 name:  'r',
	 label: 'Radius',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 100
      },
      {
	 name:  'lid',
	 label: 'Lid',
	 type:  'Circle',
	 paint: true,
	 valueFactory: function() {
	    return circleModel.create({x:this.x,y:this.y,r:this.r,color:this.color,parent:this});
	 }
      },
      {
	 name:  'white',
	 label: 'White',
	 type:  'Circle',
	 paint: true,
	 valueFactory: function() {
	    return circleModel.create({x:this.x,y:this.y,r:this.r-10,color:'white',parent:this});
	 }
      },
      {
	 name:  'pupil',
	 label: 'Pupil',
	 type:  'Circle',
	 paint: true,
	 valueFactory: function() {
	    return circleModel.create({x:this.x,y:this.y,r:10,color:'black',parent:this});
	 }
      }

   ],

   methods: {
      watch: function(target) {
	 this.target_ = target;
      },
      paint: function()
      {
	 this.pupil.x = this.lid.x = this.white.x = this.x;
	 this.pupil.y = this.lid.y = this.white.y = this.y;

	 // point pupil towards target
	 if ( this.target_ )
	    Movement.stepTowards(this.target_, this.pupil, this.r-26);

	 this.canvas.save();
	 this.canvas.translate(this.x,this.y);
	 this.canvas.rotate(-Math.PI/100);
	 this.canvas.scale(1.0,1.3);
	 this.canvas.translate(-this.x,-this.y);

	 this.lid.paint();
	 this.white.paint();
	 this.pupil.paint();

	 this.canvas.restore();
      }
   }
});


var EyesCView = FOAM.create({

   model_: 'Model',

   extendsModel: 'PanelCView',

   name:  'EyesCView',
   label: 'Eyes',

   properties: [
      {
	 name:  'leftEye',
	 label: 'Left',
	 type:  'Eye',
	 paint: true,
	 valueFactory: function() {
	    return EyeCView.create({x:this.x+50,y:this.y+50,r:50,color:'red',parent:this});
	 }
      },
      {
	 name:  'rightEye',
	 label: 'Right',
	 type:  'Eye',
	 paint: true,
	 valueFactory: function() {
	    return EyeCView.create({x:this.x+120,y:this.y+65,r:48,color:'yellow',parent:this});
	 }
      }
   ],

   methods: {
      watch: function(target) {
	 this.leftEye.watch(target);
	 this.rightEye.watch(target);
      },
      paint: function()
      {
	 this.leftEye.paint();
	 this.rightEye.paint();
      }
   }
});


var ClockView = FOAM.create({

   model_: 'Model',

   extendsModel: 'PanelCView',

   name:  'ClockView',
   label: 'Clock',

   properties: [
      {
	 name:  'color',
	 label: 'Color',
	 type:  'String',
	 defaultValue: 'yellow'
      },
      {
	 name:  'lid',
	 label: 'Lid',
	 type:  'Circle',
	 paint: true,
	 valueFactory: function() {
	    return circleModel.create({x:this.x,y:this.y,r:this.r,color:this.color,parent:this});
	 }
      },
      {
	 name:  'white',
	 label: 'White',
	 type:  'Circle',
	 paint: true,
	 valueFactory: function() {
	    return circleModel.create({x:this.x,y:this.y,r:this.r-3,color:'white',parent:this});
	 }
      },
      {
	 name:  'r',
	 label: 'Radius',
	 type:  'int',
	 view:  'IntFieldView',
	 defaultValue: 100
      },
      {
	 name:  'a',
	 label: 'Rotation',
	 type:  'float',
	 view:  'IntFieldView',
	 defaultValue: 0
      },
      {
	 name:  'hourHand',
	 label: 'Hour Hand',
	 type:  'Hand',
	 paint: true,
	 valueFactory: function() {
	    return this.Hand.create({x:this.x,y:this.y,r:this.r-15,width:7,color:'green',parent:this});
	 }
      },
      {
	 name:  'minuteHand',
	 label: 'MinuteHand',
	 type:  'Hand',
	 paint: true,
	 valueFactory: function() {
	    return this.Hand.create({x:this.x,y:this.y,r:this.r-6,width:5,color:'blue',parent:this});
	 }
      },
      {
	 name:  'secondHand',
	 label: 'Second Hand',
	 type:  'Hand',
	 paint: true,
	 valueFactory: function() {
	    return this.Hand.create({x:this.x,y:this.y,r:this.r-6,width:3,color:'red',parent:this});
	 }
      }

   ],

   methods: {
      paint: function()
      {
	 this.canvas.save();

         this.canvas.translate(this.x, this.y);
         this.canvas.rotate(this.a);
         this.canvas.translate(-this.x, -this.y);

	 var date = new Date();

	 this.secondHand.x = this.hourHand.x = this.minuteHand.x = this.lid.x = this.white.x = this.x;
	 this.secondHand.y = this.hourHand.y = this.minuteHand.y = this.lid.y = this.white.y = this.y;

	 this.secondHand.a = Math.PI/2 - Math.PI*2 * date.getSeconds() / 60 ;
	 this.minuteHand.a = Math.PI/2 - Math.PI*2 * date.getMinutes() / 60 ;
	 this.hourHand.a   = Math.PI/2 - Math.PI*2 * (date.getHours() % 12) / 12;

	 this.lid.paint();
	 this.white.paint();
	 this.hourHand.paint();
	 this.minuteHand.paint();
	 this.secondHand.paint();

	 this.canvas.restore();
      }
   },

   models: [
   FOAM.create({
     model_: 'Model',
     name: 'Hand',
     label: 'Clock Hand',
     extendsModel: 'PanelCView',
     properties:
     [
        {
           model_: 'Property',
           name: 'color',
           label: 'Color',
           type: 'String',
           defaultValue: 'blue'
        },
        {
           model_: 'Property',
           name: 'width',
           label: 'Width',
           type: 'int',
           view: 'IntFieldView',
           defaultValue: 5
        },
        {
           model_: 'Property',
           name: 'r',
           label: 'Radius',
           type: 'int',
           view: 'IntFieldView',
           defaultValue: 100
        },
        {
           model_: 'Property',
           name: 'a',
           label: 'Alpha',
           type: 'int',
           view: 'IntFieldView',
           defaultValue: 100
        }
     ],
     methods:
     [

        {
           model_: 'Method',
           name: 'paint',
           code: function ()
	   {
	      var canvas = this.parent.canvas;

	      canvas.beginPath();
	      canvas.moveTo(this.x,this.y);
	      canvas.lineTo(this.x+this.r*Math.cos(this.a),this.y-this.r*Math.sin(this.a));
	      canvas.closePath();

	      canvas.lineWidth = this.width;
	      canvas.strokeStyle = this.color;
	      canvas.stroke();
	   }
        }
     ]
   })
   ]

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
	 str.push('<div id="' + this.getID() + '" class="altView"> </div>')
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
// debugger;
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


var System = FOAM.create({

   model_: 'Model',

   name:  'System',
   label: 'System',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
         type:  'CView',
	 hidden: true
      },
      {
	 name:  'title',
	 label: 'Title',
         type:  'String',
	 defaultValue: ''
      },
      {
	 name:  'color',
	 label: 'Color',
         type:  'String',
	 defaultValue: 'black',
      },
      {
	 name:  'devColor',
	 label: 'Color of Developers',
         type:  'String',
	 defaultValue: 'red'
      },
      {
	 name:  'numDev',
	 label: 'Number of Developers',
         type:  'int',
         postSet: function(devs) {
           if ( ! this.cIndex ) this.cIndex = 1;
           var colours = ['#33f','#f00','#fc0','#33f','#3c0'];

           if ( ! this.devs ) return;
           while ( this.devs.length > (devs << 0) ) this.devs.pop();
           while ( this.devs.length < (devs << 0) ) {
             this.devs.unshift(Developer.create({color:this.devColor == 'google' ? colours[this.cIndex++ % colours.length] : this.devColor}));
             this.devs[0].parent = this.parent;
           }
         },
	 defaultValue: 10,
      },
      {
	 name:  'totalCode',
	 label: 'Code',
         type:  'int',
	 defaultValue: 0,
      },
      {
         name: 'features',
	 label: 'Features',
	 type: 'Array[String]',
	 view: 'StringArrayView',
	 defaultValue: [],
	 help: 'Features to be implemented be Entity.'
      },
      {
         name: 'entities',
	 label: 'Entities',
	 type: 'Array[String]',
	 view: 'StringArrayView',
	 defaultValue: [],
	 help: 'Data entities to be supported.'
      },
      {
	 name:  'x',
	 label: 'X',
         type:  'int',
	 defaultValue: 0
      },
      {
	 name:  'y',
	 label: 'Y',
	 type:  'int',
	 defaultValue: 0
      },
      {
	 name:  'selectedX',
	 label: 'Selected X',
         type:  'int',
	 defaultValue: 0
      },
      {
	 name:  'selectedY',
	 label: 'Selected Y',
	 type:  'int',
	 defaultValue: 0
      },
      {
	 name:  'width',
	 label: 'Width',
         type:  'int',
	 defaultValue: 0
      },
      {
	 name:  'height',
	 label: 'Height',
	 type:  'int',
	 defaultValue: 0
      },
      {
	 name:  'mouse',
	 label: 'Mouse',
	 type:  'Mouse',
	 view: {
	    create: function() { return DetailView.create(Mouse); }
         },
	 valueFactory: function() {
	    return Mouse.create();
	 }
      },
      {
         model_: 'Property',
         name: 'alpha',
         label: 'Alpha',
         type: 'int',
         view: 'IntFieldView',
         defaultValue: 1
        }
   ],

   methods: {
      erase: function() {
        this.canvas.globalAlpha = 0.2;
//        AbstractPrototype.erase.call(this);
      },

      init: function(values)
      {
        AbstractPrototype.init.call(this, values);

        this.parent.addChild(this);

        this.mouse.connect(this.parent.element());

        Events.dynamic(function() {
//           console.log(this.mouse.x, this.mouse.y);
//           console.log(this.x, this.width, this.features.length);
          this.selectedX = Math.floor((this.mouse.x-this.x)/this.width*(this.features.length+1));
          this.selectedY = Math.floor((this.mouse.y-this.y-25)/(this.height-25)*(this.entities.length+1));
        }.bind(this));

        this.code = [];
        this.devs = [];

        var tmp = this.numDev;
        this.numDev = 0;
        this.numDev = tmp;
/*
        for ( var i = 0 ; i < this.numDev ; i++ ) {
          this.devs[i] = Developer.create({color:this.devColor == 'google' ? colours[cIndex++ % colours.length] : this.devColor});
          this.devs[i].parent = this.parent;
          // this.parent.addChild(this.devs[i]);
        }
*/

        this.codeGraph = Graph.create({x:20, y:20, width:360, height:200, style:'Line', graphColor:null, capColor: this.devColor});
        this.utilityGraph = Graph.create({x:20, y:260, width:360, height:200, style:'Line', graphColor:null, capColor: this.devColor});
        this.efficiencyGraph = Graph.create({x:20, y:500, width:360, height:200, style:'Line', graphColor:null, capColor: this.devColor});

        this.l = Label.create({parent: this.parent, align: 'left', font:'18pt Arial', x:20, y:18});
        Events.follow(this.propertyValue('title'), this.l.propertyValue('text'));
      },

      totalUtility: function() {
         var u = 0;

         for ( var i = 1 ; i <= this.features.length ; i++ )
           for ( var j = 1 ; j <= this.entities.length ; j++ )
             u += this.uc(i, j);

         return u;
      },

      moveDev: function(dev, x, y) {
         if ( dev.moving ) return;

         dev.f = x;
         dev.e = y;

         var w = this.parent.width-15;
         var h = this.parent.height-28;
         var fs = this.features.length+1;
         var es = this.entities.length+1;

         dev.moveTo(w/fs * ( x + 0.7*Math.random() + 0.15), h/es * ( y + 0.7*Math.random() + 0.15));
      },

      addCode: function(x, y, lines) {
         this.totalCode += lines;
         if ( ! this.code[x] ) this.code[x] = [];
         this.code[x][y] = (this.code[x][y] || 0) + lines;
      },

      // Code-Count
      cc: function(x, y) {
         if ( ! this.code[x] ) return 0;
         if ( ! this.code[x][y] ) return 0;

         return this.code[x][y];
      },

      // Utility-Count
      uc: function(x, y) {
         return this.cc(x, y) + this.cc(x, 0) * this.cc(0, y)/10;
      },

      tick: function(timer) {
//        for ( var i = 0 ; i < this.devs.length ; i++ ) this.architecture(this, this.devs[i]);
        for ( var i = 0 ; i < this.devs.length ; i++ ) if ( i % 20 == timer.i % 20 ) this.architecture(this, this.devs[i]); else this.addCode(this.devs[i].f, this.devs[i].e, 0.3);
      },

    multics: function(system, dev) {
       var nx = Math.floor(Math.random() * 100000) % system.features.length + 1;
       var ny = Math.floor(Math.random() * 100000) % system.entities.length + 1;

       if ( ! dev.f ) {
          system.moveDev(dev, nx, ny);
       }

       randomAct(
         7, function() {
           system.addCode(dev.f, dev.e, 1);
         },
         2, function() {
           system.moveDev(dev, dev.f, dev.e);
         },
         1, function() {
           system.moveDev(dev,dev.f && Math.random() < 0.7 ? dev.f : nx, dev.e && Math.random() < 0.7 ? dev.e : ny);
         });
    },

    foam: function(system, dev)
    {
       var r = Math.random();
       var nx = Math.floor(Math.random() * 100000) % system.features.length + 1;
       var ny = Math.floor(Math.random() * 100000) % system.entities.length + 1;

       if ( dev.f === undefined ) {
          dev.f = nx;
          dev.e = ny;
       }

       randomAct(
         4, function() {
           system.moveDev(dev, nx, ny);
         },
         4, function() {
           system.moveDev(dev, dev.f, dev.e);
         },
         5, function() {
           system.moveDev(dev, 0, ny);
         },
         90, function() {
           system.moveDev(dev, nx, 0);
         });

       system.addCode(dev.f, dev.e, 1);
    },

    unix: function(system, dev)
    {
       var r = Math.random();
       var nx = Math.floor(Math.random() * 100000) % system.features.length + 1;
       var ny = Math.floor(Math.random() * 100000) % system.entities.length + 1;

       if ( dev.f === undefined ) {
//          r = r / 10 + 0.9;
          system.moveDev(dev, 1, 0);
       }

       if ( r < 0.7 && system.cc(dev.f,dev.e) < 1.1 * system.totalCode / (system.features.length + system.entities.length)) {
          system.moveDev(dev, dev.f, dev.e);
       }
       else if ( r < 0.85 ) {
          system.moveDev(dev, nx, 0);
       }
       else {
          system.moveDev(dev, 0, ny);
       }

       system.addCode(dev.f, dev.e, 1);
    },

    mixed: function(system, dev) {
      if ( dev.color === 'red' ) return System.getPrototype().unix(system, dev);
      return System.getPrototype().multics(system, dev);
    },


      paint: function() {
         var c = this.parent.canvas;
         var w = this.parent.width-15;
         var h = this.parent.height-28;
         var fs = this.features.length;
         var es = this.entities.length;

         if ( ! this.width ) this.width = this.parent.width;
         if ( ! this.height ) this.height = this.parent.height;
         // this.l.x = this.width/2;

         c.save();
         c.globalAlpha = this.alpha;

         c.translate(this.x, this.y);
         c.scale(this.width/this.parent.width, this.height/this.parent.height);

         this.l.paint();

         c.translate(0, 25); // make space for the title

         // draw feature labels along the top row
         for ( var i = 0 ; i <= fs ; i++ ) {
            c.fillStyle = 'lightGray';
            c.fillRect(i*w/(fs+1),0,w/(fs+1),h/(es+1));
            c.fillStyle = 'black';
            if ( i > 0 ) c.fillText(this.features[i-1], i*w/(fs+1)+5 , h/(es+1)/2+5);
         }
         // draw entity labels along the left column
         for ( var i = 0 ; i <= es ; i++ ) {
            c.fillStyle = 'lightGray';
            c.fillRect(0, i*h/(es+1),w/(fs+1),h/(es+1));
            c.fillStyle = 'black';
            if ( i > 0 ) c.fillText(this.entities[i-1], 8, (i+0.5)*h/(es+1)+3, w/(fs+1)-15);
         }

         // draw grid-lines
         c.fillStyle = 'gray';
         for ( var i = 0 ; i < fs ; i++ )
            c.fillRect((1+i)*w/(fs+1),0,3,h);
         for ( var i = 0 ; i < es ; i++ )
            c.fillRect(0,(1+i)*h/(es+1),w,3);

         // draw individual cell contents
         c.fillStyle = '#55ee55';
         for ( var i = 0 ; i <= fs ; i++ )
           for ( var j = 0 ; j <= es ; j++ ) {
              var code = Math.min(h/es/5-2, this.cc(i, j)/300);
              var utility = Math.min(h/es/5-2, this.uc(i, j)/300);

	      // Logarithmic Scale
              /*
              var code = Math.log(this.cc(i, j));
              var utility = Math.log(this.uc(i, j));
	      */

              c.fillStyle = 'orange';
              c.fillRect(i*w/(fs+1)+3,(j+1)*h/(es+1),w/(fs+1)-3,-utility*5);

              c.fillStyle = '#55ee55';
              c.fillRect(i*w/(fs+1)+3,(j+1)*h/(es+1),w/(fs+1)-3,-code*5);
              // c.fillRect(i*w/(fs+1)+5,(j+1)*h/(es+1)-code/10-1,code%10 * (w/(fs+1))/10,1);

              if ( i == this.selectedX && j == this.selectedY ) {
                c.strokeStyle = 'red';
                c.lineWidth = 3;
                c.strokeRect(i*w/(fs+1)+4,(j+1)*h/(es+1)-1,w/(fs+1)-5,-h/(es+1)+5);
              }
	   }

         c.strokeStyle = this.color;
         c.lineWidth = 3;
         c.strokeRect(2, 2, w, h-2);

 	 for ( var i = 0 ; i < this.devs.length ; i++ )
	   this.devs[i].paint();

         c.restore();
      }
   }
});



var Developer = FOAM.create({

   model_: 'Model',

   name:  'Developer',
   label: 'Developer',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
         type:  'CView',
	 hidden: true
      },
      {
	 name:  'color',
	 label: 'Color',
         type:  'String',
	 defaultValue: 'white'
      },
      {
	 name:  'x',
	 label: 'X',
         type:  'int',
	 defaultValue: 100
      },
      {
	 name:  'y',
	 label: 'Y',
	 type:  'int',
	 defaultValue: 100
      }
   ],

   methods: {
      program: function() {
         if ( ! this.moving && Math.random() < 0.2 ) this.move();
      },

      move_notused: function() {
//         if ( this.moving ) return;
         this.moving = true;

         var obj = this;
         Movement.animate(
          timer.interval*20,
          function() {
           /* if ( Math.random() < 0.1 ) */ obj.x = Math.random()*obj.parent.width;
            if ( Math.random() < 0.25 ) obj.y = Math.random()*obj.parent.height;
          },
          Movement.linear /*ease(0.35, 0.35)*/,
          function() { this.moving = false; }.bind(this))();
      },

      moveTo: function(x,y) {
         if ( this.moving ) return;

         this.moving = true;

         var obj = this;
         Movement.animate(
          timer.interval*30,
          function() {
             obj.x = x;
             obj.y = y;
          },
          Movement.linear /*ease(0.35, 0.35)*/,
          function() { this.moving = false; }.bind(this))();
      },

      paint: function() {
         var canvas = this.parent.canvas;

         canvas.fillStyle = this.color;

         canvas.beginPath();
         canvas.arc(this.x, this.y, 6, 0, Math.PI*2, true);
         canvas.closePath();
         canvas.fill();
      }
   }
});
