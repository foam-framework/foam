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
  name: 'RadioOptionView',
  package: 'foam.ui.md',
  extends: 'foam.ui.SimpleView',
  traits: ['foam.ui.md.MDStyleTrait'],

  imports: [
    'document',
  ],

  documentation: "A single radio button. Used by $$DOC{ref:'foam.ui.md.ChoiceRadioView'}",

  requires: [ 'foam.ui.md.HaloView' ],

  properties: [
    {
      name: 'data',
      documentation: "The selected value from the radio button group. If it equals $$DOC{ref:'.value'}, this is selected.",
    },
    {
      name: 'value',
      documentation: "The value that this option represents. If clicked this value is set on $$DOC{ref:'.data'}."
    },
    {
      name: 'label',
      defaultValueFn: function() { return this.value; }
    },
    {
      name: 'choice',
      documentation: "Convenient way to set value and label from a choice array.",
      getter: function() {
        return [ this.value, this.label ];
      },
      setter: function(val) {
        this.value = val[0];
        this.label = val[1];
      }
    },
    {
      name: 'className',
      defaultValue: 'radiobutton-container noselect'
    },
    {
      name: 'enabled',
      defaultValue: true
    },
    {
      name: 'halo',

      documentation: function() {/*
        onRadio/offRadio's 'pointer-events: none' is critical for halo touches
      */},
      factory: function() {
        return this.HaloView.create({
            width: 48,
            height: 48
        }, this.Y);
      }
    },
  ],

  methods: {
    init: function() {
      this.SUPER();

      Events.dynamicFn(
        function() { this.data; this.value; }.bind(this),
        function() {
          this.setHaloColor();
        }.bind(this)
      );
    }
  },

  listeners: [
    {
      name: 'setHaloColor',
      code: function() {
       this.halo.color = equals(this.data, this.value) ? "#5a5a5a" : "#4285f4";
      }
    },
    {
      name: 'onClick',
      code: function() {
        var active = this.document.activeElement;
        if (active) active.blur();

        if ( this.enabled ) this.data = this.value;
        this.setHaloColor();
      }
    },
  ],

  templates: [
    function CSS() {/*

      .radiobutton-container {
        display: block;
        white-space: nowrap;
        position: relative;
      }

      .radiobutton-container :focus {
        outline: none;
      }

      #radioContainer {
        position: absolute;
        left: -16px;
        top: -16px;
        width: 48px;
        height: 48px;
        cursor: pointer;

      }

      .radio-indicator {
        position: relative;
        width: 16px;
        height: 16px;
        align-self: center;
      }

      #radioContainer.labeled {
        display: inline-block;
        vertical-align: middle;
      }

      #offRadio {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: solid 2px;
        border-color: #5a5a5a;
        transition: border-color 0.28s;
        pointer-events: none;
      }

      .radiobutton-background {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        white-space: nowrap;
        position: relative;

      }
      .radiobutton-background.checked #offRadio {
        border-color: #4285f4;
      }

      #onRadio {
        position: absolute;
        top: 4px;
        left: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #4285f4;
        -webkit-transform: scale(0);
        transform: scale(0);
        transition: -webkit-transform ease 0.28s;
        transition: transform ease 0.28s;
        pointer-events: none;
      }

      .radiobutton-background.checked #onRadio {
        -webkit-transform: scale(1);
        transform: scale(1);
      }

      .radioLabel {
        position: relative;
        display: block;
        vertical-align: middle;
        margin-left: 12px;
        white-space: normal;
        pointer-events: none;
      }

      .radioLabel.hidden {
        display: none;
      }

      .radiobutton-background.disabled {
        pointer-events: none;
      }

      .radiobutton-background.disabled #offRadio,
      .radiobutton-background.disabled #onRadio {
        opacity: 0.33;
      }

      .radiobutton-background.disabled #offRadio {
        border-color: #5a5a5a;
      }

      .radiobutton-background.disabled .radiobutton-background.checked #onRadio {
        background-color: #5a5a5a;
      }

    */},
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div id="<%=this.id%>-background" class="radiobutton-background">
          <div class="radio-indicator">
            <div id="onRadio"></div>
            <div id="offRadio"></div>
            <div id="radioContainer" class="labeled">
              <%= this.halo %>
            </div>
          </div>
          <div class="radioLabel">$$label{ mode: 'read-only', floatingLabel: false }</div>
        </div>
      </div>
      <%
        this.on('click', this.onClick, this.id);
        this.setClass('checked', function() { return equals(self.data, self.value); },
            this.id + '-background');
        this.setClass('disabled', function() { return !self.enabled; },
            this.id + '-background');
        this.setMDClasses();
      %>
    */}
  ]
});
