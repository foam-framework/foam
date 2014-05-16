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
  name: 'QIssuePerson',
  extendsModel: 'IssuePerson',

  templates: [
    {
      name: 'toSummaryHTML',
      template: '<div style="background:white;color:blue;padding:4px 0;width:200px"><span style="margin-left:6px;">{{this.value.value.name}}</span></div>'
    }
  ]
});

QIssuePerson.getPrototype();

FOAModel({
  name: 'PersonCompleter',
  properties: [
    { model_: 'DAOProperty', name: 'autocompleteDao' }
  ],
  methods: {
    autocomplete: function(data) {
      this.autocompleteDao = this.X.PersonDAO.where(
        data ?
          STARTS_WITH(QIssuePerson.NAME, data) :
          TRUE);
    },
    f: QIssuePerson.NAME
  }
});
  
