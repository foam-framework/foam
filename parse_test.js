// TODO: doesn't compare arrays properly and gives false errors
function test(str, p, opt_expect) {
/*
  var res = p(stringPS(str));

  var pass = opt_expect ? res.value == opt_expect : ! res ;

  console.log(pass ? 'PASS' : 'ERROR', str, opt_expect, res && res.value);
*/
}

if ( false ) {

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
}

function sym(name) { return function(ps) { return this[name](ps); }; }
// function sym(name) { return function(ps) { var ret = this[name](ps); console.log('<' + name + '> -> ', !! ret); return ret; }; }

var grammar = {
  parseString: function(str) {
    var res = this.parse(this.START, stringPS(str));

    return res && res.value;
  },

  parse: function(parser, pstream) {
 //    console.log('parser: ', parser, 'stream: ',pstream);
    return parser.call(this, pstream);
  },

  addAction: function(sym, action) {
    var p = this[sym];
    this[sym] = function(ps) {
      var ps2 = this.parse(p, ps);

      return ps2 && ps2.setValue(action.call(this, ps2.value, ps.value));
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

/*
console.log(calc.parse(calc.expr, stringPS('1 ')).value);
console.log(calc.parse(calc.expr, stringPS('1 ')).value);
console.log(calc.parse(calc.expr, stringPS('-1 ')).value);
console.log(calc.parse(calc.expr, stringPS('1+2 ')).value);
console.log(calc.parse(calc.expr, stringPS('2*3 ')).value);
console.log(calc.parse(calc.expr, stringPS('(1) ')).value);
console.log(calc.parseString('-2*(10+20+30) '));
console.log(calcCompiler.parseString('-2*(10+20+30) ')());
*/

console.log('***********', calc.parse(calc.expr, stringPS('1+2+3 ')).value);
console.log('***********', calc.parse(calc.expr, ErrorReportingPS.create(stringPS('1+2+3 '))).value);
