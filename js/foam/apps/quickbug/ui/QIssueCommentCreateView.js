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
  name: 'QIssueCommentCreateView',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.DetailView',

  imports: [
    'browser'
  ],

  requires: [
    'foam.ui.ActionButton',
    'foam.ui.PropertyView',
    'foam.apps.quickbug.model.QIssueComment',
    'foam.apps.quickbug.model.QIssueCommentUpdate',
    'foam.apps.quickbug.ui.QIssueCommentUpdateDetailView',
    'foam.ui.TextFieldView'
  ],

  properties: [
    { name: 'model', factory: function() { return this.QIssueComment; } },
    { type: 'Boolean', name: 'saving', defaultValue: false },
    { name: 'issue' },
    { name: 'errorView', factory: function() { return this.TextFieldView.create({ mode: 'read-only' }); } },
    { name: 'dao' }
  ],

  actions: [
    {
      name: 'save',
      label: 'Save changes',
      isEnabled: function() { return ! this.saving; },
      code: function() {
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
        comment.updates = this.QIssueCommentUpdate.create(diff);

        // TODO: UI feedback while saving.

        var self = this;
        this.errorView.data = "";
        this.saving = true;
        this.dao.put(comment, {
          put: function(o) {
            self.saving = false;
            self.parent.refresh();
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
      code: function() { this.browser.location.id = ''; }
    }
  ],

  templates: [
    function toHTML() {/*
<%
   var saveButton = this.ActionButton.create({ action: this.model_.SAVE,       data: this });
   var discardButton = this.ActionButton.create({ action: this.model_.DISCARD, data: this });
%>
<div id="<%= this.id %>">
  <table cellpadding="0" cellspacing="0" border="0">
    <tbody><tr>
        <td>
          $$content
        </td>
      </tr>
      <tr>
        <td>
          $$updates{ model_: 'foam.apps.quickbug.ui.QIssueCommentUpdateDetailView' }
          <%= saveButton %>
          <%= discardButton %>
          %%errorView
        </td>
      </tr>
  </tbody></table>
</div>
*/}
  ]
});
