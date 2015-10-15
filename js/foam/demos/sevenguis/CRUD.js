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

MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Person',
  tableProperties: [ 'surname', 'name' ],
  properties: [
    { name: 'id', hidden: true },
    { name: 'name',    view: { factory_: 'foam.ui.TextFieldView', onKeyMode: true } },
    { name: 'surname', view: { factory_: 'foam.ui.TextFieldView', onKeyMode: true } }
  ]
});


MODEL({
  package: 'foam.demos.sevenguis',
  name: 'CRUD',
  extends: 'foam.ui.View',
  requires: [
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.demos.sevenguis.Person',
    'foam.ui.TableView'
  ],
  properties: [
    {
      name: 'prefix',
      label: 'Filter prefix',
      postSet: function(_, prefix) {
        this.filteredDAO = this.dao.where(STARTS_WITH_IC(this.Person.SURNAME, prefix));
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      factory: function() {
        return foam.dao.EasyDAO.create({
          model: foam.demos.sevenguis.Person,
          daoType: 'IDB',
          cache: true,
          seqNo: true
        });
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      view: {
        factory_: 'foam.ui.TableView',
        title: '',
        scrollEnabled: true,
        editColumns: false
      },
      factory: function() { return this.dao; }
    },
    {
      name: 'data',
      view: { factory_: 'foam.ui.DetailView', title: '' },
      factory: function() { return this.Person.create(); }
    }
  ],
  methods: [
    function initHTML() {
      this.SUPER();
      this.filteredDAOView.hardSelection$.addListener(function(_, __, ___, selection) {
        if ( selection ) this.data.copyFrom(selection);
      }.bind(this));
    }
  ],
  templates: [
    function CSS() {/*
      .crud { padding: 10px; }
      .crud .buttons { padding-left: 592px; }
      .crud .detailView { border: none; background: white; }
      .crud .content span { overflow: hidden !important; }
      .crud .content { width: 1000px; }
      .crud .detailPane { width: 45%; display: inline-block; margin-left: 50px; margin-top: 16px; }
      .crud .label { color: #039; font-size: 14px; padding-top: 6px; }
      .crud .prefix { margin-left: 10px; }
      .crud .summaryPane { width: 49%; display: inline-block; vertical-align: top; }
      .crud .tableView { height: 184px; outline: none; }
    */},
    function toHTML() {/*
      <div class="crud">
        <span class="prefix label">Filter prefix: </span> $$prefix{onKeyMode: true, type: 'search'}
        <div class="content">
          <span class="summaryPane">$$filteredDAO</span>
          <span class="detailPane">$$data</span>
          <div class="buttons">$$createItem $$updateItem $$deleteItem</div>
        </div>
      </div>
    */}
  ],
  actions: [
    {
      name: 'createItem',
      label: 'Create',
      isEnabled: function() {
        var n = this.data.name, s = this.data.surname;
        return n && s;
      },
      code: function() {
        var data = this.data.clone();
        data.id = undefined;
        this.dao.put(data, {
          put: function(data) { this.data.copyFrom(data); }.bind(this)
        });
      }
    },
    {
      name: 'updateItem',
      label: 'Update',
      isEnabled: function() { return this.data.id; },
      code: function() {
        this.dao.put(this.data.clone(), {
          put: function(data) { self.data = data; }
        });
      }
    },
    {
      name: 'deleteItem',
      label: 'Delete',
      isEnabled: function() { return this.data.id; },
      code: function() {
        this.dao.remove(this.data.clone());
        this.data.id = this.data.name = this.data.surname = '';
      }
    }
  ]
});
