CLASS({
  package: 'foam.u2',
  name: 'View',
  extendsModel: 'foam.u2.Element'

  constants: {
    INITIAL: {

    },
    LOADED: {

    },
    UNLOADED: {

    },
    DESTROYED: { // Needed?

    }
  },

  properties: [
    {
      name: 'data'
    },
    {
      name: 'viewState',
      defaultValue: foam.u2.INITIAL
    }
  ],

  methods: [
    function nextID() {
      /* Convenience method to return unique DOM element ids. */
      return "view" + (arguments.callee._nextId = (arguments.callee._nextId || 0) + 1);
    },
    function output(out) {
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
      return out;
    },
    function outputInnerHTML(out) {
      for ( var i = 0 ; i < this.childNodes.length ; i++ )
        out(this.childNodes[i]/*.toString()*/);
      return out;
    },
    function toHTML() {
      var out = this.createOutputStream;
      this.output(out);
      return out.toString();
    },
    function initHTML() {

    },
    function destroy() {

    },
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
    }
  ]
});