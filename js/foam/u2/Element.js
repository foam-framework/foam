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

  constants: {
    INITIAL: {
      output: function(out) {
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

        for ( var key in this.attributeMap ) {
          var value = this.attributeMap[key];

          out(' ', key);
          if ( value !== undefined )
            out('="', value, '"');
        }

        if ( ! this.ILLEGAL_CLOSE_TAGS[this.nodeName] &&
             ( ! this.OPTIONAL_CLOSE_TAGS[this.nodeName] || this.childNodes.length ) ) {
          out('>');
          this.outputInnerHTML(out);
          out('</', this.nodeName);
        }

        out('>');

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
      unload:        function() { console.error('Must load before unloading.'); },
      destroy:       function() { },
      onSetCls:      function(cls, enabled) {
        this.id$el.classList[enabled ? 'add' : 'remove'](cls);
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
        var out = this.createOutputStream();
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          out(arguments[i]);
        }
        this.id$el.insertAdjacentHTML('beforeend', out);
      },
      toString:      function() { return 'OUTPUT'; }
    },
    LOADED: {
      output:        function(out) { console.warn('Duplicate output.'); },
      load:          function() { console.error('Duplicate load.'); },
      unload:        function() {
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
      name: 'state',
      factory: function () { return this.INITIAL; }
    },
    {
      model_: 'foam.u2.EIDProperty',
      name: 'id'
    },
    {
      name: 'nodeName',
      preSet: function(_, v) {
        // Convert to uppercase so that checks against OPTIONAL_CLOSE_TAGS
        // and ILLEGAL_CLOSE_TAGS work.
        return v.toUpperCase();
      }
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

  methods: [
    function attrValue(opt_name, opt_event) {
      var args = { element: this };

      if ( opt_name  ) v.property = opt_name;
      if ( opt_event ) v.event    = opt_event;

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
    function focus() { },

    function blur() { },

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
      }

      this.attributeMap[name] = attr;
      this.onSetAttr(name, value);
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
          break;
        }
      }
    },

    //
    // Fluent Methods
    //
    function on(topic, listener) {
      this.elListeners.push([topic, listener]);
      this.onAddListener(topic, listener);
      return this;
    },

    function cls(cls, opt_enabled) {
      var enabled = opt_enabled === undefined ? true : opt_enabled ;
      this.classes[cls] = enabled;
      this.onSetCls(cls, enabled);
      return this;
    },

    function attrs(map) {
      for ( var key in map ) this.setAttribute(key, map[key]);
      return this;
    },

    function style_(key, value) {
      this.css[key] = value;
      this.onSetStyle(key, value);
      return this;
    },

    function style(map) {
      for ( var key in map ) this.style_(key, map[key]);
      return this;
    },

    function c() {
      console.warn('deprecated use of c(), use add() instead.');
      return this.add.apply(this, arguments);
    },

    function add() {
      this.childNodes.push.apply(this.childNodes, arguments);
      this.onAddChildren.apply(this, arguments);
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
          if ( typeof o === 'string' ) {
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
    },

    function toString() { return this.outerHTML; }
  ]
});



/*
  TODO: focus?, compile, deepClone, pass data, don't clone if literal
*/
