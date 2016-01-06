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
  name: 'TableView',
  extends: 'foam.u2.TableView',
  requires: [
    // TODO(braden): Port Icon to U2.
    'foam.ui.Icon',
  ],

  constants: {
    // Keep the same basic CSS class as my parent, since most of the CSS is
    // common.
    CSS_CLASS: 'foam-u2-TableView',
  },

  properties: [
    {
      name: 'ascIcon',
      factory: function() {
        return this.Icon.create({
          ligature: 'keyboard_arrow_up',
          width: 16,
          height: 16,
          fontSize: 16
        });
      }
    },
    {
      name: 'descIcon',
      factory: function() {
        return this.Icon.create({
          ligature: 'keyboard_arrow_down',
          width: 16,
          height: 16,
          fontSize: 16
        });
      }
    },
    {
      name: 'rowHeight',
      documentation: 'Override this to set the (fixed!) row height of the table.',
      defaultValue: 48
    },
  ],

  methods: [
    function initE() {
      // Add the title bar first.
      //this.start('
      this.SUPER();
      this.cls(this.myCls('md'));
    },
  ],
  templates: [
    function CSS() {/*
      ^caption {
        color: rgba(0, 0, 0, 0.87);
        display: block;
        font-size: 20px;
        font-weight: 500;
      }

      ^title-bar {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        height: 64px;
        justify-content: space-between;
        position: relative;
      }

      ^title-bar^selection {
        background: rgb(232, 240, 253);
      }

      ^title-bar ^caption {
        padding-left: 24px;
      }

      ^title-bar^selection ^caption {
        color: rgb(72, 131, 239);
      }

      ^actions {
        color: rgba(0, 0, 0, 0.54);
        display: flex;
        font-size: 24px;
        padding-right: 14px;
      }

      ^md {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        font-family: 'Roboto', sans-serif;
        max-width: 100%;
        overflow: hidden;
      }

      ^md ^head {
        color: rgba(0, 0, 0, 0.54);
        font-size: 12px;
        font-weight: 500;
      }

      ^md ^body {
        border-top: solid 1px #ddd;
        color: rgba(0, 0, 0, 0.87);
        font-size: 13px;
        font-weight: 400;
      }

      ^md ^body ^row {
        border-bottom: solid 1px #ddd;
        cursor: pointer;
      }

      ^md ^head ^cell {
        cursor: pointer;
        height: 64px;
      }

      ^md ^head ^cell :not(^resize-handle) {
        cursor: pointer;
      }

      ^md ^head ^cell:hover ^resize-handle {
        background: #f5f5f5;
      }

      ^md ^head ^cell ^resize-handle:hover,
      ^md ^col-resize ^resize-handle {
        background: #eee;
      }

      ^md ^body ^row:hover,
      ^md ^body ^row^soft-selected {
        background: #eee;
      }

      ^md ^row^row-selected {
        background: #f5f5f5;
      }

      ^md ^body ^cell {
        height: 48px;
      }

      ^md ^sort {
        color: rgba(0, 0, 0, 0.87);
        font-size: 12px;
        font-weight: 500;
      }
      ^md ^sort .material-icons,
      ^md ^sort .material-icons-extended {
        color: rgba(0, 0, 0, 0.26);
        font-size: 16px;
      }

      ^md ^row {
        padding-left: 12px;
        padding-right: 12px;
      }

      ^md ^cell:first-child {
        padding-left: 12px;
      }

      ^md ^cell:last-child,
      ^md ^cell^numeric:last-child,
      ^md ^cell^sort:last-child,
      ^md ^cell^numeric^sort:last-child {
        margin-right: 0px;
      }

      ^md ^cell {
        margin-right: 12px;
        padding-right:12px;
      }
      ^md ^cell^numeric {
        margin-right: 28px;
        padding-right:28px;
      }

      ^md .foam-u2-ScrollView-scroller {
        overflow-x: hidden;
      }
    */},
  ]
});
