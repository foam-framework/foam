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
  "name": "IssueCommentUpdate",
  "package": "foam.apps.quickbug.model.imported",
  "tableProperties": [
    "blockedOn",
    "blocking",
    "cc",
    "kind",
    "labels",
    "mergedInto",
    "owner",
    "status",
    "summary"
  ],
  "properties": [
    {
      type: 'StringArray',
      "name": "blockedOn",
      "help": "Changes made to the list of issues blocked on this issue."
    },
    {
      type: 'StringArray',
      "name": "blocking",
      "help": "Changes made to the list of issues blocking this issue."
    },
    {
      type: 'StringArray',
      "name": "cc",
      "help": "Changes made to the issue's cc list."
    },
    {
      type: 'String',
      "name": "kind",
      "help": "Metadata updates made as part of a comment."
    },
    {
      type: 'StringArray',
      "name": "labels",
      "help": "Changes made to the issue's labels."
    },
    {
      type: 'String',
      "name": "mergedInto",
      "help": "ID of the issue this issue has been merged into."
    },
    {
      type: 'String',
      "name": "owner",
      "help": "Updated owner of the issue."
    },
    {
      type: 'String',
      "name": "status",
      "help": "Updated status of the issue."
    },
    {
      type: 'String',
      "name": "summary",
      "help": "Updated summary of the issue."
    }
  ]
});
