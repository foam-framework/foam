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
  name: 'MDFieldGuide',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.graphics.ActionButtonCView',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.ChoiceRadioView',
    'foam.ui.md.EditableView',
    'foam.ui.md.FlatButton',
    'foam.ui.md.PopupChoiceView',
    'foam.ui.md.SharedStyles',
    'foam.ui.md.TextFieldView',
    'foam.ui.md.ToggleView',
    'foam.ui.md.PopupView'
  ],

  exports: [
    'gestureManager',
    'touchManager',
  ],

  models: [
    {
      name: 'GuideData',
      properties: [
        {
          name: 'textField',
          view: 'foam.ui.md.TextFieldView',
        },
        {
          name: 'onKeyField',
          view: 'foam.ui.md.TextFieldView',
        },
        {
          name: 'longString',
          view: 'foam.ui.md.TextFieldView',
        },
        {
          model_: 'foam.core.types.StringEnumProperty',
          name: 'choiceField',
          defaultValue: 'FIRST',
          choices: [
            ['FIRST', 'First option'],
            ['SECOND', 'Second option'],
            ['THIRD', 'Third option']
          ]
        },
        {
          type: 'Boolean',
          name: 'booleanField',
          label: 'I can be toggled on and off',
          defaultValue: false
        },
      ],
      actions: [
        {
          name: 'basicAction',
          label: 'Basic Actions',
          code: function() {}
        }
      ]
    }
  ],

  properties: [
    {
      name: 'data',
      factory: function() {
        return this.GuideData.create({
          textField: 'Some text'
        });
      }
    },
    {
      name: 'touchManager',
      factory: function() {
        return this.TouchManager.create();
      }
    },
    {
      name: 'gestureManager',
      factory: function() {
        return this.GestureManager.create();
      }
    },
    {
      name: 'styles_',
      hidden: true,
      factory: function() { this.SharedStyles.create(); }
    }
  ],

  actions: [
    {
      name: 'popupAction',
      code: function() {
        var popup = this.PopupView.create({
          delegate: Model.create({
            extends: 'foam.ui.SimpleView',
            imports: [
              'popup'
            ],
            actions: [
              {
                name: 'done',
                code: function() { this.popup.close(); }
              }
            ],
            templates: [
              {
                name: 'toHTML',
                template: '<div id="%%id"><div>hello world</div>$$done{model_: "foam.ui.md.FlatButton"}</div>'
              }
            ]
          })
        });
        popup.open();
        popup.close();
        popup.open();
      }
    }
  ],

  templates: [
    function CSS() {/*
      .field-guide {
        display: flex;
        flex-direction: column;
        font-size: 16px;
        height: 100%;
        width: 100%;
      }
      .guide-header {
        background-color: #3367d6;
        color: #fff;
        flex-shrink: 0;
        font-size: 200%;
        padding: 10px 20px;
      }
      .guide-body {
        flex-grow: 1;
        overflow-y: scroll;
        padding: 10px;
      }

      .section {
      }
      .subsection {
      }
      .example {
        border: 1px solid #e0e0e0;
        padding: 10px;
        margin: 10px 0;
      }
      .fixme {
        color: red;
      }
      .fixme-low {
        color: orange;
      }
    */},
    function textFieldHTML() {/*
      <div class="section">
        <h2>Text Fields</h2>
        <p>
          Text fields are based around <tt>foam.ui.md.TextFieldView</tt>.
          This model has many useful options. Most of these have following examples.
        </p>
        <ul>
          <li><tt>mode</tt>: Set <tt>'read-only'</tt> for a disabled, read-only text field.</li>
          <li><tt>onKeyMode</tt>: Defaults to false, where the <tt>data</tt> is only updated on <tt>blur</tt> or Enter key. Set <tt>true</tt> to update <tt>data</tt> on every keystroke, eg. for autocomplete.</li>
          <li><tt>floatingLabel</tt>: Defaults to <tt>true</tt>. Disable to use placeholder text instead of the MD floating label.</li>
          <li><tt>growable</tt>: Default <tt>false</tt>. Enable to make the text field grow as its contents get longer. Example use: a comment field.</li>
          <li><tt>displayHeight</tt>: The number of lines this field should occupy. Defaults to 1; set higher values to create a <tt>&lt;textarea&gt;</tt> instead. Ignored when <tt>growable: true</tt></li>
          <li><tt>underline</tt>: Disable to hide the underline for the field.</li>
          <li><tt>clearAction</tt>: Set <tt>true</tt> to show an "X" icon for clearing.</li>
          <li><tt>darkBackground</tt>: Set <tt>true</tt> to invert colors: the underline will be white instead of grey and blue, the clear action will be white instead of grey.</li>
        </ul>

        <div class="subsection">
          <h3>Examples</h3>

          <h4>Default</h4>
          <div class="example">
            <p>Pure defaults, <tt>onKeyMode: false</tt> and <tt>floatingLabel: true</tt></p>
            $$textField
          </div>
          <div class="example">
            <p>Read-only version</p>
            $$textField{ mode: 'read-only' }
          </div>

          <h4><tt>onKeyMode</tt></h4>
          <div class="example">
            <p>Editable</p>
            $$onKeyField{ onKeyMode: true }
          </div>
          <div class="example">
            <p>Read-only</p>
            $$onKeyField{ mode: 'read-only', onKeyMode: true }
          </div>

          <h4>No floating label</h4>
          <div class="example">
            <p>Note the placeholder when the field is empty.</p>
            $$textField{ floatingLabel: false }
          </div>

          <h4>Two stage view</h4>
          <div class="example">
            $$textField{ model_: 'foam.ui.md.EditableView' }
          </div>

          <h4>Text areas</h4>
          <div class="example">
            <p><tt>growable: true</tt></p>
            $$longString{ onKeyMode: true, growable: true }
          </div>
          <div class="example">
            <p>3-line text area, with scrolling (<tt>displayHeight: 3</tt>)</p>
            $$longString{ onKeyMode: true, displayHeight: 3, displayWidth: 20 }
          </div>
        </div>
      </div>
    */},
    function buttonHTML() {/*
      <div class="section">
        <h2>Buttons</h2>
        <p>
          MD Buttons come in several flavours: raised, flat and floating action buttons.
          FOAM has built-in models for the former two.
          You can restyle a raised button into a floating action button easily.
        </p>

        <h3>Raised Buttons</h3>
        <div class="example">
          <p class="fixme">FIX ME: We haven't needed a textual raised button.</p>
        </div>

        <h3>Flat Buttons</h3>
        <div class="example">
          <p><tt>foam.ui.md.FlatButton</tt></p>
          $$basicAction{ model_: 'foam.ui.md.FlatButton' }
        </div>

        <h3>Floating Action Buttons</h3>
        <p>So far, we've only used the one built into <tt>foam.ui.AppController</tt>.
        It's a <tt>foam.graphics.ActionButtonCView</tt> with a <tt>Flare</tt>
        and custom styling to make it floating and round.</p>
        <p class="fixme-low">FIX ME eventually</p>
      </div>
    */},
    function choicesHTML() {/*
      <div class="section">
        <h2>Choices</h2>
        <p>There are a few flavours of choice views.
        <ul>
          <li><tt>foam.ui.md.ChoiceMenuView</tt> is a pop-open menu.</li>
          <li><tt>foam.ui.md.ChoiceRadioView</tt> is a set of radio buttons.</li>
        </ul>
        Both expect a <tt>choices</tt> property, either supplied on the property
        or passed directly to the view. This <tt>choices</tt> is an array of choices,
        in order, where the choices are either a string, or a <tt>[value, label]</tt>
        pair.
        </p>

        <h3>Popup menu</h3>
        <div class="example">
          <p><tt>foam.ui.md.PopupChoiceView</tt></p>
          $$choiceField{ model_: 'foam.ui.md.PopupChoiceView' }
          <p class="fixme-low">TODO Use inline styling, but without jumpy resizing when the text changes.</p>
        </div>

        <h3>Radio buttons</h3>
        <div class="example">
          <p><tt>foam.ui.md.ChoiceRadioView</tt></p>
          $$choiceField{ model_: 'foam.ui.md.ChoiceRadioView' }
        </div>
      </div>
    */},
    function booleanHTML() {/*
      <div class="section">
        <h2>Booleans</h2>
        <p>There are a few flavours of boolean views as well:
        <ul>
          <li><tt>foam.ui.md.ToggleView</tt> is a MD switch view, ON OFF.</li>
          <li><tt>foam.ui.md.CheckboxView</tt> is a standard right-aligned MD checkbox.</li>
        </ul>
        </p>

        <h3>Toggle switches</h3>
        <div class="example">
          <p><tt>foam.ui.md.ToggleView</tt></p>
          $$booleanField{ model_: 'foam.ui.md.ToggleView' }
        </div>

        <h3>Checkboxes</h3>
        <div class="example">
          <p><tt>foam.ui.md.CheckboxView</tt></p>
          $$booleanField{ model_: 'foam.ui.md.CheckboxView' }
        </div>
      </div>
    */},
    function popupHTML() {/*
       $$popupAction{ model_: 'foam.ui.md.FlatButton' }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" class="field-guide">
        <div class="guide-header">
          FOAM Material Design Views
        </div>
        <div class="guide-body">
          <div class="section">
            <h2>General Notes</h2>
            <p>
              Use <tt>mode: 'read-only'</tt> to get read-only versions of most
              views.
            </p>
          </div>
          <% this.textFieldHTML(out); %>
          <% this.buttonHTML(out); %>
          <% this.choicesHTML(out); %>
          <% this.booleanHTML(out); %>
          <% this.popupHTML(out); %>
        </div>
      </div>
    */},
  ]
});
