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

/*
MODEL({
  package: 'foam.demos.sevenguis',
  name: 'CellParser',
  extendsModel: 'foam.parse.Grammar',

  methods: {
*/

var CellParser = {
  __proto__: grammar,

  START: simpleAlt(
    //      sym('number'),
    sym('formula'),
    sym('string')
  ),
  
  formula: seq('=', sym('expr')),
  
  expr: simpleAlt(
    sym('number'),
//    sym('cell'),
    seq('add(',  sym('expr'), ',', sym('expr'), ')'),
    seq('sub(',  sym('expr'), ',', sym('expr'), ')'),
    seq('mul(',  sym('expr'), ',', sym('expr'), ')'),
    seq('div(',  sym('expr'), ',', sym('expr'), ')'),
    seq('mod(',  sym('expr'), ',', sym('expr'), ')'),
    seq('sum(',  sym('range'), ')'),
    seq('prod(', sym('range'), ')')
  ),
  
  range: seq(sym('cell'), ':', sym('cell')),
  
  digit: range('0', '9'),
  
  number: seq(
    optional('-'),
    alt(
      plus(sym('digit')),
      seq(repeat(sym('digit')), '.', plus(sym('digit'))))),
  
  cell: seq(sym('col'), sym('row')),
  
  col: alt(sym('az'), sym('AZ')),
  
  az: range('a', 'z'),
  
  AZ: range('A', 'Z'),
  
  row: str(repeat(sym('digit'), 1, 2)),
  
  string: str(repeat(anyChar))
}.addActions({
  az: function(c) { return c.charCodeAt(0) - 'a'.charCodeAt(0); },
  AZ: function(c) { return c.charCodeAt(0) - 'A'.charCodeAt(0); },
});
//});


// https://www.artima.com/pins1ed/the-scells-spreadsheet.html
MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Cell',
  extendsModel: 'foam.ui.View',
  imports: [ 'cells', 'parser' ],
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
      $$src - $$value{mode: 'read-only'}
    */}
  ]
});


MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Cells',
  extendsModel: 'foam.ui.View',
  requires: [
//    'foam.demos.sevenguis.CellParser',
    'foam.demos.sevenguis.Cell'
  ],
  exports: [
    'as cells',
    'parser'
  ],
  constants: {
    ROWS: 10 /* 99 */
  },
  properties: [
    {
      name: 'cells',
      factory: function() { return {}; }
    },
    {
      name: 'parser',
      factory: function() { return /*this.*/CellParser/*.create()*/; }
    }
  ],
  methods: [
    function init() {
      this.SUPER();

      var self = this;
      function t(s) {
        try {
        console.log(s, self.parser.parseString(s));
        } catch (x) {
        }
      }

      t('1');
      t('10');
      t('10.1');
      t('-10.1');
      t('foobar');
    },
    function cell(col, row) {
      var row = this.cells[row] || ( this.cells[row] = {} );
      return row[col] || ( row[col] = this.Cell.create() );
    }
  ],
  templates: [
    function CSS() {/*
      .cells { overflow: auto; }
      .cell { min-width: 60px; }
    */},
    function toHTML() {/*
      <table border class="cells">
        <tr>
          <td></td>
          <% for ( var i = 65 ; i <= 90 ; i++ ) { %>
            <th><%= String.fromCharCode(i) %></th>
          <% } %>
        </tr>
        <% for ( i = 0 ; i <= this.ROWS ; i++ ) { %>
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

// 9-12