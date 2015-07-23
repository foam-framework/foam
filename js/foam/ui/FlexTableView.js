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
  package: 'foam.ui',
  name: 'FlexTableView',
  extendsModel: 'foam.ui.AbstractDAOView',

  imports: [
    'document',
    'hardSelection$',
    'softSelection$'
  ],

  label: 'Flex Table View',

  properties: [
    {
      model_: 'StringProperty',
      name: 'className',
      lazyFactory: function() {
        return this.model.name + 'Table';
      }
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
      name: 'data',
      postSet: function(old, nu) {
        this.model = this.getModel();
      }
    },
    {
      name: 'model',
      lazyFactory: function() {
        return this.getModel();
      },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu && this.properties.length === 0 )
          this.properties = this.getDefaultProperties();
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'properties',
      lazyFactory: function() {
        return (this.model && this.model.tableProperties &&
            this.model.tableProperties.length > 0) ?
            this.model.tableProperties : this.getDefaultProperties();
      },
      postSet: function() {
        this.updateHead();
        this.updateBody();
        this.initHTML();
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'objs',
      lazyFactory: function() { return []; },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.updateBody();
        this.initHTML();
      }
    },
    {
      name:  'sortOrder',
      type:  'Comparator',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.updateHead();
        this.onDataUpdate();
      },
      defaultValue: undefined
    },
    {
      name:  'sortProp',
      defaultValue: undefined
    },
    {
      model_: 'IntProperty',
      name: 'minColWidth',
      defaultValue: 50,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.injectColStyles();
      }
    },
    {
      name:  'hardSelection'
    },
    {
      name:  'softSelection'
    },
    {
      model_: 'ArrayProperty',
      name: 'softSelectionListeners_',
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
      name: '$head',
      defaultValueFn: function() {
        return this.$ && this.$.querySelector('flex-table-head');
      }
    },
    {
      name: '$body',
      defaultValueFn: function() {
        return this.$ && this.$.querySelector('flex-table-body');
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'colWidths',
      lazyFactory: function() { return []; },
      postSet: function(old, nu) {
        if ( old === nu || ! nu ) return;
        this.injectColStyles();
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'isResizing',
      defaultValue: false
    }
  ],

  methods: [
    function initHTML() {
      this.SUPER();

      if ( this.$body ) this.$body.onmousemove = this.onMouseMove;

      this.initColWidths();
      this.initDataRowHTML();
    },
    function initDataRowHTML() {
      var body = this.$body;
      if ( ! body ) return;

      var self = this;
      var trs = argsToArray(body.children);
      this.resetRowListeners_(trs);

      trs.forEach(function(e, i) {
        var obj = self.objs[i];

        e.onmouseover = function() {
          self.mouseOverRow = true;
          self.softSelection = obj;
        };
        e.onmouseout = function() {
          self.mouseOverRow = false;
          self.softSelection = '';
        };
        e.onclick = function(evt) {
          self.hardSelection = self.softSelection = obj;
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
            self.softSelection = obj;
          }
        }
      });
    },
    function initGlobalState() {
      var body = this.document.body;
      var id = body.id ? body.id : ( body.id = this.nextID() );
      this.setClass('flex-table-view-col-resize', function() {
        return this.isResizing;
      }.bind(this), id);
    },
    function onDataUpdate() {
      var dao = this.dao;
      if ( this.sortOrder ) dao = dao.orderBy(this.sortOrder);
      dao.select()(this.onDataReady);
    },
    function getModel() {
      return this.X.model ||
          (this.data && this.data.model);
    },
    function getDefaultProperties() {
      return this.model ? this.model.getRuntimeProperties().filter(
          function(prop) { return !prop.hidden; }).map(
          function(prop) { return prop.name; }) : [];
    },
    function getProperties() {
      var model = this.model;
      var propNames = this.getPropertyNames();
      return model ? propNames.map(function(name) {
        return model.getProperty(name);
      }) : [];
    },
    function getPropertyNames() {
      return this.properties.length > 0 ? this.properties :
          ((this.model.tableProperties && this.model.tableProperties.length > 0) ?
          this.model.tableProperties : []);
    },
    function updateHead() {
      var head = this.$head;
      if ( ! head ) return;
      var out = TemplateOutput.create(this);
      this.headHTML(out);
      head.innerHTML = out.toString();
    },
    function updateBody() {
      var body = this.$body;
      if ( ! body ) return;
      var out = TemplateOutput.create(this);
      this.bodyHTML(out);
      body.innerHTML = out.toString();
    },
    function initColWidths() {
      var head = this.$head;
      if ( ! head ) return;
      var headRow = head.querySelector('flex-table-row');
      if ( ! headRow ) return;
      var cells = headRow.children;

      if ( cells.length === this.colWidths.length ) return;

      var i;
      for ( i = 0; i < cells.length; ++i ) {
        cells[i].style.width = 'initial';
        cells[i].style['flex-grow'] = '1';
      }
      this.measureColWidths(cells);
      for ( i = 0; i < cells.length; ++i ) {
        cells[i].style.width = null;
        cells[i].style['flex-grow'] = null;
      }
    },
    function measureColWidths(cells) {
      var widths = new Array(cells.length);
      for ( var i = 0; i < cells.length; ++i ) {
        widths[i] = cells[i].offsetWidth;
      }
      this.colWidths = widths;
    },
    function injectColStyles() {
      var widths = this.colWidths;
      for ( var i = 0; i < widths.length; ++i ) { this.injectColStyle(i); }
    },
    function injectColStyle(i) {
      var e = this.getColStyle(i);
      if ( e ) this.document.head.removeChild(e);

      e = this.createColStyle(i);
      var out = TemplateOutput.create(this);
      this.colCSS(out, i);
      e.textContent = out.toString();
      this.document.head.appendChild(e);
    },
    function createColStyle(i) {
      var e = this.document.createElement('style');
      e.id = this.getColStyleId(i);
      return e;
    },
    function getColStyle(i) {
      return this.document.head.querySelector('#' + this.getColStyleId(i));
    },
    function getColStyleId(i) {
      return this.id + '-col-style-' + i;
    },
    function getHeadCellClass(prop, i) {
      var cssClasses = ['col-' + i];
      if ( this.isPropNumeric(prop) )
        cssClasses.push('numeric');
      if ( this.isSortedByProp(prop) )
        cssClasses.push('sort');
      return cssClasses.join(' ');
    },
    function getBodyRowClass(i) {
      var cssClasses = [];
      if ( this.objs[i] === this.hardSelection ) cssClasses.push('rowSelected');
      if ( this.objs[i] === this.softSelection ) cssClasses.push('rowSoftSelected');
      return cssClasses.join(' ');
    },
    function getBodyCellClass(prop, i) {
      var cssClasses = ['col-' + i];
      if ( this.isPropNumeric(prop) )
        cssClasses.push('numeric');
      return cssClasses.join(' ');
    },
    function isSortedByProp(prop) {
      return this.sortProp === prop;
    },
    function isPropNumeric(prop) {
      return IntProperty.isInstance(prop) || FloatProperty.isInstance(prop);
    },
    function generateHeadCellId(prop) {
      return this.on('click', this.onSortOrder.bind(this, prop));
    },
    function onSortOrder(prop) {
      this.sortProp = prop;
      this.sortOrder = this.sortOrder === prop ? DESC(prop) : prop;
    },
    function generateResizeHandleId(i) {
      var id = this.nextID();

      // Prevent the column sort-order listener from firing.
      this.on('click', function(e) { e.stopPropagation(); }, id);

      this.on('mousedown', function(e) {
        var self   = this;
        var startX = e.x;
        var handle = self.X.$(id);
        var col1   = handle.parentElement;
        var col2   = handle.parentElement.nextElementSibling;
        var row    = col1.parentElement;
        var w1     = col1.offsetWidth;
        var w2     = col2 ? col2.offsetWidth : 0;

        e.preventDefault();
        self.isResizing = true;

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

          self.colWidths[i] = newW1;
          self.injectColStyle(i);
          if ( w2 ) {
            self.colWidths[i + 1] = newW2;
            self.injectColStyle(i + 1);
          }
        }

        var onMouseUp = (function(e) {
          e.preventDefault();
          self.isResizing = false;
          this.X.document.removeEventListener('mousemove', onMouseMove);
          this.X.document.removeEventListener('mouseup',   onMouseUp);
        }).bind(this);

        this.X.document.addEventListener('mousemove', onMouseMove);
        this.X.document.addEventListener('mouseup',   onMouseUp);
      }, id);

      return id;
    },
    function resetRowListeners_(trs) {
      var self = this;
      self.softSelectionListeners_.forEach(function(listener) {
        self.softSelection$.removeListener(listener);
      });
      self.hardSelectionListeners_.forEach(function(listener) {
        self.hardSelection$.removeListener(listener);
      });

      self.softSelectionListeners_ = [];
      self.hardSelectionListeners_ = [];

      trs.forEach(function(e, i) {
        var obj = self.objs[i];
        var sListener = function() {
          DOM.setClass(e, 'rowSoftSelected', self.softSelection === obj);
        };
        var hsListener = function() {
          DOM.setClass(e, 'rowSelected', self.hardSelection === obj);
        };

        self.softSelection$.addListener(sListener);
        self.softSelectionListeners_.push(sListener);

        self.hardSelection$.addListener(hsListener);
        self.hardSelectionListeners_.push(hsListener);
      });
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() { this.onDataUpdate(); }
    },
    {
      name: 'onDataReady',
      code: function(objs) { this.objs = objs; }
    },
    {
      name: 'onMouseMove',
      isFramed: true,
      code: function(e) {
        var body = this.$body, target = e.target, x = e.offsetX, y = e.offsetY;
        while ( target !== body ) {
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
    }
  ],

  templates: [
    function toHTML() {/*
      <flex-table id="%%id" %%cssClassAttr()>
        <flex-table-head>
          <% this.headHTML(out) %>
        </flex-table-head>
        <flex-table-body>
          <% this.bodyHTML(out) %>
        </flex-table-body>
      </flex-table>
      <% this.initGlobalState() %>
    */},
    function headHTML() {/*
      <flex-table-row>
        <%
          var props = this.getProperties();
          for ( var i = 0; i < props.length; ++i ) {
            var prop = props[i];
          %>
          <flex-table-cell id="{{this.generateHeadCellId(prop)}}"
                           class="{{this.getHeadCellClass(prop, i)}}">
            <% this.headCellHTML(out, prop, i) %>
          </flex-table-cell>
          <%
          }
        %>
      </flex-table-row>
    */},
    function headCellHTML(out, prop, i) {/*
      <flex-col-label>
        <label>{{prop.tableLabel}}</label>
        <% if ( this.isSortedByProp(prop) ) { %>
          <span class="indicator"><%= this.sortOrder === prop ? this.ascIcon : this.descIcon %></span>
        <% } %>
      </flex-col-label>

      <% var resizeHandleId = this.generateResizeHandleId(i); %>
      <flex-col-resize-handle id="{{resizeHandleId}}"></flex-col-resize-handle>
    */},
    function bodyHTML() {/*
      <%
        var props = this.getProperties();
        var objs = this.objs;
        for ( var i = 0; i < objs.length; ++i ) {
          var obj = objs[i];
        %>
          <flex-table-row class="{{this.getBodyRowClass(i)}}">
        <%
          for ( var j = 0; j < props.length; ++j ) {
            var prop = props[j];
      %>
            <flex-table-cell class="{{this.getBodyCellClass(prop, j)}}"><% this.bodyCellHTML(out, obj, prop) %></flex-table-cell>
      <%
          }
        %>
          </flex-table-row>
        <%
        }
      %>
    */},
    function bodyCellHTML(out, obj, prop) {/*
      <%= prop.tableFormatter ?
          prop.tableFormatter(obj[prop.name], obj, this) : obj[prop.name] %>
    */},
    function colCSS(out, i) {/*
      #%%id .col-{{i}} {
        min-width: {{this.minColWidth}};
        width: {{this.colWidths[i]}};
      }
    */},
    { name: 'CSS' }
  ]
});
