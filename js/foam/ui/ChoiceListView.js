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
  package: 'foam.ui',
  name: 'ChoiceListView',

  extends: 'foam.ui.AbstractChoiceView',

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
      defaultValueFn: function() { return 'foamChoiceListView ' + this.orientation; }
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
        if ( ! this.$ || ! this.$.children ) return;
        for ( var i = 0 ; i < this.$.children.length ; i++ ) {
          var c = this.$.children[i];
          DOM.setClass(c, 'selected', i === this.index);
        }
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
    choiceToHTML: function(id, choice) {
      return '<' + this.innerTagName + ' id="' + id + '" class="choice">' +
          choice[1] + '</' + this.innerTagName + '>';
    },
    toInnerHTML: function() {
      var out = [];
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        this.on(
          'click',
          function(index) {
            this.choice = this.choices[index];
          }.bind(this, i),
          id);

        out.push(this.choiceToHTML(id, choice));
      }
      return out.join('');
    },

    initInnerHTML: function() {
      this.SUPER();
      this.updateSelected();
    },

    scrollToSelection: function() {
      // Three cases: in view, need to scroll up, need to scroll down.
      // First we determine the parent's scrolling bounds.
      var e = this.$ && this.$.children[this.index];
      if ( ! e ) return;
      var parent = e.parentElement;
      while ( parent ) {
        var overflow = this.X.window.getComputedStyle(parent).overflowY;
        if ( overflow === 'scroll' || overflow === 'auto' ) {
          break;
        }
        parent = parent.parentElement;
      }
      parent = parent || this.X.window;

      // Can't use scrollIntoView; it scrolls more containers than it should.
      if ( e.offsetTop < parent.scrollTop ) { // Scroll up
        parent.scrollTop = e.offsetTop;
      } else if ( e.offsetTop + e.offsetHeight >=
          parent.scrollTop + parent.offsetHeight ) { // Down
        parent.scrollTop = e.offsetTop + e.offsetHeight - parent.offsetHeight;
      }
    }
  },
  templates: [
    function CSS() {/*
.foamChoiceListView {
  list-style-type: none;
}

.foamChoiceListView .selected {
  font-weight: bold;
}

.foamChoiceListView.vertical {
  padding: 0;
}
.foamChoiceListView.vertical .choice {
  margin: 4px;
}

.foamChoiceListView.horizontal {
  padding: 0;
}
.foamChoiceListView.horizontal .choice {
  display: inline;
  margin: 12px;
}*/}
  ]
});
