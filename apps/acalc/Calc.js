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

if ( ! 'log10' in Math ) Math.log10 = function(a) { return Math.log(a) / Math.LN10; };

function gamma(z) {
  return Math.sqrt(2 * Math.PI / z) * Math.pow((1 / Math.E) * (z + 1 / (12 * z - 1 / (10 * z))), z);
}

function createTranslatedAction(action, opt_longName) {
  if ( opt_longName ) action.translationHint =
      'short form for mathematical function: "' + opt_longName + '"';
  return Action.create(action);
}

MODEL({
  name: 'BinaryOp',
  extendsModel: 'Action',
  properties: [
    'f',
    { name: 'longName', defaultValueFn: function() { return this.name; } },
    {
      name: 'translationHint',
      defaultValueFn: function() { return this.longName ? 'short form for mathematical function: "' + this.longName + '"' : '' ;}
    },
    [ 'code', function(_, action) {
      if ( this.a2 == '' ) {
        // the previous operation should be replaced, since we can't
        // finish this one without a second arg. The user probably hit one
        // binay op, followed by another.
        this.replace(action.f);
      } else {
        if ( this.op != DEFAULT_OP ) this.equals();
        this.push('', action.f);
        this.editable = true;
      }
    }]
  ],
  methods: [
    function init() {
      this.SUPER();
      this.f.label = '<span aria-label="' + this.speechLabel + '">' + this.label + '</span>';
      this.f.binary = true;
    }
  ]
});


MODEL({
  name: 'UnaryOp',
  extendsModel: 'Action',
  properties: [
    'f',
    { name: 'longName', defaultValueFn: function() { return this.name; } },
    {
      name: 'translationHint',
      defaultValueFn: function() { return this.longName ? 'short form for mathematical function: "' + this.longName + '"' : '' ;}
    },
    [ 'code', function(_, action) {
      this.op = action.f;
      this.push(action.f.call(this, this.a2));
      this.editable = false;
    }]
  ],
  methods: [
    function init() {
      this.SUPER();
      this.f.label = '<span aria-label="' + this.speechLabel + '">' + this.label + '</span>';
      this.f.unary = true;
    }
  ]
});


/** Make a 0-9 Number Action. **/
MODEL({
  name: 'Num',
  extendsModel: 'Action',
  properties: [
    'n',
    { name: 'name', defaultValueFn: function() { return this.n.toString(); } },
    { name: 'keyboardShortcuts', factory: null, defaultValueFn: function() { return [ this.n + '' ]; } },
    [ 'code', function(_, action) {
      var n = action.n;
      if ( ! this.editable ) {
        this.push(n);
        this.editable = true;
      } else {
        if ( this.a2 == '0' && ! n ) return;
        if ( this.a2.length >= 18 ) return;
        this.a2 = this.a2 == '0' ? n : this.a2.toString() + n;
      }
    }]
  ]
});

var DEFAULT_OP = function(a1, a2) { return a2; };
DEFAULT_OP.label = '';
DEFAULT_OP.toString = function() { return ''; };


