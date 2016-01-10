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
  package: 'foam.demos',
  name: 'AllViews',

  properties: [
    {
      name: 'basicProperty'
    },
    {
      type: 'String',
      name: 'textField'
    },
    {
      type: 'String',
      name: 'textArea',
      displayHeight: 10
    },
    {
      type: 'String',
      name: 'readOnlyTextField',
      defaultValue: 'Read only text field',
      mode: 'read-only'
    },
    {
      type: 'String',
      name: 'readOnlyTextArea',
      displayHeight: 10,
      defaultValue: 'Read only text field\nwith\nmultiple\n\n\nlines\nof\ndata.',
      mode: 'read-only'
    },
    {
      type: 'StringArray',
      name: 'stringArrayProperty'
    },
    {
      type: 'Int',
      name: 'intProperty'
    },
    {
      type: 'Float',
      name: 'floatProperty'
    },
    {
      type: 'Boolean',
      name: 'toggleBoolean'
    },
    {
      type: 'Boolean',
      name: 'checkboxBoolean'
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'radioChoices',
      view: 'foam.ui.ChoiceListView',
      choices: ['Choice one', 'Choice two', ['Choice three', "Other", 'user']]
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'dropDownChoices',
      view: 'foam.ui.PopupChoiceView',
      choices: ['Choice a', 'Choice b', 'Choice c'],
    }
  ],
  actions: [
    {
      name: 'simpleAction',
      code: function() {}
    },
    {
      name: 'disabledAction',
      isEnabled: function() { return false; }
    },
    {
      name: 'hiddenAction',
      isAvailable: function() { return false; }
    }
  ]
});
