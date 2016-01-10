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
  package: "com.google.mail",
  name: "GMailHistory",
  plural: "history",
  properties: [
    {
      type: 'String',
      name: "id",
      help: "The mailbox sequence ID."
    },
    {
      type: 'ReferenceArray',
      name: "messages",
      help: "The messages that changed in this history record.",
      subType: "Message",
      subKey: "ID"
    }
  ]
});
