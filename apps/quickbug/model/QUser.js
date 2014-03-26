/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

var QUser = FOAM({
  model_: 'Model',
  name: 'QUser',
  extendsModel: 'User',

  properties: [
    {
      model_: 'StringProperty',
      name: 'email'
    },
    {
      name: 'projects',
      postSet: function(_, newValue) {
        if ( this.preferredProjects.length == 0 ) {
          this.preferredProjects = newValue.map(function(p) { return p.name; });
        }
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'preferredProjects',
      view: 'MultiLineStringArrayView',
// Temporary fix for QuickBug v.1.10 which broke the project list
// TODO: remove next line after a while
      preSet: function(a) {
        return a.map(function(i) {
          return Array.isArray(i) ? i[0] : i;
        });
      }
    },
    {
      model_: 'StringProperty',
      name: 'defaultProject',
      defaultValue: 'chromium'
    }
  ]
});
