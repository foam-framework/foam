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

/*
 * Index Interface:
 *   put(state, value) -> new state
 *   remove(state, value) -> new state
 *   removeAll(state) -> new state // TODO
 *   plan(state, sink, options) -> {cost: int, toString: fn, execute: fn}
 *   size(state) -> int
 * Add:
 *   get(key) -> obj
 *   update(oldValue, newValue)
 *
 * TODO: reuse plans
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

/** An Index which holds only a single value. **/
var ValueIndex = {
  put: function(s, newValue) { return newValue; },
  remove: function() { return undefined; },
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
  get: function(value, key) { return value; },
  select: function(value, sink, options) {
    if ( options ) {
      if ( options.query && ! options.query.f(value) ) return;
      if ( 'skip' in options && options.skip-- > 0 ) return;
      if ( 'limit' in options && options.limit-- < 1 ) return;
    }
    sink.put(value);
  },
  selectReverse: function(value, sink, options) { this.select(value, sink, options); },
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

// [0 key, 1 value, 2 size, 3 level, 4 left, 5 right]

/** An AATree (balanced binary search tree) Index. **/
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

  // Set the value's property to be the same as the key in the index.
  // This saves memory by sharing objects.
  dedup: function(obj, value) {
    obj[this.prop.name] = value;
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
      this.dedup(value, s[KEY]);

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
      // Swap the pointers of horizontal left links.
      var l = s[LEFT];

      s[LEFT] = l[RIGHT];
      l[RIGHT] = s;

      this.updateSize(s);
      this.updateSize(l);

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

  remove: function(s, value) {
    return this.removeKeyValue(s, this.prop.f(value), value);
  },

  removeKeyValue: function(s, key, value) {
    if ( ! s ) return s;

    var r = this.compare(s[KEY], key);

    if ( r === 0 ) {
      s[SIZE] -= this.tail.size(s[VALUE]);
      s[VALUE] = this.tail.remove(s[VALUE], value);

      // If the sub-Index still has values, then don't
      // delete this node.
      if ( s[VALUE] ) {
        s[SIZE] += this.tail.size(s[VALUE]);
        return s;
      }

      // If we're a leaf, easy, otherwise reduce to leaf case.
      if ( ! s[LEFT] && ! s[RIGHT] ) return undefined;

      // TODO: add a unit test to verify that the size
      // adjusting logic is correct here.
      var side = s[LEFT] ? LEFT : RIGHT;

      // TODO: it would be faster if successor and predecessor also deleted
      // the entry at the same time in order to prevent two traversals.
      // But, this would also duplicate the delete logic.
      var l = side === LEFT ?
        this.predecessor(s) :
        this.successor(s)   ;

      s[KEY] = l[KEY];
      s[VALUE] = l[VALUE];

      s[side] = this.removeNode(s[side], l[KEY]);
    } else {
      var side = r > 0 ? LEFT : RIGHT;

      s[SIZE] -= this.size(s[side]);
      s[side] = this.removeKeyValue(s[side], key, value);
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

  removeNode: function(s, key) {
    if ( ! s ) return s;

    var r = this.compare(s[KEY], key);

    if ( r === 0 ) return s[LEFT] ? s[LEFT] : s[RIGHT];

    var side = r > 0 ? LEFT : RIGHT;

    s[SIZE] -= this.size(s[side]);
    s[side] = this.removeNode(s[side], key);
    s[SIZE] += this.size(s[side]);

    return s;
  },

  predecessor: function(s) {
    if ( ! s[LEFT] ) return s;
    for ( s = s[LEFT] ; s[RIGHT] ; s = s[RIGHT] );
      return s;
  },

  successor: function(s) {
    if ( ! s[RIGHT] ) return s;
    for ( s = s[RIGHT] ; s[LEFT] ; s = s[LEFT] );
      return s;
  },

  // input: T, a tree for which we want to remove links that skip levels.
  // output: T with its level decreased.
  decreaseLevel: function(s) {
    var expectedLevel = Math.min(s[LEFT] ? s[LEFT][LEVEL] : 0, s[RIGHT] ? s[RIGHT][LEVEL] : 0) + 1;

    if ( expectedLevel < s[LEVEL] ) {
      s[LEVEL] = expectedLevel;
      if ( s[RIGHT] && expectedLevel < s[RIGHT][LEVEL] ) {
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

  selectReverse: function(s, sink, options) {
    if ( ! s ) return;

    if ( options ) {
      if ( 'limit' in options && options.limit <= 0 ) return;

      var size = this.size(s);
      if ( options.skip >= size ) {
        options.skip -= size;
        return;
      }
    }

    this.selectReverse(s[RIGHT], sink, options);
    this.tail.selectReverse(s[VALUE], sink, options);
    this.selectReverse(s[LEFT], sink, options);
  },

  size: function(s) { return s ? s[SIZE] : 0; },

  compare: function(o1, o2) {
    return o1.compareTo(o2); //this.prop.compare(o1, o2);
  },

  plan: function(s, sink, options) {
    var query = options && options.query;

    if ( query === FALSE ) return NOT_FOUND;

    if ( ! query && sink.model_ === CountExpr ) {
      var count = this.size(s);
      //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
      return {
        cost: 0,
        execute: function(unused, sink, options) { sink.count = count; },
        toString: function() { return 'short-circuit-count(' + count + ')'; }
      };
    }

    var prop = this.prop;

    var isExprMatch = function(model) {
      if ( query ) {

        if ( query.model_ === model && query.arg1 === prop ) {
          var arg2 = query.arg2;
          query = undefined;
          return arg2;
        }

        if ( query.model_ === AndExpr ) {
          for ( var i = 0 ; i < query.args.length ; i++ ) {
            var q = query.args[i];
            if ( q.model_ === EqExpr && q.arg1 === prop ) {
              query = query.deepClone();
              query.args[i] = TRUE;
              query = query.partialEval();
              if ( query === TRUE ) query = null;
              return q.arg2.f();
            }
          }
        }
      }

      return undefined;
    };

    // if ( sink.model_ === GroupByExpr && sink.arg1 === prop ) {
    // console.log('**************** GROUP-BY SHORT-CIRCUIT ****************');
    // TODO:
    // }

    var index = this;

    var arg2 = isExprMatch(InExpr);
    if ( key &&
         // Just scan if that would be faster.
         Math.log(this.size(s))/Math.log(2) * query.arg2.length < this.size(s) ) {
      var keys = arg2;
      var subPlans = [];
      var results  = [];
      var cost = 1;

      var newOptions = {};
      if ( 'limit' in options ) newOptions.limit = options.limit;
      if ( 'skip' in options ) newOptions.skip = options.skip;
      if ( 'order' in options ) newOptions.order = options.order;

      for ( var i = 0 ; i < keys.length ; i++) {
        var result = this.get(s, keys[i]);

        if ( result ) {
          var subPlan = this.tail.plan(result, sink, newOptions);

          cost += subPlan.cost;
          subPlans.push(subPlan);
          results.push(result);
        }
      }

      if ( subPlans.length == 0 ) return NOT_FOUND;

      return {
        cost: 1 + cost,
        execute: function(s2, sink, options) {
          for ( var i = 0 ; i < subPlans.length ; i++ ) {
            subPlans[i].execute(results[i], sink, newOptions);
          }
        },
        toString: function() {
          return 'IN(key=' + prop.name + ', size=' + results.length + ')';
        }
      };
    }

    arg2 = isExprMatch(EqExpr);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var result = this.get(s, key);

      if ( ! result ) return NOT_FOUND;

      //        var newOptions = {__proto__: options, query: query};
      var newOptions = {};
      if ( query ) newOptions.query = query;
      if ( 'limit' in options ) newOptions.limit = options.limit;
      if ( 'skip' in options ) newOptions.skip = options.skip;
      if ( 'order' in options ) newOptions.order = options.order;

      var subPlan = this.tail.plan(result, sink, newOptions);

      return {
        cost: 1 + subPlan.cost,
        execute: function(s2, sink, options) {
          subPlan.execute(result, sink, newOptions);
        },
        toString: function() {
          return 'lookup(key=' + prop.name + ', cost=' + this.cost + (query && query.toSQL ? ', query: ' + query.toSQL() : '') + ') ' + subPlan.toString();
        }
      };
    }

    arg2 = isExprMatch(GtExpr);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var pos = this.findPos(s, key);

      var newOptions = {skip: options.skip || 0 + pos};
      if ( query ) newOptions.query = query;
      if ( 'limit' in options ) newOptions.limit = options.limit;
      if ( 'order' in options ) newOptions.order = options.order;
      options = newOptions;
    }

    var cost = this.size(s);
    var sortRequired = false;
    var reverseSort = false;

    if ( options && options.order ) {
      if ( options.order === prop ) {
        // sort not required
      } else if ( options.order.isDESC && options.order.c == prop ) {
        // reverse-sort, sort not required
        reverseSort = true;
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
          reverseSort ?
            index.selectReverse(s, sink, options) :
            index.select(s, sink, options) ;
        }
      },
      toString: function() { return 'scan(key=' + prop.name + ', cost=' + this.cost + (query && query.toSQL ? ', query: ' + query.toSQL() : '') + ')'; }
    };
  },

  toString: function() {
    return 'TreeIndex(' + this.prop.name + ', ' + this.tail + ')';
  }

};


/** Case-Insensitive TreeIndex **/
var CITreeIndex = {
  __proto__: TreeIndex,

  create: function(prop, tail) {
    tail = tail || ValueIndex;

    return {
      __proto__: this,
      prop: prop,
      tail: tail
    };
  },

  put: function(s, newValue) {
    return this.putKeyValue(s, this.prop.f(newValue).toLowerCase(), newValue);
  },

  remove: function(s, value) {
    return this.removeKeyValue(s, this.prop.f(value).toLowerCase(), value);
  }

};


/** An Index for storing multi-valued properties. **/
var SetIndex = {
  __proto__: TreeIndex,

  create: function(prop, tail) {
    tail = tail || ValueIndex;

    return {
      __proto__: this,
      prop: prop,
      tail: tail
    };
  },

  // TODO: see if this can be done some other way
  dedup: function(obj, value) {
    // NOP, not safe to do here
  },

  put: function(s, newValue) {
    var a = this.prop.f(newValue);

    for ( var i = 0 ; i < a.length ; i++ ) {
      s = this.putKeyValue(s, a[i], newValue);
    }

    return s;
  },

  remove: function(s, value) {
    var a = this.prop.f(value);

    for ( var i = 0 ; i < a.length ; i++ ) {
      s = this.removeKeyValue(s, a[i], value);
    }

    return s;
  }

};



var AltIndex = {
  // Maximum cost for a plan which is good enough to not bother looking at the rest.
  GOOD_ENOUGH_PLAN: 8, // put to 10 or more when not testing

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

    return this;
  },

  bulkLoad: function(a) {
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      this.root[i] = this.delegates[i].bulkLoad(a);
    }
  },

  get: function(s, key) {
    return this.delegates[0].get(s[0], key);
  },

  put: function(s, newValue) {
    s = s || [];
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      s[i] = this.delegates[i].put(s[i], newValue);
    }

    return s;
  },

  remove: function(s, obj) {
    s = s || [];
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      s[i] = this.delegates[i].remove(s[i], obj);
    }

    return s;
  },

  plan: function(s, sink, options) {
    var bestPlan;
    var bestPlanI = 0;
    //    console.log('Planning: ' + (options && options.query && options.query.toSQL && options.query.toSQL()));
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      var plan = this.delegates[i].plan(s[i], sink, options);

      // console.log('  plan ' + i + ': ' + plan);
      if ( plan.cost <= AltIndex.GOOD_ENOUGH_PLAN ) {
        bestPlanI = i;
        bestPlan = plan;
        break;
      }

      if ( ! bestPlan || plan.cost < bestPlan.cost ) {
        bestPlanI = i;
        bestPlan = plan;
      }
    }

    //    console.log('Best Plan: ' + bestPlan);

    return {
      __proto__: bestPlan,
      execute: function(unused, sink, options) { bestPlan.execute(s[bestPlanI], sink, options); }
    };
  },

  size: function(obj) { return this.delegates[0].size(obj[0]); },

  toString: function() {
    return 'Alt(' + this.delegates.join(',') + ')';
  }
};


