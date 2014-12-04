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

/**
 * Generic Mustang-like query-language parser generator.
 *
 * key:value                  key contains "value"
 * key=value                  key exactly matches "value"
 * key:value1,value2          key contains "value1" OR "value2"
 * key:(value1|value2)        "
 * key1:value key2:value      key1 contains value AND key2 contains "value"
 * key1:value AND key2:value  "
 * key1:value OR key2:value   key1 contains value OR key2 contains "value"
 * key1:value or key2:value   "
 * key:(-value)               key does not contain "value"
 * (expr)                     groups expression
 * -expr                      not expression, ie. -pri:1
 * NOT expr                   not expression, ie. NOT pri:1
 * has:key                    key has a value
 * is:key                     key is a boolean TRUE value
 * key>value                  key is greater than value
 * key-after:value            "
 * key<value                  key is less than value
 * key-before:value           "
 * date:YY/MM/DD              date specified
 * date:today                 date of today
 * date-after:today-7         date newer than 7 days ago
 * date:d1..d2                date within range d1 to d2, inclusive
 * key:me                     key is the current user
 *
 * Date formats:
 * YYYY
 * YYYY-MM
 * YYYY-MM-DD
 * YYYY-MM-DDTHH
 * YYYY-MM-DDTHH:MM
 */
