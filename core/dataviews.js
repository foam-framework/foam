/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
 
 
CLASS({
  name: 'DataProviderTrait',
  package: 'foam.experimental.views',
  
  documentation: function() {/*
    Trait for providers of a data property. It contains a $$DOC{ref:'.data'}
    property and exports it by reference to the context.
  */},
  
  //exports: ['data$ as data$'],
  
  properties: [
    {
      name: 'data',
      help: 'Child data value provided to consumers.',
      documentation: function() {/* 
        The value provided to consumers child (children) of this provider.
      */},
      preSet: function(old, nu) {
        // if the new data from child is ok, let it be set and propagate
        if (this.internallySettingChildData_ ||
            this.validateChildDataChange(old, nu)) {
          return nu;
        } else {
          return old;
        }
      },
      postSet: function(old, nu) {
        if (!this.internallySettingChildData_) {
          this.propagateChildDataChange(old, nu);
        }
      }
    },
    {
      name: 'internallySettingChildData_',
      model_: 'BooleanProperty',
      defaultValue: false
    },
    {
      name: 'originalContext_',
      hidden: true
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      
      // juggle context and export data$
      this.originalContext_ = this.X;
      this.X = this.originalContext_.sub({data$: this.data$});
    },
    
    internalSetChildData: function(nu) { 
          /* Sets $$DOC{ref:'.data'} without invoking validator 
              and propagators, but does notify children. */
        this.internallySettingChildData_ = true;
        this.data = nu;
        this.internallySettingChildData_ = false;
    },
    
    validateChildDataChange: function(old, nu) {
      /* Override to validate changed data from child consumers.
      Return true if the change is good to process and propagate parent.
      Returning false will force the child data back to its old value. */
      return true;
    },
    propagateChildDataChange: function(old, nu) {
      /* Override to transform data from child children and pass 
      changes parent. Propagation may be stopped here if changes should
      not interest the provider. */
      
      // by default just pass it along
      if (this.internalSetParentData) this.internalSetParentData(nu); 
    }, 
    
    destroy: function() {
      /* Called to tear down children. Also let the previous child context
        be garbage collected. */
      this.X = this.originalContext_;
      if (arguments.callee.caller.super_) this.SUPER();
    },
    
    construct: function() {
      /* Called to construct new content and children. Create a new context
         for the children and export our data. */
      if (arguments.callee.caller.super_) this.SUPER();
      this.X = this.originalContext_.sub({data$: this.data$});
    }
  }
  
});
 
  
CLASS({
  name: 'DataConsumerTrait',
  package: 'foam.experimental.views',
  
  documentation: function() {/*
    Trait for consumers of a data property. It contains 
    an $$DOC{ref:'.parentData'}
    property and imports it by reference from the context.
  */},
  
  imports: ['data$ as parentData$'],
  
  properties: [
    {
      name: 'parentData',
      help: 'Parent data value from provider.',
      documentation: function() {/* 
        The value provided from parent (by the parent).
      */},
      postSet: function(old, nu) {
        // check if we should progagate the change, if so, set data
        if (!this.internallySettingParentData_) {
          this.propagateParentDataChange(old, nu);
        }
      }
    },
    {
      name: 'internallySettingParentData_',
      model_: 'BooleanProperty',
      defaultValue: false
    }

  ],
  
  methods: {
    internalSetParentData: function(nu) { 
      /* Sets $$DOC{ref:'.parentData'} without invoking validator
        and propagators. */
        this.internallySettingParentData_ = true;
        this.parentData = nu;
        this.internallySettingParentData_ = false;
    },

    propagateParentDataChange: function(old, nu) {
      /* Override to halt or transform data propagating child to children.</p>
      <p>Transformation may include unpacking a value from the 
      $$DOC{ref:'.parentData'} and binding that to $$DOC{ref:'.data'}.</p>
      <p>One example of halting propagation would be if the data value
      changes enough that the current children will be destroyed, so
      propagation before they are re-created is a waste. */
      
      // by default just pass it along
      if (this.internalSetChildData) this.internalSetChildData(nu); 
    }
  }
});

