CLASS({
  package: 'foam.flow',
  name: 'ToC',
  label: 'Table of Contents',
  extendsModel: 'View',

  properties: [
    {
      model_: 'DAOProperty',
      name: 'sections',
      view: 'DAOListView',
      factory: function() { return []; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      console.log('**** step 2');
      this.X.FLOWX.toc = this;
    }
  },

  templates: [
    function toHTML() {/*
      <hr>
        <h2>Table of Contents</h2>
        <blockquote>
          $$sections{mode: 'read-only'}
        </blockquote>
      <hr>
    */}
  ]
});
