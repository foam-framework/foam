/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
function KeyboardShortcutController(win, view) {
  this.contexts_ = {};
  this.body_ = {};

  this.processView_(view);

  win.addEventListener('keydown', this.processKey_.bind(this));
}

KeyboardShortcutController.prototype.processView_ = function(view) {
  var keyShortcuts = view.shortcuts;
  if (keyShortcuts) {
    keyShortcuts.forEach(function(nav) {
      var key = nav[0];
      var cb = nav[1];
      var context = nav[2];
      this.addAccelerator(key, cb, context);
    }.bind(this));
  }

  try {
    var children = view.children;
    children.forEach(this.processView_.bind(this));
  } catch(e) { console.log(e); }
};

KeyboardShortcutController.prototype.addAccelerator = function(key, callback, context) {
  if (context) {
    if (typeof(context) != 'string')
      throw "Context must be an identifier for a DOM node.";
    if (!(context in this.contexts_))
      this.contexts_[context] = {};

    this.contexts_[context][key] = callback;
  } else {
    this.body_[key] = callback;
  }
};

KeyboardShortcutController.prototype.shouldIgnoreKeyEventsForTarget_ = function(event) {
  var target = event.target;
  return target.isContentEditable || target.tagName == 'INPUT' || target.tagName == 'TEXTAREA';
};

KeyboardShortcutController.prototype.processKey_ = function(event) {
  if (this.shouldIgnoreKeyEventsForTarget_(event))
    return;

  for ( var node = event.target; node && node != document.body; node = node.parentNode ) {
    var id = node.id;
    if ( id && (id in this.contexts_) ) {
      var cbs =  this.contexts_[id];
      if ( event.keyIdentifier in cbs ) {
        var cb = cbs[event.keyIdentifier];
        cb(event);
        event.preventDefault();
        return;
      }
    }
  }
  console.log('Looking for ' + event.keyIdentifier);
  if ( event.keyIdentifier in this.body_ ) {
    var cb = this.body_[event.keyIdentifier];
    cb(event);
    event.preventDefault();
  }
};


var DOM = {
  /** Instantiate FOAM Objects in a document. **/
  init: function(X) {
    if ( ! X.document.FOAM_OBJECTS ) X.document.FOAM_OBJECTS = {};

    var fs = X.document.querySelectorAll('foam');
    for ( var i = 0 ; i < fs.length ; i++ ) {
      this.initElement(fs[i], X.document);
    }
  },

  initElementChildren: function(e) {
    var a = [];

    for ( var i = 0 ; i < e.children.length ; i++ ) {
      var c = e.children[i];

      if ( c.tagName === 'FOAM' ) {
        a.push(DOM.initElement(c));
      }
    }

    return a;
  },

  // TODO: Supply X and set on created children
  /** opt_document -- if supplied the object's view will be added to the document. **/
  initElement: function(e, opt_document) {
    // If was a sub-object for an object that has already been displayed,
    // then it will no longer be in the DOM and doesn't need to be shown.
    if ( opt_document && ! opt_document.contains(e) ) return;

    var model = GLOBAL[e.getAttribute('model')];
    var args = {};

    for ( var i = 0 ; i < e.attributes.length ; i++ ) {
      var a   = e.attributes[i];
      var key = a.name;
      var val = a.textContent;
      var p   = model.getProperty(key);

      if ( p ) {
        if ( val.startsWith('#') ) {
          val = val.substring(1);
          val = $(val);
        }
        args[key] = val;
      } else {
        console.log('unknown attribute: ', key);
      }
    }

    function findProperty(name) {
      for ( var j = 0 ; j < model.properties.length ; j++ ) {
        var p = model.properties[j];

        if ( p.name.toUpperCase() == name ) return p;
      }

      return null;
    }

    for ( var i = 0 ; i < e.children.length ; i++ ) {
      var c = e.children[i];
      var key = c.nodeName;
      var p = findProperty(key);

      if ( p ) {
        console.log('setting ', p.name);
        args[p.name] = p.fromElement(c);
      } else {
        console.log('unknown element: ', key);
      }
    }

    var obj = model.create(args);

    var onLoad = e.getAttribute('oninit');
    if ( onLoad ) {
      Function(onLoad).bind(obj)();
    }

    if ( opt_document ) {
      var view;
      if ( AbstractView.isInstance(obj) || CView.isInstance(obj) ) {
        view = obj;
      } else {
        var viewName = e.getAttribute('view');
        var viewModel = viewName ? GLOBAL[viewName] : DetailView;
        view = viewModel.create({model: model, value: SimpleValue.create(obj)});
        if ( ! viewName ) view = ActionBorder.create(model, view);
      }

      if ( e.id ) opt_document.FOAM_OBJECTS[e.id] = obj;
      obj.view_ = view;
      e.outerHTML = view.toHTML();
      view.initHTML();
    }

    return obj;
  },

  setClass: function(e, className, opt_enabled) {
    var oldClassName = e.className || '';
    var enabled = opt_enabled === undefined ? true : opt_enabled;
    e.className = oldClassName.replace(' ' + className, '').replace(className, '');
    if ( enabled ) e.className = e.className + ' ' + className;
  }
};


// TODO: document and make non-global
/** Convert a style size to an Integer.  Ex. '10px' to 10. **/
function toNum(p) { return p.replace ? parseInt(p.replace('px','')) : p; };


// ??? Should this have a 'value'?
// Or maybe a ValueView and ModelView
FOAModel({
  name: 'AbstractView',
  label: 'AbstractView',

  properties: [
    {
      name:  'elementId',
      label: 'Element ID',
      type:  'String'
    },
    {
      name:  'parent',
      type:  'View',
      hidden: true
    },
    {
      name:  'children',
      type:  'Array[View]',
      valueFactory: function() { return []; }
    },
    {
      name:   'shortcuts',
      type:   'Array[Shortcut]',
      valueFactory: function() { return []; }
    },
    {
      name:   '$',
      mode:   "read-only",
      getter: function() { return this.elementId && $(this.elementId); },
      help:   'DOM Element.'
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'cssClasses',
      valueFactory: function() { return []; }
    }
  ],

  methods: {
    strToHTML: function(str) {
      return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    /** Bind a sub-View to a sub-Value. **/
    bindSubView: function(view, prop) {
      view.setValue(this.propertyValue(prop.name));
    },

    viewModel: function() { return this.model_; },

    /** Create the sub-view from property info. **/
    createView: function(prop, opt_args) {
      var view;

      if ( ! prop.view ) {
        view = TextFieldView.create(prop);
      } else if ( typeof prop.view === 'string' ) {
        view = GLOBAL[prop.view].create(prop);
      } else if ( prop.view.model_ ) {
        view = prop.view.deepClone().copyFrom(prop);
      } else if ( typeof prop.view === 'function' ) {
        view = prop.view(prop);
      } else {
        view = prop.view.create(prop);
      }

      view.copyFrom(opt_args);

      this.bindSubView(view, prop);

      view.prop = prop;
      view.toString = function () { return this.prop.name + "View"; };
      this.addChild(view);

      this[prop.name + 'View'] = view;

      return view;
    },

    focus: function() { if ( this.$ && this.$.focus ) this.$.focus(); },

    addChild: function(child) {
      // Check prevents duplicate addChild() calls,
      // which can happen when you use creatView() to create a sub-view (and it calls addChild)
      // and then you write the View using TemplateOutput (which also calls addChild).
      // That should all be cleaned up and all outputHTML() methods should use TemplateOutput.
      if ( child.parent ) return;

      try {
        child.parent = this;
      } catch (x) { console.log(x); }

      var children = this.children;
      children.push(child);
      this.children = children;

      return this;
    },

    removeChild: function(child) {
      this.children.deleteI(child);
      child.parent = undefined;

      return this;
    },

    addChildren: function() {
      Array.prototype.forEach.call(arguments, this.addChild.bind(this));

      return this;
    },

    addShortcut: function(key, callback, context) {
      this.shortcuts.push([key, callback, context]);
    },

    // TODO: make use new static_ scope when available
    nextID: function() {
      return "view" + (arguments.callee._nextId = (arguments.callee._nextId || 0) + 1);
    },

    getID: function() {
      // @return this View's unique DOM element-id
      // console.log('getID', this.elementId);
      if ( this.elementId ) return this.elementId;
      return this.elementId || ( this.elementId = this.nextID() );
    },

    addInitializer: function(f) {
      (this.initializers_ || (this.initializers_ = [])).push(f);
    },

    on: function(event, listener, opt_elementId) {
      opt_elementId = opt_elementId || this.nextID();
      listener = listener.bind(this);

      this.addInitializer(function() {
        var e = $(opt_elementId);
        if ( ! e ) {
          console.log('Error Missing element for id: ' + opt_elementId + ' on event ' + event);
        } else {
          e.addEventListener(event, listener.bind(this), false);
        }
      });

      return opt_elementId;
    },

    setClass: function(className, predicate, opt_elementId) {
      opt_elementId = opt_elementId || this.nextID();
      predicate = predicate.bind(this);

      this.addInitializer(function() {
        Events.dynamic(predicate, function() {
          var e = $(opt_elementId);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          DOM.setClass(e, className, predicate());
        });
      });

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

    updateHTML: function() {
      if ( ! this.$ ) return;

      this.$.innerHTML = this.toInnerHTML();
      this.initInnerHTML();
    },

    toInnerHTML: function() { return ''; },

    toHTML: function() {
      return '<' + this.tagName + ' id="' + this.getID() + '" class="' + this.cssClasses.join(' ') + '">' +
        this.toInnerHTML() +
        '</' + this.tagName + '>';
    },

    initHTML: function() {
      this.initInnerHTML();
    },

    initInnerHTML: function() {
      // Initialize this View and all of it's children.
      // This mostly involves attaching listeners.
      // Must be called activate a view after it has been added to the DOM.

      this.invokeInitializers();
      this.initChildren();
    },

    initChildren: function() {
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
    },

    invokeInitializers: function() {
      if ( ! this.initializers_ ) return;

      for ( var i = 0 ; i < this.initializers_.length ; i++ ) this.initializers_[i]();

      this.initializers_ = undefined;
    },

    destroy: function() {
      // TODO: remove listeners
    },

    close: function() {
      this.$ && this.$.remove();
      this.destroy();
      this.publish('closed');
    }
  }
});


FOAModel({
  name: 'PopupView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'view',
      type:  'View',
    },
    {
      name:  'x'
    },
    {
      name:  'y'
    },
    {
      name:  'width',
      defaultValue: undefined
    },
    {
      name:  'height',
      defaultValue: undefined
    }
  ],

  methods: {
    open: function(e, opt_delay) {
      var document = (e.$ || e).ownerDocument;
      var div      = document.createElement('div');
      div.style.left = this.x + 'px';
      div.style.top = this.y + 'px';
      if ( this.width ) div.style.width = this.width + 'px';
      if ( this.height ) div.style.height = this.height + 'px';
      div.style.position = 'absolute';
      div.id = this.getID();
      div.innerHTML = this.view.toHTML();

      document.body.appendChild(div);
      this.view.initHTML();
    }
  }
});


