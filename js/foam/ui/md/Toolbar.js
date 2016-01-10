/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.ui.md',
  name: 'Toolbar',
  extends: 'foam.ui.SimpleView',

  requires: [
    'foam.ui.ActionButton',
    'foam.ui.md.ActionList',
    'foam.ui.md.FlatButton',
    'foam.ui.md.OverflowActionList',
    'foam.ui.md.ToolbarAction',
  ],

  properties: [
    'data',
    'title',
    [ 'extraClassName', 'browser-header-color' ],
    {
      name: 'leftActionList',
      lazyFactory: function() {
        var Y = this.Y.sub();
        Y.registerModel(this.ActionButton.xbind({
            displayMode: 'ICON_ONLY',
        }), 'foam.ui.ActionButton');
        return this.ActionList.create({
          data$: this.leftActions$,
          direction: 'HORIZONTAL',
        }, Y);
      },
    },
    {
      // type: 'foam.ui.md.OverflowActionList',
      name: 'rightActionList',
      lazyFactory: function() {
        return this.OverflowActionList.create({
          data$: this.rightActions$,
        }, this.Y);
      },
    },
    {
      type: 'Array',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'leftActions',
      postSet: function(old, nu) {
        var actionsElem = this.$leftActions;
        if ( old === nu || ! actionsElem ) return;
        var out = TemplateOutput.create(this);
        this.leftActionsInnerHTML(out);
        actionsElem.innerHTML = out.toString();
        this.leftActionList.initHTML();
      },
    },
    {
      type: 'Array',
      subType: 'foam.ui.md.ToolbarAction',
      name: 'rightActions',
    },
    {
      name: '$leftActions',
      getter: function() {
        return this.$ && this.$.querySelector('#' + this.id + '-left-actions');
      },
    },
  ],

  methods: [
    function addLeftAction(action) {
      if ( ! action ) return;
      this.addLeftActions([action]);
    },
    function addRightAction(action) {
      if ( ! action ) return;
      this.addRightActions([action]);
    },
    function removeLeftAction(action) {
      if ( ! action ) return;
      this.removeLeftActions([action]);
    },
    function removeRightAction(action) {
      if ( ! action ) return;
      this.removeRightActions([action]);
    },
    function addLeftActions(actions) { return this.addActions('left', actions); },
    function addRightActions(actions) { return this.addActions('right', actions); },
    function removeLeftActions(actions) { return this.removeActions('left', actions); },
    function removeRightActions(actions) { return this.removeActions('right', actions); },
    function addActions(side, actions) {
      if ( ( ! actions ) || actions.length === 0 ) return;
      this[side + 'Actions'] = this[side + 'Actions'].concat(
          actions.filter(function(currentActions, newAction) {
            return ! currentActions.some(function(currentAction) {
              return currentAction === newAction;
            });
          }.bind(this, this[side + 'Actions'])));
    },
    function removeActions(side, actions) {
      if ( ( ! actions ) || actions.length === 0 ) return;
      this[side + 'Actions'] =
          this[side + 'Actions'].filter(function(currentAction) {
            return ! actions.some(function(removeAction) {
              return removeAction === currentAction;
            });
      });
    },
    function init() {
      this.SUPER();
      // TODO(markdittmer): There should be a more elegant way of
      // contextualizing this.
      this.model_.getAction('moreActions').isAvailable =
          this.areMoreActionsAvailable;
    },
  ],

  actions: [
    {
      name: 'moreActions',
      // TODO(markdittmer): This URL is for menus, not "more actions".
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGklEQVQ4y2NgGAVEg/9EAMo0jHp61NOjAAgAUWrXKeQhPE4AAAAASUVORK5CYII=',
      ligature: 'more_vert',
      code: function() { this.moreActionsDropdown.open(); },
    },
  ],

  listeners: [
    {
      name: 'areMoreActionsAvailable',
      code: function() {
        var data = this.data;
        var toolbarActions = this.rightActions.slice();
        return toolbarActions.length > 0 &&
            toolbarActions.map(function(toolbarAction) {
              return toolbarAction &&
                  toolbarAction.action &&
                  toolbarAction.action.isAvailable.call(
                      data, toolbarAction.action);
            }).some(function(v) { return v; });
      },
    },
  ],

  templates: [
    function toHTML() {/*
      <toolbar id="%%id" %%cssClassAttr()>

        <actions id="%%id-left-actions" class="left">
          <% this.leftActionsInnerHTML(out) %>
        </actions>

        <header id="%%id-header" class="md-title">
          <div class="toolbar-title-text"><%# this.title %></div>
        </header>

        %%rightActionList
        <% this.setClass('hidden',
               function() { return this.showActions }.bind(this),
               this.rightActionList.id); %>

      </toolbar>
    */},
    function leftActionsInnerHTML() {/*
      %%leftActionList
    */},
    function CSS() {/*
      toolbar {
        align-items: center;
        background-color: #3e50b4;
        color: #fff;
        display: flex;
        flex-shrink: 0;
        flex-grow: 0;
        font-size: 20px;
        font-weight: 500;
        height: 56px;
        padding: 0;
        width: 100%;
      }
      .md-card toolbar, .md-card-shell toolbar {
        background-color: transparent;
        color: currentColor;
      }
      .md-card toolbar action-list, .md-card-shell toolbar action-list {
        margin: 0;
      }

      toolbar header {
        margin-left: 8px;
        flex-grow: 1;
        display: flex;
        overflow-x: hidden;
      }
      .md-card toolbar header, .md-card-shell toolbar header {
        margin-left: 0;
      }
      toolbar header.md-title {
        color: #fff;
      }
      .md-card toolbar header.md-title, .md-card-shell toolbar header.md-title {
        color: currentColor;
      }
      toolbar actions {
        display: flex;
        position: relative;
      }
      toolbar actions.left {
        align-items: flex-start;
      }
      toolbar actions.right {
        align-items: flex-end;
      }
      toolbar header .toolbar-title-text {
        flex-shrink: 0;
      }
    */},
  ],
});
