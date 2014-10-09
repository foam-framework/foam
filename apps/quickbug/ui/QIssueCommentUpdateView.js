var QIssueCommentUpdateView = FOAM({
  model_: 'Model',
  name: 'QIssueCommentUpdateView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return this.X.QIssueCommentUpdate; } }
  ],

  methods: {
    updateSubViews: function() {
      if ( ! this.el ) return;
      this.el.innerHTML = this.render();
    }
  },

  templates: [
    { name: 'toHTML' },
    { name: 'render' }
  ]
});
