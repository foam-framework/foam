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

/**
 * JSON Parser.
 */
var JSONParser = SkipGrammar.create({
  __proto__: grammar,

  START: copyInput(sym('objAsString')),

  objAsString: copyInput(sym('obj')),

  obj: seq1(1, '{', repeat(sym('pair'), ','), '}'),
    pair: seq(sym('key'), ':', sym('value')),

      key: alt(
        sym('symbol'),
        sym('string')),

        symbol: noskip(str(seq(sym('char'), str(repeat(sym('alpha')))))),
          char: alt(range('a','z'), range('A','Z'), '_', '$'),
          alpha: alt(sym('char'), range('0', '9')),

  value: alt(
    sym('expr'),
    sym('number'),
    sym('string'),
    sym('obj'),
    sym('bool')
  ),

  expr: str(seq(
    sym('symbol'), optional(str(alt(
      seq('.', sym('expr')),
      seq('(', str(repeat(sym('value'), ',')), ')')))))),

  number: noskip(seq(
    optional('-'),
    repeat(range('0', '9'), null, 1),
    optional(seq('.', repeat(range('0', '9')))))),

  string: noskip(alt(
    sym('single quoted string'),
    sym('double quoted string'))),

    'double quoted string': seq1(1, '"', str(repeat(sym('double quoted char'))), '"'),
    'double quoted char': alt(
      sym('escape char'),
      literal('\\"', '"'),
      notChar('"')),

    'single quoted string': seq1(1, "'", str(repeat(sym('single quoted char'))), "'"),
    'single quoted char': alt(
      sym('escape char'),
      literal("\\'", "'"),
      notChar("'")),

    'escape char': alt(
      literal('\\\\', '\\'),
      literal('\\n', '\n')),

  bool: alt(
    literal('true', true),
    literal('false', false))
}.addActions({
  obj: function(v) {
    var m = {};
    for ( var i = 0 ; i < v.length ; i++ ) m[v[i][0]] = v[i][2];
    return m;
  }
}), repeat0(alt(' ', '\t', '\n', '\r')));

/*
var res = JSONParser.parseString('{a:1,b:"2",c:false,d:f(),e:g(1,2),f:h.j.k(1)}');
console.log(res);
*/