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
  name:  'TextFieldView',
  label: 'Text Field',
  package: 'foam.ui',
  
  extendsModel: 'foam.ui.LeafDataView',
  traits: ['foam.ui.HTMLViewTrait'],

  documentation: function() { /*
      The default $$DOC{ref:'foam.ui.View'} for a string. Supports autocomplete
      when an autocompleter is installed in $$DOC{ref:'.autocompleter'}.
  */},

  properties: [
    {
      model_: 'StringProperty',
      name: 'name',
      defaultValue: 'field',
      documentation: function() { /* The name of the field. */}
    },
    {
      model_: 'IntProperty',
      name: 'displayWidth',
      defaultValue: 30,
      documentation: function() { /* The width to fix the HTML text box. */}
    },
    {
      model_: 'IntProperty',
      name: 'displayHeight',
      defaultValue: 1,
      documentation: function() { /* The height to fix the HTML text box. */}
    },
    {
      model_: 'StringProperty',
      name: 'type',
      defaultValue: 'text',
      documentation: function() { /* The type of field to create. */}
    },
    {
      model_: 'StringProperty',
      name: 'placeholder',
      defaultValue: undefined,
      documentation: function() { /* Placeholder to use when empty. */}
    },
    {
      model_: 'BooleanProperty',
      name: 'onKeyMode',
      help: 'If true, value is updated on each keystroke.',
      documentation: function() { /* If true, value is updated on each keystroke. */}
    },
    {
      model_: 'BooleanProperty',
      name: 'escapeHTML',
      defaultValue: true,
      // TODO: make the default 'true' for security reasons
      help: 'If true, HTML content is escaped in display mode.',
      documentation: function() { /* If true, HTML content is escaped in display mode. */}
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write',
      view: { factory_: 'ChoiceView', choices: ['read-only', 'read-write', 'final'] },
      documentation: function() { /* Can be 'read-only', 'read-write' or 'final'. */}
    },
    {
      model_: 'BooleanProperty',
      name: 'required',
      documentation: 'If value is required.'
    },
    {
      model_: 'StringProperty',
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
      model_: 'StringProperty',
      name: 'readWriteTagName',
      defaultValueFn: function() {
        return this.displayHeight === 1 ? 'input' : 'textarea';
      },
      hidden: true
    },
    {
      model_: 'BooleanProperty',
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
    ESCAPE: ['escape']
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
      return '<' + this.tagName + ' id="' + this.id + '"' + this.cssClassAttr() + ' name="' + this.name + '"></' + this.tagName + '>';
    },

    setupAutocomplete: function() {
      /* Initializes autocomplete, if $$DOC{ref:'.autocomplete'} and
        $$DOC{ref:'.autocompleter'} are set. */
      if ( ! this.autocomplete || ! this.autocompleter ) return;

      var view = this.autocompleteView = this.X.AutocompleteView.create({
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
      /* Connects key events. */
      if ( ! this.$ ) return;

      this.SUPER();

      if ( this.mode === 'read-write' ) {
        if ( this.placeholder ) this.$.placeholder = this.placeholder;

        this.domValue = DomValue.create(
          this.$,
          this.onKeyMode ? 'input' : 'change');

        // In KeyMode we disable feedback to avoid updating the field
        // while the user is still typing.  Then we update the view
        // once they leave(blur) the field.
        Events.relate(
          this.data$,
          this.domValue,
          this.valueToText.bind(this),
          this.textToValue.bind(this),
          this.onKeyMode);

        if ( this.onKeyMode )
          this.$.addEventListener('blur', this.onBlur);

        this.$.addEventListener('keydown', this.onKeyDown);

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

    destroy: function() { /* Unlinks key handler. */
      this.SUPER();
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
      name: 'onBlur',
      code: function(e) {
        if ( this.domValue.get() !== this.data )
          this.domValue.set(this.data);
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        this.$ && this.$.focus();
      }
    },
  ]
});

