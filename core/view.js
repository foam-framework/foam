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
      FOAM.lookup(e.getAttribute('view'), X);
      FOAM.lookup(e.getAttribute('model'), X);
    }
    var models = [];
    for ( var key in USED_MODELS ) {
      models.push(arequire(key));
    }

    if ( e && e.getAttribute('view') ) models.push(arequire(e.getAttribute('view')));
    models.push(arequire(e.getAttribute('model')));

    aseq(apar.apply(null, models), function(ret) {
      for ( var i = 0 ; i < fs.length ; i++ ) {
        this.initElement(fs[i], X, X.document);
      }
    }.bind(this))();
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

  /** opt_document -- if supplied the object's view will be added to the document. **/
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

    function findProperty(name) {
      for ( var j = 0 ; j < model.properties.length ; j++ ) {
        var p = model.properties[j];

        if ( p.name.toUpperCase() == name ) return p;
      }

      return null;
    }

    var obj = model.create(undefined, X);
    obj.fromElement(e);

    var onLoad = e.getAttribute('oninit');
    if ( onLoad ) {
      Function(onLoad).bind(obj)();
    }

    if ( opt_document ) {
      var view;
      if ( View.isInstance(obj) || ( 'CView' in GLOBAL && CView.isInstance(obj) ) ) {
        view = obj;
      } else {
        var viewName = e.getAttribute('view');
        var viewModel = viewName ? FOAM.lookup(viewName, X) : DetailView;
        view = viewModel.create({model: model, data: obj});
        if ( ! viewName ) {
          // default value is 'true' if 'showActions' isn't specified.
          var a = e.getAttribute('showActions');

          view.showActions = a ?
            a.equalsIC('y') || a.equalsIC('yes') || a.equalsIC('true') || a.equalsIC('t') :
            true ;
        }
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
CLASS({
  name: 'View',
  label: 'View',

  //exports: [ 'myself$ as data$' ],

  documentation: function() {/*
    <p>$$DOC{ref:'View',usePlural:true} render data. This could be a specific
       $$DOC{ref:'Model'} or a $$DOC{ref:'DAO'}. In the case of $$DOC{ref:'DetailView'},
       <em>any</em> $$DOC{ref:'Model'} can be rendered by walking through the
       $$DOC{ref:'Property',usePlural:true} of the data.
    </p>
    <p>$$DOC{ref:'View'} instances are arranged in a tree with parent-child links.
       This represents containment in most cases, where a sub-view appears inside
       its parent.
    </p>
    <p>HTML $$DOC{ref:'View',usePlural:true} should provide a $$DOC{ref:'.toInnerHTML'}
       $$DOC{ref:'Method'} or $$DOC{ref:'Template'}. If direct control is required,
       at minimum you must implement $$DOC{ref:'.toHTML'} and $$DOC{ref:'.initHTML'}.
    </p>
  */},

  properties: [
    {
      name:  'id',
      label: 'Element ID',
      type:  'String',
      factory: function() { return this.instance_.id || this.nextID(); },
      documentation: function() {/*
        The DOM element id for the outermost tag of
        this $$DOC{ref:'View'}.
      */}
    },
    {
      name: 'parent',
      type: 'View',
      hidden: true
    },
    {
      name: 'children',
      type: 'Array[View]',
      factory: function() { return []; },
      documentation: function() {/*
        <p>$$DOC{ref:'View',usePlural:true} are arranged in a tree. Each sub-view
        contained inside this one is a child. Subviews can be created explicitly
        or inside a template with the $$DOC{ref:'Template',text:"$$propName"}
        tag.</p>
        <p>Generally, sub-views are created around a property of the data that
        this $$DOC{ref:'View'} is showing, each layer getting more specific.</p>

      */}
    },
    {
      name:   'shortcuts',
      type:   'Array[Shortcut]',
      factory: function() { return []; },
      documentation: function() {/*
        Keyboard shortcuts for the view. TODO ???
      */}
    },
    {
      name:   '$',
      hidden: true,
      mode:   "read-only",
      getter: function() {
        return this.X.document.getElementById(this.id);
      },
      help: 'DOM Element.'
    },
    {
      name: 'tagName',
      defaultValue: 'span',
      documentation: function() {/*
          The HTML tag name to use for HTML $$DOC{ref:'View',usePlural:true}.
      */}
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated.',
      defaultValue: '',
      documentation: function() {/*
          The CSS class names to use for HTML $$DOC{ref:'View',usePlural:true}.
          Separate class names with spaces. Each instance of a $$DOC{ref:'View'}
          may have different classes specified.
      */}
    },
    {
      name: 'tooltip'
    },
    {
      name: 'extraClassName',
      defaultValue: '',
      documentation: function() {/*
          For custom $$DOC{ref:'View',usePlural:true}, you may wish to add standard
          CSS classes in addition to user-specified ones. Set those here and
          they will be appended to those from $$DOC{ref:'.className'}.
      */}
    },
    {
      model_: 'BooleanProperty',
      name: 'showActions',
      defaultValue: false,
      postSet: function(oldValue, showActions) {
        // TODO: No way to remove the decorator.
        if ( ! oldValue && showActions ) {
          this.addDecorator(this.X.ActionBorder.create());
        }
      },
      documentation: function() {/*
          If $$DOC{ref:'Action',usePlural:true} are set on this $$DOC{ref:'View'},
          this property enables their automatic display in an $$DOC{ref:'ActionBorder'}.
          If you do not want to show $$DOC{ref:'Action',usePlural:true} or want
          to show them in a different way, leave this false.
      */}
    },
    {
      name: 'initializers_',
      factory: function() { return []; },
      documentation: function() {/*
          When creating new HTML content, intializers are run. This corresponds
          to the lifecycle of the HTML (which may be replaced by toHTML() at any
          time), not the lifecycle of this $$DOC{ref:'View'}.
      */}
    },
    {
      name: 'destructors_',
      factory: function() { return []; },
      documentation: function() {/*
          When destroying HTML content, destructors are run. This corresponds
          to the lifecycle of the HTML (which may be replaced by toHTML() at any
          time), not the lifecycle of this $$DOC{ref:'View'}.
      */}
    }
  ],

  listeners: [
    {
      name: 'openTooltip',
      code: function(e) {
        console.assert(! this.tooltip_, 'Tooltip already defined');
        this.tooltip_ = this.X.Tooltip.create({
          text:   this.tooltip,
          target: this.$
        });
      }
    },
    {
      name: 'closeTooltip',
      code: function(e) {
        if ( this.tooltip_ ) {
          this.tooltip_.close();
          this.tooltip_ = null;
        }
      }
    },
    {
      name: 'onKeyboardShortcut',
      code: function(evt) {
        // console.log('***** key: ', this.evtToKeyCode(evt));
        var action = this.keyMap_[this.evtToKeyCode(evt)];
        if ( action ) {
          action();
          evt.preventDefault();
        }
      },
      documentation: function() {/*
          Automatic mapping of keyboard events to $$DOC{ref:'Action'} trigger.
          To handle keyboard shortcuts, create and attach $$DOC{ref:'Action',usePlural:true}
          to your $$DOC{ref:'View'}.
      */}
    }
  ],

  constants: {
    // TODO?: Model as Topics
    ON_HIDE: ['onHide'], // Indicates that the View has been hidden
    ON_SHOW: ['onShow']  // Indicates that the View is now being reshown
  },

  methods: {
    toView_: function() { return this; },

    deepPublish: function(topic) {
      /*
       Publish an event and cause all children to publish as well.
       */
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
      /*
        Escape the string to make it HTML safe.
        */
      return XMLUtil.escape(str.toString())
    },

    cssClassAttr: function() {
      /*
        Returns the full CSS class to use for the $$DOC{ref:'View'} DOM element.
       */
      if ( ! this.className && ! this.extraClassName ) return '';

      var s = ' class="';
      if ( this.className ) {
        s += this.className
        if ( this.extraClassName ) s += ' ';
      }
      if ( this.extraClassName ) s += this.extraClassName;

      return s + '"';
    },

    dynamicTag: function(tagName, f) {
      /*
        Creates a dynamic HTML tag whose content will be automatically updated.
       */
      var id = this.nextID();

      this.addInitializer(function() {
        this.X.dynamic(function() {
          var html = f();
          var e = this.X.$(id);
          if ( e ) e.innerHTML = html;
        }.bind(this));
      }.bind(this));

      return '<' + tagName + ' id="' + id + '"></' + tagName + '>';
    },

    bindSubView: function(view, prop) {
      /*
        Bind a sub-$$DOC{ref:'View'} to a $$DOC{ref:'Property'} of this.
       */
      view.setValue(this.propertyValue(prop.name));
    },

    viewModel: function() {
      /* The $$DOC{ref:'Model'} definition of this $$DOC{ref:'View'}. */
      return this.model_;
    },

    createView: function(prop, opt_args) {
      /* Creates a sub-$$DOC{ref:'View'} from $$DOC{ref:'Property'} info. */
      var X = ( opt_args && opt_args.X ) || this.X;
      var v = X.PropertyView.create({prop: prop, args: opt_args}, X);
      this.addChild(v);
      return v;
    },

    createActionView: function(action, opt_args) {
      /* Creates a sub-$$DOC{ref:'View'} from $$DOC{ref:'Property'} info
        specifically for $$DOC{ref:'Action',usePlural:true}. */
      var X = ( opt_args && opt_args.X ) || this.X;
      var modelName = opt_args && opt_args.model_ ?
        opt_args.model_ :
        'ActionButton'  ;
      var v = X[modelName].create({action: action}).copyFrom(opt_args);

      this[action.name + 'View'] = v;

      return v;
    },

    createRelationshipView: function(r, opt_args) {
      var X = ( opt_args && opt_args.X ) || this.X;
      return X.RelationshipView.create({
        relationship: r,
        args: opt_args
      });
    },

    createTemplateView: function(name, opt_args) {
      /*
        Used by the $$DOC{ref:'Template',text:'$$propName'} sub-$$DOC{ref:'View'}
        creation tag in $$DOC{ref:'Template',usePlural:true}.
      */

      // Can't call viewModel() here, since DetailView overrides it but relies
      // on falling back on view's implementation. TODO(jacksonic): figure it out
      var o = this.model_[name.constantize()];

      if ( ! o ) throw 'Unknown View Name: ' + name;

      var args = opt_args; // opt_args ? opt_args.clone() : {};
//      args.data = this;

      if ( Action.isInstance(o) )
        var v = this.createActionView(o, args);
      else if ( Relationship.isInstance(o) )
        v = this.createRelationshipView(o, args);
      else
        v = this.createView(o, args);
        v.data = this;
      return v;
    },

    focus: function() {
      /* Cause the view to take focus. */
      if ( this.$ && this.$.focus ) this.$.focus();
    },

    addChild: function(child) {
      /*
        Maintains the tree structure of $$DOC{ref:'View',usePlural:true}. When
        a sub-$$DOC{ref:'View'} is created, add it to the tree with this method.
      */
      if ( child.toView_ ) child = child.toView_(); // Maybe the check isn't needed.
      // Check prevents duplicate addChild() calls,
      // which can happen when you use creatView() to create a sub-view (and it calls addChild)
      // and then you write the View using TemplateOutput (which also calls addChild).
      // That should all be cleaned up and all outputHTML() methods should use TemplateOutput.
      if ( this.children.indexOf(child) != -1 ) return;

      try {
        child.parent = this;
      } catch (x) { console.log(x); }

      var children = this.children;
      children.push(child);
      this.children = children;

      return this;
    },

    removeChild: function(child) {
      /*
        Maintains the tree structure of $$DOC{ref:'View',usePlural:true}. When
        a sub-$$DOC{ref:'View'} is destroyed, remove it from the tree with this method.
      */
      this.children.deleteI(child);
      child.parent = undefined;

      return this;
    },

    addChildren: function() {
      /* Adds multiple children at once. */
      Array.prototype.forEach.call(arguments, this.addChild.bind(this));

      return this;
    },

    addShortcut: function(key, callback, context) {
      /* Add a keyboard shortcut. */
      this.shortcuts.push([key, callback, context]);
    },

    // TODO: make use new static_ scope when available
    nextID: function() {
      /* Convenience method to return unique DOM element ids. */
      return "view" + (arguments.callee._nextId = (arguments.callee._nextId || 0) + 1);
    },

    addInitializer: function(f) {
      /* Adds a DOM initializer */
      this.initializers_.push(f);
    },
    addDestructor: function(f) {
      /* Adds a DOM destructor. */
      this.destructors_.push(f);
    },

    tapClick: function() {
    },

    on: function(event, listener, opt_id) {
      /*
        <p>To create DOM event handlers, use this method to set up your listener:</p>
        <p><code>this.on('click', this.myListener);</code></p>
      */
      opt_id = opt_id || this.nextID();
      listener = listener.bind(this);

      if ( event === 'click' && this.X.gestureManager ) {
        var self = this;
        var manager = this.X.gestureManager;
        var target = this.X.GestureTarget.create({
          containerID: opt_id,
          handler: {
            tapClick: function() {
              // Create a fake event.
              return listener({
                preventDefault: function() { },
                stopPropagation: function() { }
              });
            }
          },
          gesture: 'tap'
        });

        manager.install(target);
        this.addDestructor(function() {
          manager.uninstall(target);
        });
        return opt_id;
      }

      this.addInitializer(function() {
        var e = this.X.$(opt_id);
        // if ( ! e ) console.log('Error Missing element for id: ' + opt_id + ' on event ' + event);
        if ( e ) e.addEventListener(event, listener, false);
      }.bind(this));

      return opt_id;
    },

    setAttribute: function(attributeName, valueFn, opt_id) {
      /* Set a dynamic attribute on the DOM element. */
      opt_id = opt_id || this.nextID();
      valueFn = valueFn.bind(this);
      this.addInitializer(function() {
        this.X.dynamic(valueFn, function() {
          var e = this.X.$(opt_id);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          var newValue = valueFn(e.getAttribute(attributeName));
          if ( newValue == undefined ) e.removeAttribute(attributeName);
          else e.setAttribute(attributeName, newValue);
        }.bind(this))
      }.bind(this));
    },

    setClass: function(className, predicate, opt_id) {
      /* Set a dynamic CSS class on the DOM element. */
      opt_id = opt_id || this.nextID();
      predicate = predicate.bind(this);

      this.addInitializer(function() {
        this.X.dynamic(predicate, function() {
          var e = this.X.$(opt_id);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          DOM.setClass(e, className, predicate());
        }.bind(this));
      }.bind(this));

      return opt_id;
    },

    setClasses: function(map, opt_id) {
      /* Set a map of dynamic CSS classes on the DOM element. Mapped as
         className: predicate.*/
      opt_id = opt_id || this.nextID();
      var keys = Objects.keys(map);
      for ( var i = 0 ; i < keys.length ; i++ ) {
        this.setClass(keys[i], map[keys[i]], opt_id);
      }

      return opt_id;
    },

    insertInElement: function(name) {
      /* Insert this View's toHTML into the Element of the supplied name. */
      var e = this.X.$(name);
      e.innerHTML = this.toHTML();
      this.initHTML();
    },

    write: function(document) {
      /*  Write the View's HTML to the provided document and then initialize. */
      document.writeln(this.toHTML());
      this.initHTML();
    },

    updateHTML: function() {
      /* Cause the HTML content to be recreated using a call to
        $$DOC{ref:'.toInnerHTML'}. */
      if ( ! this.$ ) return;

      this.destroy();
      this.$.innerHTML = this.toInnerHTML();
      this.initInnerHTML();
    },

    toInnerHTML: function() {
      /* <p>In most cases you can override this method to provide all of your HTML
        content. Calling $$DOC{ref:'.updateHTML'} will cause this method to
        be called again, regenerating your content. $$DOC{ref:'Template',usePlural:true}
        are usually called from here, or you may create a
        $$DOC{ref:'.toInnerHTML'} $$DOC{ref:'Template'}.</p>
        <p>If you are generating your content here, you may also need to override
        $$DOC{ref:'.initInnerHTML'} to create event handlers such as
        <code>this.on('click')</code>. */
      return '';
    },

    toHTML: function() {
      /* Generates the complete HTML content of this view, including outermost
        element. This element is managed by $$DOC{ref:'View'}, so in most cases
        you should use $$DOC{ref:'.toInnerHTML'} to generate your content. */
      this.invokeDestructors();
      return '<' + this.tagName + ' id="' + this.id + '"' + this.cssClassAttr() + '>' +
        this.toInnerHTML() +
        '</' + this.tagName + '>';
    },

    initHTML: function() {
      /* This must be called once after your HTML content has been inserted into
        the DOM. Calling $$DOC{ref:'.updateHTML'} will automatically call
        $$DOC{ref:'.initHTML'}. */
      this.initInnerHTML();
      this.initKeyboardShortcuts();
      this.maybeInitTooltip();
    },

    maybeInitTooltip: function() {
      if ( ! this.tooltip ) return;
      this.$.addEventListener('mouseenter', this.openTooltip);
      this.$.addEventListener('mouseleave', this.closeTooltip);
    },

    initInnerHTML: function() {
      /* Initialize this View and all of it's children. Usually just call
         $$DOC{ref:'.initHTML'} instead. When implementing a new $$DOC{ref:'View'}
         and adding listeners (including <code>this.on('click')</code>) that
         will be destroyed each time $$DOC{ref:'.toInnerHTML'} is called, you
         will have to override this $$DOC{ref:'Method'} and add them here.
       */
      // This mostly involves attaching listeners.
      // Must be called activate a view after it has been added to the DOM.

      this.invokeInitializers();
      this.initChildren();
    },

    initChildren: function() {
      /* Initialize all of the children. Usually just call
          $$DOC{ref:'.initHTML'} instead. */
      if ( this.children ) {
        // init children
        for ( var i = 0 ; i < this.children.length ; i++ ) {
          // console.log(i, 'init child: ' + this.children[i]);
          try {
            this.children[i].initHTML();
          } catch (x) {
            console.log('Error on View.child.initHTML', x, x.stack);
          }
        }
      }
    },

    invokeInitializers: function() {
      /* Calls all the DOM $$DOC{ref:'.initializers_'}. */
      for ( var i = 0 ; i < this.initializers_.length ; i++ ) this.initializers_[i]();
      this.initializers_ = [];
    },
    invokeDestructors: function() {
      /* Calls all the DOM $$DOC{ref:'.destructors_'}. */
      for ( var i = 0; i < this.destructors_.length; i++ ) this.destructors_[i]();
      this.destructors_ = [];
    },

    evtToKeyCode: function(evt) {
      /* Maps an event keycode to a string */
      var s = '';
      if ( evt.ctrlKey ) s += 'ctrl-';
      if ( evt.shiftKey ) s += 'shift-';
      s += evt.keyCode;
      return s;
    },

    initKeyboardShortcuts: function() {
      /* Initializes keyboard shortcuts. */
      var keyMap = {};
      var found  = false;
      var self   = this;

      function init(actions, opt_value) {
        actions.forEach(function(action) {
          for ( var j = 0 ; j < action.keyboardShortcuts.length ; j++ ) {
            var key = action.keyboardShortcuts[j];
            keyMap[key] = opt_value ?
              function() { action.callIfEnabled(self.X, opt_value.get()); } :
              action.callIfEnabled.bind(action, self.X, self) ;
            found = true;
          }
        });
      }

      init(this.model_.actions);
      if ( DetailView.isInstance(this) &&
          this.model &&
          this.model.actions )
        init(this.model.actions, this.data$);

      if ( found ) {
        console.assert(this.$, 'View must define outer id when using keyboard shortcuts: ' + this.name_);
        this.keyMap_ = keyMap;
        this.$.parentElement.addEventListener('keydown', this.onKeyboardShortcut);
      }
    },

    destroy: function() {
      /* Cleans up the DOM when regenerating content. You should call this before
         creating new HTML in your $$DOC{ref:'.toInnerHTML'} or $$DOC{ref:'.toHTML'}. */
      // TODO: remove listeners
      this.invokeDestructors();
      for ( var i = 0; i < this.children.length; i++ ) {
        this.children[i].destroy();
      }
      this.children = [];
      delete this.instance_.$;
    },

    close: function() {
      /* Call when permanently closing the $$DOC{ref:'View'}. */
      this.$ && this.$.remove();
      this.destroy();
      this.publish('closed');
    }
  }
});


CLASS({
  name: 'PropertyView',

  extendsModel: 'View',

  documentation: function() {/*
    Used by $$DOC{ref:'DetailView'} to generate a sub-$$DOC{ref:'View'} for one
    $$DOC{ref:'Property'}. The $$DOC{ref:'View'} chosen can be based off the
    $$DOC{ref:'Property.view',text:'Property.view'} value, the $$DOC{ref:'.innerView'} value, or
    $$DOC{ref:'.args'}.model_.
  */},

//  imports: ['data$'],
//  exports: ['propValue$ as data$'],

  properties: [
    {
      name: 'prop',
      type: 'Property',
      documentation: function() {/*
          The $$DOC{ref:'Property'} for which to generate a $$DOC{ref:'View'}.
      */}
    },
    {
      name: 'propValue',
      documentation: function() {/*
          The value of the $$DOC{ref:'Property'} of $$DOC{ref:'.data'}.
      */},
    },
    {
      name: 'parent',
      type: 'View',
      postSet: function(_, p) {
        p[this.prop.name + 'View'] = this.view;
        if ( this.view ) this.view.parent = p;
      },
      documentation: function() {/*
        The $$DOC{ref:'View'} to use as the parent container for the new
        sub-$$DOC{ref:'View'}.
      */}
    },
    {
      name: 'data',
      postSet: function(oldData, data) {
        this.unbindData(oldData);
        this.bindData(data);
      },
      documentation: function() {/*
        The data to feed into the new sub-$$DOC{ref:'View'}. The data set here
        is linked bi-directionally to the $$DOC{ref:'View'}. Typically this
        data is the property value.
      */}
    },
    {
      name: 'innerView',
      help: 'Override for prop.view',
      documentation: function() {/*
        The optional name of the desired sub-$$DOC{ref:'View'}. If not specified,
        prop.$$DOC{ref:'Property.view'} is used.
      */}
    },
    {
      name: 'view',
      type: 'View',
      documentation: function() {/*
        The new sub-$$DOC{ref:'View'} generated for the given $$DOC{ref:'Property'}.
      */}
    },
    {
      name: 'args',
      documentation: function() {/*
        Optional arguments to be used for sub-$$DOC{ref:'View'} creation. args.model_
        in particular specifies the exact $$DOC{ref:'View'} to use.
      */}
    }
  ],

  methods: {

    init: function() {
      /* Sets up the new sub-$$DOC{ref:'View'} immediately. */
      this.SUPER();

      if ( this.args && this.args.model_ ) {
        var model = FOAM.lookup(this.args.model_, this.X);
        console.assert( model, 'Unknown View: ' + this.args.model_);
        // HACK to make sure model specification makes it into the create
        if (this.args.model) this.prop.model = this.args.model;
        var view = model.create(this.prop, this.X);
        delete this.args.model_;
      } else {
        view = this.createViewFromProperty(this.prop);
      }

      view.copyFrom(this.args);
      view.parent = this.parent;
      view.prop = this.prop;

      // TODO(kgr): re-enable when improved
      // if ( this.prop.description || this.prop.help ) view.tooltip = this.prop.description || this.prop.help;

      this.view = view;
      this.bindData(this.data);
    },

    fromElement: function(e) {
      this.view.fromElement(e);
      return this;
    },

    createViewFromProperty: function(prop) {
      /* Helper to determine the $$DOC{ref:'View'} to use. */
      var viewName = this.innerView || prop.view
      if ( ! viewName ) return this.X.TextFieldView.create(prop);
      if ( typeof viewName === 'string' ) return FOAM.lookup(viewName, this.X).create(prop);
      if ( viewName.model_ && typeof viewName.model_ === 'string' ) return FOAM(prop.view);
      if ( viewName.model_ ) { var v = viewName.model_.create(viewName, this.X).copyFrom(prop); v.id = this.nextID(); return v; }
      if ( viewName.factory_ ) {
        var v = FOAM.lookup(viewName.factory_, this.X).create(viewName, this.X).copyFrom(prop);
        v.id = this.nextID();
        return v;
      }
      if ( typeof viewName === 'function' ) return viewName(prop, this);

      return viewName.create(prop);
    },

    unbindData: function(oldData) {
      /* Unbind the data from the old view. */
      var view = this.view;
      if ( ! view || ! oldData || ! oldData.model_ ) return;
      var pValue = oldData.propertyValue(this.prop.name);
      Events.unlink(pValue, view.data$);
      //Events.unlink(pValue, this.propValue$);
    },

    bindData: function(data) {
      /* Bind data to the new view. */
      var view = this.view;
      if ( ! view || ! data || ! data.model_ ) return;
      var pValue = data.propertyValue(this.prop.name);
      Events.link(pValue, view.data$);
      //Events.link(pValue, this.propValue$);
    },

    toHTML: function() { /* Passthrough to $$DOC{ref:'.view'} */ return this.view.toHTML(); },

    toString: function() { /* Name info. */ return 'PropertyView(' + this.prop.name + ', ' + this.view + ')'; },

    initHTML: function() { /* Passthrough to $$DOC{ref:'.view'} */ this.view.initHTML(); },

    destroy: function() { /* Passthrough to $$DOC{ref:'.view'} */
      this.SUPER();
      this.view.destroy();
    }
  }
});


// http://www.google.com/design/spec/components/tooltips.html#tooltips-usage
CLASS({
  name: 'Tooltip',

  extendsModel: 'View',

  properties: [
    {
      name: 'text',
      help: 'Help text to be shown in tooltip.'
    },
    {
      name: 'target',
      help: 'Target element to provide tooltip for.'
    },
    {
      name: 'className',
      defaultValue: 'tooltip'
    },
    {
      name: 'closed',
      defaultValue: false
    }
  ],

  templates: [
    function CSS() {/*
      .tooltip {
        background: rgba(80,80,80,0.9);
        border-radius: 4px;
        color: white;
        font-size: 10pt;
        left: 0;
        padding: 5px 8px;
        position: absolute;
        top: 0;
        visibility: hidden;
        z-index: 999;
        -webkit-transform: translate3d(0, 0, 2px);
      }
      .tooltip.animated {
        transition: top 0.5s ease-in-out;
        visibility: visible;
      }
      .tooltip.fadeout {
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
      }
    */}
  ],

  methods: {
    init: function() {
      this.SUPER();

      var document = this.X.document;

      document.previousTooltip_ = this;
      this.X.setTimeout(function() {
        if ( this.closed ) return;
        if ( document.previousTooltip_ != this ) return;

        var div = document.createElement('div');

        // Close after 5s
        this.X.setTimeout(this.close.bind(this), 5000);

        div.className = this.className;
        div.id = this.id;
        div.innerHTML = this.toInnerHTML();

        document.body.appendChild(div);

        var s            = this.X.window.getComputedStyle(div);
        var pos          = findViewportXY(this.target);
        var screenHeight = this.X.document.body.clientHeight;
        var scrollY      = this.X.window.scrollY;
        var above        = pos[1] - scrollY > screenHeight / 2;
        var left         = pos[0] + ( this.target.clientWidth - toNum(s.width) ) / 2;
        var maxLeft      = this.X.document.body.clientWidth + this.X.window.scrollX - 15 - div.clientWidth;
        var targetHeight = this.target.clientHeight || this.target.offsetHeight;

        // Start half way to the destination to avoid the user clicking on the tooltip.
        div.style.top  = above ?
            pos[1] - targetHeight/2 - 4 :
            pos[1] + targetHeight/2 + 4 ;

//        div.style.top  = pos[1];
        div.style.left = Math.max(this.X.window.scrollX + 15, Math.min(maxLeft, left));

        DOM.setClass(div, 'animated');

        this.X.setTimeout(function() {
          div.style.top = above ?
            pos[1] - targetHeight - 8 :
            pos[1] + targetHeight + 8 ;
        }, 10);

        this.initHTML();
      }.bind(this), 800);
    },
    toInnerHTML: function() { return this.text; },
    close: function() {
      if ( this.closed ) return;
      this.closed = true;
      // Closing while it is still animating causes it to jump around
      // which looks bad, so wait 500ms to give it time to transition
      // if it is.
      this.X.setTimeout(function() {
        if ( this.$ ) {
          this.X.setTimeout(this.$.remove.bind(this.$), 1000);
          DOM.setClass(this.$, 'fadeout');
        }
      }.bind(this), 500);
    },
    destroy: function() {
      this.SUPER();
      this.close();
    }
  }
});


CLASS({
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


CLASS({
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


CLASS({
  name: 'BlobImageView',

  extendsModel: 'View',

  help: 'Image view for rendering a blob as an image.',

  properties: [
    {
      name: 'data',
      postSet: function() { this.onValueChange(); }
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
        if ( this.data && this.$ )
          this.$.src = URL.createObjectURL(this.data);
      }
    }
  ]
});


CLASS({
  name:  'TextFieldView',
  label: 'Text Field',

  extendsModel: 'View',

  documentation: function() { /*
      The default $$DOC{ref:'View'} for a string. Supports autocomplete
      when an autocompleter is installed in $$DOC{ref:'.autocompleter'}.
  */},

  properties: [
    {
      model_: 'StringProperty',
      name: 'name',
      defaultValue: 'field',
      documentation: function() { /* The name of the field. */}
    },
    {
      model_: 'IntProperty',
      name: 'displayWidth',
      defaultValue: 30,
      documentation: function() { /* The width to fix the HTML text box. */}
    },
    {
      model_: 'IntProperty',
      name: 'displayHeight',
      defaultValue: 1,
      documentation: function() { /* The height to fix the HTML text box. */}
    },
    {
      model_: 'StringProperty',
      name: 'type',
      defaultValue: 'text',
      documentation: function() { /* The type of field to create. */}
    },
    {
      model_: 'StringProperty',
      name: 'placeholder',
      defaultValue: undefined,
      documentation: function() { /* Placeholder to use when empty. */}
    },
    {
      model_: 'BooleanProperty',
      name: 'onKeyMode',
      help: 'If true, value is updated on each keystroke.',
      documentation: function() { /* If true, value is updated on each keystroke. */}
    },
    {
      model_: 'BooleanProperty',
      name: 'escapeHTML',
      defaultValue: true,
      // TODO: make the default 'true' for security reasons
      help: 'If true, HTML content is escaped in display mode.',
      documentation: function() { /* If true, HTML content is escaped in display mode. */}
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write',
      view: { factory_: 'ChoiceView', choices: ['read-only', 'read-write', 'final'] },
      documentation: function() { /* Can be 'read-only', 'read-write' or 'final'. */}
    },
    {
      model_: 'BooleanProperty',
      name: 'required',
      documentation: 'If value is required.'
    },
    {
      model_: 'StringProperty',
      name: 'pattern',
      documentation: 'Regex pattern for value.'
    },
    {
      name: 'domValue',
      hidden: true
    },
    {
      name: 'data',
      documentation: function() { /* The object to bind to the user's entered text. */}
    },
    {
      model_: 'StringProperty',
      name: 'readWriteTagName',
      defaultValueFn: function() {
        return this.displayHeight === 1 ? 'input' : 'textarea';
      },
      hidden: true
    },
    {
      model_: 'BooleanProperty',
      name: 'autocomplete',
      defaultValue: true,
      documentation: function() { /* Set to true to enable autocomplete. */}
    },
    {
      name: 'autocompleter',
      documentation: function() { /* The autocompleter model to use. */}
    },
    {
      name: 'autocompleteView',
      documentation: function() { /* The autocomplete view created. */}
    }
  ],

  constants: {
    /** Escape topic published when user presses 'escape' key to abort edits. **/
    // TODO: Model as a 'Topic'
    ESCAPE: ['escape']
  },

  methods: {
    toHTML: function() {
      /* Selects read-only versus read-write DOM output */
      return this.mode === 'read-write' ?
        this.toReadWriteHTML() :
        this.toReadOnlyHTML()  ;
    },

    toReadWriteHTML: function() {
      /* Supplies the correct element for read-write mode */
      var str = '<' + this.readWriteTagName + ' id="' + this.id + '"';
      str += ' type="' + this.type + '" ' + this.cssClassAttr();

      this.on('click', this.onClick, this.id);

      str += this.readWriteTagName === 'input' ?
        ' size="' + this.displayWidth + '"' :
        ' rows="' + this.displayHeight + '" cols="' + this.displayWidth + '"';

      if ( this.required ) str += ' required';
      if ( this.pattern  ) str += ' pattern="' + this.pattern + '"';

      str += this.extraAttributes();

      str += ' name="' + this.name + '">';
      str += '</' + this.readWriteTagName + '>';
      return str;
    },

    extraAttributes: function() { return ''; },

    toReadOnlyHTML: function() {
      /* Supplies the correct element for read-only mode */
      var self = this;
      this.setClass('placeholder', function() { return self.data === ''; }, this.id);
      return '<' + this.tagName + ' id="' + this.id + '"' + this.cssClassAttr() + ' name="' + this.name + '"></' + this.tagName + '>';
    },

    setupAutocomplete: function() {
      /* Initializes autocomplete, if $$DOC{ref:'.autocomplete'} and
        $$DOC{ref:'.autocompleter'} are set. */
      if ( ! this.autocomplete || ! this.autocompleter ) return;

      var view = this.autocompleteView = this.X.AutocompleteView.create({
        autocompleter: this.autocompleter,
        target: this
      });

      this.bindAutocompleteEvents(view);
    },

    onAutocomplete: function(data) {
      this.data = data;
    },

    bindAutocompleteEvents: function(view) {
      this.$.addEventListener('blur', function() {
        // Notify the autocomplete view of a blur, it can decide what to do from there.
        view.publish('blur');
      });
      this.$.addEventListener('input', (function() {
        view.autocomplete(this.textToValue(this.$.value));
      }).bind(this));
      this.$.addEventListener('focus', (function() {
        view.autocomplete(this.textToValue(this.$.value));
      }).bind(this));
    },

    initHTML: function() {
      /* Connects key events. */
      if ( ! this.$ ) return;

      this.SUPER();

      if ( this.mode === 'read-write' ) {
        if ( this.placeholder ) this.$.placeholder = this.placeholder;

        this.domValue = DomValue.create(
          this.$,
          this.onKeyMode ? 'input' : 'change');

        // In KeyMode we disable feedback to avoid updating the field
        // while the user is still typing.  Then we update the view
        // once they leave(blur) the field.
        Events.relate(
          this.data$,
          this.domValue,
          this.valueToText.bind(this),
          this.textToValue.bind(this),
          this.onKeyMode);

        if ( this.onKeyMode )
          this.$.addEventListener('blur', this.onBlur);

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

    textToValue: function(text) { /* Passthrough */ return text; },

    valueToText: function(value) { /* Filters for read-only mode */
      if ( this.mode === 'read-only' )
        return (value === '') ? this.placeholder : value;
      return value;
    },

    destroy: function() { /* Unlinks key handler. */
      this.SUPER();
      Events.unlink(this.domValue, this.data$);
    }
  },

  listeners: [
    {
      name: 'onKeyDown',
      code: function(e) {
        if ( e.keyCode == 27 /* ESCAPE KEY */ ) {
          this.domValue.set(this.data);
          this.publish(this.ESCAPE);
        } else {
          this.publish(['keydown'], e);
        }
      }
    },
    {
      name: 'onBlur',
      code: function(e) {
        if ( this.domValue.get() !== this.data )
          this.domValue.set(this.data);
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        this.$ && this.$.focus();
      }
    },
  ]
});


CLASS({
  name: 'TextAreaView',

  extendsModel: 'TextFieldView',

  label: 'Text-Area View',

  properties: [
    {
      model_: 'IntProperty',
      name: 'displayHeight',
      defaultValue: 5
    },
    {
      model_: 'IntProperty',
      name: 'displayWidth',
      defaultValue: 70
    }
  ]
});


// TODO: add ability to set CSS class and/or id
CLASS({
  name: 'ActionButton',

  extendsModel: 'View',

  properties: [
    {
      name: 'action',
      postSet: function(old, nu) {
        old && old.removeListener(this.render)
        nu.addListener(this.render);
      }
    },
    {
      name: 'data'
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
      name: 'label',
      defaultValueFn: function() {
        return this.data ?
            this.action.labelFn.call(this.data, this.action) :
            this.action.label;
      }
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() { return this.action.iconUrl; }
    },
    {
      name: 'tooltip',
      defaultValueFn: function() { return this.action.help; }
    }
  ],

  listeners: [
    {
      name: 'render',
      isFramed: true,
      code: function() { this.updateHTML(); }
    }
  ],

  methods: {
    toHTML: function() {
      var superResult = this.SUPER(); // get the destructors done before doing our work

      var self = this;

      this.on('click', function() {
        self.action.callIfEnabled(self.X, self.data);
      }, this.id);

      this.setAttribute('disabled', function() {
        self.closeTooltip();
        return self.action.isEnabled.call(self.data, self.action) ? undefined : 'disabled';
      }, this.id);

      this.setClass('available', function() {
        self.closeTooltip();
        return self.action.isAvailable.call(self.data, self.action);
      }, this.id);

      this.X.dynamic(function() { self.action.labelFn.call(self.data, self.action); self.updateHTML(); });

      return superResult;
    },

    toInnerHTML: function() {
      var out = '';

      if ( this.iconUrl ) {
        out += '<img src="' + XMLUtil.escapeAttr(this.iconUrl) + '">';
      }

      if ( this.showLabel ) {
        out += this.label;
      }

      return out;
    }
  }
});


CLASS({
  name: 'ActionLink',

  extendsModel: 'ActionButton',

  properties: [
    {
      // TODO: fix
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
      var superResult = this.SUPER(); // get the destructors done before doing our work
      this.setAttribute('href', function() { return '#' }, this.id);
      return superResult;
    },

    toInnerHTML: function() {
      if ( this.action.iconUrl ) {
        return '<img src="' + XMLUtil.escapeAttr(this.action.iconUrl) + '" />';
      }

      if ( this.action.showLabel ) {
        return this.label;
      }
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
CLASS({
  name: 'ActionBorder',

  methods: {
    toHTML: function(border, delegate, args) {
      var str = "";
      str += delegate.apply(this, args);
      str += '<div class="actionToolbar">';

      // Actions on the View, are bound to the view
      var actions = this.model_.actions;
      for ( var i = 0 ; i < actions.length; i++ ) {
        var v = this.createActionView(actions[i]);
        v.data = this;
        str += ' ' + v.toView_().toHTML() + ' ';
        this.addChild(v);
      }

      // This is poor design, we should defer to the view and polymorphism
      // to make the distinction.
      if ( DetailView.isInstance(this) ) {

        // Actions on the data are bound to the data
        actions = this.model.actions;
        for ( var i = 0 ; i < actions.length; i++ ) {
          var v = this.createActionView(actions[i]);
          v.data$ = this.data$;
          str += ' ' + v.toView_().toHTML() + ' ';
          this.addChild(v);
        }
      }

      str += '</div>';
      return str;
    }
  }
});


CLASS({
  name: 'AbstractNumberFieldView',

  extendsModel: 'TextFieldView',
  abstractModel: true,

  properties: [
    { name: 'type', defaultValue: 'number' },
    { name: 'step' }
  ],

  methods: {
    extraAttributes: function() {
      return this.step ? ' step="' + this.step + '"' : '';
    }
  }
});


CLASS({
  name: 'FloatFieldView',

  extendsModel: 'AbstractNumberFieldView',

  properties: [
    { name: 'precision', defaultValue: undefined }
  ],

  methods: {
    formatNumber: function(val) {
      if ( ! val ) return '0';
      val = val.toFixed(this.precision);
      var i = val.length-1;
      for ( ; i > 0 && val.charAt(i) === '0' ; i-- );
      return val.substring(0, val.charAt(i) === '.' ? i : i+1);
    },
    valueToText: function(val) {
      return this.hasOwnProperty('precision') ?
        this.formatNumber(val) :
        '' + val ;
    },
    textToValue: function(text) { return parseFloat(text) || 0; }
  }
});


CLASS({
  name: 'IntFieldView',

  extendsModel: 'AbstractNumberFieldView',

  methods: {
    textToValue: function(text) { return parseInt(text) || '0'; },
    valueToText: function(value) { return value ? value : '0'; }
  }
});



CLASS({
  name: 'UnitTestResultView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    },
    {
      name: 'test',
      defaultValueFn: function() { return this.parent.data; }
    }
  ],

  templates: [
    function toHTML() {/*
      <br>
      <div>Output:</div>
      <pre>
        <div class="output" id="<%= this.setClass('error', function() { return this.parent.data.failed; }, this.id) %>">
        </div>
      </pre>
    */},
   function toInnerHTML() {/*
     <%= TextFieldView.create({ data: this.data, mode: 'read-only', escapeHTML: false }) %>
   */}
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      var self = this;
      this.preTest();
      this.test.atest()(function() {
        self.postTest();
        self.X.asyncCallback && self.X.asyncCallback();
      });
    },
    preTest: function() {
      // Override me to insert logic at the start of initHTML, before running the test.
    },
    postTest: function() {
      this.updateHTML();
      // Override me to insert logic after running this test.
      // Called asynchronously, after atest() is really finished.
    }
  }
});

CLASS({
  name: 'RegressionTestValueView',
  extendsModel: 'TextFieldView',
  properties: [
    {
      name: 'mode',
      defaultValue: 'read-only'
    },
    {
      name: 'escapeHTML',
      defaultValue: false
    }
  ]
});


CLASS({
  name: 'RegressionTestResultView',
  label: 'Regression Test Result View',
  documentation: 'Displays the output of a $$DOC{.ref:"RegressionTest"}, either master or live.',

  extendsModel: 'UnitTestResultView',

  properties: [
    {
      name: 'masterView',
      defaultValue: 'RegressionTestValueView'
    },
    {
      name: 'liveView',
      defaultValue: 'RegressionTestValueView'
    },
    {
      name: 'masterID',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'liveID',
      factory: function() { return this.nextID(); }
    }
  ],

  actions: [
    {
      name: 'update',
      label: 'Update Master',
      documentation: 'Overwrite the old master output with the new. Be careful that the new result is legit!',
      isEnabled: function() { return this.test.regression; },
      action: function() {
        this.test.master = this.test.results;
        this.test.regression = false;
        if ( this.X.testUpdateListener ) this.X.testUpdateListener();
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <br>
      <div>Output:</div>
      <table id="<%= this.setClass('error', function() { return this.test.regression; }) %>">
        <tbody>
          <tr>
            <th>Master</th>
            <th>Live</th>
          </tr>
          <tr>
            <td class="output" id="<%= this.setClass('error', function() { return this.test.regression; }, this.masterID) %>">
              <% this.masterView = FOAM.lookup(this.masterView, this.X).create({ data$: this.test.master$ }); out(this.masterView); %>
            </td>
            <td class="output" id="<%= this.setClass('error', function() { return this.test.regression; }, this.liveID) %>">
              <% this.liveView = FOAM.lookup(this.liveView, this.X).create({ data$: this.test.results$ }); out(this.liveView); %>
            </td>
          </tr>
        </tbody>
      </table>
      $$update
    */}
  ]
});


CLASS({
  name: 'UITestResultView',
  label: 'UI Test Result View',
  help: 'Overrides the inner masterView and liveView for UITests.',

  extendsModel: 'UnitTestResultView',

  properties: [
    {
      name: 'liveView',
      getter: function() { return this.X.$(this.liveID); }
    },
    {
      name: 'liveID',
      factory: function() { return this.nextID(); }
    }
  ],

  methods: {
    preTest: function() {
      var test = this.test;
      var $ = this.liveView;
      test.append = function(s) { $.insertAdjacentHTML('beforeend', s); };
      test.X.render = function(v) {
        test.append(v.toHTML());
        v.initHTML();
      };
    }
  },

  templates: [
    function toHTML() {/*
      <br>
      <div>Output:</div>
        <div class="output" id="<%= this.setClass('error', function() { return this.test.failed > 0; }, this.liveID) %>">
        </div>
      </div>
    */}
  ]
});


CLASS({
  name: 'FutureView',
  extendsModel: 'View',
  // Works as follows: when it starts up, it will create a 10ms timer.
  // When the future is set, it begins listening to it.
  // In general, the 10ms timer expires before the future does, and then it
  // renders a spinner.
  // When the future resolves, it destroys the spinner and renders the view
  // passed by the future.
  // If the future resolves within the 10ms, then the spinner is never rendered.

  documentation: 'Expects a Future for a $$DOC{ref:"View"}. Shows a ' +
      '$$DOC{ref:"SpinnerView"} until the future resolves.',

  imports: [
    'clearTimeout',
    'setTimeout'
  ],

  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'spinnerView',
      documentation: 'The view to use for the spinner. Defaults to SpinnerView.',
      defaultValue: 'SpinnerView'
    },
    {
      name: 'future',
      required: true,
      documentation: 'The Future for this View. Returns a View.'
    },
    {
      name: 'timer',
      hidden: true,
      factory: function() {
        return this.setTimeout(this.onTimer, 500);
      }
    },
    {
      name: 'spinner',
      documentation: 'The View instance for the spinner.'
    },
    {
      name: 'childView',
      documentation: 'The real child view passed in the Future.'
    }
  ],

  listeners: [
    {
      name: 'onTimer',
      documentation: 'If the future resolves before the timer fires, the ' +
          'timer gets canceled. Since it fired, we know to render the spinner.',
      code: function() {
        this.timer = '';
        this.spinner = this.spinnerView();
        if ( this.$ ) {
          this.$.outerHTML = this.spinner.toHTML();
          this.spinner.initHTML();
        }
      }
    },
    {
      name: 'onFuture',
      code: function(view) {
        if ( this.timer ) this.clearTimeout(this.timer);

        var el;
        if ( this.spinner ) {
          el = this.spinner.$;
          this.spinner.destroy();
          this.spinner = '';
        } else {
          el = this.$;
        }
        this.childView = view;
        el.outerHTML = view.toHTML();
        view.initHTML();
      }
    }
  ],

  methods: {
    toHTML: function() {
      if ( this.childView ) return this.childView.toHTML();
      if ( this.spinner ) return this.spinner.toHTML();
      return this.SUPER();
    },
    initHTML: function() {
      if ( this.childView ) this.childView.initHTML();
      if ( this.spinner ) this.spinner.initHTML();
      this.SUPER();
      (this.future.get || this.future)(this.onFuture);
    },
    destroy: function() {
      if ( this.spinner ) this.spinner.destroy();
      if ( this.childView ) this.childView.destroy();
    }
  }
});


CLASS({
  name: 'SlidePanelView',
  extendsModel: 'View',

  requires: [
    'GestureTarget'
  ],
  imports: [
    'gestureManager'
  ],

  help: 'A controller that shows a main view with a small strip of the ' +
      'secondary view visible at the right edge. This "panel" can be dragged ' +
      'by a finger or mouse pointer to any position from its small strip to ' +
      'fully exposed. If the containing view is wide enough, both panels ' +
      'will always be visible.',

  properties: [
    { model_: 'ViewFactoryProperty', name: 'mainView' },
    { model_: 'ViewFactoryProperty', name: 'panelView' },
    {
      model_: 'IntProperty',
      name: 'minWidth',
      defaultValueFn: function() {
        var e = this.main$();
        return e ? toNum(this.X.window.getComputedStyle(e).width) : 300;
      }
    },
    {
      model_: 'IntProperty',
      name: 'width',
      model_: 'IntProperty',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, x) {
        this.main$().style.width = x + 'px';
      }
    },
    {
      model_: 'IntProperty',
      name: 'minPanelWidth',
      defaultValueFn: function() {
        if ( this.panelView && this.panelView.minWidth )
          return this.panelView.minWidth + (this.panelView.stripWidth || 0);

        var e = this.panel$();
        return e ? toNum(this.X.window.getComputedStyle(e).width) : 250;
      }
    },
    {
      model_: 'IntProperty',
      name: 'panelWidth',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, x) { this.panel$().style.width = x + 'px'; }
    },
    {
      model_: 'IntProperty',
      name: 'parentWidth',
      help: 'A pseudoproperty that returns the current width (CSS pixels) of the containing element',
      getter: function() { return toNum(this.X.window.getComputedStyle(this.$.parentNode).width); }
    },
    {
      model_: 'IntProperty',
      name: 'stripWidth',
      help: 'The width in (CSS) pixels of the minimal visible strip of panel',
      defaultValue: 30
    },
    {
      model_: 'FloatProperty',
      name: 'panelRatio',
      help: 'The ratio (0-1) of the total width occupied by the panel, when ' +
          'the containing element is wide enough for expanded view.',
      defaultValue: 0.5
    },
    {
      model_: 'IntProperty',
      name: 'panelX',
      //defaultValueFn: function() { this.width - this.stripWidth; },
      preSet: function(oldX, x) {
        if ( oldX !== x ) this.dir_ = oldX.compareTo(x);

        // Bound it between its left and right limits: full open and just the
        // strip.
        if ( x <= this.parentWidth - this.panelWidth )
          return this.parentWidth - this.panelWidth;

        if ( x >= this.parentWidth - this.stripWidth )
          return this.parentWidth - this.stripWidth;

        return x;
      },
      postSet: function(_, x) {
        this.panel$().style.webkitTransform = 'translate3d(' + x + 'px, 0,0)';
      }
    },
    {
      name: 'dragGesture',
      hidden: true,
      transient: true,
      lazyFactory: function() {
        return this.GestureTarget.create({
          containerID: this.id + '-panel',
          handler: this,
          gesture: 'drag'
        });
      }
    },
    'expanded'
  ],

  templates: [
    function CSS() {/*
      .SliderPanel .shadow {
        background: linear-gradient(to left, rgba(0,0,0,0.3) 0%,
                                             rgba(0,0,0,0) 100%);
        height: 100%;
        left: -8px;
        position: absolute;
        width: 8px;
        }
    */},
    function toHTML() {/*
      <div id="%%id" style="display: inline-block;position: relative;" class="SliderPanel">
        <div id="%%id-main">
          <div style="width:0;position:absolute;"></div>
          <%= this.mainView() %>
        </div>
        <div id="%%id-panel" style="position: absolute; top: 0; left: 0">
          <div id="%%id-shadow" class="shadow"></div>
          <%= this.panelView() %>
        </div>
      </div>
    */}
  ],

  methods: {
    initHTML: function() {
      this.gestureManager.install(this.dragGesture);

      // Resize first, then init the outer view, and finally the panel view.
      this.X.window.addEventListener('resize', this.onResize);
      this.onResize();
      this.initChildren(); // We didn't call SUPER(), so we have to do this here.
    },
    snap: function() {
      // TODO: Calculate the animation time based on how far the panel has to move
      Movement.animate(500, function() {
        this.panelX = this.dir_ > 0 ? 0 : 1000;
      }.bind(this))();
    },
    main$: function() { return this.X.$(this.id + '-main'); },
    panel$: function() { return this.X.$(this.id + '-panel'); },
    shadow$: function() { return this.X.$(this.id + '-shadow'); }
  },

  listeners: [
    {
      name: 'onResize',
      isFramed: true,
      code: function(e) {
        if ( ! this.$ ) return;
        if ( this.parentWidth >= this.minWidth + this.minPanelWidth ) {
          this.shadow$().style.display = 'none';
          // Expaded mode. Show the two side by side, setting their widths
          // based on the panelRatio.
          this.panelWidth = Math.max(this.panelRatio * this.parentWidth, this.minPanelWidth);
          this.width = this.parentWidth - this.panelWidth;
          this.panelX = this.width;
          this.expanded = true;
        } else {
          this.shadow$().style.display = 'inline';
          this.width = Math.max(this.parentWidth - this.stripWidth, this.minWidth);
          this.panelWidth = this.minPanelWidth;
          this.panelX = this.width;
          this.expanded = false;
        }
      }
    },
    {
      name: 'dragStart',
      code: function(point) {
        if ( this.expanded ) return;
        // Otherwise, bind panelX to the absolute X.
        var self = this;
        var originalX = this.panelX;
        Events.map(point.x$, this.panelX$, function(x) {
          return originalX + point.totalX;
        });
      }
    },
    {
      name: 'dragEnd',
      code: function(point) {
        if ( this.expanded ) return;
        Events.unfollow(point.x$, this.panelX$);
        this.snap();
      }
    }
  ]
});
