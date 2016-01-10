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
   "name": "GMailMessage",
   "plural": "messages",
   "properties": [
      {
         type: 'String',
         "name": "historyId",
         "help": "The ID of the last history record that modified this message."
      },
      {
         type: 'String',
         "name": "id",
         "help": "The immutable ID of the message."
      },
      {
         type: 'StringArray',
         "name": "labelIds",
         "help": "List of IDs of labels applied to this message."
      },
      {
         model_: "Property",
         "name": "payload",
         "subType": "MessagePart",
         "help": "The parsed email structure in the message parts."
      },
      {
         type: 'String',
         "name": "raw",
         "help": "The entire email message in an RFC 2822 formatted string. Returned in messages.get and drafts.get responses when the format=RAW parameter is supplied."
      },
      {
         type: 'Int',
         "name": "sizeEstimate",
         "help": "Estimated size in bytes of the message."
      },
      {
         type: 'String',
         "name": "snippet",
         "help": "A short part of the message text."
      },
      {
         type: 'String',
         "name": "threadId",
         "help": "The ID of the thread the message belongs to. To add a message or draft to a thread, the following criteria must be met: \u000a- The requested threadId must be specified on the Message or Draft.Message you supply with your request. \u000a- The References and In-Reply-To headers must be set in compliance with the <a href=\"https://tools.ietf.org/html/rfc2822\"RFC 2822 standard. \u000a- The Subject headers must match."
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
