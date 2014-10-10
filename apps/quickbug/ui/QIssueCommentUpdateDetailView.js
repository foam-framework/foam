MODEL({
  name: 'QIssueCommentUpdateDetailView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return this.__ctx__.QIssueCommentUpdate; } }
  ],

  templates: [
    { name: 'toHTML' }
  ]
});
