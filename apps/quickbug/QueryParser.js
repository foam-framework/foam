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

/** Perform text search on 'summary' field and prefix searches on 'cc' and 'owner' fields. */
MODEL({
   name: 'DefaultQuery',

   extendsModel: 'UNARY',

   properties: [
      {
        name:  'arg1',
        preSet: function(_, value) {
          // Escape Regex escape characters
          var pattern = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          this.pattern_ = new RegExp(pattern, 'i');
          this.prefixPattern_ = new RegExp('^' + pattern, 'i');
          return value.toLowerCase();
        }
      }
   ],

   methods: {
     // No different that the non IC-case
     toSQL: function() { return this.arg1; },
     toMQL: function() { return this.arg1; },

     f: function(obj) {
       if ( this.pattern_.test(obj.summary) ) return true;
       if ( this.prefixPattern_.test(obj.owner) ) return true;
       for ( var i = 0 ; i < obj.cc.length ; i++ ) if ( this.prefixPattern_.test(obj.cc[i]) ) return true;
//       for ( var i = 0 ; i < obj.labels.length ; i++ ) if ( this.prefixPattern_.test(obj.labels[i]) ) return true;
       return false;
     }
   }
});


var QueryParser = {
  __proto__: QueryParserFactory(QIssue),

  stars: seq(literal_ic('stars:'), sym('number')),

  labelChar: alt(range('a','z'), range('A', 'Z'), range('0', '9')),

  labelName: str(plus(sym('labelChar'))),

  labelMatch: seq(sym('labelName'), alt(':', '=', '-'), sym('valueList')),

  summary: str(plus(notChar(' ')))

}.addActions({
  stars: function(v) {
    return GTE({
      f: function(i) { return i.stars; },
      partialEval: function() {return this;},
      toSQL: function() { return 'stars > ' + v[1]; },
      toMQL: function() { return 'stars > ' + v[1]; }
    }, v[1]);
  },

  labelMatch: function(v) {
    var a = [];
    for ( var i = 2 ; i < v.length ; i++ ) {
      a.push(v[0] + '-' + v[i]);
    }

    return IN(QIssue.LABELS, a).partialEval();
    /*
    var or = OR();
    var values = v[2];
    for ( var i = 0 ; i < values.length ; i++ ) {
      or.args.push(CONTAINS_IC(QIssue.LABELS, v[0] + '-' + values[i]));
    }
    return or;
    */
  },

  summary: function(v) {
    return DefaultQuery.create({arg1: v});
  }
});


QueryParser.expr = alt(
  QueryParser.export('expr'),
  sym('stars'),
  sym('labelMatch'),
  sym('summary')
);

/*
function test(query) {
  var res = QueryParser.parseString(query);
  console.log('query: ', query, ' -> ', res && res.toSQL());
}

test('priority=0');
test('priority=0,1,2');
test('priority:0');
test('1234567');
test('status:Assigned');
test('status:Assigned priority:0');
test('Iteration:29');
test('Type:Bug');
test('');
test('priority=0 or priority=1');
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
//  limit:# support
//  format:table/grid/csv/xml/json
//  orderBy:((-)field)+
