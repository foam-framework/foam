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

  extendsModel: 'foam.ui.AbstractChoiceView',

  requires: ['foam.ui.md.RadioOptionView',
             'foam.ui.md.RadioOptionTextFieldView'],

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
      name: 'className',
      defaultValueFn: function() { return 'foamChoiceRadioView ' + this.orientation; }
    },
    {
      name: 'tagName',
      defaultValue: 'ul'
    },
    {
      name: 'innerTagName',
      defaultValue: 'li'
    },
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
<%
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];  %>
        <div class="choice">
      <% if ( choice[2] == 'user' ) { %>
          $$data{model_:'foam.ui.md.RadioOptionTextFieldView', choice: choice }
      <% } else { %>
          $$data{model_:'foam.ui.md.RadioOptionView', choice: choice }
      <% } %>
        </div>
<%        }%>
    */},

    function CSS() {/*
.foamChoiceRadioView {
  list-style-type: none;
  -webkit-margin-before: 0px;
  -webkit-margin-after: 0px;
}

.foamChoiceRadioView .selected {
  font-weight: bold;
}

.foamChoiceRadioView.vertical {
  padding: 0;
}
.foamChoiceRadioView.vertical .choice {
  display: block;
}

.foamChoiceRadioView.horizontal {
  padding: 0;
}
.foamChoiceRadioView.horizontal .choice {
  display: inline-block;
  margin-right: 16px;
}*/}
  ]
});


