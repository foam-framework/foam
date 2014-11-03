MODEL({
  name: 'QIssueCommentUpdateView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return this.X.QIssueCommentUpdate; } }
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
