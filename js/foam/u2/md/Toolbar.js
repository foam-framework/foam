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
  package: 'foam.u2.md',
  name: 'Toolbar',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.md.ActionButton',
    'foam.u2.md.ToolbarAction',
  ],

  // TODO(braden): Figure out what portion of the ActionList and
  // OverflowActionList need to be included here.
  // For now this Toolbar is pretty dumb.
  properties: [
    'title',
    {
      type: 'Array',
      subType: 'foam.u2.md.ToolbarAction',
      name: 'leftActions_',
      postSet: function(old, nu) {
        this.leftActionButtons_ = nu.map(function(a) {
          return this.ActionButton.create(a);
        }.bind(this));
      },
    },
    {
      type: 'Array',
      subType: 'foam.u2.md.ToolbarAction',
      name: 'rightActions_',
      postSet: function(old, nu) {
        this.rightActionButtons_ = nu.map(function(a) {
          return this.ActionButton.create(a);
        }.bind(this));
      },
    },
    {
      name: 'leftActionButtons_',
    },
    {
      name: 'rightActionButtons_',
    },
  ],

  methods: [
    function addLeftActions(actions) {
      var a = this.leftActions_;
      a.push.apply(a, actions);
      this.leftActions_ = a;
    },
    function addRightActions(actions) {
      var a = this.rightActions_;
      a.push.apply(a, actions);
      this.rightActions_ = a;
    },
  ],

  templates: [
    function initE() {/*#U2
      <toolbar class="^ foam-u2-md-toolbar-colors">
        <actions class="^actions ^left">{{this.leftActionButtons_$}}</actions>
        <header class="^title">{{this.title$}}</header>
        <actions class="^actions ^right">{{this.rightActionButtons_$}}</actions>
      </toolbar>
    */},
    function CSS() {/*
      ^ {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        flex-grow: 0;
        font-size: 20px;
        font-weight: 500;
        height: 56px;
        padding: 0;
        width: 100%;
      }

      ^title {
        flex-grow: 1;
      }

      .foam-u2-md-Card- ^ {
        background-color: transparent;
        color: currentColor;
      }
      .foam-u2-md-Card- ^actions {
        margin: 0;
      }

      ^header {
        color: #fff;
        display: flex;
        flex-grow: 1;
        flex-shrink: 0;
        margin-left: 8px;
        overflow-x: hidden;
      }
      .foam-u2-md-Card- ^header {
        color: currentColor;
        margin: 0;
      }

      ^actions {
        display: flex;
        position: relative;
      }
      ^left {
        align-items: flex-start;
      }
      ^right {
        align-items: flex-end;
      }
    */},
  ]
});
