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

  requires: [ 'foam.ui.md.ToolbarAction' ],
  exports: [ 'as toolbar' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'title',
    },
    {
      type: 'foam.ui.md.ToolbarAction',
      name: 'menu',
      lazyFactory: function() {
        return this.ToolbarAction.create({
          available: false,
          enabled: true,
        }, this.Y);
      },
      postSet: function(old, nu, prop) {
        if ( old === nu || ! nu ) return;
        nu.action = this.model_.getAction(prop.name + 'Action');
      },
    },
    {
      type: 'foam.ui.md.ToolbarAction',
      name: 'back',
      lazyFactory: function() {
        return this.ToolbarAction.create({
          available: true,
          enabled: true,
        }, this.Y);
      },
      postSet: function(old, nu, prop) {
        if ( old === nu || ! nu ) return;
        nu.action = this.model_.getAction(prop.name + 'Action');
      },
    },
    {
      type: 'foam.ui.md.ToolbarAction',
      name: 'reset',
      lazyFactory: function() {
        return this.ToolbarAction.create({
          available: false,
          enabled: true,
        }, this.Y);
      },
      postSet: function(old, nu, prop) {
        if ( old === nu || ! nu ) return;
        nu.action = this.model_.getAction(prop.name + 'Action');
      },
    },
    {
      type: 'foam.ui.md.ToolbarAction',
      name: 'commit',
      lazyFactory: function() {
        return this.ToolbarAction.create({
          available: false,
          enabled: true,
        }, this.Y);
      },
      postSet: function(old, nu, prop) {
        if ( old === nu || ! nu ) return;
        nu.action = this.model_.getAction(prop.name + 'Action');
      },
    },
    {
      model_: 'ArrayProperty',
      subType: 'Action',
      name: 'childActions_',
    },
  ],

  actions: [
    {
      name: 'menuAction',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGklEQVQ4y2NgGAVEg/9EAMo0jHp61NOjAAgAUWrXKeQhPE4AAAAASUVORK5CYII=',
      ligature: 'menu',
      isAvailable: function() { return this.menuAvailable; },
      isEnabled: function() { return this.menuEnabled; },
      action: function() {},
    },
    {
      name: 'backAction',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAPUlEQVQ4y2NgGLbgf8P/BtKU////+78WacpDSFMeSlPlYaQo/0OacjyAcg1wJ4WTGmHDS4sWaVrqhm/mBQAoLpX9t+4i2wAAAABJRU5ErkJggg==',
      ligature: 'arrow_back',
      isAvailable: function() { return this.backAvailable; },
      isEnabled: function() { return this.backEnabled; },
      action: function() {},
    },
    {
      name: 'resetAction',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAdklEQVQ4y+WTuQ3AIBAEaQKK8NN/BEUArmccgGyj43MMIZo5TqtFqbUPJxYtbg2OvS44IJQKhguwdUETSiXjXr77KhGICRjihWKm8Dw3KXP4Z5VZ/Lfw7B5kyD1cy5C7uAx5iJcht6vhRTUi4OrC0Szftvi/vAFNdbZ2Dp661QAAAABJRU5ErkJggg==',
      ligature: 'close',
      isAvailable: function() { return this.resetAvailable; },
      isEnabled: function() { return this.resetEnabled; },
      action: function() {},
    },
    {
      name: 'commitAction',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAUElEQVQ4jWNgGAW4wH9d0pRH///zv4E05f+J1jB0lP9n+b/0fzgJpv8PBUr++R9BgmP+N4C1RJLgdqiWKBK8CtVCUsiAtBCvHKqFFOUjAwAATIhwjZSqeJcAAAAASUVORK5CYII=',
      ligature: 'check',
      isAvailable: function() { return this.commitAvailable; },
      isEnabled: function() { return this.commitEnabled; },
      action: function() {},
    },
  ],

  templates: [
    function toHTML() {/*
      <toolbar id="%%id" %%cssClassAttr()>

        $$menuAction $$backAction $$resetAction

        <header id="%%id-header">
          <%# this.title %>
        </header>

        <actions id="%%id-actions">
          <% this.actionsInnerHTML(out) %>
        </actions>
        <% this.setClass('hidden',
               function() { return this.showActions }.bind(this),
               this.id + '-actions'); %>

        $$commitAction

      </toolbar>
    */},
    function actionsInnerHTML() {/*
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
        padding: 0 12px;
        width: 100%;
      }
      toolbar header {
        margin-left: 12px;
      }
      toolbar actions {
        display: flex;
        align-items: flex-end;
      }
    */},
  ],
});
