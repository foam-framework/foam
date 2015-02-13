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
        // Attributes of hte form #name are treated as a reference to
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
    if ( onLoad ) {
      Function(onLoad).bind(obj)();
    }

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

        view = DetailView.create({ model: model, data: obj, showActions: showActions })
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


// ??? Should this have a 'data' property?
// Or maybe a DataView and ModelView
CLASS({
  name: 'View',
  label: 'View',

  traits: ['foam.patterns.ChildTreeTrait'],

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
      name: 'tabIndex'
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
      name: 'propertyViewProperty',
      type: 'Property',
      defaultValueFn: function() { return this.X.Property.VIEW; }
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
        // console.log('***** key: ', this.evtToKeyCode(evt), evt);
        var action = this.keyMap_[this.evtToKeyCode(evt)];
        if ( action ) {
          action();
          evt.preventDefault();
          evt.stopPropagation();
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
      var o = this.model_.getFeature(name);

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

      return this.SUPER(child);
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
        var target = this.X.foam.input.touch.GestureTarget.create({
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
      this.construct();
    },

    construct: function() { /* rebuilds the children of the view */
      this.SUPER();
      if ( ! this.$ ) return;
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
      if ( evt.altKey ) s += 'alt-';
      if ( evt.ctrlKey ) s += 'ctrl-';
      if ( evt.shiftKey ) s += 'shift-';
      if ( evt.metaKey ) s += 'meta-';
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
            // Treat single character strings as a character to be recognized
            if ( typeof key === 'string' && key.length == 1 )
              key = key.toUpperCase().charCodeAt(0);
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
//        this.X.document.body.addEventListener('keydown', this.onKeyboardShortcut);
      }
    },

    destroy: function() {
      /* Cleans up the DOM when regenerating content. You should call this before
         creating new HTML in your $$DOC{ref:'.toInnerHTML'} or $$DOC{ref:'.toHTML'}. */
      // TODO: remove listeners
      this.invokeDestructors();

      this.SUPER();

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
        if ( p ) p[this.prop.name + 'View'] = this.view;
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
