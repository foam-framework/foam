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

function toNum(p) { return p.replace ? parseInt(p.replace('px','')) : p; };

// TODO: model, document
// properties: children, parent, value, eid,
var AbstractView =
{
   __proto__: AbstractPrototype,

    init: function() {
      AbstractPrototype.init.call(this);

      this.children = [];
      this.value    = new SimpleValue("");
    },

    strToHTML: function(str) {
      return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    addChild: function(child) {
      child.parent = this;
      this.children.push(child);

      return this;
    },

    removeChild: function(child) {
      this.children.remove(child);
      child.parent = undefined;

      return this;
    },

    addChildren: function() {
      Array.prototype.forEach.call(arguments, this.addChild.bind(this));

      return this;
    },

    nextID: function() {
        // @return a unique DOM element-id

	var id = 0;

	return function() {
	    return "view" + (id++);
	};
    }(),

    getID: function() {
      // @return this View's unique DOM element-id

      if ( ! this.eid_ ) this.eid_ = this.nextID();

      return this.eid_;
    },

    element: function() {
      // @return this View's DOM element
      return $(this.getID());
    },

    registerCallback: function(event, listener, opt_elementId) {
	opt_elementId = opt_elementId || this.nextID();

//	if ( ! this.hasOwnProperty('callbacks_') ) this.callbacks_ = [];
	if ( ! this.callbacks_ ) this.callbacks_ = [];

	this.callbacks_.push([opt_elementId, event, listener]);

	return opt_elementId;
    },

    write: function(document) {
       // Write the View's HTML to the provided document and then initialize.

       document.writeln(this.toHTML());
       this.initHTML();
    },

    initHTML: function() {
       // Initialize this View and all of it's children.
       // This mostly involves attaching listeners.
       // Must be called activate a view after it has been added to the DOM.

       if ( this.callbacks_ ) {
	  // hookup event listeners
	  for ( var i = 0 ; i < this.callbacks_.length ; i++ ) {
	     var callback  = this.callbacks_[i];
	     var elementId = callback[0];
	     var event     = callback[1];
	     var listener  = callback[2];
	     var e         = $(elementId);
             if ( ! e ) {
	        console.log('Error Missing element for id: ' + elementId + ' on event ' + event);
	     } else {
               e.addEventListener(event, listener.bind(this), false);
             }
	  }

	  delete this['callbacks_'];
       }

       if ( this.children ) {
	  // init children
	  for ( var i = 0 ; i < this.children.length ; i++ ) {
	     // console.log("init child: " + this.children[i]);
	     try {
		this.children[i].initHTML();
   	     } catch (x) {
		console.log("Error on AbstractView.child.initHTML", x, x.stack);
	     }
	  }
       }
    }

};

// ??? Should this have a 'value'?
// Or maybe a ValueView and ModelView
var AbstractView2 = FOAM.create({
   model_: 'Model',

   name: 'AbstractView2',
   label: 'AbstractView',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
	 type:  'View',
         hidden: true
      },
      {
	 name:  'children',
	 label: 'Children',
         type:  'Array[View]',
	 valueFactory: function() { return []; }
      },
      {
	 name:  'id',
	 label: 'Element ID',
         type:  'String',
         view:  'IntFieldView'
      }
   ],

   methods: {
    strToHTML: function(str) {
      return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    addChild: function(child) {
      child.parent = this;

      var children = this.children;
      children.push(child);
      this.children = children;

      return this;
    },

    removeChild: function(child) {
      this.children.remove(child);
      child.parent = undefined;

      return this;
    },

    addChildren: function() {
      Array.prototype.forEach.call(arguments, this.addChild.bind(this));

      return this;
    },

    nextID: function() {
      return "view2_" + (arguments.callee._nextId = (arguments.callee._nextId || 0) + 1);
    },

    getID: function() {
      // @return this View's unique DOM element-id

      return this.id || ( this.id = this.nextID() );
    },

    element: function() {
      // @return this View's DOM element

      return $(this.getID());
    },

    registerCallback: function(event, listener, opt_elementId) {
	opt_elementId = opt_elementId || this.nextID();

//	if ( ! this.hasOwnProperty('callbacks_') ) this.callbacks_ = [];
	if ( ! this.callbacks_ ) this.callbacks_ = [];

	this.callbacks_.push([opt_elementId, event, listener]);

	return opt_elementId;
    },

    /** Insert this View's toHTML into the Element of the supplied name. **/
    insertInElement: function(name) {
      var e = $(name);
      e.innerHTML = this.toHTML();
      this.initHTML();
    },

    write: function(document) {
       // Write the View's HTML to the provided document and then initialize.

       document.writeln(this.toHTML());
       this.initHTML();
    },

    initHTML: function() {
       // Initialize this View and all of it's children.
       // This mostly involves attaching listeners.
       // Must be called activate a view after it has been added to the DOM.

       if ( this.callbacks_ ) {
	  // hookup event listeners
	  for ( var i = 0 ; i < this.callbacks_.length ; i++ ) {
	     var callback  = this.callbacks_[i];
	     var elementId = callback[0];
	     var event     = callback[1];
	     var listener  = callback[2];
	     var e         = $(elementId);
             if ( ! e ) {
	        console.log('Error Missing element for id: ' + elementId + ' on event ' + event);
	     } else {
               e.addEventListener(event, listener.bind(this), false);
             }
	  }

	  delete this['callbacks_'];
       }

       if ( this.children ) {
	  // init children
	  for ( var i = 0 ; i < this.children.length ; i++ ) {
	     // console.log("init child: " + this.children[i]);
	     try {
		this.children[i].initHTML();
   	     } catch (x) {
		console.log("Error on AbstractView.child.initHTML", x, x.stack);
	     }
	  }
       }
    }

   }

});


var DomValue =
{
    DEFAULT_EVENT:    'change',
    DEFAULT_PROPERTY: 'value',

    create: function(element, opt_event, opt_property) {
	return {
	    __proto__: this,
	    element:   element,
	    event:     opt_event    || this.DEFAULT_EVENT,
	    property:  opt_property || this.DEFAULT_PROPERTY };
    },

    setElement: function ( element ) {
      this.element = element;
    },

    get: function() {
      return this.element[this.property];
    },

    set: function(value) {
      this.element[this.property] = value;
    },

    addListener: function(listener) {
      this.element.addEventListener(this.event, listener, false);
    },

    removeListener: function(listener) {
      try {
        this.element.removeEventListener(this.event, listener, false);
      } catch (x) {
	// could be that the element has been removed
      }
    },

    toString: function() {
	return "DomValue(" + this.event + ", " + this.property + ")";
    }
};



