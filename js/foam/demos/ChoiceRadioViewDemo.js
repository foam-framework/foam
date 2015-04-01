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
  extendsModel: 'foam.ui.SimpleView',
  package: 'foam.demos',
  
  requires: ['foam.ui.md.ChoiceRadioView',
             'foam.input.touch.TouchManager',
             'foam.input.touch.GestureManager',
             'foam.ui.md.FlatButton',
             'foam.ui.md.CheckboxView'],  
  
  properties: [
    {
      name: 'choices',
      defaultValueFn: function() { return [
        ['choice1', 'Choice 1'], 
        ['choice2', 'Choice 2'],
        ['name', 'Other', 'user'],
      ]; }
    },
    {
      name: 'data',
      defaultValue: 'none'
    },
    {
      name: 'booly'
    }
  ],
  
  actions: [
    {
      name: 'oneAction',
      label: 'one',
      action: function() {
        console.log("one action actionated");
      }
    }
    
  ],
  
  methods: {
    init: function() {
      this.Y.registerModel(this.FlatButton, 'foam.ui.ActionButton');

      this.SUPER();
      this.X.touchManager   = this.TouchManager.create();
      this.X.gestureManager = this.GestureManager.create();
      
    }
  },
  
  templates: 
  [ 
    function toInnerHTML() 
    {/*
      <p>
      $$data{model_:'foam.ui.md.ChoiceRadioView', choices:this.choices, orientation: 'vertical'}
      </p>
      <hr/>
      <p>
      $$data{model_:'foam.ui.md.ChoiceRadioView', choices:this.choices, orientation: 'horizontal'}
      </p>
      <hr/>
      <p>
      $$data
      </p>
      <p>
      $$oneAction
      </p>
      <p>
      $$booly{model_:'foam.ui.md.CheckboxView', label: 'Checkbox label'}
      </p>
    */}
  ]

});