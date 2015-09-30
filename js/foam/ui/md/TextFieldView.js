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
  package: 'foam.ui.md',
  name: 'TextFieldView',
  extendsModel: 'foam.ui.SimpleView',
  traits: ['foam.ui.md.MDStyleTrait'],

  requires: [
    'foam.ui.QueryParserAutocompleter',
    'foam.ui.md.AutocompleteView',
  ],

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
    {
      model_: 'BooleanProperty',
      name: 'enabled',
      defaultValue: true,
      postSet: function(old, nu) {
        if ( nu ) {
          this.$input && this.$input.removeAttribute('disabled');
        } else {
          this.$input && this.$input.setAttribute('disabled', '');
        }
      }
    },
    'prop',
    { name: 'label', defaultValueFn: function() { return this.prop.label; } },
    {
      model_: 'BooleanProperty',
      name: 'onKeyMode',
      help: 'If true, value is updated on each keystroke.',
      documentation: function() { /* If true, value is updated on each keystroke. */},
      getter: function() {
        return this.updateMode === this.EACH_KEYSTROKE;
      },
      setter: function(nu) {
        this.updateMode = nu ? this.EACH_KEYSTROKE : this.DONE_EDITING;
      }
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'updateMode',
      help: 'Controls when the real .data is updated: on every keystroke, ' +
          'when the user presses enter or blurs the box, or on enter only.',
      defaultValue: 'DONE_EDITING',
      choices: [
        ['DONE_EDITING', 'Done editing'],
        ['EACH_KEYSTROKE', 'Every keystroke'],
        ['ENTER_ONLY', 'Enter only']
      ]
    },
    {
      name: 'autocomplete',
      documentation: 'Set this to true to enable autocomplete. Off by ' +
          'default, unless the $$DOC{ref:".prop", label: "property"} has an ' +
          '$$DOC{ref:"Property.autocompleter"} set.',
      defaultValueFn: function() { return !! (this.prop && this.prop.autocompleter); }
    },
    {
      model_: 'FactoryProperty',
      name: 'autocompleter',
      defaultValue: 'foam.ui.QueryParserAutocompleter',
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'acRowView',
      defaultValue: 'foam.ui.md.DetailView'
    },
    {
      name: 'autocompleteView',
    },
    { model_: 'IntProperty', name: 'displayWidth' },
    { model_: 'IntProperty', name: 'displayHeight' },
    {
      model_: 'StringProperty',
      name: 'type',
      defaultValue: 'text',
      documentation: function() { /* The type of field to create. */}
    },
    {
      model_: 'BooleanProperty',
      name: 'floatingLabel',
      documentation: 'Set true for the floating label (see MD spec) by ' +
          'default, but can be disabled where the label is redundant.',
      defaultValue: true,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        //TODO: re-render
      },
    },
    {
      name: 'placeholder',
      documentation: 'When floatingLabel is false, an editable view will ' +
          'have a placeholder instead. Set this to empty string to hide the ' +
          'placeholder as well.',
      defaultValueFn: function() { return this.label; }
    },
    {
      model_: 'BooleanProperty',
      name: 'growable',
      documentation: 'Set true if this text area should grow with the text.',
      defaultValue: false
    },
    {
      name: 'clearAction',
      documentation: 'When true, will show an X for clearing the text box.',
      defaultValue: false
    },
    {
      name: 'clearIcon',
      defaultValue: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAABAUlEQVQ4y72Syw2CQBCGiQfpBbAILMFEIpHQxd+HJib2oIFifFwxG/EAHegFRx77BLmxc9nH98HM7ljWxAM2YqRg+FAwJIhg/8M3eKHSIkfQD89wNOAuDpiZwjBeK2Yy1Uis1VK73C/wUXKooNWtnT8xF0LMEZ9WXqsUcGi15GdbIaR8s4RHa5fgBl9I/zsLgUm5lnBrRccrPITwUcorfoqBV3gPC0696w0LTMfp656hZEJIDLyUyu/OTkKIlGvtcm/K9/lZKD9c3m5e6d7Vh7u3cyY9HCnBaGus9G46/MX3fe09rOx62ruW1tRiOsyMZBRlji3OeOBNkeGEUCl1kvEFpNGiJ85Uf0MAAAAASUVORK5CYII=',
    },
    {
      name: 'underline',
      documentation: 'When true, draws the underline for the text field.',
      defaultValue: true,
      postSet: function(old,nu) {
        //TODO: re-render
      }
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write',
      view: {
        factory_: 'foam.ui.ChoiceView',
        choices: ['read-only', 'read-write'],
      },
      documentation: function() { /* Can be 'read-only', or 'read-write'. */},
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( this.$ ) {
          this.$.outerHTML = this.toHTML();
          this.initHTML();
        }
      },
    }
  ],

  constants: {
    // These are the constants used by the updateMode. The text of these is
    // duplicated in the choices array of the updateMode property.
    // TODO(braden): That duplication sucks, we need a better way to handle
    // enums.
    DONE_EDITING: 'DONE_EDITING',
    EACH_KEYSTROKE: 'EACH_KEYSTROKE',
    ENTER_ONLY: 'ENTER_ONLY'
  },

  methods: {
    initHTML: function() {
      this.SUPER();
      this.softValue = DomValue.create(this.$input, 'input',
          this.growable ? 'textContent' : 'value');
      this.softValue.set(this.data);
      Events.link(this.softValue, this.softData$);

      if ( this.updateMode === this.EACH_KEYSTROKE ) {
        Events.link(this.data$, this.softData$);
      } else {
        Events.follow(this.data$, this.softData$);
      }

      this.setupAutocomplete();
    },

    setupAutocomplete: function() {
      if ( ! this.autocomplete ) return;
      var view = this.autocompleteView = this.AutocompleteView.create({
        autocompleter: this.autocompleter({
          prop: this.prop
        }, this.Y),
        target: this
      });

      this.bindAutocompleteEvents(view);
    },

    bindAutocompleteEvents: function(view) {
      this.$input.addEventListener('blur', function() {
        view.publish('blur');
      });
      this.$input.addEventListener('input', function() {
        view.autocomplete(this.softData);
      }.bind(this));
      this.$input.addEventListener('focus', function() {
        view.autocomplete(this.softData);
      }.bind(this));
    },

    onAutocomplete: function(data) {
      this.data = this.softData = data;
      this.onChange();
    },

    focus: function() {
      this.$input.focus();
    },
    blur: function() {
      this.$input && this.$input.blur();
    },
  },
  templates: [
    function CSS() {/*
      .md-text-field-container {
        align-items: center;
        display: flex;
        position: relative;
      }

      .md-text-field-container.md-style-trait-standard {
        margin: 8px;
        padding: 32px 8px 8px 8px;
      }
      .md-text-field-container.md-style-trait-inline {
        padding: 32px 0px 0px 0px;
        margin: -32px 0px 0px 0px;
      }
      .md-text-field-container.md-text-field-no-label.md-style-trait-inline {
        padding-top: 0px;
        margin: 0px;
      }

      .md-text-field-label {
        position: absolute;
        top: 32px;
        font-size: 14px;
        font-weight: 500;
        color: #999;
        transition: font-size 0.5s, top 0.5s;
        flex-grow: 1;
        z-index: 0;
      }
      .md-text-field-input {
        background: transparent;
        border-bottom: 1px solid #e0e0e0;
        border-left: none;
        border-right: none;
        border-top: none;
        color: #444;
        flex-grow: 1;
        font-family: inherit;
        font-size: inherit;
        margin-bottom: -8px;
        padding: 0 0 7px 0;
        resize: none;
        z-index: 1;
      }
      .disabled .md-text-field-input {
        border-bottom: none;
        padding-bottom: 8px;
      }
      .md-text-field-container.md-text-field-no-label .md-text-field-input {
      }

      .md-text-field-container.md-text-field-no-label {
        padding-top: 8px;
      }

      .md-text-field-borderless {
        border-bottom: none !important;
        padding-bottom: 8px;
      }

      .md-text-field-input:focus {
        border-bottom: 2px solid #4285f4;
        padding: 0 0 6px 0;
        outline: none;
      }
      .md-text-field-label-offset {
        font-size: 85%;
        top: 8px;
      }
    */},
    function toHTML() {/*
      <%
        var input = this.inputId = this.nextID();
        var label = this.labelId = this.nextID();

        if ( this.mode !== 'read-only' ) {
          this.on('focus',   this.onFocus,   input);
          this.on('blur',    this.onBlur,    input);
          this.on('input',   this.onInput,   input);
          this.on('change',  this.onChange,  input);
          this.on('click',   this.onClick,   input);
          this.on('keydown', this.onKeyDown, input);
        }

        if ( this.floatingLabel ) {
          this.setClass('md-text-field-label-offset',
            function() {
              var focused = self.focused;
              var data    = self.data;
              return focused || ('' + data).length > 0;
            }, label
          );
        } else {
          this.setClass('md-text-field-no-label', function() { return true; }, this.id);
        }
        this.setClass('disabled',
          function() {
            return self.mode == 'read-only';
          }, this.id
        );

        this.setMDClasses();
      %>
      <div <%= this.cssClassAttr() %> id="%%id">
        <% if (this.floatingLabel) { %>
          <label id="{{{label}}}" class="md-text-field-label">%%label</label>
        <% } %>
        <% if ( this.growable ) { %>
          <div id="{{{input}}}" class="md-text-field-input"<%= this.mode == 'read-write' ? ' contenteditable' : '' %>>
          </div>
        <% } else if ( this.displayHeight > 1 ) { %>
          <textarea id="{{{input}}}" type="%%type" <% out(( ! this.enabled ) ? 'disabled' : ''); %> class="md-text-field-input" rows="{{{this.displayHeight}}}"<%= this.mode == 'read-only' ? ' disabled' : '' %>></textarea>
        <% } else if ( this.mode === 'read-only' ) { %>
          <span id="{{{input}}}" class="md-text-field-read-only"><%# this.data %></span>
        <% } else { %>
          <input id="{{{input}}}" type="%%type" <% out(( ! this.enabled ) ? 'disabled' : ''); %>
              class="md-text-field-input <%= this.underline ? '' : 'md-text-field-borderless' %>"
              <%= (this.floatingLabel) ? '' : 'placeholder="' + this.placeholder + '"' %><%= this.mode == 'read-only' ? ' disabled' : '' %> />
          <% if ( this.clearAction ) { %>
            $$clear{ iconUrl: this.clearIcon, ligature: 'cancel' }
          <% } %>
        <% } %>
      </div>
    */}
  ],

  actions: [
    {
      name: 'clear',
      label: '',
      isAvailable: function() { return !! this.softData.length; },
      code: function() {
        this.data = this.softData = '';
      }
    }
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
        if (this.growable && this.updateMode !== this.ENTER_ONLY ) {
          // contenteditable doesn't fire onChange.
          this.data = this.softData;
        }
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
        if ( this.updateMode !== this.ENTER_ONLY )
          this.data = this.softData;
      }
    },
    {
      name: 'onKeyDown',
      code: function(e) {
        if ( this.autocompleter ) {
          this.publish(['keydown'], e);
          // Special case: For normal keys, stop here. For Enter, allow the
          // other case below to execute. When the autocompleter has selected
          // an entry, this is a redundant set of this.data; when the
          // autocomplete if empty this allows the normal Enter behavior for
          // text fields.
          if (e.keyCode !== 13) return;
        }

        // Do not update-on-enter when growable and/or displayHeight > 1.
        if ( e.keyCode === 13 && ! this.growable && this.displayHeight <= 1 )
          this.data = this.softData;
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
