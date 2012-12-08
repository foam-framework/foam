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


var StringComparator = function(s1, s2) {
  if ( s1 === s2 ) return 0;
  return s1 < s2 ? -1 : 1;
};

var toCompare = function(c) {
  if ( Array.isArray(c) ) return CompoundComparator.apply(null, c);

  return c.compare ? c.compare.bind(c) : c;
};

/** Reverse the direction of a comparator. **/
var DESC = function(c) {
  c = toCompare(c);
  return function(o1, o2) { return c(o2,o1); };
};

var CompoundComparator = function() {
  var cs = arguments;

  // Convert objects with .compare() methods to compare functions.
  for ( var i = 0 ; i < cs.length ; i++ )
    cs[i] = toCompare(cs[i]);

  return function(o1, o2) {
    for ( var i = 0 ; i < cs.length ; i++ ) {
      var r = cs[i](o1, o2);
      if ( r != 0 ) return r;
    }
    return 0;
  };
};

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
  addToNode: function(oldObj, newObj) { console.log('duplicate', newObj); }
};

var idx = Index.create(StringComparator);

idx.put('k');
idx.put('e');
idx.put('v');
idx.put('i');
idx.put('n');

idx.select(console.log);

