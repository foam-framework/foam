FOAModel({
  name: 'QIssueCommentCreateView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return QIssueComment; } },
    { name: 'issue', postSet: function(_, v) { this.data = v.newComment(); } },
    { model_: 'BooleanPropety', name: 'saving', defaultValue: false },
    { name: 'errorView', factory: function() { return TextFieldView.create({ mode: 'read-only' }); } },
    { name: 'dao' }
  ],

  methods: {
    makeUpdatesView: function() {
      return this.X.PropertyView.create({
        innerView: 'QIssueCommentUpdateDetailView',
        prop: QIssueComment.UPDATES
      });
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
      isEnabled: function() { return ! this.saving; },
      action: function() {
        var defaultComment = this.issue.newComment();

        var diff = defaultComment.updates.diff(this.data.updates);
        function convertArray(key) {
          if ( ! diff[key] ) {
            diff[key] = [];
            return;
          }

          var delta = diff[key].added;
          for ( var i = 0; i < diff[key].removed.length; i++ )
            delta.push("-" + diff[key].removed[i]);
          diff[key] = delta;
        }

        convertArray('labels');
        convertArray('blockedOn');
        convertArray('cc');

        var comment = this.data.clone();
        comment.updates = QIssueCommentUpdate.create(diff);

        // TODO: UI feedback while saving.

        var self = this;
        this.errorView.data = "";
        this.saving = true;
        this.dao.put(comment, {
          put: function(o) {
            self.saving = false;
            self.data = self.issue.newComment();
          },
          error: function() {
            self.saving = false;
            self.errorView.data = "Error saving comment.  Try again later.";
          }
        });
      }
    },
    {
      name: 'discard',
      isEnabled: function() { return ! this.saving; },
      action: function() { this.X.browser.location.id = ''; }
    }
  ]
});
