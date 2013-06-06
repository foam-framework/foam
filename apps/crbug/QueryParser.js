// today, me
// 

var QueryGrammar = {
  __proto__: grammar,

  START: sym('query'),

  query: sym('or'),

  or: repeat(sym('and'), 'OR ', 1),

  and: repeat(sym('expr'), alt('AND', ' '), 1),

  expr: alt(
    sym('id'),
    sym('substring'),
    sym('equals'),
    sym('negate')
  ),

  paren: seq('(', sym('query'), ')'),

  negate: seq('-', sym('query')),

  id: sym('number'),

  substring: seq(sym('fieldname'), ':', sym('value')),

  equals: seq(sym('fieldname'), '=', sym('value')),

  fieldname: sym('identifier'),

  value: alt(sym('identifier'), sym('number')),

  identifier: plus(alt(range('a','z'), range('A', 'Z'))),
  
  number: seq(repeat(range('0', '9'), null, 1))
//  number: seq(optional('-'), repeat(range('0', '9'), null, 1))

};


var QueryParser = {
  __proto__: QueryGrammar,
}.addActions({
  id: function(v) { return EQ(CIssue.ID, v); },

  or: function(v) { debugger; return OR.apply(OR, v); },

  and: function(v) { return AND.apply(AND, v); },

  negate: function(v) { return NOT(v[1]); },

  number: function(v) { return  parseInt(v[0].join('')); },

  fieldname: function(v) { return CIssue.getProperty(v); },

  identifier: function(v) { return v.join(''); },

  paren: function(v) { return v[1]; },

  substring: function(v) {
    return v[0].type == 'String' ?
      CONTAINS_IC(v[0], v[2]) :
      EQ(v[0], v[2]) ;
  },

  equals: function(v) { return EQ(v[0], v[2]); }
//  equals: function(v) { return EQ_IC(v[0], v[2]); }

});





function test(query) {
  console.log('query: ', query, ' -> ', QueryParser.parseString(query));
}

test('priority=0');
test('priority:0');
test('1234567');
test('status:Assigned');
test('status:Assigned priority:0');
test('');
