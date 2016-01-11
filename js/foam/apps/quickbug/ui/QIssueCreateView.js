/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'QIssueCreateView',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.ui.ActionButton',
    'foam.ui.AutocompleteView',
    'foam.apps.quickbug.ui.LabelAutocompleteView',
    'foam.apps.quickbug.ui.StatusAutocompleteView',
    'foam.ui.TextFieldView',
    'foam.apps.quickbug.ui.GriddedStringArrayView'
  ],

  imports: [
    'issueDAO',
    'browser'
  ],

  properties: [
    {
      name: 'model',
      factory: function() { return this.X.QIssue; }
    },
    {
      type: 'Boolean',
      name: 'saving',
      defaultValue: false
    },
    { name: 'errorView', factory: function() { return this.TextFieldView.create({ mode: 'read-only' }); } },
  ],

  actions: [
    {
      name: 'save',
      label: 'Create',
      isEnabled: function() { return ! this.saving },
      code: function() {
        var self = this;
        this.saving = true;
        this.errorView.data = "";
        this.issueDAO.put(this.data, {
          put: function(obj) {
            self.saving = false;
            self.browser.location.createMode = false;
            self.browser.location.id = obj.id;
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
      code: function() {
        this.browser.location.createMode = false;
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
        <% var Y = this.Y.sub(); Y.registerModel(this.StatusAutocompleteView, 'foam.ui.AutocompleteView'); %>
        $$status{ X: Y }
      </td></tr>
      <tr><td>Owner:</td><td>$$owner</td></tr>
      <tr><td>Cc:</td><td>$$cc</td></tr>
      <tr><td>Labels:</td><td>
        <% Y = this.Y.sub(); Y.registerModel(this.LabelAutocompleteView, 'foam.ui.AutocompleteView'); %>
        $$labels{ X: Y, model_: 'foam.apps.quickbug.ui.GriddedStringArrayView' }
      </td></tr>
      </tbody>
      </table>
      <%= this.ActionButton.create({ action: this.model_.SAVE,    data: this }) %>
      <%= this.ActionButton.create({ action: this.model_.DISCARD, data: this }) %>
      %%errorView
      </div>
      </div>
    */}
  ]
});
