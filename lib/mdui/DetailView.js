/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
MODEL({
  name: 'mdDetailView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'className',
      defaultValue: 'mdDetailView'
    }
  ],
  methods: {
    init: function() {
      // Register MD PropertyViews
      this.X = this.X.sub();
      this.X.registerModel(mdTextFieldView,  'TextFieldView');
      this.X.registerModel(mdIntFieldView,   'IntFieldView');
      this.X.registerModel(mdFloatFieldView, 'FloatFieldView');
      this.SUPER();
    },
    titleHTML:    function() { return ''; },
    startForm:    function() { return ''; },
    endForm:      function() { return ''; },
    startColumns: function() { return ''; },
    nextColumn:   function() { return ''; },
    endColumns:   function() { return ''; },
    rowToHTML: function(prop, view) {
      /* HTML formatter for each $$DOC{ref:'Property'} row. */
      var str = "";

      str += view.toHTML();
      str += '<br>';

      return str;
    }
  }

});

MODEL({
  name: 'mdTextFieldView',
  extendsModel: 'View',

  properties: [
    {
      name: 'className',
      defaultValue: 'md-text-field-container'
    },
    { name: 'data' },
    { name: 'softData' },
    { name: 'inputId' },
    { name: '$input', getter: function() { return this.X.$(this.inputId); } },
    { name: 'labelId' },
    { name: '$label', getter: function() { return this.X.$(this.labelId); } },
    { model_: 'BooleanProperty', name: 'focused', defaultValue: false },
    'prop',
    { name: 'label', defaultValueFn: function() { return this.prop.label; } },
    { model_: 'BooleanProperty', name: 'onKeyMode', defautlValue: false },
    { model_: 'IntProperty', name: 'displayHeight' },
    { model_: 'IntProperty', name: 'displayWidth' }
  ],
  methods: {
    initHTML: function() {
      this.SUPER();
      this.softValue = DomValue.create(this.$input, 'input');
      this.softValue.set(this.data);
      Events.link(this.softValue, this.softData$);

      if ( this.onKeyMode ) {
        Events.link(this.data$, this.softData$);
      } else {
        Events.follow(this.data$, this.softData$);
      }
    }
  },
  templates: [
    function CSS() {/*
    .md-text-field-container {
      width: 100%;
      display: flex;
      position: relative;
    }
    .md-text-field-label {
      position: absolute;
      top: 40px;
      font-size: 14px;
      font-weight: 500;
      color: #999;
      transition: font-size 0.5s, top 0.5s;
      flex-grow: 1;
      margin-left: 16px;
      z-index: 0;
    }
    .md-text-field-input {
      background: transparent;
      border-bottom: 1px solid #B3E5FC;
      border: none;
      color: #444;
      flex-grow: 1;
      font-family: Roboto;
      font-size: 14px;
      margin: 40px 0 8px 16px;
      padding: 0 0 7px 0;
      resize: none;
      z-index: 1;
    }
    .md-text-field-input:focus {
      border-bottom: 2px solid #0288D1;
      padding: 0 0 6px 0;
      outline: none;
    }
    .md-text-field-label-offset {
      font-size: 12px;
      top: 16px;
    }
    */},
    function toHTML() {/*
      <%
        var input = this.inputId = this.nextID();
        var label = this.labelId = this.nextID();

        this.on('focus',   this.onFocus,   input);
        this.on('blur',    this.onBlur,    input);
        this.on('input',   this.onInput,   input);
        this.on('change',  this.onChange,  input);
        this.on('click',   this.onClick,   input);
        this.on('keydown', this.onKeyDown, input);

        this.setClass('md-text-field-label-offset',
          function() {
            var focused = self.focused;
            var data    = self.data;
            return focused || ('' + data).length > 0;
          }, label);
      %>
      <div %%cssClassAttr() id="%%id">
        <label id="{{{label}}}" class="md-text-field-label">%%label</label>
        <% if ( this.displayHeight > 1 ) { %>
          <textarea id="{{{input}}}" type="text" class="md-text-field-input" rows="{{{this.displayHeight}}}"></textarea>
        <% } else { %>
          <input id="{{{input}}}" type="text" class="md-text-field-input">
        <% } %>
      </div>
    */}
  ],

  listeners: [
    {
      name: 'onFocus',
      code: function() {
        this.focused = true;
      }
    },
    {
      name: 'onBlur',
      code: function() {
        this.focused = false;
      }
    },
    {
      name: 'onInput',
      code: function() {
      }
    },
    {
      name: 'onChange',
      code: function() {
        this.data = this.softData;
      }
    },
    {
      name: 'onKeyDown',
      code: function() {
      }
    },
    {
      name: 'onClick',
      code: function() {
        this.$input.focus();
      }
    }
  ]
});


MODEL({
  name: 'mdIntFieldView',
  extendsModel: 'mdTextFieldView'
});


MODEL({
  name: 'mdFloatFieldView',
  extendsModel: 'mdTextFieldView'
});
