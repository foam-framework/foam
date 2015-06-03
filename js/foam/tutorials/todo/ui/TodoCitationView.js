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
  name: 'TodoCitationView',
  extendsModel: 'foam.ui.DetailView',
  requires: [
    'foam.tutorials.todo.model.Todo',
  ],

  imports: [
    'dao',
  ],

  properties: [
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'dao',
      onDAOUpdate: 'onDAOUpdate',
    },
    {
      name: 'className',
      defaultValue: 'todo-citation',
    },
    {
      name: 'subtaskCount',
    },
    {
      name: 'completedSubtaskCount',
    },
    {
      name: 'subtaskFraction',
      view: 'foam.ui.ProgressView',
      dynamicValue: function() {
        this.subtaskCount; this.completedSubtaskCount;
        return this.subtaskCount > 0 ?
            100 * (this.completedSubtaskCount || 0) / this.subtaskCount : 0;
      }
    },
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        if (!this.data) return;
        var d = this.dao.where(EQ(this.Todo.PARENT, this.data.id));
        apar(
          d.select(COUNT()),
          d.where(EQ(this.Todo.COMPLETED, true)).select(COUNT())
        )(function(all, complete) {
          this.subtaskCount = all.count;
          this.completedSubtaskCount = complete.count;
        }.bind(this));
      }
    },
  ],

  templates: [
    function CSS() {/*
      .todo-citation {
        align-items: center;
        border-bottom: 1px solid #eee;
        display: flex;
        font-size: 14px;
        height: 56px;
      }
      .todo-citation input {
        margin-right: 12px;
      }
      .todo-hidden {
        display: none;
      }
      .todo-subtasks {
        margin-left: 12px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        $$completed{ label: '' }
        $$description{ mode: 'read-only', floatingLabel: false }
        <span id="<%= this.id %>-subtasks" class="todo-hidden todo-subtasks">
          $$subtaskFraction
          <%# this.completedSubtaskCount %> / <%# this.subtaskCount %>
        </span>
        <% this.setClass('todo-hidden', function() {
          return ! (self.subtaskCount > 0);
        }, this.id + '-subtasks'); %>
      </div>
    */},
  ]
});
