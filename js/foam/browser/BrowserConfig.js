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
  package: 'foam.browser',
  name: 'BrowserConfig',
  documentation: 'Configuration object for FOAM\'s browser. ' +
      'Create an instance of this model and load it in a BrowserView.',

  requires: [
    'foam.dao.NullDAO',
    'foam.mlang.CannedQuery',
    'foam.ui.CannedQueryCitationView',
    'foam.ui.DAOListView',
  ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      documentation: 'The master DAO to browse. Required.',
      required: true,
    },
    {
      name: 'filteredDAO',
      documentation: 'The filtered version of $$DOC{ref:".dao"} that\'s ' +
          'being viewed right now.',
      dynamicValue: function() {
        this.dao; this.query;
        var query = this.query || (this.showAllWithNoQuery ? TRUE : FALSE);
        return this.dao.where(this.query);
      },
      view: 'foam.ui.DAOListView',
    },
    {
      name: 'query',
      documentation: 'The authoritative mlang query. Formed from $$DOC{ref:".search"} ' +
          'AND $$DOC{ref:".cannedQuery"}. Dynamic value, should not need to ' +
          'be set directly.',
      dynamicValue: function() {
        // TODO(braden): Is AND the right semantics here? Maybe searches should
        // span the whole DAO without limiting by canned query.
        this.search; this.cannedQuery;
        var canned = this.cannedQuery.expression;
        return this.search === '' ? canned  : AND(this.queryParser(this.search), canned);
      },
    },
    {
      name: 'queryParser',
      documentation: 'Parser for user-entered search strings. Should return ' +
          'an mlang suitable for searching $$DOC{ref:".dao"}. Defaults to KEYWORD.',
      defaultValue: KEYWORD,
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'cannedQueryDAO',
      documentation: 'A DAO of $$DOC{ref:"foam.mlang.CannedQuery"} objects.',
      required: true,
      postSet: function(old, nu) {
        if (nu && !this.query) {
          nu.limit(1).select([])(function(arr) { this.cannedQuery = arr[0]; }.bind(this));
        }
      },
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.ui.CannedQueryCitationView',
      },
    },
    {
      name: 'cannedQuery',
      documentation: 'Currently selected canned query. Combined into $$DOC{ref:".query"} ' +
          'by ANDing its expression with $$DOC{ref:".search"}.',
    },
    {
      model_: 'StringProperty',
      name: 'search',
      view: {
        factory_: 'foam.ui.TextFieldView',
        onKeyMode: true,
      },
    },
    {
      name: 'menuFactory',
      documentation: 'The menuFactory returns a View for the left-side menu. ' +
          'By default, it returns the view for $$DOC{ref:".cannedQueryDAO"}.',
      defaultValue: function() {
        return this.DAOListView.create({
          data$: this.cannedQueryDAO$,
          rowView: 'foam.ui.CannedQueryCitationView'
        });
      }
    },
    {
      name: 'showAllWithNoQuery',
      documentation: 'When there is no query set, should the browser ' +
          'render all the data, or none of it? Defaults to all, set false if ' +
          'you have a lot of data and don\'t want to render it all.',
      defaultValue: true,
    },
    {
      model_: 'BooleanProperty',
      name: 'showAdd',
      documentation: 'An action to create a new value in $$DOC{ref:".dao"} ' +
          'will be rendered when this is set to true (the default).',
      defaultValue: true,
    },
  ],
});
