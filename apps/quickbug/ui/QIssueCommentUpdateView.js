var QIssueCommentUpdateView = FOAM({
  model_: 'Model',
  name: 'QIssueCommentUpdateView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return QIssueCommentUpdate; } }
  ],

  methods: {
    updateSubViews: function() {
      if ( ! this.$ ) return;
      this.$.innerHTML = this.render();
    }
  },

  templates: [
    { name: 'toHTML' },
    { name: 'render' }
  ]
});
