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
  package: 'foam.tutorials.todo.model',
  name: 'Todo',
  properties: [
    {
      model_: 'IntProperty',
      name: 'id',
      hidden: true,
    },
    {
      model_: 'StringProperty',
      name: 'description',
      view: 'foam.ui.md.TextFieldView'
    },
    {
      model_: 'BooleanProperty',
      name: 'completed',
      defaultValue: false,
      view: 'foam.ui.md.CheckboxView'
    },
    {
      model_: 'ReferenceProperty',
      name: 'parent',
      subType: 'foam.tutorials.todo.model.Todo',
      subKey: 'ID',
      documentation: 'Reference to the parent of this todo item. If the ' +
          'parent is defined, this todo is treated as a subtask.',
    },
    // TODO(braden): Maybe add dueDate and priority as part of the tutorial?
  ],

  relationships: [
    {
      name: 'subtasks',
      relatedModel: 'foam.tutorials.todo.model.Todo',
      relatedProperty: 'parent'
    }
  ],
});
