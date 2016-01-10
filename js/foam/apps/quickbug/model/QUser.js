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

CLASS({
  name: 'QUser',
  package: 'foam.apps.quickbug.model',
  extends: 'foam.apps.quickbug.model.imported.User',

  properties: [
    {
      type: 'String',
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
      type: 'StringArray',
      name: 'preferredProjects',
      view: 'foam.ui.MultiLineStringArrayView',
      // Temporary fix for QuickBug v.1.10 which broke the project list
      // TODO: remove next line after a while
      preSet: function(_, a) {
        return a.map(function(i) {
          return Array.isArray(i) ? i[0] : i;
        });
      }
    },
    {
      type: 'String',
      name: 'defaultProject',
      defaultValue: 'chromium'
    }
  ]
});
