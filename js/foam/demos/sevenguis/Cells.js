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

// TODO: Create a Range Model?
/*
MODEL({
  package: 'foam.demos.sevenguis',
  name: 'CellParser',
  extendsModel: 'foam.parse.Grammar',

  methods: {
*/

var CellParser = {
  __proto__: grammar,

  START: alt(sym('number'), sym('formula'), sym('string')),

  formula: seq1(1, '=', sym('expr')),

  expr: alt(
    sym('number'),
    sym('cell'),
    sym('add'),
    sym('sub'),
    sym('mul'),
    sym('div'),
    sym('mod'),
    sym('sum'),
    sym('prod')
  ),

  add:  seq(literal_ic('add('),  sym('expr'), ',', sym('expr'), ')'),
  sub:  seq(literal_ic('sub('),  sym('expr'), ',', sym('expr'), ')'),
  mul:  seq(literal_ic('mul('),  sym('expr'), ',', sym('expr'), ')'),
  div:  seq(literal_ic('div('),  sym('expr'), ',', sym('expr'), ')'),
  mod:  seq(literal_ic('mod('),  sym('expr'), ',', sym('expr'), ')'),
  sum:  seq(literal_ic('sum('),  sym('vargs'), ')'),
  prod: seq(literal_ic('prod('), sym('vargs'), ')'),

  vargs: repeat(alt(sym('range'), sym('expr')), ','),

  range: seq(sym('col'), sym('row'), ':', sym('col'), sym('row')),

  number: str(seq(
    optional('-'),
    str(alt(
      seq(str(repeat(sym('digit'))), '.', str(plus(sym('digit')))),
      plus(sym('digit')))))),

  cell: seq(sym('col'), sym('row')),

  col: alt(sym('az'), sym('AZ')),

  digit: range('0', '9'),

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
  sum: function(a) { return function(cs) {
    var arr = a[1](cs), sum = 0;
    for ( var i = 0 ; i < arr.length ; i++ ) sum += arr[i];
    return sum;
  }; },
  prod: function(a) { return function(cs) {
    var arr = a[1](cs), prod = 1;
    for ( var i = 0 ; i < arr.length ; i++ ) prod *= arr[i];
    return prod;
  }; },
  az:  function(c) { return c.charCodeAt(0) - 'a'.charCodeAt(0); },
  AZ:  function(c) { return c.charCodeAt(0) - 'A'.charCodeAt(0); },
  row: function(c) { return parseInt(c); },
  number: function(s) { var f = parseFloat(s); return function() { return f; }; },
  cell: function(a) { return function(cs) { return cs.cell(a[1], a[0]).value; }; },
  vargs: function(a) {
    return function(cs) {
      var ret = [];
      for ( var i = 0 ; i < a.length ; i++ ) {
        var r = a[i](cs);
        if ( Array.isArray(r) )
          ret.pushAll(r);
        else
          ret.push(r);
      }
      return ret;
    }
  },
  range: function(a) {
    var c1 = a[0], r1 = a[1], c2 = a[3], r2 = a[4];
    return function(cs) {
      var ret = [];
      for ( var c = c1 ; c <= c2; c++ )
        for ( var r = r1 ; r <= r2 ; r++ )
          ret.push(cs.cell(r, c).value);
      return ret;
    }
  },
  string: function(s) { return function() { return s; }; }
});
//});


// https://www.artima.com/pins1ed/the-scells-spreadsheet.html
MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Cell',
  extendsModel: 'foam.ui.View',
  requires: [ 'foam.ui.TextFieldView' ],
  imports: [ 'cells' ],
  properties: [
    {
      name: 'formula',
      displayWidth: 10
    },
    {
      name: 'value',
      adapt: function(_, v) { var ret = parseFloat(v); return isNaN(ret) ? v : ret; },
      displayWidth: 12
    }
  ],
  methods: [
    function initHTML() {
      this.SUPER();

      this.valueView.$.addEventListener('click',  this.onClick);
      this.formulaView.$.addEventListener('blur', this.onBlur);
      this.formula$.addListener(this.onBlur);
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
        display: block;
        height: 15px;
        padding: 2px;
        width: 100%;
      }
      .cellView > input {
        border:  none;
        display: none;
        margin-left: 2px;
        outline: none;
      }
      .cellView {
        outline: 1px solid white;
      }
      .cellView.formula {
        outline: 1px solid blue;
      }
      .cellView.formula > input {
        display: inherit;
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
  requires: [ 'foam.demos.sevenguis.Cell' ],
  imports:  [ 'dynamic' ],
  exports:  [ 'as cells' ],
  properties: [
    {
      name: 'rows',
      defaultValue: 99
    },
    {
      name: 'columns',
      defaultValue: 26
    },
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

      this.cell(0,0).formula = '<b>Formulas</b>';
      this.cell(0,1).formula = '<b>Values</b>';

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
      t('=sum(1,2,3,4,5)');
      t('=sum(B6:B10)');
      t('=prod(B6:B10)');
    },
    function cell(r, c) {
      var self = this;
      var row  = this.cells[r] || ( this.cells[r] = {} );
      var cell = row[c];
      if ( ! cell ) {
        cell = row[c] = this.Cell.create();
        cell.formula$.addListener(function(_, _, _, formula) {
          var f = self.parser.parseString(formula);
          self.dynamic(f.bind(null, self), function(v) {
            cell.value = v;
          });
        });
      }
      return cell;
    }
  ],
  templates: [
    function CSS() {/*
      .cells tr, .cells td, .cells th, .cells input {
        color: #333;
        font: 13px roboto, arial, sans-serif;
      }
      .cells tr { height: 26px; }
      .cells { overflow: auto; }
      .cell { min-width: 102px; }
      table.cells, .cells th, .cells td {
        border: 1px solid #ccc;
      }
      .cells th, .cells td {
        border-right: none;
        border-bottom: none;
      }
      table.cells {
        border-left: none;
        border-top: none;
      }
      .cells td {
        height: 100%;
      }
      .cells th {
        background: #eee;
        color: #333;
        padding: 2px 18px;
      }
    */},
    function toHTML() {/*
      <table cellspacing="0" class="cells">
        <tr>
          <th></th>
          <% debugger; for ( var j = 0 ; j < this.columns ; j++ ) { %>
            <th class="colHeader"><%= String.fromCharCode(65 + j) %></th>
          <% } %>
        </tr>
        <% for ( i = 0 ; i <= this.rows ; i++ ) { %>
          <tr>
            <th class="rowHeader"><%= i %></th>
            <% for ( var j = 0 ; j < this.columns ; j++ ) { %>
              <td class="cell"><%= this.cell(i, j) %></td>
            <% } %>
          </tr>
        <% } %>
      </table>
    */}
  ]
});
