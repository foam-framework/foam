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


// [obj,size,left,right]

var UniqueIndex = {
  createValue_: function(obj) { return obj; },
  updateValue_: function(oldObj, newObj) { return newObj; },
  selectValue_: function(obj, sink) { sink.put(obj); },
  getValue_: function(obj) { return obj; },
  valueSize_: function(obj) { return 1; }
};


var OrderedSet = {
  __proto__: UniqueIndex,

  create: function(prop) {
    return {
      __proto__: this,
      root: [],
      prop: prop
    };
  },

  put: function(obj) { this.put_(this.root, obj); },

  get: function(key) { return this.get_(this.root, key); },

  select: function(sink) { this.select_(this.root, sink); },

  size: function() { return this.size_(this.root); },

  size_: function(obj) { return obj[1]; },

  put_: function(s, obj) {
    if ( ! s[0] ) {
      s[0] = this.createValue_(obj);
      s[1] = 1;
      return;
    }

    var v = this.getValue_(s[0]);
    var r = v ? this.compare(v, obj) : 0;

    if ( r == 0 ) {
      s[1] -= this.valueSize_(s[0]);
      s[0] = this.updateValue_(s[0], obj);
      s[1] += this.valueSize_(s[0]);
    } else if ( r > 0 ) {
      if ( s[2] ) s[1] -= s[2][1];
      this.put_(s[2] || (s[2] = []), obj);
      s[1] += s[2][1];
    } else {
      if ( s[3] ) s[1] -= s[3][1];
      this.put_(s[3] || (s[3] = []), obj);
      s[1] += s[3][1];
    }
  },

  get_: function(s, key) {
    if ( ! s ) return undefined;

    var v = this.getValue_(s[0]);
    var r = this.compare(v, key);

    if ( r === 0 ) return v;

    return this.get_(r > 0 ? s[2] : s[3], key);
  },

  select_: function(s, sink) {
    if ( ! s ) return;
    this.select_(s[2], sink);
    this.selectValue_(s[0], sink);
    this.select_(s[3], sink);
  },

  compare: function(o1, o2) {
    return this.prop.compare(o1, o2);
  }

};

var s = OrderedSet.create({compare: StringComparator});

console.log('\nOrderedSet Test');
s.put('k');
s.put('e');
s.put('v');
s.put('i');
s.put('n');
s.put('kevin');
s.put('greer');
s.put('was');
s.put('here');
s.put('boo');

s.select(console.log);
console.log(s.get('kevin'));
console.log(s.get('here'));
console.log(s.get('smith'));



// PropertyIndex(p, PropertyIndex(p, PropertyIndexUnique(p)))

var PropertyIndex = {
  create: function(prop, tail) {
    tail = tail || UniqueIndex;
    return {
      __proto__: this,
      prop: prop,
      tail: tail,
      set: {
        __proto__: OrderedSet.create(prop),
        compare: function(o1, o2) {
          return prop.compare(o1, o2);
        },
        createValue_: function(obj) { return tail.createValue_(obj); },
        updateValue_: function(oldObj, newObj) { return tail.updateValue_(oldObj, newObj); },
	selectValue_: function(obj, sink) { tail.selectValue_(obj, sink); },
	getValue_: function(obj) { return tail.getValue_(obj); },
	valueSize_: function(obj) { return tail.valueSize_(obj); }
      }
    };
  },

  put: function(obj) { this.put_(this.set.root, obj); },
  select: function(sink) { this.select_(this.set.root, sink); },

  put_: function(s, obj) {
    this.set.put_(s, obj);
  },
  select_: function(s, sink) {
    this.set.select_(s, sink);
  },
  get_: function(s, key) { return this.tail.get_(s[0]); },

  createValue_: function(obj) {
     var ret = [];
     this.set.put_(ret, obj);
     return ret;
  },
  updateValue_: function(oldObj, newObj) { this.set.put_(oldObj, newObj); return oldObj; },
  selectValue_: function(obj, sink) { this.set.select_(obj, sink); },
  getValue_: function(obj) { return this.tail.getValue_(obj)[0]; },
  valueSize_: function(obj) { return obj[1]; },

  plan: function(s, options, sink) {
    var query = options && options.query;

    var getEQKey = function (query) {
      if ( query.model_ === EqExpr && query.arg1 === this.prop ) {
        return query.arg2.f();
      }
      return undefined;
    };
    var getAndKey = function () {
      if ( query.model_ === AndExpr ) {
        for ( var i = 0 ; i < query.args.length ; i++ ) {
          var q = query.args[i];
          var k = getEQKey.call(this, q);
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
      var key = getEQKey.call(this, query) || getAndKey.call(this);
      if ( key ) {
        // TODO: how to do a get()?
debugger;
        var result = this.set.get_(s, key);
        var prop = this.prop;
        return {
          cost: result ? this.valueSize_(result) : 0,
          execute: function() {
            console.log('key(' + prop.name + ')', options, sink, this, query);
          }
        };
      }
    }

    return {
      cost: this.set.size(),
      execute: function() {
        console.log('scan', options, sink, this, query);
      }
    };
  }
};


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

var Count = {
   create: function() {
     return {
	__proto__: this
     };
   },

  createValue_: function(obj) { return 1; },
  updateValue_: function(oldObj, newObj) { return oldObj+1; },
  selectValue_: function(obj, sink) { },
  getValue_: function(obj) { return obj; }
};


// Cost of a good plan.
var GOOD_PLAN = 1; // 10; // put to 1 for testing


var AltIndex = {
   create: function() {
      var root = [];
      for ( var i = 0 ; i < arguments.length ; i++ ) root.push([]);
      return {
	 __proto__: this,
	 delegates: arguments,
         root: root
      };
   },

  put: function(obj) { this.put_(this.root, obj); },
  select: function(sink) { this.select_(this.root, sink); },

  put_: function(oldObj, newObj) {
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      this.delegates[i].put_(oldObj[i], newObj);
    }
  },
  updateValue_: function(oldObj, newObj) {
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      oldObj[i] = this.delegates[i].updateValue_(oldObj[i], newObj);
    }
    return oldObj;
  },

  select_: function(s, sink) { this.delegates[0].select_(s[0], sink); },

  plan: function(s, options, sink) {
    s = s || this.root;
    var bestPlan;

    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      var plan = this.delegates[i].plan(s[i], options, sink);

      if ( plan ) {
        if ( plan.cost < GOOD_PLAN ) return plan;

        if ( ! bestPlan || plan.cost < bestPlan.cost ) bestPlan = plan;
      }
    }

    return bestPlan;
  },

  createValue_: function(obj) {
    var ret = [];
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      ret.push(this.delegates[i].createValue_(obj));
    }
    return ret;
  },
  updateValue_: function(oldObj, newObj) {
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      oldObj[i] = this.delegates[i].updateValue_(oldObj[i], newObj);
    }
    return oldObj;
  },
  selectValue_: function(obj, sink) { this.delegates[0].selectValue_(obj[0], sink); },
  getValue_: function(obj) { return this.delegates[0].getValue_(obj[0]); },
  valueSize_: function(obj) { return this.delegates[0].valueSize_(obj[0]); }
};

