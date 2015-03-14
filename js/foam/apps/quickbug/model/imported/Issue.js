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
  name: 'Issue',

  properties:
  [
    {
      model_: 'IntProperty',
      name: 'id',
      help: 'ID of the issue, unique to this project.'
    },
    {
      model_: 'ReferenceProperty',
      name: 'author',
      subType: 'IssuePerson',
      help: 'Person who originally filed this issue.',
      subType: 'IssuePerson'
    },
    {
      model_: 'StringArrayProperty',
      name: 'blockedOn',
      help: 'References to issues this issue is blocked on.'
    },
    {
      model_: 'StringArrayProperty',
      name: 'blocking',
      help: 'References to issues blocking on this issue.'
    },
    {
      model_: 'StringArrayProperty',
      name: 'cc',
      help: 'List of people who are CC\'ed on updates to this issue.'
    },
    {
      model_: 'DateTimeProperty',
      name: 'closed',
      help: 'Date and time the issue was closed.'
    },
    {
      model_: 'StringProperty',
      name: 'description',
      help: 'Description of the issue.'
    },
    {
      model_: 'StringArrayProperty',
      name: 'labels',
      help: 'Labels for this issue.'
    },
    {
      model_: 'ReferenceProperty',
      name: 'mergedInto',
      subType: 'Issue',
      help: 'Reference to the issue this issue was merged into.',
      subType: 'Issue'
    },
    {
      model_: 'ReferenceProperty',
      name: 'movedFrom',
      subType: 'Issue',
      help: 'Reference to the issue this issue was moved from.',
      subType: 'Issue'
    },
    {
      model_: 'StringArrayProperty',
      name: 'movedTo',
      help: 'Reference to the issue(s) this issue was moved to.'
    },
    {
      model_: 'ReferenceProperty',
      name: 'owner',
      subType: 'IssuePerson',
      help: 'Person to whom this issue is currently assigned.',
    },
    {
      model_: 'DateProperty',
      name: 'published',
      help: 'Date and time the issue was originally published.'
    },
    {
      model_: 'BooleanProperty',
      name: 'starred',
      help: 'Whether the authenticated user has starred this issue.'
    },
    {
      model_: 'IntProperty',
      name: 'stars',
      help: 'Number of stars this issue has.'
    },
    {
      model_: 'StringProperty',
      name: 'state',
      help: 'State of this issue (open or closed).'
    },
    {
      model_: 'StringProperty',
      name: 'status',
      help: 'Status of this issue.'
    },
    {
      model_: 'StringProperty',
      name: 'summary',
      help: 'One-line summary of the issue.'
    },
    {
      model_: 'DateProperty',
      name: 'updated',
      help: 'Date and time the issue was last updated.'
    }
  ]
});
