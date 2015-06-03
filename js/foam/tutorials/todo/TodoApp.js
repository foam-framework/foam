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
  package: 'foam.tutorials.todo',
  name: 'TodoApp',
  extendsModel: 'foam.browser.ui.BrowserView',
  requires: [
    'foam.browser.BrowserConfig',
    'foam.dao.EasyDAO',
    'foam.mlang.CannedQuery',
    'foam.tutorials.todo.model.Todo',
    'foam.tutorials.todo.ui.TodoCitationView',
    'foam.tutorials.todo.ui.TodoDetailView',
    'foam.ui.TextFieldView',
    'foam.ui.md.PopupView',
  ],

  exports: [
    'dao',
    'dao as todoDAO',
    'selection$',
  ],
  properties: [
    {
      name: 'cannedQueryDAO',
      factory: function() {
        return [
          this.CannedQuery.create({
            label: 'Todo',
            expression: AND(
                EQ(this.Todo.COMPLETED, false),
                NOT(this.Todo.PARENT))
          }),
          this.CannedQuery.create({
            label: 'Completed',
            expression: AND(
                EQ(this.Todo.COMPLETED, true),
                NOT(this.Todo.PARENT))
          }),
          this.CannedQuery.create({
            label: 'Everything',
            expression: NOT(this.Todo.PARENT)
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
        });
      }
    },
    {
      name: 'listView',
      defaultValue: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.tutorials.todo.ui.TodoCitationView'
      }
    },
    {
      name: 'detailView',
      defaultValue: 'foam.tutorials.todo.ui.TodoDetailView'
    },
    {
      name: 'newTodo',
      view: {
        factory_: 'foam.ui.TextFieldView',
        placeholder: 'Create new todo',
      },
      postSet: function(old, nu) {
        nu = nu ? nu.trim() : '';
        if ( ! nu ) return;
        this.dao.put(this.Todo.create({ description: nu }));
        this.newTodo = '';
      },
    },
    {
      name: 'className',
      defaultValue: 'todo-app'
    },
  ],
});