var Canvas = Model.create({

   extendsModel: 'AbstractView2',

   name:  'Canvas',
   label: 'Canvas',

   properties: [
      {
	 name:  'background',
	 label: 'Background Color',
         type:  'String',
	 defaultValue: 'white'
      },
      {
	 name:  'width',
	 label: 'Width',
         type:  'int',
	 defaultValue: 100,
         postSet: function(width) {
           if ( this.element() ) this.element().width = width;
         }
      },
      {
	 name:  'height',
	 label: 'Height',
	 type:  'int',
	 defaultValue: 100,
         postSet: function(height) {
           if ( this.element() ) this.element().height = height;
         }
      }
   ],

   methods: {
      init: function() {
	 this.__super__.init.call(this);
         // AbstractView2.getPrototype().init.call(this);

	 this.repaint = EventService.animate(function() {
	   this.paint();
	 }.bind(this));
      },

      toHTML: function() {
	 return '<canvas id="' + this.getID() + '" width="' + this.width + '" height="' + this.height + '"> </canvas>';
      },

      initHTML: function() {
	 this.canvas = this.element().getContext('2d');
      },

      addChild: function(child) {
//	 AbstractView2.addChild.call(this, child);
	 AbstractView2.getPrototype().addChild.call(this, child);

	 try {
	    child.addListener(this.repaint);
	 } catch (x) { }

	 try {
	    child.parent = this;
	 } catch (x) { }

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


var circleModel = Model.create({

   name:  'Circle',
   label: 'Circle',

   ids: [],

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
	 name:  'border',
	 label: 'Border Color',
         type:  'String',
	 defaultValue: undefined
      },
      {
	 name:  'borderWidth',
	 label: 'Border Width',
         type:  'int',
	 defaultValue: 1
      },
      {
	 name:  'alpha',
	 label: 'Alpha',
	 type:  'int',
	 defaultValue: 1
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


var ImageModel = FOAM.create({

   model_: 'Model',

   name:  'Image',
   label: 'Image',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
         type:  'CView',
	 hidden: true
      },
      {
	 name:  'alpha',
	 label: 'Alpha',
	 type:  'int',
	 defaultValue: 1
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
      },
      {
	 name:  'scale',
	 label: 'Scale',
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
        // TODO: Why is this calling AbstractView
        AbstractView.init.call(this);

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


var Rectangle = FOAM.create({

   model_: 'Model',

   name:  'Rectangle',
   label: 'Rectangle',

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
	 defaultValue: 'white',
      },
      {
	 name:  'x',
	 label: 'X',
         type:  'int',
	 defaultValue: 1000
      },
      {
	 name:  'y',
	 label: 'Y',
	 type:  'int',
	 defaultValue: 100
      },
      {
	 name:  'width',
	 label: 'Width',
         type:  'int',
	 defaultValue: 100
      },
      {
	 name:  'height',
	 label: 'Height',
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


var Label = FOAM.create({

   model_: 'Model',

   name:  'Label',
   label: 'Label',

   properties: [
      {
	 name:  'parent',
	 label: 'Parent',
         type:  'CView',
	 hidden: true
      },
      {
	 name:  'text',
	 label: 'Text',
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
	 label: 'Font',
         type:  'String',
	 defaultValue: ''
      },
      {
	 name:  'color',
	 label: 'Color',
         type:  'String',
	 defaultValue: 'black'
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
         canvas.textAlign = oldAlign
      }
   }
});


var Box = FOAM.create({

   model_: 'Model',

   extendsModel: 'Label',

   name:  'Box',
   label: 'Box',

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
	 label: 'Width',
         type:  'int',
	 defaultValue: 100
      },
      {
	 name:  'height',
	 label: 'Height',
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
        c.textAlign = oldAlign

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


var TextFieldView = FOAM.create({

   model_: 'Model',
   name:  'TextFieldView',
   label: 'Text Field',

   extendsModel: 'AbstractView2',

   properties: [
      {
	 name:  'name',
	 label: 'Name',
         type:  'String',
	 defaultValue: 'field'
      },
      {
	 name:  'displayWidth',
	 label: 'Display Width',
         type:  'int',
	 defaultValue: 30
      },
      {
	 name:  'mode',
	 label: 'Mode',
         type:  'String',
	 defaultValue: 'read-write',
         view: {
	      create: function() { return ChoiceView.create({choices:[
                 "read-only", "read-write", "final"
              ]}); } }
      },
      {
	 name:  'value',
	 label: 'Value',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); },
         postSet: function(newValue, oldValue) {
           if ( this.mode === 'read-write' ) {
	     Events.unlink(this.domValue, oldValue);
	     Events.relate(newValue, this.domValue, this.valueToText, this.textToValue);
           } else {
             Events.follow(newValue, this.domValue);
             /*
	     value.addListener(function() {
	                         this.element().innerHTML = newValue.get();
	                       }.bind(this));
              */
           }
         }
      }
   ],

   methods: {
    toHTML: function() {
	return ( this.mode === 'read-write' ) ?
	  '<input id="' + this.getID() + '" type="text" name="' + this.name + '" size=' + this.displayWidth + '/>' :
	  '<span id="' + this.getID() + '" name="' + this.name + '"></span>' ;
    },

    getValue: function() {
// console.log('getValue');
        return this.value;
     },

    setValue: function(value) {
// console.log('setValue');
      this.value = value;
    },

    initHTML: function() {
       var e = this.element();

       this.domValue = DomValue.create(e);

       this.setValue(this.value);
//       Events.link(this.model, this.domValue);
    },

//    textToValue: Events.identity,

//    valueToText: Events.identity,

    textToValue: function(text) { return text;},

    valueToText: function(value) { return value;},

    destroy: function() {
       Events.unlink(this.domValue, this.value);
    }
  }
});


var ChoiceView = FOAM.create({

   model_: 'Model',

   extendsModel: 'AbstractView2',

/*
 * <select size="">
 *    <choice value="" selected></choice>
 * </select>
 *
 *
 */
   name:  'ChoiceView',
   label: 'Choice View',

   properties: [
      {
	 name:  'name',
	 label: 'Name',
         type:  'String',
	 defaultValue: 'field'
      },
      {
         name: 'cssClass',
         type: 'String',
         defaultValue: 'foamChoiceView'
      },
      {
	 name:  'size',
	 label: 'Size',
         type:  'int',
	 defaultValue: 1
      },
      {
	 name:  'value',
	 label: 'Value',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); }
      },
      {
	 name:  'choices',
	 label: 'Choices',
         type:  'Array[StringField]',
	 help: 'Array of choices or array of [value, label] pairs.',
	 defaultValue: [],
         postSet: function() {
//           if ( this.eid_ ) this.updateHTML();
         }
      }
   ],

   methods: {
     toHTML: function() {
       return '<select id="' + this.getID() + '" name="' + this.name + '" size=' + this.size + '/></select>';
     },

     updateHTML: function() {
       var out = [];

       for ( var i = 0 ; i < this.choices.length ; i++ ) {
         var choice = this.choices[i];
         var id     = this.nextID();

	 try {
           this.registerCallback('click', this.onClick, id);
           this.registerCallback('mouseover', this.onMouseOver, id);
           this.registerCallback('mouseout', this.onMouseOut, id);
         } catch (x) {
	   // Fails on iPad, which is okay, because this feature doesn't make
           // sense on the iPad anyway.
	 }

         out.push('\t<option id="' + id + '"');

         if ( Array.isArray(choice) ) {
//           var encodedValue = choice[0].replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
//           var encodedValue = choice[0].replace(/"/g, '*').replace(/</g, '*').replace(/>/g, '*');

	   if ( this.value && choice[0] == this.value.get() ) out.push(' selected');
           out.push(' value="');
	   out.push(i + '">');
           out.push(choice[1].toString());
         } else {
	   if ( this.value && choice == this.value.get() ) out.push(' selected');
           out.push('>');
           out.push(choice.toString());
         }
         out.push('</option>');
       }

       this.element().innerHTML = out.join('');
       AbstractView2.getPrototype().initHTML.call(this);
     },

     getValue: function() {
       return this.value;
     },

     setValue: function(value) {
       Events.unlink(this.domValue, this.value);
       this.value = value;
//       Events.link(value, this.domValue);
       var self = this;
       Events.relate(
         value,
	 this.domValue,
	 function (v) {
	   for ( var i = 0 ; i < self.choices.length ; i++ ) {
	     var c = self.choices[i];
	     if ( Array.isArray(c) ) {
	       if ( c[0] === v ) return i;
	     } else {
	       if ( v == c ) return v;
	     }
	   }
	   return v;
         },
	 function (v) { console.log('fp:',v,'->',self.indexToValue(v)); return self.indexToValue(v); }
       );
     },

     initHTML: function() {
       var e = this.element();

       Events.dynamic(function() { this.choices; }.bind(this), this.updateHTML.bind(this));

       this.updateHTML();

       this.domValue = DomValue.create(e);

       this.setValue(this.value);
//       Events.link(this.value, this.domValue);
     },

     destroy: function() {
       Events.unlink(this.domValue, this.value);
     },

     indexToValue: function(v) {
       var i = parseInt(v);
       if ( isNaN(i) ) return v;

       if ( Array.isArray(this.choices[i]) ) return this.choices[i][0];

       return v;
     },

     evtToValue: function(e) { return this.indexToValue(e.target.value); }
   },

   listeners:
   [
      {
	 model_: 'Method',

	 name: 'onMouseOver',
	 code: function(e) {
	   if ( this.timer_ ) window.clearTimeout(this.timer_);
           this.prev = ( this.prev === undefined ) ? this.value.get() : this.prev;
           this.value.set(this.evtToValue(e));
	 }
      },

      {
	 model_: 'Method',

	 name: 'onMouseOut',
	 code: function(e) {
	   if ( this.timer_ ) window.clearTimeout(this.timer_);
           this.timer_ = window.setTimeout(function() {
	     this.value.set(this.prev || "");
             this.prev = undefined;
           }.bind(this), 1);
	 }
      },

      {
	 model_: 'Method',

	 name: 'onClick',
	 code: function(e) {
           this.prev = this.evtToValue(e);
           this.value.set(this.prev);
	 }
      }
   ]

});


var RadioBoxView = FOAM.create({

   model_: 'Model',

   extendsModel: 'ChoiceView',

   name:  'RadioBoxView',
   label: 'RadioBox View',

   properties: [
   ],

   methods: {
     toHTML: function() {
       return '<span id="' + this.getID() + '"/></span>';
     },

     updateHTML: function() {
       var out = [];

       for ( var i = 0 ; i < this.choices.length ; i++ ) {
         var choice = this.choices[i];

         if ( Array.isArray(choice) ) {
/*
           var encodedValue = choice[0].replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	   out.push(this.value && choice[0] == this.value.get() ? '\t<option selected value="' : '\t<option value="');
	   out.push(encodedValue + '">');
           out.push(choice[1].toString());
*/
         } else {
           out.push(choice.toString());
           out.push(': <input type="radio" name="');
           out.push(this.name);
           out.push('" value="');
           out.push(choice.toString());
           out.push('"');
           var callback = (function(value, choice) { return function() { value.set(choice); }})(this.value, choice);
	   out.push('id="' + this.registerCallback('click', callback) + '"');
           if ( this.value && choice == this.value.get() ) out.push(' checked');
           out.push('/> ');
         }
         out.push('</option>');
       }

       this.element().innerHTML = out.join('');
       AbstractView2.getPrototype().initHTML.call(this);
     },

     initHTML: function() {
       Events.dynamic(function() { this.choices; }.bind(this), this.updateHTML.bind(this));

//       this.updateHTML();
     }
   },

   listeners:
   [
      {
	 model_: 'Method',

	 name: 'onClick',
	 code: function(evt) {
           console.log('****************', evt, arguments);
	 }
      }
   ]

});


var RoleView = FOAM.create({

   model_: 'Model',

   extendsModel: 'AbstractView2',

   name:  'RoleView',
   label: 'Role View',

   properties: [
      {
	 name:  'roleName',
	 label: 'RoleName',
         type:  'String',
	 defaultValue: ''
      },
      {
	 name:  'models',
	 label: 'Models',
         type:  'Array[String]',
	 defaultValue: []
      },
      {
	 name:  'selection',
	 label: 'Selection',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); }
      },
      {
	 name:  'model',
	 label: 'Model',
	 type:  'Model'
      }
   ],

   methods: {
    initHTML: function() {
	var e = this.element();

	this.domValue = DomValue.create(e);

	Events.link(this.value, this.domValue);
    },

    toHTML: function() {
       var str = "";

       str += '<select id="' + this.getID() + '" name="' + this.name + '" size=' + this.size + '/>';
       for ( var i = 0 ; i < this.choices.length ; i++ ) {
	  str += "\t<option>" + this.choices[i].toString() + "</option>";
       }
       str += '</select>';

       return str;
    },

    getValue: function() {
        return this.value;
    },

    setValue: function(value) {
	Events.unlink(this.domValue, this.value);
	this.value = value;
	Events.link(value, this.domValue);
    },

    destroy: function() {
	Events.unlink(this.domValue, this.value);
    }
   }
});


var BooleanView = {
   __proto__: ModelProto,

//   extendsPrototype: 'AbstractView',
   extendsModel: 'AbstractView2',

   name:  'BooleanView',
   label: 'Boolean View',

   properties: [
      {
	 name:  'name',
	 label: 'Name',
         type:  'String',
	 defaultValue: 'field'
      }
   ],

   methods: {
    toHTML: function() {
       var str = "";

       str += '<input type="checkbox" id="' + this.getID() + '" name="' + this.name + '" />';

       return str;
    },

    initHTML: function() {
	var e = this.element();

	this.domValue = DomValue.create(e, 'change', 'checked');

	Events.link(this.value, this.domValue);
    },

    getValue: function() {
        return this.value;
    },

    setValue: function(value) {
	Events.unlink(this.domValue, this.value);
	this.value = value;
	Events.link(value, this.domValue);
    },

    destroy: function() {
	Events.unlink(this.domValue, this.value);
    }
   }
};


var TextAreaView = FOAM.create({

   model_: 'Model',

   extendsModel: 'AbstractView2',

   name: 'TextAreaView',
   label: 'Text-Area View',

    properties: [
      {
	 name:  'rows',
	 label: 'Rows',
         type:  'int',
         view:  'IntFieldView',
	 defaultValue: 5
      },
      {
	 name:  'cols',
	 label: 'Columns',
         type:  'int',
         view:  'IntFieldView',
	 defaultValue: 70
      },
      {
	 name:  'value',
	 label: 'Value',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); },
         postSet: function(newValue, oldValue) {
           Events.unlink(this.domValue, oldValue);

	   //Events.follow(this.model, this.domValue);
           try {
	     // Events.link(newValue, this.domValue);
             Events.relate(newValue, this.domValue, this.valueToText.bind(this), this.textToValue.bind(this));
           } catch (x) {
           }
         }
      }
    ],

   methods: {
      init: function(args) {
       AbstractView2.init.call(this, args);

       this.cols = (args && args.displayWidth)  || 70;
       this.rows = (args && args.displayHeight) || 10;
      },

      toHTML: function() {
	return '<textarea id="' + this.getID() + '" rows=' + this.rows + ' cols=' + this.cols + ' /> </textarea>';
      },

    setValue: function(value) {
      this.value = value;
    },

    initHTML: function() {
      this.domValue = DomValue.create(this.element(), 'change', 'value');

      // Events.follow(this.model, this.domValue);
      // Events.relate(this.value, this.domValue, this.valueToText, this.textToValue);
      this.value = this.value;
    },

    destroy: function() {
       Events.unlink(this.domValue, this.value);
    },

    textToValue: function(text) { return text; },

    valueToText: function(value) { return value; }
  }

});


// TODO: finish, extend text area, add error
var FunctionView2 = FOAM.create({

   model_: 'Model',

   name:  'FunctionView',
   label: 'Function View',

   extendsModel: 'TextFieldView',

   methods: {
    init: function(args) {
       TextAreaView.init.call(this, args);

       this.cols = args.displayWidth  || 80;
       this.rows = args.displayHeight || 8;
       this.errorView = TextFieldView.create({mode:'read-only'});
    },

    toHTML: function() {
       return '<pre style="color:red">' + this.errorView.toHTML() + '</pre>' + TextAreaView.toHTML.call(this);
    },

     setError: function(err) {
       if ( err ) console.log("Javascript Error: ", err);

       this.errorView.getModel().set(err || "");
     },

     textToValue: function(text) {
       setError("");

       if ( ! text ) return null;

       try {
	 return eval("(" + text + ")");
       } catch (x) {
         console.log("JS Error: ", text);
	 setError(x);
       }

       return text;
     },

     valueToText: function(value) {
       return value ? value.toString() : "";
     }
   }
});


// TODO: finish modelled replacement
var FunctionView =
{

    __proto__: TextAreaView,

    init: function(args) {
       TextAreaView.init.call(this, args);

       this.cols = args.displayWidth  || 80;
       this.rows = args.displayHeight || 8;
       this.errorView = TextFieldView.create({mode:'read-only'});
    },

    toHTML: function() {
       return '<pre style="color:red">' + this.errorView.toHTML() + '</pre>' + TextAreaView.toHTML.call(this);
    },

    initHTML: function() {
       this.domValue = DomValue.create(this.element(), 'keyup', 'value');

//       TextAreaView.initHTML.call(this);
       this.errorView.initHTML();

       /*
       editAreaLoader.init({
         id : this.getID(),
         syntax: "js",
         allow_toggle: false,
	 start_highlight: true,
         change_listener: this.onChange.bind(this)
       });
	*/
    },

    setError: function(err) {
       if ( err ) console.log("Javascript Error: ", err);

       this.errorView.getModel().set(err || "");
    },

    setValue: function(value) {
	Events.unlink(this.domValue, this.value);
	this.value = value;

        var setError = this.setError.bind(this);

	Events.relate(
	   this.value,
	   this.domValue,
	   // function->string
	   function(f) {
	      return f ? f.toString() : "";
	   },
	   // string->function
	   function(str) {
	      setError("");

	      if ( ! str ) return null;

	      try
	      {
		 return eval("(" + str + ")");
	      }
	      catch (x)
	      {
                 console.log("JS Error: ", str);
		 setError(x);
	      }

	      return str;
           }
	);
    }

};


var JSView = FOAM.create({

   model_: 'Model',

   name:  'JSView',
   label: 'JS View',

   extendsModel: 'TextAreaView',

    methods: {
      init: function(args) {
        TextAreaView.init.call(this, args);

        this.cols = (args && args.displayWidth)  || 100;
        this.rows = (args && args.displayHeight) || 50;
      },

      textToValue: function(text) {
        try {
	  return JSONUtil.parse(text);
        } catch (x) {
	  console.log("error");
        }
        return text;
      },

      valueToText: function(val) {
        return JSONUtil.stringify(val);
      }
    }
});


var XMLView = FOAM.create({

   model_: 'Model',

   name:  'XMLView',
   label: 'XML View',

   extendsModel: 'TextAreaView',

    methods: {
      init: function(args) {
        TextAreaView.init.call(this, args);

        this.cols = (args && args.displayWidth)  || 100;
        this.rows = (args && args.displayHeight) || 50;
      },

      textToValue: function(text) {
        // TODO: parse XML
        return text;
      },

      valueToText: function(val) {
        return XMLUtil.stringify(val);
      }
    }
});


var DetailView =
{

   __proto__: AbstractView,

   create: function(model, value) {
      var obj = AbstractView.create.call(this);

      obj.model = model;
      // TODO: this remembers the wrong 'this' when decorated with
      // ActionBorder
      obj.setValue(value || new SimpleValue());

      return obj;
   },

   getValue: function() {
      return this.value;
   },

   setValue: function (value) {
      if ( this.getValue() ) {
	 // todo:
	 /// getValue().removeListener(???)
      }
      this.value = value;
      this.updateSubViews();
      // TODO: model this class and make updateSubViews a listener
      // instead of bind()'ing
      value.addListener(this.updateSubViews.bind(this));
   },

   /** Create the sub-view from property info. **/
   createView: function(prop) {
      var view =
         ! prop.view                   ? TextFieldView     :
         typeof prop.view === 'string' ? GLOBAL[prop.view] :
         prop.view ;

      if ( ! view ) console.log("Missing view for: ", prop);

      return view.create(prop);
   },

   toHTML: function() {
      this.children = [];
      var model = this.model;
      var str  = "";

      str += '<div id="' + this.getID() + '" class="detailView" name="form" method="post">';
      str += '<table><tr><th colspan=2 class="heading">';
      str += 'Edit ' + model.label;
      str += '</th></tr>';

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
	 var prop = model.properties[i];

	 if ( prop.hidden ) continue;

	 var view = this.createView(prop);

	 try {
	    view.setValue(this.get().propertyValue[prop.name]);
   	 } catch (x) { }
	 view.prop = prop;
	 view.toString = function () { return this.prop.name + "View"; };
         this.addChild(view);

         str += '<tr>';
	 str += "<td class='label'>" + prop.label + "</td>";
	 str += '<td>';
	 str += view.toHTML();
	 str += '</td>';
         str += '</tr>';
      }

      str += '</table>';
      str += '</div>';

      return str;
   },

   initHTML: function() {
      AbstractView.initHTML.call(this);

      // hooks sub-views upto sub-models
      this.updateSubViews();
   },

   set: function(obj) {
      this.getValue().set(obj);
   },

   get: function() {
      return this.getValue().get();
   },

   updateSubViews: function() {
      var obj = this.get();

      if ( obj === "" ) return;

      for ( var i = 0 ; i < this.children.length ; i++ ) {
	 var child = this.children[i];
	 var prop  = child.prop;

         if ( ! prop ) continue;

	 try {
	   child.setValue(obj.propertyValue(prop.name));
	 } catch (x) {
	   console.log("error: ", prop.name, " ", x);
	 }
      }
   },

   setModel: function(obj) {
      if ( ! obj ) return;

      this.obj = obj;
   },

   destroy: function()
   {
   }

}


/** Version of DetailView which allows class of object to change. **/
var DetailView2 = {

   __proto__: AbstractView,

   create: function(unusedModel, value) {
      var obj = AbstractView.create.call(this);

      obj.model = null;
      obj.setValue(value || new SimpleValue());

      return obj;
   },

   getValue: function() {
      return this.value;
   },

   setValue: function (value) {
      if ( this.getValue() ) {
	 // todo:
	 /// getValue().removeListener(???)
      }

      this.value = value;

      this.updateSubViews();
      value.addListener(this.updateSubViews.bind(this));
   },


   toHTML: function() {
      this.children = [];
      return '<div id="' + this.getID() + '" class="detailView" name="form">dv2</div>';
   },


   /** Create the sub-view from property info. **/
   createView: function(prop) {
      var view =
         ! prop.view                   ? TextFieldView     :
         typeof prop.view === 'string' ? GLOBAL[prop.view] :
         prop.view ;

      return view.create(prop);
   },


   updateHTML: function() {
      if ( ! this.eid_ ) return;

      this.children = [];

      var model = this.model;
      var str  = "";

      str += '<table><tr><th colspan=2 class="heading">';
      str += 'Edit ' + model.label;
      str += '</th></tr>';

      for ( var i = 0 ; i < model.properties.length ; i++ )
      {
	 var prop = model.properties[i];

	 if ( prop.hidden ) continue;

	 var view = this.createView(prop);

	 try {
	    view.setValue(this.get().propertyValue[prop.name]);
   	 } catch (x) {
	 }

	 view.prop = prop;
	 view.toString = function () { return this.prop.name + "View"; };
         this.addChild(view);

         str += '<tr>';
	 str += "<td class='label'>" + prop.label + "</td>";
	 str += '<td>';
	 str += view.toHTML();
	 str += '</td>';
         str += '</tr>';
      }

      str += '</table>';

      this.element().innerHTML = str;
      AbstractView.initHTML.call(this);
   },

   initHTML: function() {
      AbstractView.initHTML.call(this);

      if ( this.get() ) {
	 this.updateHTML();

	 // hooks sub-views upto sub-models
	 this.updateSubViews();
      }
   },

   set: function(obj) {
      this.getValue().set(obj);
   },

   get: function() {
       return this.getValue().get();
   },

   updateSubViews: function() {
      // check if the Value's model has changed
      if ( this.get().model_ !== this.model ) {
	 this.model = this.get().model_;
	 this.updateHTML();
      }

      var obj = this.get();

      for ( var i = 0; i < this.children.length ; i++ ) {
	 var child = this.children[i];
	 var prop  = child.prop;

	 if ( ! prop ) continue;

	 try {
//	       console.log("updateSubView: " + child + " " + prop.name);
//	       console.log(obj.propertyValue(prop.name).get());
              child.setValue(obj.propertyValue(prop.name));
	 } catch (x) {
	    console.log("Error on updateSubView: ", prop.name, x, obj);
	 }
      }
   },

   setModel: function(obj) {
      if ( ! obj ) return;

      this.obj = obj;
   },

   destroy: function() {
   }

}


/** A display-only summary view. **/
var SummaryView =
{

   __proto__: AbstractView,

   create: function(value) {
      var obj = AbstractView.create.call(this);

      obj.model = value.get().model_;
      obj.value = value;

      return obj;
   },

   getValue: function() {
      return this.value;
   },

   toHTML: function() {
      this.children = [];
      var model = this.model;
      var obj   = this.get();
      var out   = [];

      out.push('<div id="' + this.getID() + '" class="summaryView">');
      out.push('<table>');

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
	 var prop = model.properties[i];

	 if ( prop.hidden ) continue;

	 var value = obj[prop.name];

	 if ( ! value ) continue;

	 if ( prop.subType && value instanceof Array ) {
	    if ( value.length === 0 ) continue;

	    var tableView = TableView.create(value[0].model_);
	    tableView.objs = value;

	    out.push("<tr><th colspan=2 class='label'>" + prop.label + "</th></tr>");
	    out.push('<tr><td colspan=2>');
	    out.push(tableView.toHTML());
	    out.push('</td></tr>');
	 } else {
            out.push('<tr>');
	    out.push('<td class="label">' + prop.label + '</td>');
	    out.push('<td class="value">');
            if ( prop.summaryFormatter ) {
               out.push(prop.summaryFormatter(this.strToHTML(value)));
            } else {
	       out.push(this.strToHTML(value));
            }
	    out.push('</td></tr>');
	 }
      }

      out.push('</table>');
      out.push('</div>');

      return out.join('');
   },

   get: function() {
     return this.getValue().get();
   }

};


/** A display-only on-line help view. **/
var HelpView = FOAM.create({
   model_: 'Model',

   extendsModel: 'AbstractView2',

   name: 'HelpView',
   label: 'Help View',

   properties: [
      {
	 name:  'model',
	 label: 'Model',
	 type:  'Model'
      }
   ],

   methods: {

   // TODO: it would be better if it were initiated with
   // .create({model: model}) instead of just .create(model)
   // TODO:
   // would be nice if I could mark properties as mandatory
   // if they were required to be initialized
   create: function(model) {
      var obj = AbstractView.create.call(this);

      obj.model = model;

      return obj;
   },

   // TODO: make this a template?
   toHTML: function() {
      var model = this.model;
      var out   = [];

      out.push('<div id="' + this.getID() + '" class="helpView">');

      out.push('<div class="intro">');
      out.push(model.help);
      out.push('</div>');

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
	 var prop = model.properties[i];

	 if ( prop.hidden ) continue;

	 out.push('<div class="label">');
	 out.push(prop.label);
	 out.push('</div><div class="text">');
	 if ( prop.subType /*&& value instanceof Array*/ && prop.type.indexOf('[') != -1 ) {
	    var subModel = GLOBAL[prop.subType];
	    var subView  = HelpView.create(subModel);
	    if ( subModel != model )
	       out.push(subView.toHTML());
	 } else {
	    out.push(prop.help);
	 }
	 out.push('</div>');
      }

      out.push('</div>');

      return out.join('');
   }

  }

});


var TableView = FOAM.create({
   model_: 'Model',

   extendsModel: 'AbstractView2',

   name: 'TableView',
   label: 'Table View',

   properties: [
      {
	 name:  'model',
	 label: 'Model',
	 type:  'Model'
      },
      {
	 name:  'properties',
	 label: 'Properties',
	 type:  'Array[String]',
         defaultValueFn: function() {
           return this.model.tableProperties;
         }
      },
      {
	 name:  'selection',
	 label: 'Selection',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); }
      },
      {
	 name:  'children',
	 label: 'Children',
         type:  'Array[View]',
	 valueFactory: function() { return []; }
      }
   ],

   methods: {

    // Not actually a method, but still works
    // TODO: add 'Constants' to Model
    DOUBLE_CLICK: "double-click", // event topic

   // TODO: it would be better if it were initiated with
   // .create({model: model}) instead of just .create(model)
   create: function(model) {
      var obj = AbstractView.create.call(this);

      obj.model = model;

      return obj;
   },

    toHTML: function() {
      return '<span id="' + this.getID() + '">' +
        this.tableToHTML() +
        '</span>';
    },

    tableToHTML: function() {
	var model = this.model;

	var str = [];
	var props = [];

        str.push('<table class="foamTable ' + model.name + 'Table">');

	//str += '<!--<caption>' + model.plural + '</caption>';
        str.push('<thead><tr>');
	for ( var i = 0 ; i < this.properties.length ; i++ )
	{
	    var key  = this.properties[i];
	    var prop = model.getProperty(key);

	    if ( ! prop ) continue;

	    if ( prop.hidden ) continue;

	    str.push('<th scope=col>' + prop.label + '</th>');

	    props.push(prop);
	}
	str.push('</tr></thead><tbody>');

        if ( this.objs )
	for ( var i = 0 ; i < this.objs.length; i++ ) {
	    var obj = this.objs[i];

	    str.push('<tr class="tr-' + this.getID() + '")">');

	    for ( var j = 0 ; j < props.length ; j++ ) {
		var prop = props[j];

		str.push('<td>');
		var val = obj[prop.name];
		str.push(( val == null ) ? '&nbsp;' : val);
		str.push('</td>');
	    }

	    str.push('</tr>');
	}

	str.push('</tbody></table>');

	return str.join('');
    },

    setValue: function(value) {
       this.objs = value.get();
       if ( ! this.element() ) return this;
       this.element().innerHTML = this.tableToHTML();
       this.initHTML();
       return this;
    },

    initHTML: function() {
	var es = document.getElementsByClassName('tr-' + this.getID());

	for ( var i = 0 ; i < es.length ; i++ ) {
	    var e = es[i];

	    e.onmouseover = function(value, obj) { return function() {
               value.prevValue = value.get();
	       value.set(obj);
	    }; }(this.selection, this.objs[i]);
	    e.onmouseout = function(value, obj) { return function() {
	       if ( ! value.prevValue ) return;
               value.set(value.prevValue);
               delete value['prevValue'];
	    }; }(this.selection, this.objs[i]);
	    e.onclick = function(value, obj) { return function(evt) {
	       value.set(obj);
               delete value['prevValue'];
               var siblings = evt.srcElement.parentNode.parentNode.childNodes;
	       for ( var i = 0 ; i < siblings.length ; i++ ) {
                  siblings[i].className = "";
	       }
               evt.srcElement.parentNode.className = 'rowSelected';
	    }; }(this.selection, this.objs[i]);
	    e.ondblclick = function(me, value, obj) { return function(evt) {
               me.publish(me.DOUBLE_CLICK, obj, value);
	    }; }(this, this.selection, this.objs[i]);
	}
    },


    destroy: function() {
    }
  }
});


