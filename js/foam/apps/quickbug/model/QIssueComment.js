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
  package: 'foam.apps.quickbug.model',
  name: 'QIssueComment',
  extends: 'foam.apps.quickbug.model.imported.IssueComment',

  ids: [ 'id' ],

  properties: [
    {
      type: 'String',
      name: 'id',
      preSet: function(_, v) { return v; },
      defaultValue: '0'
    },
    {
      name: 'author',
      view: 'foam.apps.quickbug.ui.QIssueCommentAuthorView',
      subType: 'foam.apps.quickbug.model.imported.IssuePerson',
      preSet: function(_, newValue, prop) {
        if ( ! newValue.model_ ) return this.X.lookup(prop.subType).create(newValue);
        return newValue;
      }
    },
    {
      name: 'updates',
      subType: 'foam.apps.quickbug.model.QIssueCommentUpdate',
      view: 'foam.apps.quickbug.ui.QIssueCommentUpdateView',
      preSet: function(_, newValue, prop) {
        return newValue.model_ ? newValue : this.X.lookup(prop.subType).create(newValue);
      }
    },
    {
      name: 'published',
      view: 'foam.ui.RelativeDateTimeFieldView'
    },
    {
      type: 'Reference',
      name: 'issueId',
      subType: 'foam.apps.quickbug.model.imported.Issue',
      hidden: true
    },
    {
      type: 'String',
      name: 'content',
      displayWidth: 85,
      displayHeight: 8
    },
    {
      type: 'Int',
      name: 'seqNo',
      help: 'The sequence number for this comment, indicating where it shows in the comment list for a particular issue.'
    }
  ]
});
