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
  package: 'foam.browser.ui',
  name: 'BrowserView',
  extends: 'foam.ui.DetailView',
  requires: [
    'foam.browser.BrowserConfig',
    'foam.browser.ui.StackView',
    'foam.ui.md.FlatButton',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.ui.DAOListView',
    'foam.ui.PopupChoiceView',
    'foam.ui.Tooltip',
    'foam.ui.md.DetailView',
    'foam.ui.md.SharedStyles',
    'foam.ui.md.UpdateDetailView',
  ],

  exports: [
    'gestureManager',
    'stack',
    'touchManager',
  ],

  models: [
    {
      name: 'InnerBrowserView',
      extends: 'foam.ui.DetailView',
      requires: [
        'foam.ui.md.FlatButton',
        'foam.ui.PopupChoiceView',
        'foam.ui.SpinnerView',
        'foam.ui.md.HaloView',
      ],
      imports: [
        'document',
        'stack',
        'selection$',
      ],
      exports: [
        'selection',
      ],
      properties: [
        {
          name: 'data',
          postSet: function(old, nu) {
            if (old) old.unsubscribe(old.MENU_CLOSE, this.onMenuTouch);
            if (nu) nu.subscribe(nu.MENU_CLOSE, this.onMenuTouch);
            this.onMenuTouch();

            old.dao && old.dao.unlisten(this);
            nu.dao && nu.dao.listen(this);
          },
        },
        {
          name: 'className',
          defaultValue: 'browser'
        },
        {
          name: 'selection',
          documentation: 'Used in the list view.',
          postSet: function(old, nu) {
            if (nu && this.data && this.data.dao ) {
              this.data.dao.find(nu.id, {
                put: function(obj) {
                  this.stack.pushView(this.data.detailView({
                    data: obj,
                    controllerMode: 'update',
                    innerView: this.data.innerDetailView
                  }, this.Y.sub({ dao: this.data.dao })));
                }.bind(this),
                error: function() {
                  this.selection = null;
                }.bind(this)
              });
            } else {
              this.stack.popChildViews();
            }
          }
        },
        {
          name: 'menuExpanded',
          defaultValue: false
        },
        {
          name: 'menuView_',
        },
        {
          name: 'menuHeaderView_',
        },
        {
          name: 'menuOpen',
          defaultValue: false,
          postSet: function(old, nu) {
            if (nu) {
              var html = '';
              if (this.data.menuHeaderView) {
                this.menuHeaderView_ = this.data.menuHeaderView();
                html += this.menuHeaderView_.toHTML();
              }
              this.menuView_ = this.data.menuFactory();
              html += this.menuView_.toHTML();
              this.$menuBody.innerHTML = html;
              if (this.menuHeaderView_) this.menuHeaderView_.initHTML();
              this.menuView_.initHTML();
            } else if (this.menuView_) {
              this.menuView_.destroy();
              this.menuView_ = '';
              if (this.menuHeaderView_) {
                this.menuHeaderView_.destroy();
                this.menuHeaderView_ = '';
              }
            }
          },
        },
        {
          name: 'searchMode',
          defaultValue: false
        },
        {
          name: 'spinner',
          factory: function() {
            if ( ! this.data.busyStatus ) return;
            return this.SpinnerView.create({
              data$: this.data.busyStatus.busy$,
              color: '#fff'
            });
          }
        },
        {
          name: 'listView_',
          hidden: true,
          documentation: 'Internal. The View object created by the listView.'
        },
        {
          name: 'sortOrderView_',
          factory: function() {
            if (!this.data.sortChoices || this.data.sortChoices.length <= 1) return;
            return this.PopupChoiceView.create({
              iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAIUlEQVQ4y2NgGAVEg/9EAMo0DCFPU0/DIPc0bTSMArwAAI+/j3GjMHVsAAAAAElFTkSuQmCC',
              data$: this.data.sortOrder$,
              choices: this.data.sortChoices
            });
          }
        },
        {
          name: 'minWidth',
          getter: function() { return this.listView_.minWidth || 300; }
        },
        {
          name: 'preferredWidth',
          getter: function() { return this.listView_.preferredWidth || 400; }
        },
        {
          name: 'maxWidth',
          getter: function() { return this.listView_.maxWidth || 1280; }
        },
        {
          name: '$menuContainer',
          getter: function() {
            return this.X.$(this.id + '-menu-container');
          },
        },
        {
          name: '$menuBody',
          getter: function() {
            return this.X.$(this.id + '-menu-body');
          },
        },
      ],

      methods: [
        function initHTML() {
          var out = TemplateOutput.create(this);
          this.menuHTML(out);
          this.document.body.insertAdjacentHTML('afterbegin', out.toString());
          this.$menuBody.addEventListener('transitionend', this.onMenuClosed);
          this.SUPER();
        },
        function destroy(s) {
          this.SUPER(s);

          var menuBodyElem = this.$menuBody;
          if ( menuBodyElem ) this.$menuBody.removeEventListener('transitionend', this.onMenuClosed);
          var menuElem = this.$menuContainer;
          if ( menuElem ) menuElem.outerHTML = "";
        },

        function remove(selection) {
          /* when dao items change, make sure we don't leave the view open */
          if ( this.selection && this.selection.id && this.selection.id == selection.id ) {
            //this.listView_ && this.listView_.stack && this.listView_.stack.popView();
            this.selection = null;
          }
        },
      ],

      actions: [
        {
          name: 'menuButton',
          ligature: 'menu',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGklEQVQ4y2NgGAVEg/9EAMo0jHp61NOjAAgAUWrXKeQhPE4AAAAASUVORK5CYII=',
          isAvailable: function() { return ! this.menuExpanded; },
          code: function() {
            this.menuOpen = true;
          }
        },
        {
          name: 'searchButton',
          ligature: 'search',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAvklEQVQ4Ec3BO4rCYBgAwA/NOf6gZ1jZRlDwVoreI4W9+DiS0VJTGytlthMCyZLSmYjvZuGk8lY5msf/ZLaaCll0s8XDUjKQW6lRRBcLPPzEh4kas2jnhGU0WOMQ7VRI0WCEW7TzxiAaDPGKdirk0WCMe7RzxCoabLCPduaoTeLDryem0UWB2trI0NjGE7voJlNo2uEqj25mDm5e7vamEa64yKMvuQtKKfqSK1FK0ZdcibMUfUlKZyn6k6T4Xn//4NdJ9ptTNwAAAABJRU5ErkJggg==',
          code: function() {
            this.searchMode = true;
          }
        },
        {
          name: 'backButton',
          ligature: 'arrow_back',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPUlEQVQ4y2NgGLbgf8P/BtKU////+78WacpDSFMeSlPlYaQo/0OacjyAcg1wJ4WTGmHDS4sWaVrqhm/mBQAoLpX9t+4i2wAAAABJRU5ErkJggg==',
          code: function() {
            this.searchMode = false;
            this.data.search = '';
          }
        },
        {
          name: 'createButton',
          ligature: 'add',
          iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAH0lEQVQ4y2NgGAUw8B8IRjXgUoQLUEfDaDyQqmF4AwADqmeZrHJtnQAAAABJRU5ErkJggg==',
          isAvailable: function() { return this.data.showAdd; },
          code: function() {
            this.data.createFunction.call(this);
          }
        },
      ],

      listeners: [
        {
          name: 'onMenuTouch',
          isMerged: 200,
          code: function() {
            this.menuOpen = false;
          }
        },
        {
          name: 'onMenuClosed',
          code: function(evt) {
            if ( evt.propertyName && ! this.menuOpen ) {
              this.selection = null;
              this.updateHTML();
            }
          },
        },
        {
          name: 'onViewDestroyed',
          code: function(sender, topic, view) {
            if (view.data && this.selection && view.data.id == this.selection.id) {
              this.selection = null;
            }
          }
        },
      ],
      templates: [
        function CSS() {/*
          .hidden {
            display: none !important;
          }
          .expand {
            flex-grow: 1;
          }

          .browser {
            display: flex;
            flex-direction: column;
            height: 100%;
            position: relative;
          }
          .browser-header {
            align-items: center;
            color: #fff;
            display: flex;
            flex-grow: 0;
            flex-shrink: 0;
            height: 56px;
            padding: 0;
          }
          .browser-header .title {
            margin-left: 12px;
          }
          .browser-header .md-title {
            color: #fff;
          }

          .browser-header .browser-spinner {
            display: inline-block;
            height: 42px;
            overflow: hidden;
            width: 42px;
          }
          .browser-header .browser-spinner .spinner-fixed-box {
            height: 26px;
            width: 26px;
          }
          .browser-header .browser-spinner .spinner-circle {
            border-width: 3px;
          }

          .browser-header.search-header .md-text-field-input {
            color: #fff;
          }
          <% var prefixes = ['::-webkit-input', ':-moz', '::-moz', ':-ms-input'];
            for (var i = 0; i < prefixes.length; i++) { %>
              .browser-header.search-header .md-text-field-input><%= prefixes[i] %>-placeholder {
                color: #ccc;
              }
          <% } %>

          <% var ANIMATION_TIME = '0.4s'; %>

          .browser-menu-container {
            visibility: hidden;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 20;
            transition: visibility 0.01s linear <%= ANIMATION_TIME %>;
          }
          .browser-menu-container.menu-open {
            visibility: visible;
            transition: visibility <%= ANIMATION_TIME %> linear;
          }
          .browser-menu-inner {
            position: relative;
            height: 100%;
            width: 100%;
          }

          .browser-menu-overlay {
            background-color: #000;
            opacity: 0;
            position: absolute;
            height: 100%;
            top: 0;
            left: 0;
            width: 100%;
            transition: opacity <%= ANIMATION_TIME %> ease;
          }
          .menu-open .browser-menu-overlay {
            opacity: 0.4;
            transition: opacity <%= ANIMATION_TIME %> ease;
          }

          .browser-menu {
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
          .menu-open .browser-menu {
            transform: translate3d(0, 0, 0);
            transition: transform <%= ANIMATION_TIME %> ease;
          }

          .browser-body {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            overflow-x: hidden;
            overflow-y: auto;
          }
        */},
        function toHTML() {/*
          <div id="<%= this.id %>" <%= this.cssClassAttr() %>>
            <style>
              .browser-header-color { background-color: <%= this.data.headerColor %>; }
              .browser-body-color { background-color: <%= this.data.backgroundColor %>; }
            </style>

            <div id="<%= this.id %>-header" class="browser-header browser-header-color">
              $$menuButton
              $$title{ mode: 'read-only', extraClassName: 'md-title expand title' }
              <% if ( this.spinner ) { %>
                <span class="browser-spinner">%%spinner</span>
              <% } %>
              <% for ( var i = 0; i < this.parent.model_.getRuntimeActions().length; i++) {
                var v = this.createActionView(this.parent.model_.getRuntimeActions()[i]);
                v.data = this.parent;
                out(v);
              } %>
              $$searchButton
              <% if ( this.sortOrderView_ ) { %>
                <%= this.sortOrderView_ %>
              <% } %>
            </div>
            <div id="<%= this.id %>-header-search" class="browser-header search-header browser-header-color hidden">
              $$backButton
              $$search{ extraClassName: 'expand search-field' }
            </div>
            <% this.searchMode$.addListener(function() {
              // The setClass() must be done manually here because setting the
              // class first (so it becomes visible) and then calling .focus()
              // must occur inside the real DOM event handler, so the mobile
              // keyboard opens properly on input focus.
              DOM.setClass(self.X.$(self.id + '-header'), 'hidden',
                  self.searchMode);
              DOM.setClass(self.X.$(self.id + '-header-search'), 'hidden',
                  !self.searchMode);
              if ( self.searchMode ) self.searchView.focus();
            }); %>
            <div class="browser-body browser-body-color">
              <%= this.listView_ = this.data.listView({ data$: this.data.filteredDAO$ }, this.Y) %>
            </div>
            <% if (this.data.showAdd) { %>
              <div class="floating-action">
                <% var createButtonX = this.Y.sub();
                   createButtonX.registerModel(this.FlatButton.xbind({
                     haloColor: 'black',
                     displayMode: 'ICON_ONLY',
                   }), 'foam.ui.ActionButton'); %>
                $$createButton{
                  extraClassName: 'floatingActionButton',
                  color: 'white',
                  font: '30px Roboto Arial',
                  alpha: 1,
                  width: 44,
                  height: 44,
                  radius: 22,
                  background: '#e51c23',
                  X: createButtonX,
                }
              </div>
            <% } %>
          </div>
        */},
        function menuHTML() {/*
          <div id="<%= this.id %>-menu-container" class="browser-menu-container">
            <div class="browser-menu-inner">
              <div id="<%= this.id %>-menu-overlay" class="browser-menu-overlay"></div>
              <div id="<%= this.id %>-menu-body" class="browser-menu"></div>
            </div>
          </div>
          <%
            this.setClass('menu-open', function() { return self.menuOpen; },
                this.id + '-menu-container');
                this.on('click', this.onMenuTouch, this.id + '-menu-overlay');
          %>
        */},
      ],
    },
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
      factory: function() {
        return this.StackView.create();
      }
    },
    {
      name: 'className',
      defaultValue: 'browser-outer-container',
    },
  ],

  methods: [
    function init(args) {
      this.SUPER(args);
      this.Y.registerModel(this.FlatButton.xbind({
        displayMode: 'ICON_ONLY',
        height: 24,
        width: 24,
      }), 'foam.ui.ActionButton');
      this.SharedStyles.create();
    },
    function initHTML() {
      this.SUPER();
      this.stack.initHTML();
      this.stack.pushView(this.InnerBrowserView.create({
        parent: this,
        data$: this.data$
      }, this.Y));
    },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <% this.stack.toHTML(out); %>
      </div>
    */},
    function CSS() {/*
      .browser-outer-container {
        background-color: #9e9e9e;
      }
    */},
  ]
});
