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
  name: 'ChoiceRadioViewDemo',
  extendsModel: 'foam.ui.View',
  package: 'foam.demos',
  
  requires: ['foam.ui.md.ChoiceRadioView'],
  
  properties: [
    {
      name: 'choices',
      defaultValueFn: function() { return [
        ['choice1', 'Choice 1'], 
        ['choice2', 'Choice 2']
      ]; }
    },
    {
      name: 'data',
      defaultValue: 'none'
    }
    
  ],
  templates: 
  [ 
    function toInnerHTML() 
    {/*
      <p>
      $$choices{model_:'foam.ui.md.ChoiceRadioView', choices:this.choices}
      </p>
      <p>
      $$data
      </p>
    */}
  ]

});