MODEL({
  name: 'QIssueCreateView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'model',
      factory: function() { return this.X.QIssue; }
    },
    {
      model_: 'BooleanProperty',
      name: 'saving',
      defaultValue: false
    },
    { name: 'errorView', factory: function() { return TextFieldView.create({ mode: 'read-only' }); } },
  ],

  actions: [
    {
      name: 'save',
      label: 'Create',
      isEnabled: function() { return ! this.saving },
      action: function() {
        var self = this;
        this.saving = true;
        this.errorView.data = "";
        this.X.IssueDAO.put(this.data, {
          put: function(obj) {
            self.saving = false;
            self.X.browser.location.createMode = false;
            self.X.browser.location.id = obj.id;
          },
          error: function() {
            self.saving = false;
            self.errorView.data = "Error creating issue.";
          }
        });
      }
    },
    {
      name: 'discard',
      label: 'Discard',
      isEnabled: function() { return ! this.saving },
      action: function() {
        this.X.browser.location.createMode = false;
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div class="issueCreateView" id="<%= this.id %>">
      <div>
      <table>
      <tbody>
      <th>Create Issue</th>
      <tr><td>Summary:</td><td>$$summary</td></tr>
      <tr><td>Description:</td><td>$$description</td></tr>
      <tr><td>Status:</td><td>
        <% var Y = this.X.sub(); Y.registerModel(StatusAutocompleteView, 'AutocompleteView'); %>
        $$status{ X: Y }
      </td></tr>
      <tr><td>Owner:</td><td>$$owner</td></tr>
      <tr><td>Cc:</td><td>$$cc</td></tr>
      <tr><td>Labels:</td><td>
        <% Y = this.X.sub(); Y.registerModel(LabelAutocompleteView, 'AutocompleteView'); %>
        $$labels{ X: Y, model_: 'GriddedStringArrayView' }
      </td></tr>
      </tbody>
      </table>
      <%= ActionButton.create({ action: this.model_.SAVE,    data: this }) %>
      <%= ActionButton.create({ action: this.model_.DISCARD, data: this }) %>
      %%errorView
      </div>
      </div>
    */}
  ]
});
