var QIssueCommentView = FOAM({
  model_: 'Model',
  name: 'QIssueCommentView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return this.__ctx__.QIssueComment; } }
  ],

  methods: {
    updateSubViews: function() {
      this.SUPER();
      if ( this.$ && this.data === 0 ) {
        this.$.style.borderTop = 'none';
      }
    }
  },

  templates: [
    { name: 'toHTML' }
  ]
});
