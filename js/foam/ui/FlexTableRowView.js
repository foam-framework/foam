/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  package: 'foam.ui',
  name: 'FlexTableRowView',
  extends: 'foam.ui.View',
  imports: ['hardSelection$'],
  properties: [
    {
      name: 'properties',
    },
  ],
  methods: [
    function isPropNumeric(prop) {
      return IntProperty.isInstance(prop) || FloatProperty.isInstance(prop);
    },
    function shouldDestroy(old, nu) {
      if (!old || !nu) return true;
      return !nu.equals(old);
    },
    // Override me if you want, but don't forget to call SUPER().
    // The col-N classes added here are essential to the FlexTableView.
    function getBodyCellClass(prop, i) {
      var cssClasses = ['col-' + i];
      if ( this.isPropNumeric(prop) )
        cssClasses.push('numeric');
      return cssClasses.join(' ');
    },
    // Override me to add custom CSS classes to rows.
    function getBodyRowClass() {
      return '';
    }
  ],
  listeners: [
    {
      name: 'onClick',
      code: function() {
        this.hardSelection = this.data;
      }
    },
  ],
  templates: [
    function toHTML() {/*
      <% var props = this.properties; %>
      <flex-table-row id="<%= this.id %>" class="<%= this.getBodyRowClass() %>">
        <% for (var i = 0; i < props.length; i++) { %>
          <flex-table-cell class="<%= this.getBodyCellClass(props[i], i) %>">
            <% this.bodyCellHTML(out, props[i]); %>
          </flex-table-cell>
        <% } %>
      </flex-table-row>
      <%
        this.on('click', this.onClick, this.id);
        this.setClass('rowSelected',
            function() { return self.hardSelection === self.data; },
            this.id);
      %>
    */},
    function bodyCellHTML(out, prop) {/*
      <%= prop.tableFormatter ?
          prop.tableFormatter(this.data[prop.name], this.data, this) :
          this.data[prop.name] %>
    */},
  ]
});