FOAModel({
  name: 'StaticHTML',
  extendsModel: 'AbstractView',
  properties: [
    {
      model_: 'StringProperty',
      name: 'content'
    },
    {
      model_: 'BooleanProperty',
      name: 'escapeHTML',
      defaultValue: false
    }
  ],

  methods: {
    toHTML: function() {
      if ( this.escapeHTML ) {
        return this.strToHTML(this.content);
      }
      return this.content;
    }
  }
});


FOAModel({
  name: 'MenuSeparator',
  extendsModel: 'StaticHTML',
  properties: [
    {
      name: 'content',
      defaultValue: '<hr class="menuSeparator">'
    }
  ]
});


// TODO: Model
var DomValue = {
  DEFAULT_EVENT:    'change',
  DEFAULT_PROPERTY: 'value',

  create: function(element, opt_event, opt_property) {
    if ( ! element ) {
      throw "Missing Element in DomValue";
    }

    return {
      __proto__: this,
      element:   element,
      event:     opt_event    || this.DEFAULT_EVENT,
      property:  opt_property || this.DEFAULT_PROPERTY };
  },

  setElement: function ( element ) { this.element = element; },

  get: function() { return this.element[this.property]; },

  set: function(value) {
    if ( this.element[this.property] != value )
      this.element[this.property] = value;
  },

  addListener: function(listener) {
    if ( ! this.event ) return;
    try {
      this.element.addEventListener(this.event, listener, false);
    } catch (x) {
    }
  },

  removeListener: function(listener) {
    if ( ! this.event ) return;
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


FOAModel({
  name: 'ImageView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && Events.unfollow(oldValue, this.domValue);
        Events.follow(newValue, this.domValue);
      }
    },
    {
      name: 'domValue',
      postSet: function(oldValue, newValue) {
        oldValue && Events.unfollow(this.value, oldValue);
        Events.follow(this.value, newValue);
      }
    },
    {
      name: 'displayWidth',
      postSet: function(_, newValue) {
        if ( this.$ ) {
          this.$.style.width = newValue;
        }
      }
    },
    {
      name: 'displayHeight',
      postSet: function(_, newValue) {
        if ( this.$ ) {
          this.$.style.height = newValue;
        }
      }
    }
  ],

  methods: {
    setValue: function(value) {
      this.value = value;
    },
    toHTML: function() {
      return '<img class="imageView" id="' + this.getID() + '">';
    },
    isSupportedUrl: function(url) {
      url = url.trim().toLowerCase();
      return url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('filesystem:');
    },
    initHTML: function() {
      this.SUPER();

      if ( chrome.app.runtime && ! this.isSupportedUrl(this.value.get()) ) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", this.value.get());
        xhr.responseType = 'blob';
        xhr.asend(function(blob) {
          if ( blob ) {
            self.$.src = URL.createObjectURL(blob);
          }
        });
      } else {
        this.domValue = DomValue.create(this.$, undefined, 'src');
        this.displayHeight = this.displayHeight;
        this.displayWidth = this.displayWidth;
      }
    }
  }
});


FOAModel({
  name: 'BlobImageView',

  extendsModel: 'AbstractView',

  help: 'Image view for rendering a blob as an image.',

  properties: [
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.onValueChange);
        newValue.addListener(this.onValueChange);
      }
    },
    {
      model_: 'IntegerProperty',
      name: 'displayWidth'
    },
    {
      model_: 'IntegerProperty',
      name: 'displayHeight'
    }
  ],

  methods: {
    setValue: function(value) {
      this.value = value;
    },

    toHTML: function() {
      return '<img id="' + this.getID() + '">';
    },

    initHTML: function() {
      this.SUPER();
      var self = this;
      this.$.style.width = self.displayWidth;
      this.$.style.height = self.displayHeight;
      this.onValueChange();
    }
  },

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        if ( ! this.value.get() ) return;
        if ( this.$ )
          this.$.src = URL.createObjectURL(this.value.get());
      }
    }
  ]
});


// TODO: document the difference between softValue and value
FOAModel({
  name:  'TextFieldView',
  label: 'Text Field',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'name',
      type:  'String',
      defaultValue: 'field'
    },
    {
      name:  'className',
      type:  'String',
      defaultValue: 'field'
    },
    {
      name:  'displayWidth',
      type:  'int',
      defaultValue: 30
    },
    {
      model_: 'StringProperty',
      name:  'type',
      defaultValue: 'text'
    },
    {
      model_: 'StringProperty',
      name:  'placeholder',
      defaultValue: undefined
    },
    {
      model_: 'BooleanProperty',
      name:  'onKeyMode',
      help: 'If true, value is updated on each keystroke.'
    },
    {
      model_: 'BooleanProperty',
      name:  'escapeHTML',
      // defaultValue: true,
      // TODO: make the default 'true' for security reasons
      help: 'If true, HTML content is excaped in display mode.'
    },
    {
      name:  'mode',
      type:  'String',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); } }
    },
    {
      name: 'softValue',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        if ( this.mode === 'read-write' ) {
          Events.unlink(oldValue, this.domValue);
          Events.relate(newValue, this.domValue, this.valueToText, this.textToValue);
        } else {
          Events.unfollow(oldValue, this.domValue);
          Events.map(newValue, this.domValue, this.valueToText);
        }
      }
    },
    {
      name: 'domValue'
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        if ( this.onKeyMode ) {
          Events.unlink(oldValue, this.softValue);
          Events.link(newValue, this.softValue);
        } else {
          Events.unfollow(oldValue, this.softValue);
          Events.follow(newValue, this.softValue);
        }
      }
    },
    {
      model_: 'StringProperty',
      name: 'readWriteTagName',
      defaultValueFn: function() { return 'input'; }
    },
    {
      model_: 'StringProperty',
      name: 'readOnlyTagName',
      defaultValueFn: function() { return 'span'; }
    }
  ],

  methods: {
    toHTML: function() {
      var className = this.className ? ' class="' + this.className + '"' : '';

      if ( this.mode === 'read-write' ) {
        this.on('change', this.onChange, this.getID());

        return '<' + this.readWriteTagName + ' id="' + this.getID() + '" type="' + this.type + '"' + className + ' name="' + this.name + '" size="' + this.displayWidth + '"/>';
      }

      return '<' + this.readOnlyTagName + ' id="' + this.getID() + '"' + className + ' name="' + this.name + '"></' + this.readOnlyTagName + '>';
    },

    // TODO: deprecate
    getValue: function() { return this.value; },

    // TODO: deprecate
    setValue: function(value) {
      this.value = value;
    },

    initHTML: function() {
      this.SUPER();

      if ( this.placeholder ) this.$.placeholder = this.placeholder;

      if ( this.mode === 'read-write' ) {
        this.domValue = DomValue.create(this.$, 'input');
      } else {
        //        this.domValue = DomValue.create(this.$, 'undefined', 'textContent');
        this.domValue = DomValue.create(this.$, 'undefined', this.escapeHTML ? 'textContent' : 'innerHTML');
      }

      this.setValue(this.value);
      this.softValue = this.softValue;
    },

    //    textToValue: Events.identity,

    //    valueToText: Events.identity,

    textToValue: function(text) { return text;},

    valueToText: function(value) { return value;},

    destroy: function() { Events.unlink(this.domValue, this.value); }
  },

  listeners: [
    {
      name: 'onChange',
      code: function(e) {
        this.value.set(this.softValue.get());
      }
    }
  ]
});


FOAModel({
  name:  'DateFieldView',
  label: 'Date Field',

  extendsModel: 'TextFieldView',

  properties: [
    {
      model_: 'StringProperty',
      name:  'type',
      defaultValue: 'date'
    }
  ],

  methods: {
    initHTML: function() {
      var e = this.$;

      this.domValue = DomValue.create(e, undefined, 'valueAsDate');

      this.setValue(this.value);
    }
  }
});


FOAModel({
  name:  'DateTimeFieldView',
  label: 'Date-Time Field',

  extendsModel: 'AbstractView',

  properties: [
    {
      model_: 'StringProperty',
      name: 'name'
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write'
    },
    {
      name: 'domValue',
      postSet: function(oldValue) {
        if ( oldValue && this.value ) {
          Events.unlink(oldValue, this.value);
        }
      }
    },
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create(new Date()); },
      postSet: function(oldValue, newValue) {
        if ( oldValue && this.domValue ) {
          Events.unlink(this.domValue, oldValue);
        }
        this.linkValues();
      }
    }
  ],

  methods: {
    linkValues: function() {
      if ( ! this.$ ) return;
      if ( ! this.value ) return;

      this.domValue = DomValue.create(this.$, undefined, 'valueAsNumber');

      Events.relate(this.value, this.domValue, this.valueToDom, this.domToValue);
    },

    valueToDom: function(value) { return value ? value.getTime() : 0; },
    domToValue: function(dom) { return new Date(dom); },
    setValue: function(value) { this.value = value; },

    toHTML: function() {
      // TODO: Switch type to just datetime when supported.
      return ( this.mode === 'read-write' ) ?
        '<input id="' + this.getID() + '" type="datetime-local" name="' + this.name + '"/>' :
        '<span id="' + this.getID() + '" name="' + this.name + '"></span>' ;
    },

    initHTML: function() {
      this.SUPER();
      this.linkValues();
    }
  }
});


FOAModel({
  name:  'RelativeDateTimeFieldView',
  label: 'Relative Date-Time Field',

  extendsModel: 'DateTimeFieldView',

  methods: {
    valueToText: function(value) {
      return value.toRelativeDateString();
    }
  }
});


