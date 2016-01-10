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
  package: 'foam.apps.calc',
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
    MAX_HISTORY: 30,
    DEFAULT_OP: function(a1, a2) { return a2; }
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
    'degreesMode',
    [ 'memory', 0 ],
    [ 'a1', 0 ],
    [ 'a2', '' ],
    [ 'editable', true ],
    { name: 'op', factory: function() { return this.DEFAULT_OP } },
    {
      type: 'Array',
      name: 'history',
      view: 'foam.ui.DAOListView',
      factory: function() { return [].sink; }
    },
    {
      type: 'String',
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

  methods: [
    function init() {
      this.SUPER();

      this.DEFAULT_OP.label = '';

      if ( ! 'log10' in Math ) Math.log10 = function(a) { return Math.log(a) / Math.LN10; };

      Events.dynamicFn(function() { this.op; this.a2; }.bind(this), EventService.framed(function() {
        if ( Number.isNaN(this.a2) ) this.error();
        var a2 = this.numberFormatter.formatNumber(this.a2);
        this.row1 = this.op.label + ( a2 !== '' ? '&nbsp;' + a2 : '' );
      }.bind(this)));
    },
    function gamma(z) {
      return Math.sqrt(2 * Math.PI / z) * Math.pow((1 / Math.E) * (z + 1 / (12 * z - 1 / (10 * z))), z);
    },
    function factorial(n) {
      if ( n > 170 ) {
        this.error();
        return 1/0;
      }
      n = parseFloat(n);
      if ( ! Number.isInteger(n) ) return this.gamma(n+1);
      var r = 1;
      while ( n > 0 ) r *= n--;
      return r;
    },
    function permutation(n, r) { return this.factorial(n) / this.factorial(n-r); },
    function combination(n, r) { return this.permutation(n, r) / this.factorial(r); },
    function error() {
      // TODO(kgr): Move to CalcView
      if ( this.X.$$('calc-display')[0] ) setTimeout(this.Flare.create({
        element: this.X.$$('calc-display')[0],
        color: '#f44336' /* red */
      }).fire, 100);
      this.history.put(this.History.create(this));
      this.a1   = 0;
      this.a2   = '';
      this.op   = this.DEFAULT_OP;
      this.row1 = '';
      this.editable = true;
    },
    function push(a2, opt_op) {
      if ( a2 != this.a2 ||
           ( opt_op || this.DEFAULT_OP ) != this.op )
        this.row1 = '';
      this.history.put(this.History.create(this));
      while ( this.history.length > this.MAX_HISTORY ) this.history.shift();
      this.a1 = this.a2;
      this.op = opt_op || this.DEFAULT_OP;
      this.a2 = a2;
    },
    function replace(op) { this.op = op || this.DEFAULT_OP; }
  ],

  actions: [
    { model_: 'foam.apps.calc.Num', n: 1 },
    { model_: 'foam.apps.calc.Num', n: 2 },
    { model_: 'foam.apps.calc.Num', n: 3 },
    { model_: 'foam.apps.calc.Num', n: 4 },
    { model_: 'foam.apps.calc.Num', n: 5 },
    { model_: 'foam.apps.calc.Num', n: 6 },
    { model_: 'foam.apps.calc.Num', n: 7 },
    { model_: 'foam.apps.calc.Num', n: 8 },
    { model_: 'foam.apps.calc.Num', n: 9 },
    { model_: 'foam.apps.calc.Num', n: 0 },
    {
      model_: "foam.apps.calc.Binary",
      name: "div",
      label: "÷",
      speechLabel: "divide",
      keyboardShortcuts: [ "/" ],
      f: function (a1, a2) { return a1 / a2; }
    },
    {
      model_: "foam.apps.calc.Binary",
      name: "mult",
      label: "×",
      speechLabel: "multiply",
      keyboardShortcuts: [ "*" ],
      f: function (a1, a2) { return a1 * a2; }
    },
    {
      model_: "foam.apps.calc.Binary",
      name: "plus",
      label: "+",
      speechLabel: "plus",
      keyboardShortcuts: [ "+" ],
      f: function (a1, a2) { return a1 + a2; }
    },
    {
      model_: "foam.apps.calc.Binary",
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
        this.op       = this.DEFAULT_OP;
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
        if ( this.op == this.DEFAULT_OP ) {
          var last = this.history[this.history.length-1];
          if ( ! last || last.op === this.DEFAULT_OP ) return;
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
          this.op = this.DEFAULT_OP;
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
      model_: "foam.apps.calc.Unary",
      name: "inv",
      label: "1/x",
      speechLabel: "inverse",
      keyboardShortcuts: [ "i" ],
      f: function (a) { return 1.0/a; }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "sqroot",
      label: "√",
      speechLabel: "square root",
      f: function(a) { return Math.sqrt(a); }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "square",
      label: "x²",
      speechLabel: "x squared",
      keyboardShortcuts: [ "@" ],
      f: function (a) { return a*a; }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "ln",
      speechLabel: "natural logarithm",
      f: function(a) { return Math.log(a); }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "exp",
      label: "eⁿ",
      speechLabel: "e to the power of n",
      f: function(a) { return Math.exp(a); }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "log",
      speechLabel: "log base 10",
      f: function(a) { return Math.log(a) / Math.LN10; }
    },
    {
      model_: "foam.apps.calc.Binary",
      name: "root",
      label: "ⁿ √Y",
      speechLabel: "the enth root of y",
      f: function(a1, a2) { return Math.pow(a2, 1/a1); }
    },
    {
      model_: "foam.apps.calc.Binary",
      name: "pow",
      label: "yⁿ",
      speechLabel: "y to the power of n",
      keyboardShortcuts: [ "^" ],
      f: function(a1, a2) { return Math.pow(a1, a2); }
    },
    {
      name: 'deg',
      speechLabel: 'switch to degrees',
      translationHint: 'short form for "degrees" calculator mode',
      code: function() { this.degreesMode = true; }
    },
    {
      name: 'rad',
      speechLabel: 'switch to radians',
      translationHint: 'short form for "radians" calculator mode',
      code: function() { this.degreesMode = false; }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "sin",
      speechLabel: "sine",
      f: function(a) { return Math.sin(this.degreesMode ? a * Math.PI / 180 : a) }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "cos",
      speechLabel: "cosine",
      f: function(a) { return Math.cos(this.degreesMode ? a * Math.PI / 180 : a) }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "tan",
      speechLabel: "tangent",
      f: function(a) { return Math.tan(this.degreesMode ? a * Math.PI / 180 : a) }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "asin",
      speechLabel: "arcsine",
      f: function(a) { return Math.asin(a) * ( this.degreesMode ? 180 / Math.PI : 1); }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "acos",
      speechLabel: "arccosine",
      f: function(a) { return Math.acos(a) * ( this.degreesMode ? 180 / Math.PI : 1); }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "atan",
      speechLabel: "arctangent",
      f: function(a) { return Math.atan(a) * ( this.degreesMode ? 180 / Math.PI : 1); }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "fact",
      label: "x!",
      speechLabel: "factorial",
      keyboardShortcuts: [ "!" ],
      f: function (n) { return this.factorial(n); }
    },
    {
      model_: "foam.apps.calc.Binary",
      name: "mod",
      speechLabel: "modulo",
      f: function (a1, a2) { return a1 % a2; }
    },
    {
      model_: "foam.apps.calc.Binary",
      name: "p",
      label: "nPr",
      speechLabel: "permutation",
      f: function (n,r) { return this.permutation(n,r); }
    },
    {
      model_: "foam.apps.calc.Binary",
      name: "c",
      label: "nCr",
      speechLabel: "combination",
      f: function (n,r) { return this.combination(n,r); }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "round",
      label: "rnd",
      speechLabel: "round",
      f: function(a) { return Math.round(a); }
    },
    {
      name: 'rand',
      speechLabel: 'random',
      translationHint: 'generate random number',
      code: function() { this.a2 = Math.random(); }
    },
    {
      model_: "foam.apps.calc.Unary",
      name: "store",
      label: "a=",
      speechLabel: "store in memory",
      f: function (n) { this.memory = n; return n; }
    },
    {
      name: 'fetch',
      label: 'a',
      speechLabel: 'fetch from memory',
      translationHint: 'load memorized number',
      code: function() { this.a2 = this.memory; }
    }
  ]
});
