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
  imports: [ 'selection$ as hardSelection$' ],

  constants: {
    MIN_COLUMN_SIZE: 5, // If column is resized below this size, then remove the column instead of shrinking it

    ROW_SELECTED: ['escape'],

    // Not actually a method, but still works
    // TODO: add 'Constants' to Model
    CLICK: "click", // event topic

    DOUBLE_CLICK: "double-click" // event topic
  },

  properties: [
    {
      name:  'model',
      type:  'Model',
      defaultValueFn: function() { return this.X.model ||
                                   ( this.data && this.data.model ); }
    },
    {
      model_: 'StringArrayProperty',
      name:  'properties',
      preSet: function(_, a) { return ! a || a.length == 0 ? null : a; },
      postSet: function() { this.repaint(); },
      defaultValue: null
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
      postSet: function() { this.repaint(); },
      defaultValue: undefined
    },
    {
      name: 'rows',
      type:  'Int',
      defaultValue: 50,
      postSet: function(oldValue, newValue) {
        if ( oldValue !== newValue ) this.repaint();
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
        if ( old ) old.value$.removeListener(this.repaint);
        if ( nu ) nu.value$.addListener(this.repaint);
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
    }
  ],

  actions: [
    {
      name: 'selectRow',
      keyboardShortcuts: [ 13 /* enter */ ],
      action: function() {
        if ( this.selection ) this.hardSelection = this.selection;
        this.publish(this.CLICK, this.selection);
      }
    },
    {
      name: 'prevRow',
      keyboardShortcuts: [ 38 /* up arrow */, 75 /* k */ ],
      action: function() {
        if ( ! this. objs || ! this.objs.length ) return;
        if ( ! this.selection && this.hardSelection ) this.selection = this.hardSelection;
        if ( this.selection ) {
          var i = this.objs.indexOf(this.selection);
          this.scrollbar.value--;
          if ( i > 0 ) this.selection = this.objs[i-1];
        } else {
          this.selection = this.objs[0];
        }
        this.repaint();
      }
    },
    {
      name: 'nextRow',
      keyboardShortcuts: [ 40 /* down arrow */, 74 /* j */ ],
      action: function() {
        if ( ! this. objs || ! this.objs.length ) return;
        if ( ! this.selection && this.hardSelection ) this.selection = this.hardSelection;
        if ( this.selection ) {
          var i = this.objs.indexOf(this.selection);
          this.scrollbar.value++;
          if ( i < this.objs.length-1 ) this.selection = this.objs[i+1];
        } else {
          this.selection = this.objs[0];
        }
        this.repaint();
      }
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isMerged: 200,
      code: function() {
        if ( ! this.$ ) return;

        var h = this.$.parentElement.offsetHeight;
        var rows = Math.ceil((h - 47)/20)+1;
        // TODO: update the extent somehow
//        this.scrollbar.extent = rows;
        this.rows = rows;
        this.scrollbar.height = h-1;
        this.scrollbar.paint();
      }
    },
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        this.dao.select(COUNT())(function(c) {
          this.scrollbar.size = c.count;
          this.repaint();
        }.bind(this));
      }
    },
    {
      name: 'repaint',
      isFramed: true,
      code: function() { this.repaintNow(); }
    },
    {
      name: 'onEditColumns',
      code: function(evt) {
        var v = this.EditColumnsView.create({
          model:               this.model,
          properties:          this.properties || this.model.tableProperties,
          availableProperties: this.model.getRuntimeProperties().filter(
              function(prop) { return !prop.hidden; })
        });

        v.addPropertyListener('properties', function() {
          v.close();
          this.properties = v.properties;
          v.removePropertyListener('properties', arguments.callee);
          this.repaint();
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
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      // TODO: I don't think this should be height:100%, but needs to be
      // fixed somehow.
      return '<div tabindex="99" class="tableView" style="display:flex;width:100%;">' +
        '<span id="' + this.id + '" style="flex:1 1 100%;overflow-x:auto;overflow-y:hidden;">' +
        this.tableToHTML() +
        '</span>' +
          ( this.scrollbarEnabled ?
            '<span style="width:19px;flex:none;overflow:hidden;">' +
            this.scrollbar.toView_().toHTML() +
            '</span>' : '' ) +
        '</div>';
    },

    initHTML: function() {
      this.SUPER();

      this.scrollbar.toView_().initHTML();

      this.dao && this.onDAOUpdate();

      if ( this.scrollEnabled ) {
        (this.window || window).addEventListener('resize', this.onResize, false);

        var sb = this.scrollbar;

        this.$.parentElement.onmousewheel = function(e) {
          sb.value = Math.min(
            sb.size - sb.extent,
            Math.max(
              0,
              sb.value - Math.round(e.wheelDelta / 20)));
        };

        if ( this.X.gestureManager ) {
          this.X.gestureManager.install(this.GestureTarget.create({
            containerID: this.id,
            handler: this,
            getElement: function() { return this.container.$.parentElement; },
            gesture: 'verticalScroll'
          }));
        }

        this.onResize();
      }
    },

    /** Call repaint() instead to repaint on next animation frame. **/
    repaintNow: function() {
      var dao = this.dao;

      /*
      this.show__ = ! this.show__;
      if ( this.show__ ) return;
      */
      // this.count__ = ( this.count__ || 0)+1;
      // if ( this.count__ % 3 !== 0 ) return;

      if ( ! dao || ! this.$ ) return;

      dao = dao.skip(this.scrollbar.value);

      var self = this;
      if ( this.sortOrder ) dao = dao.orderBy(this.sortOrder);

      dao.limit(this.rows).select()(function(objs) {
        self.objs = objs;
        if ( self.$ ) {
          self.$.innerHTML = self.tableToHTML();
          self.initHTML_();
        }
      });
    },

    tableToHTML: function() {
      var model = this.model;

      if ( ! model ) return '<b>ERROR: Table view without model</b>';

      if ( this.initializers_ ) {
        // console.log('Warning: TableView.tableToHTML called twice without initHTML');
        delete this['initializers_'];
        this.children = [];
      }

      var str = [];
      var props = [];

      str.push('<table class="foamTable ' + model.name + 'Table">');

      //str += '<!--<caption>' + model.plural + '</caption>';
      str.push('<thead><tr>');
      var properties = this.properties || this.model.tableProperties;
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var key  = properties[i];
        var prop = model.getProperty(key);

        if ( ! prop ) continue;

        if ( prop.hidden ) continue;

        str.push('<th style="position:relative;" scope=col ');
        str.push('id=' +
                 this.on(
                   'click',
                   (function(table, prop) { return function() {
                     table.sortOrder = ( table.sortOrder === prop ) ? DESC(prop) : prop;
                     table.repaintNow();
                   };})(this, prop)));
        if ( prop.tableWidth ) str.push(' width="' + prop.tableWidth + '"');

        var arrow = '';

        if ( this.sortOrder === prop ) {
          arrow = ' <span class="indicator">&#9650;</span>';
        } else if ( this.sortOrder && DescExpr.isInstance(this.sortOrder) && this.sortOrder.arg1 === prop ) {
          arrow = ' <span class="indicator">&#9660;</span>';
        }

        str.push('>', prop.tableLabel, arrow);

        if ( this.columnResizeEnabled )
          str.push(this.columnResizerToHTML(
            prop,
            model.getProperty(properties[i+1])));

        str.push('</th>');

        props.push(prop);
      }
      if ( this.editColumnsEnabled ) {
        str.push('<th width=15 id="' + this.on('click', this.onEditColumns) + '">...</th>');
      }
      str.push('</tr><tr style="height:2px"></tr></thead><tbody>');
      var objs = this.objs;
      var hselectFound = false;
      var sselectFound = false;
      if ( objs ) {
        var hselect = this.hardSelection;
        var sselect = this.selection;
        for ( var i = 0 ; i < objs.length; i++ ) {
          var obj = objs[i];
          var className = "tr-" + this.id;

          if ( hselect && obj.id == hselect.id ) {
            className += " rowSelected";
            hselectFound = true;
          }

          if ( sselect && obj.id == sselect.id ) {
            className += " rowSoftSelected";
            sselectFound = true;
          }

          str.push('<tr class="' + className + '">');

          for ( var j = 0 ; j < props.length ; j++ ) {
            var prop = props[j];

            if ( j == props.length - 1 && this.editColumnsEnabled ) {
              str.push('<td colspan=2 class="' + prop.name + '">');
            } else {
              str.push('<td class="' + prop.name + '">');
            }
            var val = obj[prop.name];
            if ( prop.tableFormatter ) {
              str.push(prop.tableFormatter(val, obj, this));
            } else {
              str.push(( val == null ) ? '&nbsp;' : this.strToHTML(val));
            }
            str.push('</td>');
          }

          str.push('</tr>');
        }
      }

      str.push('</tbody></table>');

      if ( ! hselectFound ) this.hardSelection = '';
      if ( ! sselectFound ) this.selection = '';

      return str.join('');
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
            this.properties = ( this.properties || this.model.tableProperties ).deleteF(prop1.name);
          } else {
            prop1.tableWidth = col1.width;
          }
          if ( prop2 ) {
            if ( toNum(col2.width) < this.MIN_COLUMN_SIZE ) {
              this.properties = ( this.properties || this.model.tableProperties ).deleteF(prop2.name);
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

        e.onmouseover = function() {
          self.selection = obj;
        };
        e.onmouseout = function() {
          self.selection = self.hardSelection;
        };
        e.onclick = function(evt) {
          self.hardSelection = self.selection = obj;
          self.publish(self.CLICK, obj);
        };
        e.ondblclick = function() {
          self.publish(self.DOUBLE_CLICK, obj);
        };
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
    }
  }
});
