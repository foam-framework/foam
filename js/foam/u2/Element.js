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
  package: 'foam.u2',
  name: 'Element',

  requires: [
    'foam.u2.ElementValue'
  ],

  imports: [
    'dynamic',
    'framed'
  ],

  onLoad: function() {
    console.log('Running Element.static().');

    Function.prototype.toE = function(X) {
      var dyn = E('span');
      var last = null;

      X.dynamic(this, function(e) {
        e = E('span').add(e);
        if ( last ) dyn.removeChild(last); //last.remove();
        dyn.add(last = e);
      });

      return dyn;
    }
  },

  constants: {
    INITIAL: {
      output: function(out) {
        this.output_(out);

        this.state = this.OUTPUT;

        return out;
      },
      load:          function() { console.error('Must output before loading.'); },
      unload:        function() { console.error('Must output and load before unloading.'); },
      destroy:       function() { },
      onSetCls:      function() { },
      onAddListener: function() { },
      onSetStyle:    function() { },
      onSetAttr:     function() { },
      onAddChildren: function() { },
      onInsertChildren: function() { },
      toString:      function() { return 'INITIAL'; }
    },
    OUTPUT: {
      output: function(out) {
        // Only warn because it could be useful for debugging.
        console.warn('Duplicate output.');
        return this.INITIAL.output.call(this, out);
      },
      load: function() {
        this.state = this.LOADED;
        for ( var i = 0 ; i < this.elListeners.length ; i++ ) {
          var l = this.elListeners[i];
          this.id$el.addEventListener(l[0], l[1]);
        }

        this.visitChildren('load');
      },
      unload: function() {
        this.state = this.UNLOADED;
        this.visitChildren('unload');
      },
      destroy:       function() { },
      onSetCls:      function(cls, enabled) {
        throw "Mutations not allowed in OUTPUT state.";
      },
      onAddListener: function(topic, listener) {
        throw "Mutations not allowed in OUTPUT state.";
      },
      onSetStyle:    function(key, value) {
        throw "Mutations not allowed in OUTPUT state.";
      },
      onSetAttr:     function(key, value) {
        throw "Mutations not allowed in OUTPUT state.";
      },
      onAddChildren: function(c) {
        throw "Mutations not allowed in OUTPUT state.";
      },
      onInsertChildren: function() {
        throw "Mutations not allowed in OUTPUT state.";
      },
      toString:      function() { return 'OUTPUT'; }
    },
    LOADED: {
      output:        function(out) { console.warn('Duplicate output.'); },
      load:          function() { console.error('Duplicate load.'); },
      unload:        function() {
        var e = this.id$el;
        if ( e ) {
          e.remove();
        }
        this.state = this.UNLOADED;
        this.visitChildren('unload');
      },
      destroy:       function() { },
      onSetCls:      function(cls, enabled) {
        var e = this.id$el;
        if ( ! e ) {
          console.warn('Missing Element: ', this.id);
          return
        }
        e.classList[enabled ? 'add' : 'remove'](cls);
      },
      onAddListener: function(topic, listener) {
        this.id$el.addEventListener(topic, listener);
      },
      onSetStyle:    function(key, value) {
        this.id$el.style[key] = value;
      },
      onSetAttr:     function(key, value) {
        this.id$el[key] = value;
      },
      onAddChildren: function() {
        var e = this.id$el;
        if ( ! e ) {
          console.warn('Missing Element: ', this.id);
          return
        }
        var out = this.createOutputStream();
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          out(arguments[i]);
        }
        e.insertAdjacentHTML('beforeend', out);
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          arguments[i].load && arguments[i].load();
        }
      },
      onInsertChildren: function(children, reference, where) {
        var e = this.id$el;
        if ( ! e ) {
          console.warn("Missing Element: ", this.id);
          return;
        }
        var out = this.createOutputStream();
        for ( var i = 0 ; i < children.length ; i++ ) {
          out(children[i]);
        }

        reference.id$el.insertAdjacentHTML(where, out);
        for ( var i = 0 ; i < children.length ; i++ ) {
          children[i].load && children[i].load();
        }
      },
      toString:      function() { return 'LOADED'; }
    },
    UNLOADED: {
      output:        function() { },
      load:          function() {
        this.state = this.LOADED;
        this.visitChildren('load');
      },
      unload:        function() { },
      destroy:       function() { },
      onSetCls:      function() { },
      onAddListener: function() { },
      onSetStyle:    function() { },
      onSetAttr:     function() { },
      onAddChildren: function() { },
      onInsertChildren: function() { },
      toString:      function() { return 'UNLOADED'; }
    },
    DESTROYED: {
      output:        function() { throw 'Attempt to output() destroyed Element.'; },
      load:          function() { throw 'Attempt to load() destroyed Element.'; },
      unload:        function() { throw 'Attempt to unload() destroyed Element.';},
      destroy:       function() { },
      onSetCls:      function() { },
      onAddListener: function() { },
      onSetStyle:    function() { },
      onSetAttr:     function() { },
      onAddChildren: function() { },
      onInsertChildren: function() { },
      toString:      function() { return 'DESTROYED'; }
    },

    OPTIONAL_CLOSE_TAGS: {
      HTML: true,
      HEAD: true,
      BODY: true,
      P: true,
      DT: true,
      DD: true,
      LI: true,
      OPTION: true,
      THEAD: true,
      TH: true,
      TBODY: true,
      TR: true,
      TD: true,
      TFOOT: true,
      COLGROUP: true
    },
    ILLEGAL_CLOSE_TAGS: {
      IMG: true,
      INPUT: true,
      BR: true,
      HR: true,
      FRAME: true,
      AREA: true,
      BASE: true,
      BASEFONT: true,
      COL: true,
      ISINDEX: true,
      LINK: true,
      META: true,
      PARAM: true
    }
  },

  properties: [
    {
      model_: 'foam.u2.EIDProperty',
      name: 'id'
    },
    {
      name: 'state',
      factory: function () { return this.INITIAL; }
    },
    {
      name: 'nodeName',
      adapt: function(_, v) {
        // Convert to uppercase so that checks against OPTIONAL_CLOSE_TAGS
        // and ILLEGAL_CLOSE_TAGS work.
        return v.toUpperCase();
      },
      defaultValue: 'SPAN'
    },
    {
      name: 'attributeMap',
      transient: true,
      factory: function() { return {}; }
    },
    {
      name: 'attributes',
      factory: function() { return []; },
      postSet: function(_, attrs) {
        this.attributeMap = {};
        for ( var i = 0 ; i < attrs.length ; i++ )
          this.attributeMap[attrs[i].name] = attrs[i];
      }
    },
    {
      name: 'classes',
      factory: function() { return {}; }
    },
    {
      name: 'css',
      factory: function() { return {}; }
    },
    {
      name: 'childNodes',
      factory: function() { return []; }
    },
    {
      name: 'elListeners',
      factory: function() { return []; }
    },
    {
      name: 'children',
      transient: true,
      getter: function() {
        return this.childNodes.filter(function(c) { return typeof c !== 'string'; });
      }
    },
    {
      name: 'outerHTML',
      transient: true,
      getter: function() { return this.output(this.createOutputStream()).toString(); }
    },
    {
      name: 'innerHTML',
      transient: true,
      getter: function() { return this.outputInnerHTML(this.createOutputStream()).toString(); }
    }
  ],

  templates: [
    function CSS() {/*
      .foam-u2-Element-hidden {
        display: none !important;
      }
    */}
  ],

  methods: [
    function init() {
      this.SUPER();

      for ( var i = 0 ; i < this.model_.templates.length ; i++ ) {
        var t = this.model_.templates[i];
        if ( t.name === 'CSS' ) {
          t.futureTemplate(function() {
            X.addStyle(this);
          }.bind(this));
          return;
        }
      }
    },

    function E(opt_nodeName) {
      var e = foam.u2.Element.create(null, this.Y);
      if ( opt_nodeName ) e.nodeName = opt_nodeName;
      return e;
    },

    function attrValue(opt_name, opt_event) {
      var args = { element: this };

      if ( opt_name  ) args.property = opt_name;
      if ( opt_event ) args.event    = opt_event;

      return this.ElementValue.create(args);
    },

    //
    // State
    //
    function onSetAttr(key, value) {
      this.state.onSetAttr.call(this, key, value);
    },

    function onAddChildren(/* vargs */) {
      this.state.onAddChildren.apply(this, arguments);
    },

    function onAddListener(topic, listener) {
      this.state.onAddListener.call(this, topic, listener);
    },

    function onSetStyle(key, value) {
      this.state.onSetStyle.call(this, key, value);
    },

    function onSetCls(cls, add) {
      this.state.onSetCls.call(this, cls, add);
    },

    function visitChildren(methodName) {
      for (var i = 0; i < this.childNodes.length; i++) {
        var c = this.childNodes[i];
        c[methodName] && c[methodName].call(c);
      }
    },

    //
    // Focus
    //
    function focus() {
    },

    function blur() {
    },

    //
    // Visibility
    //
    function show(opt_shown) {
      return this.cls('foam-u2-Element-hidden', opt_shown, true);
    },

    function hide(opt_hidden) {
      if ( opt_hidden === undefined ) opt_hidden = true;
      return this.cls('foam-u2-Element-hidden', opt_hidden);
    },

    //
    // Lifecycle
    //
    function load() { this.state.load.call(this); },

    function unload() { this.state.unload.call(this); },

    function destroy() { this.state.destroy.call(this); },

    //
    // DOM Compatibility
    //
    function setAttribute(name, value) {
      var attr = this.getAttributeNode(name);

      if ( attr ) {
        attr.value = value;
      } else {
        attr = {name: name, value: value};
        this.attributes.push(attr);
        this.attributeMap[name] = attr;
      }

      this.onSetAttr(name, value);
    },

    function removeAttribute(name) {
      // TODO
    },

    function getAttributeNode(name) { return this.attributeMap[name]; },

    function getAttribute(name) {
      var attr = this.getAttributeNode(name);
      return attr && attr.value;
    },

    function appendChild(c) { this.childNodes.push(c); },

    function removeChild(c) {
      for ( var i = 0 ; i < this.childNodes.length ; ++i ) {
        if ( this.childNodes[i] === c ) {
          this.childNodes.splice(i, 1);
          c.remove();
          break;
        }
      }
    },

    function remove() {
      this.unload();
    },

    //
    // Fluent Methods
    //
    function on(topic, listener) {
      this.elListeners.push([topic, listener]);
      this.onAddListener(topic, listener);
      return this;
    },

    function cls(cls, opt_enabled, opt_negate) {
      function negate(a, b) { return b ? a : ! a; }

      if ( typeof opt_enabled === 'function' ) {
        var fn = opt_enabled;
        this.dynamic(fn, function(value) {
          this.cls(cls, value, opt_negate);
        }.bind(this));
      } else if ( Value.isInstance(opt_enabled) ) {
        var value = opt_enabled;
        var l = function() {
          this.cls(cls, value.get(), opt_negate);
        }.bind(this);
        value.addListener(l);
        l();
      } else {
        var enabled = negate(opt_enabled === undefined ? true : opt_enabled, opt_negate);
        this.classes[cls] = enabled;
        this.onSetCls(cls, enabled);
      }
      return this;
    },

    function dynamicAttr_(key, fn) {
      var self = this;
      this.dynamic(fn, function(value) {
        self.setAttribute(key, value);
      });
    },

    function valueAttr_(key, value) {
      var l = function() {
        this.setAttribute(key, value.get());
      }.bind(this);
      value.addListener(l);
      l();
    },

    function attrs(map) {
      for ( var key in map ) {
        var value = map[key];
        if ( typeof value === 'function' )
          this.dynamicAttr_(key, value);
        else if ( Value.isInstance(value) )
          this.valueAttr_(key, value);
        else
          this.setAttribute(key, value);
      }
      return this;
    },

    function dynamicStyle_(key, fn) {
      this.dynamic(fn, function(value) {
        this.style_(key, value);
      }.bind(this));
    },

    function style_(key, value) {
      this.css[key] = value;
      this.onSetStyle(key, value);
      return this;
    },

    function style(map) {
      for ( var key in map ) {
        var value = map[key];
        if ( typeof value === 'function' )
          this.dynamicStyle_(key, value);
        else
          this.style_(key, value);
      }
      return this;
    },

    function valueE_(value) {
      var dyn = E('span');
      var last = null;
      var l = function() {
        var e = E('span');
        /*if ( value.get() ) */e.add(value.get() || '');
        if ( last ) dyn.removeChild(last); //last.remove();
        dyn.add(last = e);
      };
      value.addListener(this.framed(l));
      l();

      return dyn;
    },

    function add(/* vargs */) {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var c = arguments[i];

        // Remove null values
        if ( c === undefined || c === null ) {
          Array.prototype.splice.call(arguments, i, 1);
          i--;
          continue;
        } else if ( Array.isArray(c) ) {
          Array.prototype.splice.apply(arguments, [i, 1].concat(c));
          i--;
          continue;
        } else if ( c.toE )
          arguments[i] = c.toE(this.X);
        else if ( Value.isInstance(c) )
          arguments[i] = this.valueE_(c);
      }

      if ( arguments.length ) {
        this.childNodes.push.apply(this.childNodes, arguments);
        this.onAddChildren.apply(this, arguments);
      }

      return this;
    },

    function insertBefore(child, reference) {
      return this.insertAt_(child, reference, true);
    },

    function insertAfter(child, reference) {
      return this.insertAt_(child, reference, false);
    },

    function addBefore(reference/* vargs */) {
      var children = [];
      for ( var i = 1 ; i < arguments.length ; i++ ) {
        children.push(arguments[i]);
      }
      return this.insertAt_(children, reference, true);
    },

    function insertAt_(children, reference, before) {
      var i = this.childNodes.indexOf(reference);

      if ( i == -1 ) {
        console.warn("Reference node isn't a child of this.");
        return this;
      }

      var index = before ? i : (i + 1);
      if ( Array.isArray(children) ) {
        this.childNodes.splice.apply(this.childNodes, [index, 0].concat(children));
      } else {
        this.childNodes.splice(index, 0, children);
      }
      this.state.onInsertChildren.call(this, Array.isArray(children) ? children : [children], reference, before ? 'beforebegin' : 'afterend');
      return this;
    },

    function removeAllChildren() {
      while ( this.childNodes.length ) this.removeChild(this.childNodes[0]);
    },

    function setChildren(value) {
      /** value -- a Value of an array of children which set this elements contents, replacing old children **/
      var l = function() {
        this.removeAllChildren();
        this.add.apply(this, value.get());
      }.bind(this);

      value.addListener(l);
      l();

      return this;
    },

    //
    // Output Methods
    //
    function output(out) { return this.state.output.call(this, out); },

    function outputInnerHTML(out) {
      for ( var i = 0 ; i < this.childNodes.length ; i++ )
        out(this.childNodes[i]/*.toString()*/);
      return out;
    },

    function createOutputStream() {
      var self = this;
      var buf = [];
      var f = function templateOut(/* arguments */) {
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          var o = arguments[i];
          if ( o === null || o === undefined ) {
            // NOP
          } else if ( typeof o === 'string' ) {
            buf.push(o);
          } else if ( typeof o === 'number' ) {
            buf.push(o);
          } else {
            if ( o && o.toView_ ) o = o.toView_();
            if ( ! ( o === null || o === undefined ) ) {
              if ( o.output ) {
                o.output(f);
              } else if ( o.toHTML ) {
                buf.push(o.toHTML());
              } else {
                buf.push(o);
              }
              // TODO(kgr): Figure out what this line was supposed to do.
              //if ( o.initHTML && self && obj.addChild ) self.addChild(o);
            }
          }
        }
      };

      f.toString = function() {
        if ( buf.length === 0 ) return '';
        if ( buf.length > 1 ) buf = [buf.join('')];
        return buf[0];
      }

      return f;
    },

    function write(opt_X) {
      opt_X = opt_X || GLOBAL;
      /* For debugging, not production. */
      (opt_X.document || document).writeln(this.outerHTML);
      this.load();
      return this;
    },

    function output_(out) {
      /** Output the element without transitioning to the OUTPUT state. **/
      out('<', this.nodeName);
      if ( this.id ) out(' id="', this.id, '"');

      var first = true;
      for ( var key in this.classes ) {
        if ( first ) {
          out(' class="');
          first = false;
        } else {
          out(' ');
        }
        out(key);
      }
      if ( ! first ) out('"');

      first = true;
      for ( var key in this.css ) {
        var value = this.css[key];

        if ( first ) {
          out(' style="');
          first = false;
        }
        out(key, ':', value, ';');
      }
      if ( ! first ) out('"');

      for ( var i = 0 ; i < this.attributes.length ; i++ ) {
        var attr  = this.attributes[i];
        var value = this.attributes[i].value;

        if ( value ) {
          out(' ', attr.name);
          if ( value !== undefined )
            out('="', value, '"');
        }
      }

      if ( ! this.ILLEGAL_CLOSE_TAGS[this.nodeName] &&
           ( ! this.OPTIONAL_CLOSE_TAGS[this.nodeName] || this.childNodes.length ) ) {
        out('>');
        this.outputInnerHTML(out);
        out('</', this.nodeName);
      }

      out('>');
    },

    function toString() {
      var s = this.createOutputStream();
      this.output_(s);
      return s.toString();
    },


    //
    // Template Support (internal)
    //
    function a() { return this.add.apply(this, arguments); },
    function c() { return this.cls.apply(this, arguments); },
    function p(a) { a[0] = this; },
    function s() { return this.style.apply(this, arguments); },
    function t(as) { return this.attrs(as); }
  ]
});



/*
  TODO: focus?, compile, deepClone, pass data, computedStyle, don't clone if literal
*/
