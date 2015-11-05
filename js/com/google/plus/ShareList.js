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
  name: 'ShareList',
  package: 'com.google.plus',

  requires: [
    'com.google.plus.Person',
    'com.google.plus.Circle',
  ],

  documentation: function() {/* A list of people and or circles. When
    sharing is locked in, the circles are flattened into a list of
    people. The circle names are retained for UI use. */},

  properties: [
    {
      model_: 'ReferenceProperty',
      subType: 'com.google.plus.Person',
      name: 'owner',
    },
    {
      model_: 'ReferenceArrayProperty',
      name: 'circles',
      subType: 'com.google.plus.Circle',
      help: "References to the owner's actual circles"
    },
    {
      model_: 'ReferenceArrayProperty',
      name: 'people',
      subType: 'com.google.plus.Person',
    },
    {
      model_: 'StringArrayProperty',
      name: 'circleNames',
      help: "After flattening, circles will be empty and the names listed here."
    }
  ],

});
