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
  package: 'foam.core.fo',
  name: 'Feature',
  help:  "A feature of a Model.",

  ids: [
    'model','name'
  ],

  tableProperties: [
    'model',
    'type',
    'name'
  ],

  properties: [
    {
      name:  'model',
      type:  'String'
    },
    {
      name:  'name',
      type:  'String',
      defaultValue: '',
      help: 'The coding identifier for the property.'
    },
    {
      name: 'type',
      type: 'String',
      required: true,
      view: {
        factory_: 'foam.ui.ChoiceView',
        choices: [
          'Property',
          'Method',
          'Listener',
          'Template',
          'Issue',
          'Test'
        ]
      },
      defaultValue: 'Property',
      help: 'Type of a feature.'
    },
    {
      name: 'label',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.capitalize(); },
      help: 'The display label for the property.'
    },
    {
      name: 'obj',
      hidden: true
    }
  ]
});
