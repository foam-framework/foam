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

// This accounts for binary-decimal conversion rounding (infinite 0.99999999)
// 12 places is just short of what javascript gives you, so it forces
// the number to round, which elimitates the spurious 9's.
var DECIMAL_PLACES_PRECISION = 12;

// console.profile();

if ( ! 'log10' in Math ) Math.log10 = function(a) { return Math.log(a) / Math.LN10; };

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

function maybeTranslate(actionHash, opt_longName) {
  if ( opt_longName ) actionHash.translationHint =
      'short form for mathematical function: "' + opt_longName + '"';
  return actionHash;
}

/** Make a Binary Action. **/
function binaryOp(name, keys, f, sym, opt_longName, opt_speechLabel) {
  var longName = opt_longName || name;
  var speechLabel = opt_speechLabel || sym;
  f.toString = function() { return '<span aria-label="' + speechLabel + '">' + sym + '</span>'; };
  f.binary = true;
  f.speechLabel = speechLabel;
  return maybeTranslate({
    name: name,
    label: sym,
    translationHint: 'binary operator: ' + longName,
    speechLabel: speechLabel,
    keyboardShortcuts: keys,
    action: function() {
      if ( this.a2 == '' ) {
        // the previous operation should be replaced, since we can't
        // finish this one without a second arg. The user probably hit one
        // binay op, followed by another.
        this.replace(f);
      } else {
        if ( this.op != DEFAULT_OP ) this.equals();
        this.push('', f);
        this.editable = true;
      }
    }
  }, opt_longName);
}

