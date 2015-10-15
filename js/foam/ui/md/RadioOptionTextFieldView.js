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

 // TODO: just integrate the text field in regular RadioOptionView?
CLASS({
  name: 'RadioOptionTextFieldView',
  package: 'foam.ui.md',
  extends: 'foam.ui.md.RadioOptionView',
  documentation: "A single radio button with text field to enter value. Used by $$DOC{ref:'foam.ui.md.ChoiceRadioView'}",

  requires: [ 'foam.ui.md.TextFieldView as TextFieldView'],

  properties: [
    {
      name: 'label',
      defaultValue: 'Other'
    },
    {
      name: 'value',
      postSet: function(old,nu) {
        if ( equals(this.data, old) ) { // is selected
          // if we are selected and the user changes the value, bubble the update up
          this.data = nu;
        }
      }
    }
  ],

  templates: [
    function CSS() {/*
      .radioLabel.input {
        pointer-events: all;
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
          <div class="radioLabel input">
            $$value{ model_: 'foam.ui.md.TextFieldView', inlineStyle:true, floatingLabel: false, onKeyMode: true }
          </div>
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
