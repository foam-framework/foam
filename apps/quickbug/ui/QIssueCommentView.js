MODEL({
  name: 'QIssueCommentView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return this.X.QIssueComment; } }
  ],

  methods: {
    updateSubViews: function(SUPER) {
      SUPER();
      if ( this.$ && this.data === 0 ) {
        this.$.style.borderTop = 'none';
      }
    }
  },

  templates: [ { name: 'toHTML' } ]
});
