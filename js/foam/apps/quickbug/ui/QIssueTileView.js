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
  name: 'QIssueTileView',
  package: 'foam.apps.quickbug.ui',
  label: 'QIssue Tile View',

  requires: [
    'foam.ui.PropertyView'
  ],

  extends: 'foam.ui.View',

  properties: [
    {
      name:  'browser'
    },
    {
      name:  'issue'
    },
    {
      name: 'QIssue',
      defaultValueFn: function() { return this.X.QIssue; }
    }
  ],

  methods: {
    // Implement Sink
    put: function(issue) {
      if ( this.issue ) { this.issue.removeListener(this.onChange); }

      this.issue = issue.clone();
      this.issue.addListener(this.onChange);
    },

    // Implement Adapter
    f: function(issue) {
      var view = this.model_.create({ browser: this.browser }, this.Y);
      view.put(issue);
      return view;
    },

    toString: function() { return this.toHTML(); }
  },

  listeners: [
    {
      name: 'onChange',
      code: function() {
        this.browser.IssueDAO.put(this.issue);
      }
    },
    {
      name: 'dragStart',
      code: function(e) {
        e.dataTransfer.setData('application/x-foam-id', this.issue.id);
        e.dataTransfer.effectAllowed = 'move';
      },
    },
  ],

  templates:[
function toHTML() {/*
<%
var starView = this.PropertyView.create({prop: this.QIssue.STARRED, data: this.issue});
var f = function() { this.browser.location.id = this.issue.id; };
%>
<div draggable="true"
     id="<%= this.on('dragstart', this.dragStart, this.id) %>"
     class="gridtile">
  <table cellspacing="0" cellpadding="0"><tbody>
    <tr>
      <td class="id">
        <%= starView %>
        <a href="" id="<%= this.on('click', f, this.nextID()) %>">{{this.issue.id}}</a>
      </td>
      <td class="status">{{this.issue.status}}</td>
    </tr>
    <tr>
      <td colspan="2">
        <div><span id="<%= this.on('click', f, this.nextID()) %>">{{this.issue.summary}}</div></div>
      </td>
    </tr>
  </tbody></table>
</div>
*/}
  ]
});
