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
    'foam.u2.md.ActionButton',
    'foam.u2.md.EditColumnsView',
    'foam.u2.md.OverlayDropdown',
    'foam.u2.md.Tooltip',
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
      type: 'Boolean',
      name: 'editColumnsEnabled',
      documentation: 'Set this to true to let the user select columns.',
      defaultValue: false
    },
    {
      type: 'String',
      name: 'title',
      documentation: 'The title for the table. When unset, defaults to the ' +
          'plural name of the model.',
      // Note that this is defaulted by the dynamic values in initE, because
      // it should react to changing the model.
    },
    {
      name: 'rowHeight',
      documentation: 'Override this to set the (fixed!) row height of the table.',
      defaultValue: 48
    },
    {
      name: 'ascIcon',
      factory: function() {
        return this.Icon.create({
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAAOklEQVR4AWMYYaABCAkq+Q+EDYSUzGSYBVKGT8l0BkYgxKnMASgxDagACKDK7LEp84YogSgD8kYIAACj3BCo983dYwAAAABJRU5ErkJggg==',
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
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAQAAAD8x0bcAAAAQklEQVR4AWMYDoAFnYcJNBnuMFjDebYMtxk0MBVJMtxg+MxgA1XyBciTBLMxlQElbfAoQShDKMGjDKYErzIgHFEAAGLzEOwIrN0jAAAAAElFTkSuQmCC',
          ligature: 'keyboard_arrow_down',
          width: 16,
          height: 16,
          fontSize: 16
        });
      }
    },
    {
      type: 'Array',
      subType: 'Action',
      name: 'actions',
    },
    {
      name: 'columnSelectionE',
      lazyFactory: function() {
        var editor = this.EditColumnsView.create({
          properties$: this.allProperties_$,
          selectedProperties$: this.columnProperties_$,
          model$: this.model$
        });
        return this.OverlayDropdown.create().add(editor);
      }
    },
    {
      name: 'captionE',
      lazyFactory: function() {
        return this.dynamic(function(title, model) {
          return title || model.plural;
        }, this.title$, this.model$);
      }
    },
  ],

  actions: [
    {
      name: 'clearSelection',
      ligature: 'clear_all',
      isAvailable: function() { return !!this.hardSelection; },
      code: function() {
        this.hardSelection = null;
      }
    },
    {
      name: 'editColumns',
      ligature: 'more_vert',
      isAvailable: function() { return this.editColumnsEnabled; },
      code: function() {
        this.columnSelectionE.open();
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.Y.registerModel(this.ActionButton.xbind({ type: 'icon' }),
          'foam.u2.ActionButton');
    },
    function gatherActions(model) {
      if (!model) return [];
      // TODO(markdittmer): Should we be definign a getter for "actions_" so
      // that we don't need to check "instance_"?
      return model.actions_ || (model.instance_ && model.instance_.actions_) ||
          model.actions;
    },
    function initE() {
      // Add the title bar first.
      this.start('flex-table-title-bar').cls(this.myCls('title-bar'))
          .start('table-caption')
              .cls(this.myCls('caption'))
              .add(this.captionE)
              .end()
          .add(this.dynamic(function(hardSelection) {
            var actions = hardSelection ? this.gatherActions(hardSelection.model_) : [];
            actions = actions.concat(this.gatherActions(this.model_));
            var X = this.Y.sub({ data: this });
            return X.E('table-actions').cls(this.myCls('actions')).add(actions);
          }.bind(this), this.hardSelection$))
          .add(this.editColumnsEnabled ? this.columnSelectionE : null)
          .end();

      this.SUPER();
      this.cls(this.myCls('md'));
    },

    function makeHeadCell(prop, i) {
      var e = this.SUPER(prop, i);
      if (prop.help) {
        var tooltip;
        e.on('mouseenter', function() {
          tooltip = this.Tooltip.create({ text: prop.help, target: e });
        }.bind(this));
        e.on('mouseleave', function() {
          tooltip && tooltip.close();
          tooltip = null;
        });
        this.on('unload', function() {
          tooltip && tooltip.remove();
          tooltip = null;
        });
      }
      return e;
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

      ^md ^head ^row {
        border: none;
        height: 64px;
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
        background-color: #f5f5f5;
      }

      ^md ^head ^cell ^resize-handle:hover,
      ^md ^col-resize ^resize-handle {
        background-color: #eee !important;
      }

      ^md ^head ^cell ^resize-handle {
        background-color: rgba(0, 0, 0, 0);
        width: 3px;
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
