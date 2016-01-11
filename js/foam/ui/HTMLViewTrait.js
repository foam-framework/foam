/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.ui',
  name: 'HTMLViewTrait',
  label: 'HTMLView',

  requires: [
    'foam.input.touch.GestureTarget',
    'foam.ui.ActionBorder',
    'foam.ui.PropertyView',
    'foam.ui.AsyncLoadingView'
  ],

  documentation: function() {/*
    The HTML implementation for $$DOC{ref:'foam.ui.View'}.
  */},

  constants: {
    // Keys which respond to keydown but not keypress
    KEYPRESS_CODES: { 8: true, 33: true, 34: true, 37: true, 38: true, 39: true, 40: true },
    NAMED_CODES: {
      '37': 'left',
      '38': 'up',
      '39': 'right',
      '40': 'down'
    },
    // TODO?: Model as Topics
    ON_HIDE: ['onHide'], // Indicates that the View has been hidden
    ON_SHOW: ['onShow']  // Indicates that the View is now being reshown
  },

  properties: [
    {
      name:  'id',
      label: 'Element ID',
      type:  'String',
      factory: function() { return this.instance_.id || this.nextID(); },
      documentation: function() {/*
        The DOM element id for the outermost tag of
        this $$DOC{ref:'foam.ui.View'}.
      */}
    },
    {
      model_: 'foam.core.types.DocumentInstallProperty',
      name: 'installCSS',
      documentInstallFn: function(X) {
        for ( var i = 0 ; i < this.model_.templates.length ; i++ ) {
          var t = this.model_.templates[i];
          if ( t.name === 'CSS' ) {
            t.futureTemplate(function() {
              X.addStyle(this);
            }.bind(this));
            return;
          }
        }
      }
    },
    {
      name:   'shortcuts',
      // type:   'Array[Shortcut]',
      factory: function() { return []; },
      documentation: function() {/*
        Keyboard shortcuts for the view. TODO ???
      */}
    },
    {
      // TODO(kgr): rename this because it conflicts with X.$.
      name:   '$',
      hidden: true,
      mode:   "read-only",
      setter: function() { debugger; },
      getter: function() { return this.X.document.getElementById(this.id); },
      help: 'DOM Element.'
    },
    {
      name: 'tagName',
      defaultValue: 'span',
      documentation: function() {/*
          The HTML tag name to use for HTML $$DOC{ref:'foam.ui.View',usePlural:true}.
      */}
    },
    {
      name: 'className',
      help: 'CSS class name(s), space separated.',
      defaultValue: '',
      documentation: function() {/*
          The CSS class names to use for HTML $$DOC{ref:'foam.ui.View',usePlural:true}.
          Separate class names with spaces. Each instance of a $$DOC{ref:'foam.ui.View'}
          may have different classes specified.
      */},
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
          For custom $$DOC{ref:'foam.ui.View',usePlural:true}, you may wish to add standard
          CSS classes in addition to user-specified ones. Set those here and
          they will be appended to those from $$DOC{ref:'.className'}.
      */},
    },
    {
      name: 'propertyViewProperty',
      // type: 'Property',
      defaultValueFn: function() { return this.X.Property.VIEW; }
    },
    {
      name: 'initializers_',
      factory: function() { return []; },
      documentation: function() {/*
          When creating new HTML content, intializers are run. This corresponds
          to the lifecycle of the HTML (which may be replaced by toHTML() at any
          time), not the lifecycle of this $$DOC{ref:'foam.ui.View'}.
      */}
    },
    {
      name: 'destructors_',
      factory: function() { return []; },
      documentation: function() {/*
          When destroying HTML content, destructors are run. This corresponds
          to the lifecycle of the HTML (which may be replaced by toHTML() at any
          time), not the lifecycle of this $$DOC{ref:'foam.ui.View'}.
      */}
    },
   {
      type: 'Boolean',
      name: 'showActions',
      defaultValue: false,
      postSet: function(oldValue, showActions) {
        // TODO: No way to remove the decorator.
        if ( ! oldValue && showActions ) {
          this.addDecorator(this.ActionBorder.create());
        }
      },
      documentation: function() {/*
          If $$DOC{ref:'Action',usePlural:true} are set on this $$DOC{ref:'foam.ui.View'},
          this property enables their automatic display in an $$DOC{ref:'ActionBorder'}.
          If you do not want to show $$DOC{ref:'Action',usePlural:true} or want
          to show them in a different way, leave this false.
      */}
    },
    {
      name: 'minWidth',
      documentation: 'Allows specifying the minimum width of a view. ' +
          'This is optional, and only used by views attempting responsive ' +
          'layouts, such as $$DOC{ref:"foam.browser.ui.StackView"}.',
      defaultValue: 300
    },
    {
      name: 'minHeight',
      documentation: 'Allows specifying the minimum height of a view. ' +
          'This is optional, and only used by views attempting advanced ' +
          'layouts, such as $$DOC{ref:"foam.ui.ScrollView"}.',
      defaultValue: 0
    },
    {
      name: 'preferredWidth',
      documentation: 'Allows specifying the preferred width of a view. ' +
          'This is optional, and only used by views attempting responsive ' +
          'layouts, such as $$DOC{ref:"foam.browser.ui.StackView"}.',
      defaultValue: 400
    },
    {
      name: 'preferredHeight',
      documentation: 'Allows specifying the preferred height of a view. ' +
          'This is optional, and only used by views attempting advanced ' +
          'layouts, such as $$DOC{ref:"foam.ui.ScrollView"}.',
      defaultValue: 40
    },
    {
      name: 'maxWidth',
      documentation: 'Allows specifying the maximum width of a view. ' +
          'This is optional, and only used by views attempting responsive ' +
          'layouts, such as $$DOC{ref:"foam.browser.ui.StackView"}.',
      defaultValue: 10000
    },
    {
      name: 'maxHeight',
      documentation: 'Allows specifying the maximum height of a view. ' +
          'This is optional, and only used by views attempting advanced ' +
          'layouts, such as $$DOC{ref:"foam.ui.ScrollView"}.',
      defaultValue: 10000
    },
    {
      name: '$parent',
      getter: function() {
        return this.$ ? this.$.parentElement : null;
      }
    }
  ],

  listeners: [
    {
      name: 'openTooltip',
      code: function(e) {
        console.assert(! this.tooltip_, 'Tooltip already defined');
        this.X.arequire('foam.ui.Tooltip')(function(Tooltip) {
          if (!Tooltip) return;
          this.tooltip_ = Tooltip.create({
            text:   this.tooltip,
            target: this.$
          }, this.Y);
        }.bind(this));
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
        // Why was this here?  It was breaking Calculator.
        // if ( evt.srcElement !== this.$parent ) return;
        if ( evt.type === 'keydown' && ! this.KEYPRESS_CODES[evt.which] ) return;
        var action = this.keyMap_[this.evtToCharCode(evt)];
        if ( action ) {
          action();
          evt.preventDefault();
          evt.stopPropagation();
        }
      },
      documentation: function() {/*
          Automatic mapping of keyboard events to $$DOC{ref:'Action'} trigger.
          To handle keyboard shortcuts, create and attach $$DOC{ref:'Action',usePlural:true}
          to your $$DOC{ref:'foam.ui.View'}.
      */}
    }
  ],

  methods: {

    strToHTML: function(str) {
      /*
        Escape the string to make it HTML safe.
        */
      return XMLUtil.escape(str.toString())
    },

    cssClassAttr: function() {
      /*
        Returns the full CSS class to use for the $$DOC{ref:'foam.ui.View'} DOM element.
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

    bindSubView: function(view, prop) {
      /*
        Bind a sub-$$DOC{ref:'foam.ui.View'} to a $$DOC{ref:'Property'} of this.
       */
      view.setValue(this.propertyValue(prop.name));
    },

    focus: function() {
      /* Cause the view to take focus. */
      if ( this.$ && this.$.focus ) this.$.focus();
    },

    addChild: function(child) {
      /*
        Maintains the tree structure of $$DOC{ref:'foam.ui.View',usePlural:true}. When
        a sub-$$DOC{ref:'foam.ui.View'} is created, add it to the tree with this method.
      */
      // Checked needed for legacy CViews, remove once they're gone.
      if ( child.toView_ ) child = child.toView_();
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

    resize: function() {
      /* Call when you've changed your size to allow for the possibility of relayout. */
      var e = this.X.document.createEvent('Event');
      e.initEvent('resize', true, true);
      if ( this.$ ) this.X.window.getComputedStyle(this.$);
      this.X.window.dispatchEvent(e);
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
        var target = this.GestureTarget.create({
          containerID: opt_id,
          enforceContainment: true,
          handler: {
            tapClick: function(pointMap) {
              // Create a fake event.
              return listener({
                preventDefault: function() { },
                stopPropagation: function() { },
                pointMap: pointMap,
                target: self.X.$(opt_id)
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
      var self = this;
      opt_id = opt_id || this.nextID();
      valueFn = valueFn.bind(this);
      this.addInitializer(function() {
        self.X.dynamicFn(valueFn, function() {
          var e = self.X.$(opt_id);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          var newValue = valueFn(e.getAttribute(attributeName));
          if ( newValue == undefined )
            e.removeAttribute(attributeName);
          else
            e.setAttribute(attributeName, newValue);
        })
      });
    },

    setStyle: function(styleName, valueFn, opt_id) {
      /* Set a dynamic attribute on the DOM element. */
      var self = this;
      opt_id = opt_id || this.nextID();
      valueFn = valueFn.bind(this);
      this.addInitializer(function() {
        self.X.dynamicFn(valueFn, function(value) {
          var e = self.X.$(opt_id);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          e.style[styleName] = value;
        })
      });

      return opt_id;
    },

    setClass: function(className, predicate, opt_id) {
      var self = this;
      /* Set a dynamic CSS class on the DOM element. */
      opt_id = opt_id || this.nextID();
      predicate = predicate.bind(this);

      this.addInitializer(function() {
        self.addDestructor(
          self.X.dynamicFn(
            predicate,
            function() {
              var e = self.X.$(opt_id);
              if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
              DOM.setClass(e, className, predicate());
            }
          ).destroy
        );
      });

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

    write: function(opt_X) {
      /*  Write the View's HTML to the provided document and then initialize. */
      var X = opt_X || this.X;
      X.writeView(this, X);
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
      this.generateContent();
    },

    generateContent: function() {
      /* by default, uses toInnerHTML() to generate content. Override to do something else. */
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
        element. This element is managed by $$DOC{ref:'foam.ui.View'}, so in most cases
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
      if ( ! this.tooltip || ! this.$ ) return;
      this.$.addEventListener('mouseenter', this.openTooltip);
      this.$.addEventListener('mouseleave', this.closeTooltip);
    },

    initInnerHTML: function() {
      /* Initialize this View and all of it's children. Usually just call
         $$DOC{ref:'.initHTML'} instead. When implementing a new $$DOC{ref:'foam.ui.View'}
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
            this.children[i].initHTML && this.children[i].initHTML();
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

    evtToCharCode: function(evt) {
      /* Maps an event keycode to a string */
      var s = '';
      if ( evt.altKey   ) s += 'alt-';
      if ( evt.ctrlKey  ) s += 'ctrl-';
      if ( evt.shiftKey && evt.type === 'keydown' ) s += 'shift-';
      if ( evt.metaKey  ) s += 'meta-';
      s += evt.type === 'keydown' ?
          this.NAMED_CODES[evt.which] || String.fromCharCode(evt.which) :
          String.fromCharCode(evt.charCode);
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
            // First, lookup named codes, then convert numbers to char codes,
            // otherwise, assume we have a single character string treated as
            // a character to be recognized.
            if ( self.NAMED_CODES[key] )
              key = self.NAMED_CODES[key];
            else if ( typeof key === 'number' )
              key = String.fromCharCode(key);

            keyMap[key] = opt_value ?
              function() { action.maybeCall(self.X, opt_value.get()); } :
              action.maybeCall.bind(action, self.X, self) ;
            found = true;
          }
        });
      }

      init(this.model_.getRuntimeActions());

      if ( this.data && this.data.model_ && this.data.model_.getRuntimeActions().length )
        init(this.data.model_.getRuntimeActions(), this.data$);

      if ( found ) {
        console.assert(this.$, 'View must define outer id when using keyboard shortcuts: ' + this.name_);
        this.keyMap_ = keyMap;
        var target = this.$parent;

        // Ensure that target is focusable, and therefore will capture keydown
        // and keypress events.
        target.setAttribute('tabindex', target.tabIndex + '');

        target.addEventListener('keydown',  this.onKeyboardShortcut);
        target.addEventListener('keypress', this.onKeyboardShortcut);
      }
    },

    destroy: function( isParentDestroyed ) {
      /* Cleans up the DOM when regenerating content. You should call this before
         creating new HTML in your $$DOC{ref:'.toInnerHTML'} or $$DOC{ref:'.toHTML'}. */
      // TODO: remove listeners
      this.invokeDestructors();

      this.SUPER(isParentDestroyed);

      delete this.instance_.$;
    },

    close: function() {
      /* Call when permanently closing the $$DOC{ref:'foam.ui.View'}. */
      this.$ && this.$.remove();
      this.destroy();
      this.publish('closed');
    },

    rectOnPage: function() {
      /* Computes the XY coordinates of the given node
         relative to the containing elements.</p>
         <p>TODO: Check browser compatibility. */
      var node = this.$;
      var x = 0;
      var y = 0;
      var parent;
      var rect = this.$.getBoundingClientRect();

      while ( node ) {
        parent = node;
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent;
      }
      return {  top: y,
                left: x,
                right: x+rect.width,
                bottom: y+rect.height,
                width: rect.width,
                height: rect.height };
    },

    rectOnViewport: function() {
      /* Computes the XY coordinates of this view relative to the browser viewport. */
      return this.$.getBoundingClientRect();
    },

    viewportOnPage: function() {
      var bodyRect = this.X.document.documentElement.getBoundingClientRect();
      var vpSize = this.viewportSize();
      return { left: -bodyRect.left, top: -bodyRect.top,
               width: vpSize.width, height: vpSize.height,
               right: -bodyRect.left + vpSize.width,
               bottom: -bodyRect.top + vpSize.height };
    },

    viewportSize: function() {
      /* returns the rect of the current viewport, relative to the page. */
      return { height: (window.innerHeight || this.X.document.documentElement.clientHeight),
               width:  (window.innerWidth  || this.X.document.documentElement.clientWidth) };
    },

    createView: function(prop, opt_args) {
      /* Creates a sub-$$DOC{ref:'foam.ui.View'} from $$DOC{ref:'Property'} info. */
      var X = ( opt_args && opt_args.X ) || this.Y;
      var v = this.PropertyView.create({id: (this.nextID ? this.nextID() : this.id) +'PROP', prop: prop, copyFrom: opt_args}, X);
      this[prop.name + 'View'] = v.view;
      return v;
    },

    removeChild: function(child) {
      if ( this.PropertyView.isInstance(child) && child.prop ) {
        delete this[child.prop.name + 'View'];
      }
      this.SUPER(child);
    },

    createRelationshipView: function(r, opt_args) {
      if ( opt_args.model_ ) {
        // if a model is specified, switch to normal PropertyView path
        return this.createView(r, opt_args);
      }
      var X = ( opt_args && opt_args.X ) || this.Y;

      var v = this.AsyncLoadingView.create({
        id: this.nextID(),
        name: r.name,
        model: 'foam.ui.RelationshipView',
        args: { relationship: r },
        copyFrom: opt_args
      }, X);

      if ( v.view ) v = v.view;

      this[r.name + 'View'] = v;
      return v;
    },
    createActionView: function(action, opt_args) {
      /* Creates a sub-$$DOC{ref:'foam.ui.View'} from $$DOC{ref:'Property'} info
        specifically for $$DOC{ref:'Action',usePlural:true}. */
      var X = ( opt_args && opt_args.X ) || this.Y;
      var modelName = opt_args && opt_args.model_ ?
        opt_args.model_ :
        'foam.ui.ActionButton'  ;

      var v = this.AsyncLoadingView.create({
        id: this.nextID(),
        name: action.name,
        model: modelName,
        args: { action: action },
        copyFrom: opt_args
      }, X);

      // TODO: Fix this race condition
      if ( v.view ) v = v.view;

      this[action.name + 'View'] = v.cview || v;;

      return v;
    },

    createTemplateView: function(name, opt_args) {
      /*
        Used by the $$DOC{ref:'Template',text:'$$propName'} sub-$$DOC{ref:'foam.ui.View'}
        creation tag in $$DOC{ref:'Template',usePlural:true}.
      */
      var args = opt_args || {};
      var X = this.Y;
      // Look for the property on our data first
      var myData = this.data$;
      if ( myData && myData.value && myData.value.model_ ) {
        var o = myData.value.model_.getFeature(name);
        if ( o ) {
          var v;
          if ( Action.isInstance(o) )
            v = this.createActionView(o, args);
          else if ( Relationship.isInstance(o) )
            v = this.createRelationshipView(o, args);
          else
            v = this.createView(o, args);
          // link data and add child view
          this.addDataChild(v);
          return v;
        }
      }
      // fallback to check our own properties
      var o = this.model_.getFeature(name);
      if ( ! o )
        throw 'Unknown View Name: ' + name;
      var v;
      if ( Action.isInstance(o) )
        v = this.createActionView(o, args);
      else if ( Relationship.isInstance(o) )
        v = this.createRelationshipView(o, args);
      else
        v = this.createView(o, args);
      // set this-as-data and add child view
      this.addSelfDataChild(v);
      return v;
    },

    dynamicTag: function(tagName, f) {
      /*
        Creates a dynamic HTML tag whose content will be automatically updated.
       */
      var id  = this.nextID();
      var self = this;
      this.addInitializer(function() {
        self.X.dynamicFn(function() {
          var html = f();
          var e = self.X.$(id);
          if ( e ) e.innerHTML = html;
        });
      });

      return '<' + tagName + ' id="' + id + '"></' + tagName + '>';
    }
  }
});
