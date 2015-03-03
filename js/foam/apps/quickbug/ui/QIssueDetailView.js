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
  name: 'QIssueDetailView',
  package: 'foam.apps.quickbug.ui',
  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.apps.quickbug.ui.CursorView',
    'foam.apps.quickbug.ui.QIssueCommentCreateView',
    'foam.apps.quickbug.ui.QIssueCLView',
    'foam.apps.quickbug.ui.BlockView',
    'foam.apps.quickbug.model.Cursor'
  ],

  properties: [
    {
      name: 'model',
      factory: function() { return this.X.QIssue; }
    },
    {
      model_: 'BooleanProperty',
      name: 'saveEnabled',
      defaultValue: false
    },
    {
      model_: 'DAOProperty',
      name: 'issueDAO'
    },
    {
      model_: 'DAOProperty',
      name: 'cursorIssueDAO'
    },
    {
      name: 'url'
    },
    {
      name: 'cursorView',
      factory: function() {
        return this.CursorView.create({
          data: this.Cursor.create({dao: this.cursorIssueDAO$Proxy})});
      }
    },
    {
      name: 'blockingView',
      factory: function() {
        return this.BlockView.create({
          property: this.model.BLOCKING,
          ids: this.data.blocking}, this.Y);
      }
    },
    {
      name: 'blockedOnView',
      factory: function() {
        return this.BlockView.create({
          property: this.model.BLOCKED_ON,
          ids: this.data.blockedOn});
      }
    },
    'newCommentView'
  ],

  listeners: [
    {
      name: 'doSave',
      code: function() {
        // Don't keep listening if we're no longer around.
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        if ( this.saveEnabled ) this.issueDAO.put(this.data);
      }
    }
  ],

  methods: {
    destroy: function( isParentDestroyed ) {
      this.SUPER(isParentDestroyed);
      if ( this.data ) this.data.removeListener(this.doSave);
    },
    commentCreateView: function() {
      return this.newCommentView = this.QIssueCommentCreateView.create({
        dao: this.data.comments,
        issue$: this.data$,
        data: this.data.newComment()
      });
    },
    clView: function() {
      return this.QIssueCLView.create({dao: this.data.comments});
    },
    toHTML: function() {
      return '<div id="' + this.id + '">' + this.toInnerHTML() + '</div>';
    },
    updateSubViews: function() {
      this.SUPER();
      this.newCommentView.data = this.data.newComment();
      this.saveEnabled = true;
    },
    refresh: function() {
      var self = this;
      self.issueDAO.where(EQ(this.model.ID, self.data.id)).listen(
        EventService.oneTime(function() {
          self.issueDAO.find(self.data.id, {
            put: function(issue) {
              self.data = issue;
              self.newCommentView.issue
            }
          });
        })
      );
    },
  },

  templates: [
    { name: 'toInnerHTML' }
  ]
});
