function stringPS(str) { return StringPS.create(str); }

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
//console.log('***********', calc.parse(calc.expr, ErrorReportingPS.create(stringPS('1+2+3 '))).value);

var testparser = {
  __proto__: binarygrammar,

  START: sym('hi'),

  hi: repeat(alt(
      protomessage(65534, sym('greeting')),
      protomessage(23, sym('flags')))),

  greeting: repeat(protostring(2)),

  flags: protoint32(1)
};

//var testdata = new Uint8Array([0xba, 0x01, 0x0b, 0x10, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01, 0xf2, 0xff, 0x1f, 0x0e, 0x12, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x12, 0x05, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
//var testdata = new Uint8Array([0xba, 0x01, 0x0b, 0x10, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01]);

var testdata = new Uint8Array([0xba, 0x01, 0x02, 0x08, 0x20, 0xf2, 0xff, 0x1f, 0x0e, 0x12, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x12, 0x05, 0x77, 0x6f, 0x72, 0x6c, 0x64]);
console.log('parsing binary data: ', testparser.parseArrayBuffer(testdata));


var sample = "\n\n\n message Person // asdfasdf \n\n\n { /* required asdfasdf \n\n */ optional int32 id = 1; required string name = 2; optional string email = 3;}";
var sample2 = "enum PhoneType {MOBILE = 3; HOME = 0; WORK = 2; }";

var sample3 = "message NumberMessage { required uint32 num = 1; }";

var protoparser = SkipGrammar.create(
    ProtoBufGrammar,
    repeat0(
        alt(alt(' ','\r','\n'),
            seq('//', repeat0(notChar('\n')), '\n'),
            seq('/*', repeat0(not('*/', anyChar)), '*/'))));
console.log('Parsing protobuf: ', protoparser.parse(ProtoBufGrammar.START, StringPS.create(sample)).value[0].toJSON());

var NumberMessage = protoparser.parseString(sample3)[0];
var numinstance = NumberMessage.create({ num: 1 });
console.log('instance: ', numinstance.toJSON());
var protodata = numinstance.toProtobuf();
console.log('binary: ', protodata);
var numinstance2 = NumberMessage.protoparser.parseArrayBuffer(protodata);
console.log('parsed binary: ', numinstance2.toJSON());
