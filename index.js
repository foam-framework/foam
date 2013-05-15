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

/** Plan indicating that an index has no plan for executing a query. **/
var NO_PLAN = {
  cost: Number.MAX_VALUE,
  execute: function() {},
  toString: function() { return "no-plan"; }
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
  select: function(value, sink, options) {
    if ( options ) {
      if ( options.query && ! options.query.f(value) ) return;
      if ( 'skip' in options && options.skip-- > 0 ) return;
      if ( 'limit' in options && options.limit-- < 1 ) return;
    }
    sink.put(value);
  },
  selectReverse: function(value, sink) { sink.put(value); },
  size:   function(obj) { return 1; },
  toString: function() { return 'value'; }
};

var KEY   = 0;
var VALUE = 1;
var SIZE  = 2;
var LEVEL = 3;
var LEFT  = 4;
var RIGHT = 5;

// TODO: investigate how well V8 optimizes static classes

// [0 key, 1 value, 2 size, 3 left, 4 right]
// [0 key, 1 value, 2 size, 3 level, 4 left, 5 right]

// AATree -- balanced binary search tree.
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

    tree[LEFT] = this.bulkLoad_(a, start, m-1);
    tree[RIGHT] = this.bulkLoad_(a, m+1, end);
    tree[SIZE] += this.size(tree[LEFT]) + this.size(tree[RIGHT]);

    return tree;
  },

  put: function(s, newValue) {
    return this.putKeyValue(s, this.prop.f(newValue), newValue);
  },

  putKeyValue: function(s, key, value) {
    if ( ! s ) {
      return [key, this.tail.put(null, value), 1, 1];
    }

    var r = this.compare(s[KEY], key);

    if ( r === 0 ) {
      // Set the value's property to be the same as the key in the index.
      // This saves memory by sharing objects.
      value[this.prop.name] = s[KEY];

      s[SIZE] -= this.tail.size(s[VALUE]);
      s[VALUE] = this.tail.put(s[VALUE], value);
      s[SIZE] += this.tail.size(s[VALUE]);
    } else {
      var side = r > 0 ? LEFT : RIGHT;

      if ( s[side] ) s[SIZE] -= s[side][SIZE];
      s[side] = this.putKeyValue(s[side], key, value);
      s[SIZE] += s[side][SIZE];
    }

    return this.split(this.skew(s));
  },

