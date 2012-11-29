/*
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

/** String PStream **/
function stringPS(str, opt_index, opt_value) {
  opt_index = opt_index || 0;

  return {
    head: ( opt_index >= str.length ) ? undefined : str.charAt(opt_index),
    tail: ( opt_index >= str.length ) ? this : stringPS(str, opt_index+1),
    getValue: function() { return opt_value; },
    setValue: function(value) { return stringPS(str, opt_index, value); }
  };
}

function range(c1, c2) {
  return function(ps) {
    if ( ! ps.head ) return undefined;
    if ( ps.head < c1 || ps.head > c2 ) return undefined;
    return ps.tail.setValue(ps.head);
  };
}

function literal(str) {
  return function(ps) {
    for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
      if ( str.charAt(i) !== ps.head ) return undefined;
    }

    return ps.setValue(str);
  };
}

function not(p) {
  return function(ps) {
    return p(ps) ? undefined : ps;
  };
}

function optional(p) {
  return function(ps) {
    return p(ps) || ps.setValue(undefined);
  };
}

function repeat(p, opt_delim, opt_min, opt_max) {
  return function(ps) {
    var ret = [];

    while ( true ) {
      var res;

      if ( opt_delim && ret.length != 0 ) {
        if ( ! ( res = opt_delim(ps) ) ) break;
        ps = res;
      }

      if ( ! ( res = p(ps) ) ) break;

      ret.push(res.getValue());
      ps = res;
    }

    if ( opt_min && ret.length < opt_min ) return undefined;
    if ( opt_max && ret.length > opt_max ) return undefined;

    return ps.setValue(ret);
  };
}

function seq(/* vargs */) {
  var args = arguments;

  return function(ps) {
    var ret = [];

    for ( var i = 0 ; i < args.length ; i++ ) {
      if ( ! ( ps = args[i](ps) ) ) return undefined;
      ret.push(ps.getValue());
    }

    return ps.setValue(ret);
  };
}

function alt(/* vargs */) {
  var args = arguments;

  return function(ps) {
    for ( var i = 0 ; i < args.length ; i++ ) {
      var res = args[i](ps);

      if ( res ) return res;
    }

    return undefined;
  };
}


// TODO: doesn't compare arrays properly and gives false errors
function test(str, p, opt_expect) {
  var res = p(stringPS(str));

  var pass = opt_expect ? res.getValue() == opt_expect : ! res ;

  console.log(pass ? 'PASS' : 'ERROR', str, opt_expect, res && res.getValue());
}


test('0', range('0', '9'), '0');
test('9', range('0', '9'), '9');
test('a', range('0', '1'));

test('abc', literal('abc'), 'abc');
test('abcd', literal('abc'), 'abc');
test('ab', literal('abc'));
test('abc', not(literal('abc')));

// test('def', not(literal('abc')), true); // works, but tester doesn't

test('abc', seq(literal('a'), literal('b'), literal('c')), ['a','b','c']);
test('a', alt(literal('a'), literal('b'), literal('c')), ['a']);
test('b', alt(literal('a'), literal('b'), literal('c')), ['b']);
test('c', alt(literal('a'), literal('b'), literal('c')), ['c']);
test('x', alt(literal('a'), literal('b'), literal('c')));

test('a,a,a,a', repeat(literal('a'), literal(',')), ['a','a','a','a']);
test('aaaa', repeat(literal('a')), ['a','a','a','a']);
test('a,a,b,a', repeat(literal('a'), literal(',')), ['a','a']);
test('aaaa', repeat(literal('a')), ['a','a','a','a']);
test('aaba', repeat(literal('a')), ['a','a']);

test('abbab', repeat(seq(optional(literal('a')), literal('b'))), [['a','b'],[undefined,'b'],['a','b']]);


