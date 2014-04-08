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

var DEBUG = false;

var DEBUG_STACK = DEBUG ?
  function() { return new Error().stack; } :
  function() { return 'Set DEBUG = true in stdlib.js for stacktrace.'; } ;

var GLOBAL = GLOBAL || this;

/** Create a memoized version of a function. **/
function memoize(f) {
  var cache = {};

  return function() {
    var key = argsToArray(arguments).toString();
    if ( ! cache.hasOwnProperty(key) ) {
      cache[key] = f.apply(this, arguments);
    }
    return cache[key];
  };
}


if ( ! String.prototype.startsWith ) {
  // This implementation is very slow for some reason
  String.prototype.startsWith = function (a) { return 0 == this.lastIndexOf(a, 0); };
  /*
    But this one isn't any faster.
  String.prototype.startsWith = function (a) {
    if ( a.length > this.length ) return false;
    var l = a.length;
    for ( var i = 0 ; i < l ; i++ ) if ( this.charCodeAt(i) !== a.charCodeAt(i) ) return false;
    return true;
  };
  */
}

String.prototype.equalsIC = function(other) {
  return other && this.toUpperCase() === other.toUpperCase();
};

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.labelize = function() {
  return this.replace(/[a-z][A-Z]/g, function (a) {
    return a.charAt(0) + ' ' + a.charAt(1);
  }).capitalize();
};

// switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
String.prototype.constantize = function() {
    return this.replace(/[a-z][^a-z]/g, function(a) { return a.substring(0,1) + '_' + a.substring(1,2); }).toUpperCase();
};

/** Give all objects a Unique ID. **/
Object.defineProperty(Object.prototype, '$UID', {
  get: (function() {
    var id = 1;

    return function() {
      return this.$UID__ || (this.$UID__ = id++);
    };
  })()
});

Object.defineProperty(Object.prototype, 'clone', {
  value: function() { return this; }
});

// Fallback to shallow clone() if deepClone() missing.
Object.defineProperty(Object.prototype, 'deepClone', {
  value: function() { return this.clone(); }
});

Object.defineProperty(Object.prototype, 'become', {
  value: function(other) {
    var local = Object.getOwnPropertyNames(this);
    for ( var i = 0; i < local.length; i++ ) {
      delete this[local[i]];
    }

    var remote = Object.getOwnPropertyNames(other);
    for ( i = 0; i < remote.length; i++ ) {
      Object.defineProperty(this, remote[i],
                            Object.getOwnPropertyDescriptor(other, remote[i]));
    }
    this.__proto__ = other.__proto__;
  }
});

/** Create a function which always returns the supplied constant value. **/
function constantFn(v) { return function() { return v; }; }


/**
 * Replace Function.bind with a version
 * which is ~10X faster for the common case
 * where you're only binding 'this'.
 **/
Function.prototype.bind = (function() {
  var oldBind    = Function.prototype.bind;
  var simpleBind = function(f, self) {
    var ret = function() { return f.apply(self, arguments); };
    ret.toString = function() {
      return f.toString();
    };
    return ret;
  };

  return function(arg) {
    return arguments.length == 1 ?
      simpleBind(this, arg) :
      oldBind.apply(this, argsToArray(arguments));
  };
})();


Date.prototype.toRelativeDateString = function() {
  var seconds = Math.floor((Date.now() - this.getTime())/1000);

  if ( seconds < 60 ) return 'moments ago';

  var minutes = Math.floor((seconds)/60);

  if ( minutes == 1 ) return '1 minute ago';

  if ( minutes < 60 ) return minutes + ' minutes ago';

  var hours = Math.floor(minutes/60);
  if ( hours == 1 ) return '1 hour ago';

  if ( hours < 24 ) return hours + ' hours ago';

  var days = Math.floor(hours / 24);
  if ( days == 1 ) return '1 day ago';

  if ( days < 7 ) return days + ' days ago';

  if ( days < 365 ) {
    var year = 1900+this.getYear();
    var noyear = this.toDateString().replace(" " + year, "");
    return noyear.substring(4);
  }

  return this.toDateString().substring(4);
};

// Define extensions to built-in prototypes as non-enumerable properties so
// that they don't mess up with Array or Object iteration code.
// (Which needs to be fixed anyway.)

Date.prototype.compareTo = function(o) {
  if ( o === this ) return 0;
  var d = this.getTime() - o.getTime();
  return d == 0 ? 0 : d > 0 ? 1 : -1;
};

Date.prototype.toMQL = function() {
  return this.getFullYear() + '/' + (this.getMonth() + 1) + '/' + this.getDate();
};

String.prototype.compareTo = function(o) {
  if ( o == this ) return 0;
  return this < o ? -1 : 1;
};

Number.prototype.compareTo = function(o) {
  if ( o == this ) return 0;
  return this < o ? -1 : 1;
};

Boolean.prototype.compareTo = function(o) {
  return (this.valueOf() ? 1 : 0) - (o ? 1 : 0);
};

