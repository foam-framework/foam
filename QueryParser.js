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
var ME = '';

/**
 * Generic Mustang-like query-language parser generator.
 *
 * key:value                  key contains "value"
 * key=value                  key exactly matches "value"
 * key:value1,value2          key contains "value1" OR "value2"
 * key1:value key2:value      key1 contains value AND key2 contains "value"
 * key1:value AND key2:value  "
 * (expr)                     groups expression
 * -expr                      not expression, ie. -pri:1
 * has:key                    key has a value
 * is:key                     key is a boolean TRUE value
 * key>value                  key is greater than value
 * key-after:value            "
 * key<value                  key is less than value
 * key-before:value           "
 * date:YY/MM/DD              date specified
 * date:today                 date of today
 * date-after:today-7         date newer than 7 days ago
 * key:me                     key is the current user
 */
var QueryParserFactory = function(model) {
   var g = {
  __proto__: grammar,

  START: sym('query'),

  query: sym('or'),

  or: repeat(sym('and'), literal_ic('OR '), 1),

  and: repeat(sym('expr'), alt(literal_ic('AND '), ' '), 1),

  expr: alt(
    sym('negate'),
    sym('has'),
    sym('is'),
    sym('equals'),
    sym('before'),
    sym('after'),
    sym('id')
  ),

  paren: seq('(', sym('query'), ')'),

  negate: seq('-', sym('expr')),

  id: sym('number'),

  has: seq(literal_ic('has:'), sym('fieldname')),

  is: seq(literal_ic('is:'), sym('fieldname')),

  equals: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

  // TODO: merge with 'equals'
  before: seq(sym('fieldname'), alt('<', '-before:'), sym('value')),

  // TODO: merge with 'equals'
  after: seq(sym('fieldname'), alt('>', '-after:'), sym('value')),

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

    'relative date':
        seq(literal_ic('today'), optional(seq('-', sym('number')))),

  string: alt(
     sym('word'),
     sym('quoted string')),

    'quoted string':
        seq('"', repeat(alt(literal('\\"', '"'), notChar('"'))), '"'),

    word: plus(sym('char')),

    'char':
        alt(range('a', 'z'), range('A', 'Z'), range('0', '9'),
            '-', '^', '_', '@', '%', '.'),

  number: seq(plus(range('0', '9')))

   };

   var fields = [];

   for (var i = 0; i < model.properties.length; i++) {
      var prop = model.properties[i];
      fields.push(literal_ic(prop.name, prop));
   }

   // Aliases
   for (var i = 0; i < model.properties.length; i++) {
      var prop = model.properties[i];

      for (var j = 0; j < prop.aliases.length; j++)
         if (prop.aliases[j]) fields.push(literal_ic(prop.aliases[j], prop));
   }

   // ShortName
   for (var i = 0; i < model.properties.length; i++) {
      var prop = model.properties[i];

      if (prop.shortName) fields.push(literal_ic(prop.shortName, prop));
   }

   fields.sort(function(a, b) {
     var d = a.length - b.length;

     if (d !== 0) return d;

     if (a == b) return 0;

     return a < b ? 1 : -1;
   });

   g.fieldname = alt.apply(null, fields);

   g.addActions({
  id: function(v) { return EQ(model.ID, v); },

  or: function(v) { return OR.apply(OR, v); },

  and: function(v) { return AND.apply(AND, v); },

  negate: function(v) { return NOT(v[1]); },

  number: function(v) { return parseInt(v[0].join('')); },

  me: function() { return ME; },

  paren: function(v) { return v[1]; },

  has: function(v) { return NEQ(v[1], ''); },

  is: function(v) { return EQ(v[1], TRUE); },

  before: function(v) { return LT(v[0], v[2]); },

  after: function(v) { return GT(v[0], v[2]); },

  equals: function(v) {
    // Always treat an OR'ed value list and let the partial evalulator
    // simplify it when it isn't.

    var or = OR();
    var values = v[2];
    for (var i = 0; i < values.length; i++) {
      or.args.push(v[1] == ':' && v[0].type === 'String' ?
        CONTAINS_IC(v[0], values[i]) :
        EQ(v[0], values[i]));
    }
    return or;
  },

  'quoted string': function(v) { return v[1].join(''); },

  word: function(v) { return v.join(''); },

  'literal date': function(v) { return new Date(v[0], v[2] - 1, v[4]); },

  'relative date': function(v) {
    var d = new Date();
    if (v[1]) d.setDate(d.getDate() - v[1][1]);
    return d;
  }
  });

  return g;
};
