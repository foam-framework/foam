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
  name: 'QIssueCommentUpdateView',
  package: 'foam.apps.quickbug.ui',
  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.apps.quickbug.model.QIssueCommentUpdate'
  ],

  properties: [
    { name: 'model', factory: function() { return this.QIssueCommentUpdate; } }
  ],

  methods: {
    init: function() {
      this.data$.addListener(this.newData);
      this.newData();
      this.SUPER();
    },
    destroy: function() {
      this.data = '';
      this.data$.removeListener(this.newData);
    }
  },

  listeners: [
    {
      name: 'newData',
      code: function(src, topic, old, nu) {
        if ( old ) old.removeListener(this.update);
        if ( nu ) nu.addListener(this.update);
      }
    },
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;
        this.$.innerHTML = this.render();
      }
    }
  ],

  templates: [
    { name: 'toHTML', template: '<div id="<%= this.id %>"></div>' },
    function render() {/*
<% var data = this.data; %>
<% if ( data && ( data.summary ||
   data.status ||
   data.cc.length ||
   data.blockedOn.length ||
   data.blocking.length ||
   data.labels.length ||
   data.owner )  ) { %>
<div class="qissueupdates">
<div class="qupdatesround4"></div>
<div class="qupdatesround2"></div>
<div class="qupdatesround1"></div>
<div class="qissueinnerupdates">
<% if ( data.summary ) { %><b>Summary:</b>{{data.summary}}<br><% } %>
<% if ( data.status ) { %><b>Status:</b>{{data.status}}<br><% } %>
<% if ( data.cc.length ) { %><b>Cc:</b>{{data.cc.join(' ')}}<br><% } %>
<% if ( data.labels.length ) { %><b>Labels:</b>{{data.labels.join(' ')}}<br><% } %>
<% if ( data.blockedOn.length ) { %><b>Blocked on:</b>{{data.blockedOn.join(' ')}}<br><% } %>
<% if ( data.blocking.length ) { %><b>Blocking:</b>{{data.blocking.join(' ')}}<br><% } %>
<% if ( data.owner ) { %><b>Owner:</b>{{data.owner}}<br><% } %>
</div>
<div class="qupdatesround1"></div>
<div class="qupdatesround2"></div>
<div class="qupdatesround4"></div>
</div>
<% } %>
*/}
  ]
});
