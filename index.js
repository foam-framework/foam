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
  put: function(c, obj) {
    return Node.create(obj, this, this, 1);
  },
  find: function() { return undefined; },
  select: function(c, sink) { }
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
  put: function(c, obj) {
    var r = c(this.obj, obj);

    if ( r === 0 ) {
      console.log('dup');
    } else if ( r > 0 ) {
      this.size -= this.left.size;
      this.left = this.left.put(c, obj);
      this.size += this.left.size;
    } else {
      this.size -= this.right.size;
      this.right = this.right.put(c, obj);
      this.size += this.right.size;
    }

    return this;
  },
  select: function(c, sink) {
    this.left.select(c, sink);
    sink.put(this.obj);
    this.right.select(c, sink);
  }
};

var Index = {
  create: function(comparator) {
    return {
      __proto__: this,
      root: EMPTY,
      comparator: comparator
    };
  },
  put: function(obj) { this.root = this.root.put(this.comparator, obj); },
  find: function(obj) { return this.root.find(this.comparator, obj); },
  select: function(sink) { this.root.select(this.comparator, sink); },
  size: function() { return this.root.size; }
};

var StringComparator = function(s1, s2) {
  if ( s1 === s2 ) return 0;
  return s1 < s2 ? -1 : 1;
};

var idx = Index.create(StringComparator);

idx.put('k');
idx.put('e');
idx.put('v');
idx.put('i');
idx.put('n');

idx.select(console.log);

