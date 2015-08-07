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
  properties: [ { name: 'id', hidden: true }, 'name', 'surname' ]
});


MODEL({
  package: 'foam.demos.sevenguis',
  name: 'CRUD',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'foam.demos.sevenguis.Person',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO'
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
          // cloning: true,
          cache: true,
          seqNo: true
        });
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO'
    },
    {
      name: 'data',
      view: {factory_: 'foam.ui.DetailView', title: ''},
      factory: function() { return this.Person.create(); }
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.filteredDAO = this.dao;
    }
  ],
  templates: [
    function CSS() {/*
      .buttons { padding-left: 592px; }
      .crud .detailView { border: none; background: white; }
      .crud span { overflow: hidden !important; }
      .crud { width: 1000px; }
      .detailPane { width: 45%; display: inline-block; margin-left: 50px; margin-top: 16px; }
      .label { color: #039; font-size: 14px; padding-top: 6px; }
      .prefix { margin-left: 10px; }
      .summaryPane { width: 49%; display: inline-block; vertical-align: top; }
      .tableView { height: 184px; outline: none; }
      body { padding: 10px !important; }
    */},
    function toHTML() {/*
      <span class="prefix label">Filter prefix: </span> $$prefix{onKeyMode: true}
      <div class="crud">
        <span class="summaryPane">
          $$filteredDAO{
            model_: 'foam.ui.TableView',
            title: '',
            scrollEnabled: true,
            editColumns: false,
            hardSelection$: this.data$}
        </span>
        <span class="detailPane">$$data</span>
        <div class="buttons">$$createItem $$updateItem $$deleteItem</div>
      </div>
    */}
  ],
  actions: [
    {
      name: 'createItem',
      label: 'Create',
      isEnabled: function() {
        var n = this.data.name;
        var s = this.data.surname;
        return n && s;
      },
      action: function() {
        var self = this;
        var data = this.data.clone();
        data.id = undefined;
        console.log('create: ', this.data.toJSON());
        this.dao.put(data, {
          put: function(data) { self.data = data; }
        });
      }
    },
    {
      name: 'updateItem',
      label: 'Update',
      isEnabled: function() {
        return this.data.id;
      },
      action: function() {
        this.dao.put(this.data.clone(), {
          put: function(data) { self.data = data; }
        });
      }
    },
    {
      name: 'deleteItem',
      label: 'Delete',
      isEnabled: function() {
        return this.data.id;
      },
      action: function() {
        console.log('delete: ', this.data.toJSON());
        this.dao.remove(this.data.clone());
        this.data.id = this.data.name = this.data.surname = '';
      }
    }
  ]
});
