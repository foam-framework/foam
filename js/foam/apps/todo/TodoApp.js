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
  package: 'foam.apps.todo',
  name: 'TodoApp',
  extends: 'foam.browser.ui.BrowserView',
  requires: [
    'foam.browser.BrowserConfig',
    'foam.dao.EasyDAO',
    'foam.mlang.CannedQuery',
    'foam.apps.todo.model.Todo',
    'foam.apps.todo.ui.TodoCitationView',
    'foam.apps.todo.ui.TodoDetailView',
    'foam.ui.DAOListView',
    'foam.ui.TextFieldView',
    'foam.ui.md.CannedQueryCitationView',
    'foam.ui.md.PopupView',
  ],
  exports: [
    'dao',
    'dao as todoDAO',
  ],

  properties: [
    {
      name: 'cannedQueryDAO',
      factory: function() {
        return [
          this.CannedQuery.create({
            label: 'Todo',
            expression: EQ(this.Todo.IS_COMPLETED, false)
          }),
          this.CannedQuery.create({
            label: 'Completed',
            expression: EQ(this.Todo.IS_COMPLETED, true)
          }),
          this.CannedQuery.create({
            label: 'Everything',
            expression: TRUE
          })
        ].dao;
      }
    },
    {
      name: 'dao',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Todo,
          daoType: 'LOCAL',
          name: 'todo-app',
          cache: true,
          cloning: true,
          contextualize: true,
          seqNo: true
        });
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.BrowserConfig.create({
          dao: this.dao,
          cannedQueryDAO: this.cannedQueryDAO,
          listView: {
            factory_: 'foam.ui.DAOListView',
            rowView: 'foam.apps.todo.ui.TodoCitationView'
          },
          innerDetailView: 'foam.apps.todo.ui.TodoDetailView',
        });
      }
    },
    {
      name: 'className',
      defaultValue: 'todo-app'
    },
  ],
});
