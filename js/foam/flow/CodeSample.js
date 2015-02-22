CLASS({
  package: 'foam.flow',
  name: 'CodeSample',
  extendsModel: 'View',

  properties: [
    {
      name: 'code'
    }
  ],

  methods: {
    /** Allow inner to be optional when defined using HTML. **/
    fromElement: function(e) {
      var children = e.children;
      if ( children.length == 1 && children[0].nodeName === 'code' ) {
        return this.SUPER(e);
      }

      this.code = e.innerHTML;
      return this;
    }
  },

  templates: [
    function toHTML() {/*
      <pre class="float-code-sample">
        %%code
      </pre>
    */}
  ]
});
