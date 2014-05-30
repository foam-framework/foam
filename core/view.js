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

// TODO: used in saturnmail/bg.js, see if can be merged with Action keyboard support.
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
      var e = fs[i];
      // console.log(e.getAttribute('model'), e.getAttribute('view'));
      GLOBAL[e.getAttribute('view')];
      GLOBAL[e.getAttribute('model')];
    }
    var models = [];
    for ( var key in USED_MODELS ) {
      models.push(arequire(key));
    }

    aseq(apar.apply(null, models), function(ret) {
      for ( var i = 0 ; i < fs.length ; i++ ) {
        this.initElement(fs[i], X.document);
      }
    }.bind(this))();
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

    var args = {};
    var modelName = e.getAttribute('model');
    var model = GLOBAL[modelName];

    if ( ! model ) {
      console.error('Unknown Model: ', modelName);
      e.outerHTML = 'Unknown Model: ' + modelName;
      return;
    }

    // This is because of a bug that the model.properties isn't populated
    // with the parent model's properties until after the prototype is
    // created.  TODO: remove after FO
    model.getPrototype();

    for ( var i = 0 ; i < e.attributes.length ; i++ ) {
      var a   = e.attributes[i];
      var key = a.name;
      var val = a.value;
      var p   = model.getProperty(key);

      if ( p ) {
        if ( val.startsWith('#') ) {
          val = val.substring(1);
          val = $(val);
        }
        args[key] = val;
      } else {
        if ( ! {model:true, view:true, id:true, oninit:true}[key] ) {
          console.log('unknown attribute: ', key);
        }
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
      if ( View.isInstance(obj) || CView.isInstance(obj) ) {
        view = obj;
      } else {
        var viewName = e.getAttribute('view');
        var viewModel = viewName ? GLOBAL[viewName] : DetailView;
        view = viewModel.create({model: model, value: SimpleValue.create(obj)});
        if ( ! viewName ) view.showActions = true;
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


window.addEventListener('load', function() { DOM.init(X); }, false);


// TODO: document and make non-global
/** Convert a style size to an Int.  Ex. '10px' to 10. **/
function toNum(p) { return p.replace ? parseInt(p.replace('px','')) : p; };


// ??? Should this have a 'data' property?
// Or maybe a DataView and ModelView
FOAModel({
  name: 'View',
  label: 'View',

  properties: [
    {
      name:  'id',
      label: 'Element ID',
      type:  'String',
      factory: function() { return this.nextID(); }
    },
    {
      name:  'parent',
      type:  'View',
      hidden: true
    },
    {
      name:  'children',
      type:  'Array[View]',
      factory: function() { return []; }
    },
    {
      name:   'shortcuts',
      type:   'Array[Shortcut]',
      factory: function() { return []; }
    },
    {
      name:   '$',
      hidden: true,
      mode:   "read-only",
      getter: function() { return $(this.id); },
      help:   'DOM Element.'
    },
    {
      name: 'tagName',
      defaultValue: 'span'
    },
    {
      name: 'className',
      defaultValue: ''
    }
  ],

  methods: {
    // TODO: Model as Topics
    ON_HIDE: ['onHide'], // Indicates that the View has been hidden
    ON_SHOW: ['onShow'], // Indicates that the View is now being reshown

    deepPublish: function(topic) {
      var count = this.publish.apply(this, arguments);

      if ( this.children ) {
        for ( var i = 0 ; i < this.children.length ; i++ ) {
          var child = this.children[i];
          count += child.deepPublish.apply(child, arguments);
        }
      }

      return count;
    },

    strToHTML: function(str) {
      return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    cssClassAttr: function() {
      return this.className ? ' class="' + this.className + '"' : '';
    },

    dynamicTag: function(tagName, f) {
      var id = this.nextID();
      Events.dynamic(function() {
        var html = f();
        var e = $(id);
        if ( e ) e.innerHTML = html;
      }.bind(this));
      return '<' + tagName + ' id="' + id + '"></' + tagName + '>';
    },

    /** Bind a sub-View to a sub-Value. **/
    bindSubView: function(view, prop) {
      view.setValue(this.propertyValue(prop.name));
    },

    viewModel: function() { return this.model_; },

    /** Create the sub-view from property info. **/
    createView: function(prop, opt_args) {
      var v = this.X.PropertyView.create({prop: prop, args: opt_args});
      this.addChild(v);
      return v;
    },

    createTemplateView: function(name, opt_args) {
      var o = this.viewModel()[name];
      if ( o ) return Action.isInstance(o) ?
        this.X.ActionButton.create({action: o, value: this.value}).copyFrom(opt_args) :
        this.createView(o, opt_args);

      o = this.model_[name];
      return Action.isInstance(o) ?
        this.X.ActionButton.create({action: o, value: SimpleValue.create(this)}).copyFrom(opt_args) :
        this.createView(o, opt_args);
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

    addInitializer: function(f) {
      (this.initializers_ || (this.initializers_ = [])).push(f);
    },

    on: function(event, listener, opt_id) {
      opt_id = opt_id || this.nextID();
      listener = listener.bind(this);

      this.addInitializer(function() {
        var e = $(opt_id);
        // if ( ! e ) console.log('Error Missing element for id: ' + opt_id + ' on event ' + event);
        if ( e ) e.addEventListener(event, listener.bind(this), false);
      });

      return opt_id;
    },

    setAttribute: function(attributeName, valueFn, opt_id) {
      opt_id = opt_id || this.nextID();
      valueFn = valueFn.bind(this);
      this.addInitializer(function() {
        Events.dynamic(valueFn, function() {
          var e = $(opt_id);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          var newValue = valueFn(e.getAttribute(attributeName));
          if ( newValue == undefined ) e.removeAttribute(attributeName);
          else e.setAttribute(attributeName, newValue);
        })
      });
    },

    setClass: function(className, predicate, opt_id) {
      opt_id = opt_id || this.nextID();
      predicate = predicate.bind(this);

      this.addInitializer(function() {
        Events.dynamic(predicate, function() {
          var e = $(opt_id);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          DOM.setClass(e, className, predicate());
        });
      });

      return opt_id;
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
      return '<' + this.tagName + ' id="' + this.id + '"' + this.cssClassAttr() + '>' +
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
            console.log("Error on View.child.initHTML", x, x.stack);
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
  name: 'PropertyView',

  extendsModel: 'View',

  properties: [
    {
      name: 'prop',
      type: 'Property'
    },
    {
      name: 'parent',
      type: 'View',
      postSet: function(_, p) {
        p[this.prop.name + 'View'] = this.view;
        if ( ! this.data ) {
          // TODO: replace with just 'p.data' when data-binding done
          this.data = p.data || ( p.get && p.get() );
        }
        if ( this.view ) this.view.parent = p;
      }
    },
    {
      name: 'data',
      postSet: function() { this.bindData(); }
    },
    {
      name: 'innerView',
      help: 'Override for prop.view'
    },
    {
      name: 'view',
      type: 'View'
    },
    'args'
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      if ( this.args && this.args.model_ ) {
        var view = this.X[this.args.model_].create(this.prop);
        delete this.args.model_;
      } else {
        view = this.createViewFromProperty(this.prop);
      }

      view.copyFrom(this.args);
      view.parent = this.parent;

      this.view = view;
      this.bindData();
    },
    createViewFromProperty: function(prop) {
      var viewName = this.innerView || prop.view
      if ( ! viewName ) return TextFieldView.create(prop);
      if ( typeof viewName === 'string' ) return this.X[viewName].create(prop);
      if ( viewName.model_ && typeof viewName.model_ === 'string' ) return FOAM(prop.view);
      if ( viewName.model_ ) return viewName.deepClone().copyFrom(prop);
      if ( typeof viewName === 'function' ) return viewName(prop, this);

      return viewName.create(prop);
    },
    bindData: function() {
      var view = this.view;
      var data = this.data;
      if ( ! view || ! data ) return;

      var pValue = data.propertyValue(this.prop.name);
      if ( view.model_.DATA ) {
        // When all views are converted to data-binding,
        // only this method will be supported.
        Events.link(pValue, view.data$);
      } else if ( view.setValue ) {
        view.setValue(pValue);
      } else {
        view.value = pValue;
      }
    },
    toHTML: function() { return this.view.toHTML(); },
    initHTML: function() { this.view.initHTML(); }
  }
});


FOAModel({
  name: 'PopupView',

  extendsModel: 'View',

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
      if ( this.$ ) return;
      var document = (e.$ || e).ownerDocument;
      var div      = document.createElement('div');
      div.style.left = this.x + 'px';
      div.style.top = this.y + 'px';
      if ( this.width ) div.style.width = this.width + 'px';
      if ( this.height ) div.style.height = this.height + 'px';
      div.style.position = 'absolute';
      div.id = this.id;
      div.innerHTML = this.view.toHTML();

      document.body.appendChild(div);
      this.view.initHTML();
    },
    close: function() {
      this.$ && this.$.remove();
    },
    destroy: function() {
      this.close();
      this.view.destroy();
    }
  }
});

FOAModel({
  name: 'AutocompletePopup',
  extendsModel: 'PopupView',
  help: 'A popup view that only renders if the count is >0',

  properties: [
    {
      model_: 'DAOProperty',
      name: 'dao'
    }
  ],

  methods: {
    open: function(e, opt_delay) {
      if ( this.$ ) { this.position(this.$, e.$ || e); return; }

      var parentNode = e.$ || e;
      var document = parentNode.ownerDocument;
      var div      = document.createElement('div');

      this.position(div, parentNode);

      div.id = this.id;
      div.innerHTML = this.view.toHTML();

      document.body.appendChild(div);
      this.view.initHTML();
    },

    position: function(div, parentNode) {
      var document = parentNode.ownerDocument;

      if ( this.x || this.y ) {
        div.style.left = this.x + 'px';
        div.style.top = this.y + 'px';
      } else {
        var pos = findPageXY(parentNode);
        var pageWH = [document.firstElementChild.offsetWidth, document.firstElementChild.offsetHeight];

        div.style.left = pos[0];

        if ( pageWH[1] - (pos[1] + parentNode.offsetHeight) < (this.height || 400) ) {
          div.style.bottom = document.defaultView.innerHeight - pos[1];
        } else {
          div.style.top = pos[1] + parentNode.offsetHeight;
        }
      }

      if ( this.width ) div.style.width = this.width + 'px';
      if ( this.height ) div.style.height = this.height + 'px';
      div.style.position = 'absolute';
    },

    init: function(args) {
      this.SUPER(args);
      this.dao.listen(this.autocomplete);
    }
  },

  listeners: [
    {
      name: 'autocomplete',
      code: function() {
        this.dao.select(COUNT())((function(c) {
          if ( c.count === 0 ) {
            this.close();
            return;
          }
          this.open(this.parent);
          this.view.dao = this.dao;
        }).bind(this));
      }
    }
  ]
});

FOAModel({
  name: 'StaticHTML',
  extendsModel: 'View',
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
    if ( this.element[this.property] !== value )
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

  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && Events.unfollow(oldValue, this.domValue);
        Events.follow(newValue, this.domValue);
      }
    },
    {
      // TODO: make 'data' be the actual source of the data
      name: 'data',
      setter: function(d) { this.value = SimpleValue.create(d); }
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
    setValue: function(value) { this.value = value; },
    toHTML: function() {
      return '<img class="imageView" id="' + this.id + '">';
    },
    isSupportedUrl: function(url) {
      url = url.trim().toLowerCase();
      return url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('filesystem:');
    },
    initHTML: function() {
      this.SUPER();

      if ( window.chrome && window.chrome.app && window.chrome.app.runtime && ! this.isSupportedUrl(this.value.get()) ) {
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

  extendsModel: 'View',

  help: 'Image view for rendering a blob as an image.',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.onValueChange);
        newValue.addListener(this.onValueChange);
      }
    },
    {
      model_: 'IntProperty',
      name: 'displayWidth'
    },
    {
      model_: 'IntProperty',
      name: 'displayHeight'
    }
  ],

  methods: {
    setValue: function(value) {
      this.value = value;
    },

    toHTML: function() {
      return '<img id="' + this.id + '">';
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


FOAModel({
  name:  'TextFieldView',
  label: 'Text Field',

  extendsModel: 'View',

  properties: [
    {
      model_: 'StringProperty',
      name:  'name',
      defaultValue: 'field'
    },
    {
      model_: 'IntProperty',
      name:  'displayWidth',
      defaultValue: 30
    },
    {
      model_: 'IntProperty',
      name:  'displayHeight',
      defaultValue: 1
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
      model_: 'StringProperty',
      name:  'mode',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); }
      }
    },
    {
      name: 'domValue'
    },
    {
      name: 'data'
    },
    {
      model_: 'StringProperty',
      name: 'readWriteTagName',
      defaultValueFn: function() {
        return this.displayHeight === 1 ? 'input' : 'textarea';
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'autocomplete',
      defaultValue: true
    },
    'autocompleter',
    'autocompleteView',
  ],

  methods: {
    /** Escape topic published when user presses 'escape' key to abort edits. **/
    // TODO: Model as a 'Topic'
    ESCAPE: ['escape'],

    toHTML: function() {
      return this.mode === 'read-write' ?
        this.toReadWriteHTML() :
        this.toReadOnlyHTML()  ;
    },

    toReadWriteHTML: function() {
      var str = '<' + this.readWriteTagName + ' id="' + this.id + '"';
      str += ' type="' + this.type + '" ' + this.cssClassAttr();

      str += this.readWriteTagName === 'input' ?
        ' size="' + this.displayWidth + '"' :
        ' rows="' + this.displayHeight + '" cols="' + this.displayWidth + '"';

      str += ' name="' + this.name + '">';
      str += '</' + this.readWriteTagName + '>';
      return str;
    },

    toReadOnlyHTML: function() {
      return '<' + this.tagName + ' id="' + this.id + '"' + this.cssClassAttr() + ' name="' + this.name + '"></' + this.tagName + '>';
    },

    setupAutocomplete: function() {
      if ( ! this.autocomplete || ! this.autocompleter ) return;

      var proto = FOAM.lookup(this.autocompleter, this.X);
      var completer = proto.create();
      this.autocompleteView = AutocompletePopup.create({
        dao: completer.autocompleteDao,
        view: DAOListView.create({
          dao: completer.autocompleteDao,
          mode: 'final',
          rowView: 'SummaryView',
          useSelection: true
        })
      });
      this.addChild(this.autocompleteView);

      this.autocompleteView.view.selection$.addListener((function(_, _, _, obj) {
        this.data = completer.f.f ? completer.f.f(obj) : completer.f(obj);
      }).bind(this));

      var self = this;
      this.$.addEventListener('input', function() {
        completer.autocomplete(self.textToValue(self.$.value));;
      });
      this.$.addEventListener('focus', function() {
        completer.autocomplete(self.data);
      });
      this.$.addEventListener('blur', this.animate(this.delay(200, this.animate(this.animate(function() { self.autocompleteView.close(); })))));
    },

    initHTML: function() {
      this.SUPER();

      if ( this.placeholder ) this.$.placeholder = this.placeholder;

      if ( this.mode === 'read-write' ) {
        this.domValue = DomValue.create(
          this.$,
          this.onKeyMode ? 'input' : 'change');

        Events.relate(
          this.data$,
          this.domValue,
          this.valueToText.bind(this),
          this.textToValue.bind(this));

        this.$.addEventListener('keydown', this.onKeyDown);
        this.setupAutocomplete();
      } else {
        this.domValue = DomValue.create(
          this.$,
          'undefined',
          this.escapeHTML ? 'textContent' : 'innerHTML');

        Events.map(
          this.data$,
          this.domValue,
          this.valueToText.bind(this))
      }
    },

    textToValue: function(text) { return text; },

    valueToText: function(value) { return value; },

    destroy: function() { Events.unlink(this.domValue, this.data$); }
  },

  listeners: [
    {
      name: 'onKeyDown',
      code: function(e) {
        if ( e.keyCode == 27 /* ESCAPE KEY */ ) {
          this.domValue.set(this.data);
          this.publish(this.ESCAPE);
        }
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
      this.domValue = DomValue.create(this.$, undefined, 'valueAsDate');
      Events.link(this.data$, this.domValue);
    }
  }
});


FOAModel({
  name:  'DateTimeFieldView',
  label: 'Date-Time Field',

  extendsModel: 'View',

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
      factory: function() { return SimpleValue.create(new Date()); },
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
        '<input id="' + this.id + '" type="datetime-local" name="' + this.name + '"/>' :
        '<span id="' + this.id + '" name="' + this.name + '"></span>' ;
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

  extendsModel: 'View',

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
      factory: function() { return SimpleValue.create(); },
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
      var s = '<' + this.tag + ' id="' + this.id + '"';
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
      this.domValue = DomValue.create(e, undefined, 'innerHTML');
      this.setValue(this.value);
    },

    destroy: function() { Events.unlink(this.domValue, this.value); }
  }
});


FOAModel({
  name:  'RoleView',

  extendsModel: 'View',

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
      factory: function() { return SimpleValue.create(); }
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

      str += '<select id="' + this.id + '" name="' + this.name + '" size=' + this.size + '/>';
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

  extendsModel: 'View',

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
      return '<input type="checkbox" id="' + this.id + '" name="' + this.name + '"' + this.cssClassAttr() + '/>';
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

  extendsModel: 'View',

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
      var id = this.id;
 // TODO: next line appears slow, check why
      this.on('click', this.onClick, id);
      return this.name ?
        '<img id="' + id + '" ' + this.cssClassAttr() + '" name="' + this.name + '">' :
        '<img id="' + id + '" ' + this.cssClassAttr() + '>' ;
    },
    initHTML: function() {
      if ( ! this.$ ) return;
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
  name:  'CSSImageBooleanView',

  extendsModel: 'View',

  properties: [
    'trueClassName',
    'falseClassName',
    {
      name: 'className',
      getter: function() { return this.data ? this.trueClassName : this.falseClassName; }
    }
  ],

  methods: {
    initHTML: function() {
      this.data$.addListener(this.update);
      this.$.addEventListener('click', this.onClick);
    },
    toInnerHTML: function() { return '&nbsp;&nbsp;&nbsp;'; }
  },

  listeners: [
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;
        DOM.setClass(this.$, this.trueClassName,    this.data);
        DOM.setClass(this.$, this.falseClassName, ! this.data);
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        e.stopPropagation();
        this.data = ! this.data;
        this.update();
      }
    }
  ]
});


