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
  extendsModel: 'foam.ui.SimpleView',

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
      type: 'foam.ui.md.OverflowActionList',
      name: 'rightActionList',
      lazyFactory: function() {
        return this.OverflowActionList.create({
          data$: this.rightActions$,
        }, this.Y);
      },
    },
    {
      model_: 'ArrayProperty',
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
      model_: 'ArrayProperty',
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
      this.addRightActions('right', [action]);
    },
    function removeLeftAction(action) {
      if ( ! action ) return;
      this.removeActions('left', [action]);
    },
    function removeRightAction(action) {
      if ( ! action ) return;
      this.removeActions('right', [action]);
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
      name: 'menuAction',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGklEQVQ4y2NgGAVEg/9EAMo0jHp61NOjAAgAUWrXKeQhPE4AAAAASUVORK5CYII=',
      ligature: 'menu',
      action: function() {},
    },
    {
      name: 'backAction',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPUlEQVQ4y2NgGLbgf8P/BtKU////+78WacpDSFMeSlPlYaQo/0OacjyAcg1wJ4WTGmHDS4sWaVrqhm/mBQAoLpX9t+4i2wAAAABJRU5ErkJggg==',
      ligature: 'arrow_back',
      action: function() {},
    },
    {
      name: 'resetAction',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAdklEQVQ4y+WTuQ3AIBAEaQKK8NN/BEUArmccgGyj43MMIZo5TqtFqbUPJxYtbg2OvS44IJQKhguwdUETSiXjXr77KhGICRjihWKm8Dw3KXP4Z5VZ/Lfw7B5kyD1cy5C7uAx5iJcht6vhRTUi4OrC0Szftvi/vAFNdbZ2Dp661QAAAABJRU5ErkJggg==',
      ligature: 'close',
      action: function() {},
    },
    {
      name: 'commitAction',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAUElEQVQ4jWNgGAW4wH9d0pRH///zv4E05f+J1jB0lP9n+b/0fzgJpv8PBUr++R9BgmP+N4C1RJLgdqiWKBK8CtVCUsiAtBCvHKqFFOUjAwAATIhwjZSqeJcAAAAASUVORK5CYII=',
      ligature: 'check',
      action: function() {},
    },
    {
      name: 'moreActions',
      // TODO(markdittmer): This URL is for menus, not "more actions".
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGklEQVQ4y2NgGAVEg/9EAMo0jHp61NOjAAgAUWrXKeQhPE4AAAAASUVORK5CYII=',
      ligature: 'more_vert',
      action: function() { this.moreActionsDropdown.open(); },
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

        <header id="%%id-header">
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
      toolbar header {
        margin-left: 12px;
        flex-grow: 1;
        display: flex;
        overflow-x: hidden;
      }
      toolbar actions {
        display: flex;
        position: relative;
        color: #000;
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
