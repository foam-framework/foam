/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'QIssueCommentUpdate',
  package: 'foam.apps.quickbug.model',
  extends: 'foam.apps.quickbug.model.imported.IssueCommentUpdate',

  properties: [
    { name: 'summary', displayWidth: 120 },
    { name: 'status', autocompleter: 'foam.apps.quickbug.model.StatusCompleter' },
    { name: 'owner', autocompleter: 'foam.apps.quickbug.model.PersonCompleter' },
    { name: 'labels', view: 'foam.apps.quickbug.ui.GriddedStringArrayView', autocompleter: 'foam.apps.quickbug.model.LabelCompleter' },
    { name: 'cc', view: 'foam.ui.StringArrayView', autocompleter: 'foam.apps.quickbug.model.PersonCompleter', displayWidth: 120 },
    { name: 'blockedOn', view: 'foam.ui.MultiLineStringArrayView' }
  ],

  methods: {
    f: function(issue) {
      var comment = this;

      function updateField(field) {
        for ( var i = 0; i < comment[field].length; i++ ) {
          if ( comment[field][i][0] === '-' )
            issue[field] = issue[field].removeF({ f: function(s) { return s === comment[field][i].substr(1); } });
          else
            issue[field] = issue[field].pushF(comment[field][i]);
        }
      }

      ['blockedOn', 'cc', 'labels'].forEach(updateField);

      if ( comment.owner ) issue.owner = comment.owner;
      if ( comment.status ) issue.status = comment.status;
      if ( comment.summary ) issue.summary = comment.summary;
    }
  }
});
