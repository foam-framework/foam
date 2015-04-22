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
             'foam.ui.md.CheckboxView',
             'foam.ui.md.PopupChoiceView'],

  properties: [
    {
      name: 'choices',
      defaultValueFn: function() {
        var arr = [];
        for (var i=0;  i < 14; i++) {
          arr.push(['value'+i, 'Choice '+i]);
        }
        arr.push(['name', 'Other', 'user']);
        return arr; }
    },
    {
      name: 'data',
      defaultValue: 'none'
    },
    {
      model_: 'BooleanProperty',
      name: 'booly'
    },
    {
      model_: 'BooleanProperty',
      name: 'enabledButton',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'showButton',
      defaultValue: true
    }
  ],

  actions: [
    {
      name: 'oneAction',
      label: 'one',
      action: function() {
        console.log("one action actionated");
      },
      isEnabled: function(action) {
        return this.enabledButton;
      },
      isAvailable: function(action) {
        return this.showButton;
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
      <hr/>
        $$data{model_:'foam.ui.md.ChoiceRadioView', choices:this.choices, orientation: 'horizontal'}
      <hr/>
        $$data
        $$data{model_: 'foam.ui.md.PopupChoiceView', choices:this.choices}
        $$oneAction
        $$enabledButton{model_:'foam.ui.md.CheckboxView', label: 'Button Enabled'}
        $$showButton{model_:'foam.ui.md.CheckboxView', label: 'Button Show'}
    */}
  ]

});