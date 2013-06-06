var QueryGrammar = {
  __proto__: grammar,

  START: sym('query'),

  query: alt(
    sym('id')
  ),

  id: sym('number'),

  number: seq(optional('-'), repeat(range('0', '9'), null, 1))

};


var QueryParser = {
  __proto__: QueryGrammar,
}.addActions({
  id: function(v) { return EQ(CIssue.ID, v); },

  number: function(v) { return  (v[0] ? -1 : 1) * parseInt(v[1].join('')); },
});





function test(query) {
  console.log('query: ', query, ' -> ', QueryParser.parseString(query));
}

test('1234567');
test('');
