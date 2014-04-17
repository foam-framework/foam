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
      name: 'issueId'
    }
  ]
});
