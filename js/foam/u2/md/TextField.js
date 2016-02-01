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
  package: 'foam.u2.md',
  name: 'TextField',
  extends: 'foam.u2.View',

  imports: [
    'setTimeout',
  ],

  properties: [
    ['nodeName', 'div'],
    {
      name: 'showLabel',
      attribute: true,
      defaultValueFn: function() {
        return ! this.inline;
      }
    },
    {
      type: 'Boolean',
      name: 'inline',
      attribute: true,
      defaultValue: false
    },
    {
      name: 'label',
      attribute: true
    },
    {
      name: 'placeholder',
      attribute: true,
      documentation: 'Ignored when $$DOC{ref:".showLabel"} is true, but used ' +
          'as an inline placeholder when it\'s false.',
      defaultValueFn: function() { return this.label; }
    },
    {
      type: 'Boolean',
      name: 'onKey',
      attribute: true,
      defaultValue: false,
      documentation: 'Set true to update $$DOC{ref:".data"} on every ' +
          'keystroke, rather than on blur.',
    },
    {
      type: 'Boolean',
      name: 'focused_',
      defaultValue: false,
      postSet: function(old, nu) {
        if ( !old && nu && this.autocompleter ) {
          this.autocompleteView_ = this.autocompleteView({
            rowView: this.autocompleteRowView || undefined,
            dao: this.autocompleter.filteredDAO$Proxy
          }, this.Y);
          this.autocompleteView_.data$.addListener(function(_, __, old, nu) {
            if ( nu ) {
              this.data = nu.expression;
              this.autocompleter.partial = nu.expression;
            }
          }.bind(this));
          this.autocompletePopup_ = this.AutocompletePopup.create(null, this.Y);
          this.autocompletePopup_.add(this.autocompleteView_);
          this.add(this.autocompletePopup_);
        } else if ( old && !nu && this.autocompleteView_ ) {
          // Unload the entire autocomplete structure.
          // Needs to be in the next frame so it can update the value properly,
          // if the autocomplete was clicked.
          this.setTimeout(function() {
            if (this.autocompleteView_) {
              this.autocompleteView_.dao = undefined;
              this.autocompleteView_ = null;
            }
            if (this.autocompletePopup_) {
              this.autocompletePopup_.remove();
              this.autocompletePopup_ = null;
            }
          }.bind(this), 200);
        }
      },
    },
    {
      name: 'autocompleter',
      documentation: 'Optional. If set, this is the Autocompleter that will ' +
          'handle autocomplete results.',
    },
    {
      type: 'ViewFactory',
      name: 'autocompleteView',
      documentation: 'Factory for the autocompletion view. Override to ' +
          'configure how autocomplete results are displayed.',
      defaultValue: 'foam.u2.search.AutocompleteView',
    },
    {
      type: 'ViewFactory',
      name: 'autocompleteRowView',
      documentation: 'View for each row in the autocomplete popup.',
    },
    {
      name: 'autocompleteView_',
      documentation: 'Internal cache of the autocompletion view.',
    },
    {
      name: 'autocompletePopup_',
      documentation: 'Internal cache of the popup containing the ' +
          'autocomplete view.',
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.cls(this.myCls());
      if (this.showLabel) {
        this.start('label')
            .cls(this.myCls('label'))
            .cls(this.dynamic(function(data, focused) {
              return (typeof data !== 'undefined' && data !== '') ||
                  focused ? self.myCls('label-offset') : '';
            }, this.data$, this.focused_$))
            .add(this.label$)
            .end();
      } else {
        this.cls(this.myCls('no-label'));
      }

      this.inputE();
    },
    function inputE() {
      var self = this;
      var input = this.start('input')
        .attrs({ type: 'text', onKey: this.onKey })
        .on('focus', function() { self.focused_ = true; })
        .on('blur',  function() { self.focused_ = false; });

      if (!this.showLabel && this.placeholder)
        input.attrs({ placeholder: this.placeholder });
      Events.link(this.data$, input.data$);

      if (this.autocompleter) {
        Events.follow(input.attrValue(null, 'input'), this.autocompleter.partial$);
        input.on('keydown', function(e) {
          this.autocompleteView_ && this.autocompleteView_.onKeyDown(e);
        }.bind(this));
      }

      input.end();
    },
    function fromProperty(prop) {
      this.label = this.label || prop.label;
      return this.SUPER(prop);
    }
  ],

  templates: [
    function CSS() {/*
      ^ {
        align-items: center;
        display: flex;
        margin: 8px;
        padding: 32px 8px 8px 8px;
        position: relative;
      }
      ^label {
        color: #999;
        flex-grow: 1;
        font-size: 14px;
        font-weight: 500;
        position: absolute;
        top: 32px;
        transition: font-size 0.5s, top 0.5s;
        z-index: 0;
      }
      ^label-offset {
        font-size: 85%;
        top: 8px;
      }
      ^no-label {
        padding-top: 8px;
      }
      ^ input {
        background: transparent;
        border-bottom: 1px solid #e0e0e0;
        border-left: none;
        border-top: none;
        border-right: none;
        color: #444;
        flex-grow: 1;
        font-family: inherit;
        font-size: inherit;
        margin-bottom: -8px;
        padding: 0 0 7px 0;
        resize: none;
        z-index: 1;
      }
      ^ input:focus {
        border-bottom: 2px solid #4285f4;
        padding: 0 0 6px 0;
        outline: none;
      }
    */}
  ],

  models: [
    {
      name: 'AutocompletePopup',
      extends: 'foam.u2.Element',
      documentation: 'Exactly what it says on the tin. This is an MD-spec ' +
          'popup for autocomplete that appears right below the text field.',
      methods: [
        function initE() {
          this.cls(this.myCls());
        },
      ],
      templates: [
        function CSS() {/*
          ^ {
            left: 8px;
            right: 8px;
            max-height: 300px;
            opacity: 1;
            overflow-x: hidden;
            overflow-y: auto;
            position: absolute;
            top: 32px;
            z-index: 5;
          }
        */},
      ]
    },
  ]
});
