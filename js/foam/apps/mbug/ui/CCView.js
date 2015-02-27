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
  name: 'CCView',
  package: 'foam.apps.mbug.ui',
  extendsModel: 'foam.ui.md.AutocompleteListView',

  requires: [
    'foam.apps.mbug.ui.CitationView',
    'foam.apps.mbug.ui.PersonView',
    'foam.apps.quickbug.model.imported.IssuePerson'
  ],

  imports: [
    'PersonDAO as srcDAO'
  ],

  properties: [
    {
      name: 'queryFactory',
      defaultValue: function(data) {
        return STARTS_WITH_IC(this.IssuePerson.NAME, data);
      }
    },
    {
      name: 'rowView',
      defaultValue: 'foam.apps.mbug.ui.CitationView'
    },
    {
      name: 'acRowView',
      defaultValue: 'foam.apps.quickbug.ui.PersonView'
    }
  ]
});
