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

/** Plan indicating that there are no matching records. **/
var NOT_FOUND = {
  cost: 0,
  execute: function() {},
  toString: function() { return "no-match(cost=0)"; }
};


function dump(o) {
   if ( Array.isArray(o) ) return '[' + o.map(dump).join(',') + ']';
   return o ? o.toString() : '<undefined>';
}

/*
 * Index Interface:
 *   put(state, value) -> new state
 *   remove(state, value) -> new state
 *   plan(state, sink, options) -> {cost: int, toString: fn, execute: fn}
 *   size(state) -> int
 */

var ValueIndex = {
  put: function(s, newValue) { return newValue; },
  remove: function() {},
  plan: (function() {
    var plan = {
      cost: 1,
      execute: function(s, sink) {
        sink.put(s);
      },
      toString: function() { return 'unique'; }
    };

    return function() { return plan; };
  })(),
  select: function(value, sink) { sink.put(value); },
  selectReverse: function(value, sink) { sink.put(value); },
  size:   function(obj) { return 1; },
  toString: function() { return 'value'; }
};


var TreeIndex = {
  create: function(prop, tail) {
    tail = tail || ValueIndex;

    return {
      __proto__: this,
      prop: prop,
      tail: tail
    };
  },

  /**
   * Bulk load an unsorted array of objects.
   * Faster than loading individually, and produces a balanced tree.
   **/
  bulkLoad: function(a) {
     // Only safe if children aren't themselves trees
     if ( this.tail === ValueIndex ) {
       a.sort(toCompare(this.prop));
       return this.bulkLoad_(a, 0, a.length-1);
     }

     var s = undefined;
     for ( var i = 0 ; i < a.length ; i++ ) {
       s = this.put(s, a[i]);
     }
     return s;
  },

  bulkLoad_: function(a, start, end) {
    if ( end < start ) return undefined;

    var m    = start + Math.floor((end-start+1) / 2);
    var tree = this.put(undefined, a[m]);

    tree[3] = this.bulkLoad_(a, start, m-1);
    tree[4] = this.bulkLoad_(a, m+1, end);
    tree[2] += this.size(tree[3]) + this.size(tree[4]);

    return tree;
  },

  put: function(s, newValue) {
    return this.putKeyValue(s, this.prop.f(newValue), newValue);
  },

  putKeyValue: function(s, key, value) {
    if ( ! s ) {
      return [key, this.tail.put(null, value), 1];
    }

    var r = this.compare(s[0], key);

    if ( r == 0 ) {
      s[2] -= this.tail.size(s[1]);
      s[1] = this.tail.put(s[1], value);
      s[2] += this.tail.size(s[1]);
    } else if ( r > 0 ) {
      if ( s[3] ) s[2] -= s[3][2];
      s[3] = this.putKeyValue(s[3], key, value);
      s[2] += s[3][2];
    } else {
      if ( s[4] ) s[2] -= s[4][2];
      s[4] = this.putKeyValue(s[4], key, value);
      s[2] += s[4][2];
    }

    return s;
  },

  get: function(s, key) {
    if ( ! s ) return undefined;

    var r = this.compare(s[0], key);

    if ( r === 0 ) return s[1];

    return this.get(r > 0 ? s[3] : s[4], key);
  },

  select: function(s, sink) {
    if ( ! s ) return;
    this.select(s[3], sink);
    this.tail.select(s[1], sink);
    this.select(s[4], sink);
  },

  selectReverse: function(s, sink) {
    if ( ! s ) return;
    this.selectReverse(s[4], sink);
    this.tail.selectReverse(s[1], sink);
    this.selectReverse(s[3], sink);
  },

  size: function(s) { return s ? s[2] : 0; },

  compare: function(o1, o2) {
    return o1.compareTo(o2); //this.prop.compare(o1, o2);
  },

  plan: function(s, sink, options) {
    var query = options && options.query;

    var prop = this.prop;
    var index = this;

    var getEQKey = function (query) {
      if ( query.model_ === EqExpr && query.arg1 === prop ) {
        return query.arg2.f();
      }
      return undefined;
    };

    var getAndKey = function () {
      if ( query.model_ === AndExpr ) {
        for ( var i = 0 ; i < query.args.length ; i++ ) {
          var q = query.args[i];
          var k = getEQKey(q);
          if ( k ) {
            query.args[i] = TRUE;
            query = query.partialEval();
            return k;
          }
        }
      }
      return undefined;
    };

    if ( query ) {
      var key = getEQKey(query) || getAndKey();

      if ( key ) {
        var result = this.get(s, key);

        if ( ! result ) return NOT_FOUND;

        var subPlan = this.tail.plan(result, sink, options);
        return {
          cost: 1 + subPlan.cost,
          execute: function(s2, sink) {
            subPlan.execute(result[1], sink);
          },
          toString: function() { return 'lookup(key=' + prop.name + ', cost=' + this.cost + ') ' + subPlan.toString(); }
        };
      }
    }

    var cost = this.size(s);

    if ( options && options.order ) {
      if ( options.order == prop ) {
         // sort not required
      } else {
        cost *= Math.log(cost) / Math.log(2);
      }
    }

    return {
      cost: cost,
      execute: function() {
        index.select(s, sink);
      },
      toString: function() { return 'scan(key=' + prop.name + ', cost=' + this.cost + ')'; }
    };
  },

  toString: function() {
    return 'TreeIndex(' + this.prop.name + ', ' + this.tail + ')';
  }

};


