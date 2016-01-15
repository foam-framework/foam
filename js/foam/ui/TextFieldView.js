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
  package: 'foam.ui',
  name:  'TextFieldView',
  label: 'Text Field',

  extends: 'foam.ui.SimpleView',

  requires: [ 'foam.ui.AutocompleteView' ],

  documentation: function() { /*
      The default $$DOC{ref:'foam.ui.View'} for a string. Supports autocomplete
      when an autocompleter is installed in $$DOC{ref:'.autocompleter'}.
  */},

  models: [
    {
      name: 'OnEnterValue',
      properties: [
        {
          name: 'element',
        },
        {
          name: 'listeners',
          factory: function() {
            return [];
          }
        }
      ],
      methods: [
        function get() { return this.element.value; },
        function set(value) {
          if ( this.get() !== value ) this.element.value = value;
        },
        function addListener(listener) {
          if ( ! listener ) return;
          if ( this.listeners.length === 0 )
            this.element.addEventListener('keydown', this.onKeyDown);
          this.listeners.push(listener);
        },
        function removeListener(listener) {
          var index = this.listeners.indexOf(listener);
          if ( index >= 0 ) this.listeners.splice(i, 1);
        },
        function fireListeners(e) {
          for (var i = 0; i < this.listeners.length; i++) {
            this.listeners[i](e);
          }
        }
      ],
      listeners: [
        {
          name: 'onKeyDown',
          code: function(e) {
            if ( e.keyCode === 13 ) {
              this.fireListeners(e);
            }
          }
        }
      ]
    }
  ],

  properties: [
    {
      type: 'String',
      name: 'name',
      defaultValue: 'field',
      documentation: function() { /* The name of the field. */}
    },
    {
      type: 'Int',
      name: 'displayWidth',
      defaultValue: 30,
      documentation: function() { /* The width to fix the HTML text box. */}
    },
    {
      type: 'Int',
      name: 'displayHeight',
      defaultValue: 1,
      documentation: function() { /* The height to fix the HTML text box. */}
    },
    {
      type: 'String',
      name: 'type',
      defaultValue: 'text',
      documentation: function() { /* The type of field to create. */}
    },
    {
      type: 'String',
      name: 'placeholder',
      defaultValue: undefined,
      documentation: function() { /* Placeholder to use when empty. */}
    },
    {
      type: 'Boolean',
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
        ['DONE_EDITING',   'Done editing'],
        ['EACH_KEYSTROKE', 'Every keystroke'],
        ['ENTER_ONLY',     'Enter only']
      ]
    },
    {
      type: 'Boolean',
      name: 'escapeHTML',
      defaultValue: true,
      // TODO: make the default 'true' for security reasons
      help: 'If true, HTML content is escaped in display mode.',
      documentation: function() { /* If true, HTML content is escaped in display mode. */}
    },
    {
      type: 'String',
      name: 'mode',
      defaultValue: 'read-write',
      view: { factory_: 'foam.ui.ChoiceView', choices: ['read-only', 'read-write', 'final'] },
      documentation: function() { /* Can be 'read-only', 'read-write' or 'final'. */}
    },
    {
      type: 'Boolean',
      name: 'required',
      documentation: 'If value is required.'
    },
    {
      type: 'String',
      name: 'pattern',
      documentation: 'Regex pattern for value.'
    },
    {
      name: 'domValue',
      hidden: true
    },
    {
      name: 'data',
      documentation: function() { /* The object to bind to the user's entered text. */}
    },
    {
      type: 'String',
      name: 'readWriteTagName',
      defaultValueFn: function() {
        return this.displayHeight === 1 ? 'input' : 'textarea';
      },
      hidden: true
    },
    {
      type: 'Boolean',
      name: 'autocomplete',
      defaultValue: true,
      documentation: function() { /* Set to true to enable autocomplete. */}
    },
    {
      name: 'autocompleter',
      documentation: function() { /* The autocompleter model to use. */}
    },
    {
      name: 'autocompleteView',
      documentation: function() { /* The autocomplete view created. */}
    }
  ],

  constants: {
    /** Escape topic published when user presses 'escape' key to abort edits. **/
    // TODO: Model as a 'Topic'
    ESCAPE: ['escape'],

    // These are the constants used by the updateMode. The text of these is
    // duplicated in the choices array of the updateMode property.
    // TODO(braden): That duplication sucks, we need a better way to handle
    // enums.
    DONE_EDITING:   'DONE_EDITING',
    EACH_KEYSTROKE: 'EACH_KEYSTROKE',
    ENTER_ONLY:     'ENTER_ONLY'
  },

  methods: {
    toHTML: function() {
      /* Selects read-only versus read-write DOM output */
      return this.mode === 'read-write' ?
        this.toReadWriteHTML() :
        this.toReadOnlyHTML()  ;
    },

    toReadWriteHTML: function() {
      /* Supplies the correct element for read-write mode */
      var str = '<' + this.readWriteTagName + ' id="' + this.id + '"';
      str += ' type="' + this.type + '" ' + this.cssClassAttr();

      this.on('click', this.onClick, this.id);

      str += this.readWriteTagName === 'input' ?
        ' size="' + this.displayWidth + '"' :
        ' rows="' + this.displayHeight + '" cols="' + this.displayWidth + '"';

      if ( this.required ) str += ' required';
      if ( this.pattern  ) str += ' pattern="' + this.pattern + '"';

      str += this.extraAttributes();

      str += ' name="' + this.name + '">';
      str += '</' + this.readWriteTagName + '>';
      return str;
    },

    extraAttributes: function() { return ''; },

    toReadOnlyHTML: function() {
      /* Supplies the correct element for read-only mode */
      var self = this;
      this.setClass('placeholder', function() { return self.data === ''; }, this.id);

      // Changing to a textarea doesn't work well because you can't override displayHeight
      // in templates
      return /* this.displayHeight === 1 ? */ '<' + this.tagName + ' id="' + this.id + '"' + this.cssClassAttr() + ' name="' + this.name + '"></' + this.tagName + '>' /*:
        '<textarea readonly id="' + this.id + '"' + this.cssClassAttr() + ' name="' + this.name + '" rows="' + this.displayHeight + '" cols="' + this.displayWidth + '"></textarea>'*/ ;
    },

    setupAutocomplete: function() {
      /* Initializes autocomplete, if $$DOC{ref:'.autocomplete'} and
        $$DOC{ref:'.autocompleter'} are set. */
      if ( ! this.autocomplete || ! this.autocompleter ) return;

      var view = this.autocompleteView = this.AutocompleteView.create({
        autocompleter: this.autocompleter,
        target: this
      });

      this.bindAutocompleteEvents(view);
    },

    onAutocomplete: function(data) {
      this.data = data;
    },

    bindAutocompleteEvents: function(view) {
      this.$.addEventListener('blur', function() {
        // Notify the autocomplete view of a blur, it can decide what to do from there.
        view.publish('blur');
      });
      this.$.addEventListener('input', (function() {
        view.autocomplete(this.textToValue(this.$.value));
      }).bind(this));
      this.$.addEventListener('focus', (function() {
        view.autocomplete(this.textToValue(this.$.value));
      }).bind(this));
    },

    initHTML: function() {
      if ( ! this.$ ) return;

      this.SUPER();

      if ( this.mode === 'read-write' ) {
        if ( this.placeholder ) this.$.placeholder = this.placeholder;

        if ( this.updateMode === this.EACH_KEYSTROKE ) {
          this.domValue = DomValue.create(this.$, 'input');
        } else if ( this.updateMode === this.DONE_EDITING ) {
          this.domValue = DomValue.create(this.$, 'change');
        } else {
          this.domValue = this.OnEnterValue.create({ element: this.$ });
        }

        // In KeyMode we disable feedback to avoid updating the field
        // while the user is still typing.  Then we update the view
        // once they leave(blur) the field.
        Events.relate(
          this.data$,
          this.domValue,
          this.valueToText.bind(this),
          this.textToValue.bind(this),
          this.updateMode === this.EACH_KEYSTROKE);

        if ( this.updateMode === this.EACH_KEYSTROKE )
          this.$.addEventListener('blur', this.onBlur);

        this.$.addEventListener('keydown', this.onKeyDown);
        this.$.addEventListener('keypress', this.onKeyPress);

        this.setupAutocomplete();
      } else {
        this.domValue = DomValue.create(
          this.$,
          'undefined',
          this.escapeHTML ? 'textContent' : 'innerHTML');

        Events.map(
          this.data$,
          this.domValue,
          this.valueToText.bind(this))
      }
    },

    textToValue: function(text) { /* Passthrough */ return text; },

    valueToText: function(value) { /* Filters for read-only mode */
      if ( this.mode === 'read-only' )
        return (value === '') ? this.placeholder : value;
      return value;
    },

    destroy: function( isParentDestroyed ) { /* Unlinks key handler. */
      this.SUPER(isParentDestroyed);
      Events.unlink(this.domValue, this.data$);
    }
  },

  listeners: [
    {
      name: 'onKeyDown',
      code: function(e) {
        if ( e.keyCode == 27 /* ESCAPE KEY */ ) {
          this.domValue.set(this.data);
          this.publish(this.ESCAPE);
        } else {
          this.publish(['keydown'], e);
        }
      }
    },
    {
      name: 'onKeyPress',
      documentation: 'Prevent shortcut keys from firing on <input> element',
      code: function(e) { e.stopPropagation(); }
    },
    {
      name: 'onBlur',
      code: function(e) {
        if ( this.domValue.get() !== this.data )
          this.domValue.set(this.data);
      }
    },
    {
      name: 'onClick',
      code: function(e) { this.$ && this.$.focus(); }
    },
  ]
});