FOAModel({
  name:  'ImageBooleanView2',

  extendsModel: 'View',

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
      return '<img id="' + this.id + '" name="' + this.name + '">';
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

  extendsModel: 'TextFieldView',

  label: 'Text-Area View',

  properties: [
    {
      model_: 'IntProperty',
      name:  'displayHeight',
      defaultValue: 5
    },
    {
      model_: 'IntProperty',
      name:  'displayWidth',
      defaultValue: 70
    }
  ]
});


FOAModel({
  name:  'FunctionView',

  extendsModel: 'TextFieldView',

  properties: [
    {
      name: 'onKeyMode',
      defaultValue: true
    },
    {
      name: 'displayWidth',
      defaultValue: 80
    },
    {
      name: 'displayHeight',
      defaultValue: 8
    },
    {
      name: 'errorView',
      factory: function() { return TextFieldView.create({mode:'read-only'}); }
    }
  ],

  methods: {
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
      this.errorView.data = err || "";
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


/** A display-only summary view. **/
FOAModel({
  name: 'SummaryView',

  extendsModel: 'View',

  properties: [
    {
      name:  'model',
      type:  'Model'
    },
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(); }
    }
  ],

  methods: {
    getValue: function() {
      return this.value;
    },

    toHTML: function() {
      return (this.model.getPrototype().toSummaryHTML || this.defaultToHTML).call(this);
    },

    defaultToHTML: function() {
      this.children = [];
      var model = this.model;
      var obj   = this.get();
      var out   = [];

      out.push('<div id="' + this.id + '" class="summaryView">');
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

  extendsModel: 'View',

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

      out.push('<div id="' + this.id + '" class="helpView">');

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
          var subModel = this.X[prop.subType];
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
  name: 'EditColumnsView',

  extendsModel: 'View',

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
      var s = '<span id="' + this.id + '" class="editColumnView" style="position: absolute;right: 0.96;background: white;top: 138px;border: 1px solid black;">'

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

  extendsModel: 'View',

  properties: [
    {
      name:  'action',
      postSet: function(old, nu) {
        old && old.removeListener(this.render)
        nu.addListener(this.render);
      }
    },
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(); }
    },
    {
      name: 'className',
      factory: function() { return 'actionButton actionButton-' + this.action.name; }
    },
    {
      name: 'tagName',
      defaultValue: 'button'
    },
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() { return this.action.iconUrl; }
    }
  ],

  listeners: [
    {
      name: 'render',
      isAnimated: true,
      code: function() { this.updateHTML(); }
    }
  ],

  methods: {
    toHTML: function() {
      var self = this;
      var value = self.value.get();

      this.on('click', function() {
        self.action.callIfEnabled(self.value.get());
      }, this.id);

      this.setAttribute('data-tip', function() {
        return self.action.help || undefined;
      }, this.id);

      this.setAttribute('disabled', function() {
        var value = self.value.get();
        return self.action.isEnabled.call(value, self.action) ? undefined : 'disabled';
      }, this.id);

      Events.dynamic(function() { self.action.labelFn.call(value, self.action); self.updateHTML(); });

      return this.SUPER();
    },

    toInnerHTML: function() {
      var out = '';

      if ( this.iconUrl ) {
        out += '<img src="' + XMLUtil.escapeAttr(this.action.iconUrl) + '">';
      }

      if ( this.showLabel ) {
        var value = this.value.get();
        out += value ? this.action.labelFn.call(value, this.action) : this.action.label;
      }

      return out;
    }
  }
});


