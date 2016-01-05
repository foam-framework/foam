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
  cell: function(a) { return function(cs) { return cs.cell(a[0] + a[1]).numValue; }; },
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
          ret.push(cs.cell(c + r).numValue);
      return ret;
    }
  },
  string: function(s) { return function() { return s; }; }
});


// https://www.artima.com/pins1ed/the-scells-spreadsheet.html
MODEL({
  package: 'foam.demos.sevenguisu2',
  name: 'Cells',
  extends: 'foam.u2.Element',

  requires: [ 'foam.u2.tag.Input', 'foam.u2.ElementParser', 'foam.u2.PropertyView' ],
  imports:  [ 'dynamicFn' ],
  exports:  [ 'as cells' ],

  models: [
    {
      name: 'Cell',
      extends: 'foam.u2.ReadWriteView',
      requires: [ 'foam.u2.tag.Input' ],
      imports: [ 'cells' ],
      documentation: function() {/*
        Doesn't build inner views until value is set or user clicks on view.
        This complicates the design but saves memory and startup time.
      */},
      properties: [
        {
          name: 'formula',
          displayWidth: 10
        },
        {
          name: 'value',
          adapt: function(_, v) {
            var ret = parseFloat(v);
            return ret && ! Number.isInteger(ret) ? ret.toFixed(2) : v;
          },
          displayWidth: 12
        },
        {
          name: 'numValue',
          getter: function() { return parseFloat(this.value); }
        }
      ],
      methods: [
        function isLoaded() { return this.value; },
        function listenForLoad() { this.value$.addListener(this.onDataLoad); },
        function toReadE() { return this.E('span').add(this.value$); },
        function toWriteE() {
          this.formula$.addListener(this.onDataLoad);
          var e = this.E('input');
          e.data$ = this.formula$;
          return e;
        }
      ],

      templates: [
        function CSS() {/*
          ^ > span {
            display: block;
            height: 15px;
            padding: 2px;
            width: 100%;
          }
          ^ > input {
            border: none;
            outline: 1px solid blue;
            outline-offset: 0;
            padding-left: 2px;
            width: 100%;
          }
        */},
        function initE(){/*#U2<span class="^"></span>*/}
      ]
    }
  ],
  properties: [
    [ 'rows',    99 ],
    [ 'columns', 26 ],
    {
      name: 'cells',
      factory: function() { return {}; }
    },
    {
      name: 'parser',
      factory: function() { return CellParser; }
    }
  ],
  methods: [
    function init() {
      this.SUPER();

      this.ElementParser.getPrototype();

      // Two sample spreadsheets
      // Spreadsheet taken from Visicalc
// this.loadCells({"A0":"<b><u>Item</u></b>","B0":"<b><u>No.</u></b>","C0":"<b><u>Unit</u></b>","D0":"<b><u>Cost</u></b>","A1":"Muck Rake","B1":"43","C1":"12.95","D1":"=mul(B1,C1)","A2":"Buzz Cut","B2":"15","C2":"6.76","D2":"=mul(B2,C2)","A3":"Toe Toner","B3":"250","C3":"49.95","D3":"=mul(B3,C3)","A4":"Eye Snuff","B4":"2","C4":"4.95","D4":"=mul(B4,C4)","C5":"Subtotal","D5":"=sum(D1:D4)","B6":"9.75","C6":"Tax","D6":"=div(mul(B6,D5),100)","C7":"<b>Total</b>","D7":"=add(D5,D6)"});

      // Spreadsheet to test all functions
//      this.loadCells({"A0":"<b>Formulas</b>","B0":"<b>Values</b>","A1":" 1","B1":"1","A2":" 10","B2":"10","A3":" 10.12","B3":"10.12","A4":" -10.1","B4":"-10.1","A5":" foobar","B5":"foobar","A6":" =add(1,2)","B6":"=add(1,2)","A7":" =sub(2,1)","B7":"=sub(2,1)","A8":" =mul(2,3)","B8":"=mul(2,3)","A9":" =div(9,3)","B9":"=div(9,3)","A10":" =mod(8,3)","B10":"=mod(8,3)","A11":" =add(mul(2,3),div(3,2))","B11":"=add(mul(2,3),div(3,2))","A12":" =A1","B12":"=A1","A13":" =add(A1,B1)","B13":"=add(A1,B1)","A14":" =sum(1,2,3,4,5)","B14":"=sum(1,2,3,4,5)","A15":" =sum(B6:B10)","B15":"=sum(B6:B10)","A16":" =prod(B6:B10)","B16":"=prod(B6:B10)"});

this.loadCells({"A0":"<div style=\"width:200px;\"><b><u>Benchmark</u></b></div>","B0":"<b><u>IndexedDB</u></b>","C0":"<b><u>DAO</u></b>","A1":"Create Albums","B1":"190","C1":"366","A2":"Create Photos","B2":"2772","C2":"2492","A3":"Select All Albums","B3":"168","C3":"1.93","A4":"Select All Photos","B4":"1361","C4":"3.86","B5":"1.43","C5":"0.06","B6":"1.56","C6":"0.63","B7":"10.28","C7":"1.12","D0":"<b><u>Speedup</u></b>","D1":"=div(B1,C1)","D2":"=div(B2,C2)","D3":"=div(B3,C3)","D4":"=div(B4,C4)","A5":"Single Key Query","D5":"=div(B5,C5)","A6":"Multi-Key Query","D6":"=div(B6,C6)","A7":"Multi-Key Query","D7":"=div(B7,C7)","A8":"Multi-Key Query","B8":"102","C8":"12.24","D8":"=div(B8,C8)","A9":"Multi-Key Query","B9":"561","C9":"15.24","D9":"=div(B9,C9)","A10":"Indexed Field Query","B10":"4.63","C10":"0.46","D10":"=div(B10,C10)","A11":"Ad-Hoc Query","B11":"658","C11":"9.91","D11":"=div(B11,C11)","A12":"Simple Inner-Join","B12":"721","C12":"9.55","D12":"=div(B12,C12)","A13":"Inner-Join Aggregation","B13":"647","C13":"38.56","D13":"=div(B13,C13)","A14":"Order-By","B14":"59","C14":"0.55","D14":"=div(B14,C14)","A15":"Order and Group By","B15":"1232","C15":"3.63","D15":"=div(B15,C15)","A16":"<b>Average:</b>","B16":"=SUM(B1:B15)","C16":"=SUM(C1:C15)","D16":"=div(B14,C14)"});
    },
    function loadCells(map) {
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
    function cellName(c, r) { return String.fromCharCode(65 + c) + r; },
    function cell(name) {
      var self = this;
      var cell = this.cells[name];
      var cancel = null;
      if ( ! cell ) {
        cell = this.cells[name] = this.Cell.create();
        cell.formula$.addListener(function(_, __, ___, formula) {
          var f = self.parser.parseString(formula);
          cancel && cancel.destroy();
          cancel = self.dynamicFn(f.bind(null, self), function(v) {
            cell.value = v;
          });
        });
      }
      return cell;
    }
  ],
  templates: [
    function CSS() {/*
      ^ tr, ^ td, ^ th, ^ input {
        color: #333;
        font: 13px roboto, arial, sans-serif;
      }
      ^ tr { height: 26px; }
      ^cell { min-width: 102px; }
      ^, ^ th, ^ td { border: 1px solid #ccc; }
      ^ td { height: 100%; }
      ^ th, ^ td {
        border-right: none;
        border-bottom: none;
      }
      ^ th {
        background: #eee;
        color: #333;
        padding: 2px 18px;
      }
      ^ {
        border-left: none;
        border-top: none;
        overflow: auto;
      }
    */},
    function initE() {/*#U2
      <table class="^" cellspacing="0">
        <tr>
          <th></th>
          <th repeat="j in 0 .. this.columns-1">{{String.fromCharCode(65 + j)}}</th>
        </tr>
        <tr repeat="i in 0 .. this.rows-1">
          <th>{{i}}</th>
          <td class="^cell" repeat="j in 0 .. this.columns-1">{{this.cell(this.cellName(j, i))}}</td>
        </tr>
      </table>
    */}
  ]
});
