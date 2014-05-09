FOAModel({
  name: 'QIssueCommentUpdateDetailView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return QIssueCommentUpdate; } }
  ],

  templates: [
    { name: 'toHTML' }
  ]
});