FOAModel({
  name: 'ActionLink',

  extendsModel: 'ActionButton',

  properties: [
    {
      name: 'className',
      factory: function() { return 'actionLink actionLink-' + this.action.name; }
    },
    {
      name: 'tagName',
      defaultValue: 'a'
    }
  ],

  methods: {
    toHTML: function() {
      this.setAttribute('href', function() { return '#' }, this.id);
      return this.SUPER();
    },

    toInnerHTML: function() {
      if ( this.action.iconUrl ) {
        return '<img src="' + XMLUtil.escapeAttr(this.action.iconUrl) + '" />';
      }

      if ( this.action.showLabel ) {
        var value = this.value.get();
        return value ? this.action.labelFn.call(value, this.action) : this.action.label;
      }
    }
  }
});


// TODO: ActionBorder should use this.
FOAModel({
  name:  'ToolbarView',
  label: 'Toolbar',

  extendsModel: 'View',

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
      factory: function() { return SimpleValue.create(); },
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

      str += '<div id="' + this.id + '" class="' + cls + '">';

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
      }.bind(this), this.id);
      this.addShortcut('Left', function(e) {
        var i = 0;
        for (; i < this.children.length; ++i) {
          if (e.target == this.children[i].$)
            break;
        }
        i = (i + this.children.length - 1) % this.children.length;
        this.children[i].$.focus();
      }.bind(this), this.id);
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