FOAModel({
  name:  'HTMLView',
  label: 'HTML Field',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'name',
      type:  'String',
      defaultValue: ''
    },
    {
      model_: 'StringProperty',
      name:  'tag',
      defaultValue: 'span'
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        if ( this.mode === 'read-write' ) {
          Events.unlink(this.domValue, oldValue);
          Events.link(newValue, this.domValue);
        } else {
          Events.follow(newValue, this.domValue);
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      var s = '<' + this.tag + ' id="' + this.getID() + '"';
      if ( this.name ) s+= ' name="' + this.name + '"';
      s += '></' + this.tag + '>';
      return s;
    },

    // TODO: deprecate
    getValue: function() { return this.value; },

    // TODO: deprecate
    setValue: function(value) { this.value = value; },

    initHTML: function() {
      var e = this.$;

      if ( ! e ) {
        console.log('stale HTMLView');
        return;
      }
      this.domValue = DomValue.create(e,undefined,'innerHTML');
      this.setValue(this.value);
    },

    destroy: function() { Events.unlink(this.domValue, this.value); }
  }
});


FOAModel({
  name:  'AbstractChoiceView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'value',
      type:  'Value',
      help: "A Value of the current choice's value (ie. choice[0]).",
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name: 'choice',
      help: 'The current choice (ie. [value, label]).',
      getter: function() {
        var value = this.value.get();
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          var choice = this.choices[i];
          if ( value === choice[0] ) return choice;
        }
        return undefined;
      },
      setter: function(choice) {
        var oldValue = this.choice;
        this.value.set(choice[0]);
        this.propertyChange('choice', oldValue, this.choice);
      }
    },
    {
      name:  'choices',
      type:  'Array[StringField]',
      help: 'Array of [value, label] choices.  Simple String values will be upgraded to [value, value].',
      defaultValue: [],
      preSet: function(a) {
        a = a.clone();
        // Upgrade single values to [value, value]
        for ( var i = 0 ; i < a.length ; i++ ) if ( ! Array.isArray(a[i]) ) a[i] = [a[i], a[i]];
        return a;
      },
      postSet: function(_, newValue) {
        if ( ! this.value.get ) return;

        var value = this.value.get();

        // Update current choice when choices update
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var choice = newValue[i];

          if ( value === choice[0] ) {
            this.choice = choice;
            break;
          }
        }

        if ( i === newValue.length ) this.choice = newValue[0];

        if ( this.$ ) this.updateHTML();
      }
    }
  ],

  methods: {
    findChoiceIC: function(name) {
      name = name.toLowerCase();
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        if ( this.choices[i][1].toLowerCase() == name )
          return this.choices[i];
      }
    },
    getValue: function() {
      return this.value;
    },

    indexToValue: function(v) {
      var i = parseInt(v);
      if ( isNaN(i) ) return v;

      return this.choices[i][0];
    }
  }
});


FOAModel({
  name:  'ChoiceListView',

  extendsModel: 'AbstractChoiceView',

  properties: [
    {
      name: 'orientation',
      defaultValue: 'horizontal',
      view: {
        model_: 'ChoiceView',
        choices: [
          [ 'horizontal', 'Horizontal' ],
          [ 'vertical',   'Vertical'   ]
        ]
      }
    },
    {
      name: 'cssClass',
      type: 'String',
      defaultValue: 'foamChoiceListView'
    }
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.getID() + '" class="' + this.cssClass + ' ' + this.orientation + '"></div>';
    },

    updateHTML: function() {
      var out = "";

      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        this.on(
          'click',
          function(choice) { this.choice = choice; }.bind(this, choice),
          id);

        this.setClass(
          'selected',
          function(choice) { return this.choice == choice; }.bind(this, choice),
          id);

        out += '<div class="choice" id="' + id + '">' + choice[1] + '</div>';
      }

      this.$.innerHTML = out;
      this.invokeInitializers();
    },

    /*
    setValue: function(value) {
      // ???: Is this ever called?
      debugger;
    },
    */

    initHTML: function() {
      this.updateHTML();
    }
  }
});


FOAModel({
  name:  'ChoiceView',

  extendsModel: 'AbstractChoiceView',

  /*
   * <select size="">
   *    <choice value="" selected></choice>
   * </select>
   */
  properties: [
    {
      name:  'name',
      type:  'String',
      defaultValue: 'field'
    },
    {
      name:  'helpText',
      type:  'String',
      defaultValue: undefined
    },
    {
      name: 'cssClass',
      type: 'String',
      defaultValue: 'foamChoiceView'
    },
    {
      name:  'size',
      type:  'int',
      defaultValue: 1
    }
  ],

  methods: {
    toHTML: function() {
      return '<select id="' + this.getID() + '" name="' + this.name + '" size=' + this.size + '/></select>';
    },

    updateHTML: function() {
      var out = [];

      if ( this.helpText ) {
        out.push('<option disabled="disabled">');
        out.push(this.helpText);
        out.push('</option>');
      }

      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        try {
          this.on('click', this.onClick, id);
          this.on('mouseover', this.onMouseOver, id);
          this.on('mouseout', this.onMouseOut, id);
        } catch (x) {
          // Fails on iPad, which is okay, because this feature doesn't make
          // sense on the iPad anyway.
        }

        out.push('\t<option id="' + id + '"');

        if ( this.value && choice[0] === this.value.get() ) out.push(' selected');
        out.push(' value="');
        out.push(i + '">');
        out.push(choice[1].toString());
        out.push('</option>');
      }

      this.$.innerHTML = out.join('');
      AbstractView.getPrototype().initHTML.call(this);
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
            if ( c[0] === v ) return i;
          }
          return v;
        },
        function (v) { return self.indexToValue(v); }
      );
    },

    initHTML: function() {
      var e = this.$;

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

      return this.choices[i][0];
    },

    evtToValue: function(e) { return this.indexToValue(e.target.value); }
  },

  listeners: [
    {
      name: 'onMouseOver',
      code: function(e) {
        if ( this.timer_ ) window.clearTimeout(this.timer_);
        this.prev = ( this.prev === undefined ) ? this.value.get() : this.prev;
        this.value.set(this.evtToValue(e));
      }
    },

    {
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
      name: 'onClick',
      code: function(e) {
        this.prev = this.evtToValue(e);
        this.value.set(this.prev);
      }
    }
  ]
});


// TODO: Fix, doesn't work when choice is an array, which is always now
FOAModel({
  name:  'RadioBoxView',

  extendsModel: 'ChoiceView',

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
          out.push('id="' + this.on('click', callback) + '"');
          if ( this.value && choice == this.value.get() ) out.push(' checked');
          out.push('/> ');
        }
        out.push('</option>');
      }

      this.$.innerHTML = out.join('');
      AbstractView.getPrototype().initHTML.call(this);
    },

    initHTML: function() {
      Events.dynamic(function() { this.choices; }.bind(this), this.updateHTML.bind(this));
      //       this.updateHTML();
    }
  },

  listeners:
  [
    {
      name: 'onClick',
      code: function(evt) {
        console.log('****************', evt, arguments);
      }
    }
  ]

});


FOAModel({
  name:  'RoleView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'roleName',
      type:  'String',
      defaultValue: ''
    },
    {
      name:  'models',
      type:  'Array[String]',
      defaultValue: []
    },
    {
      name:  'selection',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name:  'model',
      type:  'Model'
    }
  ],

  methods: {
    initHTML: function() {
      var e = this.$;
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


FOAModel({
  name:  'BooleanView',

  extendsModel: 'AbstractView',

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
      return '<input type="checkbox" id="' + this.getID() + '" name="' + this.name + '" />';
    },

    initHTML: function() {
      var e = this.$;

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
});


FOAModel({
  name:  'ImageBooleanView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'name',
      label: 'Name',
      type:  'String',
      defaultValue: ''
    },
    {
      name: 'value',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.update);
        newValue.addListener(this.update);
        this.update();
      }
    },
    {
      name: 'trueImage'
    },
    {
      name: 'falseImage'
    }
  ],

  methods: {
    image: function() {
      return this.value.get() ? this.trueImage : this.falseImage;
    },
    toHTML: function() {
      var id = this.getID();
 // TODO: next line appears slow, check why
      this.on('click', this.onClick, id);
      return this.name ?
        '<img id="' + id + '" name="' + this.name + '">' :
        '<img id="' + id + '">' ;
    },
    initHTML: function() {
      this.invokeInitializers();
      this.$.src = this.image();
    },
    // deprecated: remove
    getValue: function() { return this.value; },
    // deprecated: remove
    setValue: function(value) { this.value = value; },
    destroy: function() {
      this.value.removeListener(this.update);
    }
  },

  listeners: [
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;
        this.$.src = this.image();
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        e.stopPropagation();
        this.value.set(! this.value.get());
      }
    }
  ]
});


FOAModel({
  name:  'ImageBooleanView2',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'name',
      label: 'Name',
      type:  'String',
      defaultValue: 'field'
    },
    {
      name: 'value',
      postSet: function() { if ( this.$ ) this.$.src = this.image(); }
    },
    {
      name: 'trueImage'
    },
    {
      name: 'falseImage'
    }
  ],

  methods: {
    image: function() { return this.value ? this.trueImage : this.falseImage; },
    toHTML: function() {
      return '<img id="' + this.getID() + '" name="' + this.name + '">';
    },
    initHTML: function() {
      this.$.addEventListener('click', this.onClick);
      this.$.src = this.image();
    }
  },

  listeners: [
    {
      name: 'onClick',
      code: function(e) {
        e.stopPropagation();
        this.value = ! this.value;
      }
    }
  ]
});


