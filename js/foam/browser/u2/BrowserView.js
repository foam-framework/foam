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
    'foam.browser.BrowserConfig',
    'foam.browser.u2.StackView',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.u2.ElementParser',
    'foam.u2.md.ActionButton',
    'foam.u2.md.Checkbox',
    'foam.u2.md.Input',
    'foam.u2.md.Select',
    'foam.u2.md.SharedStyles',
  ],

  exports: [
    'gestureManager',
    'stack',
    'touchManager',
  ],

  models: [
    {
      name: 'InnerBrowserView',
      extends: 'foam.u2.View',
      requires: [
        'foam.u2.DAOListView',
        'foam.u2.PropertyView',
        'foam.u2.md.ActionButton',
        'foam.u2.md.Input',
        'foam.u2.md.Select',
        //'foam.u2.md.Spinner',
      ],
      imports: [
        'document',
        'selection$',
        'stack',
      ],
      exports: [
        'selection$',
      ],

      properties: [
        {
          name: 'data',
          postSet: function(old, nu) {
            if (old) {
              old.unsubscribe(old.MENU_CLOSE, this.onMenuTouch);
              old.dao && old.dao.unlisten(this);
            }
            if (nu) {
              nu.subscribe(nu.MENU_CLOSE, this.onMenuTouch);
              nu && nu.dao && nu.dao.listen(this);
            }
            this.onMenuTouch();
          },
        },
        {
          name: 'title',
          defaultValueFn: function() { return this.data.title; }
        },
        {
          name: 'selection',
          documentation: 'Used in the list view.',
          postSet: function(old, nu) {
            if (nu && this.data && this.data.dao) {
              this.data.dao.find(nu.id, {
                put: function(obj) {
                  this.stack.pushView(this.data.detailView({
                    data: obj,
                    innerView: this.data.innerDetailView
                  }, this.Y.sub({ dao: this.data.dao, controllerMode: 'update' })));
                }.bind(this)
              });
            } else {
              this.stack.popChildViews();
            }
          },
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
          name: 'menuView_',
        },
        {
          name: 'menuOpen',
          defaultValue: false,
          postSet: function(old, nu) {
            if (nu && !this.menuRendered_) {
              if (this.data.menuHeaderView) {
                this.menuView_.add(this.data.menuHeaderView);
              }
              this.menuView_.add(this.data.menuFactory());
              this.menuRendered_ = true;
            }
          },
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
          name: 'listView_',
          hidden: true,
          documentation: 'Internal cached list view.',
        },
        {
          name: 'minWidth',
          getter: function() {
            return this.listView_.minWidth;
          }
        },
        {
          name: 'preferredWidth',
          getter: function() {
            return this.listView_.preferredWidth;
          }
        },
        {
          name: 'maxWidth',
          getter: function() {
            return this.listView_.maxWidth;
          }
        },
        {
          name: 'stack',
          postSet: function(old, nu) {
            old && old.unsubscribe(old.VIEW_DESTROYED, this.onViewDestroyed);
            nu && nu.unsubscribe(nu.VIEW_DESTROYED, this.onViewDestroyed);
          },
        },
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
          name: 'searchButton',
          ligature: 'search',
          code: function() {
            this.searchMode = true;
          }
        },
        {
          name: 'backButton',
          ligature: 'arrow_back',
          code: function() {
            this.searchMode = false;
            this.data.search = '';
          }
        },
        {
          name: 'createButton',
          ligature: 'add',
          isAvailable: function() { return this.data.showAdd; },
          code: function() {
            this.data.createFunction.call(this);
          }
        },
      ],

      listeners: [
        {
          name: 'onMenuTouch',
          documentation: 'Called when a menu item is selected.',
          code: function() {
            this.menuOpen = false;
          }
        },
        {
          name: 'onViewDestroyed',
          documentation: 'Called when the child view (detail view) is closed.',
          code: function(sender, topic, view) {
            if (view.data && this.selection && view.data.id === this.selection.id) {
              this.selection = null;
            }
          }
        },
      ],

      templates: [
        function CSS() {/*
          $ {
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
          }
          $-header {
            align-items: center;
            color: #fff;
            display: flex;
            flex-grow: 0;
            flex-shrink: 0;
            height: 56px;
            padding: 0;
          }
          $-header-title {
            flex-grow: 1;
            font-size: 20px;
            font-weight: 500;
            letter-spacing: .02em;
            margin-left: 12px;
          }

          $-search-header .foam-u2-md-Input {
            flex-grow: 1;
          }
          $-search-header input {
            color: #fff;
          }

          <% var prefixes = ['::-webkit-input', ':-moz', '::-moz', ':-ms-input'];
            for (var i = 0; i < prefixes.length; i++) { %>
              $-search-header .foam-u2-md-Input input><%= prefixes[i] %>-placeholder {
                color: #ccc;
              }
          <% } %>

          <% var ANIMATION_TIME = '0.4s'; %>

          $-menu-container {
            visibility: hidden;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 20;
            transition: visibility 0.01s linear <%= ANIMATION_TIME %>;
          }
          $-menu-container$-menu-open {
            visibility: visible;
            transition: visibility <%= ANIMATION_TIME %> linear;
          }

          $-menu-inner {
            position: relative;
            height: 100%;
            width: 100%;
          }
          $-menu-overlay {
            background-color: #000;
            opacity: 0;
            position: absolute;
            height: 100%;
            top: 0;
            left: 0;
            width: 100%;
            transition: opacity <%= ANIMATION_TIME %> ease;
          }
          $-menu-open $-menu-overlay {
            opacity: 0.4;
            transition: opacity <%= ANIMATION_TIME %> ease;
          }

          $-menu-body {
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
          $-menu-open $-menu-body {
            transform: translate3d(0, 0, 0);
            transition: transform <%= ANIMATION_TIME %> ease;
          }

          $-body {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            overflow-x: hidden;
            overflow-y: auto;
          }
        */},
      ],

      methods: [
        function initE() {
          var self = this;
          this.cls(this.myCls());
          this.start('style')
              .add('.' + this.myCls('header-color') + ' { background-color: ' +
                  this.data.headerColor + '; }')
              .end();
          var header = this.start('div')
              .x({ data: this })
              .cls(this.myCls('header'))
              .cls(this.myCls('header-color'))
              .cls2(function(sm) {
                return sm && 'foam-u2-Element-hidden';
              }.on$(this.X, this.searchMode$));

          header.add(this.MENU_BUTTON);
          header.start('span')
              .cls(this.myCls('header-title'))
              .add(this.title$)
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
              .cls(this.myCls('header-color'))
              .cls2(function(sm) {
                return sm || 'foam-u2-Element-hidden';
              }.on$(this.X, this.searchMode$))
              .add(this.BACK_BUTTON)
              .add(this.data.SEARCH);
          search.end();

          // This is needed to make sure the input box gets focused in the same
          // user input event that triggered the mode switch; that will cause
          // the keyboard to appear on mobile.
          this.searchMode$.addListener(function() {
            if (this.searchMode) {
              search.children[1].focus();
            }
          }.bind(this));

          this.listView_ = this.data.listView({
            data$: this.data.filteredDAO$
          }, this.Y);
          this.start('div').cls(this.myCls('body')).add(this.listView_).end();

          if (this.data.showAdd) {
            // TODO(braden): Make this a floating button, somehow.
            var button = this.CREATE_BUTTON.toE(this.Y);
            button.type = 'floating';
            button.color = '#fff';
            button.data = this;
            this.add(button);
          }

          this.menuView_ = this.start('div')
              .cls(this.myCls('menu-container'))
              .cls2(function(open) {
                return open && self.myCls('menu-open');
              }.on$(this.X, this.menuOpen$))
              .start('div').cls(this.myCls('menu-inner'))
                  .start('div').cls(this.myCls('menu-overlay'))
                      .on('click', this.onMenuTouch)
                      .end()
                  .start('div').cls(this.myCls('menu-body')).end()
              .end();
          this.menuView_.end();
        },
      ],
    }
  ],

  properties: [
    {
      name: 'touchManager',
      factory: function() {
        return this.X.touchManager || this.TouchManager.create();
      }
    },
    {
      name: 'gestureManager',
      factory: function() {
        return this.X.gestureManager || this.GestureManager.create();
      }
    },
    {
      name: 'stack',
      lazyFactory: function() {
        return this.StackView.create();
      }
    },
  ],

  methods: [
    function init() {
      this.ElementParser.create();
      this.SharedStyles.create();
      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');
      this.Y.registerModel(this.Checkbox, 'foam.u2.Checkbox');
      this.Y.registerModel(this.Input, 'foam.u2.Input');
      this.Y.registerModel(this.Select, 'foam.u2.Select');
      this.SUPER();
    },
    function initE() {
      this.cls(this.myCls('outer-container')).add(this.stack);
      this.stack.pushView(this.InnerBrowserView.create({
        parent: this,
        data$: this.data$
      }, this.Y));
    },
  ],

  templates: [
    function CSS() {/*
      $-outer-container {
        background-color: #9e9e9e;
      }
    */},
  ]
});