function unaryOp(name, keys, f, opt_sym, opt_longName, opt_speechLabel) {
  var sym = opt_sym || name;
  var longName = opt_longName || name;
  var speechLabel = opt_speechLabel || sym;
  f.toString = function() { return sym; };
  f.unary = true;
  f.speechLabel = speechLabel;
  return maybeTranslate({
    name: name,
    label: sym,
    translationHint: 'short form for mathematical function: "' + longName + '"',
    speechLabel: speechLabel,
    keyboardShortcuts: keys,
    action: function() {
      this.op = f;
      this.push(f.call(this, this.a2));
      this.editable = false;
    }
  }, opt_longName);
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


CLASS({
  name: 'NumberFormatter',
  messages: [
    {
      name: 'NaN',
      value: 'Not a number',
      translationHint: 'description of a value that isn\'t a number'
    }
  ],
  constants: [
    {
      name: 'formatNumber',
      value: function(n) {
        // the regex below removes extra zeros from the end,
        // or middle of exponentials
        return typeof n === 'string' ? n :
            Number.isNaN(n)       ? this.NaN :
            ! Number.isFinite(n)  ? '∞' :
            parseFloat(n).toPrecision(DECIMAL_PLACES_PRECISION)
            .replace( /(?:(\d+\.\d*[1-9])|(\d+)(?:\.))(?:(?:0+)$|(?:0*)(e.*)$|$)/ ,"$1$2$3");
      }
    }
  ]
});


CLASS({
  name: 'History',
  properties: [
    'op',
    {
      name: 'a2',
      preSet: function(_, n) { return this.formatNumber(n); }
    }
  ],
  methods: {
    formatNumber: function(n) {
      var nu = NumberFormatter.formatNumber(n) || '0';
      // strip off trailing "."
      return nu.replace(/(.+?)(?:\.$|$)/, "$1");
    }
  }
});


CLASS({
  name: 'Calc',
  translationHint: 'Calculator',

  requires: [
    'CalcView',
    'GestureManager',
    'TouchManager',
    'foam.graphics.CViewView',
    'foam.graphics.ActionButtonCView',
    'foam.ui.animated.Label',
    'foam.ui.md.Flare'
  ],

  exports: [
    'gestureManager',
    'touchManager'
  ],

  properties: [
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
      view: 'DAOListView',
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
      var r = 1;
      while ( n > 0 ) r *= n--;
      return r;
    },
    permutation: function(n, r) { return this.factorial(n) / this.factorial(n-r); },
    combination: function(n, r) { return this.permutation(n, r) / this.factorial(r); },
    error: function() {
      if ( $$('calc-display')[0] ) setTimeout(this.Flare.create({
        element: $$('calc-display')[0],
        color: '#f44336' /* red */
      }).fire, 100);
      this.history.put(History.create(this));
      this.a1 = 0;
      this.a2 = '';
      this.op = DEFAULT_OP;
      this.editable = true;
    },
    init: function() {
      this.SUPER();

      Events.dynamic(function() { this.op; this.a2; }.bind(this), EventService.framed(function() {
        if ( Number.isNaN(this.a2) ) this.error();
        var a2 = NumberFormatter.formatNumber(this.a2);
        this.row1 = '&nbsp;' + this.op + ( a2 !== '' ? '&nbsp;' + a2 : '' );
      }.bind(this)));
    },
    push: function(a2, opt_op) {
      this.history.put(History.create(this));
      this.a1 = this.a2;
      this.a2 = a2;
      this.op = opt_op || DEFAULT_OP;
    },
    replace: function(op) {
      this.op = op || DEFAULT_OP;
    }
  },

  actions: [
    num(1), num(2), num(3), num(4), num(5), num(6), num(7), num(8), num(9), num(0),
    binaryOp('div',   [111, 191],         function(a1, a2) { return a1 / a2; }, '\u00F7', 'divide', 'divide'),
    binaryOp('mult',  [106, 'shift-56'],  function(a1, a2) { return a1 * a2; }, '\u00D7', 'multiply', 'multiply'),
    binaryOp('plus',  [107, 'shift-187'], function(a1, a2) { return a1 + a2; }, '+'),
    binaryOp('minus', [109, 189],         function(a1, a2) { return a1 - a2; }, '–', 'minus', 'minus'),
    {
      name: 'ac',
      label: 'AC',
      speechLabel: 'all clear',
      translationHint: 'all clear (calculator button label)',
      // help: 'All Clear.',

      keyboardShortcuts: [ 27 /* escape */ ],
      action: function() {
        this.a1 = '0';
        this.a2 = '';
        this.editable = true;
        this.op = DEFAULT_OP;
        this.history = [].sink;
        if ( $$('calc-display')[0] ) {
          var now = Date.now();
          if ( this.lastFlare_ && now-this.lastFlare_ < 1000 ) return;
          this.lastFlare_ = now;
          this.Flare.create({
            element: $$('calc-display')[0],
            color: '#2196F3' /* blue */
          }).fire();
        }
      }
    },
    {
      name: 'sign',
      label: '+/-',
      speechLabel: 'negate',
      keyboardShortcuts: [ 'm' ],
      action: function() { this.a2 = - this.a2; }
    },
    {
      name: 'point',
      label: '.',
      speechLabel: 'point',
      keyboardShortcuts: [ 110, 190 ],
      action: function() {
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
      keyboardShortcuts: [ 187 /* '=' */, 13 /* <enter> */ ],
      action: function() {
        if ( typeof(this.a2) === 'string' && this.a2 == '' ) return; // do nothing if the user hits '=' prematurely
        if ( this.op == DEFAULT_OP ) {
          var last = this.history[this.history.length-1];
          if ( ! last ) return;
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
      label: 'backspace',
      translationHint: 'delete one input character',
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
      keyboardShortcuts: ['p'],
      action: function() { this.a2 = Math.PI; }
    },
    {
      name: 'e',
      label: 'e',
      keyboardShortcuts: ['e'],
      action: function() { this.a2 = Math.E; }
    },
    {
      name: 'percent',
      label: '%',
      speechLabel: 'percent',
      keyboardShortcuts: [ 'n', 'shift-53' /* % */ ],
      action: function() { this.a2 /= 100.0; }
    },

    unaryOp('inv',    ['i'], function(a) { return 1.0/a; }, '1/x', undefined, 'inverse'),
    unaryOp('sqroot', ['k'], Math.sqrt, '√', 'square root'),
    unaryOp('square', ['q'], function(a) { return a*a; }, 'x²', 'x squared', 'x squared'),
    unaryOp('ln',     ['f'], Math.log, 'ln', 'natural logarithm', 'natural logarithm'),
    unaryOp('exp',    ['h'], Math.exp, 'eⁿ', undefined, 'e to the power of n'),
    unaryOp('log',    ['g'], function(a) { return Math.log(a) / Math.LN10; }, 'log', 'logarithm', 'log base 10'),
    binaryOp('root',  ['l'], function(a1, a2) { return Math.pow(a2, 1/a1); }, '\u207F \u221AY', undefined, 'the enth root of y'),
    binaryOp('pow',   ['j'], Math.pow, 'yⁿ', undefined, 'y to the power of n'),

    unaryOp('sin',    ['shift-68'], trigFn(Math.sin), 'sin', 'sine',    'sine'),
    unaryOp('cos',    ['shift-71'], trigFn(Math.cos), 'cos', 'cosine',  'cosine'),
    unaryOp('tan',    ['shift-74'], trigFn(Math.tan), 'tan', 'tangent', 'tangent'),

    {
      name: 'deg',
      speechLabel: 'switch to degrees',
      keyboardShortcuts: [ 'shift-65' ],
      translationHint: 'short form for "degrees" calculator mode',
      action: function() { this.degreesMode = true; }
    },
    {
      name: 'rad',
      speechLabel: 'switch to radians',
      keyboardShortcuts: [ 'shift-66' ],
      translationHint: 'short form for "radians" calculator mode',
      action: function() { this.degreesMode = false; }
    },

    unaryOp('asin',   ['shift-69'], invTrigFn(Math.asin), 'asin', 'inverse-sine',    'arcsine'),
    unaryOp('acos',   ['shift-72'], invTrigFn(Math.acos), 'acos', 'inverse-cosine',  'arccosine'),
    unaryOp('atan',   ['shift-75'], invTrigFn(Math.atan), 'atan', 'inverse-tangent', 'arctangent'),

    unaryOp('fact',   ['shift-67', 'shift-49' /* ! */], function(n) { return this.factorial(n); }, 'x!', 'factorial', 'factorial'),
    binaryOp('mod',   ['shift-70'],         function(a1, a2) { return a1 % a2; }, 'mod', 'modulo', 'modulo'),
    binaryOp('p',     ['shift-73'],         function(n,r) { return this.permutation(n,r); }, 'nPr', 'permutations (n permute r)', 'permutation'),
    binaryOp('c',     ['shift-76'],         function(n,r) { return this.combination(n,r); }, 'nCr', 'combinations (n combine r))', 'combination'),
    unaryOp('round',  ['c'], Math.round, 'rnd', 'round', 'round'),
    {
      name: 'rand',
      label: 'rand',
      speechLabel: 'random',
      keyboardShortcuts: ['d'],
      action: function() { this.a2 = Math.random(); }
    },
    unaryOp('store',   ['b'], function(n) { this.memory = n; return n; }, 'a=', 'store in memory', 'store in memory'),
    {
      name: 'fetch',
      label: 'a',
      speechLabel: 'fetch from memory',
      keyboardShortcuts: ['a'],
      action: function() { this.a2 = this.memory; }
    },
  ]
});


CLASS({
  name: 'CalcSpeechView',
  extendsModel: 'View',
  properties: [
    'calc',
    'lastSaid'
  ],
  listeners: [
    {
      name: 'onAction',
      code: function(calc, topic, action) {
        var last  = this.calc.history[this.calc.history.length-1];
        var unary = last && last.op.unary;
        this.say(
          action.name === 'equals' ?
            action.speechLabel + ' ' + this.calc.a2 :
          unary ?
            action.speechLabel + ' equals ' + this.calc.a2 :
            action.speechLabel);
      }
    }
  ],
  actions: [
    {
      name: 'repeat',
      keyboardShortcuts: [ 'r' ],
      action: function() { this.say(this.lastSaid); }
    },
    {
      name: 'sayState',
      keyboardShortcuts: [ 's' ],
      action: function() {
        var last  = this.calc.history[this.calc.history.length-1];
        if ( ! last ) {
          this.say(this.calc.a2);
        } else {
          var unary = last && last.op.unary;
          if ( this.calc.op !== DEFAULT_OP ) {
            this.say(
              unary ?
                this.calc.a2 + ' ' + last.op.speechLabel :
                last.a2 + ' ' + this.calc.op.speechLabel + ' ' + this.calc.a2 );
          } else {
            this.say(
              unary ?
                last.a2 + ' ' + last.op.speechLabel + ' equals ' + this.calc.a2 :
                this.calc.history[this.calc.history.length-2].a2 + ' ' + last.op.speechLabel + ' ' + last.a2 + ' equals ' + this.calc.a2 );
          }
        }
      }
    }
  ],
  methods: {
    say: function(msg) {
      console.log('say: ', msg);
      this.lastSaid = msg;
      var e = document.createTextNode(' ' + msg + ' ');
      e.id = this.nextID();
      this.$.appendChild(e);
      setTimeout(function() { e.remove(); }, 30000);
    },
    toHTML: function() {
      return '<output id="' + this.id + '" style="position:absolute;left:-1000000;" aria-live="polite"></output>'
    },
    initHTML: function() {
      this.SUPER();
      this.calc.subscribe(['action'], this.onAction);
    }
  }
});


// HACK: The buttons don't draw using the Roboto font because it isn't loaded yet.
// So we wait a second, to give the font time to load, then redraw all the buttons.
// TODO: Something better.
CLASS({
  name: 'ActionButtonCView2',
  extendsModel: 'foam.graphics.ActionButtonCView',
  methods: {
    init: function() {
      this.SUPER();
      setTimeout(function() { this.view.paint(); }.bind(this), 1000);
    },
    toView_: function() {
      var v = this.SUPER();
      return v.decorate('toHTML', function(SUPER) { return '<div class="button">' + SUPER.call(this) + '</div>';}, v.toHTML);
    }
  }
});

var CalcButton = ActionButtonCView2.xbind({
  color:      'white',
  background: '#4b4b4b',
  width:      60,
  height:     60,
  font:       '300 28px RobotoDraft',
  role:       'button'
});


CLASS({
  name: 'CalcView',
  requires: [
    'HistoryCitationView',
    'SlidePanelView',
    'MainButtonsView',
    'SecondaryButtonsView',
    'TertiaryButtonsView',
    'foam.chromeapp.ui.ZoomView'
  ],
  exports: [
    'data'
  ],
  properties: [
    {
      model_: 'ViewFactoryProperty',
      name: 'mainButtons',
      defaultValue: 'MainButtonsView'
    },
    {
      model_: 'ViewFactoryProperty',
      name: 'basicOperations',
      defaultValue: 'BasicOperationsButtonView'
    },
  ],
  extendsModel: 'DetailView',
  templates: [
    function CSS() {/*
    * {
      box-sizing: border-box;
      outline: none;
    }

    html {
      height: 100%;
      margin: 0;
      overflow: initial;
      padding: 0;
      width: 100%;
    }

    body {
      -webkit-user-select: none;
      -webkit-font-smoothing: antialiased;
      font-family: RobotoDraft, 'Helvetica Neue', Helvetica, Arial;
      font-size: 20px;
      font-weight: 300;
      height: 100%;
      position: fixed;
      margin: 0;
      overflow: hidden;
      padding: 0;
      width: 100%;
    }

    ::-webkit-scrollbar {
      display: none;
    }

    ::-webkit-scrollbar-thumb {
      display: none;
    }

    .calc {
      background-color: #eee;
      border: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
      margin: 0;
      padding: 0px;
    }

    .deg, .rad {
      color: #111;
      font-size: 22px;
      font-weight: 400;
      opacity: 0;
      padding-left: 8px;
      transition: opacity 0.8s;
    }

    .active {
      opacity: 1;
      z-index: 2;
    }

    .calc-display, .calc-display:focus {
      border: none;
      letter-spacing: 1px;
      line-height: 28px;
      margin: 0;
      min-width: 140px;
      padding: 0 25pt 2pt 25pt;
      text-align: right;
      -webkit-user-select: text;
      overflow-y: scroll;
      overflow-x: hidden;
    }

    .edge {
      background: linear-gradient(to bottom, rgba(240,240,240,1) 0%,
                                             rgba(240,240,240,0) 100%);
      height: 20px;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 1;
    }

    .edge2 {
      margin-top: -12px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.25) 0%,
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
      height: 252px;
    }

    .button-row {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      flex: 1 1 100%;
      justify-content: space-between;
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
      background: #777;
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
      xxxbottom: 5px;
      width: 100%;
      padding-left: 90px;
      padding-bottom: 11px;
    }

    .calc-display {
      flex-grow: 5;
      position: relative;
    }

    .secondaryButtons {
      padding-left: 18px;
      background: rgb(52, 153, 128);
    }

    .secondaryButtons .button {
      background: rgb(52, 153, 128);
    }

    .tertiaryButtons {
      padding-left: 18px;
      background: rgb(29, 233, 182);
    }

    .tertiaryButtons .button {
      background: rgb(29, 233, 182);
    }

    .keypad {
      flex-grow: 0;
      flex-shrink: 0;
      margin-bottom: -4px;
      z-index: 5;
    }

    .alabel {
      font-size: 34px;
      color: #444;
    }
  */},
    {
      name: 'toHTML',
      template: function() {/*
        <%= CalcSpeechView.create({calc: this.data}) %>
        <!-- <%= this.ZoomView.create() %> -->
        <% X.registerModel(CalcButton, 'ActionButton'); %>
        <div style="position: relative;z-index: 100;">
          <div tabindex="1" style="position: absolute;">
            <span aria-label="radians" style="top: 5;left: 0;position: absolute;" id="<%= this.setClass('active', function() { return ! this.data.degreesMode; }) %>" class="rad" title="radians">RAD</span>
            <span aria-label="degrees" style="top: 5;left: 0;position: absolute;" id="<%= this.setClass('active', function() { return   this.data.degreesMode; }) %>" class="deg" title="degrees">DEG</span>
          </div>
        </div>

        <div class="edge"></div>
        <div id="%%id" class="calc">
          <div class="calc-display">
            <div class="inner-calc-display">
              $$history{ rowView: 'HistoryCitationView' }
              <div>$$row1{mode: 'read-only', tabIndex: 3, escapeHTML: false}</div>
            </div>
          </div>
          <div class='keypad'>
          <div class="edge2"></div>
          <%= this.SlidePanelView.create({
            minWidth: 310,
            minPanelWidth: 310,
            panelRatio: 0.55,
            mainView: 'MainButtonsView',
            stripWidth: 25,
            panelView: {
              factory_: 'SlidePanelView',
              minWidth: 280,
              minPanelWidth: 200,
              panelRatio: 3/7,
              mainView: 'SecondaryButtonsView',
              panelView: 'TertiaryButtonsView'
            }
           }) %>
          </div>
        </div>
        <%
          // This block causes the calc-display to scroll when updated.
          // To remove this feature replace the .inner-calc-display 'transition:' and
          // 'top:' styles with 'bottom: 0'.
          var move = EventService.framed(EventService.framed(function() {
            if ( ! this.$ ) return;
            var inner$ = this.$.querySelector('.inner-calc-display');
            var outer$ = this.$.querySelector('.calc-display');
            var value = DOMValue.create({element: outer$, property: 'scrollTop' });
            Movement.animate(300, function() { value.value = inner$.clientHeight; })();
          }.bind(this)));
          Events.dynamic(function() { this.data.op; this.data.history; this.data.a1; this.data.a2; }.bind(this), move);
          this.X.window.addEventListener('resize', move);
          // Add mousewhell scrolling.
          this.X.document.addEventListener('mousewheel', EventService.framed(function(e) {
            var inner$ = self.$.querySelector('.inner-calc-display');
            var outer$ = self.$.querySelector('.calc-display');
            var outer  = window.getComputedStyle(outer$);
            var inner  = window.getComputedStyle(inner$);
            var top    = toNum(inner$.style.top);
            inner$.style.top = Math.min(0, Math.max(toNum(outer.height)-toNum(inner.height)-11, top-e.deltaY)) + 'px';
          }));
        %>
      */}
    }
  ]
});


CLASS({
  name: 'MainButtonsView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <div id="%%id" class="buttons button-row" style="background:#4b4b4b;">
        <div class="button-column" style="flex-grow: 3">
          <div class="button-row">
            $$7{tabIndex: 101} $$8{tabIndex: 102} $$9{tabIndex: 103}
          </div>
          <div class="button-row">
            $$4{tabIndex: 104}$$5{tabIndex: 105}$$6{tabIndex: 106}
         </div>
          <div class="button-row">
            $$1{tabIndex: 107}$$2{tabIndex: 108}$$3{tabIndex: 109}
          </div>
          <div class="button-row">
            $$point{tabIndex: 111}$$0{tabIndex: 111}$$equals{tabIndex: 112}
          </div>
        </div>
      <%
      this.X.registerModel(CalcButton.xbind({
        background: '#777',
        width:  70,
        height: 45,
        font:   '300 26px RobotoDraft'
      }), 'ActionButton');
      %>
        <div class="button-column rhs-ops" style="flex-grow: 1;padding-top: 7px; padding-bottom: 10px;">
          $$ac{tabIndex: 201, font: '300 24px RobotoDraft'
}
          $$plus{tabIndex: 202}
          $$minus{tabIndex: 203}
          $$div{tabIndex: 204}
          $$mult{tabIndex: 205}
        </div>
      </div>
    */}
  ]
});


CLASS({
  name: 'SecondaryButtonsView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
          <%
          this.X.registerModel(CalcButton.xbind({
            background: 'rgb(52, 153, 128)',
            width:  61,
            height: 61,
            font:   '300 20px RobotoDraft'
          }), 'ActionButton');
          %>
          <div id="%%id" class="buttons button-row secondaryButtons">
            <div class="button-column" style="flex-grow: 1;">
              <div class="button-row">
                $$fetch{tabIndex: 311}
                $$store{tabIndex: 312}
                $$round{tabIndex: 313}
                $$rand{tabIndex: 314}
              </div>
              <div class="button-row">
                $$e{tabIndex: 321}
                $$ln{tabIndex: 322}
                $$log{tabIndex: 323}
                $$exp{tabIndex: 324}
              </div>
              <div class="button-row">
                $$inv{tabIndex: 331}
                $$pow{tabIndex: 332}
                $$sqroot{tabIndex: 333}
                $$root{tabIndex: 334}
              </div>
              <div class="button-row">
                $$sign{tabIndex: 341}
                $$percent{tabIndex: 342}
                $$square{tabIndex: 343}
                $$pi{tabIndex: 344}
              </div>
            </div>
          </div>
    */}
  ]
});


