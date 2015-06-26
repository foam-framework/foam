CLASS({
  package: 'foam.u2',
  name: 'Element',

  constants: {
    INITIAL: {
      output: function(out) {
        out('<', this.nodeName);
        if ( this.id ) out(' id="', this.id, '"');

        for ( key in this.attributeMap_ ) {
          var value = this.attributeMap_[key].value;

          out(' ', key);
          if ( value !== undefined )
            out(this.attributeMap_[key].value, '"');
        }
        if ( ! this.sILLEGAL_CLOSE_TAGS[this.nodeName] &&
             ( ! this.OPTIONAL_CLOSE_TAGS[this.nodeName] || this.childNodes.length ) ) {
          out('>');
          this.outputInnerHTML(out);
          out('</', this.nodeName);
        }
        out('>');

        this.state = this.OUTPUT;

        return out;
      },
      load:       function() { console.error('Must output before loading.'); },
      unload:     function() { console.error('Must output and load before unloading.');},
      destroy:    function() { },
      onAddCls:   function() { },
      onAddStyle: function() { },
      onSetAttr:  function() { }
    },
    OUTPUT: {
      output:     function(out) {
        // Only warn because it could be useful for debugging.
        console.error('Duplicate output.');
        return this.INITIAL.output.call(this, out);
      },
      load:       function() {
        this.state = this.LOADED;
      },
      unload:     function() { console.error('Must load before unloading.'); },
      destroy:    function() { },
      onAddCls:   function() { },
      onAddStyle: function() { },
      onSetAttr:  function() { }
    },
    LOADED: {
      output:     function(out) { console.warn('Duplicate output.'); },
      load:       function() { console.error('Duplicate load.'); },
      unload:     function() {
        this.state = this.UNLOADED;
      },
      destroy:    function() { },
      onAddCls:   function() { },
      onAddStyle: function() { },
      onSetAttr:  function() { }
    },
    UNLOADED: {
      output:     function() { },
      load:       function() {
        this.state = this.LOADED;
      },
      unload:     function() { },
      destroy:    function() { },
      onAddCls:   function() { },
      onAddStyle: function() { },
      onSetAttr:  function() { }
    },
    DESTROYED: { // Needed?
      output:     function() { },
      load:       function() { },
      unload:     function() { },
      destroy:    function() { },
      onAddCls:   function() { },
      onAddStyle: function() { },
      onSetAttr:  function() { }
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
      COLGROUP: true,
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
      defaultValue: foam.u2.Element.INITIAL
    },
    {
      model_: 'foam.u2.EIDProperty',
      name: 'id'
    },
    {
      name: 'nodeName'/*,
      preSet: function(_, v) {
        return v.toLowerCase();
      }*/
    },
    {
      name: 'attributeMap_',
      transient: true,
      factory: function() { return {}; }
    },
    {
      name: 'attributes',
      factory: function() { return []; },
      postSet: function(_, attrs) {
        for ( var i = 0 ; i < attrs.length ; i++ )
          this.attributeMap_[attrs[i].name] = attrs[i];
      }
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
      getter: function() { return this.outputHTML(this.createOutputStream()); }
    },
    {
      name: 'innerHTML',
      transient: true,
      getter: function() { return this.outputInnerHTML(this.createOutputStream()); }
    }
  ],

  methods: [

    // Lifecycle
    function load() { this.state.load.call(this); },

    function unload() { this.state.unload.call(this); },

    function destroy() { this.state.destroy.call(this); },

    // DOM Compatibility
    function setAttribute(name, value) {
      var attr = this.getAttributeNode(name);

      if ( attr ) {
        attr.value = value;
      } else {
        attr = {name: name, value: value};
        this.attributes.push(attr);
        this.attributeMap_[name] = attr;
      }
    },

    function getAttributeNode(name) { return this.attributeMap_[name]; },

    function getAttribute(name) {
      var attr = this.getAttributeNode(name);
      return attr && attr.value;
    },

    appendChild: function(c) { this.childNodes.push(c); },

    removeChild: function(c) {
      for ( var i = 0; i < this.childNodes.length; ++i ) {
        if ( this.childNodes[i] === c ) {
          this.childNodes.splice(i, 1);
          break;
        }
      }
    },

    // Fluent Methods
    function on(event, listener) {
      this.elListeners.push([event, listener]);
      return this;
    },

    function cls(cls) {
      this.classes[cls] = true;
      return this;
    },

    function attr(key, value) {
      this.attributes.push([event, listener]);
      return this;
    },

    function attrs(map) {
      for ( key in map ) this.attr(key, map[key]);
      return this;
    },

    function style(key, value) {
      this.css.push([event, listener]);
      return this;
    },

    function styles(map) {
      for ( key in map ) this.style(key, map[key]);
      return this;
    },

    // Output Methods
    function output(out) { return this.state.output.call(this, out); }

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
              if ( o.appendHTML ) {
                o.appendHTML(this);
              } else if ( o.toHTML ) {
                buf.push(o.toHTML());
              } else {
                buf.push(o);
              }
              if ( o.initHTML && self && obj.addChild ) self.addChild(o);
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

    function write(document) {
      /* For debugging, not production. */
    },

    function toString() { return this.outerHTML; }
  ]
});


function E(opt_tagName) {
  var e = foam.u2.Element.create();
  if ( opt_tagName ) e.tagName = opt_tagName;
  return e;
}
