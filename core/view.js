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

var DOM = {
  /** Instantiate FOAM Objects in a document. **/
  init: function(X) {
    if ( ! X.document.FOAM_OBJECTS ) X.document.FOAM_OBJECTS = {};

    var fs = X.document.querySelectorAll('foam');
    var models = [];
    for ( var i = 0 ; i < fs.length ; i++ ) {
      var e = fs[i];
      // console.log(e.getAttribute('model'), e.getAttribute('view'));
      FOAM.lookup(e.getAttribute('view'), X);
      FOAM.lookup(e.getAttribute('model'), X);
      if ( e.getAttribute('view') ) models.push(arequire(e.getAttribute('view')));
      if ( e.getAttribute('model') ) models.push(arequire(e.getAttribute('model')));
    }
    for ( var key in USED_MODELS ) {
      models.push(arequire(key));
    }

    atime('DOMInit', aseq(apar.apply(null, models), function(ret) {
      for ( var i = 0 ; i < fs.length ; i++ ) {
        this.initElement(fs[i], X, X.document);
      }
      ret();
    }.bind(this)))();
  },

  initElementChildren: function(e, X) {
    var a = [];

    for ( var i = 0 ; i < e.children.length ; i++ ) {
      var c = e.children[i];

      if ( c.tagName === 'FOAM' ) {
        a.push(DOM.initElement(c, X));
      }
    }

    return a;
  },

  /**
   * opt_document -- if supplied the object's view will be added to the document.
   **/
  initElement: function(e, X, opt_document) {
    // If was a sub-object for an object that has already been displayed,
    // then it will no longer be in the DOM and doesn't need to be shown.
    if ( opt_document && ! opt_document.body.contains(e) ) return;

    var args = {};
    var modelName = e.getAttribute('model');
    var model = FOAM.lookup(modelName, X);

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
        // Attributes of the form #name are treated as a reference to
        // another <foam> objects whose id is 'name'.
        if ( val.startsWith('#') ) {
          val = val.substring(1);
          val = X.$(val);
        }
        args[key] = val;
      } else {
        if ( ! {model:true, view:true, id:true, oninit:true, showactions:true}[key] ) {
          console.log('unknown attribute: ', key);
        }
      }
    }

    var obj = model.create(undefined, X);
    obj.fromElement(e);

    var onLoad = e.getAttribute('oninit');
    if ( onLoad ) Function(onLoad).bind(obj)();

    if ( opt_document ) {
      var viewName = e.getAttribute('view');
      var view;
      if ( viewName ) {
        var viewModel = FOAM.lookup(viewName, X);
        view = viewModel.create({ model: model, data: obj });
      }
      else if ( View.isInstance(obj) || ( 'CView' in GLOBAL && CView.isInstance(obj) ) ) {
        view = obj;
      } else if ( obj.toView_ ) {
        view = obj.toView_();
      } else {
        var a = e.getAttribute('showActions');
        var showActions = a ?
            a.equalsIC('y') || a.equalsIC('yes') || a.equalsIC('true') || a.equalsIC('t') :
            true ;

        view = X.foam.ui.DetailView.create({ model: model, data: obj, showActions: showActions })
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


window &&
  window.addEventListener &&
  window.addEventListener('load', function() { DOM.init(X); }, false);


// TODO: document and make non-global
/** Convert a style size to an Int.  Ex. '10px' to 10. **/
function toNum(p) { return p.replace ? parseInt(p.replace('px','')) : p; };


 

// TODO(kgr): replace all instances of DomValue with new modelled DOMValue.
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


CLASS({
  name: 'DOMValue',

  properties: [
    {
      name: 'element',
      required: true
    },
    {
      name: 'property',
      defaultValue: 'value'
    },
    {
      name: 'event',
      defaultValue: 'change'
    },
    {
      name: 'value',
      postSet: function(_, value) { this.element[this.property] = value; }
    },
    {
      name: 'firstListener_',
      defaultValue: true
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.value = this.element[this.property];
    },

    get: function() { return this.value; },

    set: function(value) { this.value = value; },

    addListener: function(listener) {
      if ( this.firstListener_ ) {
        if ( this.event ) {
          this.element.addEventListener(
            this.event,
            function() { debugger; /* TODO */ },
            false);
        }

        this.firstListener_ = false;
      }
      this.value$.addListener(listener);
    },

    removeListener: function(listener) {
      this.value$.removeListener(listener);
    },

    toString: function() {
      return 'DOMValue(' + this.event + ', ' + this.property + ')';
    }
  }
});


CLASS({
  name: 'WindowHashValue',

  properties: [
    {
      name: 'window',
      defaultValueFn: function() { return this.X.window; }
    }
  ],

  methods: {
    get: function() { return this.window.location.hash ? this.window.location.hash.substring(1) : ''; },

    set: function(value) { this.window.location.hash = value; },

    addListener: function(listener) {
      this.window.addEventListener('hashchange', listener, false);
    },

    removeListener: function(listener) {
      this.window.removeEventListener('hashchange', listener, false);
    },

    toString: function() { return "WindowHashValue(" + this.get() + ")"; }
  }
});

X.memento = X.WindowHashValue.create();