FOAModel({
  name: 'TextAreaView',

  extendsModel: 'AbstractView',

  label: 'Text-Area View',

  properties: [
    {
      name:  'rows',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 5
    },
    {
      name:  'cols',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 70
    },
    {
      model_: 'BooleanProperty',
      name:  'onKeyMode',
      help: 'If true, value is updated on each keystroke.'
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && Events.unlink(this.domValue, oldValue);

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
      this.SUPER(args);

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
      this.domValue = DomValue.create(this.$, this.onKeyMode ? 'input' : 'change', 'value');

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


FOAModel({
  name:  'FunctionView',

  extendsModel: 'TextAreaView',

  methods: {
    init: function(args) {
      this.SUPER(args);

      this.cols = args.displayWidth  || 80;
      this.rows = args.displayHeight || 8;
      this.onKeyMode = true;
      this.errorView = TextFieldView.create({mode:'read-only'});
    },

    initHTML: function() {
      this.SUPER();

      this.errorView.initHTML();
      this.errorView.$.style.color = 'red';
      this.errorView.$.style.display = 'none';
    },

    toHTML: function() {
      return this.errorView.toHTML() + ' ' + this.SUPER();
    },

    setError: function(err) {
      this.errorView.getValue().set(err || "");
      this.errorView.$.style.display = err ? 'block' : 'none';
    },

    textToValue: function(text) {
      if ( ! text ) return null;

      try {
        var ret = eval("(" + text + ")");

        this.setError(undefined);

        return ret;
      } catch (x) {
        console.log("JS Error: ", x, text);
        this.setError(x);

        return text;
      }
    },

    valueToText: function(value) {
      return value ? value.toString() : "";
    }
  }
});


FOAModel({
  name:  'JSView',

  extendsModel: 'TextAreaView',

  methods: {
    init: function(args) {
      this.SUPER();

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
      return JSONUtil.pretty.stringify(val);
    }
  }
});


FOAModel({
  name:  'XMLView',
  label: 'XML View',

  extendsModel: 'TextAreaView',

  methods: {
    init: function(args) {
      this.SUPER();

      this.cols = (args && args.displayWidth)  || 100;
      this.rows = (args && args.displayHeight) || 50;
    },

    textToValue: function(text) {
      return this.val_; // Temporary hack until XML parsing is implemented
      // TODO: parse XML
      return text;
    },

    valueToText: function(val) {
      this.val_ = val;  // Temporary hack until XML parsing is implemented
      return XMLUtil.stringify(val);
    }
  }
});


var DetailView = Model.create({

  name: 'DetailView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'model',
      type:  'Model'
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        if ( oldValue ) oldValue.removeListener(this.onValueChange);
        if ( newValue ) newValue.addListener(this.onValueChange);
        this.onValueChange();
      }
    },
    {
      name:  'title',
      defaultValueFn: function() { return "Edit " + this.model.label; }
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        if ( ! this.$ ) return;
        this.updateSubViews();
      }
    }
  ],

  methods: {
    bindSubView: function(view, prop) {
      if ( this.get() ) {
        // TODO: setValue is deprecated
        if ( view.setValue ) {
          view.setValue(this.get().propertyValue(prop.name));
        } else {
          view.value = this.get().propertyValue(prop.name);
        }
      }
    },

    viewModel: function() { return this.model; },

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

    titleHTML: function() {
      var title = this.title;

      return title ?
        '<tr><th colspan=2 class="heading">' + title + '</th></tr>' :
        '';
    },

    startColumns: function() { return '<tr><td colspan=2><table valign=top><tr><td valign=top><table>'; },
    nextColumn:   function() { return '</table></td><td valign=top><table valign=top>'; },
    endColumns:   function() { return '</table></td></tr></table></td></tr>'; },

    rowToHTML: function(prop, view) {
      var str = "";

      if ( prop.detailViewPreRow ) str += prop.detailViewPreRow(this);

      str += '<tr class="detail-' + prop.name + '">';
      if ( view.model_ === DAOControllerView ) {
        str += "<td colspan=2><div class=detailArrayLabel>" + prop.label + "</div>";
        str += view.toHTML();
        str += '</td>';
      } else {
        str += "<td class='label'>" + prop.label + "</td>";
        str += '<td>';
        str += view.toHTML();
        str += '</td>';
      }
      str += '</tr>';

      if ( prop.detailViewPostRow ) str += prop.detailViewPostRow(this);

      return str;
    },

    toHTML: function() {
      this.children = [];
      var model = this.model;
      var str  = "";

      str += '<div id="' + this.getID() + '" class="detailView" name="form">';
      str += '<table>';
      str += this.titleHTML();

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        str += this.rowToHTML(prop, this.createView(prop));
      }

      str += '</table>';
      str += '</div>';

      return str;
    },

    initHTML: function() {
      this.SUPER();

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
          child.value = obj.propertyValue(prop.name);
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
});


/** Version of DetailView which allows class of object to change. **/
var DetailView2 = Model.create({

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'model',
      type:  'Model'
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); }
    }
  ],

  methods: {
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
    createView: function(prop, opt_args) {
      var view =
        ! prop.view                   ? TextFieldView     :
        typeof prop.view === 'string' ? GLOBAL[prop.view] :
        prop.view ;

      return view.create(prop).copyFrom(opt_args);
    },

    updateHTML: function() {
      if ( ! this.elementId ) { return; }

      this.children = [];

      var model = this.model;
      var str  = "";

      str += '<table><tr><th colspan=2 class="heading">';
      str += 'Edit ' + model.label;
      str += '</th></tr>';

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        var view = this.createView(prop);

        if ( this.get() ) {
          view.setValue(this.get().propertyValue(prop.name));
        }

        view.prop = prop;
        view.toString = function () { return this.prop.name + "View"; };
        this.addChild(view);

        str += "<tr><td class='propertyLabel'>" + prop.label + "</td><td>";
        str += view.toHTML();
        str += '</td></tr>';
      }

      str += '</table>';

      this.$.innerHTML = str;
      this.initHTML.super_.call(this);
    },

    initHTML: function() {
      this.SUPER();

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
          //           console.log("updateSubView: " + child + " " + prop.name);
          //           console.log(obj.propertyValue(prop.name).get());
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
});


/** A display-only summary view. **/
FOAModel({
  name: 'SummaryView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'model',
      type:  'Model'
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); }
    }
  ],

  methods: {
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

      // TODO: Either make behave like DetailView or else
      // make a mode of DetailView.
      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        var value = obj[prop.name];

        if ( ! value ) continue;

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

      out.push('</table>');
      out.push('</div>');

      return out.join('');
    },

    get: function() {
      return this.getValue().get();
    }
  }
});


