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
  name: 'CommentView',
  package: 'foam.apps.mbug.ui',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.ui.md.MonogramStringView',
    'foam.apps.quickbug.ui.QIssueCommentAuthorView'
  ],

  templates: [ function toHTML() {/*
    <div class="separator"></div>
    <div id="<%= this.id %>" class="comment-view">
       <span class="owner">
         <%= this.MonogramStringView.create({data: this.data.author.name}) %>
       </span>
       <span class="content">
         Commented by $$author<br>
         <span class="published"><%= this.data.published.toRelativeDateString() %></span> <br><br>
         $$content{mode: 'read-only', escapeHTML: false}
       </span>
    </div>
  */} ]
});
