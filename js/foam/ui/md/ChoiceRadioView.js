/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  
  requires: ['foam.ui.md.RadioOptionView'],

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
    }
  ],

  listeners: [
    {
      name: 'updateSelected',
      code: function() {
        // if ( ! this.$ || ! this.$.children ) return;
        // for ( var i = 0 ; i < this.$.children.length ; i++ ) {
        //   var c = this.$.children[i];
        //   DOM.setClass(c, 'selected', i === this.index);
        // }
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      // Doing this at the low level rather than with this.setClass listeners
      // to avoid creating loads of listeners when autocompleting or otherwise
      // rapidly changing this.choices.
      this.index$.addListener(this.updateSelected);
      this.choices$.addListener(this.updateSelected);
    },

    initInnerHTML: function() {
      this.SUPER();
      this.updateSelected();
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
        var choice = this.choices[i][0];
        var choiceLbl = this.choices[i][1]; %>
        <div class="choice">
          $$data{model_:'foam.ui.md.RadioOptionView', value: choice, label: choiceLbl}
        </div>
<%        }%>
    */},
    
    function CSS() {/*
.foamChoiceRadioView {
  list-style-type: none;
}

.foamChoiceRadioView .selected {
  font-weight: bold;
}

.foamChoiceRadioView.vertical {
  padding: 0;
}
.foamChoiceRadioView.vertical .choice {
  margin: 4px;
}

.foamChoiceRadioView.horizontal {
  padding: 0;
}
.foamChoiceRadioView.horizontal .choice {
  display: inline;
  margin: 12px;
}*/}
  ]
});


