/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

/*

  onResize:
    resize scrollbar
    repaint

  onDAOUpdate
    reCount size
    repaint

*/
CLASS({
  package: 'foam.ui',
  name: 'TableView',
  extendsModel: 'foam.ui.AbstractDAOView',

  label: 'Table View',

  requires: [
    'foam.graphics.ScrollCView',
    'foam.ui.EditColumnsView',
    'foam.input.touch.GestureTarget'
  ],
  imports: [
    'hardSelection$',
    'softSelection$ as selection$'
  ],

  constants: {
    MIN_COLUMN_SIZE: 5, // If column is resized below this size, then remove the column instead of shrinking it

    ROW_SELECTED: ['escape'],

    CLICK: "click", // event topic

    DOUBLE_CLICK: "double-click" // event topic
  },

  properties: [
    {
      model_: 'ModelProperty',
      name:  'model',
      defaultValueFn: function() { return this.X.model ||
                                   ( this.data && this.data.model ); }
    },
    {
      model_: 'StringProperty',
      name: 'className',
      lazyFactory: function() {
        return 'foamTable ' + this.model.name + 'Table';
      }
    },
    {
      model_: 'StringArrayProperty',
      name:  'properties',
      postSet: function() { this.paintTable(); }
    },
    {
      name:  'hardSelection',
      postSet: function(_, v) { this.publish(this.ROW_SELECTED, v); }
    },
    {
      name:  'selection'
    },
    {
      name:  'children',
      type:  'Array[View]',
      factory: function() { return []; }
    },
    {
      name:  'sortOrder',
      type:  'Comparator',
      postSet: function() { this.paintTable(); },
      defaultValue: undefined
    },
    {
      name:  'sortProp',
      defaultValue: undefined
    },
    {
      name: 'ascIcon',
      defaultValue: '&#9650;'
    },
    {
      name: 'descIcon',
      defaultValue: '&#9660;'
    },
    {
      name: 'rows',
      type:  'Int',
      defaultValue: 50,
      postSet: function(oldValue, newValue) {
        if ( oldValue !== newValue ) this.paintData();
      }
    },
    {
      model_: 'IntProperty',
      name: 'height'
    },
    {
      model_: 'BooleanProperty',
      name: 'scrollEnabled',
      defaultValue: false
    },
    {
      model_: 'BooleanProperty',
      name: 'columnResizeEnabled',
      defaultValue: false
    },
    {
      model_: 'BooleanProperty',
      name: 'editColumnsEnabled',
      defaultValue: false
    },
    {
      name: 'scrollbar',
      type: 'ScrollCView',
      factory: function() {
        return this.ScrollCView.create({height:800, width: 24, x: 1, y: 0, size: 200, extent: 10});
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( old ) old.value$.removeListener(this.paintData);
        if ( nu ) nu.value$.addListener(this.paintData);
      }
    },
    {
      name: 'scrollPitch',
      help: 'Number of (CSS) pixels of touch drag required to scroll by one',
      defaultValue: 10
    },
    {
      name: 'touchPrev',
      hidden: true,
      transient: true,
      defaultValue: 0
    },
    {
      model_: 'ArrayProperty',
      name: 'selectionListeners_',
      lazyFactory: function() { return []; }
    },
    {
      model_: 'ArrayProperty',
      name: 'hardSelectionListeners_',
      lazyFactory: function() { return []; }
    },
    {
      model_: 'IntProperty',
      name: 'mouseX',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name: 'mouseY',
      defaultValue: 0
    },
    {
      model_: 'BooleanProperty',
      name: 'mouseOverRow',
      defaultValue: false
    },
    {
      name: 'useInnerContainer',
      documentation: 'Designed to be overridden by the MD TableView. Changes ' +
          'the $container defaultValueFn below to use this.$ instead of its parent.',
      defaultValue: false
    },
    {
      name: '$container',
      defaultValueFn: function() {
        return !this.$ || this.useInnerContainer ? this.$ : this.$.parentElement.parentElement;
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.onResize();
      }
    },
    {
      name: '$table',
      defaultValueFn: function() { return this.$ && this.$.querySelector('table'); }
    },
    {
      name: '$thead',
      defaultValueFn: function() { return this.$ && this.$.querySelector('thead'); }
    },
    {
      name: '$tbody',
      defaultValueFn: function() { return this.$ && this.$.querySelector('tbody'); }
    }
  ],

  actions: [
    {
      name: 'selectRow',
      keyboardShortcuts: [ 13 /* enter */ ],
      code: function() {
        if ( this.selection ) this.hardSelection = this.selection;
        this.publish(this.CLICK, this.selection);
      }
    },
    {
      name: 'prevRow',
      keyboardShortcuts: [ 38 /* up arrow */, 75 /* k */ ],
      code: function() {
        if ( ! this. objs || ! this.objs.length ) return;
        if ( ! this.selection && this.hardSelection ) this.selection = this.hardSelection;
        if ( this.selection ) {
          var i = this.objs.indexOf(this.selection);
          this.scrollbar.value--;
          if ( i > 0 ) this.selection = this.objs[i-1];
        } else {
          this.selection = this.objs[0];
        }
        this.paintData();
      }
    },
    {
      name: 'nextRow',
      keyboardShortcuts: [ 40 /* down arrow */, 74 /* j */ ],
      code: function() {
        if ( ! this. objs || ! this.objs.length ) return;
        if ( ! this.selection && this.hardSelection ) this.selection = this.hardSelection;
        if ( this.selection ) {
          var i = this.objs.indexOf(this.selection);
          this.scrollbar.value++;
          if ( i < this.objs.length-1 ) this.selection = this.objs[i+1];
        } else {
          this.selection = this.objs[0];
        }
        this.paintData();
      }
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isMerged: 200,
      code: function() {
        if ( ! this.$ ) return;

        var thead = this.$thead;
        var tbody = this.$tbody;
        var row = tbody && tbody.firstChild;
        if ( row ) {
          var containerHeight = this.$container.offsetHeight;
          var headHeight = thead.offsetHeight;
          var rowHeight = row.offsetHeight;
          var rows = Math.floor((containerHeight - headHeight) / rowHeight);
          this.rows = rows;
          this.scrollbar.extent = rows;
          this.scrollbar.height = containerHeight - headHeight - 10;
          this.scrollbar.paint();
        } else {
          if (this.scrollbar.size > 0) {
            // If the scrollbar.size is nonzero, there are rows to show but none
            // are currently visible. Reset rows to the default.
            this.rows = this.model_.ROWS.defaultValue;
            this.repaintTableData();
          }
        }
      }
    },
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.dao.select(COUNT())(function(c) {
          this.scrollbar.size = c.count;
          this.onResize();
          this.paintData();
        }.bind(this));
      }
    },
    {
      name: 'onMouseMove',
      isFramed: true,
      code: function(e) {
        var table = this.$table, target = e.target, x = e.offsetX, y = e.offsetY;
        while ( target !== table ) {
          // Sometimes this event is delivered after the target has been
          // discarded by re-render. In this case, just exit early.
          if ( ! target ) return;
          x += target.offsetLeft;
          y += target.offsetTop;
          target = target.offsetParent;
        }
        this.mouseX = x;
        this.mouseY = y;
      }
    },
    {
      name: 'paintTable',
      isFramed: true,
      code: function() { this.gatherObjects(this.repaintTable); }
    },
    {
      name: 'paintData',
      isFramed: true,
      code: function() { this.gatherObjects(this.repaintTableData); }
    },
    {
      name: 'onEditColumns',
      code: function(evt) {
        var v = this.EditColumnsView.create({
          model:               this.model,
          properties:          this.getPropertyNames(),
          availableProperties: this.model.getRuntimeProperties().filter(
              function(prop) { return !prop.hidden; })
        });

        v.addPropertyListener('properties', function() {
          v.close();
          this.properties = v.properties;
          v.removePropertyListener('properties', arguments.callee);
          this.paintTable();
        }.bind(this));

        this.$.insertAdjacentHTML('beforebegin', v.toHTML());

        var y = findViewportXY(this.$)[1];
        var screenHeight = this.X.document.firstElementChild.offsetHeight;
        var popupHeight = toNum(v.$.offsetHeight);
        if ( screenHeight-y-popupHeight < 10 ) {
          v.$.style.maxHeight = ( screenHeight - y - 10 ) + 'px';
        }

        v.initHTML();
      }
    },
    {
      name: 'verticalScrollStart',
      code: function(dy, ty, y) {
        this.touchPrev = y;
      }
    },
    {
      name: 'verticalScrollMove',
      code: function(dy, ty, y) {
        var delta = Math.abs(y - this.touchPrev);
        if ( delta > this.scrollPitch ) {
          var sb = this.scrollbar;
          if ( y > this.touchPrev && sb.value > 0 ) { // scroll up
            sb.value--;
          } else if ( y < this.touchPrev && sb.value < sb.size - sb.extent ) { // scroll down
            sb.value++;
          }
          this.touchPrev = y;
          this.onResize();
        }
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.dao && this.onDAOUpdate();

      this.$table.onmousemove = this.onMouseMove;

      if ( this.scrollEnabled ) {
        this.scrollbar.toView_().initHTML();

        (this.window || window).addEventListener('resize', this.onResize, false);

        var sb = this.scrollbar;

        this.$.parentElement.onmousewheel = function(e) {
          sb.value = Math.min(
            sb.size - sb.extent,
            Math.max(
              0,
                sb.value - Math.round(e.wheelDelta / 20)));
          e.preventDefault();
        };

        if ( this.X.gestureManager ) {
          this.X.gestureManager.install(this.GestureTarget.create({
            containerID: this.id,
            handler: this,
            getElement: function() { return this.$container; }.bind(this),
            gesture: 'verticalScrollMomentum'
          }));
        }

        this.onResize();
      }
    },

    repaintTable: function() {
      if ( ! this.$ ) return;
      var table = this.$table;
      var out = TemplateOutput.create(this);

      if ( ! table ) {
        this.tableToHTML(out);
        this.$.innerHTML = out.toString();
      } else {
        this.tableHeadToHTML(out);
        this.tableDataToHTML(out);
        table.innerHTML = out.toString();
      }

      this.initHTML_();
    },

    repaintTableData: function() {
      var tbody = this.$tbody;
      if ( ! tbody ) { this.repaintTable(); return; }
      var out = TemplateOutput.create(this);

      this.tableDataToHTML(out);
      tbody.outerHTML = out.toString();

      this.initHTML_();
    },

    gatherObjects: function(ret) {
      var dao = this.dao;
      if ( ! dao ) return;

      dao = dao.skip(this.scrollbar.value);
      if ( this.sortOrder ) dao = dao.orderBy(this.sortOrder);

      dao.limit(this.rows).select()(function(objs) {
        this.objs = objs;
        ret.call(this, objs);
      }.bind(this));
    },

    tableToHTML: function(out) {
      var model = this.model;

      if ( ! model ) {
        out('<b>ERROR: Table view without model</b>');
        return out;
      }

      if ( this.initializers_ ) {
        // console.log('Warning: TableView.tableToHTML called twice without initHTML');
        delete this['initializers_'];
        this.children = [];
      }

      out('<table' + this.cssClassAttr() + ' style="position:relative">');

      this.tableHeadToHTML(out);
      var dataState = this.tableDataToHTML(out);

      out('</table>');

      return out;
    },

    tableHeadToHTML: function(out) {
      var model = this.model;

      out('<thead><tr>');
      var properties = this.getProperties();
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var prop = properties[i];

        if ( ! prop ) continue;

        if ( prop.hidden ) continue;

        out('<th style="position:relative;" scope=col ');
        out('id="' +
                 this.on(
                   'click',
                   (function(table, prop) { return function() {
                     table.sortProp = prop;
                     table.sortOrder = ( table.sortOrder === prop ) ? DESC(prop) : prop;
                   };})(this, prop)) + '"');
        if ( prop.tableWidth ) out(' width="' + prop.tableWidth + '"');
        out('>');

        var cssClasses = ['th-label'];
        var isNumeric = IntProperty.isInstance(prop) || FloatProperty.isInstance(prop);
        var isSorted = this.sortProp === prop;
        if ( isNumeric )
          cssClasses.push('numeric');
        if ( isSorted )
          cssClasses.push('sort');

        out('<div class="' + cssClasses.join(' ') + '">');

        var textLabel = '<span>' + prop.tableLabel + '</span>';
        if ( isSorted ) {
          var arrow = '<span class="indicator">' +
              (this.sortOrder === prop ? this.ascIcon : this.descIcon) +
              '</span>';
          out(textLabel + arrow);
        } else {
          out(textLabel);
        }

        out('</div>');

        if ( this.columnResizeEnabled )
          out(this.columnResizerToHTML(prop, properties[i + 1]));

        out('</th>');
      }
      if ( this.editColumnsEnabled ) {
        out('<th width=15 id="' + this.on('click', this.onEditColumns) + '">...</th>');
      }
      out('</tr><tr style="height:2px"></tr></thead>');

      return out;
    },

    tableDataToHTML: function(out) {
      out('<tbody>');

      var props = this.getProperties();
      var objs = this.objs;

      if ( objs ) {
        var hselect = this.hardSelection;
        var sselect = this.selection;
        for ( var i = 0 ; i < objs.length; i++ ) {
          var obj = objs[i];
          var trClassName = "tr-" + this.id;

          if ( hselect && obj.id == hselect.id ) {
            trClassName += " rowSelected";
          }

          if ( sselect && obj.id == sselect.id ) {
            trClassName += " rowSoftSelected";
          }

          out('<tr class="' + trClassName + '">');

          for ( var j = 0 ; j < props.length ; j++ ) {
            var prop = props[j];
            var tdClassName = prop.name +
                ((IntProperty.isInstance(prop) || FloatProperty.isInstance(prop)) ?
                ' numeric' : '');

            if ( j == props.length - 1 && this.editColumnsEnabled ) {
              out('<td colspan=2 class="'+ tdClassName + '">');
            } else {
              out('<td class="' + tdClassName + '">');
            }
            var val = obj[prop.name];
            if ( prop.tableFormatter ) {
              out(prop.tableFormatter(val, obj, this));
            } else {
              out(( val == null ) ? '&nbsp;' : this.strToHTML(val));
            }
            out('</td>');
          }

          out('</tr>');
        }
      }

      out('</tbody>');

      return out;
    },

    columnResizerToHTML: function(prop1, prop2) {
      var id = this.nextID();

      // Prevent the column sort-order listener from firing
      this.on('click', function(e) { e.stopPropagation(); }, id);

      this.on('mousedown', function(e) {
        var self   = this;
        var startX = e.x;
        var col1   = self.X.$(id).parentElement;
        var col2   = self.X.$(id).parentElement.nextSibling;
        var w1     = toNum(col1.width);
        var w2     = prop2 ? toNum(col2.width) : 0;

        e.preventDefault();

        function onMouseMove(e) {
          var delta = e.x - startX;
          col1.width = w1 + ( prop2 ? Math.min(w2, delta) : delta );
          if ( prop2 ) col2.width = w2 + Math.min(-delta, w1);
        }

        var onMouseUp = (function(e) {
          e.preventDefault();

          if ( toNum(col1.width) < this.MIN_COLUMN_SIZE ) {
            this.properties = this.getPropertyNames().deleteF(prop1.name);
          } else {
            prop1.tableWidth = col1.width;
          }
          if ( prop2 ) {
            if ( toNum(col2.width) < this.MIN_COLUMN_SIZE ) {
              this.properties = this.getPropertyNames().deleteF(prop2.name);
            } else {
              prop2.tableWidth = col2.width;
            }
          }
          this.X.document.removeEventListener('mousemove', onMouseMove);
          this.X.document.removeEventListener('mouseup',   onMouseUp);
        }).bind(this);

        this.X.document.addEventListener('mousemove', onMouseMove);
        this.X.document.addEventListener('mouseup',   onMouseUp);
      }, id);

      return '<div id="' + id + '" class="columnResizeHandle" style="top:0;z-index:9;cursor:ew-resize;position:absolute;right:-3px;width:6px;height:100%"><div>';
    },

    initHTML_: function() {
      this.initHTML.super_.call(this);

      var self = this;
      var trs = argsToArray(this.X.$$('tr-' + this.id));
      this.resetRowListeners_(trs);
      trs.forEach(function(e, i) {
        var obj = self.objs[i];
        var timer;

        e.onmouseover = function() {
          self.mouseOverRow = true;
          self.selection = obj;
        };
        e.onmouseout = function() {
          self.mouseOverRow = false;
          self.selection = '';
        };
        e.onclick = function() {
          if (timer) window.clearTimeout(timer);
          timer = window.setTimeout(function() {
            console.log('onclick');
            self.hardSelection = self.selection = obj;
            self.publish(self.CLICK, obj);
          }.bind(self), 250);
        };
        e.ondblclick = function() {
          if (timer) window.clearTimeout(timer);
          console.log('ondblclick');
          self.publish(self.DOUBLE_CLICK, obj);
        };

        // Adjust soft selection according to last known mouse location.
        if ( self.mouseOverRow ) {
          var left = e.offsetLeft;
          var right = left + e.offsetWidth;
          var top = e.offsetTop;
          var bottom = top + e.offsetHeight;
          var x = self.mouseX;
          var y = self.mouseY;
          if ( left <= x && right >= x && top <= y && bottom >= y ) {
            self.selection = obj;
          }
        }
      });

      delete this['initializers_'];
      this.children = [];
    },

    resetRowListeners_: function(trs) {
      var self = this;
      self.selectionListeners_.forEach(function(listener) {
        self.selection$.removeListener(listener);
      });
      self.hardSelectionListeners_.forEach(function(listener) {
        self.hardSelection$.removeListener(listener);
      });

      self.selectionListeners_ = [];
      self.hardSelectionListeners_ = [];

      trs.forEach(function(e, i) {
        var obj = self.objs[i];
        var sListener = function() {
          DOM.setClass(e, 'rowSoftSelected', self.selection === obj);
        };
        var hsListener = function() {
          DOM.setClass(e, 'rowSelected', self.hardSelection === obj);
        };

        self.selection$.addListener(sListener);
        self.selectionListeners_.push(sListener);

        self.hardSelection$.addListener(hsListener);
        self.hardSelectionListeners_.push(hsListener);
      });
    },

    getProperties: function() {
      var model = this.model;
      var propNames = this.getPropertyNames();
      return propNames.map(function(name) { return model.getProperty(name); });
    },

    getPropertyNames: function() {
      return this.properties.length > 0 ? this.properties :
          this.model.tableProperties;
    }
  },

  templates: [
    function toHTML() {/*
      <div tabindex="99" class="tableView" style="display:flex;display:-webkit-flex;width:100%;">
        <span id="%%id" style="flex:1 1 100%;-webkit-flex:1 1 100%;overflow-x:auto;overflow-y:hidden;">
          <% this.tableToHTML(out); %>
        </span>
        <%= this.scrollEnabled ?
            ('<span style="margin-left:2px;margin-right:2px;width:20px;flex:none;-webkit-flex:none;overflow:hidden;padding-top:48px;" class="scrollbar">' +
            this.scrollbar.toView_().toHTML() + '</span>') : '' %>
      </div>
    */},
    function CSS() {/*
      .th-label {
        display: flex;
        height: 100%;
        align-items: center;
      }
      .th-label.numeric {
        flex-direction: row-reverse;
      }
    */}
  ]
});
