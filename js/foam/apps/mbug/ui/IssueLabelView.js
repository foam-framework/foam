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
  name: 'IssueLabelView',
  package: 'foam.apps.mbug.ui',
  extendsModel: 'foam.ui.md.AutocompleteListView',
  requires: [
    'foam.apps.mbug.ui.LabelCitationView',
    'foam.apps.mbug.ui.LabelView',
    'foam.apps.quickbug.model.QIssueLabel'
  ],
  imports: [
    'issueLabelDAO as srcDAO'
  ],
  properties: [
    {
      name: 'queryFactory',
      defaultValue: function(data) {
        return CONTAINS_IC(this.QIssueLabel.LABEL, data);
      }
    },
    {
      name: 'rowView',
      defaultValue: 'foam.apps.mbug.ui.LabelCitationView'
    },
    {
      name: 'acRowView',
      defaultValue: 'foam.apps.mbug.ui.LabelView'
    }
  ]
});
