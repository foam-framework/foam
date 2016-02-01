/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'foam.u2.search',
  name: 'AutocompleteView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.md.CitationView',
  ],

  documentation: 'Inner view for generic autocomplete. DOES NOT do any popup ' +
      'logic. Put this view into a popup container. To use it properly, ' +
      'a view must also forward <tt>keydown</tt> events for the up and down ' +
      'arrows, and pressing Enter, by calling $$DOC{ref:".onKeyDown"}.',

  properties: [
    {
      name: 'data',
      documentation: 'The real selection - only set when the user picks a ' +
          'result.',
    },
    {
      name: 'index',
      documentation: 'The currently selected index into the results.',
    },
    {
      type: 'foam.core.types.DAO',
      name: 'dao',
      documentation: 'The filtered set of autocomplete results.',
      onDAOUpdate: 'onDAOUpdate',
    },
    {
      name: 'rows_',
      documentation: 'Internal cache of the rendered rows.',
      postSet: function(old, nu) {
        // Move the index out of range whenever the rows change.
        this.index = -1;
      }
    },
    {
      type: 'ViewFactory',
      name: 'rowView',
      documentation: 'The view for each row. Defaults to ' +
          '$$DOC{ref:"foam.u2.md.CitationView"}.',
      defaultValue: 'foam.u2.md.CitationView',
    },
    {
      name: 'hidden_',
      defaultValue: false
    },
  ],

  methods: [
    function onKeyDown(e) {
      // Only paying attention to up and down arrows, and Enter.
      if ( e.keyCode === 38 /* up arrow */ ) {
        this.index = Math.max(0, this.index - 1);
        e.preventDefault();
        this.scrollToSelection();
      } else if ( e.keyCode === 40 /* down arrow */ ) {
        this.index = Math.min(this.rows_.length - 1, this.index + 1);
        e.preventDefault();
        this.scrollToSelection();
      } else if ( e.keyCode === 13 /* enter */ ) {
        // If the index isn't on a list item, return and let the normal Enter
        // flow take over.
        this.hidden_ = true;
        if (this.index < 0) {
          this.rows_ = [];
          return;
        }

        this.data = this.rows_[this.index];
        this.index = -1;
        e.preventDefault();
      } else {
        // Another key was typed, so reappear.
        this.hidden_ = false;
      }
    },
    function initE() {
      this.cls(this.myCls()).enableCls(this.myCls('hidden'), this.hidden_$);
      this.add(this.dynamic(function(rows, hidden) {
        var e = this.X.E('div').cls(this.myCls('rows'));
        if (hidden) return e;
        for (var i = 0; i < rows.length; i++) {
          var inner = this.rowView({ data: rows[i] }, this.Y);
          inner.enableCls(this.myCls('selected'), this.dynamic(function(i, index) {
            return index === i;
          }.bind(this, i), this.index$));
          inner.on('click', this.rowClick.bind(this, i));
          e.add(inner);
        }
        return e;
      }.bind(this), this.rows_$, this.hidden_$));
    },
    function onDAOUpdate() {
      this.dao.limit(20).select([].sink)(function(a) {
        this.rows_ = a;
      }.bind(this));
    },
    function rowClick(i) {
      this.data = this.rows_[i];
    },
    function scrollToSelection() {
      // Three cases: in view, need to scroll up, need to scroll down.
      // First we determine the parent's scrolling bounds.
      var e = this.children[0].children[this.index].el();
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
    },
  ],

  templates: [
    function CSS() {/*
      ^ {
        background-color: #fff;
      }
      ^ .foam-u2-md-CitationView- {
        font-size: 12px;
      }
      ^rows {
        display: flex;
        flex-direction: column;
      }
      ^selected {
        background-color: #e0e0e0;
      }
    */},
  ]
});
