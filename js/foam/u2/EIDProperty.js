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
  package: 'foam.u2',
  name: 'EIDProperty',
  extends: 'Property',
  help: 'Describes a property used to store a DOM element id.',

  constants: {
    __ID__: [0],
    NEXT_ID: function() {
      return 'u2v' + this.__ID__++;
    }
  },

  properties: [
    {
      name: 'lazyFactory',
      defaultValue: function() { return foam.u2.EIDProperty.NEXT_ID(); }
    },
    {
      name: 'transient',
      defaultValue: true
    },
    {
      name: 'hidden',
      defaultValue: true
    },
    {
      name: 'install',
      defaultValue: function(prop) {
        defineLazyProperty(this, prop.name + '$el', function() {
          return { get: function() {
            return this.X.$(this[prop.name]);
          }}});
      }
    }
  ]
});
