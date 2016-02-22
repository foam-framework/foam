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
  name: 'TableRowView',
  extends: 'foam.u2.View',

  imports: [
    'hardSelection$',
    'rowClick',
    'tableView'
  ],

  properties: [
    'properties',
    ['nodeName', 'flex-table-row']
  ],

  methods: [
    function isPropNumeric(prop) {
      return IntProperty.isInstance(prop) || FloatProperty.isInstance(prop);
    },

    function getBodyCellClasses(prop, i) {
      var classes = [this.tableView.myCls('cell'), this.tableView.myCls('col-' + i)];
      if (this.isPropNumeric(prop))
        classes.push(this.tableView.myCls('numeric'));
      return classes;
    },

    function getBodyRowClasses() {
      /* Template method for adding classes to each row. */
      return [];
    },

    function initE() {
      this.getBodyRowClasses().forEach(function(c) { this.cls(c); }.bind(this));

      this.dynamic(function(props) {
        this.removeAllChildren();
        this.add(props.map(this.makeBodyCell.bind(this)));
      }.bind(this), this.properties$, this.data$);

      this.on('click', this.onClick);
      this.cls(this.tableView.myCls('row'));
      this.cls(this.dynamic(function(sel, data) {
        return sel === data ? this.tableView.myCls('row-selected') : '';
      }.bind(this), this.hardSelection$, this.data$));
    },

    function makeBodyCell(prop, i) {
      var cell = this.E('flex-table-cell');
      this.getBodyCellClasses(prop, i).forEach(function(c) { cell.cls(c); });
      cell.add(prop.tableFormatter ?
          prop.tableFormatter(this.data[prop.name], this.data, this) :
          this.data[prop.name]);
      return cell;
    }
  ],

  listeners: [
    function onClick() {
      this.hardSelection = this.data;
      if (this.rowClick) this.rowClick(this.data, this, this.tableView);
    }
  ]
});
