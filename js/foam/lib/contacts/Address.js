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
   "package": "foam.lib.contacts",
   "name": "Address",
   "ids": [
      "type"
   ],
   "properties": [
      {
         type: 'String',
         "name": "type"
      },
      {
         type: 'String',
         "name": "poBox",
         "label": "P.O. Box",
         "displayWidth": 70
      },
      {
         type: 'String',
         "name": "street",
         "displayWidth": 70
      },
      {
         type: 'String',
         "name": "localArea",
         "displayWidth": 70
      },
      {
         type: 'String',
         "name": "city",
         "displayWidth": 70
      },
      {
         type: 'String',
         "name": "county",
         "label": "County / Area",
         "displayWidth": 70
      },
      {
         type: 'String',
         "name": "postalCode",
         "displayWidth": 12
      },
      {
         type: 'String',
         "name": "country",
         "displayWidth": 40
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
