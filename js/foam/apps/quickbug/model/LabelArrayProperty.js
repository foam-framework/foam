/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  name: 'LabelArrayProperty',
  package: 'foam.apps.quickbug.model',
  extends: 'StringArrayProperty',

  help: "An array of String values, taken from labels.",

  properties: [
    {
      name: 'postSet',
      defaultValue: function(_, v, prop) {
        console.assert( Array.isArray(v), 'LabelArrayProperty.postSet: new value is not an array');

        for ( var i = 0; i < v.length; i++ ) v[i] = v[i].intern();
        v.sort();

        this.replaceLabels(prop.name.capitalize(), v);
      }
    },
    {
      name: 'compareProperty',
      defaultValue: function(o1, o2) {
        o1 = Array.isArray(o1) ? ( o1.length ? o1[o1.length-1] : 0 ) : o1;
        o2 = Array.isArray(o2) ? ( o2.length ? o2[o2.length-1] : 0 ) : o2;

        return o1.compareTo(o2);
      }
    },
    {
      name: 'transient',
      defaultValue: true
    }
  ]
});
