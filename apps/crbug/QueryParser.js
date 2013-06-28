var ME = "s...@chromium.org";

var QueryParserFactory = function(model) {
   var g = {
  __proto__: grammar,

  START: sym('query'),

  query: sym('or'),

  or: repeat(sym('and'), literal_ic('OR '), 1),

  and: repeat(sym('expr'), alt(literal_ic('AND '), ' '), 1),

  expr: alt(
    sym('negate'),
    sym('id'),
    sym('has'),
    sym('is'),
    sym('stars'),  // CIssue Specific
    sym('equals'),
    sym('labelMatch'), // CIssue Specific
    sym('before'),
    sym('after')
  ),

  paren: seq('(', sym('query'), ')'),

  negate: seq('-', sym('expr')),

  id: sym('number'),

  has: seq(literal_ic('has:'), sym('fieldname')),

  is: seq(literal_ic('is:'), sym('fieldname')),

  // TODO: move to subclass
  stars: seq(literal_ic('stars:'), sym('number')),

  equals: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

  // TODO: move to subclass
  labelMatch: seq(sym('string'), alt(':', '='), sym('valueList')),

  // TODO: merge with 'equals'
  before: seq(sym('fieldname'), alt('<','-before:'), sym('value')),

  // TODO: merge with 'equals'
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

   var fields = [];

   for ( var i = 0 ; i < model.properties.length ; i++ ) {
      var prop = model.properties[i];
      fields.push(literal_ic(prop.name, prop));
   }

   // Aliases
   for ( var i = 0 ; i < model.properties.length ; i++ ) {
      var prop = model.properties[i];

      for ( var j = 0 ; j < prop.aliases.length ; j++ )
         fields.push(literal_ic(prop.aliases[j], prop));
   }

   // ShortName
   for ( var i = 0 ; i < model.properties.length ; i++ ) {
      var prop = model.properties[i];

      fields.push(literal_ic(prop.shortName, prop));
   }

   // TODO: sort by length, then merge above loops

   g.fieldname = alt.apply(null, fields);

   g.addActions({
  id: function(v) { return EQ(model.ID, v); },

  or: function(v) { return OR.apply(OR, v); },

  and: function(v) { return AND.apply(AND, v); },

  negate: function(v) { return NOT(v[1]); },

  number: function(v) { return  parseInt(v[0].join('')); },

  me: function() { return ME; },

  paren: function(v) { return v[1]; },

  has: function(v) { return NEQ(v[1], ''); },

  is: function(v) { return EQ(v[1], TRUE); },

  stars: function(v) { return GTE({f:function(i) {debugger; return i.stars.length;}, partialEval: function() {return this;}, outSQL: function(out) { out.push("stars > " + v[1]); }}, v[1]); },

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
  }
  });

  return g;
}

/*
// For 'labelMatch' to work, we need to cause the 
// 'equals' to fail when the name doesn't exist.
var superFieldname = KeyValueQueryParser.fieldname;
KeyValueQueryParser.fieldname = function(ps) {
  ps = superFieldname.call(this, ps);
  return ps && ps.value && ps;
};
*/

var QueryParser = QueryParserFactory(CIssue);



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
