CLASS({
  name: 'QIssueCommentUpdateDetailView',
  extendsModel: 'foam.ui.DetailView',

  properties: [
    { name: 'model', factory: function() { return this.X.QIssueCommentUpdate; } }
  ],

  templates: [
    { name: 'toHTML' }
  ]
});