var P1 = {
   model_: EXPR,
   name: 'P1',
   f: function(obj) { return obj[0]; },
   compare: function(o1, o2) { return this.f(o1).compareTo(this.f(o2)); }
};
var P2 = {
   model_: EXPR,
   name: 'P2',
   f: function(obj) { return obj[1]; },
   compare: function(o1, o2) {
      return this.f(o1).compareTo(this.f(o2));
   }
};
var P3 = {
   model_: EXPR,
   name: 'P3',
   f: function(obj) { return obj[2]; },
   compare: function(o1, o2) {
      return this.f(o1).compareTo(this.f(o2));
   }
};
var P4 = {
   model_: EXPR,
   name: 'P4',
   f: function(obj) { return obj[3]; },
   compare: function(o1, o2) {
      return this.f(o1).compareTo(this.f(o2));
   }
};

// var i2 = PropertyIndex.create(P3);
// var i2 = PropertyIndex.create(P1, PropertyIndex.create(P2));

var i2 = AltIndex.create(PropertyIndex.create(P3), PropertyIndex.create(P1, PropertyIndex.create(P2)));

// var i2 = PropertyIndex.create(P1, And.create(PropertyIndex.create(P2), Count.create()));
// var i2 = PropertyIndex.create(P1, And.create(PropertyIndex.create(P1), PropertyIndex.create(P3)));

// var i2 = SetIndex.create(P4, PropertyIndex.create(P3));
// var i2 = PropertyIndex.create(P1, Count.create());

console.log('\nIndex Test');

i2.put(['b','a',1,['x','y','z']]);
i2.put(['a','a',2,['x','y','z']]);
i2.put(['c','c',3,['x','y','z']]);
i2.put(['c','b',4,['x','y']]);
i2.put(['a','b',5,['x','y']]);
i2.put(['b','c',6,['x','z']]);
i2.put(['c','a',7,['x','z']]);
i2.put(['a','c',8,['y','z']]);
i2.put(['b','b',9,[]]);
i2.put(['b','z',9,[]]);

var result = [];
i2.select(result);
i2.select(console.log);
dump(result);

// i2.select(console.log);

// PropertyIndex(p1, And(PropertyIndex(p3), PropertyIndex(p2, PropertyIndex(p3, UniqueIndex)))))

function dump(o) {
   if ( Array.isArray(o) ) return '[' + o.map(dump).join(',') + ']';
   return o ? o.toString() : '<undefined>';
}

i2.plan(null,{query: EQ(P1, 'a')}, console.log).execute();
i2.plan(null,{query: EQ(P2, 'b')}, console.log).execute();
i2.plan(null,{query: EQ(P3, 9)}, console.log).execute();
