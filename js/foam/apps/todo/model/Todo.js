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
  package: 'foam.apps.todo.model',
  name: 'Todo',
  properties: [
    {
      name: 'id',
    },
    {
      name: 'name',
      view: 'foam.ui.md.TextFieldView'
    },
    {
      name: 'description',
      view: {
        factory_: 'foam.ui.md.TextFieldView',
        growable: true
      }
    },
    {
      type: 'Boolean',
      name: 'isCompleted',
      label: 'Completed',
      defaultValue: false,
      view: 'foam.ui.md.CheckboxView'
    },
    {
      //type: 'Reference',
      name: 'owner',
      //subType: 'foam.apps.todo.model.Person',
      //view: 'foam.apps.todo.ui.PersonView',
      view: 'foam.ui.md.TextFieldView',
    },
    {
      type: 'Date',
      name: 'dueDate',
      view: 'foam.ui.md.DateFieldView'
    },
    {
      type: 'Int',
      name: 'priority',
      defaultValue: 1
    },
  ],
  actions: [
    {
      name: 'delete',
      isAvailable: function() { return this.id; },
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAOklEQVQ4y2NgGPzgv8L/B/9h4MF/BXxK8QDqaCDH/aSaP6phVAMuDa+wqn+BW4P//5eYyv/7DvI8DwBDJ5LB6mdU8gAAAABJRU5ErkJggg==',
      code: function(X) {
        X.todoDAO.remove(this.id);
        X.stack.popView();
      }
    },
  ],
});