//    input: T, a node representing an AA tree that needs to be rebalanced.
//    output: Another node representing the rebalanced AA tree.

  skew: function(s) {
    if ( s && s[LEFT] && s[LEFT][LEVEL] === s[LEVEL] ) {
// console.log('skew');
      // Swap the pointers of horizontal left links.
      var l = s[LEFT];
      s[LEFT] = l[RIGHT];
      l[RIGHT] = s;

      return l;
    }

    return s;
  },

  updateSize: function(s) {
    s[SIZE] = this.size(s[LEFT]) + this.size(s[RIGHT]) + this.tail.size(s[VALUE]);
  },

  //  input: T, a node representing an AA tree that needs to be rebalanced.
  //  output: Another node representing the rebalanced AA tree.
  split: function(s) {
    if ( s && s[RIGHT] && s[RIGHT][RIGHT] && s[LEVEL] === s[RIGHT][RIGHT][LEVEL] ) {
// console.log('split');
      // We have two horizontal right links.  Take the middle node, elevate it, and return it.
      var r = s[RIGHT];
      s[RIGHT] = r[LEFT];
      r[LEFT] = s;
      r[LEVEL]++;
      this.updateSize(s);
      this.updateSize(r);

      return r;
    }

    return s;
  },

  // input: X, the value to delete, and T, the root of the tree from which it should be deleted.
  // output: T, balanced, without the value X.
  delete: function(s, key) {
    if ( ! s ) return s;

    var r = this.compare(s[KEY], key);

    if ( r === 0 ) {
      // If we're a leaf, easy, otherwise reduce to leaf case. 
      if ( ! s[LEFT] && ! s[RIGHT] ) return undefined;

      // TODO: add a unit test to verify that the size
      // adjusting logic is correct here.
      var side = s[LEFT] ? LEFT : RIGHT;

      // TODO: it would be faster if successor and predecessor also deleted
      // the entry at the same time in order to prevent two traversals.
      // But, this would also duplicate the delete logic.
      var l = side === LEFT ?
        this.successor(s)   :
        this.predecessor(s) ;

      s[SIZE] -= this.tail.size(s[VALUE]);
      s[side] = this.delete(s[side], l[KEY]);
      s[KEY] = l[KEY];
      s[VALUE] = l[VALUE];
    } else {
      var side = r > 0 ? LEFT : RIGHT;

      s[SIZE] -= this.size(s[side]);
      s[side] = this.delete(s[side], key);
      s[SIZE] += this.size(s[side]);
    }

    // Rebalance the tree. Decrease the level of all nodes in this level if
    // necessary, and then skew and split all nodes in the new level.
    s = this.skew(this.decreaseLevel(s));
    if ( s[RIGHT] ) {
      s[RIGHT] = this.skew(s[RIGHT]);
      if ( s[RIGHT][RIGHT] ) s[RIGHT][RIGHT] = this.skew(s[RIGHT][RIGHT]);
    }
    s = this.split(s);
    s[RIGHT] = this.split(s[RIGHT]);

    return s;
  },

  predecessor: function(s) {
    for ( s = s[LEFT] ; s[RIGHT] ; s = s[RIGHT] );
    return s;
  },

  successor: function(s) {
    for ( s = s[RIGHT] ; s[LEFT] ; s = s[LEFT] );
    return s;
  },

  // input: T, a tree for which we want to remove links that skip levels.
  // output: T with its level decreased.
  decreaseLevel: function(s) {
    var expectedLevel = Math.min(s[LEFT] ? s[LEFT][LEVEL] : 0, s[RIGHT] ? s[RIGHT][LEVEL] : 0) + 1;

    if ( expectedLevel < s[LEVEL] ) {
      s[LEVEL] = expectedLevel;
      if ( expectedLevel < s[RIGHT][LEVEL] ) {
        s[RIGHT][LEVEL] = expectedLevel;
      }
    }

    return s;
  },

  get: function(s, key) {
    if ( ! s ) return undefined;

    var r = this.compare(s[KEY], key);

    if ( r === 0 ) return s[VALUE];

    return this.get(r > 0 ? s[LEFT] : s[RIGHT], key);
  },

  select: function(s, sink, options) {
    if ( ! s ) return;

    if ( options ) {
      if ( 'limit' in options && options.limit <= 0 ) return;

      var size = this.size(s);
      if ( options.skip >= size ) {
        options.skip -= size;
        return;
      }
    }

    this.select(s[LEFT], sink, options);
    this.tail.select(s[VALUE], sink, options);
    this.select(s[RIGHT], sink, options);
  },

  selectReverse: function(s, sink) {
    if ( ! s ) return;
    this.selectReverse(s[RIGHT], sink);
    this.tail.selectReverse(s[VALUE], sink);
    this.selectReverse(s[LEFT], sink);
  },

  size: function(s) { return s ? s[SIZE] : 0; },

  compare: function(o1, o2) {
    return o1.compareTo(o2); //this.prop.compare(o1, o2);
  },

  plan: function(s, sink, options) {
    var query = options && options.query;

    if ( ! query && sink.model_ === CountExpr ) {
//       console.log('**************** COUNT SHORT-CIRCUIT ****************');
      var count = this.size(s);
      return {
	 cost: 0,
         execute: function(unused, sink, options) { sink.count = count; },
	 toString: function() { return 'count(' + count + ')'; }
      };
    }

    var prop = this.prop;

    if ( sink.model_ === GroupByExpr && sink.arg1 === prop ) {
       // console.log('**************** GROUP-BY SHORT-CIRCUIT ****************');
       // TODO:
    }

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
            query = query.deepClone();
            query.args[i] = TRUE;
            query = query.partialEval();
            return k;
          }
        }
      }
      return undefined;
    };

    if ( query ) {
      var key;
      if ( key = getEQKey(query) ) {
	 query = null;
      } else {
	 key = getAndKey();
	 if ( query === TRUE ) query = null;
      }

      if ( key ) {
        var result = this.get(s, key);

        if ( ! result ) return NOT_FOUND;

//        var newOptions = {__proto__: options, query: query};
        var newOptions = {query: query};
if ( 'limit' in options ) newOptions.limit = options.limit;
if ( 'skip' in options ) newOptions.skip = options.skip;

        var subPlan = this.tail.plan(result, sink, newOptions);
        return {
          cost: 1 + subPlan.cost,
          execute: function(s2, sink, options) {
            subPlan.execute(result[VALUE], sink, newOptions);
          },
          toString: function() { return 'lookup(key=' + prop.name + ', cost=' + this.cost + (query && query.toSQL ? ', query: ' + query.toSQL() : '') + ') ' + subPlan.toString(); }
        };
      }
    }

    var cost = this.size(s);
    var sortRequired = false;

    if ( options && options.order ) {
      if ( options.order === prop ) {
         // sort not required
      } else {
        sortRequired = true;
        cost *= Math.log(cost) / Math.log(2);
      }
    }

    return {
      cost: cost,
      execute: function() {
	    /*
        var o = options && (options.skip || options.limit) ?
          {skip: options.skip || 0, limit: options.limit || Number.MAX_VALUE} :
          undefined;
*/
        if ( sortRequired ) {
          var a = [];
          index.select(s, a, {query: options.query});
          a.select(sink, options);
        } else {
          index.select(s, sink, options);
        }
      },
      toString: function() { return 'scan(key=' + prop.name + ', cost=' + this.cost + (query && query.toSQL ? ', query: ' + query.toSQL() : '') + ')'; }
    };
  },

  toString: function() {
    return 'TreeIndex(' + this.prop.name + ', ' + this.tail + ')';
  }

};

