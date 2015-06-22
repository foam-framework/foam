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
  name: 'ScrollTableView',
  extendsModel: 'foam.ui.AbstractDAOView',

  imports: [
    'document'
  ],

  label: 'Scroll Table View',

  properties: [
    {
      model_: 'StringProperty',
      name: 'className',
      lazyFactory: function() {
        return this.model.name + 'Table';
      }
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
        this.resetColWidths();
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'objs',
      lazyFactory: function() { return []; },
      postSet: function(old, nu) {
        if ( old === nu ) return;
        this.updateBody();
      }
    },
    {
      name: '$head',
      defaultValueFn: function() {
        return this.$ && this.$.querySelector('scroll-table-head');
      }
    },
    {
      name: '$body',
      defaultValueFn: function() {
        return this.$ && this.$.querySelector('scroll-table-body');
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'colWidths',
      lazyFactory: function() { return []; },
      postSet: function(old, nu) {
        if ( old === nu || ! nu ) return;
        for ( var i = 0; i < nu.length; ++i ) {
          this.injectColStyle(i);
        }
      }
    }
  ],

  methods: [
    function initHTML() {
      this.SUPER();
      this.resetColWidths();
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
    function resetColWidths() {
      var head = this.$head;
      if ( ! head ) return;
      var headRow = head.querySelector('scroll-table-row');
      if ( ! headRow ) return;
      var cells = headRow.children;
      var i;
      for ( i = 0; i < cells.length; ++i ) {
        cells[i].style.width = 'initial';
      }
      this.measureColWidths(cells);
    },
    function measureColWidths(cells) {
      var widths = new Array(cells.length);
      for ( var i = 0; i < cells.length; ++i ) {
        widths[i] = cells[i].offsetWidth;
      }
      this.colWidths = widths;
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
      return this.document.body.querySelector('#' + this.getColStyleId(i));
    },
    function getColStyleId(i) {
      return this.id + '-col-style-' + i;
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() { this.dao.select()(this.onDAOUpdate_); }
    },
    {
      name: 'onDAOUpdate_',
      code: function(objs) { this.objs = objs; }
    }
  ],

  templates: [
    function toHTML() {/*
      <scroll-table id="%%id" %%cssClassAttr()>
        <scroll-table-head>
          <% this.headHTML(out) %>
        </scroll-table-head>
        <scroll-table-body>
          <% this.bodyHTML(out) %>
        </scroll-table-body>
      </scroll-table>
    */},
    function headHTML() {/*
      <scroll-table-row>
        <%
          var props = this.getProperties();
          for ( var i = 0; i < props.length; ++i ) {
            var prop = props[i];
          %>
          <scroll-table-cell class="col-{{i}}"><% this.headCellHTML(out, prop) %></scroll-table-cell>
          <%
          }
        %>
      </scroll-table-row>
    */},
    function headCellHTML(out, prop) {/*{{prop.tableLabel}}*/},
    function bodyHTML() {/*
      <%
        var props = this.getProperties();
        var objs = this.objs;
        for ( var i = 0; i < objs.length; ++i ) {
          var obj = objs[i];
        %>
          <scroll-table-row>
        <%
          for ( var j = 0; j < props.length; ++j ) {
            var prop = props[j];
      %>
            <scroll-table-cell class="col-{{j}}"><% this.bodyCellHTML(out, obj, prop) %></scroll-table-cell>
      <%
          }
        %>
          </scroll-table-row>
        <%
        }
      %>
    */},
    function bodyCellHTML(out, obj, prop) {/*
      <%= prop.tableFormatter ?
          prop.tableFormatter(obj[prop.name], obj, this) : obj[prop.name] %>
    */},
    function colCSS(out, i) {/*
      #%%id .col-{{i}} { width: {{this.colWidths[i]}}; }
    */},
    { name: 'CSS' }
  ]
});
