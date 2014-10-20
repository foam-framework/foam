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

if ( ! String.prototype.startsWithIC ) {
  String.prototype.startsWithIC = function(a) {
    if ( a.length > this.length ) return false;
    var l = a.length;
    for ( var i = 0 ; i < l; i++ ) {
      if ( this[i].toUpperCase() !== a[i].toUpperCase() ) return false;
    }
    return true;
  };
}

String.prototype.indexOfIC = function(a) {
  if ( a.length > this.length ) return -1;
  return this.toUpperCase().indexOf(a.toUpperCase());
};

String.prototype.equals = function(other) {
  return this.compareTo(other) === 0;
};

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
  // TODO: add property to specify constantization. For now catch special case to avoid conflict with context this.X.
  return this === "x"? "X_" : this.replace(/[a-z_][^a-z_]/g, function(a) { return a.substring(0,1) + '_' + a.substring(1,2); }).toUpperCase();
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
  value: function() { return this; },
  writable: true
});

// Fallback to shallow clone() if deepClone() missing.
Object.defineProperty(Object.prototype, 'deepClone', {
  value: function() { return this.clone(); },
  writable: true
});

Object.defineProperty(String.prototype, 'clone', {
  value: function() { return this.toString(); },
  writable: true
});

Object.defineProperty(Number.prototype, 'clone', {
  value: function() { return +this; },
  writable: true
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
  if ( ! o ) return 1;
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

// Number.isFinite polyfill
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite
if (typeof Number.isFinite !== 'function') {
    Number.isFinite = function isFinite(value) {
        // 1. If Type(number) is not Number, return false.
        if (typeof value !== 'number') {
            return false;
        }
        // 2. If number is NaN, +∞, or −∞, return false.
        if (value !== value || value === Infinity || value === -Infinity) {
            return false;
        }
        // 3. Otherwise, return true.
        return true;
    };
}

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

Object.defineProperty(Array.prototype, 'union', {
  value: function(other) {
    return this.concat(
      other.filter(function(o) { return this.indexOf(o) == -1; }.bind(this)));
  }
});

Object.defineProperty(Array.prototype, 'intersection', {
  value: function(other) {
    return this.filter(function(o) { return other.indexOf(o) != -1; });
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
  var args = argsToArray(arguments);
  var cs = [];

  // Convert objects with .compare() methods to compare functions.
  for ( var i = 0 ; i < args.length ; i++ )
    cs[i] = toCompare(args[i]);

  var f = function(o1, o2) {
    for ( var i = 0 ; i < cs.length ; i++ ) {
      var r = cs[i](o1, o2);
      if ( r != 0 ) return r;
    }
    return 0;
  };

  f.toSQL = function() { return args.map(function(s) { return s.toSQL(); }).join(','); };
  f.toMQL = function() { return args.map(function(s) { return s.toMQL(); }).join(' '); };
  f.toString = f.toSQL;

  return f;
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
 */
Object.defineProperty(Array.prototype, 'mapFind', {
  value: function(map) {
    for (var i = 0;  i < this.length ; i++ ) {
      var result = map(this[i], i);
      if ( result ) return result;
    }
  }
});


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
}});
*/

// Workaround for crbug.com/258552
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
  if ( predicate === TRUE || ! sink ) return sink;

  return {
    __proto__: sink,
    $UID: sink.$UID,
    put: function(obj, s, fc) {
      if ( sink.put && ( ! obj || predicate.f(obj) ) ) sink.put(obj, s, fc);
    },
    remove: function(obj, s, fc) {
      if ( sink.remove && ( ! obj || predicate.f(obj) ) ) sink.remove(obj, s, fc);
    },
    toString: function() { return 'PredicatedSink(' + sink.$UID + ', ' + predicate + ', ' + sink + ')';

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

// Called like myArray.mapProp('name'), that's equivalent to:
// myArray.map(function(x) { return x.name; });
Object.defineProperty(Array.prototype, 'mapProp', {
  value: function(prop) {
    return this.map(function(x) { return x[prop]; });
  }
});

Object.defineProperty(Array.prototype, 'mapCall', {
  value: function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var func = args.shift();
    return this.map(function(x) { return x[func] && x[func].apply(x[func], args); });
  }
});

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

function defineLazyProperty(target, name, definitionFn) {
  Object.defineProperty(target, name, {
    get: function() {
      var definition = definitionFn.call(this);
      Object.defineProperty(this, name, definition);
      return definition.get ?
        definition.get.call(this) :
        definition.value;
    },
    configurable: true
  });
}

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
    return {
      __proto__: this,
      forEach: function(iterator) {
        return this.__proto__.forEach.call(this, function(f) {
          if ( p(f) ) iterator(f);
        });
      },
      localForEach: function(iterator) {
        return this.__proto__.localForEach.call(this, function(f) {
          if ( p(f) ) iterator(f);
        });
      },
    };
  },

  forEach: function(iterator) {
    var self = this;
    if ( this.parent )
      this.parent.where(function(f) {
        return !f.name || !self.names_[f.name];
      }).forEach(iterator);
    this.localForEach(iterator);
  },

  localForEach: function(iterator) {
    for ( var i = 0; i < this.a_.length; i++ ) {
      var f = this.a_[i];

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


// Function for returning multi-line strings from commented functions.
// Ex. var str = multiline(function() { /* multi-line string here */ });
function multiline(f) {
  var s = f.toString();
  var start = s.indexOf('/*');
  var end   = s.lastIndexOf('*/');
  return s.substring(start+2, end);
}

// Computes the XY coordinates of the given node
// relative to the containing elements.
// TODO: findViewportXY works better... but do we need to find parent?
function findPageXY(node) {
  var x = 0;
  var y = 0;
  var parent;

  while ( node ) {
    parent = node;
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }

  return [x, y, parent];
}

// Computes the XY coordinates of the given node
// relative to the viewport.
function findViewportXY(node) {
  var rect = node.getBoundingClientRect();
  return [rect.left, rect.top];
}
