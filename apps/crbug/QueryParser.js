var ME = "s...@chromium.org";

/**
 * Find a property for the provided name.
 * Checks in the following order:
 *   1. property Name
 *   2. list of propety Aliases
 *   3. property shortName
 **/
function findPropertyForName(model, name) {
  // Name
  for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var prop = model.properties[i];
    if ( name.equalsIC(prop.name) ) return prop;
  }

  // Aliases
  for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var prop = model.properties[i];

    for ( var j = 0 ; j < prop.aliases.length ; j++ )
      if ( name.equalsIC(prop.aliases[j]) ) return prop;
  }

  // ShortName
  for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var prop = model.properties[i];

    if ( name.equalsIC(prop.shortName) ) return prop;
  }

  return undefined;
}


var QueryGrammar = {
  __proto__: grammar,

  START: sym('query'),

  query: sym('or'),

  or: repeat(sym('and'), literal_ic('OR '), 1),

  and: repeat(sym('expr'), alt(literal_ic('AND '), ' '), 1),

  expr: alt(
    sym('negate'),
    sym('id'),
    sym('has'),
    sym('equals'),
    sym('labelMatch'),
    sym('before'),
    sym('after')
  ),

  paren: seq('(', sym('query'), ')'),

  negate: seq('-', sym('expr')),

  id: sym('number'),

  has: seq(literal_ic('has:'), sym('fieldname')),

  equals: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

  labelMatch: seq(sym('string'), alt(':', '='), sym('valueList')),

  before: seq(sym('fieldname'), alt('<','-before:'), sym('value')),

  after: seq(sym('fieldname'), alt('>', '-after:'), sym('value')),

  // TODO: it would be better to traverse the Model and explicitly add 
  //       each fieldname because this would give better auto-complete.
  fieldname: plus(alt(range('a','z'), range('A', 'Z'))),

  value: alt(
    sym('me'),
    sym('date'),
    sym('string'),
    sym('number')),

  valueList: repeat(sym('value'), ',', 1),

  me: seq(literal_ic('me'), lookahead(not(sym('char')))),

  date: alt(
    sym('literal date'),
    sym('relative date')),

    'literal date': seq(sym('number'), '/', sym('number'), '/', sym('number')), 

    'relative date': seq(literal_ic('today'), optional(seq('-', sym('number')))),

  string: plus(sym('char')),
  
    char: alt(range('a','z'), range('A', 'Z'), '-'),

  number: seq(plus(range('0', '9'))),

};


var KeyValueQueryParser = {
  __proto__: QueryGrammar,
}.addActions({
  id: function(v) { return EQ(CIssue.ID, v); },

  or: function(v) { return OR.apply(OR, v); },

  and: function(v) { return AND.apply(AND, v); },

  negate: function(v) { return NOT(v[1]); },

  number: function(v) { return  parseInt(v[0].join('')); },

  fieldname: function(v) { return findPropertyForName(CIssue, v.join('')); },

  me: function() { return ME; },

  paren: function(v) { return v[1]; },

  has: function(v) { return NEQ(v[1], ''); },

  before: function(v) { return LT(v[0], v[2]); },

  after: function(v) { return GT(v[0], v[2]); },

  equals: function(v) {
    // Always treat an OR'ed value list and let the partial evalulator
    // simplify it when it isn't.

    var or = OR();
    var values = v[2];
    for ( var i = 0 ; i < values.length ; i++ ) {
      or.args.push(v[1] == ':' && v[0].type === 'String' ?
        CONTAINS_IC(v[0], values[i]) :
        EQ(v[0], values[i]));
    }
    return or;
  },

  labelMatch: function(v) {
    var or = OR();
    var values = v[2];
    for ( var i = 0 ; i < values.length ; i++ ) {
      or.args.push(CONTAINS_IC(CIssue.LABELS, v[0] + '-' + values[i]));
    }
    return or;
  },

  string: function(v) { return v.join(''); },

  'literal date': function(v) { return new Date(v[0], v[2]-1, v[4]); },

  'relative date': function(v) {
    var d = new Date();
    if ( v[1] ) d.setDate(d.getDate() - v[1][1]);
    return d;
  },

});

// For 'labelMatch' to work, we need to cause the 
// 'equals' to fail when the name doesn't exist.
var superFieldname = KeyValueQueryParser.fieldname;
KeyValueQueryParser.fieldname = function(ps) {
  ps = superFieldname.call(this, ps);
  return ps && ps.value && ps;
};


var QueryParser = {
  __proto__: KeyValueQueryParser
};



function test(query) {
  console.log('QueryParserTest: ' + query);
  var res = QueryParser.parseString(query);
  console.log('query: ', query, ' -> ', res && res.toSQL());
}
/*
test('priority=0');
test('priority=0,1,2');
test('priority:0');
test('1234567');
test('status:Assigned');
test('status:Assigned priority:0');
test('Iteration:29');
test('Type:Bug');
test('');
*/


// label:Priority-High = Priority:High
// blockeon:NNN
// blocking:NNN
// is:blocked
// Priority:High,Medium = Priority:High OR Priority:Medium
// is:starred
// stars: 3  at least three users have starred
// "contains text"
// has:attachment
// attachment:screenshot or attachment:png

// consider
//  < and > support (done)
//  limit:# support
//  format:table/grid/csv/xml/json
//  orderBy:((-)field)+