var QueryParserFactory = function(model) {
  var g = {
    __proto__: grammar,

    START: sym('query'),

    query: sym('or'),

    or: repeat(sym('and'), alt(literal_ic(' OR '), literal(' | ')), 1),

    and: repeat(
      sym('expr'),
      alt(literal_ic('AND '), not(alt(literal_ic(' OR'), literal(' |')), ' ')),
      1),

    expr: alt(
      sym('paren'),
      sym('negate'),
      sym('has'),
      sym('is'),
      sym('equals'),
      sym('before'),
      sym('after'),
      sym('id')
    ),

    paren: seq1(1, '(', sym('query'), ')'),

    negate: alt(
      seq('-', sym('expr')),
      seq('NOT ', sym('expr'))
    ),

    id: sym('number'),

    has: seq(literal_ic('has:'), sym('fieldname')),

    is: seq(literal_ic('is:'), sym('fieldname')),

    equals: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

    // TODO: merge with 'equals'
    before: seq(sym('fieldname'), alt('<', '<=', '-before:'), sym('value')),

    // TODO: merge with 'equals'
    after: seq(sym('fieldname'), alt('>', '>=', '-after:'), sym('value')),

    value: alt(
      sym('me'),
      sym('date'),
      sym('string'),
      sym('number')),

    valueList: repeat(sym('value'), ',', 1),

    me: seq(literal_ic('me'), lookahead(not(sym('char')))),

    date: alt(
      sym('range date'),
      sym('literal date'),
      sym('relative date')),

    'range date': seq(sym('literal date'), '..', sym('literal date')),

    'literal date': alt(
      // YYYY-MM-DDTHH:MM
      seq(sym('number'), '-', sym('number'), '-', sym('number'), 'T',
          sym('number'), ':', sym('number')),
      // YYYY-MM-DDTHH
      seq(sym('number'), '-', sym('number'), '-', sym('number'), 'T',
          sym('number')),
      // YYYY-MM-DD
      seq(sym('number'), '-', sym('number'), '-', sym('number')),
      // YYYY-MM
      seq(sym('number'), '-', sym('number')),
      // YY/MM/DD
      seq(sym('number'), '/', sym('number'), '/', sym('number')),
      // YYYY
      seq(sym('number'))),

    'relative date': seq(literal_ic('today'), optional(seq('-', sym('number')))),

    string: alt(
      sym('word'),
      sym('quoted string')),

    'quoted string': str(seq1(1, '"', repeat(alt(literal('\\"', '"'), notChar('"'))), '"')),

    word: str(plus(sym('char'))),

    char: alt(range('a','z'), range('A', 'Z'), range('0', '9'), '-', '^', '_', '@', '%', '.'),

    number: str(plus(range('0', '9')))
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
      if ( prop.aliases[j] ) fields.push(literal_ic(prop.aliases[j], prop));
  }

  // ShortNames
  for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var prop = model.properties[i];

    if ( prop.shortName ) fields.push(literal_ic(prop.shortName, prop));
  }

  fields.sort(function(a, b) {
    var d = a.length - b.length;

    if ( d !== 0 ) return d;

    if ( a == b ) return 0;

    return a < b ? 1 : -1;
  });

  g.fieldname = alt.apply(null, fields);

  g.addActions({
    id: function(v) { return EQ(model.ID, v); },

    or: function(v) { return OR.apply(OR, v); },

    and: function(v) { return AND.apply(AND, v); },

    negate: function(v) { return NOT(v[1]); },

    number: function(v) { return parseInt(v); },

    me: function() { return this.ME || this.X.ME || ""; },

    has: function(v) { return NEQ(v[1], ''); },

    is: function(v) { return EQ(v[1], TRUE); },

    before: function(v) {
      // If the value (v[2]) is a Date range, we take the appropriate end.
      if ( Array.isArray(v[2]) && v[2][0] instanceof Date ) {
        v[2] = v[1] === '<=' ? v[2][1] : v[2][0];
      }
      return (v[1] === '<=' ? LTE : LT) (v[0], v[2]);
    },

    after: function(v) {
      // If the value (v[2]) is a Date range, we take the appropriate end.
      if ( Array.isArray(v[2]) && v[2][0] instanceof Date ) {
        v[2] = v[1] === '>=' ? v[2][0] : v[2][1];
      }
      return (v[1] === '>=' ? GTE : GT) (v[0], v[2]);
    },

    equals: function(v) {
      // Always treat an OR'ed value list and let the partial evalulator
      // simplify it when it isn't.

      var prop    = v[0];
      var values  = v[2];
      var isInt   = IntProperty.isInstance(prop);
      var isNum   = isInt || FloatProperty.isInstance(prop);
      var isDateRange = Array.isArray(values[0]) && values[0][0] instanceof Date;

      console.log(prop.name, values, isInt, isNum, isDateRange);

      if ( isDateRange ) {
        var q = AND(GTE(prop, values[0][0]), LT(prop, values[0][1]));
        console.log('date range', q);
        return q;
      }

      if ( isNum ) {
        for ( var i = 0 ; i < values.length ; i++ )
          values[i] = isInt ? parseInt(values[i]) : parseFloat(values[i]);
      }

      return ( v[1] === '=' || isNum ) ?
        IN(v[0], values) :
        ContainedInICExpr.create({arg1: compile_(prop), arg2: values}) ;
    },

    // All dates are actually treated as ranges. These are arrays of Date
    // objects: [start, end]. The start is inclusive and the end exclusive.
    // Using these objects, both ranges (date:2014, date:2014-05..2014-06) and
    // open-ended ranges (date>2014-01-01) can be computed higher up.

    // Date formats:
    // YYYY-MM-DDTHH:MM, YYYY-MM-DDTHH, YYYY-MM-DD, YYYY-MM, YY/MM/DD, YYYY
    'literal date': function(v) {
      var start, end, interval;

      start = new Date();
      end = new Date();
      var ops = ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds'];
      var defaults = [0, 1, 1, 0, 0, 0];
      for (var i = 0; i < ops.length; i++) {
        var x = i*2 > v.length ? defaults[i] : v[i*2];
        // Adjust for months being 0-based.
        start['setUTC' + ops[i]](x - (i == 1 ? 1 : 0));
        end['setUTC' + ops[i]](x - (i == 1 ? 1 : 0));
      }

      // Start and end are currently clones of each other.
      // Bump the last portion of the date and set it in end.
      var last = Math.floor(v.length / 2);
      var op = 'UTC' + ops[last];
      end['set' + op](end['get' + op]() + 1);

      console.log('Received', v, 'output', start, end);
      return [start, end];
    },

    'relative date': function(v) {
      var d = new Date();
      if ( v[1] ) d.setDate(d.getDate() - v[1][1]);
      return d;
    },

    'range date': function(v) {
      // This gives two dates, and we combined them, the range is from the start
      // of the first date to the end of the second.
      return [v[0][0], v[2][1]];
    }
  });

  return g;
};
