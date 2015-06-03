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
  package: 'foam.demos.olympics',
  name: 'Controller',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.ui.TextFieldView',
    'foam.dao.EasyDAO',
    'foam.demos.olympics.Medal',
    'foam.ui.search.GroupBySearchView'
  ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'count'
    },
    {
      model_: 'IntProperty',
      name: 'totalCount'
    },
    {
      name: 'query'
    },
    {
      name: 'queryParser',
      factory: function() {
        return QueryParserFactory(this.Medal);
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      factory: function() {
        var Medal = foam.demos.olympics.Medal;
        return foam.dao.EasyDAO.create({
          model: Medal,
          daoType: 'MDAO',
          seqNo: true,
          autoIndex: true
        })/*.addIndex(Medal.CITY).addIndex(Medal.COLOR).addIndex(Medal.SPORT)*/;
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      view: { factory_: 'foam.ui.TableView', scrollEnabled: true, xxxeditColumnsEnabled: true, xxxrows: 30}
    },
    {
      name: 'fromYear'
    },
    {
      name: 'toYear'
    },
    {
      name: 'color'
    },
    {
      name: 'country'
    },
    {
      name: 'city'
    },
    {
      name: 'gender'
    },
    {
      name: 'discipline'
    },
    {
      name: 'event'
    },
    {
      name: 'predicate'
    },
    {
      model_: 'StringProperty',
      name: 'sql',
      displayWidth: 35,
      displayHeight: 10
    }
  ],

  methods: [
    function addGroup(prop, opt_name, opt_map) {
      var map = opt_map || {};
      map.property = prop;
      map.size = map.size || 1;
      this[opt_name || prop.name] = this.GroupBySearchView.create(map);
    },

    function init() {
      this.SUPER();

GLOBAL.ctrl = this;
      var self = this;
      var Medal = this.Medal;

      axhr('js/foam/demos/olympics/MedalData.json')(function (data) {
        data.limit(50000).select(function(m) { self.dao.put(self.Medal.create(m)); });
        self.count = self.totalCount = data.length;
        self.fromYear.dao = self.toYear.dao = self.discipline.dao = self.event.dao = self.color.dao = self.country.dao = self.city.dao = self.gender.dao = self.dao;
      });

      this.addGroup(Medal.YEAR, 'fromYear', {label: 'From', op: GTE});
      this.addGroup(Medal.YEAR, 'toYear',   {label: 'To',   op: LTE});
      this.addGroup(Medal.COLOR, null,      {size: 4});
      this.addGroup(Medal.COUNTRY);
      this.addGroup(Medal.CITY);
      this.addGroup(Medal.GENDER, null,     {size: 3});
      this.addGroup(Medal.DISCIPLINE);
      this.addGroup(Medal.EVENT);

      Events.dynamic(
        /*
        function() {
          self.fromYear.predicate;
          self.toYear.predicate;
          self.color.predicate;
          self.country.predicate;
          self.city.predicate;
          self.gender.predicate;
          self.discipline.predicate;
          self.event.predicate; },*/
        function() {
          self.predicate = AND(
            self.queryParser.parseString(self.query),
            self.fromYear.predicate,
            self.toYear.predicate,
            self.color.predicate,
            self.country.predicate,
            self.city.predicate,
            self.gender.predicate,
            self.discipline.predicate,
            self.event.predicate
          ).partialEval();

          self.sql = 'SELECT * FROM Medal' +
            (self.predicate !== TRUE ?
              ' WHERE (' + self.predicate.toSQL() + ')' :
              '');

          self.filteredDAO = self.dao.where(self.predicate);
          self.filteredDAO.select(COUNT())(function(c) {
            self.count = c.count;
          });
        });
    }
  ],

  actions: [
    {
      name: 'clear',
      action: function() {
        this.query = '';
        this.fromYear.predicate =
        this.toYear.predicate =
        this.color.predicate =
        this.country.predicate =
        this.city.predicate =
        this.gender.predicate =
        this.discipline.predicate =
        this.event.predicate = TRUE;
      }
    }
  ],

  templates: [
    function CSS() {/*
      .tableView {
        outline: none;
        height: 95%;
      }
      .medalController {
        display: flex;
      }
      .foamSearchView select {
        width: 300px;
      }
      .tableView {
        width: auto !important;
      }
      .MedalTable {
        width: auto !important;
      }
      .searchPanel {
        margin: 15px;
      }
      .searchResults {
        margin-left: 40px;
      }
      .counts {
        color: #555;
        font-size: 22px;
        margin: 20px;
      }
      input[name='query'] {
        margin-bottom: 15px;
        width: 300px;
      }
      .Gold   { color: #C98910; }
      .Silver { color: #A8A8A8; }
      .Bronze { color: #965A38; }
    */},
    function toHTML() {/*
      <div class="medalController">
        <div class="searchPanel">
          Search:<br>
          $$query
          %%fromYear %%toYear %%city %%discipline %%event %%country %%color %%gender
          $$clear<br>
          <br>SQL:<br>$$sql{mode: 'read-only'}
          <br>
          <br><%= FOAM_POWERED %>
        </div>
        <div class="searchResults">
          $$filteredDAO
          <div class="counts">$$count{mode: 'read-only'} of $$totalCount{mode: 'read-only'} selected</div>
        </div>
      </div>
    */}
  ]
});