var argsToArray = function(args) {
  var array = new Array(args.length);
  for ( var i = 0; i < args.length; i++ ) array[i] = args[i];
  return array;
};

var StringComparator = function(s1, s2) {
  if ( s1 == s2 ) return 0;
  return s1 < s2 ? -1 : 1;
};

var toCompare = function(c) {
  if ( Array.isArray(c) ) return CompoundComparator.apply(null, c);

  return c.compare ? c.compare.bind(c) : c;
};

// binaryInsert into a sorted array, removing duplicates
Object.defineProperty(Array.prototype, 'binaryInsert', {
  value: function(item) {
    var start = 0;
    var end = this.length-1;

    while ( end >= start ) {
      var m = start + Math.floor((end-start) / 2);
      var c = item.compareTo(this[m]);
      if ( c == 0 ) return this; // already there, nothing to do
      if ( c < 0 ) { end = m-1; } else { start = m+1; }
    }

    this.splice(start, 0, item);

    return this;
  }
});

// TODO: binarySearch

Object.defineProperty(Array.prototype, 'intern', {
  value: function() {
    for ( var i = 0 ; i < this.length ; i++ )
      if ( this[i].intern ) this[i] = this[i].intern();

    return this;
  }
});

Object.defineProperty(Array.prototype, 'compareTo', {
  value: function(other) {
    if ( this.length !== other.length ) return -1;

    for ( var i = 0 ; i < this.length ; i++ ) {
      var result = this[i].compareTo(other[i]);
      if ( result !== 0 ) return result;
    }
    return 0;
  }
});

Object.defineProperty(Array.prototype, 'fReduce', {
  value: function(comparator, arr) {
    compare = toCompare(comparator);
    var result = [];

    var i = 0;
    var j = 0;
    var k = 0;
    while(i < this.length && j < arr.length) {
      var a = compare(this[i], arr[j]);
      if ( a < 0 ) {
        result[k++] = this[i++];
        continue;
      }
      if ( a == 0) {
        result[k++] = this[i++];
        result[k++] = arr[j++];
        continue;
      }
      result[k++] = arr[j++];
    }

    if ( i != this.length ) result = result.concat(this.slice(i));
    if ( j != arr.length ) result = result.concat(arr.slice(j));

    return result;
  }
});

/** Reverse the direction of a comparator. **/

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


/**
 * Take an array where even values are weights and odd values are functions,
 * and execute one of the functions with propability equal to it's relative
 * weight.
 */
// TODO: move this method somewhere better
function randomAct() {
  var totalWeight = 0.0;
  for ( var i = 0 ; i < arguments.length ; i += 2 ) totalWeight += arguments[i];

  var r = Math.random();

  for ( var i = 0, weight = 0 ; i < arguments.length ; i += 2 ) {
    weight += arguments[i];
    if ( r <= weight / totalWeight ) {
      arguments[i+1]();
      return;
    }
  }
}


function defineProperties(proto, fns) {
  for ( var key in fns ) {
    try {
      Object.defineProperty(proto, key, {
        value: fns[key],
        configurable: true,
        writable: true
      });
    } catch (x) {
      console.log('Warning: ' + x);
    }
  }
}


/**
 * Push an array of values onto an array.
 * @param arr array of values
 * @return new length of this array
 */
// TODO: not needed, port and replace with pipe()
Object.defineProperty(Array.prototype, 'pushAll', {
  value: function(arr) {
    this.push.apply(this, arr);
    return this.length;
}});


/**
 * Search for a single element in an array.
 * @param predicate used to determine element to find
 * @param action to be called with (key, index) arguments
 *        when found
 */
/*
Object.defineProperty(Array.prototype, 'find', {
  value: function(predicate, action) {
  for (var i=0; i<this.length; i++)
    if (predicate(this[i], i)) {
      return action(this[i], i) || this[i];
    }
  return undefined;
}});
*/

/** Remove an element from an array. **/
/*
Object.defineProperty(Array.prototype, 'remove', {
  value: function(obj) {
    var i = this.indexOf(obj);

    if ( i != -1 ) this.splice(i, 1);

    return this;
}});
*/

/**
 * ForEach operator on Objects.
 * Calls function with arguments (obj, key).
 **/
/*
Object.defineProperty(Object.prototype, 'forEach', {
  value: function(fn) {
    for ( var key in this ) if (this.hasOwnProperty(key)) fn(this[key], key);
}});*/

// Workaround for crbug.com/258522
function Object_forEach(obj, fn) {
  for (var key in obj) if (obj.hasOwnProperty(key)) fn(obj[key], key);
}

/*
Object.defineProperty(Object.prototype, 'put', {
  value: function(obj) {
    this[obj.id] = obj;
  },
  configurable: true,
  writable: true
});
*/

