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

FOAModel({
  name: 'QIssueLabel',

  ids: [ 'label' ],

  properties: [
    'label',
    'description'
  ],

  templates: [
    {
      name: 'toSummaryHTML',
      template: function() {/*
  <div style="background:white;color:blue;padding:4px 0;width:400px">
    <div style="display:inline-block;width:50%>{{this.value.value.label}}</div><div style="display:inline-block;width:50%">=&nbsp;{{this.value.value.description}}</div>
  </div>
    */}
    }
  ]
});


FOAModel({
  name: 'LabelCompleter',
  properties: [
    { model_: 'DAOProperty', name: 'autocompleteDao' }
  ],
  methods: {
    autocomplete: function(data) {
      this.autocompleteDao = this.X.LabelDAO.where(
        data ?
          STARTS_WITH(QIssueLabel.LABEL, data) :
          TRUE);
    },
    f: QIssueLabel.LABEL
  }
});