var TableView2 = FOAM.create({
   model_: 'Model',

   extendsModel: 'AbstractView2',

   name: 'TableView2',
   label: 'Table View 2',

   properties: [
      {
	 name:  'model',
	 label: 'Model',
	 type:  'Model'
      },
      {
	 name:  'properties',
	 label: 'Properties',
	 type:  'Array[String]',
         defaultValueFn: function() {
           return this.model.tableProperties;
         }
      },
      {
	 name:  'selection',
	 label: 'Selection',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); }
      },
      {
	 name:  'children',
	 label: 'Children',
         type:  'Array[View]',
	 valueFactory: function() { return []; }
      },
      {
	 name:  'sortOrder',
	 label: 'Sort Order',
         type:  'Comparator',
         defaultValue: undefined
      },
      {
         name:  'dao',
         label: 'DAO',
         type: 'DAO',
         required: true,
	 hidden: true,
         postSet: function(val, oldValue) {
           if ( oldValue && this.listener ) oldValue.unlisten(this.listener);
           this.listener && val.listen(this.listener);
           this.repaint_ && this.repaint_();
         }
      },
      {
        name: 'rows',
        label: 'Rows',
        type:  'Integer',
        defaultValue: 30,
        postSet: function(val, oldValue) {
	   this.repaint();
        }
      }
   ],

   methods: {

     layout: function() {
       var parent = window.getComputedStyle(this.element().parentNode.parentNode.parentNode.parentNode.parentNode);
       this.rows = Math.floor((toNum(parent.height) - 22) / 26);
/*
       var style = window.getComputedStyle(this.element().children[0]);

       var prevHeight = 0;
       while ( toNum(parent.height)-22 > toNum(style.height) && toNum(style.height) > prevHeight ) {
         prevHeight = toNum(style.height);
         this.rows = this.rows+1;
	 style = window.getComputedStyle(this.element().children[0]);
       }
       while ( toNum(parent.height)-22 < toNum(style.height) && this.rows > 0 ) {
         this.rows = this.rows-1;
style = window.getComputedStyle(this.element().children[0]);
       }
*/
//       this.scrollbar.height = (parent.style.height - 50) + 'px';
//       this.scrollbar.height = toNum(this.element().style.width)-50;
     },

    // Not actually a method, but still works
    // TODO: add 'Constants' to Model
    DOUBLE_CLICK: "double-click", // event topic

     init: function() {
       AbstractView2.getPrototype().init.call(this);

       var self = this;
       this.repaint_ = EventService.animate(this.repaint.bind(this));

       this.listener = {
         put: self.repaint_,
         remove: self.repaint_
       };
     },

    repaint: function() {
      if ( ! this.dao ) return;
// console.time('redraw');
// if (this.element() && this.element().firstChild) this.element().firstChild = undefined;
      var self = this;
      var objs = [];
//console.log('*********** TableView2.rows:', this.rows);
      (this.sortOrder ? this.dao.orderBy(this.sortOrder) : this.dao).limit(this.rows).select({put:function(o) {objs.push(o); }} )(function() {
        self.objs = objs;
        if ( self.element() ) {
          self.element().innerHTML = self.tableToHTML();
          self.initHTML_();
        }
      });
// console.timeEnd('redraw');
    },

   // TODO: it would be better if it were initiated with
   // .create({model: model}) instead of just .create(model)
    toHTML: function() {
      return '<span id="' + this.getID() + '">' +
        this.tableToHTML() +
        '</span>';
    },

    tableToHTML: function() {
	var model = this.model;

	var str = [];
	var props = [];

        str.push('<table class="foamTable ' + model.name + 'Table">');

	//str += '<!--<caption>' + model.plural + '</caption>';
        str.push('<thead><tr>');
	for ( var i = 0 ; i < this.properties.length ; i++ ) {
	    var key  = this.properties[i];
	    var prop = model.getProperty(key);

	    if ( ! prop ) continue;

	    if ( prop.hidden ) continue;

	    str.push('<th scope=col ');
            str.push('id=' +
                this.registerCallback(
                  'click',
                  (function(table, prop) { return function() {
                    table.sortOrder = prop; table.repaint(); };})(this, prop)));
            if ( prop.tableWidth ) str.push(' width="' + prop.tableWidth + '"');
            str.push('>' + prop.label + '</th>');

	    props.push(prop);
	}
	str.push('</tr></thead><tbody>');
        if ( this.objs )
	for ( var i = 0 ; i < this.objs.length; i++ ) {
	    var obj = this.objs[i];

	    str.push('<tr class="tr-' + this.getID() + '">');

	    for ( var j = 0 ; j < props.length ; j++ ) {
		var prop = props[j];

		str.push('<td>');
		var val = obj[prop.name];
                if ( prop.tableFormatter ) {
                  str.push(prop.tableFormatter(val, obj, this));
                } else {
		  str.push(( val == null ) ? '&nbsp;' : this.strToHTML(val));
                }
		str.push('</td>');
	    }

	    str.push('</tr>');
	}

	str.push('</tbody></table>');

	return str.join('');
    },

    setValue: function(value) {
       this.dao = value.get();
       return this;
    },

    initHTML: function() {
      this.repaint();
    },

    initHTML_: function() {
      AbstractView.initHTML.call(this);
      var es = document.getElementsByClassName('tr-' + this.getID());

      for ( var i = 0 ; i < es.length ; i++ ) {
	var e = es[i];

	e.onmouseover = function(value, obj) { return function() {
          value.prevValue = value.get();
	  value.set(obj);
	}; }(this.selection, this.objs[i]);
	e.onmouseout = function(value, obj) { return function() {
	  if ( ! value.prevValue ) return;
            value.set(value.prevValue);
            delete value['prevValue'];
	}; }(this.selection, this.objs[i]);
	e.onclick = function(value, obj) { return function(evt) {
	   value.set(obj);
           delete value['prevValue'];
           var siblings = evt.srcElement.parentNode.parentNode.childNodes;
	   for ( var i = 0 ; i < siblings.length ; i++ ) {
              siblings[i].className = "";
	   }
           evt.srcElement.parentNode.className = 'rowSelected';
	}; }(this.selection, this.objs[i]);
	e.ondblclick = function(me, value, obj) { return function(evt) {
           me.publish(me.DOUBLE_CLICK, obj, value);
	}; }(this, this.selection, this.objs[i]);
      }
    },


    destroy: function() {
    }
  }
});


