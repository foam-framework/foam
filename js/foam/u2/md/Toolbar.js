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
  package: 'foam.u2.md',
  name: 'Toolbar',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.md.QuickActionButton',
    'foam.u2.md.ActionList',
    'foam.u2.md.OverflowActionList',
    'foam.ui.md.ToolbarAction',
  ],

  properties: [
    ['nodeName', 'toolbar'],
    'title',
    {
      model_: 'ArrayProperty',
      name: 'actions',
      subType: 'foam.ui.md.ToolbarAction',
      hidden: true,
    },
  ],

  methods: [
    function addAction(act) {

    },
    function removeAction(act) {

    },

    function actionComparator(a, b) {
      var priorityCmp = a.priority - b.priority;
      if ( priorityCmp !== 0 ) return priorityCmp;

      var orderCmp = a.order - b.order;
      return orderCmp;
    },

    function init() {
      this.SUPER();
      // TODO(markdittmer): There should be a more elegant way of
      // contextualizing this.
      this.model_.getAction('moreActions').isAvailable =
          this.areMoreActionsAvailable;
    },
    function initE() {
      var Y = this.Y.sub();
      Y.registerModel(this.QuickActionButton, 'foam.u2.ActionButton');
      return this.start()
        .start('actions').cls('left')
          .add(this.ActionList.create({data: this.leftActions, direction:'HORIZONTAL'}))
        .end()
        .start('header').cls('md-title')
          .start('div').cls('toolbar-title-text').add(this.title$).end()
        .end()
        .start('actions').cls('right').cls2(
            function(show) {
              return show ? 'hidden':'';
            }.on$(this.Y, this.showActions$)
          ).add(this.OverflowActionList.create({ data: this.rightActions }))
        .end()
      .end();
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
              return toolbarAction && toolbarAction.isAvailable;
            }).some(function(v) { return v; });
      },
    },
  ],

  templates: [
//     function toHTML() {/*
//       <toolbar id="%%id" %%cssClassAttr()>

//         <actions id="%%id-left-actions" class="left">
//           <% this.leftActionsInnerHTML(out) %>
//         </actions>

//         <header id="%%id-header" class="md-title">
//           <div class="toolbar-title-text"><%# this.title %></div>
//         </header>

//         %%rightActionList
//         <% this.setClass('hidden',
//                function() { return this.showActions }.bind(this),
//                this.rightActionList.id); %>

//       </toolbar>
//     */},
//     function leftActionsInnerHTML() {/*
//       %%leftActionList
//     */},
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
