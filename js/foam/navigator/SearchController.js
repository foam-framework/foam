CLASS({
  name: 'SearchController',
  package: 'foam.navigator',
  extendsModel: 'View',
  requires: [
    'foam.navigator.views.GSnippet'
  ],
  imports: [
    'dao'
  ],
  properties: [
    {
      model_: 'StringProperty',
      name: 'query',
      postSet: function() { this.doQuery(); }
    },
    {
      model_: 'DAOProperty',
      name: 'filteredDao',
      view: {
        factory_: 'DAOListView',
        rowView: 'foam.navigator.views.GSnippet'
      }
    }
  ],
  listeners: [
    {
      name: 'doQuery',
      isMerged: 2,
      code: function() {
        this.filteredDao = this.dao.where(MQL(this.query));
      }
    }
  ],
  templates: [
    function toHTML() {/* $$query{ onKeyMode: true } $$filteredDao */}
  ]
});
 
