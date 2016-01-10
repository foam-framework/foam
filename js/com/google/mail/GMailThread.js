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
   "name": "GMailThread",
   "plural": "threads",
   "properties": [
      {
         type: 'String',
         "name": "historyId",
         "help": "The ID of the last history record that modified this thread."
      },
      {
         type: 'String',
         "name": "id",
         "help": "The unique ID of the thread."
      },
      {
         model_: "ReferenceArrayProperty",
         "name": "messages",
         "help": "The list of messages in the thread.",
         "subType": "Message",
         "subKey": "ID"
      },
      {
         type: 'String',
         "name": "snippet",
         "help": "A short part of the message text."
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
