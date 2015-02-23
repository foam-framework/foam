CLASS({
  package: 'foam.flow',
  name: 'ToC',
  label: 'Table of Contents',
  extendsModel: 'View',

  imports: [ 'parentSection' ],

  properties: [
    {
      model_: 'DAOProperty',
      name: 'sections',
      view: 'DAOListView',
      factory: function() { return []; }
    }
  ],

  templates: [
    function toHTML() {/*
      <%  this.sections = this.parentSection.subSections; %>
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
