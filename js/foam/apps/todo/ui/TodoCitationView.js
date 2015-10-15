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
  package: 'foam.apps.todo.ui',
  name: 'TodoCitationView',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.apps.todo.model.Todo',
  ],

  properties: [
    {
      name: 'className',
      defaultValue: 'todo-citation',
    },
  ],

  templates: [
    function CSS() {/*
      .todo-citation {
        align-items: center;
        border-bottom: 1px solid #eee;
        display: flex;
        font-size: 14px;
        height: 80px;
      }
      .todo-citation input {
        margin-right: 12px;
      }

      .todo-citation-center {
        display: flex;
        flex-direction: column;
        font-size: 12px;
        color: #666;
        overflow: hidden;
      }

      .todo-citation-name {
        color: #000;
        font-size: 16px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .todo-citation-description {
        overflow: hidden;
      }
      .todo-citation-description span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .todo-citation-details {
        display: flex;
        justify-content: space-between;
      }

      .todo-citation-priority {
        padding: 8px;
        margin: 0 8px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
        $$isCompleted{ label: '' }
        <div class="expand todo-citation-center">
          $$name{
            model_: 'foam.ui.TextFieldView',
            mode: 'read-only',
            extraClassName: 'todo-citation-name'
          }
          <div class="todo-citation-description">
            $$description{ model_: 'foam.ui.TextFieldView', mode: 'read-only' }
          </div>
          <div class="todo-citation-details">
            $$owner{ model_: 'foam.ui.TextFieldView', mode: 'read-only' }
            $$dueDate{ mode: 'read-only', floatingLabel: false }
          </div>
        </div>
        <div class="todo-citation-priority">
          $$priority{ mode: 'read-only', floatingLabel: false }
        </div>
      </div>
    */},
  ]
});
