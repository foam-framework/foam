

CLASS({
  package: 'foam.u2',
  name: 'View',
//  extendsModel: 'foam.u2.Element'

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
      defaultValue: foam.u2.view.INITIAL
    }
  ],

  methods: [
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

    }
  ]
});