function predicatedSink(predicate, sink) {
  if ( predicate === TRUE ) return sink;

  return {
    __proto__: sink,
    put: function(obj, s, fc) {
      if ( obj && sink && predicate.f(obj) ) sink.put(obj, s, fc);
    }/*,
    eof: function() {
      sink && sink.eof && sink.eof();
    }*/
  };
}

function limitedSink(count, sink) {
  var i = 0;
  return {
    __proto__: sink,
    put: function(obj, s, fc) {
      if ( i++ >= count && fc ) {
        fc.stop();
      } else {
        sink.put(obj, s, fc);
      }
    }/*,
    eof: function() {
      sink.eof && sink.eof();
    }*/
  };
}

function skipSink(skip, sink) {
  var i = 0;
  return {
    __proto__: sink,
    put: function(obj, s, fc) {
      if ( i++ >= skip ) sink.put(obj, s, fc);
    }
  };
}

function orderedSink(comparator, sink) {
  comparator = toCompare(comparator);
  return {
    __proto__: sink,
    i: 0,
    arr: [],
    put: function(obj, s, fc) {
      this.arr.push(obj);
    },
    eof: function() {
      this.arr.sort(comparator);
      this.arr.select(sink);
    }
  };
}


console.log.json = function() {
   var args = [];
   for ( var i = 0 ; i < arguments.length ; i++ ) {
     var arg = arguments[i];
     args.push(arg && arg.toJSON ? arg.toJSON() : arg);
   }
   console.log.apply(console, args);
};

console.log.str = function() {
   var args = [];
   for ( var i = 0 ; i < arguments.length ; i++ ) {
     var arg = arguments[i];
     args.push(arg && arg.toString ? arg.toString() : arg);
   }
   console.log.apply(console, args);
};

// Promote 'console.log' into a Sink
console.log.put         = console.log.bind(console);
console.log.remove      = console.log.bind(console, 'remove: ');
console.log.error       = console.log.bind(console, 'error: ');
console.log.json.put    = console.log.json.bind(console);
console.log.json.reduceI = console.log.json.bind(console, 'reduceI: ');
console.log.json.remove = console.log.json.bind(console, 'remove: ');
console.log.json.error  = console.log.json.bind(console, 'error: ');
console.log.str.put     = console.log.str.bind(console);
console.log.str.remove  = console.log.str.bind(console, 'remove: ');
console.log.str.error  = console.log.str.bind(console, 'error: ');

document.put = function(obj) {
  if ( obj.write ) {
    obj.write(this);
  } else {
    this.write(obj.toString());
  }
};

String.prototype.put = function(obj) { return this + obj.toJSON(); };

// Promote webkit apis

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

if (window.Blob) {
  Blob.prototype.slice = Blob.prototype.slice || Blob.prototype.webkitSlice;
}

/** Convert a string to an internal canonical copy. **/
String.prototype.intern = (function() {
  var map = {};

  return function() { return map[this] || (map[this] = this.toString()); };
})();

if (window.XMLHttpRequest) {
  /**
      * Add an afunc send to XMLHttpRequest
  */
  XMLHttpRequest.prototype.asend = function(ret, opt_data) {
    var xhr = this;
    xhr.onerror = function() {
      console.log('XHR Error: ', arguments);
    };
    xhr.onloadend = function() {
      ret(xhr.response, xhr);
    };
    xhr.send(opt_data);
  };
}

RegExp.quote = function(str) {
  return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
};

var FeatureSet = {
  create: function() {
    var obj = Object.create(this);
    obj.a_ = [];
    obj.version_ = 1;
    obj.parentVersion_ = 0;
    obj.names_ = {};
    return obj;
  },

  where: function(p) {
    var predicate = p;
    if ( this.predicate_ ) {
      var old = this.predicate_;
      predicate = function(o) {
        return old(o) && p(o);
      };
    }

    return {
      __proto__: this,
      predicate_: predicate,
      forEach: function(iterator) {
        return this.__proto__.forEach.call(this, iterator, this.predicate_);
      },
      localForEach: function(iterator) {
        return this.__proto__.localForEach.call(this, iterator, this.predicate_);
      },
    };
  },

  forEach: function(iterator, opt_predicate) {
    var self = this;
    if ( this.parent )
      this.parent.where(function(f) {
        return !f.name || !self.names_[f.name];
      }).forEach(iterator);
    this.localForEach(iterator);
  },

  localForEach: function(iterator, opt_predicate) {
    for ( var i = 0; i < this.a_.length; i++ ) {
      var f = this.a_[i];

      if ( opt_predicate && ! opt_predicate(f) )
        continue;

      if ( f.name && f !== this.names_[f.name] )
        continue;

      iterator(this.a_[i]);
    }
  },

  add: function(a) {
    if ( a.name ) this.names_[a.name] = a;
    this.a_.push(a);
    this.version_++;
  },

  get parent() { return this.parent_; },
  set parent(p)  { this.parent_ = p; },

  get version() {
    return this.version_;
  }
};