/** A display-only on-line help view. **/
FOAModel({
  name: 'HelpView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'model',
      type:  'Model'
    }
  ],

  methods: {
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
          var subView  = HelpView.create({model: subModel});
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


FOAModel({
  name: 'TableView',

  extendsModel: 'AbstractView',

  label: 'Table View',

  properties: [
    {
      name:  'model',
      type:  'Model'
    },
    {
      model_: 'StringArrayProperty',
      name:  'properties',
      preSet: function(a) { return ! a || a.length == 0 ? null : a; },
      postSet: function() { this.repaint_(); },
      defaultValue: null
    },
    {
      name:  'hardSelection',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name:  'selection',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name:  'children',
      type:  'Array[View]',
      valueFactory: function() { return []; }
    },
    {
      name:  'sortOrder',
      type:  'Comparator',
      postSet: function() { this.repaint_(); },
      defaultValue: undefined
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      required: true,
      hidden: true,
      postSet: function(oldValue, val) {
        if ( oldValue && this.listener ) oldValue.unlisten(this.listener);
        this.listener && val && val.listen(this.listener);
        this.repaint_ && this.repaint_();
      }
    },
    {
      name: 'rows',
      type:  'Integer',
      defaultValue: 30,
      postSet: function() {
        this.repaint();
      }
    },
    {
      model_: 'IntegerProperty',
      name: 'height'
    },
    {
      model_: 'BooleanProperty',
      name: 'editColumnsEnabled',
      defaultValue: false
    }
  ],

  listeners: [
    {
      name: 'onEditColumns',
      code: function(evt) {
        var v = EditColumnsView.create({
          model:               this.model,
          properties:          this.properties || this.model.tableProperties,
          availableProperties: this.model.properties
        });

        v.addPropertyListener('properties', function() {
          v.close();
          this.properties = v.properties;
          v.removePropertyListener('properties', arguments.callee);
          this.repaint();
        }.bind(this));

        this.$.insertAdjacentHTML('beforebegin', v.toHTML());
        v.initHTML();
      }
    }
  ],

  methods: {

    layout: function() {
      if ( ! this.$ ) {
        console.warn('Attempt to layout() $-less TableView.');
        return;
      }
      var parent;
      try {
        parent = window.getComputedStyle(this.$.parentNode.parentNode.parentNode.parentNode.parentNode);
      } catch (x) {
        return;
      }

      if ( ! parent ) return;

      var top = 47;
      var height = 20;
      var rows = $$("tr-" + this.getID());

      // TODO: investigate how this is called on startup, it seems suspicious
      if ( rows.length > 1 ) {
        var row = rows[1];
        var style = window.getComputedStyle(row);
        // If the row is selected its height is less, so if we select two rows
        // we're sure to get one that isn't selected.
        height = Math.max(row.clientHeight, rows[0].clientHeight)+1;
        top = rows[0].offsetTop + rows[0].offsetParent.offsetTop;
      }

      this.rows = Math.floor((toNum(parent.height) - top) / height);
    },

    // Not actually a method, but still works
    // TODO: add 'Constants' to Model
    DOUBLE_CLICK: "double-click", // event topic

    init: function() {
      var self = this;
      this.repaint_ = EventService.animate(this.repaint.bind(this));

      this.listener = {
        put: self.repaint_,
        remove: self.repaint_
      };

      this.SUPER();
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

      if ( this.initializers_ ) {
        // console.log('Warning: TableView.tableToHTML called twice without initHTML');
        delete this['initializers_'];
        this.children = [];
      }

      var str = [];
      var props = [];

      str.push('<table class="foamTable ' + model.name + 'Table">');

      //str += '<!--<caption>' + model.plural + '</caption>';
      str.push('<thead><tr>');
      var properties = this.properties || this.model.tableProperties;
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var key  = properties[i];
        var prop = model.getProperty(key);

        if ( ! prop ) continue;

        if ( prop.hidden ) continue;

        str.push('<th scope=col ');
        str.push('id=' +
                 this.on(
                   'click',
                   (function(table, prop) { return function() {
                     if ( table.sortOrder === prop ) {
                       table.sortOrder = DESC(prop);
                     } else {
                       table.sortOrder = prop;
                     }
                     table.repaint();
                   };})(this, prop)));
        if ( prop.tableWidth ) str.push(' width="' + prop.tableWidth + '"');

        var arrow = '';

        if ( this.sortOrder === prop ) {
          arrow = ' <span class="indicator">&#9650;</span>';
        } else if ( this.sortOrder && DescExpr.isInstance(this.sortOrder) && this.sortOrder.arg1 === prop ) {
          arrow = ' <span class="indicator">&#9660;</span>';
        }

        str.push('>' + prop.tableLabel + arrow + '</th>');

        props.push(prop);
      }
      if ( this.editColumnsEnabled ) {
        str.push('<th width=15 id="' + this.on('click', this.onEditColumns) + '">...</th>');
      }
      str.push('</tr><tr style="height:2px"></tr></thead><tbody>');
      if ( this.objs )
        for ( var i = 0 ; i < this.objs.length; i++ ) {
          var obj = this.objs[i];
          var className = "tr-" + this.getID();

          if ( this.selection.get() && obj.id == this.selection.get().id ) {
            this.selection.set(obj);
            className += " rowSelected";
          }

          str.push('<tr class="' + className + '">');

          for ( var j = 0 ; j < props.length ; j++ ) {
            var prop = props[j];

            if ( j == props.length - 1 && this.editColumnsEnabled ) {
              str.push('<td colspan=2 class="' + prop.name + '">');
            } else {
              str.push('<td class="' + prop.name + '">');
            }
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

    repaint: function() {
      if ( ! this.dao || ! this.$ ) return;
      var self = this;
      var objs = [];
      var selection = this.selection && this.selection.get();
      (this.sortOrder ? this.dao.orderBy(this.sortOrder) : this.dao).limit(this.rows).select({
        put: function(o) { if ( ! selection || ( self.selection && o === self.selection.get() ) ) selection = o; objs.push(o); }} )(function() {
          self.objs = objs;
          if ( self.$ ) {
            self.$.innerHTML = self.tableToHTML();
            self.initHTML_();
            self.height = toNum(window.getComputedStyle(self.$.children[0]).height);
          }
          // self.selection && self.selection.set(selection);
        });
    },

    initHTML_: function() {
      this.initHTML.super_.call(this);

      var es = $$('tr-' + this.getID());
      var self = this;

      if ( es.length ) {
        if ( ! this.sized_ ) {
          this.sized_ = true;
          this.layout();
          return;
        }
      }

      for ( var i = 0 ; i < es.length ; i++ ) {
        var e = es[i];

        e.onmouseover = function(value, obj) { return function() {
          value.set(obj);
        }; }(this.selection, this.objs[i]);
        e.onmouseout = function(value, obj) { return function() {
          value.set(self.hardSelection.get());
        }; }(this.selection, this.objs[i]);
        e.onclick = function(value, obj) { return function(evt) {
          self.hardSelection.set(obj);
          value.set(obj);
          delete value['prevValue'];
          var siblings = evt.srcElement.parentNode.parentNode.childNodes;
          for ( var i = 0 ; i < siblings.length ; i++ ) {
            siblings[i].classList.remove("rowSelected");
          }
          evt.srcElement.parentNode.classList.add('rowSelected');
        }; }(this.selection, this.objs[i]);
        e.ondblclick = function(value, obj) { return function(evt) {
          self.publish(self.DOUBLE_CLICK, obj, value);
        }; }(this.selection, this.objs[i]);
      }

      delete this['initializers_'];
      this.children = [];
    },

    destroy: function() {
    }
  }
});


FOAModel({
  name: 'EditColumnsView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'model',
      type: 'Model'
    },
    {
      model_: 'StringArrayProperty',
      name:  'properties'
    },
    {
      model_: 'StringArrayProperty',
      name:  'availableProperties'
    }
  ],

  listeners: [
    {
      name: 'onAddColumn',
      code: function(prop) {
        this.properties = this.properties.concat([prop]);
      }
    },
    {
      name: 'onRemoveColumn',
      code: function(prop) {
        this.properties = this.properties.deleteF(prop);
      }
    }

  ],

  methods: {
    toHTML: function() {
      var s = '<span id="' + this.getID() + '" class="editColumnView" style="position: absolute;right: 0.96;background: white;top: 138px;border: 1px solid black;">'

      s += 'Show columns:';
      s += '<table>';

      // Currently Selected Properties
      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var p = this.model.getProperty(this.properties[i]);
        s += '<tr><td id="' + this.on('click', this.onRemoveColumn.bind(this, p.name)) + '">&nbsp;&#x2666;&nbsp;' + p.label + '</td></tr>';
      }

      // Available but not Selected Properties
      for ( var i = 0 ; i < this.availableProperties.length ; i++ ) {
        var p = this.availableProperties[i];
        if ( this.properties.indexOf(p.name) == -1 ) {
          s += '<tr><td id="' + this.on('click', this.onAddColumn.bind(this, p.name)) + '">&nbsp;&nbsp;&nbsp;&nbsp;' + p.label + '</td></tr>';
        }
      }

      s += '</table>';
      s += '</span>';

      return s;
    }
  }
});


// TODO: add ability to set CSS class and/or id
FOAModel({
  name: 'ActionButton',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'action'
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener && oldValue.removeListener(this.onValueChange);
        newValue.addListener(this.onValueChange);
      }
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        var value  = this.value.get();
        var action = this.action;
        Events.dynamic(action.isEnabled.bind(value), this.onEnabled);
      }
    },
    {
      name: 'onEnabled',
      code: function(enabled) {
        if ( ! this.$ ) return;
        this.$.disabled = enabled ? undefined : 'disabled';
      }
    }
  ],

  methods: {
    toHTML: function() {
      var out = [];
      var tooltip = this.action.help ? ' data-tip="' + this.action.help + '" ' : '';
      out.push('<button class="actionButton actionButton-' + this.action.name + '" id="' + this.getID() + '"' + tooltip + '>');

      if ( this.action.iconUrl ) {
        out.push('<img src="' + XMLUtil.escapeAttr(this.action.iconUrl) + '" />');
      }

      if ( this.action.showLabel ) {
        out.push(this.action.label);
      }

      out.push('</button>');

      return out.join('');
    },

    initHTML: function() {
      this.SUPER();

      var self = this;
      this.$.addEventListener(
        'click',
        function() { self.action.callIfEnabled(self.value.get()); });

      this.onValueChange();
    }
  }
});


FOAModel({
  name: 'ActionLink',

  extendsModel: 'ActionButton',

  methods: {
    toHTML: function() {
      var out = '<a href="#" class="actionLink actionLink-' + this.action.name + '" id="' + this.getID() + '">';

      if ( this.action.iconUrl ) {
        out += '<img src="' + XMLUtil.escapeAttr(this.action.iconUrl) + '" />';
      }

      if ( this.action.showLabel ) {
        out += this.action.label;
      }

      out += '</a>';

      return out;
    }
  }
});


// TODO: ActionBorder should use this.
FOAModel({
  name:  'ToolbarView',
  label: 'Toolbar',

  extendsModel: 'AbstractView',

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'horizontal',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'icons',
      defaultValueFn: function() {
        return this.horizontal;
      }
    },
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
      }
    },
    {
      name: 'left'
    },
    {
      name: 'top'
    },
    {
      name: 'bottom'
    },
    {
      name: 'right'
    },
    {
      name: 'document'
    },
    {
      model_: 'BooleanPropery',
      name: 'openedAsMenu',
      defaultValue: false
    }
  ],

  methods: {
    preButton: function(button) { return ' '; },
    postButton: function() { return this.horizontal ? ' ' : '<br>'; },

    openAsMenu: function() {
      // TODO
      var div = this.document.createElement('div');
      this.openedAsMenu = true;

      div.id = this.nextID();
      div.className = 'ActionMenuPopup';
      this.top ? div.style.top = this.top : div.style.bottom = this.bottom;
      this.left ? div.style.left = this.left : div.style.right = this.right;
      div.innerHTML = this.toHTML(true);

      var self = this;
      // Close window when clicked
      div.onclick = function() {
        self.close();
      };

      div.onmouseout = function(e) {
        if (e.toElement.parentNode != div && e.toElement.parentNode.parentNode != div) {
          self.close();
        }
      };

      this.document.body.appendChild(div);
      this.initHTML();
    },

    close: function() {
      if ( ! this.openedAsMenu ) {
        return this.SUPER();
      }

      this.openedAsMenu = false;
      this.$.parentNode.remove();
      this.destroy();
      this.publish('closed');
    },

    toHTML: function(opt_menuMode) {
      var str = '';
      var cls = opt_menuMode ? 'ActionMenu' : 'ActionToolbar';

      str += '<div id="' + this.getID() + '" class="' + cls + '">';

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        str += this.preButton(this.children[i]) +
          this.children[i].toHTML() +
          (MenuSeparator.isInstance(this.children[i]) ?
           '' : this.postButton(this.children[i]));
      }

      str += '</div>';

      return str;
    },

    initHTML: function() {
      this.SUPER();

      // this.value.addListener(function() { console.log('****ActionToolBar'); });
      // When the focus is in the toolbar, left/right arrows should move the
      // focus in the direction.
      this.addShortcut('Right', function(e) {
        var i = 0;
        for (; i < this.children.length; ++i) {
          if (e.target == this.children[i].$)
            break;
        }
        i = (i + 1) % this.children.length;
        this.children[i].$.focus();
      }.bind(this), this.getID());
      this.addShortcut('Left', function(e) {
        var i = 0;
        for (; i < this.children.length; ++i) {
          if (e.target == this.children[i].$)
            break;
        }
        i = (i + this.children.length - 1) % this.children.length;
        this.children[i].$.focus();
      }.bind(this), this.getID());
    },

    addAction: function(a) {
      var view = ActionButton.create({ action: a, value: this.value });
      if ( a.children.length > 0 ) {
        var self = this;
        view.action = a.clone();
        view.action.action = function() {
          var toolbar = ToolbarView.create({
            value: self.value,
            document: self.document,
            left: view.$.offsetLeft,
            top: view.$.offsetTop
          });
          toolbar.addActions(a.children);
          toolbar.openAsMenu(view);
        };
      }
      this.addChild(view);
    },
    addActions: function(actions) {
      actions.forEach(this.addAction.bind(this));
    },
    addSeparator: function() {
      this.addChild(MenuSeparator.create());
    }
  }
});

// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
// TODO: Model
/** Add Action Buttons to a decorated View. **/
/* TODO:
   The view needs a standard interface to determine it's Model (getModel())
   listen for changes to Model and change buttons displayed and enabled
   use isAvailable and isEnabled
   Buttons should be own View with enabled = true/false and own listeners, don't use <button> directly
*/
var ActionBorder = {

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

        //          str += '<table class="actionBorder"><tr><td>';
        str += this.__proto__.toHTML.call(this);
        //          str += '</td></tr><tr><td class="actionBorderActions">';
        str += '<div class="actionToolbar">';

        for ( var i = 0 ; i < this.actions.length ; i++ ) {
          var action = this.actions[i];
          var button = ActionButton.create({action: action, value: this.getValue()});
          str += " " + button.toHTML() + " ";

          this.addChild(button);
        }

        str += '</div>';
        //          str += '</td></tr></table>';

        return str;
      }
    };

    // TODO: document why this is needed or remove
    obj.value && obj.value.set(obj.value.get());

    // if delegate doesn't have a getValue method, then add one
    if ( ! obj.getValue ) {
      var dm = SimpleValue.create(obj);
      obj.getValue = function() {
        return dm;
      };
    }

    return obj;
  }
};

FOAModel({
  name: 'ActionBorder2',

  properties: [
    {
      name: 'actions'
    }
  ],

  methods: {
    toHTML: function(border, delegate, args) {
      var str = "";
      str += delegate.apply(this, args);
      str += '<div class="actionToolbar">';
      var actions = border.model ? border.model.actions : this.model.actions;
      for ( var i = 0 ; i < actions.length; i++ ) {
        var action = actions[i];
        var button = ActionButton.create({ action: action });
        button.value$ = this.value$;
        str += " " + button.toHTML() + " ";
        this.addChild(button);
      }

      str += '</div>';
      return str;
    }
  }
});

FOAModel({
  name:  'ProgressView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'value',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); }
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
      var e = this.$;

      e.value = parseInt(this.value.get());
    },

    initHTML: function() {
      var e = this.$;

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


FOAModel({
  name: 'GridView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name:  'row',
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
      name:  'scrollMode',
      type:  'String',
      defaultValue: 'Bars',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "Bars", "Warp"
        ]}); }
      }
    },
    {
      name:  'model',
      type: 'Model'
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      postSet: function() {
        this.updateHTML();
      }
    },
    {
      name:  'grid',
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
      if ( ! this.$ ) return;

      var self = this;
      this.grid.xFunc = this.col.value.get() || this.grid.xFunc;
      this.grid.yFunc = this.row.value.get() || this.grid.yFunc;
      this.grid.acc   = this.acc.value.get() || this.grid.acc;

      this.dao.select(this.grid.clone())(function(g) {
        if ( self.scrollMode === 'Bars' ) {
          console.time('toHTML');
          var html = g.toHTML();
          console.timeEnd('toHTML');

          console.time('setInnerHTML');
          self.$.innerHTML = html;
          console.timeEnd('setInnerHTML');

          // Perform asynchronously so that it doesn't delay the displaying of the grid
          setTimeout(function() {
            console.time('initHTML');
            g.initHTML();
            console.timeEnd('initHTML');
          }, 800);
        } else {
          var cview = GridCView.create({grid: g, x:5, y: 5, width: 1000, height: 800});
          self.$.innerHTML = cview.toHTML();
          cview.initHTML();
          cview.paint();
        }
      });
    },

    initHTML: function() {
      var choices = [];
      this.model.properties.orderBy(Property.LABEL).select({put:function(p) {
        choices.push([p, p.label]);
      }});
      this.row.choices = choices;
      this.col.choices = choices;

      this.acc.choices = this.accChoices;

      this.row.initHTML();
      this.col.initHTML();
      this.acc.initHTML();

      this.SUPER();
      this.repaint_ = EventService.animate(this.updateHTML.bind(this));

      this.row.value.addListener(this.repaint_);
      this.col.value.addListener(this.repaint_);
      this.acc.value.addListener(this.repaint_);
      this.scrollMode$.addListener(this.repaint_);

      this.updateHTML();
    }
  },

  templates:[
    /*
    {
      model_: 'Template',

      name: 'toHTML2',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %><br/></div>' +
        '<div id="<%= this.getID()%>" class="gridViewArea column" style="flex: 1 1 100%"></div>' +
        '</div>'
    },
    */
    {
      model_: 'Template',

      name: 'toHTML',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %> &nbsp;Scroll: $$scrollMode <br/></div>' +
        '<div id="<%= this.getID()%>" class="gridViewArea column" style="flex: 1 1 100%"></div>' +
        '</div>'
    }
  ]
});


FOAModel({
  name: 'Mouse',

  properties: [
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
    }
  ],
  methods: {
    connect: function(e) {
      e.addEventListener('mousemove', this.onMouseMove);
      return this;
    }
  },

  listeners: [
    {
      name: 'onMouseMove',
      isAnimated: true,
      code: function(evt) {
        this.x = evt.offsetX;
        this.y = evt.offsetY;
      }
    }
  ]
});


FOAModel({
  name: 'ViewChoice',

  tableProperties: [
    'label',
    'view'
  ],

  properties: [
    {
      name: 'label',
      type: 'String',
      displayWidth: 20,
      defaultValue: '',
      help: "View's label."
    },
    {
      name: 'view',
      type: 'view',
      defaultValue: 'DetailView',
      help: 'View factory.'
    }
  ]
});


FOAModel({
  name: 'AlternateView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create(''); }
    },
    {
      name: 'views',
      type: 'Array[ViewChoice]',
      subType: 'ViewChoice',
      view: 'ArrayView',
      defaultValue: [],
      help: 'View choices.'
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      postSet: function(_, dao) {
        if ( this.choice ) {
          if ( this.view ) {
            this.view.dao = dao;
          } else {
            this.installSubView(this.choice);
          }
        }
      }
    },
    {
      name:  'choice',
      postSet: function(oldValue, viewChoice) {
        if ( this.elementId && oldValue != viewChoice ) this.installSubView(viewChoice);
      },
      hidden: true
    },
    {
      name: 'mode',
      getter: function() { return this.choice.label; },
      setter: function(label) {
        for ( var i = 0 ; i < this.views.length ; i++ ) {
          if ( this.views[i].label === label ) {
            var oldValue = this.mode;

            this.choice = this.views[i];

            this.propertyChange('mode', oldValue, label);
            return;
          }
        }
      }
    },
    {
      name: 'headerView',
      help: 'Optional View to be displayed in header.',
      defaultValue: null
    },
    {
      name: 'view'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.choice = this.views[0];
    },

    installSubView: function(viewChoice) {
      var view = typeof(viewChoice.view) === 'function' ?
        viewChoice.view(this.value.get().model_, this.value) :
        GLOBAL[viewChoice.view].create({
          model: this.value.get().model_,
          value: this.value
        });

      // TODO: some views are broken and don't have model_, remove
      // first guard when fixed.
      if ( view.model_ && view.model_.getProperty('dao') ) view.dao = this.dao;

      this.$.innerHTML = view.toHTML();
      view.initHTML();
      view.value && view.value.set(this.value.get());
      //       if ( view.set ) view.set(this.model.get());
      //       Events.link(this.model, this.view.model);

      this.view = view;
    },

    toHTML: function() {
      var str  = [];
      var viewChoice = this.views[0];

      str.push('<div class="AltViewOuter column" style="margin-bottom:5px;">');
      str.push('<div class="altViewButtons rigid">');
      if ( this.headerView ) {
        str.push(this.headerView.toHTML());
        this.addChild(this.headerView);
      }
      for ( var i = 0 ; i < this.views.length ; i++ ) {
        var choice = this.views[i];
        var listener = function (choice) {
          this.choice = choice;
          return false;
        }.bind(this, choice);

        var id = this.nextID();

        this.addPropertyListener('choice', function(choice, id) {
          DOM.setClass($(id), 'mode_button_active', this.choice === choice);
        }.bind(this, choice, id));

        var cls = 'buttonify';
        if ( i == 0 ) cls += ' capsule_left';
        if ( i == this.views.length - 1 ) cls += ' capsule_right';
        if ( choice == this.choice ) cls += ' mode_button_active';
        str.push('<a class="' + cls + '" id="' + this.on('click', listener, id) + '">' + choice.label + '</a>');
        if ( choice.label == this.selected ) viewChoice = choice
      }
      str.push('</div>');
      str.push('<br/>');
      str.push('<div class="altView column" id="' + this.getID() + '"> </div>');
      str.push('</div>');

      return str.join('');
    },

    initHTML: function() {
      this.SUPER();

      this.choice = this.choice || this.views[0];
      this.installSubView(this.choice);
    }
  }
});


FOAModel({
  name: 'ModelAlternateView',
  extendsModel: 'AlternateView',
  methods: {
    init: function() {
      // TODO: super.init
      this.views = FOAM([
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
      ]);
    }
  }
});


FOAModel({
  name:  'FloatFieldView',

  extendsModel: 'TextFieldView',

  methods: {
    textToValue: function(text) {
      return parseFloat(text) || "0.0";
    }
  }
});


FOAModel({
  name:  'IntFieldView',

  extendsModel: 'TextFieldView',

  methods: {
    textToValue: function(text) {
      return parseInt(text) || "0";
    },
    valueToText: function(value) {
      return value ? value : '0';
    }
  }
});