var mLangIndex = {
  create: function(mlang) {
    return {
      __proto__: this,
      mlang: mlang,
      PLAN: {
        cost: 0,
        execute: function(s, sink, options) { sink.copyFrom(s); },
        toString: function() { return 'mLangIndex(' + this.s + ')'; }
      }
    };
  },

  bulkLoad: function(a) {
    a.select(this.mlang);
    return this.mlang;
  },

  put: function(s, newValue) {
    s = s || this.mlang.clone();
    s.put(newValue);
    return s;
  },

  remove: function(s, obj) {
    s = s || this.mlang.clone();
    s.remove && s.remove(obj);
    return s;
  },

  size: function(s) { return Number.MAX_VALUE; },

  plan: function(s, sink, options) {
    // console.log('s');
    if ( options && options.query ) return NO_PLAN;

    if ( sink.model_ && s.model_ === sink.model_ && s.arg1 === sink.arg1 ) {
      this.PLAN.s = s;
      return this.PLAN;
    }

    return NO_PLAN;
  },

  toString: function() {
    return 'mLangIndex(' + this.mlang + ')';
  }

};


var MDAO = Model.create({
  extendsModel: 'AbstractDAO',

  name: 'MDAO',
  label: 'Indexed DAO',

  properties: [
    {
      name:  'model',
      type:  'Model',
      required: true
    }
  ],

  methods: {

    init: function() {
      this.SUPER();

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
	if (!props[props.length - 1]) throw "Undefined index property";
      }

      return this.addUniqueIndex.apply(this, props);
    },

    /**
     * Add a unique index
     * args: one or more properties
     **/
    addUniqueIndex: function() {
      var index = ValueIndex;

      for ( var i = arguments.length-1 ; i >= 0 ; i-- ) {
	var prop = arguments[i];
	// TODO: the index prototype should be in the property
	var proto = prop.type == 'Array[]' ? SetIndex : TreeIndex;
	index = proto.create(prop, index);
      }

      return this.addRawIndex(index);
    },

    // TODO: name 'addIndex' and renamed addIndex
    addRawIndex: function(index) {
      // Upgrade single Index to an AltIndex if required.
      if ( ! /*AltIndex.isInstance(this.index)*/ this.index.delegates ) {
	this.index = AltIndex.create(this.index);
	this.root = [this.root];
      }

      this.index.addIndex(this.root, index);

      return this;
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
      var oldValue = this.index.get(this.root, key);
      if ( oldValue ) {
	this.root = this.index.put(this.index.remove(this.root, obj), obj);
	this.notify_('remove', [obj]);
      } else {
	this.root = this.index.put(this.root, obj);
      }
      this.notify_('put', [obj]);
      sink && sink.put && sink.put(obj);
    },

    findObj_: function(key, sink) {
      var obj = this.index.get(this.root, key);
      if ( obj ) {
	sink.put(obj);
      } else {
	sink.error && sink.error('find', key);
      }
    },

    find: function(key, sink) {
      if ( ! key.f ) { // TODO: make better test, use model
	this.findObj_(key, sink);
	return;
      }
      // How to handle multi value primary keys?
      var found = false;
      this.where(key).limit(1).select({
	// ???: Is 'put' needed?
	put: function(obj) {
	  found = true;
	  sink && sink.put && sink.put(obj);
	},
	eof: function() {
	  if ( ! found ) sink && sink.error && sink.error('find', key);
	}
      });
    },

    // TODO: this isn't correct, this is actually removeAll()
    remove: function(query, sink) {
      query = query.f ? query : EQ(this.model.getProperty(this.model.ids[0]), query);
      /*
	if ( ! query.f ) {
	this.root = this.index.remove(this.root, query);
	sink && sink.remove && sink.remove(query);

	return;
	}*/

      this.where(query).select([])(function(a) {
	for ( var i = 0 ; i < a.length ; i++ ) {
	  this.root = this.index.remove(this.root, a[i]);
	  sink && sink.remove && sink.remove(a[i]);
	  this.notify_('remove', [a[i]]);
	}
      }.bind(this));
    },

    removeAll: function(callback) {
      this.root = [];
      callback && callback();
    },

    select: function(sink, options) {
      sink = sink || [];
      // Clone the options to prevent 'limit' from being mutated in the original.
      if ( options ) options = {__proto__: options};

      if ( DescribeExpr.isInstance(sink) ) {
	var plan = this.index.plan(this.root, sink.arg1, options);
	sink.plan = 'cost: ' + plan.cost + ', ' + plan.toString();
      } else {
	var plan = this.index.plan(this.root, sink, options);
	plan.execute(this.root, sink, options);
      }

      sink && sink.eof && sink.eof();
      return aconstant(sink);
    },

    toString: function() {
      return 'MDAO(' + this.model.name + ',' + this.index + ')';
    }
  }
});
