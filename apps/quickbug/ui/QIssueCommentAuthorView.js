MODEL({
  name: 'QIssueCommentAuthorView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', defaultValue: IssuePerson }
  ],

  methods: {
    updateSubViews: function(SUPER) {
      SUPER();
      if ( ! this.$ ) return;
      this.$.firstElementChild.href = this.data.htmlLink;
    }
  },

  templates: [ { name: 'toHTML' } ]
});