var ActionButton =
{
   __proto__: AbstractView,

   create: function(action, value) {
      var obj = {
	 __proto__: this,
	 action:    action,
	 value:     value,
	 instance_: {} // todo: fix
      };

      value.addListener(this.subjectUpdate.bind(this));

      return obj;
   },

   subjectUpdate: function() {
      // console.log('subject update: ' + this.value);
   },

   toHTML: function() {
      this.registerCallback(
	 'click',
	 function(action) { return function() {
	    action.action.apply(this.value.get());
         };}(this.action),
         this.getID());

      return '<button class="myButton" id="' + this.eid_ + '">' + this.action.label + '</button>';
   }
};


/** Add Action Buttons to a decorated View. **/
/* TODO:
   The view needs a standard interface to determine it's Model (getModel())
   listen for changes to Model and change buttons displayed and enabled
   use isAvailable and isEnabled
   Buttons should be own View with enabled = true/false and own listeners, don't use <button> directly
 */
var ActionBorder =
{

    /** @arg actions either a model or an array of actions **/
    create: function(actions, delegate) {
	var obj = {
	    __proto__: delegate,
	    TYPE:      'ActionBorder',
	    actions:   actions.actions || actions,
	    // This is a bit hacking, but it prevents
	    // both this wrapper and the delegate from
	    // having separate element ID's
	    // try removing in future
	    getID: function() {
	        return this.__proto__.getID();
	    },
	    toHTML: function() {
		var model = this.model;
		var str   = "";

		str += '<table class="actionBorder"><tr><td>';

		str += this.__proto__.toHTML.apply(this);

		str += '</td></tr><tr><td class="actionBorderActions">';

		for ( var i = 0 ; i < this.actions.length ; i++ ) {
		   var action = this.actions[i];
		   var button = ActionButton.create(action, this.getValue());
		   str += " " + button.toHTML() + " ";

		   this.addChild(button);
		}

		str += '</td></tr></table>';

		return str;
	    }
	};

      // if delegate doesn't have a getValue method, then add one
      // TODO: remember why I do this and either document or remove
      try {
        obj.value.set(obj.value.get);
        //        obj.setValue(obj.getValue());
      } catch (x) {
        console.log('error: ', x);
      }

      // todo: this is breaking timer
        if ( ! obj.getValue ) {
	   var dm = new SimpleValue(obj);
	   obj.getValue = function() {
	      return dm;
	   };
        }
	return obj;
    }
};


