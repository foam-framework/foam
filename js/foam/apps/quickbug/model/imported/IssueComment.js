/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  model_: 'Model',
  package: 'foam.apps.quickbug.model.imported',
  name: 'IssueComment',
  properties:
  [
    {
      model_: 'ReferenceProperty',
      help: 'Person who authored this comment.',
      name: 'author',
      subType: 'IssuePerson'
    },
    {
      model_: 'BooleanProperty',
      help: 'Whether the authenticated user can delete this comment.',
      name: 'canDelete'
    },
    {
      model_: 'StringProperty',
      help: 'Content of this issue comment.',
      name: 'content'
    },
    {
      model_: 'ReferenceProperty',
      help: 'Person who deleted this comment.',
      name: 'deletedBy',
      subType: 'IssuePerson'
    },
    {
      model_: 'IntProperty',
      help: '0-based sequence number of this comment, unique to this issue.',
      name: 'id'
    },
    {
      model_: 'StringProperty',
      help: 'Comment on an issue tracked by Google Project Hosting.',
      name: 'kind'
    },
    {
      model_: 'DateProperty',
      help: 'Date and time the issue was last updated.',
      name: 'published'
    },
    {
      model_: 'ReferenceProperty',
      name: 'updates',
      subType: 'IssueCommentUpdate'
    }
  ]
});
