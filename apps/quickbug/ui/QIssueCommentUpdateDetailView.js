FOAModel({
  name: 'QIssueCommentUpdateDetailView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return IssueCommentUpdate; } },
  ],

  templates: [
    { name: 'toHTML' }
  ]
});
