CLASS({
  package: 'foam.flow',
  name: 'ToC',
  label: 'Table of Contents',
  extendsModel: 'View',

  imports: [ 'sections' ],

  properties: [
    {
      model_: 'DAOProperty',
      name: 'sections',
      view: 'foam.ui.DAOListView',
      factory: function() { return []; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
    }
  },

  templates: [
    function toHTML() {/*
      <hr>
        <a name="toc"></a>
        <h2>Table of Contents</h2>
        <blockquote>
          $$sections{mode: 'read-only'}
        </blockquote>
      <hr>
    */}
  ]
});
