var QIssueCommentView = FOAM({
  model_: 'Model',
  name: 'QIssueCommentView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', defaultValue: QIssueComment }
  ],

  methods: {
    updateSubViews: function() {
      this.SUPER();
      if ( this.$ && this.value.get() &&
           this.value.get().id === 0 ) {
        this.$.style.borderTop = 'none';
      }
    }
  },

  templates: [
    { name: 'toHTML' }
  ]
});
