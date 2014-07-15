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

var QIssueComment = FOAM({
  model_: 'Model',
  name: 'QIssueComment',
  extendsModel: 'IssueComment',

  ids: [ 'id' ],

  properties: [
    {
      name: 'author',
      view: 'QIssueCommentAuthorView',
      preSet: function(_, newValue, prop) {
        if ( ! newValue.model_ ) return GLOBAL[prop.subType].create(newValue);
        return newValue;
      }
    },
    {
      name: 'updates',
      subType: 'QIssueCommentUpdate',
      view: 'QIssueCommentUpdateView',
      preSet: function(_, newValue, prop) {
        if ( ! newValue.model_ ) return GLOBAL[prop.subType].create(newValue);
        return newValue;
      }
    },
    {
      name: 'published',
      view: 'RelativeDateTimeFieldView'
    },
    {
      model_: 'ReferenceProperty',
      name: 'issueId',
      subType: 'Issue',
      hidden: true
    },
    {
      model_: 'StringProperty',
      name: 'content',
      displayWidth: 85,
      displayHeight: 8
    }
  ]
});

MODEL({
  name: 'QIssueCommentUpdate',
  extendsModel: 'IssueCommentUpdate',

  properties: [
    { name: 'summary', displayWidth: 120 },
    { name: 'status', autocompleter: 'StatusCompleter' },
    { name: 'owner', autocompleter: 'PersonCompleter' },
    { name: 'labels', view: 'GriddedStringArrayView', autocompleter: 'LabelCompleter' },
    { name: 'cc', view: 'StringArrayView', autocompleter: 'PersonCompleter', displayWidth: 120 },
    { name: 'blockedOn', view: 'MultiLineStringArrayView' }
  ],

  methods: {
    f: function(issue) {
      var comment = this;

      function updateField(field) {
        for ( var i = 0; i < comment[field].length; i++ ) {
          if ( comment[field][i][0] === '-' )
            issue[field] = issue[field].removeF(comment[field][i].substr(1));
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