FOAModel({
  name:  'StringArrayView',

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


FOAModel({
  name: 'MultiLineStringArrayView',
  extendsModel: 'AbstractView',

  properties: [
    {
      model_: 'StringProperty',
      name: 'name'
    },
    {
      model_: 'StringProperty',
      name: 'type',
      defaultValue: 'text'
    },
    {
      model_: 'IntegerProperty',
      name: 'displayWidth',
      defaultValue: 30
    },
    {
      name: 'softValue',
      valueFactory: function() { return SimpleValue.create([]); }
    },
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create([]); },
      postSet: function(oldValue, newValue) {
        if ( oldValue ) {
          oldValue.removeListener(this.update);
        }
        newValue.addListener(this.update);
        this.update();
      }
    },
  ],

  methods: {
    toHTML: function() {
      var toolbar = ToolbarView.create({
        value: SimpleValue.create(this)
      });
      toolbar.addActions([this.model_.ADD]);
      this.children = [toolbar];

      return '<div id="' + this.getID() + '"><div></div>' +
        toolbar.toHTML() +
        '</div>';
    },
    initHTML: function() {
      this.SUPER();
      this.update();
    },
    row: function() {
      return '<div><input id="' + this.on('input', this.onInput) +
        '" name="' + this.name + '" type="' + this.type + '" ' +
        'size="' + this.displayWidth + '"/>' +
        '<input type="button" id="' +
        this.on('click', this.onRemove) +
        '" class="multiLineStringRemove" value="X"></div>';
    },
    setValue: function(value) {
      this.value = value;
    }
  },

  listeners: [
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;

        var inputs = this.$.firstElementChild;
        var value = this.value.get();

        var extra = "";

        // Add/remove rows as necessary.
        if ( inputs.children.length > value.length ) {
          for ( var i = value.length - 1; i < inputs.children.length; i++ ) {
            inputs.children[i].remove();
          }
        } else {
          for ( i = inputs.children.length; i < value.length; i++ )
            extra += this.row();

          if ( extra.length > 0 ) {
            inputs.insertAdjacentHTML('beforeend', extra);
          }
        }

        // Only update the value for a row if it does not match.
        for ( i = 0; i < value.length; i++ ) {
          if ( inputs.children[i].firstElementChild.value !== value[i] )
            inputs.children[i].firstElementChild.value = value[i];
        }

        this.invokeInitializers();
      }
    },
    {
      name: 'onRemove',
      code: function(e) {
        var inputs = this.$.firstElementChild.children;
        for ( var i = 0; i < inputs.length; i++ ) {
          if ( inputs[i].lastChild === e.target ) {
            inputs[i].remove();
            break;
          }
        }
        this.onInput();
      }
    },
    {
      name: 'onInput',
      code: function(e) {
        if ( ! this.$ ) return;

        var inputs = this.$.firstElementChild.children;
        var newValue = [];

        for ( var i = 0; i < inputs.length; i++ ) {
          newValue.push(inputs[i].firstElementChild.value);
        }
        this.value.set(newValue);
      }
    }
  ],

  actions: [
    {
      name: 'add',
      label: 'Add',
      action: function() {
        this.$.firstElementChild.insertAdjacentHTML(
          'beforeend', this.row());
        this.invokeInitializers();
        this.onInput();
      }
    }
  ]
});


FOAModel({
  extendsModel: 'AbstractView',

  name: 'SplitView',

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
      this.SUPER();
      /*
        this.view1 = AlternateView.create();
        this.view2 = AlternateView.create();
      */
      this.view1 = DetailView2.create();
      this.view2 = JSView.create();

      this.setValue(SimpleValue.create(""));
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


FOAModel({
  name: 'ListValueView',
  help: 'Combines an input view with a value view for the edited value.',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'valueView'
    },
    {
      name: 'inputView'
    },
    {
      name: 'placeholder',
      postSet: function(_, newValue) {
        this.inputView.placeholder = newValue;
      }
    },
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create({ value: [] }); },
      postSet: function(oldValue, newValue) {
        this.inputView.setValue(newValue);
        this.valueView.value = newValue;
      }
    }
  ],

  methods: {
    focus: function() { this.inputView.focus(); },
    toHTML: function() {
      this.valueView.lastView = this.inputView;
      return this.valueView.toHTML();
    },
    setValue: function(value) {
      this.value = value;
    },
    initHTML: function() {
      this.SUPER();
      this.valueView.initHTML();
    }
  }
});


FOAModel({
  extendsModel: 'AbstractView',

  name: 'ListInputView',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'dao',
      help: 'The DAO to fetch autocomplete objects from.',
    },
    {
      name: 'property',
      help: 'The property model to map autocomplete objecst to values with.'
    },
    {
      model_: 'ArrayProperty',
      name: 'searchProperties',
      help: 'The properties with which to construct the autocomplete query with.'
    },
    {
      name: 'autocompleteView',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.unsubscribe('selected', this.selected);
        newValue.subscribe('selected', this.selected);
      }
    },
    {
      name: 'placeholder',
      postSet: function(oldValue, newValue) {
        if ( this.$ && this.usePlaceholer ) this.$.placeholder = newValue;
      }
    },
    {
      model_: 'BooleanValue',
      name: 'usePlaceholder',
      defaultValue: true,
      postSet: function(_, newValue) {
        if ( this.$ ) this.$.placeholder = newValue ?
          this.placeholder : '';
      }
    },
    {
      name: 'value',
      help: 'The array value we are editing.',
      valueFactory: function() {
        return SimpleValue.create({
          value: []
        });
      },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.onValueChange);
        newValue.addListener(this.onValueChange);
      }
    },
    {
      name: 'domInputValue'
    }
  ],

  methods: {
    toHTML: function() {
      this.on('keydown', this.onKeyDown, this.getID());
      this.on('blur', this.animate(this.delay(200, this.animate(this.animate(this.onBlur)))), this.getID());
      this.on('focus', this.onInput, this.getID());

      return '<input name="' + this.name + '" type="text" id="' + this.getID() + '" class="listInputView">' + this.autocompleteView.toHTML();
    },
    setValue: function(value) {
      this.value = value;
    },
    initHTML: function() {
      this.SUPER();
      if ( this.usePlaceholder && this.placeholder )
        this.$.placeholder = this.placeholder;
      this.autocompleteView.initHTML();
      this.domInputValue = DomValue.create(this.$, 'input');
      this.domInputValue.addListener(this.onInput);
    },
    pushValue: function(v) {
      this.value.set(this.value.get().concat(v));
      this.domInputValue.set('');
      // Previous line doesn't trigger listeners.
      this.onInput();
    },
    popValue: function() {
      var value = this.value.get().slice();
      value.pop();
      this.value.set(value);
    }
  },

  listeners: [
    {
      name: 'selected',
      code: function() {
        if ( this.autocompleteView.value.get() ) {
          this.pushValue(
            this.property.f(this.autocompleteView.value.get()));
        }
      }
    },
    {
      name: 'onInput',
      code: function() {
        var value = this.domInputValue.get();

        if ( value.charAt(value.length - 1) === ',' ) {
          if ( value.length > 1 ) this.pushValue(value.substring(0, value.length - 1));
          else this.domInputValue.set('');
          return;
        }

        if ( value === '' ) {
          this.autocompleteView.dao = [];
          return;
        }

        var predicate = OR();
        value = this.domInputValue.get();
        for ( var i = 0; i < this.searchProperties.length; i++ ) {
          predicate.args.push(STARTS_WITH(this.searchProperties[i], value));
        }
        value = this.value.get();
        if ( value.length > 0 ) {
          predicate = AND(NOT(IN(this.property, value)), predicate);
        }
        this.autocompleteView.dao = this.dao.where(predicate);
      }
    },
    {
      name: 'onKeyDown',
      code: function(e) {
        if ( e.keyCode === 40 /* down */) {
          this.autocompleteView.nextSelection();
          e.preventDefault();
        } else if ( e.keyCode === 38 /* up */ ) {
          this.autocompleteView.prevSelection();
          e.preventDefault();
        } else if ( e.keyCode === 13 /* RET */ || e.keyCode === 9 /* TAB */ ) {
          if ( this.autocompleteView.value.get() ) {
            this.pushValue(
              this.property.f(this.autocompleteView.value.get()));
            e.preventDefault();
          }
        } else if ( e.keyCode === 8 && this.domInputValue.get() === '' ) {
          this.popValue();
        }
      }
    },
    {
      name: 'onBlur',
      code: function(e) {
        var value = this.domInputValue.get();
        if ( value.length > 0 ) {
          this.pushValue(value);
        } else {
          this.domInputValue.set('');
        }
        this.autocompleteView.dao = [];
      }
    },
    {
      name: 'onValueChange',
      code: function() {
        this.usePlaceholder = this.value.get().length == 0;
      }
    }
  ]
});


FOAModel({
  name: 'ArrayTileView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'property'
    },
    {
      name: 'tileView'
    },
    {
      name: 'lastView'
    },
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.paint);
        newValue.addListener(this.paint);
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'painting',
      defaultValue: false
    }
  ],

  methods: {
    toHTML: function() {
      this.on('click', this.onClick, this.getID());

      return '<ul id="' + this.getID() + '" class="arrayTileView"><li class="arrayTileLastView">' +
        this.lastView.toHTML() + '</li></ul>';
    },
    initHTML: function() {
      this.SUPER();

      this.lastView.initHTML();
      this.paint();
      this.$.ownerDocument.defaultView.addEventListener('resize', this.layout);
    },
  },

  listeners: [
    {
      // Clicking anywhere in the View should give focus to the
      // lastView.
      name: 'onClick',
      code: function() {
        this.lastView.focus();
      }
    },
    {
      name: 'layout',
      isAnimated: true,
      code: function() {
        if ( ! this.$ ) return;
        var last = this.$.lastChild;
        last.style.width = '100px';
        last.style.width = 100 + last.parentNode.clientWidth -
          (last.offsetWidth + last.offsetLeft) - 4 /* margin */ - 75;
        this.painting = false;
      }
    },
    {
      name: 'paint',
      isAnimated: true,
      code: function() {
        // If we're currently painting, don't actually paint now,
        // queue up another paint on the next animation frame.
        // This doesn't spin infinitely because paint is set to animate: true,
        // meaning that it's merged to the next animation frame.
        if ( this.painting ) {
          this.paint();
          return;
        }

        this.painting = true;
        this.children = [];
        var value = this.value.get();
        var count = value.length;
        var self = this;
        var render = function() {
          while ( self.$.firstChild !== self.$.lastChild ) {
            self.$.removeChild(self.$.firstChild);
          }

          var temp = document.createElement('div');
          temp.style.display = 'none';
          self.$.insertBefore(temp, self.$.lastChild);
          temp.outerHTML = self.children.map(
            function(c) { return '<li class="arrayTileItem">' + c.toHTML() + '</li>'; }).join('');
          self.children.forEach(
            function(c) { c.initHTML(); });
          self.layout();
        };

        if ( value.length == 0 ) {
          render();
        } else {
          self.$.style.display = '';
        }

        for ( var i = 0; i < value.length; i++ ) {
          this.dao.find(EQ(this.property, value[i]), {
            put: function(obj) {
              var view = self.tileView.create();
              view.value.set(obj);
              view.subscribe('remove', self.onRemove);
              self.addChild(view);
              count--;
              if ( count == 0 ) render();
            },
            error: function() {
              // Ignore missing values
              count--;
              if ( count == 0 ) render();
            },
          });
        }
      }
    },
    {
      name: 'onRemove',
      code: function(src, topic, obj) {
        var self = this;
        this.value.set(this.value.get().removeF({
          f: function(o) {
            return o === self.property.f(obj);
          }
        }));
      }
    }
  ]
});


