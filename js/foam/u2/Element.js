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
    'foam.input.touch.GestureTarget',
    'foam.u2.ElementValue'
  ],

  imports: [
    'dynamicFn',
    'framed'
  ],

  onLoad: function() {
    console.log('Running Element.static().');
    var self = this;

    Function.prototype.toE = function(X) {
      var dyn  = X.E('span');
      var last = null;

      X.dynamicFn(this, function(e) {
        e = X.E('span').add(e);
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
      remove:        function() { },
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
          this.addEventListener_(l[0], l[1]);
        }

        this.visitChildren('load');
      },
      unload: function() {
        this.state = this.UNLOADED;
        this.visitChildren('unload');
      },
      remove:        function() { },
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
      remove:        function() { this.unload(); },
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
        this.addEventListener_(topic, listener);
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
      remove:        function() { console.error('Remove after unload.'); },
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
      remove:        function() { console.error('Remove after destroy.'); },
      destroy:       function() { },
      onSetCls:      function() { },
      onAddListener: function() { },
      onSetStyle:    function() { },
      onSetAttr:     function() { },
      onAddChildren: function() { },
      onInsertChildren: function() { },
      toString:      function() { return 'DESTROYED'; }
    },

    // ???: Should we disallow these?
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
      img: true,
      input: true,
      br: true,
      hr: true,
      frame: true,
      area: true,
      base: true,
      basefont: true,
      col: true,
      isindex: true,
      link: true,
      meta: true,
      param: true
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
      defaultValue: 'div'
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

      var m = this.model_;
      while (m) {
        for ( var i = 0 ; i < m.templates.length ; i++ ) {
          var t = m.templates[i];
          if ( t.name === 'CSS' ) {
            t.futureTemplate(function(m) {
              X.addStyle(m.getPrototype());
            }.bind(this, m));
            break;
          }
        }
        m = m.extends && X.lookup(m.extends);
      }

      return this.initE(this);
    },

    function initE() {},

    function E(opt_nodeName) {
      var e = this.X.elementForName(opt_nodeName);

      if ( ! e ) {
        e = foam.u2.Element.create(null, this.Y);
        if ( opt_nodeName ) e.nodeName = opt_nodeName;
      }

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
      if ( opt_shown ) {
        this.removeCls('foam-u2-Element-hidden');
      } else {
        this.cls('foam-u2-Element-hidden');
      }
      return this;
    },

    function hide(opt_hidden) {
      return this.show(! (opt_hidden || true));
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
      this.state.remove.call(this);
    },

    //
    // DOM-like
    //
    function removeCls(cls) {
      if ( cls ) {
        delete this.classes[cls];
        this.onSetCls(cls, false);
      }
    },

    //
    // Fluent Methods
    //
    function setID(id) {
      this.id = id;
      return this;
    },
    function on(topic, listener) {
      this.elListeners.push([topic, listener]);
      this.onAddListener(topic, listener);
      return this;
    },

    // Constructs a default class name for this view, with an optional extra.
    // Without an extra, results in eg. 'foam-u2-Input'.
    // With an extra of "foo", results in 'foam-u2-Input-foo'.
    function myCls(opt_extra) {
      var base = this.model_.CSS_CLASS || cssClassize(this.model_.id);
      if (!opt_extra) return base;
      base.split(/ +/);
      return base.split(/ +/).map(function(c) { return c + '-' + opt_extra; }).join(' ');
    },
    function enableCls(cls, enabled, opt_negate) {
      function negate(a, b) { return b ? a : ! a; }

      if ( typeof enabled === 'function' ) {
        var fn = enabled;
        this.dynamicFn(fn, function(value) {
          this.enableCls(cls, value, opt_negate);
        }.bind(this));
      } else if ( Value.isInstance(enabled) ) {
        var value = enabled;
        var l = function() {
          this.enableCls(cls, value.get(), opt_negate);
        }.bind(this);
        value.addListener(l);
        l();
      } else {
        enabled = negate(enabled, opt_negate);
        var parts = cls.split(' ');
        for (var i = 0; i < parts.length; i++) {
          this.classes[parts[i]] = enabled;
          this.onSetCls(parts[i], enabled);
        }
      }
      return this;
    },

    function cls(cls) {
      if ( typeof cls === 'function' ) {
        var lastValue = null;
        this.dynamicFn(cls, function(value) {
          this.cls_(lastValue, value);
          lastValue = value;
        }.bind(this));
      } else if ( Value.isInstance(cls) ) {
        var lastValue = null;
        var l = function() {
          var v = cls.get();
          this.cls_(lastValue, v);
          lastValue = v;
        }.bind(this);
        cls.addListener(l);
        l();
      } else {
        this.cls_(null, cls);
      }
      return this;
    },

    function cls_(oldClass, newClass) {
      if ( oldClass === newClass ) return;
      this.removeCls(oldClass);
      if ( newClass ) {
        this.classes[newClass] = true;
        this.onSetCls(newClass, true);
      }
    },

    function dynamicAttr_(key, fn) {
      var self = this;
      this.dynamicFn(fn, function(value) {
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
      var model = this.model_;

      for ( var key in map ) {
        var value = map[key];
        var prop  = model.getProperty(key);

        if ( prop && prop.attribute ) {
          // Should we support value$ binding?
          this[key] = typeof value === 'string' ? prop.fromString(value) value ;
        } else {
          if ( typeof value === 'function' )
            this.dynamicAttr_(key, value);
          else if ( Value.isInstance(value) )
            this.valueAttr_(key, value);
          else
            this.setAttribute(key, value);
        }
      }
      return this;
    },

    function dynamicStyle_(key, fn) {
      this.dynamicFn(fn, function(value) {
        this.style_(key, value);
      }.bind(this));
    },

    function valueStyle_(key, v) {
      var l = function(value) {
        this.style_(key, v.get());
      }.bind(this);
      v.addListener(l);
      l();
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
        else if ( Value.isInstance(value) )
          this.valueStyle_(key, value);
        else
          this.style_(key, value);
      }
      return this;
    },

    function valueE_(value) {
      var self = this;
      var dyn  = this.E('span');
      var last = null;
      var X = this.Y;
      var l = function() {
        var e = self.E('span');
        /*if ( value.get() ) */e.add(value.get() || '');
        if ( last ) dyn.removeChild(last); //last.remove();
        dyn.add(last = e);
      };
      value.addListener(this.framed(l));
      l();

      return dyn;
    },
    // Better name?
    function tag(opt_nodeName) {
      var c = this.E(opt_nodeName || 'br');
      c.parent_ = this;
      this.add(c);
      return this;
    },
    function start(opt_nodeName) {
      var c = this.E(opt_nodeName);
      c.parent_ = this;
      this.add(c);
      return c;
    },
    function end() {
      var p = this.parent_;
      this.parent_ = null;
      return p;
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
        } else if ( c.toE ) {
          arguments[i] = c.toE(this.Y);
        } else if ( Value.isInstance(c) ) {
          arguments[i] = this.valueE_(c);
        }
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

    function addEventListener_(topic, listener) {
      if (this.X.gestureManager && topic === 'click') {
        var manager = this.X.gestureManager;
        var self = this;
        var target = this.GestureTarget.create({
          containerID: this.id$el.id,
          enforceContainment: true,
          gesture: 'tap',
          handler: {
            tapClick: function(pointMap) {
              return listener({
                preventDefault: function() { },
                stopPropagation: function() { },
                pointMap: pointMap,
                target: self.id$el
              });
            }
          }
        });
        manager.install(target);
        // TODO: Uninstall when the element is unloaded.
      } else {
        this.id$el.addEventListener(topic, listener);
      }
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
          } else if ( X.foam.u2.Element.isInstance(o) ) {
            o.output(f);
          } else {
            if ( o && o.toView_ ) o = o.toView_();
            if ( ! ( o === null || o === undefined ) ) {
              if ( o.toHTML ) {
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

    function toHTML() { return this.outerHTML; },
    function initHTML() { this.load(); },


    //
    // Template Support (internal)
    //
    function a() { return this.add.apply(this, arguments); },
    function c() { return this.cls.apply(this, arguments); },
    function e() { return this.end(); },
    function g(opt_nodeName) { return this.tag(opt_nodeName); },
    function i(id) { return this.setID(id); },
    function o(m) {
      for ( var k in m ) this.on(k, m[k]);
      return this;
    },
    function p(a) { a[0] = this; return this; },
    function s(opt_nodeName) { return this.start(opt_nodeName); },
    function t(as) { return this.attrs(as); },
    function x(m) {
      for ( var k in m ) this.X.set(k, m[k]);
      return this;
    },
    function y() { return this.style.apply(this, arguments); },
  ]
});
