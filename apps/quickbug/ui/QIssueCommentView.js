var QIssueCommentView = FOAM({
  model_: 'Model',
  name: 'QIssueCommentView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return this.X.QIssueComment; } }
  ],

  methods: {
    updateSubViews: function() {
      this.SUPER();
      if ( this.el && this.data === 0 ) {
        this.el.style.borderTop = 'none';
      }
    }
  },

  templates: [
    { name: 'toHTML' }
  ]
});