FOAModel({
  name: 'ArrayListView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create([]) },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.update);
        newValue.addListener(this.update);
        this.update();
      }
    },
    {
      name: 'listView'
    },
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.getID() + '"></div>';
    },
    initHTML: function() {
      this.SUPER();
      this.update();
    },
    setValue: function(value) {
      this.value = value;
    }
  },

  listeners: [
    {
      name: 'update',
      animate: true,
      code: function() {
        if ( ! this.$ ) return;
        this.$.innerHTML = '';

        var objs = this.value.get();
        var children = new Array(objs.length);

        for ( var i = 0; i < objs.length; i++ ) {
          var view = this.listView.create();
          children[i] = view;
          view.value = SimpleValue.create(objs[i]);
        }

        this.$.innerHTML = children.map(function(c) { return c.toHTML(); }).join('');
        children.forEach(function(c) { c.initHTML(); });
      }
    }
  ]
});


FOAModel({
  name: 'DAOKeyView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'innerValue',
      valueFactory: function() { return SimpleValue.create(''); }
    },
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create(""); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.update);
        newValue.addListener(this.update);
        this.update();
      }
    },
    {
      name: 'model',
    },
    {
      name: 'dao',
      valueFactory: function() { return GLOBAL[this.model.name + 'DAO']; }
    },
    {
      name: 'view',
      defaultValueFn: function() { return DetailView; }
    },
    {
      name: 'innerView',
    }
  ],

  methods: {
    toHTML: function() {
      this.innerView = this.view.create({ model: this.model });
      this.innerView.value = this.innerValue;
      return this.innerView.toHTML();
    },
    initHTML: function() {
      this.SUPER();
      this.innerView.initHTML();
      this.update();
    }
  },

  listeners: [
    {
      name: 'update',
      animate: true,
      code: function() {
        var self = this;
        if ( ! this.dao ) return;
        this.dao.find(this.value.get(), {
          put: function(obj) {
            self.innerValue.set(obj);
          },
          error: function() {
            self.innerValue.set('');
          }
        });
      }
    }
  ]
});


FOAModel({
  name: 'ListView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'dao',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.unlisten(this.update);
        newValue.listen(this.update);
        this.update();
      }
    },
    {
      name: 'view'
    }
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.getID() + '"></div>';
    },
    initHTML: function() {
      this.SUPER();
      this.update();
    }
  },

  listeners: [
    {
      name: "update",
      animate: true,
      code: function() {
        if ( ! this.$ ) return;
        var self = this;

        this.dao.select()(function(objs) {
          if ( ! self.$ ) { self.destroy(); return; }

          self.$.innerHTML = '';
          var children = new Array(objs.length);

          for ( var i = 0; i < objs.length; i++ ) {
            var view = self.view.create();
            children[i] = view;
            view.value = SimpleValue.create(objs[i]);
          }

          self.$.innerHTML = children.map(function(c) { return c.toHTML(); }).join('');
          children.forEach(function(c) { c.initHTML(); });
        });
      }
    }
  ]
});


FOAModel({
  name: 'AutocompleteListView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'dao',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.unlisten(this.paint);
        newValue.listen(this.paint);
        this.value.set('');
        this.paint();
      },
      hidden: true
    },
    {
      name: 'value',
      hidden: true,
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name: 'model',
      hidden: true
    },
    {
      name: 'innerView',
      type: 'AbstractView',
      preSet: function(value) {
        if ( typeof value === "string" ) value = GLOBAL[value];
        return value;
      },
      defaultValueFn: function() {
        return this.model.listView;
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'objs'
    },
    {
      model_: 'IntegerProperty',
      name: 'selection',
      defaultValue: 0,
      postSet: function(oldValue, newValue) {
        this.value.set(this.objs[newValue]);
        if ( this.$ ) {
          if ( this.$.children[oldValue] )
            this.$.children[oldValue].className = 'autocompleteListItem';
          this.$.children[newValue].className += ' autocompleteSelectedItem';
        }
      }
    },
    {
      model_: 'IntegerProperty',
      name: 'count',
      defaultValue: 20
    },
    {
      model_: 'IntegerProperty',
      name: 'left'
    },
    {
      model_: 'IntegerProperty',
      name: 'top'
    },
  ],

  methods: {
    setValue: function(value) {
      this.value = value;
    },

    initHTML: function() {
      this.SUPER();
      this.$.style.display = 'none';
      var self = this;
      this.propertyValue('left').addListener(function(v) {
        self.$.left = v;
      });
      this.propertyValue('top').addListener(function(v) {
        self.$.top = v;
      });
    },

    nextSelection: function() {
      if ( this.objs.length === 0 ) return;
      var next = this.selection + 1;
      if ( next >= this.objs.length )
        next = 0;
      this.selection = next;
    },

    prevSelection: function() {
      if ( this.objs.length === 0 ) return;
      var next = this.selection - 1;
      if ( next < 0 )
        next = this.objs.length - 1;
      this.selection = next;
    }
  },

  templates: [
    {
      name: 'toHTML',
      template: '<ul class="autocompleteListView" id="<%= this.getID() %>"></ul>'
    }
  ],

  listeners: [
    {
      name: 'paint',
      isAnimated: true,
      code: function() {
        if ( ! this.$ ) return;

        // TODO Determine if its worth double buffering the dom.
        var objs = [];
        var newSelection = 0;
        var value = this.value.get();
        var self = this;

        this.dao.limit(this.count).select({
          put: function(obj) {
            objs.push(obj);
            if ( obj.id === value.id )
              newSelection = objs.length - 1;
          },
          eof: function() {
            // Clear old list
            self.$.innerHTML = '';
            self.objs = objs;

            if ( objs.length === 0 ) {
              self.$.style.display = 'none';
              return;
            }

            for ( var i = 0; i < objs.length; i++ ) {
              var obj = objs[i];
              var view = self.innerView.create({});
              var container = document.createElement('li');
              container.onclick = (function(index) {
                return function(e) {
                  self.selection = index;
                  self.publish('selected');
                };
              })(i);
              container.className = 'autocompleteListItem';
              self.$.appendChild(container);
              view.value.set(obj);
              container.innerHTML = view.toHTML();
              view.initHTML();
            }

            self.selection = newSelection;
            self.$.style.display = '';
          }
        });
      }
    }
  ]
});

FOAModel({
  name: 'ViewSwitcher',
  extendsModel: 'AbstractView',

  help: 'A view which cycles between an array of views.',

  properties: [
    {
      name: 'views',
      valueFactory: function() { return []; },
      postSet: function() {
        this.viewIndex = this.viewIndex;
      },
    },
    {
      name: 'value',
      postSet: function(old, nu) {
        this.activeView.value = nu;
      }
    },
    {
      name: 'activeView',
      postSet: function(old, nu) {
        if ( old ) {
          old.unsubscribe('nextview', this.onNextView);
          old.unsubscribe('prevview', this.onPrevView);
        }
        nu.subscribe('nextview', this.onNextView);
        nu.subscribe('prevview', this.onPrevView);
        if ( this.value ) nu.value = this.value;
      }
    },
    {
      model_: 'IntegerProperty',
      name: 'viewIndex',
      preSet: function(value) {
        if ( value >= this.views.length ) return 0;
        if ( value < 0 ) return this.views.length - 1;
        return value;
      },
      postSet: function() {
        this.activeView = this.views[this.viewIndex];
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.getID() + '" style="display:none"></div>' + this.toInnerHTML();
    },

    updateHTML: function() {
      if ( ! this.$ ) return;
      this.$.nextElementSibling.outerHTML = this.toInnerHTML();
      this.initInnerHTML();
    },

    toInnerHTML: function() {
      return this.activeView.toHTML();
    },

    initInnerHTML: function() {
      this.activeView.initInnerHTML();
    }
  },

  listeners: [
    {
      name: 'onNextView',
      code: function() {
        this.viewIndex = this.viewIndex + 1;
        this.updateHTML();
      }
    },
    {
      name: 'onPrevView',
      code: function() {
        this.viewIndex = this.viewIndex - 1;
        this.updateHTML();
      }
    }
  ]
});


FOAModel({
  name: 'SearchView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'model'
    }
  ],

  methods: {
    toInnerHTML: function() {
      var str = ""
      var props = this.model.searchProperties;
      for ( var i = 0; i < props.length; i++ ) {
        var view = GroupBySearchView.create({
          dao: this.dao,
          property: this.model[props[i].constantize()]
        });
        str += view.toHTML();
        this.addChild(view);
      }
      return str;
    }
  }
});


FOAModel({
  name: 'DAOListController',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'dao',
      postSet: function(oldDAO, newDAO) {
        this.X.DAO = newDAO;
        if ( oldDAO ) oldDAO.unlisten(this.onDAOUpdate);
        newDAO.listen(this.onDAOUpdate);
        this.updateHTML();
      }
    },
    { name: 'rowView' }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X = this.X.sub();
    },

    initHTML: function() {
      // this.SUPER();
      this.updateHTML();
    },

    updateHTML: function() {
      if ( ! this.dao || ! this.$ ) return;

      var out = '';

      this.dao.select({put: function(o) {
        o = o.clone();
        var view = this.rowView.create({value: SimpleValue.create(o), model: o.model_}, this.X);
        // TODO: Something isn't working with the Context, fix
        view.DAO = this.dao;
        o.addListener(function() {
          this.dao.put(o);
        }.bind(this, o));
        this.addChild(view);
        out += view.toHTML();
      }.bind(this)})(function() {
        console.log('DONE');
        this.$.innerHTML = out;
        this.initInnerHTML();
      }.bind(this));
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function() { this.updateHTML(); }
    }
  ]
});