// [0 key, 1 value, 2 size, 3 left, 4 right]
var OrderedMap = {
  create: function(prop) {
    return {
      __proto__: this,
      root: undefined,
      index: TreeIndex.create(prop)
    };
  },

  bulkLoad: function(a) { this.root = this.index.bulkLoad(a); },
  putObject: function(value) { this.root = this.index.put(this.root, value); },
  put: function(key, value) { this.root = this.index.putKeyValue(this.root, key, value); },
  get: function(key) { return this.index.get(this.root, key); },
  select: function(sink) { this.index.select(this.root, sink); },
  selectReverse: function(sink) { this.index.selectReverse(this.root, sink); },
  size: function() { return this.index.size(this.root); }
};


var m = OrderedMap.create({compare: StringComparator, f: function(x) { return x;}});

console.log('\nOrderedSet Test');
m.putObject('k');
m.putObject('e');
m.putObject('v');
m.putObject('i');
m.putObject('n');
m.putObject('kevin');
m.putObject('greer');
m.putObject('was');
m.putObject('here');
m.putObject('boo');

m.select(console.log);

console.log(m.get('kevin'));
m.put('kevin', 'greer');
console.log(m.get('kevin'));


console.log('\nOrderedSet BulkLoad Test');
m = OrderedMap.create({compare: StringComparator, f: function(x) { return x;}});

m.bulkLoad('kxeyvizngdrwfash'.split(''));

m.select(console.log);


var AltIndex = {
  // Maximum cost for a plan which is good enough to not bother looking at the rest.
  GOOD_PLAN: 1, // put to 10 or more when not testing

  create: function() {
    return {
      __proto__: this,
      delegates: argsToArray(arguments)
    };
  },

  addIndex: function(s, index) {
    // Populate the index
    var a = [];
    this.plan(s, a).execute(s, a);

    s.push(index.bulkLoad(a));
    this.delegates.push(index);
  },

  bulkLoad: function(a) {
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      this.root[i] = this.delegates[i].bulkLoad(a);
    }
  },

  put: function(s, newValue) {
    s = s || [];
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      s[i] = this.delegates[i].put(s[i], newValue);
    }

    return s;
  },

  plan: function(s, sink, options) {
    var bestPlan;

    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      var plan = this.delegates[i].plan(s[i], sink, options);

      if ( plan.cost <= AltIndex.GOOD_PLAN ) return plan;

      if ( ! bestPlan || plan.cost < bestPlan.cost ) {
	 // curry the proper state
	 bestPlan = (function(plan, s) { return {__proto__: plan, execute: function(unused, sink, options) { plan.execute(s, sink, options);}};})(plan, s[i]);
      }
    }

    return bestPlan;
  },

  size: function(obj) { return this.delegates[0].size(obj[0]); }
};


var IDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO2',

   name: 'IDAO',
   label: 'Indexed DAO',

   properties: [
      {
         name:  'model',
         label: 'Model',
         type:  'Model',
         required: true
      }
   ],

   methods: {

     init: function() {
       AbstractPrototype.init.call(this);

       this.index = TreeIndex.create(this.model.getProperty(this.model.ids[0]));
     },

     /**
      * Add a non-unique index
      * args: one or more properties
      **/
     addIndex: function() {
       var props = argsToArray(arguments);

       // Add on the primary key(s) to make the index unique.
       for ( var i = 0 ; i < this.model.ids.length ; i++ ) {
         props.push(this.model.getProperty(this.model.ids[i]));
       }

       this.addUniqueIndex.apply(this, props);
     },

     /**
      * Add a unique index
      * args: one or more properties
      **/
     addUniqueIndex: function() {
       // Upgrade single Index to an AltIndex if required.
       if ( ! /*AltIndex.isInstance(this.index)*/ this.index.delegates ) {
         this.index = AltIndex.create(this.index);
         this.root = [this.root];
       }

       var index = ValueIndex;

       for ( var i = arguments.length-1 ; i >= 0 ; i-- ) {
         index = TreeIndex.create(arguments[i], index);
       }

       this.index.addIndex(this.root, index);
     },

    /**
     * Bulk load data from another DAO.
     * Any data already loaded into this DAO will be lost.
     * @arg sink (optional) eof is called when loading is complete.
     **/
    bulkLoad: function(dao, sink) {
      var self = this;
      dao.select({ __proto__: [], eof: function() {
        self.root = self.index.bulkLoad(this);
        sink && sink.eof && sink.eof();
      }});
    },

    put: function(obj, sink) {
      this.root = this.index.put(this.root, obj);
      // TODO: notify
    },

    find: function(key, sink) {
      // TODO:
    },

    remove: function(query, sink) {
      // TODO:
    },

    select: function(sink, options) {
      var plan = this.index.plan(this.root, sink, options);
      console.log(plan.toString());
      plan.execute(this.root, sink, options);
      sink && sink.eof && sink.eof();
    }

   }
});

console.log('\nIDAO Test');

var d = IDAO.create({model:Issue});

// d.index = AltIndex.create(TreeIndex.create(Issue.SEVERITY));

/*
d.index = AltIndex.create(TreeIndex.create(Issue.STATUS, TreeIndex.create(Issue.ID)));
d.root = undefined;
*/

d.put(Issue.create({id:1, severity:'Minor',   status:'Open'}));
d.put(Issue.create({id:2, severity:'Major',   status:'Closed'}));
d.put(Issue.create({id:3, severity:'Feature', status:'Accepted'}));
d.put(Issue.create({id:4, severity:'Minor',   status:'Closed'}));
d.put(Issue.create({id:5, severity:'Major',   status:'Accepted'}));
d.put(Issue.create({id:6, severity:'Feature', status:'Open'}));

var sink = {
  put: function(i) {
    console.log(i && i.id, i && i.severity, i && i.status);
  }
};

console.log('\nDefault Order');
d.select(sink);

d.where(EQ(Issue.ID, 2)).select(sink);

// This causes the DAO's tree to rebalance itself. Cool!
// d.bulkLoad(d);

d.addIndex(Issue.SEVERITY);
d.addIndex(Issue.STATUS);


console.log('\nBy Severity');
d.orderBy(Issue.SEVERITY).select(sink);

console.log('\nBy Status');
d.orderBy(Issue.STATUS).select(sink);


console.log('\nWhere Closed');
d.where(EQ(Issue.STATUS, 'Closed')).select(sink);

console.log('\nWhere Major');
d.where(EQ(Issue.SEVERITY, 'Major')).select(sink);

console.log('\nWhere Open');
d.where(EQ(Issue.STATUS, 'Open')).select(sink);

console.log('\nMissing Key');
d.where(EQ(Issue.STATUS, 'XXX')).select(sink);
