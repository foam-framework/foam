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
  extends: 'foam.ui.AbstractDAOView',

  requires: [
    'foam.ui.FlexTableRowView',
    'foam.ui.ScrollView',
  ],
  imports: [
    'document',
    'hardSelection$',
    'softSelection$',
    'window'
  ],

  label: 'Flex Table View',

  properties: [
    {
      type: 'String',
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
      type: 'StringArray',
      name: 'properties',
      lazyFactory: function() {
        return (this.model && this.model.tableProperties &&
            this.model.tableProperties.length > 0) ?
            this.model.tableProperties : this.getDefaultProperties();
      },
      postSet: function() {
        this.updateHead();
        // Eliminates all caches and rebuilds the rows.
        this.scrollView.softDestroy();
        if (this.$) this.initHTML();
      }
    },
    {
      name: 'sortOrder',
      // type:  'Comparator',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.updateHead();
        if (this.$) this.initHTML();
      },
      defaultValue: undefined
    },
    {
      name: 'sortProp',
      defaultValue: undefined
    },
    {
      type: 'Int',
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
      name: 'filteredDAO',
      dynamicValue: function() {
        return this.data.orderBy(this.sortOrder);
      }
    },
    {
      type: 'ViewFactory',
      name: 'rowView',
      defaultValue: 'foam.ui.FlexTableRowView',
      documentation: 'Set this to override the row view. It should be a ' +
          'subclass of $$DOC{ref:"foam.ui.FlexTableRowView"} unless you ' +
          'really know what you\'re doing.',
      adapt: function(old, nu) {
        return nu ? nu : 'foam.ui.FlexTableRowView';
      }
    },
    {
      name: 'rowHeight',
      documentation: 'Set this to set the height of a row in the ScrollView.',
      defaultValue: 48
    },
    {
      name: 'scrollView',
      factory: function() {
        return this.ScrollView.create({
          dao$: this.filteredDAO$,
          rowHeight: this.rowHeight,
          rowView: this.makeRow,
        });
      }
    },
    {
      type: 'Array',
      name: 'colWidths',
      lazyFactory: function() { return []; },
      postSet: function(old, nu) {
        if ( old === nu || ! nu ) return;
        this.injectColStyles();
      }
    },
    {
      type: 'Boolean',
      name: 'isResizing',
      defaultValue: false
    }
  ],

  methods: [
    function initHTML() {
      this.SUPER();
      this.initColWidths();
      this.window.addEventListener('resize', this.resetColWidths);
    },
    function destroy(shouldDestroy) {
      this.SUPER(shouldDestroy);
      this.window.addEventListener('resize', this.resetColWidths);
    },
    function initGlobalState() {
      this.X.dynamicFn(
          function() { this.isResizing; }.bind(this),
          function() {
            DOM.setClass(this.document.body, 'flex-table-view-col-resize',
                         this.isResizing);
          }.bind(this));
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

      // Remove header column asc/desc sorting indicator icons when they are
      // views rather than raw HTML.
      var children = this.children.slice();
      for ( var i = 0; i < children.length; ++i ) {
        if ( children[i] === this.ascIcon || children[i] === this.descIcon )
          this.removeChild(children[i]);
      }

      var out = TemplateOutput.create(this);
      this.headHTML(out);
      head.innerHTML = out.toString();
    },
    function initColWidths() {
      var head = this.$head;
      if ( ! head ) return;
      var headRow = head.querySelector('flex-table-row');
      if ( ! headRow ) return;
      var cells = headRow.children;

      if ( cells.length === this.colWidths.length ) return;

      var i;
      var props = this.getProperties();
      for ( i = 0; i < cells.length; ++i ) {
        if (props[i].tableWidth) {
          cells[i].style.width = props[i].tableWidth + 'px';
          cells[i].style['flex-grow'] = null;
        } else {
          cells[i].style.width = 'initial';
          cells[i].style['flex-grow'] = '1';
        }
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

      // TODO(braden): Replace the mouse-specific things here with DragGesture.
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
  ],

  listeners: [
    {
      name: 'makeRow',
      code: function(map, Y) {
        map = map || {};
        map.properties = this.getProperties();
        return this.rowView(map, Y);
      }
    },
    {
      name: 'resetColWidths',
      code: function() {
        this.colWidths = [];
        this.initColWidths();
      }
    },
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
        <% if ( this.isSortedByProp(prop) ) {
             var icon = this.sortOrder === prop ? this.ascIcon : this.descIcon; %>
             <span class="indicator">
             <% if ( typeof icon === 'string' ) { %>
                  <%= icon %>
             <% } else {
                  out(icon);
                } %>
             </span>
        <% } %>
      </flex-col-label>

      <% var resizeHandleId = this.generateResizeHandleId(i); %>
      <flex-col-resize-handle id="{{resizeHandleId}}"></flex-col-resize-handle>
    */},
    function bodyHTML() {/*
      %%scrollView
    */},
    function colCSS(out, i) {/*
      #%%id .col-{{i}} {
        min-width: {{this.minColWidth}}px;
        width: {{this.colWidths[i]}}px;
      }
    */},
    { name: 'CSS' }
  ]
});
