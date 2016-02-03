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
  package: 'foam.u2',
  name: 'TableView',
  extends: 'foam.u2.View',

  requires: [
    'SimpleValue',
    'foam.u2.ScrollView',
    'foam.u2.TableRowView'
  ],

  imports: [
    'allProperties',
    'columnProperties',
    'document',
    'hardSelection$',
    'minimumFlexColumnWidth',
    'setTimeout',
    'softSelection$',
    'sortOrder$',
    'window'
  ],

  exports: [
    'as tableView'
  ],

  documentation: 'A view that renders a table. Note that it does not use real HTML <tt>&lt;table&gt;</tt> tags. Features draggable columns and click-to-sort.',

  properties: [
    ['nodeName', 'flex-table'],
    ['ascIcon', '&#9650;'],
    ['descIcon', '&#9660;'],
    {
      name: 'data',
      postSet: function(_, data) {
        var model = this.data && this.data.model;
        if ( this.model !== model ) this.model = model;
      }
    },
    {
      name: 'model',
      defaultValueFn: function() {
        return this.X.model;
      },
      postSet: function(_, model) {
        if ( ! this.columnProperties ) {
          this.columnProperties_ = this.getColumnProperties_();
        } else {
          this.columnProperties_ = this.columnProperties.map(function(name) {
            return model.getFeature(name);
          });
        }

        if (this.allProperties) {
          this.allProperties_ = this.allProperties.map(function(name) {
            return model.getFeature(name);
          });
          return;
        }

        var allProps = [];
        var columnProps = {};
        for (var i = 0; i < this.columnProperties_.length; i++) {
          columnProps[this.columnProperties_[i].name] = true;
          allProps.push(this.columnProperties_[i]);
        }

        var props = model.getRuntimeProperties();

        for (var i = 0; i < props.length; i++) {
          if (props[i].hidden || columnProps[props[i].name]) continue;
          allProps.push(props[i]);
        }

        this.allProperties_ = allProps;
      }
    },
    {
      type: 'Array',
      name: 'allProperties_',
      documentation: 'All the (non-hidden) properties on the model.',
    },
    {
      type: 'Array',
      name: 'columnProperties',
      documentation: 'An array of Property names for all selected ' +
          'properties. If this is set, this is exactly the set of properties ' +
          'that will be displayed. Otherwise the model\'s tableProperties, ' +
          'if defined, will be displayed. Finally, all non-hidden properties ' +
          'will be displayed.',
      factory: function() { return null; },
      postSet: function(_, ps) {
        if ( ! ps || ! this.model ) return;
        this.columnProperties_ = ps.map(function(name) {
          return this.model.getFeature(name);
        }.bind(this));
      }
    },
    {
      type: 'Array',
      name: 'allProperties',
      factory: function() { return null; },
      postSet: function(old, nu) {
        if ( ! nu || ! this.model ) return;
        this.allProperties_ = nu.map(function(name) {
          return this.model.getFeature(name);
        }.bind(this));
      },
    },
    {
      type: 'Array',
      name: 'columnProperties_',
      postSet: function(old, nu) {
        this.scrollView.invalidate();
      }
    },
    ['sortOrder', undefined],
    ['sortProp', undefined],
    {
      type: 'Int',
      name: 'minColWidth',
      defaultValue: 50
    },
    'hardSelection',
    'softSelection',
    'headE',
    'bodyE',
    'horizontalScrollerE',
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      dynamicValue: [function() {
        this.data; this.sortOrder;
      }, function() {
        return this.data && this.data.orderBy(this.sortOrder);
      }]
    },
    {
      type: 'ViewFactory',
      name: 'rowView',
      defaultValue: 'foam.u2.TableRowView',
      documentation: 'Set this to override the row view. It should be a ' +
          'subclass of $$DOC{ref:"foam.u2.TableRowView"} unless you ' +
          'really know what you\'re doing.',
      adapt: function(old, nu) {
        return nu ? nu : 'foam.u2.TableRowView';
      }
    },
    {
      name: 'rowHeight',
      documentation: 'Set this to override the height of a table row.',
      defaultValue: 48
    },
    {
      name: 'scrollView',
      factory: function() {
        return this.ScrollView.create({
          data:      this.filteredDAO$Proxy,
          rowHeight: this.rowHeight,
          rowView:   this.makeRow
        });
      }
    },
    {
      type: 'Array',
      name: 'colWidths_'
    },
    {
      type: 'Boolean',
      name: 'isResizing',
      defaultValue: false
    },
    {
      name: 'minimumFlexColumnWidth',
      documentation: 'Minimum width of a (flexible) column in pixels. If ' +
          'there isn\'t room for all the columns, the table will switch to ' +
          'allowing horizontal scrolling.',
      defaultValue: 120
    },
    {
      name: 'tableWidth_',
    },
    {
      name: 'loadComplete_',
    },
  ],

  methods: [
    function load() {
      this.SUPER();
      this.window.addEventListener('resize', this.onResize);
      this.loadComplete_ = true;
      this.onResize();
    },

    function unload() {
      this.SUPER();
      this.window.removeEventListener('resize', this.onResize);
    },

    function getColumnProperties_() {
      if ( ! this.model ) return [];

      if ( this.model.tableProperties && this.model.tableProperties.length > 0 ) {
          return this.model.tableProperties.map(function(name) {
            return this.model.getProperty(name);
          }.bind(this));
      }

      return this.model.getRuntimeProperties().filter(function(p) {
        return ! p.hidden;
      });
    },

    function computeColWidths() {
      /* Call this to populate the colWidths_ array with the actual values. */
      if ( ! this.headE ||  ! this.headRowE ) return;

      var cells = this.headRowE.children;
      var columnProperties = this.columnProperties_;

      var totalFixedWidth = 0;
      var fixedColumns = 0;
      for ( var i = 0 ; i < cells.length ; i++ ) {
        if ( columnProperties[i].tableWidth ) {
          totalFixedWidth += +columnProperties[i].tableWidth;
          fixedColumns++;

          cells[i].style({
            width: columnProperties[i].tableWidth + 'px',
            'flex-grow': null
          });
        } else {
          cells[i].style({
            width: 'initial',
            'flex-grow': '1'
          });
        }
      }

      // Now that the styles are set, measure the row's total width.
      // If the demanded fixed sizes don't leave enough for the flexible
      // columns, we switch to horizontal scrolling mode.
      var flexWidth = this.el().offsetWidth;
      var flexColumns = columnProperties.length - fixedColumns;
      if ( totalFixedWidth > flexWidth || flexColumns === 0 ||
          (flexWidth - totalFixedWidth) / flexColumns < this.minimumFlexColumnWidth ) {
        // Switch to horizontal scrolling mode.
        // Add twice the average fixed-column size for each flex column.
        var avgFixedWidth = fixedColumns === 0 ? 0 : totalFixedWidth / fixedColumns;
        var flexColumnWidth = Math.max(2 * avgFixedWidth, this.minimumFlexColumnWidth);
        this.tableWidth_ = totalFixedWidth + (flexColumnWidth * flexColumns);
      } else {
        this.tableWidth_ = undefined;
      }

      if ( this.tableWidth_ ) {
        this.horizontalScrollerE.style({ 'overflow-x': 'auto' });
        this.headE.style({ width: this.tableWidth_ + 'px' });
        this.bodyE.style({ width: this.tableWidth_ + 'px' });
      } else {
        this.horizontalScrollerE.style({ 'overflow-x': 'hidden' });
        this.headE.style({ width: '100%' });
        this.bodyE.style({ width: '100%' });
      }

      this.measureColWidths(cells);
      for ( var i = 0 ; i < cells.length ; i++ ) {
        cells[i].style({
          width: null,
          'flex-grow': null
        });
      }
    },
    function measureColWidths(cells) {
      for ( var i = 0 ; i < cells.length ; i++ ) {
        if ( ! this.colWidths_[i] )
          this.colWidths_[i] = this.makeColWidthValue(i);
        this.colWidths_[i].set(cells[i].el().offsetWidth);
      }
    },
    function onSortOrder(prop) {
      this.sortProp = prop;
      this.sortOrder = this.sortOrder === prop ? DESC(prop) : prop;
    },

    function makeResizeHandle(i) {
      /*
        Returns a new resize handler element, with event bindings, that follows
        column i.
       */
      var handle = this.E('flex-col-resize-handle').cls(this.myCls('resize-handle'));
      handle.on('click', function(e) { e.stopPropagation(); });
      handle.on('mousedown', function(e) {
        var self = this;
        var startX = e.x;
        var col1 = handle.el().parentElement;
        var col2 = col1.nextElementSibling;
        var row = col1.parentElement;
        var w1 = col1.offsetWidth;
        var w2 = col2? col2.offsetWidth : 0;

        e.preventDefault();
        this.isResizing = true;

        function onMouseMove(e) {
          var delta = e.x - startX;
          var minWidth = self.minColWidth;
          var newW1 = w1 + ( col2 ? Math.min(w2, delta) : delta );
          var newW2 = w2 + Math.min(-delta, w1);

          if ( newW1 < minWidth ) {
            newW1 = minWidth;
            newW2 = w1 + w2 - minWidth;
          } else if ( w2 && newW2 < minWidth ) {
            newW1 = w1 + w2 - minWidth;
            newW2 = minWidth;
          }

          self.colWidths_[i].set(newW1);
          if ( w2 )
            self.colWidths_[i + 1].set(newW2);
        }

        var onMouseUp = function(e) {
          e.preventDefault();
          self.isResizing = false;
          self.document.removeEventListener('mousemove', onMouseMove);
          self.document.removeEventListener('mouseup', onMouseUp);
        };

        self.document.addEventListener('mousemove', onMouseMove);
        self.document.addEventListener('mouseup', onMouseUp);
      }.bind(this));

      return handle;
    },

    function initE() {
      // Need to make sure to bind in the flex-table-view-col-resize class, to
      // the resize boolean.
      // Need to add/remove (or show/hide) ascending and descending icons for
      // each column based on the current sort order property.

      this.cls(this.myCls());
      var scroller = this.start().cls(this.myCls('horizontal-scroller'));
      this.headE = scroller.start('flex-table-head').cls(this.myCls('head'));
      this.headE.end();
      this.bodyE = scroller.start('flex-table-body').cls(this.myCls('body'));
      this.bodyE.end();
      scroller.end();
      this.horizontalScrollerE = scroller;

      // Populate the header. The whole header is wrapped in a dynamic().
      // It would be slightly better if only the children were, but dynamically
      // producing an array of elements is not supported right now.
      this.headE.add(this.dynamic(function(dao, props) {
        if ( ! dao ) return 'set dao';

        // TODO(braden): Find a way to remove the old listeners, or confirm that
        // it's already happening properly.
        this.headRowE = this.E('flex-table-row').cls(this.myCls('row')).add(
            props.map(this.makeHeadCell.bind(this)));

        this.onResize();
        return this.headRowE;
      }.bind(this), this.data$, this.columnProperties_$, this.sortOrder$));

      // Attach a dynamic class to the head that reveals the column resizers
      // when one of them is being dragged.
      this.headE.enableCls(this.myCls('col-resize'), this.isResizing$);

      // Populate the body.
      this.bodyE.add(this.scrollView);
    },

    function makeHeadCell(prop, i) {
      // Returns an array of Elements, suitable for add().
      var cell = this.E('flex-table-cell');
      // These can get away with not being dynamic, because the whole header
      // will be rebuilt on a column change.
      cell.cls(this.myCls('col-' + i)).cls(this.myCls('cell'));
      cell.on('click', this.onSortOrder.bind(this, prop));

      if (this.isPropNumeric(prop)) cell.cls(this.myCls('numeric'));
      var sorted = this.isSortedByProp(prop);
      if (sorted) cell.cls(this.myCls('sort'));

      var colLabel = cell.start('flex-col-label').cls(this.myCls('col-label'))
          .start('label').add(prop.tableLabel).end();
      if (sorted) {
        var icon = this.sortOrder === prop ? this.ascIcon : this.descIcon;
        colLabel.start('span').cls(this.myCls('sort-indicator')).add(icon).end();
      }
      colLabel.end();

      cell.add(this.makeResizeHandle(i));

      if (!this.colWidths_[i])
        this.colWidths_[i] = this.makeColWidthValue(i);

      return cell;
    },

    function isPropNumeric(prop) {
      return IntProperty.isInstance(prop) || FloatProperty.isInstance(prop);
    },

    function isSortedByProp(prop) {
      return this.sortProp === prop;
    },

    function makeColWidthValue(i) {
      var styleE = this.E('style');
      var value = this.SimpleValue.create();
      value.addListener(function(obj, prop, old, nu) {
        styleE.el().innerHTML = '#' + this.id + ' .' + this.myCls('col-' + i) +
            '{ width: ' + nu + 'px; }';
      }.bind(this));
      this.headE.add(styleE);
      return value;
    }
  ],

  listeners: [
    function makeRow(map, Y) {
      map = map || {};
      map.properties$ = this.columnProperties_$;
      return this.rowView(map, Y);
    },
    function onResize() {
      // Don't resize before the onResize() call in load().
      if ( ! this.loadComplete_ ) return;

      // Also don't resize just yet if we're re-rendering the headRowE.
      if ( this.headRowE.state !== this.headRowE.LOADED ) {
        this.headRowE.on('load', this.computeColWidths.bind(this));
      } else {
        this.computeColWidths();
      }
    }
  ],

  templates: [
    function CSS() {/*
      ^col-resize * {
        cursor: ew-resize !important;
      }

      ^ {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 1;
        overflow-x: hidden;
        overflow-y: auto;
        width: 100%;
      }

      ^head {
        display: flex;
        flex-direction: column;
        flex-grow: 0;
        flex-shrink: 0;
      }

      ^horizontal-scroller {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 1;
        overflow-x: hidden;
        overflow-y: auto;
        width: 100%;
      }

      ^body {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        flex-shrink: 1;
        overflow-x: hidden;
        overflow-y: auto;
        position: relative;
      }

      ^row {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        flex-grow: 0;
        height: 100%;
      }

      ^col-label {
        display: flex;
        flex-shrink: 1;
        flex-grow: 1;
      }

      ^cell {
        align-items: center;
        display: flex;
        flex-grow: 0;
        flex-shrink: 0;
        padding: 8px;
        position: relative;
      }
      ^cell^numeric {
        justify-content: flex-end;
      }

      ^cell, ^cell * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      ^cell img {
        flex-grow: 0;
        flex-shrink: 0;
      }

      ^head ^cell ^resize-handle {
        background-color: #ccc;
        display: block;
        position: absolute;
        top: 0;
        right: 0px;
        width: 1px;
        bottom: 0;
        z-index: 9;
        cursor: ew-resize;
      }

      ^cell:last-child ^resize-handle {
        display: none;
      }

      ^head ^row {
        align-items: center;
        border-bottom: 1px solid #ccc;
        height: 36px;
      }

      ^head ^cell {
        height: 100%;
        margin: 0;
        padding: 0 8px;
      }

      ^numeric {
        text-align: right;
      }
      ^numeric ^col-label {
        flex-direction: row-reverse;
      }

      ^sort {
        font-weight: bold;
      }

      ^col-label label {
        font-weight: bold;
        flex-grow: 0;
      }
      ^col-label span {
        flex-grow: 0;
        flex-shrink: 0;
      }
    */}
  ]
});
