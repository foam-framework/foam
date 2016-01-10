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
   "package": "com.google.mail",
   "name": "GMailLabel",
   "plural": "labels",
   "properties": [
      {
         type: 'String',
         "name": "id",
         "help": "The immutable ID of the label."
      },
      {
         type: 'String',
         "name": "labelListVisibility",
         "help": "The visibility of the label in the label list in the Gmail web interface."
      },
      {
         type: 'String',
         "name": "messageListVisibility",
         "help": "The visibility of the label in the message list in the Gmail web interface."
      },
      {
         type: 'String',
         "name": "name",
         "help": "The display name of the label."
      },
      {
         type: 'String',
         "name": "type",
         "help": "The owner type for the label. User labels are created by the user and can be modified and deleted by the user and can be applied to any message or thread. System labels are internally created and cannot be added, modified, or deleted. System labels may be able to be applied to or removed from messages and threads under some circumstances but this is not guaranteed. For example, users can apply and remove the INBOX and UNREAD labels from messages and threads, but cannot apply or remove the DRAFTS or SENT labels from messages or threads."
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
