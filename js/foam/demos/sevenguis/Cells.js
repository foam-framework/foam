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

  START: alt(
    sym('number'),
    sym('formula'),
    sym('string')
  ),
  
  formula: seq1(1, '=', sym('expr')),
  
  expr: alt(
    sym('number'),
    sym('cell'),
    sym('add'),
    sym('sub'),
    sym('mul'),
    sym('div'),
    sym('mod'),
    seq('sum(',  sym('range'), ')'),
    seq('prod(', sym('range'), ')')
  ),
  
  add: seq(literal_ic('add('), sym('expr'), ',', sym('expr'), ')'),
  sub: seq(literal_ic('sub('), sym('expr'), ',', sym('expr'), ')'),
  mul: seq(literal_ic('mul('), sym('expr'), ',', sym('expr'), ')'),
  div: seq(literal_ic('div('), sym('expr'), ',', sym('expr'), ')'),
  mod: seq(literal_ic('mod('), sym('expr'), ',', sym('expr'), ')'),

  range: seq(sym('cell'), ':', sym('cell')),
  
  digit: range('0', '9'),
  
  number: str(seq(
    optional('-'),
    str(alt(
      seq(str(repeat(sym('digit'))), '.', str(plus(sym('digit')))),
      plus(sym('digit')))))),
  
  cell: seq(sym('col'), sym('row')),
  
  col: alt(sym('az'), sym('AZ')),
  
  az: range('a', 'z'),
  
  AZ: range('A', 'Z'),
  
  row: str(repeat(sym('digit'), null, 1, 2)),
  
  string: str(repeat(anyChar))
}.addActions({
  add: function(a) { return function(cs) { return a[1](cs) + a[3](cs); }; },
  sub: function(a) { return function(cs) { return a[1](cs) - a[3](cs); }; },
  mul: function(a) { return function(cs) { return a[1](cs) * a[3](cs); }; },
  div: function(a) { return function(cs) { return a[1](cs) / a[3](cs); }; },
  mod: function(a) { return function(cs) { return a[1](cs) % a[3](cs); }; },
  az:  function(c) { return c.charCodeAt(0) - 'a'.charCodeAt(0); },
  AZ:  function(c) { return c.charCodeAt(0) - 'A'.charCodeAt(0); },
  row: function(c) { return parseInt(c); },
  number: function(s) { var f = parseFloat(s); return function() { return f; }; },
  cell: function(a) { return function(cells) { return cells.cell(a[1], a[0]).value; }; },
  string: function(s) { return function() { return s; }; }
});
//});


// https://www.artima.com/pins1ed/the-scells-spreadsheet.html
MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Cell',
  extendsModel: 'foam.ui.View',
  imports: [ 'cells' ],
  properties: [
    {
      name: 'formula',
      displayWidth: 12
    },
    {
      name: 'value',
      defaultValue: '&nbsp;',
      displayWidth: 12
    }
  ],
  methods: [
    function initHTML() {
      this.SUPER();

      this.valueView.$.addEventListener('click',  this.onClick);
      this.formulaView.$.addEventListener('blur', this.onBlur);
    }
  ],
  listeners: [
    {
      name: 'onClick',
      code: function() {
        DOM.setClass(this.$, 'formula', true);
        this.formulaView.$.focus();
      }
    },
    {
      name: 'onBlur',
      code: function() {
        DOM.setClass(this.$, 'formula', false);
      }
    }
  ],
  templates: [
    function CSS() {/*
      .cellView > span {
        width: 100%;
        display: block;
      }
      .cellView > input {
        display: none;
      }
      .cellView.formula > input {
        display: inherit;
        border: 1px blue solid;
      }
      .cellView.formula > span {
        display: none;
      }
    */},
    function toHTML() {/*
      <div id="%%id" class="cellView">$$formula $$value{mode: 'read-only', escapeHTML: false}</div>
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
  imports: [ 'dynamic' ],
  exports: [ 'as cells' ],
  constants: {
    ROWS: 20 /* 99 */
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

      // Load a Test Spreadsheet
      var row = 1;
      var self = this;
      function t(s) {
        try {
          var r = row++;
          self.cell(r, 0).formula = ' ' + s;
          self.cell(r, 1).formula = s;
        } catch (x) {
        }
      }

      t('1');
      t('10');
      t('10.12');
      t('-10.1');
      t('foobar');
      t('=add(1,2)');
      t('=sub(2,1)');
      t('=mul(2,3)');
      t('=div(9,3)');
      t('=mod(8,3)');
      t('=add(mul(2,3),div(3,2))');
      t('=A1');
      t('=add(A1,B1)');
    },
    function cell(r, c) {
      var self = this;
      var row  = this.cells[r] || ( this.cells[r] = {} );
      var cell = row[c];
      if ( ! cell ) {
        cell = row[c] = this.Cell.create();
        cell.formula$.addListener(function(_, _, _, formula) {
//          console.log('formula: ', r, c, formula);
          var f = self.parser.parseString(formula);
          self.dynamic(f.bind(null, self), function(v) {
            cell.value = v;
//            console.log('v:', v);
          });
        });
      }
      return cell;
    }
  ],
  templates: [
    function CSS() {/*
      .cells { overflow: auto; }
      .cell { min-width: 60px;}
    */},
    function toHTML() {/*
      <table border cellspacing="0" class="cells">
        <tr>
          <td></td>
          <% for ( var i = 65 ; i <= 90 ; i++ ) { %>
            <th><%= String.fromCharCode(i) %></th>
          <% } %>
        </tr>
        <% for ( i = 0 ; i <= this.ROWS ; i++ ) { %>
          <tr>
            <th><%= i %></th>
            <% for ( var j = 0 ; j <= 25 ; j++ ) { %>
              <td class="cell"><%= this.cell(i, j) %></td>
            <% } %>
          </tr>
        <% } %>
      </table>
    */}
  ]
});
