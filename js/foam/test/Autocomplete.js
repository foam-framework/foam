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
  package: 'foam.test',
  name: 'Autocomplete',
  extends: 'foam.ui.SimpleView',
  requires: [
    'MDAO',
    'foam.ui.md.TextFieldView',
  ],

  exports: [
    'dao as personDAO',
  ],

  models: [
    {
      model_: 'Model',
      name: 'Person',
      properties: ['id', 'name'],
    }
  ],

  properties: [
    {
      name: 'dao',
      factory: function() {
        var dao = this.MDAO.create({ model: this.Person });
        dao.put(this.Person.create({ id: 1, name: 'Kevin' }));
        dao.put(this.Person.create({ id: 2, name: 'Adam' }));
        dao.put(this.Person.create({ id: 3, name: 'Braden' }));
        dao.put(this.Person.create({ id: 4, name: 'Jackson' }));
        dao.put(this.Person.create({ id: 5, name: 'Mark' }));
        return dao;
      }
    },
    {
      type: 'String',
      name: 'query',
      subType: 'foam.test.Autocomplete.Person',
      subKey: 'NAME',
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        autocomplete: true,
      }
    },
  ],

  templates: [
    function toHTML() {/*
      <div>
        $$query
        <span style="background-color: red;">
          <%# this.query %>
        </span>
      </div>
    */},
  ],
});
