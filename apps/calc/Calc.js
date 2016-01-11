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

/** Make a +-/* Action. **/
function makeOp(name, sym, keys, f) {
  f.toString = function() { return sym; };
  return {
    name: name,
    label: sym,
    keyboardShortcuts: keys,
    code: function() { this.op = f; }
  };
}

/** Make a 0-9 Number Action. **/
function makeNum(n) {
  return {
    name: n.toString(),
    keyboardShortcuts: [ n + '' ],
    code: function() { this.a2 = this.a2 == 0 ? n : this.a2.toString() + n; }
  };
}

var DEFAULT_OP = function(a1) { return a1; };
DEFAULT_OP.toString = function() { return ''; };

/** A subclass of  which doesn't display 0 values. **/
CLASS({
  name:  'CalcFloatFieldView',
  extends: 'foam.ui.FloatFieldView',
  methods: { valueToText: function(v) { return v == 0 ? '' : v.toString(); } }
});

CLASS({ name: 'History', properties: [ 'op', 'a2' ] });

CLASS({
  name: 'Calc',

  requires: ['History'],

  properties: [
    { name: 'a1', defaultValue: '0' },
    { name: 'a2', defaultValue: 0 },
    {
      name: 'op',
      preSet: function(oldOp, newOp) {
        if ( newOp !== DEFAULT_OP && oldOp !== DEFAULT_OP ) {
          var a3 = this.op(parseFloat(this.a1), parseFloat(this.a2));
          this.history.put(this.History.create(this));
          this.history.put(this.History.create({a2: a3}));
          this.a1 = a3;
          this.a2 = 0;
        } else if ( this.a2 ) {
          this.history.put(this.History.create({a2: this.a2}));
          this.a1 = this.a2;
          this.a2 = 0;
        }
        return newOp;
      },
      defaultValue: DEFAULT_OP
    },
    {
      type: 'String',
      name: 'row1'
    },
    {
      type: 'Array',
      name: 'history',
      view: 'foam.ui.DAOListView',
      factory: function() { return [].sink; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      Events.dynamicFn(function() { this.op; this.a2; }.bind(this), function() {
        this.row1 = this.op + ( this.a2 ? '&nbsp;' + this.a2 : '' );
      }.bind(this));
    }
  },

  actions: [
    makeNum(1), makeNum(2), makeNum(3),
    makeNum(4), makeNum(5), makeNum(6),
    makeNum(7), makeNum(8), makeNum(9), makeNum(0),
    makeOp('div',   '\u00F7', ['/'], function(a1, a2) { return a1 / a2; }),
    makeOp('mult',  '\u00D7', ['*'], function(a1, a2) { return a1 * a2; }),
    makeOp('plus',  '+',      ['+'], function(a1, a2) { return a1 + a2; }),
    makeOp('minus', '–',      ['-'], function(a1, a2) { return a1 - a2; }),
    {
      name: 'ac',
      label: 'AC',
      help: 'All Clear.',
      keyboardShortcuts: [ 'a', 'c' ],
      code: function() { this.op = DEFAULT_OP; this.a1 = 0; this.history = [].sink; }
    },
    {
      name: 'sign',
      label: '+/-',
      keyboardShortcuts: [ 'n', 's'],
      code: function() { this.a2 = - this.a2; }
    },
    {
      name: 'point',
      label: '.',
      keyboardShortcuts: [ '.' ],
      code: function() {
        if ( this.a2.toString().indexOf('.') == -1 ) this.a2 = this.a2 + '.';
      }
    },
    {
      name: 'equals',
      label: '=',
      keyboardShortcuts: [ '=', 13 /* <enter> */ ],
      code: function() {
        var a1 = this.a1;
        var a2 = this.a2;
        this.a1 = a2;
        this.history.put(this.History.create(this));
        this.a2 = this.op(parseFloat(a1), parseFloat(a2));
        this.op = DEFAULT_OP;
      }
    },
    {
      name: 'backspace',
      keyboardShortcuts: [ 8 /* backspace */ ],
      code: function() {
        this.a2 = this.a2 == 0 ? this.a2 : this.a2.toString().substring(0, this.a2.length-1);
      }
    }
  ]
});

CLASS({ 
  name: 'CalcView',
  extends: 'foam.ui.DetailView',
  requires: ['foam.ui.DAOListView'],
  templates: [ { name: 'toHTML' } ] 
});
