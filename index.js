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