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
  package: 'foam.tutorials.todo.ui',
  name: 'TodoDetailView',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'foam.tutorials.todo.model.Todo',
  ],

  imports: [
    'stack',
    'todoDAO',
  ],

  exports: [
    'selection$',
  ],

  properties: [
    {
      name: 'model',
      factory: function() { return this.Todo; }
    },
    {
      name: 'className',
      defaultValue: 'todo-detail'
    },
    {
      name: 'selection',
      postSet: function(old, nu) {
        if (nu) {
          this.todoDAO.find(nu.id, {
            put: function(obj) {
              this.stack.pushView(this.model_.create({ data: obj }, this.Y));
            }.bind(this)
          });
        } else {
          this.stack.popView();
        }
      }
    },
  ],

  templates: [
    function CSS() {/*
      .todo-detail {
      }
    */},
    function toHTML() {/*
      <% if( !this.data ) return ''; %>
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        $$completed
        $$description
        $$subtasks{
          model_: 'foam.ui.DAOListView',
          rowView: 'foam.tutorials.todo.ui.TodoCitationView'
        }
      </div>
    */},
  ]
});
