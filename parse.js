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

function prep(arg) {
  if ( typeof arg === 'string' ) return literal(arg);

  return arg;
}

function prepArgs(args) {
  for ( var i = 0 ; i < args.length ; i++ ) {
    args[i] = prep(args[i]);
  }

  return args;
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

function notChar(c) {
  return function(ps) {
    return ps.head !== c ? ps.tail.setValue(ps.head) : undefined;
  };
}

function not(p) {
  p = prep(p);
  return function(ps) { return this.parse(p,ps) ? undefined : ps; };
}

function optional(p) {
  p = prep(p);
  return function(ps) { return this.parse(p,ps) || ps.setValue(undefined); };
}

function repeat(p, opt_delim, opt_min, opt_max) {
  p = prep(p);
  opt_delim = prep(opt_delim);

  return function(ps) {
    var ret = [];

    for ( var i = 0 ; ! opt_max || i < opt_max ; i++ ) {
      var res;

      if ( opt_delim && ret.length != 0 ) {
        if ( ! ( res = this.parse(opt_delim, ps) ) ) break;
        ps = res;
      }

      if ( ! ( res = this.parse(p,ps) ) ) break;

      ret.push(res.getValue());
      ps = res;
    }

    if ( opt_min && ret.length < opt_min ) return undefined;

    return ps.setValue(ret);
  };
}

function seq(/* vargs */) {
  var args = prepArgs(arguments);

  return function(ps) {
    var ret = [];

    for ( var i = 0 ; i < args.length ; i++ ) {
      if ( ! ( ps = this.parse(args[i], ps) ) ) return undefined;
      ret.push(ps.getValue());
    }

    return ps.setValue(ret);
  };
}

function alt(/* vargs */) {
  var args = prepArgs(arguments);

  return function(ps) {
    for ( var i = 0 ; i < args.length ; i++ ) {
      var res = this.parse(args[i], ps);

      if ( res ) return res;
    }

    return undefined;
  };
}


// TODO: doesn't compare arrays properly and gives false errors
function test(str, p, opt_expect) {
/*
  var res = p(stringPS(str));

  var pass = opt_expect ? res.getValue() == opt_expect : ! res ;

  console.log(pass ? 'PASS' : 'ERROR', str, opt_expect, res && res.getValue());
*/
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


function sym(name) {
  return function(ps) { /* console.log('<' + name + '>'); */ return this[name](ps); };
}

var grammar = {
  parseString: function(str) {
    var res = this.parse(this.START, stringPS(str));

    return res && res.getValue();
  },

  parse: function(parser, pstream) {
 //    console.log('parser: ', parser, 'stream: ',pstream);
    return parser.call(this, pstream);
  },

  addAction: function(sym, action) {
    var p = this[sym];
    this[sym] = function(ps) {
      var ps2 = this.parse(p, ps);

      return ps2 && ps2.setValue(action.call(this, ps2.getValue(), ps.getValue()));
    };
  },

  addActions: function(map) {
    for ( var key in map ) this.addAction(key, map[key]);

    return this;
  }
};

var expr = {
  __proto__: grammar,

  START: sym('expr'),

  expr: seq(sym('expr1'), optional(seq(alt('+', '-'), sym('expr')))),

  expr1: seq(sym('expr2'), optional(seq(alt('*', '/'), sym('expr1')))),

  expr2: alt(
    sym('number'),
    sym('group')),

  group: seq('(', sym('expr'), ')'),

  number: seq(optional('-'), repeat(range('0', '9'), null, 1))
};

/* Create an expression interpreter from the expression parser. */
var calc = {
  __proto__: expr
}.addActions({
  'group': function(v) { return v[1]; },
  'number': function(v) { return  (v[0] ? -1 : 1) * parseInt(v[1].join('')); },
  'expr': function(v) {
    var val = v[0];

    if ( v[1] ) {
      var val2 = v[1][1];
      val = ( v[1][0] == '+' ) ? val + val2 : val - val2;
    }

    return val;
  },
  'expr1': function(v) {
    var val = v[0];

    if ( v[1] ) {
      var val2 = v[1][1];
      val = ( v[1][0] == '*' ) ? val * val2 : val / val2;
    }

    return val;
  }
});


/* Create an expression compiler from the expression parser. */
var calcCompiler = {
  __proto__: expr
}.addActions({
  'group': function(v) { return v[1]; },
  'number': function(v) { return (function(c) { return function() { return c; }; })((v[0] ? -1 : 1) * parseInt(v[1].join(''))); },
  'expr': function(v) {
    var fn = v[0];

    if ( v[1] ) {
      var fn2 = v[1][1];
      return ( v[1][0] == '+' ) ?
        function() { return fn() + fn2(); } :
        function() { return fn() - fn2(); } ;
    }

    return fn;
  },
  'expr1': function(v) {
    var fn = v[0];

    if ( v[1] ) {
      var fn2 = v[1][1];
      return ( v[1][0] == '*' ) ?
        function() { return fn() * fn2(); } :
        function() { return fn() / fn2(); } ;
    }

    return fn;
  }
});

console.log(calc.parse(calc.expr, stringPS('1 ')).getValue());
console.log(calc.parse(calc.expr, stringPS('1 ')).getValue());
console.log(calc.parse(calc.expr, stringPS('-1 ')).getValue());
console.log(calc.parse(calc.expr, stringPS('1+2 ')).getValue());
console.log(calc.parse(calc.expr, stringPS('2*3 ')).getValue());
console.log(calc.parse(calc.expr, stringPS('(1) ')).getValue());
console.log(calc.parseString('-2*(10+20+30) '));
console.log(calcCompiler.parseString('-2*(10+20+30) ')());



var MBOXParser = {
  __proto__: grammar,

  START: sym('line'),

  'eol': literal('\n'),

  'until eol': repeat(notChar('\n')),

  line: alt(
    sym('start of email'),
    sym('to'),
    sym('from'),
    sym('subject'),
    sym('date'),
    sym('labels'),
    sym('unknown header')
//    sym('body')
  ),

  'start of email': seq('From ', sym('until eol')),

  to: seq('To: ', sym('until eol')),
  from: seq('From: ', sym('until eol')),

  labels: seq('X-Gmail-Labels: ', repeat(sym('label'), ',')),

  label: repeat(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),

  subject: seq('Subject: ', sym('until eol')),

  date: seq('Date: ', sym('until eol')),

  'unknown header': sym('until eol'),

  'email address': alt(
    sym('named email address'),
    sym('raw email address')),

  'named email address': seq(
    repeat(notChar('<')),
    sym('raw email address'),
    '>'),

  'raw email address': seq(repeat(notChar('@')), sym('until eol'))

};

/** Sink which loads Emails into a DAO. **/
var MBOXLoader = {
  __proto__: MBOXParser,

  put: function(str) {
    this.parseString(str);
  },

  eof: function() {
    this.saveCurrentEmail();
  },

  saveCurrentEmail: function() {
    if ( this.email ) {
      console.log('creating: ', this.email.toJSON());
      if ( this.dao ) this.dao.put(this.email);
    }
  }
}.addActions({
  'start of email': function() {
    this.saveCurrentEmail();

    this.email = EMail.create();
  },

  to: function(v) {
    this.email.to = v[1].join('');
  },

  from: function(v) {
    this.email.from = v[1].join('');
  },

  subject: function(v) {
    this.email.subject = v[1].join('');
  },

  label: function(v) {
    this.email.labels.push(v.join(''));
  }

  // TODO: timestamp, message-id, body

});


var p = MBOXLoader.put.bind(MBOXLoader);

p('From 1404692113434165298@xxx Wed Jun 13 08:19:51 2012\n');
p('X-Gmail-Labels: Retention5,SuperCool\n');
p('Message-ID: <20cf30563d5b2b446604c2604e64@google.com>\n');
p('Date: Wed, 13 Jun 2012 20:19:50 +0000\n');
p('Subject: New voicemail from (917) 359-5785 at 3:18 PM\n');
p('From: Google Voice <voice-noreply@google.com>\n');
p('To: thafunkypresident@gmail.com\n');

MBOXLoader.eof();
