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
   "model_": "Model",
   "id": "com.google.mail.GMailHistory",
   "package": "com.google.mail",
   "name": "GMailHistory",
   "plural": "history",
   "properties": [
      {
         "model_": "StringProperty",
         "name": "id",
         "help": "The mailbox sequence ID."
      },
      {
         "model_": "ReferenceArrayProperty",
         "name": "messages",
         "help": "The messages that changed in this history record.",
         "subType": "Message",
         "subKey": "ID"
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
