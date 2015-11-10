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
  extends: 'foam.browser.ui.BrowserView',
  requires: [
    'foam.browser.BrowserConfig',
    'foam.dao.EasyDAO',
    'foam.mlang.CannedQuery',
    'foam.tutorials.todo.model.Todo',
    'foam.tutorials.todo.ui.TodoCitationView',
  ],

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.BrowserConfig.create({
          model: this.Todo,
          dao: this.EasyDAO.create({
            model: this.Todo,
            daoType: 'LOCAL',
            cache: true,
            seqNo: true
          }),
          listView: {
            factory_: 'foam.ui.DAOListView',
            rowView: 'foam.tutorials.todo.ui.TodoCitationView',
          },
          cannedQueryDAO: [
            this.CannedQuery.create({
              label: 'Todo',
              order: 1,
              expression: EQ(this.Todo.IS_COMPLETED, false)
            }),
            this.CannedQuery.create({
              label: 'Done',
              order: 2,
              expression: EQ(this.Todo.IS_COMPLETED, true)
            }),
            this.CannedQuery.create({
              label: 'Everything',
              order: 3,
              expression: TRUE
            })
          ]
        });
      }
    },
  ]
});