var ProgressView = FOAM.create({

   model_: 'Model',

   extendsModel: 'AbstractView2',

   name:  'ProgressView',
   label: 'ProgressView',

   properties: [
      {
	 name:  'value',
	 label: 'Value',
         type:  'Value',
         valueFactory: function() { return new SimpleValue(); }
      }
   ],

   methods: {

    toHTML: function() {
	return '<progress value="25" id="' + this.getID() + '" max="100" >25</progress>';
    },

    setValue: function(value) {
	this.value.removeListener(this.listener_);

	this.value = value;
	value.addListener(this.listener_);
    },

    updateValue: function() {
	var e = this.element();

	e.value = parseInt(this.value.get());
    },

    initHTML: function() {
	var e = this.element();

        // TODO: move to modelled listener
	this.listener_ = this.updateValue.bind(this);

	this.value.addListener(this.listener_);
    },

    destroy: function() {
	this.value.removeListener(this.listener_);
    }
  }
});


var ArrayView = {
   create: function(prop) {
      var view = DAOControllerView.create(GLOBAL[prop.subType]);
      return view;
   }
};


var ModelAlternateView = FOAM.create({
   model_: 'Model',
   name: 'ModelAlternateView',
   label: 'Model Alternate View',
   extendsModel: 'AlternateView',
   methods: {
      init: function() {
         // TODO: super.init
	 this.views = FOAM.create([
                     {
			model_: 'ViewChoice',
			label:  'GUI',
			view:   'DetailView'
		     },
                     {
			model_: 'ViewChoice',
			label:  'JS',
			view:   'JSView'
		     },
                     {
			model_: 'ViewChoice',
			label:  'XML',
			view:   'XMLView'
		     },
                     {
			model_: 'ViewChoice',
			label:  'UML',
			view:   'XMLView'
		     },
                     {
			model_: 'ViewChoice',
			label:  'Split',
			view:   'SplitView'
		     }
		  ]
	       );
      }
   }
});


