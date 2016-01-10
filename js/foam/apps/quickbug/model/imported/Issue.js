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
  package: 'foam.apps.quickbug.model.imported',
  name: 'Issue',

  properties:
  [
    {
      type: 'Int',
      name: 'id',
      help: 'ID of the issue, unique to this project.'
    },
    {
      type: 'Reference',
      name: 'author',
      subType: 'IssuePerson',
      help: 'Person who originally filed this issue.',
      subType: 'IssuePerson'
    },
    {
      type: 'StringArray',
      name: 'blockedOn',
      help: 'References to issues this issue is blocked on.'
    },
    {
      type: 'StringArray',
      name: 'blocking',
      help: 'References to issues blocking on this issue.'
    },
    {
      type: 'StringArray',
      name: 'cc',
      help: 'List of people who are CC\'ed on updates to this issue.'
    },
    {
      type: 'DateTime',
      name: 'closed',
      help: 'Date and time the issue was closed.'
    },
    {
      type: 'String',
      name: 'description',
      help: 'Description of the issue.'
    },
    {
      type: 'StringArray',
      name: 'labels',
      help: 'Labels for this issue.'
    },
    {
      type: 'Reference',
      name: 'mergedInto',
      subType: 'Issue',
      help: 'Reference to the issue this issue was merged into.',
      subType: 'Issue'
    },
    {
      type: 'Reference',
      name: 'movedFrom',
      subType: 'Issue',
      help: 'Reference to the issue this issue was moved from.',
      subType: 'Issue'
    },
    {
      type: 'StringArray',
      name: 'movedTo',
      help: 'Reference to the issue(s) this issue was moved to.'
    },
    {
      type: 'Reference',
      name: 'owner',
      subType: 'IssuePerson',
      help: 'Person to whom this issue is currently assigned.',
    },
    {
      type: 'Date',
      name: 'published',
      help: 'Date and time the issue was originally published.'
    },
    {
      type: 'Boolean',
      name: 'starred',
      help: 'Whether the authenticated user has starred this issue.'
    },
    {
      type: 'Int',
      name: 'stars',
      help: 'Number of stars this issue has.'
    },
    {
      type: 'String',
      name: 'state',
      help: 'State of this issue (open or closed).'
    },
    {
      type: 'String',
      name: 'status',
      help: 'Status of this issue.'
    },
    {
      type: 'String',
      name: 'summary',
      help: 'One-line summary of the issue.'
    },
    {
      type: 'Date',
      name: 'updated',
      help: 'Date and time the issue was last updated.'
    }
  ]
});