CLASS({
  name: 'Calc',
  translationHint: 'Calculator',

  requires: [
    'foam.apps.calc.CalcView',
    'foam.apps.calc.History',
    'foam.apps.calc.NumberFormatter',
    'foam.graphics.ActionButtonCView',
    'foam.graphics.CViewView',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.ui.animated.Label',
    'foam.ui.md.Flare',
    'foam.ui.DAOListView',
    'AbstractDAO'
  ],

  exports: [
    'gestureManager',
    'touchManager'
  ],

  constants: {
    MAX_HISTORY: 30
  },

  messages: [
    {
      name: 'CalcName',
      value: 'Calculator',
      translationHint: 'name of application for performing simple calculations'
    }
  ],

  properties: [
    {
      name: 'numberFormatter',
      factory: function() { return this.NumberFormatter.create(); }
    },
    { name: 'degreesMode', defaultValue: false },
    { name: 'memory', defaultValue: 0 },
    { name: 'a1', defaultValue: 0 },
    { name: 'a2', defaultValue: '' },
    { name: 'editable', defaultValue: true },
    {
      name: 'op',
      defaultValue: DEFAULT_OP
    },
    {
      model_: 'ArrayProperty',
      name: 'history',
      view: 'foam.ui.DAOListView',
      factory: function() { return [].sink; }
    },
    {
      model_: 'StringProperty',
      name: 'row1',
      view: 'foam.ui.animated.Label'
    },
    {
      name: 'touchManager',
      factory: function() {
        // TODO(braden): HACK This should be just exporting the property, but
        // the context is not properly passed into views created using <foam>
        // tags right now. Clean up this and gestureManager below.
        var tm = this.TouchManager.create();
        window.X.touchManager = tm;
        return tm;
      }
    },
    {
      name: 'gestureManager',
      factory: function() {
        var gm = this.GestureManager.create();
        window.X.gestureManager = gm;
        return gm;
      }
    }
  ],

  methods: {
    factorial: function(n) {
      if ( n > 170 ) {
        this.error();
        return 1/0;
      }
      n = parseFloat(n);
      if ( ! Number.isInteger(n) ) return gamma(n+1);
      var r = 1;
      while ( n > 0 ) r *= n--;
      return r;
    },
    permutation: function(n, r) { return this.factorial(n) / this.factorial(n-r); },
    combination: function(n, r) { return this.permutation(n, r) / this.factorial(r); },
    error: function() {
      // TODO(kgr): Move to CalcView
      if ( this.X.$$('calc-display')[0] ) setTimeout(this.Flare.create({
        element: this.X.$$('calc-display')[0],
        color: '#f44336' /* red */
      }).fire, 100);
      this.history.put(this.History.create(this));
      this.a1   = 0;
      this.a2   = '';
      this.op   = DEFAULT_OP;
      this.row1 = '';
      this.editable = true;
    },
    init: function() {
      this.SUPER();

      Events.dynamic(function() { this.op; this.a2; }.bind(this), EventService.framed(function() {
        if ( Number.isNaN(this.a2) ) this.error();
        var a2 = this.numberFormatter.formatNumber(this.a2);
        this.row1 = this.op.label + ( a2 !== '' ? '&nbsp;' + a2 : '' );
      }.bind(this)));
    },
    push: function(a2, opt_op) {
      if ( a2 != this.a2 ||
           ( opt_op || DEFAULT_OP ) != this.op )
        this.row1 = '';
      this.history.put(this.History.create(this));
      while ( this.history.length > this.MAX_HISTORY ) this.history.shift();
      this.a1 = this.a2;
      this.op = opt_op || DEFAULT_OP;
      this.a2 = a2;
    },
    replace: function(op) {
      this.op = op || DEFAULT_OP;
    }
  },

  actions: [
    { model_: 'Num', n: 1 },
    { model_: 'Num', n: 2 },
    { model_: 'Num', n: 3 },
    { model_: 'Num', n: 4 },
    { model_: 'Num', n: 5 },
    { model_: 'Num', n: 6 },
    { model_: 'Num', n: 7 },
    { model_: 'Num', n: 8 },
    { model_: 'Num', n: 9 },
    { model_: 'Num', n: 0 },
    {
      model_: "BinaryOp",
      name: "div",
      label: "÷",
      speechLabel: "divide",
      keyboardShortcuts: [ "/" ],
      f: function (a1, a2) { return a1 / a2; }
    },
    {
      model_: "BinaryOp",
      name: "mult",
      label: "×",
      speechLabel: "multiply",
      keyboardShortcuts: [ "*" ],
      f: function (a1, a2) { return a1 * a2; }
    },
    {
      model_: "BinaryOp",
      name: "plus",
      label: "+",
      speechLabel: "plus",
      keyboardShortcuts: [ "+" ],
      f: function (a1, a2) { return a1 + a2; }
    },
    {
      model_: "BinaryOp",
      name: "minus",
      label: "–",
      speechLabel: "minus",
      keyboardShortcuts: [ "-" ],
      f: function (a1, a2) { return a1 - a2; }
    },
    {
      name: 'ac',
      label: 'AC',
      speechLabel: 'all clear',
      translationHint: 'all clear (calculator button label)',
      // help: 'All Clear.',

      keyboardShortcuts: [ 'a', 'c' ],
      code: function() {
        this.row1     = '';
        this.a1       = '0';
        this.a2       = '';
        this.editable = true;
        this.op       = DEFAULT_OP;
        this.history = [].sink;
        // TODO(kgr): Move to CalcView
        if ( this.X.$$('calc-display')[0] ) {
          var now = Date.now();
          if ( this.lastFlare_ && now-this.lastFlare_ < 1000 ) return;
          this.lastFlare_ = now;
          this.Flare.create({
            element: this.X.$$('calc-display')[0],
            color: '#2196F3' /* blue */
          }).fire();
          this.X.window.getSelection().removeAllRanges();
        }
      }
    },
    {
      name: 'sign',
      label: '+/-',
      speechLabel: 'negate',
      keyboardShortcuts: [ 'n' ],
      translationHint: 'switch positive/negative sign of number',
      code: function() { this.a2 = - this.a2; }
    },
    {
      name: 'point',
      labelFn: function() { return this.numberFormatter.useComma ? ',' : '.'; },
      speechLabel: 'point',
      keyboardShortcuts: [ '.', ',' ],
      translationHint: 'decimal point',
      code: function() {
        if ( ! this.editable ) {
          this.push('0.');
          this.editable = true;
        } else if ( this.a2.toString().indexOf('.') == -1 ) {
          this.a2 = (this.a2 ? this.a2 : '0') + '.';
          this.editable = true;
        }
      }
    },
    {
      name: 'equals',
      label: '=',
      speechLabel: 'equals',
      keyboardShortcuts: [ '=', 13 /* <enter> */ ],
      translationHint: 'compute operation and display result',
      code: function() {
        if ( typeof(this.a2) === 'string' && this.a2 == '' ) return; // do nothing if the user hits '=' prematurely
        if ( this.op == DEFAULT_OP ) {
          var last = this.history[this.history.length-1];
          if ( ! last || last.op === DEFAULT_OP ) return;
          if ( last.op.binary ) {
            this.push(this.a2);
            this.a2 = last.a2;
          } else {
            this.a1 = this.a2;
          }
          this.op = last.op;
        }
        this.push(this.op(parseFloat(this.a1), parseFloat(this.a2)));
        this.editable = false;
      }
    },
    {
      name: 'backspace',
      label: '⌫',
      speechLabel: 'backspace',
      translationHint: 'delete one input character',
      keyboardShortcuts: [ 8 /* backspace */ ],
      code: function() {
        // This block will make backspace act like all-clear if the user has done a ctrl-A
        // to select all of the text.
        var selection = this.X.window.getSelection().toString();
        if ( selection && selection.split('\n').length == this.history.length + 1 ) {
          this.ac();
          return;
        }

        if ( ! this.editable ) return;

        if ( this.a2.toString().length ) {
          this.a2 = this.a2.toString().substring(0, this.a2.length-1);
        } else {
          this.op = DEFAULT_OP;
        }
      }
    },
    {
      name: 'pi',
      label: 'π',
      keyboardShortcuts: [ 'p' ],
      translationHint: 'mathematical constant, pi',
      code: function() { this.a2 = Math.PI; }
    },
    {
      name: 'e',
      label: 'e',
      keyboardShortcuts: [ 'e' ],
      translationHint: 'mathematical constant, e',
      code: function() { this.a2 = Math.E; }
    },
    {
      name: 'percent',
      label: '%',
      speechLabel: 'percent',
      keyboardShortcuts: [ '%' ],
      translationHint: 'convert number to percentage',
      code: function() { this.a2 /= 100.0; }
    },
    {
      model_: "UnaryOp",
      name: "inv",
      label: "1/x",
      speechLabel: "inverse",
      keyboardShortcuts: [ "i" ],
      f: function (a) { return 1.0/a; }
    },
    {
      model_: "UnaryOp",
      name: "sqroot",
      label: "√",
      speechLabel: "square root",
      f: function sqrt(a) { return Math.sqrt(a); }
    },
    {
      model_: "UnaryOp",
      name: "square",
      label: "x²",
      speechLabel: "x squared",
      keyboardShortcuts: [ "@" ],
      f: function (a) { return a*a; }
    },
    {
      model_: "UnaryOp",
      name: "ln",
      label: "ln",
      speechLabel: "natural logarithm",
      f: function log(a) { return Math.log(a); }
    },
    {
      model_: "UnaryOp",
      name: "exp",
      label: "eⁿ",
      speechLabel: "e to the power of n",
      f: function exp(a) { return Math.exp(a); }
    },
    {
      model_: "UnaryOp",
      name: "log",
      label: "log",
      speechLabel: "log base 10",
      f: function (a) { return Math.log(a) / Math.LN10; }
    },
    {
      model_: "BinaryOp",
      name: "root",
      label: "ⁿ √Y",
      speechLabel: "the enth root of y",
      f: function (a1, a2) { return Math.pow(a2, 1/a1); }
    },
    {
      model_: "BinaryOp",
      name: "pow",
      label: "yⁿ",
      speechLabel: "y to the power of n",
      keyboardShortcuts: [ "^" ],
      f: function pow(a1, a2) { return Math.pow(a1, a2); }
    },
    {
      model_: "UnaryOp",
      name: "sin",
      label: "sin",
      speechLabel: "sine",
      f: function (a) { return Math.sin(this.degreesMode ? a * Math.PI / 180 : a) }
    },
    {
      model_: "UnaryOp",
      name: "cos",
      label: "cos",
      speechLabel: "cosine",
      f: function (a) { return Math.cos(this.degreesMode ? a * Math.PI / 180 : a) }
    },
    {
      model_: "UnaryOp",
      name: "tan",
      label: "tan",
      speechLabel: "tangent",
      f: function (a) { return Math.cos(this.degreesMode ? a * Math.PI / 180 : a) }
    },
    {
      name: 'deg',
      speechLabel: 'switch to degrees',
      keyboardShortcuts: [],
      translationHint: 'short form for "degrees" calculator mode',
      code: function() { this.degreesMode = true; }
    },
    {
      name: 'rad',
      speechLabel: 'switch to radians',
      keyboardShortcuts: [],
      translationHint: 'short form for "radians" calculator mode',
      code: function() { this.degreesMode = false; }
    },
    {
      model_: "UnaryOp",
      name: "asin",
      label: "asin",
      speechLabel: "arcsine",
      f: function (a) { return Math.asin(a) * ( this.degreesMode ? 180 / Math.PI : 1); }
    },
    {
      model_: "UnaryOp",
      name: "acos",
      label: "acos",
      speechLabel: "arccosine",
      f: function (a) { return Math.acos(a) * ( this.degreesMode ? 180 / Math.PI : 1); }
    },
    {
      model_: "UnaryOp",
      name: "atan",
      label: "atan",
      speechLabel: "arctangent",
      f: function (a) { return Math.atan(a) * ( this.degreesMode ? 180 / Math.PI : 1); }
    },
    {
      model_: "UnaryOp",
      name: "fact",
      label: "x!",
      speechLabel: "factorial",
      keyboardShortcuts: [ "!" ],
      f: function (n) { return this.factorial(n); }
    },
    {
      model_: "BinaryOp",
      name: "mod",
      label: "mod",
      speechLabel: "modulo",
      f: function (a1, a2) { return a1 % a2; }
    },
    {
      model_: "BinaryOp",
      name: "p",
      label: "nPr",
      speechLabel: "permutation",
      f: function (n,r) { return this.permutation(n,r); }
    },
    {
      model_: "BinaryOp",
      name: "c",
      label: "nCr",
      speechLabel: "combination",
      f: function (n,r) { return this.combination(n,r); }
    },
    {
      model_: "UnaryOp",
      name: "round",
      label: "rnd",
      speechLabel: "round",
      f: function round(a) { return Math.round(a); }
    },
    {
      name: 'rand',
      label: 'rand',
      speechLabel: 'random',
      translationHint: 'generate random number',
      code: function() { this.a2 = Math.random(); }
    },
    {
      model_: "UnaryOp",
      name: "store",
      label: "a=",
      speechLabel: "store in memory",
      f: function (n) { this.memory = n; return n; }
    },
    {
      name: 'fetch',
      label: 'a',
      speechLabel: 'fetch from memory',
      keyboardShortcuts: [],
      translationHint: 'load memorized number',
      code: function() { this.a2 = this.memory; }
    }
  ]
});