/*

var SetIndex = {
  create: function(prop, tail) {
    tail = tail || UniqueIndex;
    return {
      __proto__: this,
      prop: prop,
      tail: tail,
      set: {
        __proto__: OrderedSet.create(prop),
        createValue_: function(obj) { return [obj[0], tail.createValue_(obj[1])]; },
        updateValue_: function(oldObj, newObj) { oldObj[1] =  tail.updateValue_(oldObj[1], newObj[1]); return oldObj; },
	selectValue_: function(obj, sink) { tail.selectValue_(obj[1], sink); },
	getValue_: function(obj) { return tail.getValue_(obj[1]); },
	valueSize_: function(obj) { return tail.valueSize_(obj[1]); },
        compare: function(o1, o2) { return o1[0].compareTo(o2[0]); }
      }
    };
  },

  put: function(obj) { this.put_(this.set.root, obj); },
  select: function(sink) { this.select_(this.set.root, sink); },

  put_: function(s, obj) {
    var l = this.prop.f(obj);
    for ( var i = 0 ; i < l.length ; i++ ) {
      this.set.put_(s, [l[i], obj]);
    }
  },
  select_: function(s, sink) {
     // TODO: this will only be called with a 'SetIndex' query
    this.set.select_(s, sink);
  },
  get_: function(s) { return s[0]; }
};

 */


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

//     console.log('Planning: ' + (options && options.query && options.query.toSQL && options.query.toSQL()));
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      var plan = this.delegates[i].plan(s[i], sink, options);

// console.log('  plan ' + i + ': ' + plan);
      if ( plan.cost <= AltIndex.GOOD_PLAN ) { bestPlan = plan; break; }

      if ( ! bestPlan || plan.cost < bestPlan.cost ) {
	 // curry the proper state
	 bestPlan = (function(plan, s) { return {__proto__: plan, execute: function(unused, sink, options) { plan.execute(s, sink, options);}};})(plan, s[i]);
      }
    }

//    console.log('Best Plan: ' + bestPlan);

    return bestPlan;
  },

  size: function(obj) { return this.delegates[0].size(obj[0]); }
};


var IDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO',

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
      // Clone the options to prevent 'limit' from being mutated in the original.
      if ( options ) options = {__proto__:options};
      var plan = this.index.plan(this.root, sink, options);
      plan.execute(this.root, sink, options);
      sink && sink.eof && sink.eof();
      return aconstant(sink);
    }

   }
});

