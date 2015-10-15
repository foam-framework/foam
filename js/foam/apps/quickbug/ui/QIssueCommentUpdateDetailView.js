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
  name: 'QIssueCommentUpdateDetailView',
  package: 'foam.apps.quickbug.ui',
  extends: 'foam.ui.DetailView',

  requires: [
    'foam.apps.quickbug.model.QIssueCommentUpdate',
    'foam.apps.quickbug.ui.StatusAutocompleteView',
    'foam.apps.quickbug.ui.LabelAutocompleteView'
  ],

  properties: [
    { name: 'model', factory: function() { return this.QIssueCommentUpdate; } }
  ],

  templates: [
    function toHTML() {/*
<table id="<%= this.id %>" cellspacing="2" cellpadding="2" border="0" class="rowmajor">
  <tbody><tr><th style="width: 1em">Summary:</th>
      <td class="inplace" colspan="2">
        $$summary
      </td>
    </tr>
    <tr><th>Status:</th><td class="inplace" colspan="2">
        <% var Y = this.Y.sub(); Y.registerModel(this.StatusAutocompleteView, 'foam.ui.AutocompleteView'); %>
        $$status{ X: Y }
      </td>
    </tr>
    <tr><th>Owner:</th><td class="inplace">
        $$owner
      </td>
      <td>&nbsp;</td>
    </tr>
    <tr><th>Cc:</th><td class="inplace" colspan="2">
        $$cc
    </td></tr>
    <tr><th class="vt">Labels:<br>
      </th>
      <td class="labelediting" colspan="2">
        <% Y = this.Y.sub(); Y.registerModel(this.LabelAutocompleteView, 'foam.ui.AutocompleteView'); %>
        $$labels{ X: Y }
      </td>
    </tr>
<% if ( false ) { // disabled until the API supports changing blockedOn
%>
    <tr><th>Blocked&nbsp;on:</th><td class="inplace" colspan="2">
        $$blockedOn
      </td>
    </tr>
<% } %>
</tbody></table>
*/}
  ]
});