CLASS({
  name: 'TertiaryButtonsView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
          <%
          this.X.registerModel(this.X.ActionButton.xbind({
            width:      61,
            height:     61,
            color:      'rgb(80, 80, 80)',
            background: 'rgb(29, 233, 182)',
            font:       '300 18px RobotoDraft'
          }), 'ActionButton');
          %>
          <div id="%%id" class="buttons button-row tertiaryButtons">
            <div class="button-column" style="flex-grow: 1;">
              <div class="button-row">
                $$deg{tabIndex: 411} $$rad{tabIndex: 412} $$fact{tabIndex: 413}
              </div>
              <div class="button-row">
                $$sin{tabIndex: 421} $$asin{tabIndex: 422} $$mod{tabIndex: 423}
              </div>
              <div class="button-row">
                $$cos{tabIndex: 431} $$acos{tabIndex: 432} $$p{tabIndex: 433}
              </div>
              <div class="button-row">
                $$tan{tabIndex: 441} $$atan{tabIndex: 442} $$c{tabIndex: 443}
              </div>
            </div>
          </div>
    */}
  ]
});


CLASS({
  name: 'HistoryCitationView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <div class="history" tabindex="2">{{{this.data.op}}} {{this.data.a2}}<% if ( this.data.op.toString() ) { %><hr aria-label="equals" tabindex="2"><% } %></div>
    */}
  ]
});

Calc.getPrototype();

// console.profileEnd();
