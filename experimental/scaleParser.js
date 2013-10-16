/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
function log2_(n, base) { return Math.log(n) / Math.log(base); }

var ScaleExpr = {
  __proto__: grammar,

  START: sym('expr'),

  expr: seq(sym('expr1'), optional(seq(alt('+', '-'), sym('expr')))),

  expr1: seq(sym('expr2'), optional(seq(alt('*', '/'), sym('expr1')))),

  expr2: seq(sym('expr3'), optional(seq('^', sym('expr2')))),

  expr3: alt(
      sym('fun'),
      sym('variable'),
      sym('number'),
      sym('group')),

  variable: literal('x'),

  fun: seq(
      alt('sqrt', 'log'),
      '(',
      sym('expr'),
      optional(seq(',', sym('expr'))),
      ')'
  ),

  group: seq('(', sym('expr'), ')'),

  number: seq(optional('-'), repeat(range('0', '9'), null, 1))
};


/** Translate Scale-Expressions to Javascript. **/
var ScaleExprToJS = {
  __proto__: ScaleExpr
}.addActions({
  'START': function(v) { return new Function('x', 'return ' + v + ';'); },

  'group': function(v) { return v[1]; },
  'number': function(v) { return (v[0] ? -1 : 1) * parseInt(v[1].join('')); },
  'expr': function(v) {
    var val = v[0];

    if (v[1]) {
      var val2 = v[1][1];
      val = '(' + val + v[1][0] + val2 + ')';
    }

    return val;
  },
  'expr1': function(v) {
    var val = v[0];

    if (v[1]) {
      var val2 = v[1][1];
      val = '(' + val + v[1][0] + val2 + ')';
    }

    return val;
  },
  'expr2': function(v) {
    var val = v[0];

    if (v[1]) {
      var val2 = v[1][1];
      val = 'Math.pow(' + val + ',' + val2 + ')';
    }

    return val;
  },
  'fun': function(v) {
    var val = v[2];

    if (v[0] == 'sqrt') return 'Math.pow(' + val + ',0.5)';
    if (! v[3]) return 'Math.log(' + val + ')';
    return 'log2_(' + val + ',' + v[3][1] + ')';
  }
});



function test(expr, opt_x) {
  var x = opt_x || 1;
  var fn = ScaleExprToJS.parseString(expr + ' ');
  console.log(expr, fn, ' -> ', fn(x));
}

test('1');
test('1+2');
test('1*2');
test('x');
test('x', 2);
test('x+1');
test('2^3');
test('log(x)');
test('log(x,2)');
test('log(x,2)', 256);
test('sqrt(x)', 25);
test('x^2+x*log(x)*log(x,2)/sqrt(x)', 25);
