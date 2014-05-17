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
  name: 'QIssueStatus',

  ids: [ 'status' ],

  properties: [
    'status',
    'description',
    { model_: 'BooleanProperty', name: 'meansOpen' }
  ],

  templates: [
    {
      name: 'toSummaryHTML',
      template: function() {/*
  <div style="background:white;color:blue;padding:4px 0;width:400px">
    <div style="display:inline;width:25%">{{this.value.value.status}}</div>
    <div style="display:inline;width:75%;float:right">=&nbsp;{{this.value.value.description}}</div>
  </div>
    */}
    }
  ]
});

FOAModel({
  name: 'StatusCompleter',
  properties: [
    { model_: 'DAOProperty', name: 'autocompleteDao' }
  ],
  methods: {
    autocomplete: function(data) {
      var src = this.X.StatusDAO;
      var dao = src.where(
        data ?
          STARTS_WITH(QIssueStatus.STATUS, data) :
          TRUE);

      var self = this;
      dao.limit(2).select()(function(objs) {
        if ( objs.length === 1 && self.f.f(objs[0]) === data ) {
          self.autocompleteDao = src.where(FALSE);
        } else {
          self.autocompleteDao = dao;
        }
      });
    },
    f: QIssueStatus.STATUS
  }
});
