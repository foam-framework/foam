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

/** Make a Binary Action. **/
function makeBinaryOp(name, keys, f, sym) {
  f.toString = function() { return sym; };
  return {
    name: name,
    label: sym,
    keyboardShortcuts: keys,
    action: function() { this.op = f; }
  };
}

function makeUnaryOp(name, keys, f, opt_sym) {
  return {
    name: name,
    label: opt_sym || name,
    keyboardShortcuts: keys,
    action: function() { this.a2 = f(this.a2); }
  };
}

/** Make a 0-9 Number Action. **/
function makeNum(n) {
  return {
    name: n.toString(),
    keyboardShortcuts: [48+n /* 0 */ , 96+n /* keypad-0 */],
    action: function() { this.a2 = this.a2 == 0 ? n : this.a2.toString() + n; }
  };
}


var DEFAULT_OP = function(a1) { return a1; };
DEFAULT_OP.toString = function() { return ''; };


/** A subclass of FloatFieldView which doesn't display 0 values. **/
FOAModel({
  name:  'CalcFloatFieldView',
  extendsModel: 'FloatFieldView',
  methods: { valueToText: function(v) { return v == 0 ? '' : v.toString(); } }
});


FOAModel({ name: 'History', properties: [ 'op', 'a2' ] });


FOAModel({
  name: 'Calc',

  properties: [
    { name: 'a1', defaultValue: '0' },
    { name: 'a2', defaultValue: 0 },
    {
      name: 'op',
      preSet: function(oldOp, newOp) {
        if ( newOp !== DEFAULT_OP && oldOp !== DEFAULT_OP ) {
          var a3 = this.op(parseFloat(this.a1), parseFloat(this.a2));
          this.history.put(History.create(this));
          this.history.put(History.create({a2: a3}));
          this.a1 = a3;
          this.a2 = 0;
        } else if ( this.a2 ) {
          this.history.put(History.create({a2: this.a2}));
          this.a1 = this.a2;
          this.a2 = 0;
        }
        return newOp;
      },
      defaultValue: DEFAULT_OP
    },
    {
      model_: 'StringProperty',
      name: 'row1',
//      postSet: function(o, n) { console.log(o, ' -> ', n); },
      view: 'ALabel'
    },
    {
      name: 'history',
      model_: 'DAOProperty',
      view: { model_: 'DAOListView', rowView: 'HistoryView' },
      factory: function() { return []; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      Events.dynamic(function() { this.op; this.a2; }.bind(this), function() {
        this.row1 = this.op + ( this.a2 ? '&nbsp;' + this.a2 : '' );
      }.bind(this));
    }
  },

  actions: [
    makeNum(1), makeNum(2), makeNum(3),
    makeNum(4), makeNum(5), makeNum(6),
    makeNum(7), makeNum(8), makeNum(9), makeNum(0),
    makeBinaryOp('div',   [111, 191],         function(a1, a2) { return a1 / a2; }, '\u00F7'),
    makeBinaryOp('mult',  [106, 'shift-56'],  function(a1, a2) { return a1 * a2; }, '\u00D7'),
    makeBinaryOp('plus',  [107, 'shift-187'], function(a1, a2) { return a1 + a2; }, '+'),
    makeBinaryOp('minus', [109, 189],         function(a1, a2) { return a1 - a2; }, '–'),
    makeBinaryOp('pow',   [],                 Math.pow,                             'yⁿ'),
    {
      name: 'ac',
      label: 'AC',
      help: 'All Clear.',
      keyboardShortcuts: [ 65 /* a */, 67 /* c */ ],
      action: function() { this.op = DEFAULT_OP; this.a1 = 0; this.history = []; }
    },
    {
      name: 'sign',
      label: '+/-',
      keyboardShortcuts: [ 78 /* n */ , 83 /* s */],
      action: function() { this.a2 = - this.a2; }
    },
    {
      name: 'point',
      label: '.',
      keyboardShortcuts: [ 110, 190 ],
      action: function() {
        if ( this.a2.toString().indexOf('.') == -1 ) this.a2 = this.a2 + '.';
      }
    },
    {
      name: 'equals',
      label: '=',
      keyboardShortcuts: [ 187 /* '=' */, 13 /* <enter> */ ],
      action: function() {
        var a1 = this.a1;
        var a2 = this.a2;
        this.a1 = a2;
        this.history.put(History.create(this));
        this.a2 = this.op(parseFloat(a1), parseFloat(a2));
        this.op = DEFAULT_OP;
      }
    },
    {
      name: 'backspace',
      keyboardShortcuts: [ 8 /* backspace */ ],
      action: function() {
        this.a2 = this.a2 == 0 ? this.a2 : this.a2.toString().substring(0, this.a2.length-1);
      }
    },
    {
      name: 'pi',
      label: 'π',
      keyboardShortcuts: [80 /* p */],
      action: function() { this.a2 = Math.PI; }
    },
    makeUnaryOp('fact',   ['shift-49' /* ! */], function n(a) { var r = 1; while ( a > 0 ) r *= a--; return r; }, 'x!'),
    makeUnaryOp('inv',    [73 /* i */], function(a) { return 1.0/a; }, '1/x'),
    makeUnaryOp('sin',    [], Math.sin),
    makeUnaryOp('cos',    [], Math.cos),
    makeUnaryOp('tan',    [], Math.tan),
    makeUnaryOp('asin',   [], Math.asin),
    makeUnaryOp('acos',   [], Math.acos),
    makeUnaryOp('atan',   [], Math.atan),
    makeUnaryOp('square', [], function(a) { return a*a; }, 'x²'),
    makeUnaryOp('root',   [82 /* r */], Math.sqrt, '√'),
    makeUnaryOp('log',    [], function(a) { return Math.log(a) / Math.log(10); }),
    makeUnaryOp('ln',     [], Math.log),
    makeUnaryOp('exp',    [69 /* e */], Math.exp, 'eⁿ'),
  ]
});


FOAModel({
  name: 'CalcButton',
  extendsModel: 'ActionButtonCView',
  properties: [
    { name: 'color',      defaultValue: 'white' },
    { name: 'background', defaultValue: '#4b4b4b' },
    { name: 'width',      defaultValue: 70 },
    { name: 'height',     defaultValue: 70 },
    { name: 'font',       defaultValue: '24px Roboto' }
  ]
});
X.registerModel(CalcButton, 'ActionButton');


FOAModel({ name: 'HistoryView',          extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'CalcView',             extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'MainButtonsView',      extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'SecondaryButtonsView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
