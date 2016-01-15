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
  package: 'foam.demos.sevenguisu2',
  name: 'Person',

  tableProperties: [ 'surname', 'name' ],

  properties: [
    { name: 'id', hidden: true },
    { name: 'name',    toPropertyE: function(X) { return X.lookup('foam.u2.TextField').create({onKey: true}, X); } },
    { name: 'surname', toPropertyE: function(X) { return X.lookup('foam.u2.TextField').create({onKey: true}, X); } }
  ]
});


MODEL({
  package: 'foam.demos.sevenguisu2',
  name: 'CRUD',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.DetailView',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO', // TODO: This shouldn't be required
    'foam.demos.sevenguisu2.Person',
    'foam.u2.TableView'
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
          model: foam.demos.sevenguisu2.Person,
          daoType: 'IDB',
          cache: true,
          seqNo: true
        });
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      // TODO: replace with foam.u2.TableView when available
      toPropertyE: function(X) {
        return X.lookup('foam.u2.TableView').create({
          title: '',
          scrollEnabed: true,
          editColumns: false
        });
      },
      factory: function() { return this.dao; }
    },
    {
      name: 'selection',
      postSet: function(_, s) { this.data.copyFrom(s); }
    },
    {
      name: 'data',
      toPropertyE: 'foam.u2.DetailView',
      factory: function() { return this.Person.create(); }
    }
  ],
  templates: [
    function CSS() {/*
      ^ { padding: 10px; }
      ^ .detailView { border: none; background: white; }
      ^ .content span { margin-top: 24px; overflow: hidden !important; }
      ^ .buttons { margin-top: 24px; }
      ^ .content { width: 1000px; }
      ^ .detailPane { width: 45%; display: inline-block; margin-left: 50px; margin-top: 16px; }
      ^ .label { color: #039; font-size: 14px; padding-top: 6px; }
      ^ .prefix { margin-left: 10px; }
      ^ .summaryPane { width: 49%; display: inline-block; vertical-align: top; }
      ^ .tableView { height: 184px; outline: none; }
    */},
    function initE() {/*#U2
      <div class="^" x:data={{this}}>
        <span class="prefix label">Filter prefix: </span> <:prefix onKeyMode="true" type="search"/>
        <div class="content">
          <span class="summaryPane"><:filteredDAO hardSelection$={{this.selection$}}/></span>
          <span class="detailPane">
            <:data/>
            <div class="buttons"><:createItem/> <:updateItem/> <:deleteItem/></div>
          </span>
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
