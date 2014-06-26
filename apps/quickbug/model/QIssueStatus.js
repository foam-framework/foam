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
          STARTS_WITH_IC(QIssueStatus.STATUS, data) :
          TRUE);

      var self = this;
      dao.limit(2).select()(function(objs) {
        if ( objs.length === 1 && self.f(objs[0]) === data ) {
          self.autocompleteDao = src.where(FALSE);
        } else {
          self.autocompleteDao = dao;
        }
      });
    },
    f: function(o) { return o.status; }
  }
});

FOAModel({
  name: 'StatusAutocompleteView',
  extendsModel: 'AutocompleteView',

  methods: {
    makeView: function() {
      var completer = this.completer;
      var strToHTML = this.strToHTML.bind(this);
      return this.X.ChoiceListView.create({
        dao: this.completer.autocompleteDao,
        extraClassName: 'autocompleteTable autocomplete',
        orientation: 'vertical',
        mode: 'final',
        objToChoice: function(obj) {
          return [completer.f(obj), '<div class="label">' + strToHTML(obj.status) + '</div><div class="description">= ' + strToHTML(obj.description) + '</div>']
        },
        useSelection: true
      });
    }
  }
});