CLASS({
  name: 'ChildTreeTrait',
  package: 'foam.experimental.views',
  
  properties: [
    {
      name: 'parent',
      type: 'foam.experimental.views.ChildTreeTrait',
      hidden: true
    },
    {
      name: 'children',
      type: 'Array[foam.experimental.views.ChildTreeTrait]',
      factory: function() { return []; },
      documentation: function() {/*
        $$DOC{ref:'ChildTreeTrait',usePlural:true} children are arranged in a tree.
      */}
    }
  ],
  
  methods: {
    addChild: function(child) {
      /*
        Maintains the tree structure of $$DOC{ref:'View',usePlural:true}. When
        a sub-$$DOC{ref:'View'} is created, add it to the tree with this method.
      */
      if (arguments.callee.caller.super_) this.SUPER(child);

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
      if (arguments.callee.caller.super_) this.SUPER(child);
      
      child.destroy();
      this.children.deleteI(child);
      child.parent = undefined;

      return this;
    },

    addChildren: function() {
      /* Adds multiple children at once. */
      Array.prototype.forEach.call(arguments, this.addChild.bind(this));

      return this;
    },
    
    destroy: function() {
      if (arguments.callee.caller.super_) this.SUPER();
      
      var list = this.children.slice();
      Array.prototype.forEach.call(arguments, this.removeChild.bind(this));

      return this;      
    },
    
    construct: function() {
      /* Template method. After a destroy(), construct() is called to fill in the object again. If
         any special children need to be re-created, do it here. */
      if (arguments.callee.caller.super_) this.SUPER();

      return this;      
    },
    
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
    }

  }
});

// CLASS({
//   name: 'ExampleDataHandler',
//   package: 'foam.experimental.views',
//   traits: ['foam.experimental.views.DataConsumerTrait', 'foam.experimental.views.DataProviderTrait'],
//    
//   methods: {
//     validateChildDataChange: function(old, nu) {
//       /* Implement me */
//       return /*boolean*/
//     },
//     propagateChildDataChange: function(old, nu) {
//       /* Implement me */
//     },
//     propagateParentDataChange: function(old, nu) {
//       /* Implement me */
//     } 
//   } 
// });




