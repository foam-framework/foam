MODEL({
  name: 'QIssueCommentUpdateDetailView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return this.X.QIssueCommentUpdate; } }
  ],

  templates: [
    { name: 'toHTML' }
  ]
});
