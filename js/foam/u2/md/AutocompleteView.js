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
  package: 'foam.u2.md',
  name: 'AutocompleteView',
  extends: 'foam.u2.View',

  properties: [
    {
      type: 'Function',
      name: 'acRowFactory'
    },
    {
      name: 'autocompleter',
    },
    {
      name: 'target',
      postSet: function(old, nu) {
        if (old) old.unsubscribe(['keydown'], this.onKeyDown);
        nu.subscribe(['keydown'], this.onKeyDown);
      }
    },
    {
      name: 'autocompleteListE_',
      postSet: function(old, nu) {
        if ( old ) {
          old.data$.removeListener(this.complete);
          old.choices$.removeListener(this.choicesUpdate);
        }

        nu.data$.addListener(this.complete);
        nu.choices$.addListener(this.choicesUpdate);
      }
    },
    {
      name: 'maxHeight',
      defaultValue: 400
    },
    {
      name: 'closeTime',
      documentation: 'Milliseconds to delay before really closing the popup.',
      defaultValue: 200
    },
    'closeTimeout_',
    'current_',
  ],

  methods: [
    function autocomplete(partial) {
      if ( ! this.autocompleteListE_ ) {
        this.autocompleteListE_ = this.makeView();
      }

      this.current_ = partial;
      this.open(this.target);
      this.autocompleter.autocomplete(partial);
    },

    function makeView() {
      return this.ListView.create({
        dao: this.autocompleter.autocompleteDAO$Proxy,
        rowFactory: this.acRowFactory,
        objToChoice: this.autocompleter.f,
        useSelection: true
      }, this.Y);
    },

    function init(args) {
      this.SUPER(args);
      this.subscribe('blur', this.onBlur);
    },
    function open(e, opt_delay) {
      if ( this.closeTimeout_ ) {
        this.X.clearTimeout(this.closeTimeout_);
        this.closeTimeout_ = 0;
      }

      if ( this.$ ) {
        this.position(this.$.firstElementChild, e.$ || e);
        return;
      }

      var parentNode = e.$ || e;
      var document = parentNode.ownerDocument;

      console.assert( this.X.document === document, 'X.document is not global document');
      var div = document.createElement('div');
      var window = document.defaultView;
      console.assert( this.X.window === window, 'X.window is not global window');

      parentNode.insertAdjacentHTML('afterend', this.toHTML().trim());
      this.position(this.$.firstElementChild, parentNode);
      this.initHTML();
    },
    function close(opt_now) {
      if ( opt_now ) {
        if ( this.closeTimeout_ ) {
          this.X.clearTimeout(this.closeTimeout_);
          this.closeTimeout_ = 0;
        }
        this.$ && this.$.remove();
        return;
      }

      if ( this.closeTimeout_ ) return;

      this.closeTimeout_ = this.X.setTimeout(function() {
        this.closeTimeout_ = 0;
        this.$ && this.$.remove();
      }.bind(this), this.closeTime);
    },
    function position(div, parentNode) {
      var document = parentNode.ownerDocument;

      var pos = findPageXY(parentNode);
      var pageWH = [document.firstElementChild.offsetWidth, document.firstElementChild.offsetHeight];
      // TODO(braden): I think this is better just reducing the maxHeight than
      // setting bottom?
      if ( pageWH[1] - (pos[1] + parentNode.offsetHeight) < (this.height || this.maxHeight || 400) ) {
        div.style.bottom = parentNode.offsetHeight;
      }

      // We base our size off the focused element's size.
      var focusedRect = document.activeElement.getBoundingClientRect();
      var parentRect = parentNode.getBoundingClientRect();
      div.style.width = (this.width || focusedRect.width) + 'px';
      div.style.left = focusedRect.left - parentRect.left;

      if ( this.maxWidth ) {
        div.style.maxWidth = this.maxWidth + 'px';
      }
      if ( this.maxHeight ) {
        div.style.maxHeight = this.maxHeight + 'px';
      }
    },
  ],

  listeners: [
    {
      name: 'onKeyDown',
      code: function(_, __, e) {
        if ( ! this.view_ ) return;

        if ( e.keyCode === 38 /* arrow up */ ) {
          this.view_.index--;
          this.view_.scrollToSelection(this.$);
          e.preventDefault();
        } else if ( e.keyCode === 40 /* arrow down */ ) {
          this.view_.index++;
          this.view_.scrollToSelection(this.$);
          e.preventDefault();
        } else if ( e.keyCode === 13 /* enter */ ) {
          this.view_.commit();
          e.preventDefault();
        }
      }
    },
    {
      name: 'complete',
      code: function() {
        this.target.onAutocomplete(this.view_.data);
        this.view_ = this.makeView();
        this.close(true);
      }
    },
    {
      name: 'choicesUpdate',
      code: function() {
        if ( this.view_ &&
            ( this.view_.choices.length === 0 ||
                ( this.view_.choices.length === 1 &&
                  this.view_.choices[0][1] === this.current ) ) ) {
          this.close(true);
        }
      }
    },
    {
      name: 'onBlur',
      code: function() {
        this.close();
      }
    },
  ],

  templates: [
    function CSS() {/*
      .md-autocomplete-container {
        display: block;
        position: relative;
      }
      .md-autocomplete-popup {
        background: #fff;
        border-radius: 3px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
        margin: -4px 8px 8px 8px;
        overflow-y: auto;
        overflow-x: hidden;
        position: absolute;
        z-index: 2000;
      }
      .md-autocomplete-popup .autocomplete .choice {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
    */},
    function toHTML() {/*
      <span id="<%= this.id %>" class="md-autocomplete-container">
        <div <%= this.cssClassAttr() %>>
          <%= this.view_ %>
        </div>
      </span>
    */},
  ]
});