CLASS({
  name: 'ViewTrait',
  label: 'View',
  package: 'foam.experimental.views',
  
  //traits: ['foam.experimental.views.DataProviderTrait',
  //         'foam.experimental.views.ChildTreeTrait'],


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
  */},
  
  properties: [
    {
      name: 'self',
      help: 'Child "this" value provided to consumers.',
      documentation: function() {/* 
        The value provided to consumers child (children) of this provider when constructed
        from properties of this view.
      */},
      factory: function() { return this; }
    },
  ],

  constants: {
    // TODO?: Model as Topics
    ON_HIDE: ['onHide'], // Indicates that the View has been hidden
    ON_SHOW: ['onShow']  // Indicates that the View is now being reshown
  },

  methods: {

    validateChildDataChange: function(old, nu) {
      /* Since our data is ourself, we can't allow it to be swapped out
         for something else. */
      return false;
    },

    toView_: function() { return this; },

    viewModel: function() {
      /* The $$DOC{ref:'Model'} definition of this $$DOC{ref:'View'}. */
      return this.model_;
    },

    createView: function(prop, opt_args) {
      /* Creates a sub-$$DOC{ref:'View'} from $$DOC{ref:'Property'} info. */
      var X = ( opt_args && opt_args.X ) || this.X;
      var v = X.foam.experimental.views.HTMLPropertyView.create({prop: prop, args: opt_args}, X);
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
      // for properties of this view, use our 'self' property as child data
      args.X = this.X.sub({data$: this.self$});

      var v;
      if ( Action.isInstance(o) )
        v = this.createActionView(o, args);
      else
        v = this.createView(o, args);

      return v;
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





/////////////////////////////////////////////// Existing HTML views refactor:



CLASS({
  name: 'HTMLView',
  label: 'HTMLView',
  traits: ['foam.experimental.views.ViewTrait',
           'foam.experimental.views.DataProviderTrait',
           'foam.experimental.views.ChildTreeTrait'],
  package: 'foam.experimental.views',
  
  
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
        return this.instance_.$ ? this.instance_.$ : this.instance_.$ = this.X.document.getElementById(this.id);
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


  methods: {
    
    init: function() {
      this.SUPER();
      this.construct();
    },

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


    focus: function() {
      /* Cause the view to take focus. */
      if ( this.$ && this.$.focus ) this.$.focus();
    },


    addShortcut: function(key, callback, context) {
      /* Add a keyboard shortcut. */
      this.shortcuts.push([key, callback, context]);
    },

    // TODO: make use new static_ scope when available
    nextID: function() {
      /* Convenience method to return unique DOM element ids. */
      return "viewNew" + (arguments.callee._nextId = (arguments.callee._nextId || 0) + 1);
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
        });
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

    construct: function() {
      this.SUPER();
      this.updateHTML();
    },
    
    destroy: function() {
      /* Cleans up the DOM when regenerating content. You should call this before
         creating new HTML in your $$DOC{ref:'.toInnerHTML'} or $$DOC{ref:'.toHTML'}. */
      // TODO: remove listeners   
      this.invokeDestructors();
      delete this.instance_.$;
      this.SUPER();
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
  name: 'DetailViewTrait',
  package: 'foam.experimental.views',
  
  documentation:function() {/*
    When a view based on $$DOC{ref:'Property'} values is desired, $$DOC{ref:'DetailView'}
    is the place to start. Either using $$DOC{ref:'DetailView'} directly, implementing
    a .toDetailHTML() $$DOC{ref:'Method'} in your model, or extending
    $$DOC{ref:'DetailView'} to add custom formatting.
    </p>
    <p>Set the $$DOC{ref:'.data'} $$DOC{ref:'Property'} to the $$DOC{ref:'Model'} instance
    you want to display. $$DOC{ref:'DetailView'} will extract the $$DOC{ref:'Model'}
    definition, create editors for the $$DOC{ref:'Property',usePlural:true}, and
    display the current values of your instance. Set $$DOC{ref:'.mode',usePlural:true}
    to indicate read-only if desired.
    </p>
  */},

  properties: [
    {
      name:  'model',
      type:  'Model',
      documentation: function() {/*
        The $$DOC{ref:'.model'} is extracted from $$DOC{ref:'.data'}, or can be
        set in advance when the type of $$DOC{ref:'.data'} is known. The $$DOC{ref:'Model'}
        is used to set up the structure of the $$DOC{ref:'DetailView'}, by examining the
        $$DOC{ref:'Property',usePlural:true}. Changing the $$DOC{ref:'.data'} out
        for another instance of the same $$DOC{ref:'Model'} will refresh the contents
        of the sub-views without destroying and re-creating them.
      */}
    },
    {
      name: 'title',
      defaultValueFn: function() { return "Edit " + this.model.label; },
      documentation: function() {/*
        <p>The display title for the $$DOC{ref:'View'}.
        </p>
      */}
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write',
      documentation: function() {/*
        The editing mode. To disable editing set to 'read-only'.
      */}
    },
    {
      model_: 'BooleanProperty',
      name: 'showRelationships',
      defaultValue: false,
      documentation: function() {/*
        Set true to create sub-views to display $$DOC{ref:'Relationship',usePlural:true}
        for the $$DOC{ref:'.model'}.
      */}
    }
  ],

  methods: {

    propagateParentDataChange: function(old, nu) {
      if ( nu && nu.model_ && this.model !== nu.model_ ) {
        // destroy children
        this.destroy();
        // propagate data change (nowhere)
        this.model = nu.model_;
        this.internalSetChildData(nu);
        // rebuild children with new data
        this.construct();
      } else {
        this.internalSetChildData(nu); // just move the new data along
      }
      this.onValueChange_(); // always let subclasses have their chance to react afterwards
    },

    // Template Method
    onValueChange_: function() { /* Override with value update code. */ },

    viewModel: function() { /* The $$DOC{ref:'Model'} type of the $$DOC{ref:'.data'}. */
      return this.model;
    },

    createTemplateView: function(name, opt_args) {
      /* Overridden here to set the new View.$$DOC{ref:'.data'} to this.$$DOC{ref:'.data'}.
         See $$DOC{ref:'View.createTemplateView'}. */
      if (this.viewModel()) {
        var o = this.viewModel().getFeature(name);
        if ( o ) { 
          if (Action.isInstance(o))
            return this.createActionView(o, opt_args);
          else
            return this.createView(o, opt_args);
        }
      }
      return this.SUPER(name, opt_args);
    }

  }
});

CLASS({
  name: 'HTMLDetailView',
  extendsModel: 'foam.experimental.views.HTMLView',
  package: 'foam.experimental.views',
  traits: ['foam.experimental.views.DataConsumerTrait',
           'foam.experimental.views.DetailViewTrait'],

  
  documentation:function() {/*
    When a view based on $$DOC{ref:'Property'} values is desired, $$DOC{ref:'DetailView'}
    is the place to start. Either using $$DOC{ref:'DetailView'} directly, implementing
    a .toDetailHTML() $$DOC{ref:'Method'} in your model, or extending
    $$DOC{ref:'DetailView'} to add custom formatting.
    </p>
    <p>Set the $$DOC{ref:'.data'} $$DOC{ref:'Property'} to the $$DOC{ref:'Model'} instance
    you want to display. $$DOC{ref:'DetailView'} will extract the $$DOC{ref:'Model'}
    definition, create editors for the $$DOC{ref:'Property',usePlural:true}, and
    display the current values of your instance. Set $$DOC{ref:'.mode',usePlural:true}
    to indicate read-only if desired.
    </p>
    <p>$$DOC{ref:'Model',usePlural:true} may specify a .toDetailHTML() $$DOC{ref:'Method'} or
    $$DOC{ref:'Template'} to render their contents instead of
    $$DOC{ref:'DetailView.defaultToHTML'}.
    </p>
    <p>For each $$DOC{ref:'Property'} in the $$DOC{ref:'.data'} instance specified,
    a $$DOC{ref:'PropertyView'} is created that selects the appropriate $$DOC{ref:'View'}
    to construct.
  */},

  properties: [
    {
      name: 'className',
      defaultValue: 'detailView',
      documentation: function() {/*
          The CSS class names to use for HTML $$DOC{ref:'View',usePlural:true}.
          Separate class names with spaces. Each instance of a $$DOC{ref:'DetailView'}
          may have different classes specified.
      */}
    },
  ],

  methods: {

    titleHTML: function() {
      /* Title text HTML formatter */
      var title = this.title;

      return title ?
        '<tr><th colspan=2 class="heading">' + title + '</th></tr>' :
        '';
    },

    startForm: function() { /* HTML formatter */ return '<table>'; },
    endForm: function() { /* HTML formatter */ return '</table>'; },

    startColumns: function() { /* HTML formatter */ return '<tr><td colspan=2><table valign=top><tr><td valign=top><table>'; },
    nextColumn:   function() { /* HTML formatter */ return '</table></td><td valign=top><table valign=top>'; },
    endColumns:   function() { /* HTML formatter */ return '</table></td></tr></table></td></tr>'; },

    rowToHTML: function(prop, view) {
      /* HTML formatter for each $$DOC{ref:'Property'} row. */
      var str = "";

      if ( prop.detailViewPreRow ) str += prop.detailViewPreRow(this);

      str += '<tr class="detail-' + prop.name + '">';
      if ( DAOController.isInstance(view) ) {
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

    // If the Model supplies a toDetailHTML method, then use it instead.
    toHTML: function() {
      /* Overridden to create the complete HTML content for the $$DOC{ref:'View'}.</p>
         <p>$$DOC{ref:'Model',usePlural:true} may specify a .toDetailHTML() $$DOC{ref:'Method'} or
         $$DOC{ref:'Template'} to render their contents instead of the
          $$DOC{ref:'DetailView.defaultToHTML'} we supply here.
      */

      if ( ! this.model ) throw "DetailView: either 'data' or 'model' must be specified.";

      return (this.model.getPrototype().toDetailHTML || this.defaultToHTML).call(this);
    },

    defaultToHTML: function() {
      /* For $$DOC{ref:'Model',usePlural:true} that don't supply a .toDetailHTML()
        $$DOC{ref:'Method'} or $$DOC{ref:'Template'}, a default listing of
        $$DOC{ref:'Property'} editors is implemented here.
        */
      this.children = [];
      var model = this.model;
      var str  = "";

      str += '<div id="' + this.id + '" ' + this.cssClassAttr() + '" name="form">';
      str += this.startForm();
      str += this.titleHTML();

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        var view = this.createView(prop);
        str += this.rowToHTML(prop, view);
      }

      str += this.endForm();

      if ( this.showRelationships ) {
        var view = this.X.RelationshipsView.create();
        str += view.toHTML();
        this.addChild(view);
      }

      str += '</div>';

      return str;
    }
  }
});


CLASS({
  name: 'HTMLUpdateDetailView',
  extendsModel: 'foam.experimental.views.HTMLDetailView',
  package: 'foam.experimental.views',
  traits: ['foam.experimental.views.UpdateDetailViewTrait']
});

CLASS({
  name: 'UpdateDetailViewTrait',
  package: 'foam.experimental.views',
  
  documentation:function() {/*
    UNTESTED: proof of concept for data handling
  */},

  imports: ['DAO as dao'],

  properties: [
    {
      name: 'originalData',
      documentation: 'A clone of the parent data, for comparison with edits.'
    },
    {
      name: 'dao'
    },
    {
      name: 'stack',
      defaultValueFn: function() { return this.X.stack; }
    },
    {
      name: 'view'
    },
    {
      // Version of the data which changes whenever any property of the data is updated.
      // Used to help trigger isEnabled / isAvailable in Actions.
      model_: 'IntProperty',
      name: 'version'
    }
  ],

  methods: {
    propagateParentDataChange: function(old, nu) {
      // since we're cloning the propagated data, we have to listen
      // for changes to the parentData and clone again 
      if ( old ) old.removeListener(this.parentContentsChanged);
      if ( nu ) nu.addListener(this.parentContentsChanged);
      
      if (!nu) return;
      // propagate a clone and build children
      this.SUPER(old, nu.deepClone());
      this.originalData = nu.deepClone();

      data.addListener(function() {
        // The user is making edits. Don't listen for parent changes,
        // since we no longer want to react to updates to it.
        this.version++;
        this.parentData.removeListener(this.parentContentsChanged);
      }.bind(this));
    } 
 
  },
  
  listeners: [
    {
      name: 'parentContentsChanged',
      code: function() {
        // If this listener fires, the parent data has changed internally
        // and the user hasn't edited our copy yet, so keep the clones updated.
        this.data.copyFrom(this.parentData);
        this.originalData.copyFrom(this.parentData);
      }
    }
  ],

  actions: [
    {
      name:  'save',
      help:  'Save updates.',

      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      action: function() {
        var self = this;
        var obj  = this.data;
        this.stack.back();

        this.dao.put(obj, {
          put: function() {
            console.log("Saving: ", obj.toJSON());
            self.originalData.copyFrom(obj);
          },
          error: function() {
            console.error("Error saving", arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',
      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      action: function() { this.stack.back(); }
    },
    {
      name:  'back',
      isAvailable: function() { this.version; return this.originalData.equals(this.data); },
      action: function() { this.stack.back(); }
    },
    {
      name: 'reset',
      isAvailable: function() { this.version; return ! this.originalData.equals(this.data); },
      action: function() { this.data.copyFrom(this.originalData); } // or do we want parentData?
    }
  ]
});



CLASS({
  name: 'PropertyViewTrait',
  package: 'foam.experimental.views',

  documentation: function() {/*
    Apply this trait to a $$DOC{ref:'ViewTrait'} (such as $$DOC{ref:'HTMLView'}).</p>
    <p>Used by $$DOC{ref:'DetailView'} to generate a sub-$$DOC{ref:'View'} for one
    $$DOC{ref:'Property'}. The $$DOC{ref:'View'} chosen can be based off the
    $$DOC{ref:'Property.view',text:'Property.view'} value, the $$DOC{ref:'.innerView'} value, or
    $$DOC{ref:'.args'}.model_.
  */},

  properties: [
    {
      name: 'prop',
      type: 'Property',
      documentation: function() {/*
          The $$DOC{ref:'Property'} for which to generate a $$DOC{ref:'View'}.
      */},
      postSet: function() {
        // if we got data first, we'll need to propagate it now that 
        // we know which property to use
        if (this.parentData) this.parentPropertyChange();
      }
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
    validateChildDataChange: function(old, nu) {
      return true;
    },
    propagateChildDataChange: function(old, nu) {
      // pack the new value into our parent
      this.parentData[this.prop.name] = nu;
    },
    propagateParentDataChange: function(old, nu) {
      this.unbindData(old);
      this.bindData(nu);
    }, 

    init: function() {
      /* Sets up the new sub-$$DOC{ref:'View'} immediately. */
      this.SUPER();
      this.construct();
    },

    fromElement: function(e) {
      this.view.fromElement(e);
      return this;
    },

    createViewFromProperty: function(prop) {
      /* Helper to determine the $$DOC{ref:'View'} to use. */
      var viewName = this.innerView || prop.view
      if ( ! viewName ) return this.X.TextFieldView.create(prop);
      if ( typeof viewName === 'string' ) return this.X[viewName].create(prop);
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
      if (oldData) oldData.removeListener(this.parentPropertyChange);
    },

    bindData: function(nuData) {
      /* Bind data to the new view. */
      if (nuData) nuData.addListener(this.parentPropertyChange);
      this.parentPropertyChange(); // trigger it to do initial set
    },


    toString: function() { /* Name info. */ return 'PropertyView(' + this.prop.name + ', ' + this.view + ')'; },

    destroy: function() { /* Passthrough to $$DOC{ref:'.view'} */
      this.view.destroy();
      this.SUPER();
    },
    
    construct: function() {
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
      //this.bindData(this.data);
    }
  },
  
  listeners: [
    {
      name: 'parentPropertyChange',
      code: function() {
        if (this.prop) this.internalSetChildData(this.parentData[this.prop.name]);
      }
    }
  ]
});

CLASS({
  name: 'HTMLPropertyView',

  extendsModel: 'foam.experimental.views.HTMLView',
  package: 'foam.experimental.views',
  traits: ['foam.experimental.views.DataConsumerTrait',
           'foam.experimental.views.PropertyViewTrait'], 

  documentation: function() {/*
    Used by $$DOC{ref:'DetailView'} to generate a sub-$$DOC{ref:'View'} for one
    $$DOC{ref:'Property'}. The $$DOC{ref:'View'} chosen can be based off the
    $$DOC{ref:'Property.view',text:'Property.view'} value, the $$DOC{ref:'.innerView'} value, or
    $$DOC{ref:'.args'}.model_.
  */},
  
  methods: {
    toHTML: function() { /* Passthrough to $$DOC{ref:'.view'} */ return this.view.toHTML(); },
    initHTML: function() { /* Passthrough to $$DOC{ref:'.view'} */ this.view.initHTML(); },
  },
  
});


