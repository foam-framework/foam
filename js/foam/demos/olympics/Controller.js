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
  extends: 'foam.ui.View',

  requires: [
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.demos.olympics.Medal',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.ui.md.PopupChoiceView',
    'foam.ui.md.SharedStyles',
    'foam.ui.md.TextFieldView',
    'foam.ui.search.GroupBySearchView',
    'foam.ui.search.SearchMgr',
    'foam.ui.search.TextSearchView'
  ],

  exports: [
    'gestureManager',
    'searchMgr',
    'touchManager',
  ],

  properties: [
    { type: 'Int', name: 'count' },
    { type: 'Int', name: 'totalCount' },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      factory: function() {
        var Medal = foam.demos.olympics.Medal;
        return foam.dao.EasyDAO.create({
          model: Medal,
          daoType: /*'IDB'*/ 'MDAO',
          dedup: true,
          cache: true,
          seqNo: true,
          autoIndex: true
        })/*.addIndex(Medal.CITY).addIndex(Medal.COLOR).addIndex(Medal.SPORT)*/;
      },
      postSet: function() {
	var self = this;
	this.dao.select(COUNT())(function (c) {
          if ( ! c.count ) {
            console.log('loading medal data');
            axhr('js/foam/demos/olympics/MedalData.json')(function (data) {
              data.limit(50000).select(function(m) { self.dao.put(self.Medal.create(m)); });
              self.count = self.totalCount = data.length;
              self.searchMgr.dao = self.dao;
            });
          } else {
            console.log('medal data already loaded');
	    self.count = self.totalCount = c.count;
            self.searchMgr.dao = self.dao;
          }
	});
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      view: { factory_: 'foam.ui.md.TableView', rowHeight: 48, scrollEnabled: true, xxxeditColumnsEnabled: true, xxxrows: 30}
    },
    {
      name: 'searchMgr',
      lazyFactory: function() {
        return this.SearchMgr.create({dao: this.dao, filteredDAO$: this.filteredDAO$});
      }
    },
    {
      name: 'query',
      factory: function() {
        return this.searchMgr.add(this.TextSearchView.create({model: this.Medal, richSearch: true}));
      }
    },
    {
      type: 'String',
      name: 'sql',
      displayWidth: 35,
      displayHeight: 8
    },
    {
      name: 'touchManager',
      factory: function() {
        return this.TouchManager.create();
      }
    },
    {
      name: 'gestureManager',
      factory: function() {
        return this.GestureManager.create();
      }
    },
    'fromYear', 'toYear', 'color', 'city', 'gender', 'discipline', 'event',
  ],

  methods: [
    function init() {
      //this.Y.registerModel(this.PopupChoiceView, 'foam.ui.ChoiceView');
      //this.Y.registerModel(this.TextFieldView, 'foam.ui.TextFieldView');
      this.SharedStyles.create();

      this.SUPER();

      GLOBAL.ctrl = this; // for debugging
      var Medal = this.Medal;
      var self  = this;

      this.addGroup(Medal.COLOR, null,      {size: 4});
      this.addGroup(Medal.GENDER, null,     {size: 3});
      this.addGroup(Medal.YEAR, 'fromYear', {label: 'From', op: GTE});
      this.addGroup(Medal.YEAR, 'toYear',   {label: 'To',   op: LTE});
      this.addGroup(Medal.COUNTRY);
      this.addGroup(Medal.CITY);
      this.addGroup(Medal.DISCIPLINE);
      this.addGroup(Medal.EVENT);

      this.searchMgr.predicate$.addListener(this.onPredicateChange);
    },

    function addGroup(prop, opt_name, opt_map) {
      var map = opt_map || {};
      map.property = prop;
      map.size = map.size || 1;
      map.floatingLabel = false;
      this[opt_name || prop.name] = this.searchMgr.add(this.GroupBySearchView.create(map));
    }
  ],

  listeners: [
    {
      name: 'onPredicateChange',
      isFramed: true,
      code: function(_, __, ___, predicate) {
        this.sql = 'SELECT * FROM Medal' +
          (predicate !== TRUE ? ' WHERE (' + predicate.toSQL() + ')' : '');

        this.filteredDAO.select(COUNT())(function(c) {
          this.count = c.count;
        }.bind(this));
      }
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function() { this.searchMgr.clear(); }
    }
  ],

  templates: [
    function CSS() {/*
      @import url(https://fonts.googleapis.com/icon?family=Material+Icons);
      html { overflow: hidden; }
      .tableView, .mdTableView {
        outline: none;
      }
      body > .medalController {
        width: 100%;
        height: 100%;
      }
      .medalController { display: flex; overflow: hidden; }
      .searchPanel { color: #666; }
      .foamSearchView select { width: 300px; }
      .tableView { width: auto !important; }
      .MedalTable { width: auto !important; }
      .searchPanel {
        margin: 15px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }
      .searchPanel flat-button {
        align-self: flex-end;
      }
      .searchResults {
        margin-left: 40px;
        position: relative;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      }
      .counts {
        color: rgba(0, 0, 0, 0.33);
        font-size: 16px;
        padding: 10px;
        flex-shrink: 0;
      }
      input[type='search'] {
        margin-bottom: 15px;
        width: 300px;
      }
      span[name='sql'] {
        border: 1px solid #999;
        display: inline-block;
        height: 120px;
        width: 300px;
      }
      .Gold   { color: #C98910; }
      .Silver { color: #A8A8A8; }
      .Bronze { color: #965A38; }
    */},
    function toHTML() {/*
      <div class="medalController">
        <div class="searchPanel">
          %%query
          %%fromYear %%toYear %%city %%discipline %%event %%country %%color %%gender
          $$clear{model_: 'foam.ui.md.FlatButton'}<br>
          <br>SQL:<br>$$sql{mode: 'read-only'}
          <br><br><%= FOAM_POWERED %>
        </div>
        <div class="searchResults">
          $$filteredDAO{ title: 'Olympic Medals' }
          <div class="counts"><%# this.count %> of <%# this.totalCount %> selected</div>
        </div>
      </div>
    */}
  ]
});
