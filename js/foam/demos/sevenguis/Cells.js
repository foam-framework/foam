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
  az:  function(c) { return c.toUpperCase(); },
  //AZ:  function(c) { return c.charCodeAt(0) - 'A'.charCodeAt(0); },
  row: function(c) { return parseInt(c); },
  number: function(s) { var f = parseFloat(s); return function() { return f; }; },
  cell: function(a) { return function(cs) { return cs.cell(a[0] + a[1]).value; }; },
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
          ret.push(cs.cell(c + r).value);
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
      adapt: function(_, v) { var ret = parseFloat(v); return ret && ! Number.isInteger(ret) ? ret.toFixed(2) : v; },
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

window.cells = this;

this.load({"A0":"<b><u>Item</u></b>","B0":"<b><u>No.</u></b>","C0":"<b><u>Unit</u></b>","D0":"<b><u>Cost</u></b>","A1":"Muck Rake","B1":"43","C1":"12.95","D1":"=mul(B1,C1)","A2":"Buzz Cut","B2":"15","C2":"6.76","D2":"=mul(B2,C2)","A3":"Toe Toner","B3":"250","C3":"49.95","D3":"=mul(B3,C3)","A4":"Eye Snuff","B4":"2","C4":"4.95","D4":"=mul(B4,C4)","C5":"Subtotal","D5":"=sum(D1:D4)","B6":"9.75","C6":"Tax","D6":"=div(mul(B6,D5),100)","C7":"<b>Total</b>","D7":"=add(D5,D6)"});

//      this.load({"A0":"<b>Formulas</b>","B0":"<b>Values</b>","A1":" 1","B1":"1","A2":" 10","B2":"10","A3":" 10.12","B3":"10.12","A4":" -10.1","B4":"-10.1","A5":" foobar","B5":"foobar","A6":" =add(1,2)","B6":"=add(1,2)","A7":" =sub(2,1)","B7":"=sub(2,1)","A8":" =mul(2,3)","B8":"=mul(2,3)","A9":" =div(9,3)","B9":"=div(9,3)","A10":" =mod(8,3)","B10":"=mod(8,3)","A11":" =add(mul(2,3),div(3,2))","B11":"=add(mul(2,3),div(3,2))","A12":" =A1","B12":"=A1","A13":" =add(A1,B1)","B13":"=add(A1,B1)","A14":" =sum(1,2,3,4,5)","B14":"=sum(1,2,3,4,5)","A15":" =sum(B6:B10)","B15":"=sum(B6:B10)","A16":" =prod(B6:B10)","B16":"=prod(B6:B10)"});
    },
    function load(map) {
      for ( var key in map ) this.cell(key).formula = String(map[key]);
    },
    function save() {
      var map = {};
      for ( var key in this.cells ) {
        var cell = this.cells[key];
        if ( cell.formula !== '' ) map[key] = cell.formula;
      }
      return map;
    },
    function cellName(c, r) {
      return String.fromCharCode(65 + c) + r;
    },
    function cell(name) {
      var self = this;
      var cell = this.cells[name];
      if ( ! cell ) {
        cell = this.cells[name] = this.Cell.create();
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
          <% for ( var j = 0 ; j < this.columns ; j++ ) { %>
            <th class="colHeader"><%= String.fromCharCode(65 + j) %></th>
          <% } %>
        </tr>
        <% for ( i = 0 ; i <= this.rows ; i++ ) { %>
          <tr>
            <th class="rowHeader"><%= i %></th>
            <% for ( var j = 0 ; j < this.columns ; j++ ) { %>
              <td class="cell"><%= this.cell(this.cellName(j, i)) %></td>
            <% } %>
          </tr>
        <% } %>
      </table>
    */}
  ]
});
