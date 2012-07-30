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

var DomModel =
{
    DEFAULT_EVENT:    'onchange',
    //    DEFAULT_EVENT:    'onkeyup',
    DEFAULT_PROPERTY: 'value',

    create: function ( element, opt_event, opt_property ) {
	return {
	    __proto__: this,
	    element:   element,
	    event:     opt_event    || this.DEFAULT_EVENT,
	    property:  opt_property || this.DEFAULT_PROPERTY };
    },

    setElement: function ( element ) {
	this.element = element;
    },

    getValue: function() {
	return this.element[this.property];
    },

    setValue: function(value) {
	this.element[this.property] = value;
    },

    // TODO: support multiple listeners
    addListener: function(listener) {
	this.element[this.event] = listener;
    },

    removeListener: function(listener) {
	try {
	   this.element[this.event] = null;
	} catch (x) {
	   // could be that the element has been removed
	}
    },

    toString: function() {
	return "DomModel(" + this.event + ", " + this.property + ")";
    }

}


var AbstractView =
{
   __proto__: AbstractPrototype,

    init: function() {
       AbstractPrototype.init.call(this);

       this.children = [];
       this.model    = new SimpleModel("");
    },

    addChild: function(child) {
       child.parent = this;
       this.children.push(child);

       return this;
    },

    removeChild: function(child) {
       this.children.remove(child);

       return this;
    },

    addChildren: function() {
       Array.prototype.forEach.call(arguments, this.addChild.bind(this));
       return this;
    },

    nextID: function() {
	var id = 0;

	return function() {
	    return "view" + (id++);
	};
    }(),

    getID: function() {
	if ( ! this.eid_ ) this.eid_ = this.nextID();

	return this.eid_;
    },

    element: function() {
	return document.getElementById(this.getID());
    },

    registerCallback: function(event, listener, opt_elementId) {
	opt_elementId = opt_elementId || this.nextID();

//	if ( ! this.hasOwnProperty('callbacks_') ) this.callbacks_ = [];
	if ( ! this.callbacks_ ) this.callbacks_ = [];

	this.callbacks_.push([opt_elementId, event, listener]);

	return opt_elementId;
    },

    write: function(document) {
       document.writeln(this.toHTML());
       this.initHTML();
    },

    initHTML: function() {
       if ( this.callbacks_ ) {
	  // hookup event listeners
	  for ( var i = 0 ; i < this.callbacks_.length ; i++ ) {
	     var callback  = this.callbacks_[i];
	     var elementId = callback[0];
	     var event     = callback[1];
	     var listener  = callback[2];
	     var e         = document.getElementById(elementId);
	     e[event]      = listener.bind(this);
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


var CanvasModel = ModelModel.create({

   extendsPrototype: 'AbstractView',

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
      init: function() {
	 this.__super__.init.call(this);

	 this.repaint = EventService.merged(function() {
	   this.paint();
	 }.bind(this), 16);
      },

      toHTML: function() {
	 return '<canvas id="' + this.getID() + '" width="' + this.width + '" height="' + this.height + '"> </canvas>';
      },

      initHTML: function() {
	 this.canvas = this.element().getContext('2d');
      },

      addChild: function(child) {
	 AbstractView.addChild.call(this, child);

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
            this.canvas.restore()
	 }
      },

      paint: function() {
	 this.erase();
         this.paintChildren();
      }

   }
});


var CanvasView = CanvasModel.getPrototype();

var circleModel = ModelModel.create({

   name:  'Circle',
   label: 'Circle',

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


var ImageModel = ModelModel.create({

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
        this.__super__.init.call(this);

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


var RectModel = ModelModel.create({

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


var LabelModel = ModelModel.create({

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


var BoxModel = ModelModel.create({

   extendsModel: 'LabelModel',

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


var TextFieldView = {
   __proto__: ModelProto,

   extendsPrototype: 'AbstractView',

   name:  'TextField',
   label: 'Text Field',

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
      }
   ],

   methods: {
    toHTML: function() {
	return ( this.mode === 'read-write' ) ?
	  '<input id="' + this.getID() + '" type="text" name="' + this.name + '" size=' + this.displayWidth + '/>' :
	  '<span id="' + this.getID() + '" name="' + this.name + '"></span>' ;
    },

    getModel: function() {
        return this.model;
    },

    setModel: function(model) {
       if ( this.mode === 'read-write' ) {
	Events.unlink(this.domModel, this.model);
	this.model = model;
	Events.link(this.model, this.domModel);
       } else {
	  this.model = model;
	  this.model.addListener(function() {
	     this.element().innerHTML = this.model.getValue();
	  }.bind(this));
       }
    },

    initHTML: function() {
       var e = this.element();

       this.domModel = DomModel.create(e);

       this.setModel(this.model);
//       Events.link(this.model, this.domModel);
    },

    destroy: function() {
       Events.unlink(this.domModel, this.model);
    }
   }
};


var ChoiceView = {
   __proto__: ModelProto,

/*
 * <select size="">
 *    <choice></choice>
 * </select>
 *
 *
 */
   extendsPrototype: 'AbstractView',

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
	 name:  'size',
	 label: 'Size',
         type:  'int',
	 defaultValue: 1
      },
      {
	 name:  'choices',
	 label: 'Choices',
         type:  'Array[StringField]',
	 defaultValue: []
      }
   ],

   methods: {
    toHTML: function() {
       var str = "";

       str += '<select id="' + this.getID() + '" name="' + this.name + '" size=' + this.size + '/>';
       for ( var i = 0 ; i < this.choices.length ; i++ ) {
	  str += "\t<option>" + this.choices[i].toString() + "</option>";
       }
       str += '</select>';

       return str;
    },

    getModel: function() {
        return this.model;
    },

    setModel: function(model) {
	Events.unlink(this.domModel, this.model);
	this.model = model;
	Events.link(this.model, this.domModel);
    },

    initHTML: function() {
	var e = this.element();

	this.domModel = DomModel.create(e);

	Events.link(this.model, this.domModel);
    },

    destroy: function() {
	Events.unlink(this.domModel, this.model);
    }
   }
};


var BooleanView = {
   __proto__: ModelProto,

   extendsPrototype: 'AbstractView',

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

	this.domModel = DomModel.create(e, 'onchange', 'checked');

	Events.link(this.model, this.domModel);
    },

    getModel: function() {
        return this.model;
    },

    setModel: function(model) {
	Events.unlink(this.domModel, this.model);
	this.model = model;
	Events.link(this.model, this.domModel);
    },

    destroy: function() {
	Events.unlink(this.domModel, this.model);
    }
   }
};


var TextAreaView = {
    __proto__: AbstractView,

    name: 'name',

    model: new SimpleModel(),

    init: function(args) {
       AbstractView.init.call(this, args);

       this.cols = (args && args.displayWidth)  || 70;
       this.rows = (args && args.displayHeight) || 10;
    },

    toHTML: function() {
	return '<textarea id="' + this.getID() + '" rows=' + this.rows + ' cols=' + this.cols + ' /> </textarea>';
    },

    setModel: function(model) {
	Events.unlink(this.domModel, this.model);
	this.model = model;

	//Events.follow(this.model, this.domModel);
      try {
	Events.link(this.model, this.domModel);

      } catch (x) {

      }
    },

    initHTML: function() {
       var e = this.element();

       this.domModel = DomModel.create(e, 'onchange', 'value');

       // Events.follow(this.model, this.domModel);
       Events.link(this.model, this.domModel);
    },

    destroy: function() {
       Events.unlink(this.domModel, this.model);
    }
}


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
       this.domModel = DomModel.create(this.element(), 'onkeyup', 'value');

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

    onChange: function() {
       console.log("onChange");
    },

    setError: function(err) {
       if ( err ) console.log("Javascript Error: ", err);

       this.errorView.getModel().setValue(err || "");
    },

    setModel: function(model) {
	Events.unlink(this.domModel, this.model);
	this.model = model;

        var setError = this.setError.bind(this);

	Events.relate(
	   this.model,
	   this.domModel,
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


var StringArrayView = {
   __proto__: ModelProto,

   extendsPrototype: 'AbstractView',

   name:  'StringArray',
   label: 'StringArray Field',

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
      }
   ],

   methods: {
    toHTML: function() {
	return ( this.mode === 'read-write' ) ?
	  '<input id="' + this.getID() + '" type="text" name="' + this.name + '" size=' + 75 /*this.displayWidth*/ + '/>' :
	  '<span id="' + this.getID() + '" name="' + this.name + '"></span>' ;
    },

    getModel: function() {
        return this.model;
    },

    setModel: function(model) {
//	Events.unlink(this.domModel, this.model);
	this.model = model;

	Events.relate(
	   this.model,
	   this.domModel,
	   function(f) {
	      return f ? f.toString() : "";
	   },
	   function(str) {
	      return str.replace(/\s/g,'').split(',');
           }
	);
    },

    initHTML: function() {
       var e = this.element();

       this.domModel = DomModel.create(e);

       this.setModel(this.model);
//       Events.link(this.model, this.domModel);
    },

    destroy: function() {
       Events.unlink(this.domModel, this.model);
    }
   }
};


var HTMLView =
{

    __proto__: TextAreaView,

    cols: 120,
    rows: 20,

    initHTML: function() {
       TextAreaView.initHTML.call(this);

       editAreaLoader.init({
         id : this.getID(),
         syntax: "html",
         allow_toggle: false,
	 start_highlight: true
       });
    }

};


var JSView =
{

    __proto__: TextAreaView,

    cols: 120,
    rows: 80,

    init: function(args) {
       TextAreaView.init.call(this, args);

       this.cols = (args && args.displayWidth)  || 120;
       this.rows = (args && args.displayHeight) || 35;

       this.setValue = function(obj) {
	  this.model.setValue(obj);
       };
    },

    initHTML: function() {
       var e = this.element();

       this.domModel = DomModel.create(e, 'onchange', 'value');

       var me = this;

       this.model.addListener(function(src, oldValue, newValue) {
	  me.domModel.setValue(JSONUtil.stringify(me.model.getValue()));
       });
       this.domModel.addListener(function() {
          try
          {
//	     me.model.setValue(JSONUtil.parse(me.domModel.getValue()
	     me.model.getValue().copyFrom(JSONUtil.parse(me.domModel.getValue()));
	  }
	  catch (x)
	  {
	     console.log("error");
	     // not valid JS syntax

	     // return this.__proto__.getValue.call(this);
	  }
       });

       this.domModel.setValue(JSONUtil.stringify(this.model.getValue()));

    }

       /*,

   setValue: function (obj) {
      this.model.setValue(JSONUtil.stringify(obj));
   },
   getValue: function () {
console.log("parseValue:",this.model.getValue());
      return JSONUtil.parse(this.model.getValue());
   }
	*/
};


var XMLView =
{

    __proto__: TextAreaView,

    cols: 100,
    rows: 50,

    init: function(args) {
       TextAreaView.init.call(this, args);

       this.cols = (args && args.displayWidth)  || 100;
       this.rows = (args && args.displayHeight) || 30;
    },

   setValue: function (obj) {
      this.model.setValue(XMLUtil.stringify(obj));
   },

   getValue: function () {
      return this.value;
   }
};



var DetailView =
{

   __proto__: AbstractView,

   create: function(model, dataModel) {
      var obj = AbstractView.create.call(this);

      obj.model = model;
      // TODO: this remembers the wrong 'this' when decorated with
      // ActionBorder
      obj.setDataModel(dataModel || new SimpleModel());

      return obj;
   },

   getDataModel: function() {
      return this.dataModel;
   },

   setDataModel: function (model) {
      if ( this.getDataModel() ) {
	 // todo:
	 /// getDataModel().removeListener(???)
      }
      this.dataModel = model;
      this.updateSubViews();
      // TODO: model this class and make updateSubViews a listener
      // instead of bind()'ing
      model.addListener(this.updateSubViews.bind(this));
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

//	 if ( prop.hidden ) continue;

	 var view = this.createView(prop);

	 try {
	    view.setModel(this.getValue().propertyModel[prop.name]);
   	 } catch (x) { }
	 view.prop = prop;
	 view.toString = function () { return this.prop.name + "View"; }
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

   setValue: function(obj) {
      this.getDataModel().setValue(obj);
   },

   getValue: function() {
      return this.getDataModel().getValue();
   },

   updateSubViews: function() {
      var obj = this.getValue();

      if ( obj === "" ) return;

      for ( var i = 0 ; i < this.children.length ; i++ ) {
	 var child = this.children[i];
	 var prop  = this.model.properties[i];

	 try {
	    // todo: fix
            if ( prop && ! prop.hidden )
	       child.setModel(obj.propertyModel(prop.name));
	 }
	 catch (x) {
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

   create: function(unusedModel, dataModel) {
      var obj = AbstractView.create.call(this);

      obj.model = null;
      obj.setDataModel(dataModel || new SimpleModel());

      return obj;
   },

   getDataModel: function() {
      return this.dataModel;
   },

   setDataModel: function (model) {
      if ( this.getDataModel() ) {
	 // todo:
	 /// getDataModel().removeListener(???)
      }

      this.dataModel = model;

      this.updateSubViews();
      model.addListener(this.updateSubViews.bind(this));
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
	    view.setModel(this.getValue().propertyModel[prop.name]);
   	 } catch (x) {
	 }

	 view.prop = prop;
	 view.toString = function () { return this.prop.name + "View"; }
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

      if ( this.getValue() )
      {
	 this.updateHTML();

	 // hooks sub-views upto sub-models
	 this.updateSubViews();
      }
   },

   setValue: function(obj) {
      this.getDataModel().setValue(obj);
   },

   getValue: function() {
       return this.getDataModel().getValue();
   },

   updateSubViews: function() {
      // check if the DataModel's model has changed
      if ( this.getValue().model_ != this.model ) {
	 this.model = this.getValue().model_;
	 this.updateHTML();
      }

      var obj = this.getValue();

      for ( var i = 0 ; i < this.children.length ; i++ ) {
	 var child = this.children[i];
	 var prop  = this.model.properties[i];

	 try {
	    // todo: fix
            if ( prop && ! prop.hidden ) {
//	       console.log("updateSubView: " + child + " " + prop.name);
//	       console.log(obj.propertyModel(prop.name).getValue());
	       child.setModel(obj.propertyModel(prop.name));
	    }
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

   create: function(dataModel) {
      var obj = AbstractView.create.call(this);

      obj.model     = dataModel.getValue().model_;
      obj.dataModel = dataModel;

      return obj;
   },

   getDataModel: function() {
      return this.dataModel;
   },

   toHTML: function() {
      this.children = [];
      var model = this.model;
      var obj   = this.getValue();
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
	    out.push('<td class="value"><pre>');
	    out.push(value);
	    out.push('</pre></td></tr>');
	 }
      }

      out.push('</table>');
      out.push('</div>');

      return out.join('');
   },

   getValue: function() {
       return this.getDataModel().getValue();
   }

};


/** A display-only on-line help view. **/
var HelpView =
{

   __proto__: AbstractView,

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
   },

   getValue: function() {
       return this.getDataModel().getValue();
   }

};


var TableView =
{

    __proto__: AbstractView,

    DOUBLE_CLICK: "double-click", // event topic

    create: function(model) {
	var obj = {
	    __proto__:      this,
	    model:          model,
	    properties:     model.tableProperties,
	    selectionModel: new SimpleModel(),
	    children:       [],
	    instance_:      {} // todo: fix
	};

	return obj;
    },

    toHTML: function() {
	var str = "";

        str += '<span id="' + this.getID() + '">';
        str += this.tableToHTML();
        str += '</span>';

	return str;
    },

    tableToHTML: function() {
	var model = this.model;

	var str = [];
	var props = [];

        str.push('<table class="chaosTable ' + model.name + 'Table">');

	//str += '<!--<caption>' + model.plural + '</caption>';
        str.push('<thead><tr>');
	for ( var i = 0 ; i < this.properties.length ; i++ )
	{
	    var key  = this.properties[i];
	    var prop = model.getProperty(key);

	    if ( ! prop ) continue;

	   // if ( prop.hidden ) continue;

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

    setModel: function(obj) {
       this.objs = obj.getValue();
       if ( ! this.element() ) return this;
       this.element().innerHTML = this.tableToHTML();
       this.initHTML();
       return this;
    },

    initHTML: function() {
	var es = document.getElementsByClassName('tr-' + this.getID());

	for ( var i = 0 ; i < es.length ; i++ ) {
	    var e = es[i];

	    e.onmouseover = function(model, obj) { return function() {
               model.prevValue = model.getValue();
	       model.setValue(obj);
	    }; }(this.selectionModel, this.objs[i]);
	    e.onmouseout = function(model, obj) { return function() {
	       if ( ! model.prevValue ) return;
               model.setValue(model.prevValue);
               delete model['prevValue'];
	    }; }(this.selectionModel, this.objs[i]);
	    e.onclick = function(model, obj) { return function(evt) {
	       model.setValue(obj);
               delete model['prevValue'];
               var siblings = evt.srcElement.parentNode.parentNode.childNodes;
	       for ( var i = 0 ; i < siblings.length ; i++ ) {
                  siblings[i].className = "";
	       }
               evt.srcElement.parentNode.className = 'rowSelected';
	    }; }(this.selectionModel, this.objs[i]);
	    e.ondblclick = function(me, model, obj) { return function(evt) {
               me.publish(me.DOUBLE_CLICK, obj, model);
	    }; }(this, this.selectionModel, this.objs[i]);
	}
    },


    destroy: function() {
    }

};


var ActionButton =
{
   __proto__: AbstractView,

   create: function(action, subjectModel) {
      var obj = {
	 __proto__:    this,
	 action:       action,
	 subjectModel: subjectModel,
	 instance_:    {} // todo: fix
      };

      subjectModel.addListener(this.subjectUpdate.bind(this));

      return obj;
   },

   subjectUpdate: function() {
      // console.log('subject update: ' + this.subjectModel);
   },

   toHTML: function() {
      this.eid_ = this.registerCallback(
	 'onclick',
	 function(action) { return function() {
console.log("action: ", action);
	    action.action.apply(this.subjectModel.getValue());
         };}(this.action));

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

		str += '<table><tr><td>';

		str += this.__proto__.toHTML.apply(this);

		str += '</td></tr><tr><td align=right>';

		for ( var i = 0 ; i < this.actions.length ; i++ )
		{
		   var action = this.actions[i];
		   var button = ActionButton.create(action, this.getDataModel());
		   str += " " + button.toHTML() + " ";

		   this.addChild(button);
		}

		str += '</td></tr></table>';

		return str;
	    }
	};

        // if delegate doesn't have a getDataModel method, then add one
try
{
obj.getDataModel().setValue(obj);
//        obj.setDataModel(obj.getDataModel());
}
catch (x)
{

}
// todo: this is breaking timer
        if ( ! obj.getDataModel )
        {
	   var dm = new SimpleModel(obj);
	   obj.getDataModel = function() {
	      return dm;
	   };
        }
	return obj;
    }
}


// TODO: implement
var TransformBorder = {
    create: function(delegate) {
	return {
	    __proto__: delegate,
	    paint: function() {
		this.__proto__.toHTML.paint(this);
	    }
	};
    }
}


var FloatFieldView = {
    __proto__: TextFieldView,

    onChange: function (evt) {
	this.model.setValue(parseFloat(evt.srcElement.value));
    }

}


var IntFieldView = {
    __proto__: TextFieldView,

    onChange: function (evt) {
	this.model.setValue(parseInt(evt.srcElement.value));
    }

}


var ProgressView = {
    __proto__: AbstractView,

    toHTML: function() {
	return '<progress value="25" id="' + this.getID() + '" max="100" >25</progress>';
    },

    setModel: function(model) {
	this.model.removeListener(this.modelListener_);

	this.model = model;

	this.model.addListener(this.modelListener_);
    },

    updateValue: function() {
	var e = this.element();

	e.value = parseInt(this.model.getValue());
    },

    initHTML: function() {
	var e = this.element();

	this.modelListener_ = this.updateValue.bind(this);

	this.model.addListener(this.modelListener_);
    },

    destroy: function() {
	this.model.removeListener(this.modelListener_);
    }
}



var ProgressCView = {

    __proto__: AbstractView,

    model: new SimpleModel("0"),

    paint: function() {
	this.canvas.fillStyle = '#fff';
	this.canvas.fillRect(0, 0, 104, 20);

	this.canvas.strokeStyle = '#000';
	this.canvas.strokeRect(0, 0, 104, 20);
	this.canvas.fillStyle = '#f00';
	this.canvas.fillRect(2, 2, parseInt(this.model.getValue()), 16);
    },

    setModel: function(model) {
	this.model.removeListener(this.modelListener_);

	this.model = model;

	this.model.addListener(this.modelListener_);
    },

    updateValue: function() {
	this.paint();
    },

    setCanvas: function(canvas) {
	this.canvas = canvas;

	this.modelListener_ = this.updateValue.bind(this);

	this.model.addListener(this.modelListener_);

	this.paint();
    },

    destroy: function() {
	this.model.removeListener(this.modelListener_);
    }
}


var ArrayView = {
   create: function(prop) {
      var view = DAOControllerView.create(GLOBAL[prop.subType]);
      return view;
   }
}