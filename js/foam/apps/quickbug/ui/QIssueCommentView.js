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
  name: 'QIssueCommentView',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.apps.quickbug.model.QIssueComment',
    'foam.apps.quickbug.ui.IssueLink'
  ],

  imports: [
    'browser'
  ],

  properties: [
    { name: 'model', factory: function() { return this.QIssueComment; } },
    {
      name: 'data',
      postSet: function(old, nu) {
        if ( old ) old.removeListener(this.update);
        if ( nu ) nu.addListener(this.update);
      }
    }
  ],

  listeners: [
    {
      name: 'newData',
      code: function(src, topic, old, nu) {
      }
    },
    {
      name: 'update',
      code: function() {
        if ( this.$ && this.data === 0 ) {
          this.$.style.borderTop = 'none';
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
<%
  function formatContent(self, s) {
    var url   = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/g;
    var issue = /(issue|bug)\s*#?([0-9]+)/ig;

    if ( s ) {
      s = s.replace(
        url,
        function(a) {
          return '<a href="' + a + '" target="_blank">' + a + '</a>';
        });
      s = s.replace(
        issue,
        function(_, __, issue) {
          var view = self.IssueLink.create({issue: issue});
          self.addChild(view);
          return view.toHTML();
        });
    } else {
      s = '(No comment was entered for this change.)';
    }   

    return '<pre>' + s + '</pre>';
  }
%>
<div class="qvt qissuecomment" id="<%= this.id %>">
  <div class="qissuecommentdate">
    $$published{ mode: 'read-only' }
  </div>
  <span style="padding-left:.7em">By </span>$$author <a target="_blank" href="<%= this.browser.url %>/issues/detail?id={{this.data.issueId}}#{{ this.data.seqNo }}">#{{ this.data.seqNo || '0' }}</a>
  <%= formatContent(this, this.data.content) %>
  $$updates
</div>
*/}
  ]
});
