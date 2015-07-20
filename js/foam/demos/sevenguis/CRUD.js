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
  properties: [ 'id', 'name', 'surname' ]
});


MODEL({
  package: 'foam.demos.sevenguis',
  name: 'CRUD',
  requires: [
    'foam.demos.sevenguis.Person',
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO'
  ],
  properties: [
    {
      name: 'prefix',
      label: 'Filter prefix'
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      factory: function() {
        return foam.dao.EasyDAO.create({
          model: foam.demos.sevenguis.Person,
          daoType: 'IDB',
          cache: true:
          seqNo: true
        });
      }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO'
    },
    {
      name: 'data'
    },
  ],
  methods: [
  ],
  actions: [
    {
      name: 'createItem',
      label: 'Create',
      action: function() {
        var self = this;
        this.dao.put(this.data, {
          put: function(data) { self.data = data; }
        });
      }
    },
    {
      name: 'updateItem',
      label: 'Update',
      action: function() {
        this.dao.put(this.data, {
          put: function(data) { self.data = data; }
        });
      }
    },
    {
      name: 'deleteItem',
      label: 'Delete',
      action: function() {
        this.dao.remove(this.data));
      }
    },
  ]
});
