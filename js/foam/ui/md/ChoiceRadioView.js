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
  name: 'ChoiceRadioView',
  package: 'foam.ui.md',
  extends: 'foam.ui.AbstractChoiceView',

  requires: ['foam.ui.md.RadioOptionView',
             'foam.ui.md.RadioOptionTextFieldView'],

  traits: ['foam.ui.md.MDStyleTrait'],

  documentation: function(){/*
    For a choice list with only one selection at a time, this view provides radio buttons.
    The selected choice's value is set on $$DOC{ref:'.data'}. For a user-editable choice
    with a text field, specify 'user' as the third element of the choice:</p>
    <p>
    <code>[ 'value', 'Label text', user' ]</code>
  */},

  properties: [
    {
      name: 'orientation',
      defaultValue: 'horizontal',
      view: {
        factory_: 'foam.ui.ChoiceView',
        choices: [
          [ 'horizontal', 'Horizontal' ],
          [ 'vertical',   'Vertical'   ]
        ]
      },
      postSet: function(old, nu) {
        if ( this.$ ) {
          DOM.setClass(this.$, old, false);
          DOM.setClass(this.$, nu);
        }
      }
    },
    {
      name: 'prop',
    },
    {
      name: 'showLabel',
      defaultValue: false
    },
    {
      name: 'label',
      defaultValueFn: function() { return this.prop.label; }
    },
    {
      name: 'className',
      defaultValueFn: function() { return 'md-choice-radio-view ' + this.orientation; }
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      name: 'innerTagName',
      defaultValue: 'div'
    }
  ],

  methods: {
    shouldDestroy: function(old,nu) {
      return false;
    },

    scrollToSelection: function() {
      // Three cases: in view, need to scroll up, need to scroll down.
      // First we determine the parent's scrolling bounds.
      var e = this.$.children[this.index];
      if ( ! e ) return;
      var parent = e.parentElement;
      while ( parent ) {
        var overflow = this.X.window.getComputedStyle(parent).overflow;
        if ( overflow === 'scroll' || overflow === 'auto' ) {
          break;
        }
        parent = parent.parentElement;
      }
      parent = parent || this.X.window;

      if ( e.offsetTop < parent.scrollTop ) { // Scroll up
        e.scrollIntoView(true);
      } else if ( e.offsetTop + e.offsetHeight >=
          parent.scrollTop + parent.offsetHeight ) { // Down
        e.scrollIntoView();
      }
    }
  },
  templates: [
    function toInnerHTML() {/*
      <% if (this.showLabel) { %>
        <span class="md-choice-radio-view-title"><%= this.label %></span>
      <% } %>
<%
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];  %>
        <div class="choice">
      <% if ( choice[2] == 'user' ) { %>
          $$data{model_:'foam.ui.md.RadioOptionTextFieldView', inlineStyle$: this.inlineStyle$, choice: choice }
      <% } else { %>
          $$data{model_:'foam.ui.md.RadioOptionView', inlineStyle$: this.inlineStyle$, choice: choice }
      <% } %>
        </div>
<%        }
      this.setMDClasses(); %>
    */},

    function CSS() {/*
.md-choice-radio-view {
  margin: 0px;
  padding: 0px;
}

.md-choice-radio-view .selected {
  font-weight: bold;
}

.md-choice-radio-view.vertical {
  padding: 0;
}
.md-choice-radio-view.vertical .choice {
  display: block;
}

.md-choice-radio-view.horizontal.md-style-trait-inline  {
  margin-bottom: -3px;
}
.md-choice-radio-view.md-style-trait-inline  {
  margin: 0px;
  padding: 0px;
}
.md-choice-radio-view.md-style-trait-standard  {
  align-items: center;
  display: flex;
  margin: 0 0 0 16px;
  padding: 0;
}
.md-choice-radio-view.md-style-trait-standard .md-choice-radio-view-title {
  margin-right: 16px;
}


.md-choice-radio-view.horizontal .choice {
  display: inline-block;
  margin-right: 16px;
}*/}
  ]
});
