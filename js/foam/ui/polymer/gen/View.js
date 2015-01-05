CLASS({
  name: 'View',
  package: 'foam.ui.polymer.gen',

  extendsModel: 'foam.ui.polymer.View',

  methods: {
    name: 'postSet',
    code: function(propName) {
      if ( ! this.$ ) return;
      this.$[propName] = this[propName];
      if ( this[propName] ) {
        if ( this[propName] === true ) {
          this.$.setAttribute(propName, '');
        } else {
          this.$.setAttribute(propName, this[propName]);
        }
      } else {
        this.$.removeAttribute(propName);
      }
    }
  },

  templates: [
    function toHTML() {/*
      <{{{this.tagName}}} id="{{{this.id}}}"
      <% for ( var i = 0; i < this.POLYMER_PROPERTIES.length; ++i ) {
           var propName = this.POLYMER_PROPERTIES[i];
           if ( this[propName] ) { %>
             <%= propName %>
             <% if ( this[propName] !== true ) { %>
               ="<%= this[propName] %>"
             <% }
           }
         } %>
      >
     </{{{this.tagName}}}>
    */}
  ]
});
