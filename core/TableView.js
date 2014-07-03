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
  extendsModel: 'View',

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
      type:  'Value',
      postSet: function(_, v) { this.publish(this.ROW_SELECTED, v); },
      factory: function() { return SimpleValue.create(); }
    },
    {
      name:  'selection',
      type:  'Value',
      factory: function() { return SimpleValue.create(); }
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
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      required: true,
      hidden: true,
      postSet: function(oldValue, newValue) {
        if ( this.daoListener ) {
          if ( oldValue ) oldValue.unlisten(this.daoListener);
          if ( newValue ) newValue.listen(this.daoListener);
        }
        this.scrollbar.value = 0;
        this.onDAOUpdate();
      }
    },
    {
      name: 'value',
      postSet: function(old, nu) {
        old && old.removeListener(this.onValueChange);
        nu.addListener(this.onValueChange);
        this.onValueChange();
      }
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
        if ( ! this.dao ) return;
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
      name: 'onValueChange',
      code: function() { this.dao = this.value.value; }
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
    ROW_SELECTED: ['escape'],

    // Not actually a method, but still works
    // TODO: add 'Constants' to Model
    DOUBLE_CLICK: "double-click", // event topic

    toHTML: function() {
      return '<div style="display:flex;width:100%;height:100%">' +
        '<span id="' + this.id + '" style="flex:1 1 100%;overflow-x:auto;overflow-y:hidden;">' +
        this.tableToHTML() +
        '</span>' +
        '<span style="width:19px;flex:none;overflow:hidden;">' +
        this.scrollbar.toHTML() +
        '</span>' +
        '</div>';
    },

    initHTML: function() {
      this.scrollbar.initHTML();

      this.onDAOUpdate();

      this.daoListener = {
        put:    this.onDAOUpdate,
        remove: this.onDAOUpdate
      };

      if ( this.scrollEnabled ) {
        (this.window || window).addEventListener('resize', this.onResize, false);

        var sb = this.scrollbar;

        this.$.parentElement.onmousewheel = function(e) {
          if ( e.wheelDeltaY > 0 && sb.value ) {
            sb.value--;
          } else if ( e.wheelDeltaY < 0 && sb.value < sb.size - sb.extent ) {
            sb.value++;
          }
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

      if ( this.dao ) this.dao.listen(this.daoListener);
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

        str.push('<th scope=col ');
        str.push('id=' +
                 this.on(
                   'click',
                   (function(table, prop) { return function() {
                     if ( table.sortOrder === prop ) {
                       table.sortOrder = DESC(prop);
                     } else {
                       table.sortOrder = prop;
                     }
                     table.repaintNow();
                   };})(this, prop)));
        if ( prop.tableWidth ) str.push(' width="' + prop.tableWidth + '"');

        var arrow = '';

        if ( this.sortOrder === prop ) {
          arrow = ' <span class="indicator">&#9650;</span>';
        } else if ( this.sortOrder && DescExpr.isInstance(this.sortOrder) && this.sortOrder.arg1 === prop ) {
          arrow = ' <span class="indicator">&#9660;</span>';
        }

        str.push('>' + prop.tableLabel + arrow + '</th>');

        props.push(prop);
      }
      if ( this.editColumnsEnabled ) {
        str.push('<th width=15 id="' + this.on('click', this.onEditColumns) + '">...</th>');
      }
      str.push('</tr><tr style="height:2px"></tr></thead><tbody>');
      var objs = this.objs;
      if ( objs ) {
        var hselect = this.hardSelection.get();
        for ( var i = 0 ; i < objs.length; i++ ) {
          var obj = objs[i];
          var className = "tr-" + this.id;

          if ( hselect && obj.id == hselect.id ) {
            className += " rowSelected";
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

    initHTML_: function() {
      this.initHTML.super_.call(this);

      var es = $$('tr-' + this.id);
      var self = this;

      /*
      if ( es.length ) {
        if ( ! this.sized_ ) {
          this.sized_ = true;
          this.layout();
          return;
        }
      }
      */

      for ( var i = 0 ; i < es.length ; i++ ) {
        var e = es[i];

        e.onmouseover = function(value, obj) { return function() {
          value.set(obj);
        }; }(this.selection, this.objs[i]);
        e.onmouseout = function(value, obj) { return function() {
          value.set(self.hardSelection.get());
        }; }(this.selection, this.objs[i]);
        e.onclick = function(value, obj) { return function(evt) {
          self.hardSelection.set(obj);
          value.set(obj);
          delete value['prevValue'];
          var row = evt.srcElement;
          while ( row && row.tagName !== "TR") row = row.parentNode;
          var table = row;
          while (table && table.tagName !== "TBODY")  table = table.parentNode;

          var siblings = table ? table.childNodes : [];
          for ( var i = 0 ; i < siblings.length ; i++ ) {
            siblings[i].classList.remove("rowSelected");
          }
          row && row.classList.add('rowSelected');
        }; }(this.selection, this.objs[i]);
        e.ondblclick = function(value, obj) { return function(evt) {
          self.publish(self.DOUBLE_CLICK, obj, value);
        }; }(this.selection, this.objs[i]);
      }

      delete this['initializers_'];
      this.children = [];
    },

    setValue: function(value) {
      this.value = value;
    },

    destroy: function() {
    }
  }
});
