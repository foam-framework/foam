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

MODEL({
  package: 'foam.demos.sevenguis',
  name: 'CellParser',
  extendsModel: 'grammar',

  methods: {
    START: sym('expr'),

    expr: alt(
      sym('number'),
//      sym('fn'),
      sym('cell'),
      sym('string')
    ),

    digit: range('0', '9'),

    number: seq(
      optional('-'),
      alt(
        plus(sym('digit')),
        seq(repeat(sym('digit')), '.', plus(sym('digit'))))),

    cell: seq(sym('col'), sym('row')),

    col: alt(range('A', 'Z'), range('a', 'z')),

    row: repeat(sym('digit'), 1, 2),

    string: repeat(anyChar)
  }
});


// https://www.artima.com/pins1ed/the-scells-spreadsheet.html
MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Cell',
  extendsModel: 'foam.ui.View',
  imports: [ 'cells' ],
  properties: [
    {
      name: 'src',
      displayWidth: 12
    },
    {
      name: 'value',
      displayWidth: 12
    }
  ],
  methods: [
  ],
  templates: [
    function toHTML() {/*
      $$src
    */}
  ]
});


MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Cells',
  extendsModel: 'foam.ui.View',
  requires: [
    'foam.demos.sevenguis.Cell'
  ],
  exports: [ 'as cells' ],
  properties: [
    {
      name: 'cells',
      factory: function() { return {}; }
    }
  ],
  methods: [
    function cell(col, row) {
      var row = this.cells[row] || ( this.cells[row] = {} );
      return row[col] || ( row[col] = this.Cell.create() );
    }
  ],
  templates: [
    function CSS() {/*
      .cells {
        overflow: auto;
      }
      .cell {
        min-width: 60px;
      }
    */},
    function toHTML() {/*
      <table border class="cells">
        <tr>
          <td></td>
          <% for ( var i = 65 ; i <= 90 ; i++ ) { %>
            <th><%= String.fromCharCode(i) %></th>
          <% } %>
        </tr>
        <% for ( i = 0 ; i <= 99 ; i++ ) { %>
          <tr>
            <th><%= i %></th>
            <% for ( var j = 65 ; j <= 90 ; j++ ) { %>
              <td class="cell"><%= this.cell(i, j) %></td>
            <% } %>
          </tr>
        <% } %>
      </table>
    */}
  ]
});

