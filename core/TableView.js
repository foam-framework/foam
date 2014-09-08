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
MODEL({
  name: 'TableView',
  extendsModel: 'AbstractDAOView',

  label: 'Table View',

  properties: [
    {
      name:  'model',
      type:  'Model',
      defaultValueFn: function() { return this.X.model; }
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
        var sb = this.X.ScrollCView.create({height:800, width: 24, x: 1, y: 0, size: 200, extent: 10});

//        if ( this.dao ) this.dao.select(COUNT())(function(c) { sb.size = c.count; });

        sb.value$.addListener(this.repaint);

        return sb;
      }
    },
    {
      name: 'scrollPitch',
      help: 'Number of (CSS) pixels of touch drag required to scroll by one',
      defaultValue: 10
    },
    {
      name: 'touchScrolling',
      model_: 'BooleanProperty',
      defaultValue: false,
      hidden: true,
      transient: true
    },
    {
      name: 'touchPrev',
      hidden: true,
      transient: true,
      defaultValue: 0
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
      isAnimated: true,
      code: function() {
        this.dao.select(COUNT())(function(c) {
          this.scrollbar.size = c.count;
          this.repaint();
        }.bind(this));
      }
    },
    {
      name: 'repaint',
      isAnimated: true,
      code: function() { this.repaintNow(); }
    },
    {
      name: 'onEditColumns',
      code: function(evt) {
        var v = EditColumnsView.create({
          model:               this.model,
          properties:          this.properties || this.model.tableProperties,
          availableProperties: this.model.properties
        });

        v.addPropertyListener('properties', function() {
          v.close();
          this.properties = v.properties;
          v.removePropertyListener('properties', arguments.callee);
          this.repaint();
        }.bind(this));

        this.$.insertAdjacentHTML('beforebegin', v.toHTML());

        var y = findPageXY(this.$)[1];
        var screenHeight = this.X.document.firstElementChild.offsetHeight;
        var popupHeight = toNum(v.$.offsetHeight);
        if ( screenHeight-y-popupHeight < 10 ) {
          v.$.style.maxHeight = ( screenHeight - y - 10 ) + 'px';
        }

        v.initHTML();
      }
    },
    {
      name: 'onTouchStart',
      code: function(touches, changed) {
        if ( touches.length > 1 ) return { drop: true };
        return { weight: 0.3 };
      }
    },
    {
      name: 'onTouchMove',
      code: function(touches, changed) {
        var t = touches[changed[0]];
        if ( this.touchScrolling ) {
          var sb = this.scrollbar;
          var dy = t.y - this.touchPrev;
          if ( dy > this.scrollPitch && sb.value > 0 ) {
            this.touchPrev = t.y;
            sb.value--;
          } else if ( dy < -this.scrollPitch && sb.value < sb.size - sb.extent ) {
            this.touchPrev = t.y;
            sb.value++;
          }

          return { claim: true, weight: 0.99, preventDefault: true };
        }

        if ( Math.abs(t.dy) > 10 && Math.abs(t.dx) < 10 ) {
          // Moving mostly vertically, so start scrolling.
          this.touchScrolling = true;
          this.touchPrev = t.y;
          return { claim: true, weight: 0.8, preventDefault: true };
        } else if ( t.distance < 10 ) {
          return { preventDefault: true };
        } else {
          return { drop: true };
        }
      }
    },
    {
      name: 'onTouchEnd',
      code: function(touches, changed) {
        this.touchScrolling = false;
        return { drop: true };
      }
    }
  ],

  methods: {
    MIN_COLUMN_SIZE: 5, // If column is resized below this size, then remove the column instead of shrinking it

    ROW_SELECTED: ['escape'],

    // Not actually a method, but still works
    // TODO: add 'Constants' to Model
    CLICK: "click", // event topic

    DOUBLE_CLICK: "double-click", // event topic

    toHTML: function() {
      // TODO: I don't think this should be height:100%, but needs to be
      // fixed somehow.
      return '<div tabindex="99" style="display:flex;width:100%;height:100%">' +
        '<span id="' + this.id + '" style="flex:1 1 100%;overflow-x:auto;overflow-y:hidden;">' +
        this.tableToHTML() +
        '</span>' +
        '<span style="width:19px;flex:none;overflow:hidden;">' +
        this.scrollbar.toHTML() +
        '</span>' +
        '</div>';
    },

    initHTML: function() {
      this.SUPER();

      this.scrollbar.initHTML();

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

        if ( this.X.touchManager ) {
          this.X.touchManager.install(TouchReceiver.create({
            id: 'qbug-table-scroll-' + this.id,
            element: this.$.parentElement,
            delegate: this
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

      if ( ! model ) return;

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
      if ( objs ) {
        var hselect = this.hardSelection;
        var sselect = this.selection;
        for ( var i = 0 ; i < objs.length; i++ ) {
          var obj = objs[i];
          var className = "tr-" + this.id;

          if ( hselect && obj.id == hselect.id ) {
            className += " rowSelected";
          }

          if ( sselect && obj.id == sselect.id ) {
            className += " rowSoftSelected";
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

        this.X.document.addEventListener('mousemove', onMouseMove);
        this.X.document.addEventListener('mouseup',   function(e) {
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
          self.X.document.removeEventListener('mousemove', onMouseMove);
          self.X.document.removeEventListener('mouseup',   arguments.callee);
        }.bind(this));
      }, id);

      return '<div id="' + id + '" class="columnResizeHandle" style="top:0;z-index:9;cursor:ew-resize;position:absolute;right:-3px;width:6px;height:100%"><div>';
    },

    initHTML_: function() {
      this.initHTML.super_.call(this);

      var self = this;

      argsToArray($$('tr-' + this.id)).forEach(function(e, i) {
        var obj = self.objs[i];

        self.selection$.addListener(function() {
          DOM.setClass(e, 'rowSoftSelected', self.selection === obj);
        });
        self.hardSelection$.addListener(function() {
          DOM.setClass(e, 'rowSelected', self.hardSelection === obj);
        });
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
    }
  }
});


MODEL({
  name: 'EditColumnsView',

  extendsModel: 'View',

  properties: [
    {
      name: 'model',
      type: 'Model'
    },
    {
      model_: 'StringArrayProperty',
      name: 'properties'
    },
    {
      model_: 'StringArrayProperty',
      name: 'availableProperties'
    }
  ],

  listeners: [
    {
      name: 'onAddColumn',
      code: function(prop) {
        this.properties = this.properties.concat([prop]);
      }
    },
    {
      name: 'onRemoveColumn',
      code: function(prop) {
        this.properties = this.properties.deleteF(prop);
      }
    }
  ],

  methods: {
    toHTML: function() {
      var s = '<span id="' + this.id + '" class="editColumnView" style="overflow-y: scroll;position: absolute;right: 0.96;background: white;top: 138px;border: 1px solid black;">'

      s += 'Show columns:';
      s += '<table>';

      // Currently Selected Properties
      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var p = this.model.getProperty(this.properties[i]);
        s += '<tr><td id="' + this.on('click', this.onRemoveColumn.bind(this, p.name)) + '">&nbsp;&#x2666;&nbsp;' + p.label + '</td></tr>';
      }

      // Available but not Selected Properties
      for ( var i = 0 ; i < this.availableProperties.length ; i++ ) {
        var p = this.availableProperties[i];
        if ( this.properties.indexOf(p.name) == -1 ) {
          s += '<tr><td id="' + this.on('click', this.onAddColumn.bind(this, p.name)) + '">&nbsp;&nbsp;&nbsp;&nbsp;' + p.label + '</td></tr>';
        }
      }

      s += '</table>';
      s += '</span>';

      return s;
    }
  }
});
