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

function factorial(n) {
  if ( n > 170 ) return 1/0;
  var r = 1;
  while ( n > 0 ) r *= n--;
  return r;
};
function permutation(n, r) { return factorial(n) / factorial(n-r); };
function combination(n, r) { return permutation(n, r) / factorial(r); };

function trigFn(f) {
  return function(a) {
    return f(this.degreesMode ? a * Math.PI / 180 : a);
  };
}

function invTrigFn(f) {
  return function(a) {
    return this.degreesMode ? f(a) / Math.PI * 180 : f(a);
  };
}

/** Make a Binary Action. **/
function binaryOp(name, keys, f, sym) {
  f.toString = function() { return sym; };
  return {
    name: name,
    label: sym,
    keyboardShortcuts: keys,
    action: function() {
      if ( this.op != DEFAULT_OP ) this.equals();
      this.push('', f);
      this.editable = true;
    }
  };
}

function unaryOp(name, keys, f, opt_sym) {
  var sym = opt_sym || name;
  f.toString = function() { return sym; };

  return {
    name: name,
    label: sym,
    keyboardShortcuts: keys,
    action: function() {
      this.op = f;
      this.push(f.call(this, this.a2));
      this.editable = false;
    }
  };
}

/** Make a 0-9 Number Action. **/
function num(n) {
  return {
    name: n.toString(),
    keyboardShortcuts: [48+n /* 0 */ , 96+n /* keypad-0 */],
    action: function() {
      if ( ! this.editable ) {
        this.push(n);
        this.editable = true;
      } else {
        if ( this.a2 == '0' && ! n ) return;
        this.a2 = this.a2 == '0' ? n : this.a2.toString() + n;
      }
    }
  };
}


var DEFAULT_OP = function(a1, a2) { return a2; };
DEFAULT_OP.toString = function() { return ''; };


/** A subclass of FloatFieldView which doesn't display 0 values. **/
MODEL({
  name:  'CalcFloatFieldView',
  extendsModel: 'FloatFieldView',
  methods: { valueToText: function(v) { return v == 0 ? '' : v.toString(); } }
});


MODEL({ name: 'History', properties: [ 'op', 'a2' ] });