var GridView = FOAM.create({
   model_: 'Model',

   extendsModel: 'AbstractView2',

   name: 'GridView',
   label: 'Grid View',

   properties: [
      {
         name:  'row',
         label: 'row',
         type: 'ChoiceView',
	 valueFactory: function() { return ChoiceView.create(); }
      },
      {
         name:  'col',
         label: 'column',
         type: 'ChoiceView',
	 valueFactory: function() { return ChoiceView.create(); }
      },
      {
         name:  'acc',
         label: 'accumulator',
         type: 'ChoiceView',
	 valueFactory: function() { return ChoiceView.create(); }
      },
      {
         name:  'accChoices',
         label: 'Accumulator Choices',
         type: 'Array',
	 valueFactory: function() { return []; }
      },
      {
         name:  'model',
         label: 'Model',
         type: 'Model'
      },
      {
         name:  'dao',
         label: 'DAO',
         type: 'DAO'
      },
      {
	 name:  'grid',
	 label: 'Grid',
	 type:  'GridByExpr',
	 valueFactory: function() { return GridByExpr.create(); }
      }
   ],

   // TODO: need an 'onChange:' property to handle both value
   // changing and values in the value changing

   // TODO: listeners should be able to mark themselves as mergable
   // or updatable on 'animate', ie. specify decorators
   methods: {
     updateHTML: function() {
       var self = this;
       this.grid.xFunc = this.col.value.get() || this.grid.xFunc;
       this.grid.yFunc = this.row.value.get() || this.grid.yFunc;
       this.grid.acc   = this.acc.value.get() || this.grid.acc;

       console.log('update: ' , this.col.value.get(), this.row.value.get(), this.acc.value.get());
       this.dao.select(this.grid/*.clone()*/)(function(g) {
         self.element().innerHTML = g.toHTML();
       });
     },

     initHTML: function() {
       var choices = [];
       this.model.properties.select({put:function(p) {
         choices.push([p, p.label]);
       }});
       this.row.choices = choices;
       this.col.choices = choices;

       this.acc.choices = this.accChoices;

       this.row.initHTML();
       this.col.initHTML();
       this.acc.initHTML();

       AbstractView2.getPrototype().initHTML.call(this);
       this.repaint_ = EventService.animate(this.updateHTML.bind(this));

       this.grid.addListener(function() {
         console.log('Grid Grid Update');
	 this.repaint_();
       });

       this.grid.addListener(function() {
         console.log('Grid DAO Update');
	 this.repaint_();
       });

       this.row.value.addListener(this.repaint_);       
       this.col.value.addListener(this.repaint_);       
       this.acc.value.addListener(this.repaint_);       

       this.updateHTML();
     }
   },

   templates:[
     {
        model_: 'Template',

        name: 'toHTML',
        description: 'TileView',
        template: '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %> <br/></div><div id="<%= this.getID()%>" class="gridViewArea"></div>'
     }
   ]
});

