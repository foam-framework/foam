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


var EMPTY = {
  size: 0,
  put: function(idx, obj) {
    return Node.create(obj, this, this, 1);
  },
  find: function() { return undefined; },
  select: function(idx, sink) { }
};


var Node = {
  create: function(obj, left, right, size) {
    return {
      __proto__: this,
      obj:   obj,
      left:  left,
      right: right,
      size:  size
    };
  },
  put: function(idx, obj) {
    var r = idx.compare(this.obj, obj);

    if ( r === 0 ) {
      idx.addToNode(this.obj, obj);
    } else if ( r > 0 ) {
      this.size -= this.left.size;
      this.left = this.left.put(idx, obj);
      this.size += this.left.size;
    } else {
      this.size -= this.right.size;
      this.right = this.right.put(idx, obj);
      this.size += this.right.size;
    }

    return this;
  },
  select: function(idx, sink) {
    this.left.select(idx, sink);
    sink.put(this.obj);
    this.right.select(idx, sink);
  }
};


var Index = {
  create: function(compare) {
    return {
      __proto__: this,
      root: EMPTY,
      compare: compare
    };
  },
  put: function(obj) { this.root = this.root.put(this, obj); },
  find: function(obj) { return this.root.find(this, obj); },
  select: function(sink) { this.root.select(this, sink); },
  size: function() { return this.root.size; },
  createNode: function(obj) { return Node.create(obj, this, this, 1); },
  addToNode: function(node, newObj) { console.log('duplicate', newObj); }
};


var CompoundIndex = {
  create: function() {
    if ( arguments.length == 1 ) return Index.create(arguments[0]);

    return {
      __proto__: this,
      root: EMPTY,
      compare: toCompare(arguments[0]),
      remainingComparators: argsToArray(arguments).slice(1)
    };
  },
  put: function(obj) { this.root = this.root.put(this, obj); },
  find: function(obj) { return this.root.find(this, obj); },
  select: function(sink) { this.root.select(this, sink); },
  size: function() { return this.root.size; },
  createNode: function(obj) {
    return CompoundIndex.create.apply(null, this.remainingComparators);
  },
  addToNode: function(node, newObj) {
    node.obj = node.obj.put(newObj);
  }
};

var idx = Index.create(StringComparator);

idx.put('k');
idx.put('e');
idx.put('v');
idx.put('i');
idx.put('n');

idx.select(console.log);

// [obj,left,right]

var OrderedSet = {
  create: function(prop) {
    return {
      __proto__: this,
      root: [],
      prop: prop
    };
  },
  putToNode: function(s, obj) {
    s[0] = obj;
  },
  compare: function(o1, o2) {
    return this.prop.compare(o1, o2);
  },

  put: function(obj) { this.put_(this.root, obj); },
  select: function(sink) { this.select_(this.root, sink); },

  put_: function(s, obj) {
if ( ! s ) {
  debugger;
}
    if ( ! s[0] ) {
      this.putToNode(s, obj);
      return;
    }

    var r = this.compare(s[0], obj);

    if ( r === 0 ) {
      this.putToNode(s, obj);
    } else if ( r > 0 ) {
      this.put_(s[1] || (s[1] = []), obj);
    } else {
      this.put_(s[2] || (s[2] = []), obj);
    }
  },
  select_: function(s, sink) {
    if ( ! s ) return;
    this.select_(s[1], sink);
    if (!sink) {
      debugger;
    }
    sink.put(s[0]);
    this.select_(s[2], sink);
  }
};

var s = OrderedSet.create({compare: StringComparator});

// s = SEQ(s, COUNT());

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

// By(p, By(p, ByUnique(p)))

var UNIQUE = {
  put_: function(s, obj) {
    s[0] = obj;
  },
  select_: function(s, sink) {
    sink.put(s[0]);
  },
  get_: function(s) { return s[0]; }

};

var By = {
  create: function(prop, tail) {
    tail = tail || UNIQUE;
    return {
      __proto__: this,
      prop: prop,
      tail: tail,
      set: {
        __proto__: OrderedSet.create(prop),
        compare: function(o1, o2) {
          o1 = this.tail.get_(o1);
          o2 = this.tail.get_(o2);

          return prop.compare(o1, o2);
        },
        putToNode: function(s, obj) {
          tail.put_(s, obj);
        }
      }
    };
  },

  put: function(obj) { this.put_(this.root, obj); },
  select: function(sink) { this.select_(this.root, sink); },

  put_: function(s, obj) {
    this.set.put_(s, obj);
  },
  select_: function(s, sink) {
    this.set.select_(s, sink);
  },
  get_: function(s) { return this.tail.get(s); }
};

var i2 = By.create({compare: StringComparator});

console.log('index test');

i2.put('k');
i2.put('e');
i2.put('v');
i2.put('i');
i2.put('n');
i2.put('kevin');
i2.put('greer');
i2.put('was');
i2.put('here');
i2.put('boo');


i2.select(console.log);