MODEL({
  name: 'Calc',

  requires: [ 'MainButtonsView', 'SecondaryButtonsView', 'TertiaryButtonsView', 'HistoryView', 'CalcView' ],

  templates: [ function CSS() {/*
    body {
      font-family: Roboto, 'Helvetica Neue', Helvetica, Arial;
      font-size: 24px;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    body {
      margin: 0px;
      padding: 0px;
      width: 100%;
      height: 100%;
      font-weight: 300;
    }

    ::-webkit-scrollbar {
      display: none;
    }

    ::-webkit-scrollbar-thumb {
      display: none;
    }

    .calc {
      background-color: #fff;
      border: 0;
      margin: 0;
      padding: 0px;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .calc-display, .calc-display:focus {
      border: none;
      letter-spacing: 1px;
      line-height: 25px;
      margin: 0;
      min-width: 204px;
      overflow: scroll;
      padding: 0 25pt 2pt 25pt;
      width: calc( 100% - 40px );
      text-align: right;
    }

    .edge-top {
      height: 5px;
      width: 100%;
      z-index: 99;
      position: absolute;
      background: #fff;
    }

    .edge {
      background: linear-gradient(to bottom, rgba(255,255,255,1) 0%,
                                             rgba(255,255,255,0) 100%);
      height: 20px;
      position: absolute;
      top: 5px;
      width: 100%;
      z-index: 99;
    }

    .edge2 {
      background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%,
                                             rgba(0,0,0,0) 100%);
      top: 12px;
      height: 12px;
      position: relative;
      width: 100%;
      z-index: 99;
    }

    .calc .buttons {
      flex: 1 1 100%;
      width: 100%;
      height: 350px;
    }

    .button-row {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      flex: 1 1 100%;
      justify-content: space-between;
      align-items: stretch;
    }

    .button {
      flex-grow: 1;
      justify-content: center;
      display: flex;
      align-items: center;
      background-color: #4b4b4b;
    }

    .rhs-ops {
      border-left-width: 1px;
      border-left-style: solid;
      border-left-color: rgb(68, 68, 68);
    }

    .rhs-ops .button {
      background-color: #777;
    }

    .button-column {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
    }

    .inner-calc-display {
      position: absolute;
      right: 20pt;
      top: 100%;
      transition: top 0.3s ease;
      width: 85%;
    }

    .calc-display {
      flex-grow: 5;
      position: relative;
    }

    .secondaryButtons {
      padding-left: 10px;
      background: rgb(64, 189, 158);
    }

    .secondaryButtons .button {
      background: rgb(64, 189, 158);
    }

    .tertiaryButtons {
      padding-left: 10px;
      background: rgb(29, 233, 182);
    }

    .tertiaryButtons .button {
      background: rgb(29, 233, 182);
    }

    .keypad {
      flex-grow: 0;
      flex-shrink: 0;
      margin-bottom: -4px;
    }

    // Copied from foam.css.
    .SliderPanel .shadow {
      background: linear-gradient(to left, rgba(0,0,0,0.3) 0%,
                                         rgba(0,0,0,0) 100%);
      height: 100%;
      left: -8px;
      position: absolute;
      width: 8px;
    }
  */}],

  properties: [
    { name: 'degreesMode', defaultValue: false },
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
      view: { factory_: 'DAOListView', rowView: 'HistoryView' },
      factory: function() { return [].sink; }
    },
    {
      model_: 'StringProperty',
      name: 'row1',
      view: 'ALabel'
    },
  ],

  methods: {
    init: function() {
      this.SUPER();

      Events.dynamic(function() { this.op; this.a2; }.bind(this), EventService.framed(function() {
        this.row1 = this.op + ( this.a2 != '' ? '&nbsp;' + this.a2 : '' );
      }.bind(this)));
    },
    push: function(a2, opt_op) {
      this.history.put(History.create(this));
      this.a1 = this.a2;
      this.a2 = a2;
      this.op = opt_op || DEFAULT_OP;
    }
  },

  actions: [
    num(1), num(2), num(3),
    num(4), num(5), num(6),
    num(7), num(8), num(9), num(0),
    binaryOp('div',   [111, 191],         function(a1, a2) { return a1 / a2; }, '\u00F7'),
    binaryOp('mult',  [106, 'shift-56'],  function(a1, a2) { return a1 * a2; }, '\u00D7'),
    binaryOp('plus',  [107, 'shift-187'], function(a1, a2) { return a1 + a2; }, '+'),
    binaryOp('minus', [109, 189],         function(a1, a2) { return a1 - a2; }, '–'),
    binaryOp('pow',   [],                 Math.pow,                             'yⁿ'),
    binaryOp('p',     [],                 permutation,                          'nPr'),
    binaryOp('c',     [],                 combination,                          'nCr'),
    binaryOp('root',  [],                 function(a1, a2) { return Math.pow(a2, 1/a1); }, '\u207F \u221AY'),
    {
      name: 'ac',
      label: 'AC',
      help: 'All Clear.',
      keyboardShortcuts: [ 65 /* a */, 67 /* c */ ],
      action: function() {
        this.a2 = '0';
        this.editable = true;
        this.op = DEFAULT_OP;
        this.history = [].sink;
      }
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
        this.push(this.op(parseFloat(this.a1), parseFloat(this.a2)));
        this.editable = false;
      }
    },
    {
      name: 'backspace',
      keyboardShortcuts: [ 8 /* backspace */ ],
      action: function() {
        this.a2 = this.a2.toString.length == 1 ?
          '0' :
          this.a2.toString().substring(0, this.a2.length-1) ;
      }
    },
    {
      name: 'pi',
      label: 'π',
      keyboardShortcuts: [80 /* p */],
      action: function() { this.a2 = Math.PI; }
    },
    {
      name: 'e',
      label: 'E',
      keyboardShortcuts: [69 /* e */],
      action: function() { this.a2 = Math.E; }
    },
    {
      name: 'percent',
      label: '%',
      action: function() { this.a2 = this.a2 / 100.0; }
    },
    {
      name: 'deg',
      action: function() { this.degreesMode = true; }
    },
    {
      name: 'rad',
      action: function() { this.degreesMode = false; }
    },
    unaryOp('fact',   ['shift-49' /* ! */], factorial,             'x!'),
    unaryOp('inv',    [73 /* i */], function(a) { return 1.0/a; }, '1/x'),
    unaryOp('sin',    [], trigFn(Math.sin)),
    unaryOp('cos',    [], trigFn(Math.cos)),
    unaryOp('tan',    [], trigFn(Math.tan)),
    unaryOp('asin',   [], invTrigFn(Math.asin)),
    unaryOp('acos',   [], invTrigFn(Math.acos)),
    unaryOp('atan',   [], invTrigFn(Math.atan)),
    unaryOp('square', [], function(a) { return a*a; }, 'x²'),
    unaryOp('sqroot', [82 /* r */], Math.sqrt, '√'),
    unaryOp('log',    [], function(a) { return Math.log(a) / Math.log(10); }),
    unaryOp('ln',     [], Math.log),
    unaryOp('exp',    [], Math.exp, 'eⁿ'),
  ]
});

// HACK: The buttons don't draw using the Roboto font because it isn't loaded yet.
// So we wait a second, to give the font time to load, then redraw all the buttons.
// TODO: Something better.
MODEL({
  name: 'ActionButtonCView2',
  extendsModel: 'ActionButtonCView',
  methods: {
    init: function() {
      this.SUPER();
      setTimeout(function() { this.view.paint(); }.bind(this), 1000);
    }
  }
});

var CalcButton = ActionButtonCView2.xbind({
  color:      'white',
  background: '#4b4b4b',
  width:      95,
  height:     85,
  font:       '24px Roboto'
});
X.registerModel(CalcButton, 'ActionButton');


MODEL({ name: 'HistoryView',          extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
MODEL({ name: 'CalcView',             extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
MODEL({ name: 'MainButtonsView',      extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
MODEL({ name: 'SecondaryButtonsView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
MODEL({ name: 'TertiaryButtonsView',  extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
