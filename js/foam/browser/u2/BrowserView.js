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
  package: 'foam.browser.u2',
  name: 'BrowserView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.DAOController',
    'foam.u2.DAOCreateController',
    'foam.u2.PropertyView',
    'foam.u2.SearchBorder',
    'foam.u2.md.ActionButton',
    'foam.u2.md.TextField',
    'foam.u2.md.Select'
  ],
  imports: [
    'document',
    'dynamic',
    'headerColor',
    'menuFactory',
    'stack'
  ],
  exports: [
    'headerColor'
  ],

  constants: {
    MENU_CLOSE: ['menu-close']
  },

  properties: [
    {
      name: 'data',
      documentation: 'This is the DAO to view.'
    },
    {
      name: 'title',
      factory: function() {
        return this.dynamic(function(data) {
          return data.model.name + ' Browser';
        }, this.data$);
      }
    },
    {
      type: 'Boolean',
      name: 'showAdd',
      documentation: 'Set this to false to hide the create button.',
      defaultValue: true
    },
    {
      name: 'headerColor',
      defaultValue: '#3e50b4'
    },
    {
      name: 'daoController',
      documentation: 'The inner $$DOC{ref:"foam.u2.DAOController"}. Will ' +
          'create a default one, if one is not provided.',
      lazyFactory: function() {
        return this.DAOController.create();
      }
    },
    {
      name: 'menuFactory',
      documentation: 'Factory that returns an Element for the menu.',
      defaultValue: function() {
        return this.X.E();
      }
    },
    {
      name: 'searchBorder_',
      lazyFactory: function() {
        return this.SearchBorder.create({
          data$: this.data$,
          delegate$: this.daoController$
        });
      }
    },
    {
      name: 'menuExpanded',
      documentation: 'Set when the menu is permanently visible beside ' +
          'the content.',
      defaultValue: false
    },
    {
      name: 'menuRendered_',
      defaultValue: false
    },
    {
      name: 'menuView_'
    },
    {
      name: 'menuOpen',
      defaultValue: false,
      postSet: function(old, nu) {
        if (nu && !this.menuRendered_) {
          var menu = this.menuFactory();
          this.menuView_.add(menu);
          menu.subscribe(this.MENU_CLOSE, this.onMenuTouch);
          this.menuRendered_ = true;
        }
      }
    },
    {
      name: 'searchMode',
      defaultValue: false
    },
    {
      name: 'spinner',
      // TODO(braden): Spinner support, based on BrowserConfig.busyStatus.
    },
    {
      name: 'minWidth',
      getter: function() {
        return this.daoController.minWidth;
      }
    },
    {
      name: 'preferredWidth',
      getter: function() {
        return this.daoController.preferredWidth;
      }
    },
    {
      name: 'maxWidth',
      getter: function() {
        return this.daoController.maxWidth;
      }
    }
  ],

  actions: [
    {
      name: 'menuButton',
      ligature: 'menu',
      isAvailable: function() { return !this.menuExpanded; },
      code: function() {
        this.menuOpen = true;
      }
    },
    {
      name: 'backButton',
      ligature: 'arrow_back',
      code: function() {
        this.searchMode = false;
      }
    },
    {
      name: 'searchButton',
      ligature: 'search',
      code: function() {
        this.searchMode = true;
      }
    },
    {
      name: 'createButton',
      ligature: 'add',
      isAvailable: function() { return this.showAdd; },
      code: function() {
        this.stack.pushView(this.DAOCreateController.create({ model: this.data.model }));
      }
    }
  ],

  listeners: [
    {
      name: 'onMenuTouch',
      documentation: 'Called when a menu item is selected.',
      code: function() {
        this.menuOpen = false;
      }
    }
  ],

  templates: [
    function CSS() {/*
      ^ {
        display: flex;
        flex-direction: column;
        height: 100%;
        position: relative;
      }
      ^header {
        align-items: center;
        color: #fff;
        display: flex;
        flex-grow: 0;
        flex-shrink: 0;
        height: 56px;
        padding: 0;
      }
      ^header-title {
        flex-grow: 1;
        font-size: 20px;
        font-weight: 500;
        letter-spacing: .02em;
        margin-left: 12px;
      }

      ^search-header span {
        flex-grow: 1;
      }
      ^search-header input {
        color: #fff;
      }

      <% var prefixes = ['::-webkit-input', ':-moz', '::-moz', ':-ms-input'];
        for (var i = 0; i < prefixes.length; i++) { %>
          ^search-header .foam-u2-md-TextField- input><%= prefixes[i] %>-placeholder {
            color: #ccc;
          }
      <% } %>

      ^search-header action-button {
        margin-right: 0;
      }

      <% var ANIMATION_TIME = '0.4s'; %>

      ^menu-container {
        visibility: hidden;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 20;
        transition: visibility 0.01s linear <%= ANIMATION_TIME %>;
      }
      ^menu-container^menu-open {
        visibility: visible;
        transition: visibility <%= ANIMATION_TIME %> linear;
      }

      ^menu-inner {
        position: relative;
        height: 100%;
        width: 100%;
      }
      ^menu-overlay {
        background-color: #000;
        opacity: 0;
        position: absolute;
        height: 100%;
        top: 0;
        left: 0;
        width: 100%;
        transition: opacity <%= ANIMATION_TIME %> ease;
      }
      ^menu-open ^menu-overlay {
        opacity: 0.4;
        transition: opacity <%= ANIMATION_TIME %> ease;
      }

      ^menu-body {
        background-color: #fff;
        position: absolute;
        height: 100%;
        top: 0;
        left: 0;
        transform: translate3d(-300px, 0, 0);
        overflow-y: auto;
        width: 300px;
        transition: transform <%= ANIMATION_TIME %> ease;
      }
      ^menu-open ^menu-body {
        transform: translate3d(0, 0, 0);
        transition: transform <%= ANIMATION_TIME %> ease;
      }

      ^body {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;
      }
    */}
  ],

  methods: [
    function initE() {
      var self = this;
      this.cls(this.myCls());

      var header = this.start('div')
          .x({ data: this })
          .cls(this.myCls('header'))
          .style({ 'background-color': this.headerColor })
          .enableCls('foam-u2-Element-hidden', this.searchMode$);

      header.add(this.MENU_BUTTON);
      header.start('span')
          .cls(this.myCls('header-title'))
          .add(this.title)
          .end();

      if (this.spinner) header.add(this.spinner);

      // TODO(braden): Parent actions. How to create them with the right
      // data?

      header.add(this.SEARCH_BUTTON);

      // TODO(braden): Sort order drop-down menu.
      header.end();

      var search = this.start('div')
          .x({ data: this })
          .cls(this.myCls('header'))
          .cls(this.myCls('search-header'))
          .style({ 'background-color': this.headerColor })
          .enableCls('foam-u2-Element-hidden', this.searchMode$, true /* negate */)
          .add(this.BACK_BUTTON)
          .add(this.searchBorder_.SEARCH.toE(this.Y.sub({ data: this.searchBorder_ })));
      search.end();

      // This is needed to make sure the input box gets focused in the same
      // user input event that triggered the mode switch; that will cause
      // the keyboard to appear on mobile.
      this.searchMode$.addListener(function() {
        if (this.searchMode) {
          search.children[0].focus();
        }
      }.bind(this));

      this.start('div').cls(this.myCls('body')).add(this.searchBorder_).end();

      if (this.showAdd) {
        // TODO(braden): Make this a floating button, somehow.
        var button = this.CREATE_BUTTON.toE(this.Y);
        button.type = 'floating';
        button.color = '#fff';
        button.data = this;
        this.add(button);
      }

      this.menuView_ = this.start('div')
          .cls(this.myCls('menu-container'))
          .enableCls(this.myCls('menu-open'), this.menuOpen$)
          .start('div').cls(this.myCls('menu-inner'))
              .start('div').cls(this.myCls('menu-overlay'))
                  .on('click', this.onMenuTouch)
                  .end()
              .start('div').cls(this.myCls('menu-body'));
      this.menuView_.end().end().end();
    }
  ]
});