/** Add Action Buttons to a decorated View. **/
/* TODO:
   These are left over Todo's from the previous ActionBorder, not sure which still apply.

   The view needs a standard interface to determine it's Model (getModel())
   listen for changes to Model and change buttons displayed and enabled
   isAvailable
*/
FOAModel({
  name: 'ActionBorder',

  properties: [
    {
      name: 'actions'
    },
    {
      name: 'value'
    }
  ],

  methods: {
    toHTML: function(border, delegate, args) {
      var str = "";
      str += delegate.apply(this, args);
      str += '<div class="actionToolbar">';
      var actions = border.actions || this.model.actions;
      for ( var i = 0 ; i < actions.length; i++ ) {
        var action = actions[i];
        var button = ActionButton.create({ action: action });
        if ( border.value )
          button.value$ = border.value$
        else if ( this.value )
          button.value$ = this.value$;
        else
          button.value = SimpleValue.create(this);
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

  extendsModel: 'View',

  properties: [
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(); }
    }
  ],

  methods: {

    toHTML: function() {
      return '<progress value="25" id="' + this.id + '" max="100" >25</progress>';
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
    var view = DAOController.create({
      model: GLOBAL[prop.subType]
    });
    return view;
  }
};


FOAModel({
  name: 'GridView',

  extendsModel: 'View',

  properties: [
    {
      name:  'row',
      type: 'ChoiceView',
      factory: function() { return ChoiceView.create(); }
    },
    {
      name:  'col',
      label: 'column',
      type: 'ChoiceView',
      factory: function() { return ChoiceView.create(); }
    },
    {
      name:  'acc',
      label: 'accumulator',
      type: 'ChoiceView',
      factory: function() { return ChoiceView.create(); }
    },
    {
      name:  'accChoices',
      label: 'Accumulator Choices',
      type: 'Array',
      factory: function() { return []; }
    },
    {
      name:  'scrollMode',
      type:  'String',
      defaultValue: 'Bars',
      view: { model_: 'ChoiceView', choices: [ 'Bars', 'Warp' ] }
    },
    {
      name:  'model',
      type: 'Model'
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      postSet: function() { this.updateHTML(); }
    },
    {
      name:  'grid',
      type:  'GridByExpr',
      factory: function() { return GridByExpr.create(); }
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
      this.grid.xFunc = this.col.data || this.grid.xFunc;
      this.grid.yFunc = this.row.data || this.grid.yFunc;
      this.grid.acc   = this.acc.data || this.grid.acc;

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
      // TODO: I think this should be done automatically some-how/where.
      this.scrollModeView.data$ = this.scrollMode$;

      var choices = [];
      this.model.properties.orderBy(Property.LABEL).select({put: function(p) {
        choices.push([p, p.label]);
      }});
      this.row.choices = choices;
      this.col.choices = choices;

      this.acc.choices = this.accChoices;

      this.row.initHTML();
      this.col.initHTML();
      this.acc.initHTML();

      this.SUPER();

      this.row.data$.addListener(this.repaint_);
      this.col.data$.addListener(this.repaint_);
      this.acc.data$.addListener(this.repaint_);
      this.scrollMode$.addListener(this.repaint_);

      this.updateHTML();
    }
  },

  listeners: [
    {
      name: 'repaint_',
      isAnimated: true,
      code: function() { this.updateHTML(); }
    }
  ],

  templates:[
    /*
    {
      model_: 'Template',

      name: 'toHTML2',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %><br/></div>' +
        '<div id="<%= this.id%>" class="gridViewArea column" style="flex: 1 1 100%"></div>' +
        '</div>'
    },
    */
    {
      model_: 'Template',

      name: 'toHTML',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %> &nbsp;Scroll: $$scrollMode <br/></div>' +
        '<div id="<%= this.id%>" class="gridViewArea column" style="flex: 1 1 100%"></div>' +
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


// TODO: This should be replaced with a generic Choice.
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

  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create(''); }
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
        if ( this.$ && oldValue != viewChoice ) this.installSubView(viewChoice);
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
      str.push('<div class="altView column" id="' + this.id + '"> </div>');
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


// TODO: Currently this view is "eager": it renders all the child views.
// It could be made more lazy , and therefore more memory-efficient.
FOAModel({
  name: 'SwipeAltView',
  extendsModel: 'View',

  properties: [
    {
      name: 'views',
      type: 'Array[ViewChoice]',
      subType: 'ViewChoice',
      view: 'ArrayView',
      factory: function() { return []; },
      help: 'Child views'
    },
    {
      name:  'index',
      help: 'The index of the currently selected view',
      defaultValue: 0,
      preSet: function(old, nu) {
        if (nu < 0) return 0;
        if (nu >= this.views.length) return this.views.length - 1;
        return nu;
      },
      postSet: function(oldValue, viewChoice) {
        this.views[oldValue].view.deepPublish(this.ON_HIDE);
        // ON_SHOW is called after the animation is done.
        this.snapToCurrent();
      },
      hidden: true
    },
    {
      name: 'headerView',
      help: 'Optional View to be displayed in header.',
      factory: function() {
        return ChoiceListView.create({
          choices: this.views.map(function(x) {
            return x.label;
          }),
          index$: this.index$,
          className: 'swipeAltHeader foamChoiceListView horizontal'
        });
      }
    },
    {
      name: 'data',
      help: 'Generic data field for the views. Proxied to all the child views.',
      postSet: function(old, nu) {
        this.views.forEach(function(c) {
          c.view.data = nu;
        });
      }
    },
    {
      name: 'slider',
      help: 'Internal element which gets translated around',
      hidden: true
    },
    {
      name: 'width',
      help: 'Set when we know the width',
      hidden: true
    },
    {
      name: 'x',
      help: 'X coordinate of the translation',
      hidden: true,
      postSet: function(old, nu) {
        // TODO: Other browsers.
        this.slider.style['-webkit-transform'] = 'translate3d(-' +
            nu + 'px, 0, 0)';
      }
    },
    {
      name: 'touchStart',
      help: 'Coordinates (screen-relative) of the first touch',
      hidden: true
    },
    {
      name: 'touchLast',
      help: 'Last coordinates of an in-progress swipe',
      hidden: true
    },
    {
      name: 'touchStarted',
      model_: 'BooleanProperty',
      defaultValue: false,
      help: 'True if we received a touchstart',
      hidden: true
    },
    {
      name: 'touchLive',
      model_: 'BooleanProperty',
      defaultValue: false,
      help: 'True if a touch is currently active',
      hidden: true
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.views.forEach(function(choice, index) {
        if ( index != self.index )
          choice.view.deepPublish(self.ON_HIDE);
      });
    },

    // The general structure of the carousel is:
    // - An outer div (this.$), with position: relative.
    // - A second div (this.slider) with position: relative.
    //   This is the div that gets translated to and fro.
    // - A set of internal divs (this.slider.children) for the child views.
    //   These are positioned inside the slider right next to each other,
    //   and they have the same width as the outer div.
    //   At most two of these can be visible at a time.
    //
    // If the width is not set yet, this renders a fake carousel. It has the
    // outer, slider and inner divs, but there's only one inner div and it
    // can't slide yet. Shortly thereafter, the slide is expanded and the
    // other views are added. This should be imperceptible to the user.
    toHTML: function() {
      var str  = [];
      var viewChoice = this.views[this.index];

      if ( this.headerView ) {
        str.push(this.headerView.toHTML());
        this.addChild(this.headerView);
      }

      str.push('<div id="' + this.id + '" class="swipeAltOuter">');
      str.push('<div class="swipeAltSlider" style="width: 100%">');
      str.push('<div class="swipeAltInner" style="left: 0px">');

      str.push(viewChoice.view.toHTML());

      str.push('</div>');
      str.push('</div>');
      str.push('</div>');

      return str.join('');
    },

    initHTML: function() {
      if ( ! this.$ ) return;
      this.SUPER();

      // Now is the time to inflate our fake carousel into the real thing.
      // For now we won't worry about re-rendering the current one.
      // TODO: Stop re-rendering if it's slow or causes flicker or whatever.

      this.slider = this.$.children[0];
      this.width = this.$.clientWidth;

      var str = [];
      for ( var i = 0 ; i < this.views.length ; i++ ) {
        str.push('<div class="swipeAltInner">');
        str.push(this.views[i].view.toHTML());
        str.push('</div>');
      }

      this.slider.innerHTML = str.join('');

      window.addEventListener('resize', this.resize, false);

      this.$.addEventListener('touchstart', this.onTouchStart);
      this.$.addEventListener('touchmove', this.onTouchMove);
      this.$.addEventListener('touchend', this.onTouchEnd);

      // Wait for the new HTML to render first, then init it.
      var self = this;
      window.setTimeout(function() {
        self.resize();
        self.views.forEach(function(choice) {
          choice.view.initHTML();
        });
      }, 0);
    },

    getTouch: function(event) {
      var touches = event.touches && event.touches.length ?
          event.touches : [event];
      var e = (event.changedTouches && event.changedTouches[0]) ||
          (event.originalEvent && event.originalEvent.changedTouches &&
              event.originalEvent.changedTouches[0]) ||
          touches[0].originalEvent || touches[0];
      return { x: e.clientX, y: e.clientY };
    },

    snapToCurrent: function() {
      var self = this;
      Movement.animate(200, function(evt) {
        self.x = self.index * self.width;
      }, Movement.easeIn(0.2), function() {
        self.views[self.index].view.deepPublish(self.ON_SHOW);
      })();
    }
  },

  listeners: [
    {
      name: 'resize',
      code: function() {
        // When the orientation of the screen has changed, update the
        // left and width values of the inner elements and slider.
        this.width = this.$.clientWidth;
        var self = this;
        var frame = window.requestAnimationFrame(function() {
          self.x = self.index * self.width;

          for ( var i = 0 ; i < self.slider.children.length ; i++ ) {
            self.slider.children[i].style.left = (i * 100) + '%';
          }

          window.cancelAnimationFrame(frame);
        });
      }
    },
    {
      name: 'onTouchStart',
      code: function(event) {
        this.touchStart = this.getTouch(event);
        this.touchStarted = true;
        this.touchLive = false;
      }
    },
    {
      name: 'onTouchMove',
      code: function(event) {
        if ( ! this.touchStarted ) return;

        var touch = this.getTouch(event);
        var deltaX = Math.abs(this.touchStart.x - touch.x);
        var deltaY = Math.abs(this.touchStart.y - touch.y);
        if ( ! this.touchLive &&
            Math.sqrt(deltaX*deltaX + deltaY*deltaY) < 10 ) {
          // Prevent default, but don't decide if we're scrolling yet.
          event.preventDefault();
          return;
        }

        if ( ! this.touchLive && deltaX < deltaY ) {
          return;
        }

        // Otherwise the touch is live.
        this.touchLive = true;
        event.preventDefault();
        this.touchLast = touch;
        var x = this.index * this.width -
            (this.touchLast.x - this.touchStart.x);

        // Limit x to be within the scope of the slider: no dragging too far.
        if (x < 0) x = 0;
        var maxWidth = (this.views.length - 1) * this.width;
        if ( x > maxWidth ) x = maxWidth;

        this.x = x;
      }
    },
    {
      name: 'onTouchEnd',
      code: function(event) {
        if ( ! this.touchLive ) return;

        this.touchLive = false;

        var finalX = this.getTouch(event).x;
        if ( Math.abs(finalX - this.touchStart.x) > this.width / 3 ) {
          // Consider that a move.
          if (finalX < this.touchStart.x) {
            this.index++;
          } else {
            this.index--;
          }
        } else {
          this.snapToCurrent();
        }
      }
    }
  ]
});

FOAModel({
  name: 'GalleryView',
  extendsModel: 'SwipeAltView',

  properties: [
    {
      name: 'images',
      required: true,
      help: 'List of image URLs for the gallery',
      postSet: function(old, nu) {
        this.views = nu.map(function(src) {
          return ViewChoice.create({
            view: GalleryImageView.create({ source: src })
          });
        });
      }
    },
    {
      name: 'height',
      help: 'Optionally set the height'
    },
    {
      name: 'headerView',
      factory: function() { return null; }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      // Add an extra div to the outer one.
      // It's absolutely positioned at the bottom, and contains the circles.
      var circlesDiv = document.createElement('div');
      circlesDiv.classList.add('galleryCirclesOuter');
      for ( var i = 0 ; i < this.views.length ; i++ ) {
        var circle = document.createElement('div');
        //circle.appendChild(document.createTextNode('*'));
        circle.classList.add('galleryCircle');
        if ( this.index == i ) circle.classList.add('selected');
        circlesDiv.appendChild(circle);
      }

      this.$.appendChild(circlesDiv);
      this.$.classList.add('galleryView');
      this.$.style.height = this.height;

      this.index$.addListener(function(obj, prop, old, nu) {
        circlesDiv.children[old].classList.remove('selected');
        circlesDiv.children[nu].classList.add('selected');
      });
    }
  }
});

FOAModel({
  name: 'GalleryImageView',
  extendsModel: 'View',

  properties: [ 'source' ],

  methods: {
    toHTML: function() {
      return '<img class="galleryImage" src="' + this.source + '" />';
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
    textToValue: function(text) { return parseFloat(text) || "0.0"; }
  }
});


FOAModel({
  name:  'IntFieldView',

  extendsModel: 'TextFieldView',

  methods: {
    textToValue: function(text) { return parseInt(text) || "0"; },
    valueToText: function(value) { return value ? value : '0'; }
  }
});


FOAModel({
  name:  'StringArrayView',

  extendsModel: 'TextFieldView',

  methods: {
    textToValue: function(text) { return text.replace(/\s/g,'').split(','); },
    valueToText: function(value) { return value ? value.toString() : ""; }
  }
});


FOAModel({
  name: 'MultiLineStringArrayView',
  extendsModel: 'View',

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
      model_: 'IntProperty',
      name: 'displayWidth',
      defaultValue: 30
    },
    {
      model_: 'BooleanProperty',
      name: 'onKeyMode',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'autocomplete',
      defaultValue: true
    },
    {
      name: 'data'
    },
    'autocompleter',
    {
      model_: 'ArrayProperty',
      subType: 'MultiLineStringArrayView.RowView',
      name: 'inputs'
    }
  ],

  models: [
    {
      model_: 'Model',
      name: 'RowView',
      extendsModel: 'View',
      properties: [
        'field',
        {
          name: 'tagName',
          defaultValue: 'div'
        }
      ],
      methods: {
        toInnerHTML: function() {
          this.children = [this.field];
          return this.field.toHTML() + '<input type="button" id="' +
            this.on('click', (function(){ this.publish('remove'); }).bind(this)) +
            '" class="multiLineStringRemove" value="X">';
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      var toolbar = ToolbarView.create({
        value: SimpleValue.create(this)
      });
      toolbar.addActions([this.model_.ADD]);
      this.children = [toolbar];

      return '<div id="' + this.id + '"><div></div>' +
        toolbar.toHTML() +
        '</div>';
    },
    initHTML: function() {
      this.SUPER();
      this.data$.addListener(this.update);
      this.update();
    },
    row: function() {
      // TODO: Find a better way to copy relevant values as this is unsustainable.
      var view = this.model_.RowView.create({
        field: TextFieldView.create({
          name: this.name,
          type: this.type,
          displayWidth: this.displayWidth,
          onKeyMode: this.onKeyMode,
          autocomplete: this.autocomplete,
          autocompleter: this.autocompleter
        })
      });
      return view;
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

        var inputs = this.inputs;
        var inputElement = this.$.firstElementChild;
        var newViews = [];
        var data = this.data;

        // Add/remove rows as necessary.
        if ( inputs.length > data.length ) {
          for ( var i = data.length; i < inputs.length; i++ ) {
            inputs[i].$.remove();
            this.removeChild(inputs[i]);
          }
          inputs.length = data.length;
        } else {
          var extra = "";

          for ( i = inputs.length; i < data.length; i++ ) {
            var view = this.row();

            // TODO: This seems ridiculous.
            this.addChild(view);
            newViews.push(view);
            inputs.push(view);

            view.subscribe('remove', this.onRemove);
            view.field.data$.addListener(this.onInput);
            extra += view.toHTML();
          }

          if ( extra ) inputElement.insertAdjacentHTML('beforeend', extra);
        }

        // Only update the value for a row if it does not match.
        for ( i = 0; i < data.length; i++ ) {
          if ( inputs[i].field.data !== data[i] )
            inputs[i].field.data = data[i];
        }

        this.inputs = inputs;

        for ( i = 0; i < newViews.length; i++ )
          newViews[i].initHTML();
      }
    },
    {
      name: 'onRemove',
      code: function(src) {
        var inputs = this.inputs;
        for ( var i = 0; i < inputs.length; i++ ) {
          if ( inputs[i] === src ) {
            this.data = this.data.slice(0, i).concat(this.data.slice(i+1));
            break;
          }
        }
      }
    },
    {
      name: 'onInput',
      code: function(e) {
        if ( ! this.$ ) return;

        var inputs = this.inputs;
        var newdata = [];

        for ( var i = 0; i < inputs.length; i++ ) {
          newdata.push(inputs[i].field.data);
        }
        this.data = newdata;
      }
    }
  ],

  actions: [
    {
      name: 'add',
      label: 'Add',
      action: function() {
        this.data = this.data.pushF('');
      }
    }
  ]
});


FOAModel({
  extendsModel: 'View',

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
      this.view1 = DetailView.create();
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

  extendsModel: 'View',

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
      factory: function() { return SimpleValue.create({ value: [] }); },
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
  extendsModel: 'View',

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
      factory: function() {
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
      this.on('keydown', this.onKeyDown, this.id);
      this.on('blur', this.animate(this.delay(200, this.animate(this.animate(this.onBlur)))), this.id);
      this.on('focus', this.onInput, this.id);

      return '<input name="' + this.name + '" type="text" id="' + this.id + '" class="listInputView">' + this.autocompleteView.toHTML();
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

  extendsModel: 'View',

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
      factory: function() { return SimpleValue.create(); },
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
      this.on('click', this.onClick, this.id);

      return '<ul id="' + this.id + '" class="arrayTileView"><li class="arrayTileLastView">' +
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
  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create([]) },
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
      return '<div id="' + this.id + '"></div>';
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
  extendsModel: 'View',

  properties: [
    {
      name: 'innerValue',
      factory: function() { return SimpleValue.create(''); }
    },
    {
      name: 'value',
      factory: function() { return SimpleValue.create(""); },
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
      factory: function() { return GLOBAL[this.model.name + 'DAO']; }
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
  extendsModel: 'View',

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
      return '<div id="' + this.id + '"></div>';
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

  extendsModel: 'View',

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
      factory: function() { return SimpleValue.create(); }
    },
    {
      name: 'model',
      hidden: true
    },
    {
      name: 'innerView',
      type: 'View',
      preSet: function(_, value) {
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
      model_: 'IntProperty',
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
      model_: 'IntProperty',
      name: 'count',
      defaultValue: 20
    },
    {
      model_: 'IntProperty',
      name: 'left'
    },
    {
      model_: 'IntProperty',
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
      template: '<ul class="autocompleteListView" id="<%= this.id %>"></ul>'
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
  extendsModel: 'View',

  help: 'A view which cycles between an array of views.',

  properties: [
    {
      name: 'views',
      factory: function() { return []; },
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
      model_: 'IntProperty',
      name: 'viewIndex',
      preSet: function(_, value) {
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
      return '<div id="' + this.id + '" style="display:none"></div>' + this.toInnerHTML();
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
  name: 'PredicatedView',
  extendsModel: 'View',

  properties: [
    {
      name: 'predicate',
      defaultValueFn: function() { return TRUE; },
      postSet: function() { this.updateDAO(); }
    },
    {
      name: 'data',
      help: 'Payload of the view; assumed to be a DAO.',
      postSet: function() { this.updateDAO(); }
    },
    {
      name: 'view',
      required: true
    }
  ],

  methods: {
    init: function() {
      if ( typeof this.view === 'string' )
        this.view = FOAM.lookup(this.view);
      // Necessary for events and other things that walk the view tree.
      this.children = [this.view];
    },
    toHTML: function() {
      return this.view.toHTML();
    },
    initHTML: function() {
      this.view.initHTML();
    },
    updateDAO: function() {
      if ( this.data && this.data.where )
        this.view.data = this.data.where(this.predicate);
    }
  }
});


FOAModel({
  name: 'DAOListView',
  extendsModel: 'View',

  properties: [
    {
      name: 'dao',
      postSet: function(oldDAO, newDAO) {
        this.X.DAO = newDAO;
        if ( oldDAO ) oldDAO.unlisten(this.onDAOUpdate);
        if ( ! this.hidden ) {
          newDAO.listen(this.onDAOUpdate);
          this.updateHTML();
        }
      }
    },
    {
      name: 'hidden',
      postSet: function(old, nu) {
        if ( ! this.dao ) return;
        if ( nu ) this.dao.unlisten(this.onDAOUpdate);
        else {
          this.dao.listen(this.onDAOUpdate);
          this.updateHTML();
        }
      }
    },
    {
      name: 'data',
      setter: function(value) {
        this.value = SimpleValue.create(value);
      }
    },
    {
      name: 'value',
      setter: function(value) {
        this.dao = value.value;
        value.addListener(function() { this.dao = value.value; }.bind(this));
      }
    },
    { name: 'rowView', defaultValue: 'DetailView' },
    {
      name: 'mode',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); }
      }
    },
    { model_: 'BooleanProperty', name: 'useSelection', defaultValue: false },
    'selection',
    {
      name: 'chunkSize',
      defaultValue: 0,
      help: 'Number of entries to load in each infinite scroll chunk.'
    },
    {
      name: 'chunksLoaded',
      hidden: true,
      defaultValue: 1,
      help: 'The number of chunks currently loaded.'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X = this.X.sub();

      var self = this;
      this.subscribe(this.ON_HIDE, function() {
        self.hidden = true;
      });

      this.subscribe(this.ON_SHOW, function() {
        self.hidden = false;
      });
    },

    initHTML: function() {
      // this.SUPER();
      if ( ! this.hidden ) this.updateHTML();
    },

    updateHTML: function() {
      if ( ! this.dao || ! this.$ ) return;
      if ( this.painting ) return;
      this.painting = true;

      var out = [];
      var rowView = FOAM.lookup(this.rowView);

      this.children = [];
      this.initializers_ = [];

      var d = this.dao;
      if ( this.chunkSize ) {
        d = d.limit(this.chunkSize * this.chunksLoaded);
      }
      d.select({put: function(o) {
        if ( this.mode === 'read-write' ) o = o.clone();
        var view = rowView.create({value: SimpleValue.create(o), model: o.model_}, this.X);
        // TODO: Something isn't working with the Context, fix
        view.DAO = this.dao;
        if ( this.mode === 'read-write' ) {
          o.addListener(function() {
            this.dao.put(o);
          }.bind(this, o));
        }
        this.addChild(view);
        if ( this.useSelection ) {
          out.push('<div id="' + this.on('click', (function() {
            this.selection = o
          }).bind(this)) + '">');
        }
        out.push(view.toHTML());
        if ( this.useSelection ) {
          out.put('</div>');
        }
      }.bind(this)})(function() {
        this.$.innerHTML = out.join('');
        this.initInnerHTML();
        this.children = [];
        this.painting = false;
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


FOAModel({
  name: 'TouchListView',

  extendsModel: 'View',

  properties: [
    {
      model_: 'DAOProperty',
      name: 'dao'
    },
    {
      name: 'model'
    },
    {
      // TODO: Can we calculate this reliably?
      model_: 'IntProperty',
      name: 'rowViewHeight'
    },
    {
      model_: 'IntProperty',
      name: 'height'
    },
    {
      model_: 'IntProperty',
      name: 'scrollTop',
      defaultValue: 0,
      preSet: function(_, v) {
        if ( v < 0 ) return 0;
        return v;
      },
      postSet: function(old, nu) {
        this.scroll();
      }
    },
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.dao.listen(this.scroll);
    },
    toHTML: function() {
      var id = this.id;
      var overlay = this.nextID();
      var touch = this.X.TouchInput;
      touch.subscribe(touch.TOUCH_START, this.onTouchStart);
      touch.subscribe(touch.TOUCH_END, this.onTouchEnd);

      return '<div id="' + this.id + '" style="height:' + this.height + 'px;overflow:hidden;"><div id="' + overlay + '" style="z-index:1;position:absolute;height:' + this.height + ';width:100%"></div><div></div></div>';
    },
    formatObject: function(o) {
      var out = "";
      for ( var i = 0, prop; prop = this.model.properties[i]; i++ ) {
        if ( prop.summaryFormatter )
          out += prop.summaryFormatter(prop.f(o), o);
        else out += this.strToHTML(prop.f(o));
      }
      return out;
    },
    initHTML: function() {
      this.SUPER();
      this.scroll();
    }
  },

  listeners: [
    {
      name: 'scroll',
      code: function() {
        if ( ! this.$ ) return;

        var offset = -(this.scrollTop % this.rowViewHeight);
        var limit = Math.floor(this.height / this.rowViewHeight) + 2;
        var skip = Math.floor(this.scrollTop / this.rowViewHeight);
        var self = this;
        this.dao.skip(skip).limit(limit).select()(function(objs) {
          var out = "";
          for ( var i = 0; i < objs.length; i++ ) {
            out += '<div style="height:' + self.rowViewHeight + 'px;overflow:hidden">';
            out += self.formatObject(objs[i]);
            out += '</div>';
          }
          self.$.lastElementChild.innerHTML = out;
          self.$.lastElementChild.style.webkitTransform = "translate3d(0px, " + offset + "px, 0px)";
        });
      }
    },
    {
      name: 'onTouchStart',
      code: function(_, _, touch) {
        if ( ! this.touch ) this.touch = touch;
        var self = this;
        this.touch.y$.addListener(function(_, _, old, nu) {
          self.scrollTop = self.scrollTop + old - nu;
        });
      }
    },
    {
      name: 'onTouchEnd',
      code: function(_, _, touch) {
        if ( touch.id === this.touch.id ) {
          this.touch = '';
        }
      }
    },
  ]
});



FOAModel({
  name: 'UITestResultView',
  label: 'UI Test Result View',

  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    }
  ],

  methods: {
    initHTML: function() {
      var parent = this.parent;
      var test   = parent.obj;
      var $ = this.$;
      test.append = function(s) { $.insertAdjacentHTML('beforeend', s); };
      test.scope.render = function(v) {
        test.append(v.toHTML());
        v.initHTML();
      };
      // Temporarily remove sub-tests to prevent them from being tested also.
      // This means, that unlike regular UnitTests, UITests do not inherit
      // variables from their ancestors.
      var oldTests = test.tests;
      test.tests = [];
      test.test();
      test.tests = oldTests;
    }
  }
});


FOAModel({
  name: 'UITest',
  label: 'UI Test',

  extendsModel: 'UnitTest',

  properties: [
    {
      name: 'results',
      view: 'UITestResultView'
    }
  ],

  /*
  actions: [
    {
      name:  'test',
      action: function(obj) { }
    }
  ],
  */

  methods: {
    //atest: function() { return aconstant('output'); },
  }
});

FOAModel({
  name: 'TwoModeTextFieldView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function(_, value) {
        if ( this.$ ) this.$.textContent = value || this.placeholder;
      }
    },
    {
      name: 'placeholder'
    },
    { name: 'editView' },
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.editView = this.X.FullScreenTextFieldView.create(args);
    },
    initHTML: function() {
      this.SUPER();
      this.data = this.data;
    }
  },

  templates: [
    function toHTML() {/*
    <div id="<%= this.id %>" <%= this.cssClassAttr() %>></div>
    <%
      this.on('click', this.onClick, this.id);
      this.setClass('placeholder', (function() { return ! this.data }).bind(this), this.id);
    %>
    */}
  ],

  listeners: [
    {
      name: 'onClick',
      code: function() {
        this.editView.data = this.data;
        this.X.stack.pushView(this.editView);
        this.editView.data$.addListener(this.onDataSet);
      }
    },
    {
      name: 'onDataSet',
      code: function() {
        this.editView.data$.removeListener(this.onDataSet);
        this.data = this.editView.data;
        this.X.stack.back();
      }
    }
  ]
});

FOAModel({
  name: 'FullScreenTextFieldView',
  extendsModel: 'TextFieldView',

  methods: {
    setupAutocomplete: function() {
      if ( ! this.autocomplete || ! this.autocompleter ) return;

      var completer = FOAM.lookup(this.autocompleter, this.X).create();

      this.autocompleteView = DAOListView.create({
        dao: completer.autocompleteDao,
        mode: 'final',
        rowView: 'SummaryView',
        useSelection: true
      });
      this.addChild(this.autocompleteView);

      this.autocompleteView.selection$.addListener((function(_, _, _, obj) {
        this.data = completer.f.f ? completer.f.f(obj) : completer.f(obj);
      }).bind(this));
      this.$.addEventListener('input', (function() {
        completer.autocomplete(this.textToValue(this.$.value));
      }).bind(this));
    }
  }
});
