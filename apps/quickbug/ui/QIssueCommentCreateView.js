FOAModel({
  name: 'QIssueCommentCreateView',
  extendsModel: 'DetailView',

  properties: [
    { name: 'model', factory: function() { return QIssueComment; } },
    { name: 'issue' },
    { model_: 'BooleanPropety', name: 'saving', defaultValue: false },
    { name: 'errorView', factory: function() { return TextFieldView.create({ mode: 'read-only' }); } },
    { name: 'dao' }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.value.value = this.issue.newComment();
    },

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
      isEnabled: function() { return ! this.saving; },
      action: function() {
        var defaultComment = this.issue.newComment();

        var diff = defaultComment.updates.diff(this.value.value.updates);
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

        var comment = this.value.value.clone();
        comment.updates = QIssueCommentUpdate.create(diff);

        // TODO: UI feedback while saving.

        var self = this;
        this.errorView.data = "";
        this.saving = true;
        this.dao.put(comment, {
          put: function(o) {
            self.saving = false;
            self.value.value = self.issue.newComment();
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
      label: 'Discard',
      isEnabled: function() { return ! this.saving; },
      action: function() {
        this.value.value = this.issue.newComment();
        this.errorView.data = "";
      }
    }
  ]
});
