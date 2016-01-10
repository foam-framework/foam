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
  name: 'Circle',
  package: 'com.google.plus',

  properties: [
    { model_: 'Property', name: 'id', help: 'The FOAM ID, globally unique.' },

    { type: 'String', name: 'displayName' },
    { type: 'String', name: 'description' },

    {
      model_: 'ReferenceArrayProperty',
      subType: 'com.google.plus.Person',
      name: 'people',
      // defaults to ID, which is the person's GUID
    },
//   "etag": etag,
//   "selfLink": 'StringProperty'
  ],

  methods: [
    function toPeople() {
      return this.people;
    },
    function toChipE() {
      /* Implement to return a contact chip view Element */
    },
  ],
});
