FOAModel({
  name: 'QIssueCommentCreateView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return QIssueComment; } },
    { name: 'dao' }
  ],

  methods: {
    updatesView: function() {
      var prop = QIssueComment.UPDATES;
      var view = QIssueCommentUpdateDetailView.create();

      this.bindSubView(view, prop);

      view.prop = prop
      view.toString = function() { return this.prop.name + "View"; };

      this.addChild(view);
      this[prop.name + 'View'];

      return view;
    }
  },

  templates: [
    { name: 'toHTML' }
  ],

  actions: [
    {
      name: 'save',
      label: 'Save changes',
      action: function() {
        this.dao.put(this.value.value);
        // TODO: Close view.
      }
    },
    {
      name: 'discard',
      label: 'Discard',
      action: function() {
        // TODO: Close view.
        this.value.value = QIssueComment.create();
      }
    }
  ]
});
