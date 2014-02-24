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
var TableView2 = FOAM({
  model_: 'Model',

  extendsModel: 'AbstractView',

  name: 'TableView2',
  label: 'Table View',

  properties: [
    {
      name:  'model',
      type:  'Model'
    },
    {
      model_: StringArrayProperty,
      name:  'properties',
      preSet: function(a) { return ! a || a.length == 0 ? null : a; },
      postSet: function() { this.repaint(); },
      defaultValue: null
    },
    {
      name:  'hardSelection',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name:  'selection',
      type:  'Value',
      valueFactory: function() { return SimpleValue.create(); }
    },
    {
      name:  'children',
      type:  'Array[View]',
      valueFactory: function() { return []; }
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
        this.onDAOUpdate();
      }
    },
    {
      name: 'rows',
      type:  'Integer',
      defaultValue: 65,
      postSet: function() {
        this.repaint();
      }
    },
    {
      model_: 'IntegerProperty',
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
      valueFactory: function() {
        var sb = ScrollCView.create({height:800, width: 24, x: 1, y: 0, size: 200, extent: 10});

//        if ( this.dao ) this.dao.select(COUNT())(function(c) { sb.size = c.count; });

        sb.value$.addListener(this.repaint);

        return sb;
      }
    }
  ],

  listeners: [
    {
      model_: 'Method',

      name: 'onResize',
      animate: true,
      code: function() {
        var h = this.$.offsetHeight;
        this.scrollbar.height = h-1;
        this.scrollbar.paint();
      }
    },

    {
      model_: 'Method',

      name: 'onDAOUpdate',
      // animate: true,
      code: function() {
        this.dao.select(COUNT())(function(c) {
          this.scrollbar.size = c.count;
          this.repaintNow();
        }.bind(this));
      }
    },

    {
      model_: 'Method',

      name: 'repaint',
      animate: true,
      code: function() {
        this.repaintNow();
      }
    },
    {
      model_: 'Method',

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
    }/*
// TODO: remove
    {
      model_: 'Method',

      name: 'layout',
      animate: true,
      code: function() {
        return;
        if ( ! this.$ ) {
          console.warn('Attempt to layout() $-less TableView.');
          return;
        }

        var style;
        try {
          style = window.getComputedStyle(this.$);
        } catch (x) {
          return;
        }

        console.log('height ', this.height, 'width', this.width);
        console.log('style height ', style.height, 'width', style.width);
        var height = toNum(style.height);
        this.scrollbar.height = height-150;
        this.scrollbar.parent.height = height-150;

        console.log('scrollbar height ', this.scrollbar.height, 'width', this.scrollbar.width);

        / *
        var top = 47;
        var height = 20;
        var rows = $$("tr-" + this.getID());

        // TODO: investigate how this is called on startup, it seems suspicious
        if ( rows.length > 1 ) {
          var row = rows[1];
          var style = window.getComputedStyle(row);
          // If the row is selected its height is less, so if we select two rows
        // we're sure to get one that isn't selected.
          height = Math.max(row.clientHeight, rows[0].clientHeight)+1;
          top = rows[0].offsetTop + rows[0].offsetParent.offsetTop;
        }

        this.rows = Math.floor((toNum(parent.height) - top) / height);
        * /
      }
    }
*/

  ],

  methods: {

    // Not actually a method, but still works
    // TODO: add 'Constants' to Model
    DOUBLE_CLICK: "double-click", // event topic

    toHTML: function() {
      return '<div style="display:flex;width:100%">' +
        '<span id="' + this.getID() + '" style="flex:1 1 100%;overflow-x:auto;overflow-y:hidden;">' +
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

      (this.window || window).addEventListener('resize', this.onResize, false);

      this.daoListener = {
        put:    this.onDAOUpdate,
        remove: this.onDAOUpdate
      };

      this.dao.listen(this.daoListener);
    },

    /** Call repaint() instead to repaint on next animation frame. **/
    repaintNow: function() {
      var dao = this.dao;

      if ( ! dao || ! this.$ ) return;

      dao = dao.skip(this.scrollbar.value);

      var self = this;
      var objs = [];
      var selection = this.selection && this.selection.get();
      if ( this.sortOrder ) dao = dao.orderBy(this.sortOrder);

      dao.limit(this.rows).select({
        put: function(o) { if ( ! selection || ( self.selection && o === self.selection.get() ) ) selection = o; objs.push(o); }} )(function() {
          self.objs = objs;
          if ( self.$ ) {
            self.$.innerHTML = self.tableToHTML();
            self.initHTML_();
            // TODO: use to set 'extent'
//            self.height = toNum(window.getComputedStyle(self.$.children[0]).height);
          }
          self.onResize();
          // self.selection && self.selection.set(selection);
        });
    },

    tableToHTML: function() {
      var model = this.model;

      if ( this.callbacks_ ) {
        // console.log('Warning: TableView.tableToHTML called twice without initHTML');
        delete this['callbacks_'];
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
      if ( this.objs )
        for ( var i = 0 ; i < this.objs.length; i++ ) {
          var obj = this.objs[i];
          var className = "tr-" + this.getID();

          if ( this.selection.get() && obj.id == this.selection.get().id ) {
            this.selection.set(obj);
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

      str.push('</tbody></table>');

      return str.join('');
    },

    initHTML_: function() {
      this.initHTML.super_.call(this);

      var es = $$('tr-' + this.getID());
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
          var siblings = evt.srcElement.parentNode.parentNode.childNodes;
          for ( var i = 0 ; i < siblings.length ; i++ ) {
            siblings[i].classList.remove("rowSelected");
          }
          evt.srcElement.parentNode.classList.add('rowSelected');
        }; }(this.selection, this.objs[i]);
        e.ondblclick = function(value, obj) { return function(evt) {
          self.publish(self.DOUBLE_CLICK, obj, value);
        }; }(this.selection, this.objs[i]);
      }

      delete this['callbacks_'];
      this.children = [];
    },

    destroy: function() {
    }
  }
});
