CLASS({
  package: 'foam.flow',
  name: 'CodeSample',
  extendsModel: 'View',

  properties: [
    {
      // model_: 'FunctionProperty',
      name: 'code',
      postSet: function(_, txt) {
        var fn = eval('(function() {\n'    + txt + '\n})');
        
        this.output = fn();
      }
    },
    {
      name: 'output'
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
      <pre class="flow-code-sample">
        %%code
      </pre>
      Output:
      <pre class="flow-code-sample-output">
        %%output
      </pre>
    */}
  ]
});
