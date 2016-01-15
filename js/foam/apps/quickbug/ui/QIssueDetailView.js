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
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.apps.quickbug.ui.CursorView',
    'foam.apps.quickbug.ui.QIssueCommentCreateView',
    'foam.apps.quickbug.ui.QIssueCLView',
    'foam.apps.quickbug.ui.BlockView',
    'foam.apps.quickbug.model.Cursor',
    'foam.ui.DAOListView',
    'foam.apps.quickbug.ui.QIssueCommentView'
  ],

  properties: [
    {
      name: 'model',
      factory: function() { return this.X.QIssue; }
    },
    {
      type: 'Boolean',
      name: 'saveEnabled',
      defaultValue: false
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'issueDAO'
    },
    {
      model_: 'foam.core.types.DAOProperty',
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
    function toInnerHTML() {/*
<div class="qmaincol">
  <div>
    <div class="qissueheader">
      <table cellpadding="0" cellspacing="0" width="100%" class="qpreviewtable"><tbody>
          <tr>
          <td colspan=2 class="qvt qh3" style="padding:0 5px">
              $$starred
              Issue $$id{ mode: 'read-only' }
              $$summary{ mode: 'read-only', escapeHTML: true }
            </td>
            <td align=right><%= this.cursorView %></td>
          </tr>
      </tbody></table>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" class="qissuepage">
      <tbody>
        <tr>
          <td class="qissuemeta">
            <div>
              <table class="qpreviewtable" cellspacing="0" cellpadding="0">
                <tbody><tr><th align="left">Status:&nbsp;</th>
                    <td width="100%">
                      $$status{ mode: 'read-only' }
                    </td>
                  </tr>
                  <tr><th align="left">Owner:&nbsp;</th><td>
                      $$owner{ mode: 'read-only' }
                    </td>
                  </tr>
                  <tr><td class="qissuelabels" colspan="2">
                      $$labels{ mode: 'read-only' }
                  </td></tr>
              </tbody></table>
              <div>
                <br>
                <b>Change Lists:</b>
                <br>
                <div>
                  %%clView()
                </div>
                <br>
                <br>
                <b>Blocked on:</b>
                <br>
                <div class="qissuerelated">
                  %%blockedOnView
                </div>
                <br>
                <br>
                <b>Blocking:</b>
                <br>
                <div class="qissuerelated">
                  %%blockingView
                </div>
                <br>
                <% if ( STARTS_WITH(this.model.LABELS, 'Restrict-View-Google').f(this.data) ) { %>
                <div class="issue_restrictions">
                  <div class="restrictions_header">
                    <img src="images/restrict.png"> Restricted
                  </div>
                  <ul>
                    <% for ( var i = 0 ; i < this.data.labels.length ; i++ )
                      if ( this.data.labels[i].startsWith('Restrict-View-') ) {
                        var r = this.data.labels[i].substring(14); %>
                    <li>Only users with <%= r %> permission can see this issue.</li>
                    <% } %>
                  </ul>
                </div>
                <br>
                <% } %>
              </div>
              <br><br>
            </div>&nbsp;
          </td>
          <td class="qvt">
            $$comments{ model_: 'foam.ui.DAOListView', rowView: 'foam.apps.quickbug.ui.QIssueCommentView', mode: 'read-only' }
          </td>
        </tr>
      </tbody>
    </table>
    <br>
    <% if ( this.mode === 'read-write' ) { %>
      %%commentCreateView()
    <% } %>
    <br>
  </div>
</div>
*/}
  ]
});
