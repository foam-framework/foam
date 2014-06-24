/*! foam v0.1.0 */
/* qc-1.20.6-1750-ea5e7e6-dirty */
/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

if (navigator && navigator.userAgent.indexOf('Firefox') != -1) {
  console.log('Loading Firefox Support.');

  Object.defineProperties(MouseEvent.prototype, {
    offsetX: {
      get: function() {
        return this.clientX - this.target.getBoundingClientRect().left;
      }
    },
    offsetY: {
      get: function() {
        return this.clientY - this.target.getBoundingClientRect().top;
      }
    }
  });
}

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
  value: function() { return this; },
  writable: true
});

// Fallback to shallow clone() if deepClone() missing.
Object.defineProperty(Object.prototype, 'deepClone', {
  value: function() { return this.clone(); },
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

function trampoline(installer, target, name, valueFn) {
  var value;
  installer.defineProperty(target, name, {
    get: function() {
      if ( value ) return value;
      value = valueFn();
      Object.defineProperty(target, name, value);
      return value;
    },
    writable: true,
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
// relative to the window.
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
var SourceBlob = function(blob, sink, opt_skip, opt_buffersize) {
  var pos        = opt_skip || 0;
  var buffersize = opt_buffersize || 147456;

  while ( pos < blob.size )  {
    var size = Math.min(buffersize, blob.size - pos);

    sink.put(blob.slice(pos, pos + size));

    pos += size;
  }

  sink && sink.eof && sink.eof();
};


var BlobToText = function(sink) {
  var blobs = [];
  var reader = new FileReader();

  reader.onload = function(e) {
    sink.put && sink.put(reader.result);
    blobs.shift();
    if ( blobs.length ) send();
  };

  reader.onerror = function(e) {
    sink.error && sink.error(e);
  };

  function send() {
    reader.readAsText(blobs[0]);
  }

  return {
    __proto__: sink,
    put: function(blob) {
      blobs.push(blob);
      if ( blobs.length == 1 ) send();
    }
  };
};


var TextToLines = function(sink) {
  var buf = undefined;

  var split = function(data) {
    var b = [];
    var s = 0;
    for ( var i = 0 ; i < data.length ; i++ ) {
      if ( data.charCodeAt(i) == 10 ) {
        b.push(data.slice(s, i + 1));
        s = i+1;
      }
    }

    b.push(data.slice(s));

    return b;
  };


  return {
    __proto__: sink,

    put: function(data) {
      var b   = split(data);
      var ll  = b[b.length-1]; // last line
      var line;

      for ( i = 0 ; i < b.length-1 ; i++ ) {
        if ( buf ) {
          line = buf + b[i];
          buf = undefined;
        } else {
          line = b[i];
        }

        sink.put(line);
      }

      buf = buf ? buf + ll : ll;
    },

    eof: function() {
      if ( buf ) sink.put(buf)
      sink.eof && sink.eof();
    }
  };
};


var BlobReader = {
  create: function(blob, opt_buffersize, opt_skip) {
    return {
      __proto__: this,
      blob: blob,
      buffersize: opt_buffersize || 2048,
      position: opt_skip || 0
    };
  },

  nextSlice_: function() {
    if (this.position >= this.blob.size)
      return null;

    // TODO what happens if we stop on a multibyte character boundary?

    var slice = this.blob;
    var size = Math.min(this.buffersize, this.blob.size - this.position);
    slice = this.blob.slice(this.position, this.position + size);
    this.position += size;
    return slice;
  },

  read: function(sink) {
    slice = this.nextSlice_();

    if (!slice) {
      sink.eof && sink.eof();
      return;
    }
    sink.put && sink.put(slice);
  }
};

var TextReader = {
  create: function(reader) {
    return {
      __proto__: this,
      reader: reader
    }
  },

  read: function(sink) {
    var s = {
      __proto__: sink,
      put: function(blob) {
        var reader = new FileReader();
        var self = this;

        reader.readAsText(blob);

        reader.onload = function(e) {
          self.__proto__.put && self.__proto__.put(reader.result);
        };

        reader.onerror = function(e) {
          self.__proto__.error && self.__proto__.error(e);
        };
      }
    };
    this.reader.read(s);
  }
};

var LineBasedReader = {
  create: function(reader) {
    return {
      __proto__: this,
      reader: reader,
      index: 0,
      buffer: '',
    };
  },

  emitLine_: function() {
    for (; this.index < this.buffer.length; this.index++) {
      if (this.buffer[this.index] == '\n') {
        this.index++;
        var line = this.buffer.slice(0, this.index);
        this.buffer = this.buffer.slice(this.index);
        this.index = 0;
        this.sink.put && this.sink.put(line);
        return true;
      }
    }
    return false;
  },

  read: function(sink) {
    this.sink = sink;
    if (this.emitLine_()) return;
    this.reader.read(this);
  },

  put: function(data) {
    this.buffer += data;
    if (this.emitLine_()) return;
    this.reader.read(this);
  },

  eof: function() {
    this.sink.eof && this.sink.eof();
  }
};

var FullReader = {
  create: function(reader) {
    return {
      __proto__: this,
      reader: reader
    };
  },

  read: function(sink) {
    var reader = this.reader;
    var s = {
      __proto__: sink,
      put: function(data) {
        this.__proto__.put(data);
        reader.read(this);
      }
    };
    reader.read(s);
  }
};

var AsBlobReader = {
  create: function(reader) {
    return {
      __proto__: this,
      reader: reader
    };
  },

  read: function(sink) {
    var s = {
      __proto__: sink,
      put: function(buffer) {
        this.__proto__.put && this.__proto__.put(new Blob([buffer]));
      }
    };
    this.reader.read(s);
  }
};

var SocketReader = {
  create: function(socket, opt_buffersize) {
    return {
      __proto__: this,
      socket: socket,
      buffersize: opt_buffersize || 2048
    };
  },

  read: function(sink) {
    chrome.socket.read(this.socket.socketId, function(result) {
      if (result.resultCode < 0) {
        sink.error && sink.error(result.resultCode);
        return;
      }
      if (result.resultCode == 0) {
        sink.eof && sink.eof();
      }
      sink.put(result.data);
    });
  }
};

/**
 * <input type="file" id="fileinput">
 * reader = LineBasedReader.create(BufferedTextReader.create($("fileinput").files[0]))
 * reader.read(console.log);
 */

/*

  MBOXLoader.dao = [];

  reader = LineBasedReader.create(BufferedTextReader.create($("fileinput").files[0]))
  reader.read(MBOXLoader);


*/

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
var ProtoWriter = {
   create: function() {
      return {
         __proto__: this,
         value_: []
      };
   },

   get value() { return new Uint8Array(this.value_); },

   varint: function(i) {
      while(i > 0x7f) {
         this.value_.push((i & 0x7f) | 0x80);
         i = Math.floor(i / Math.pow(2, 7));
      }
      this.value_.push(i);
   },

   bytes: function(b) {
      this.value_ = this.value_.concat(b);
   },

   varintstring: function(str) {
     var bytes = [];
     for ( var i = str.length - 2; i > -2; i -= 2 ) {
       var sub = i < 0 ?
         str.substr(0, 1) :
         str.substr(i, 2);

       bytes.push(parseInt(sub, 16));
     }

     var buf = 0;
     for ( var i = 0; i < bytes.length - 1; i++ ) {
       buf >>>= 7;
       buf |= bytes[i] << (i)
       this.value_.push((buf & 0x7f) | 0x80);
     }
     buf >>>= 7;
     buf |= bytes[i] << i;
     this.varint(buf);
   },

   bytestring: function(str) {
      var bytes = [];
      for (var i = 0; i < str.length; i += 2) {
         bytes.push(parseInt(str.substr(i, 2), 16));
      }
      this.bytes(bytes);
   },

   // This is suboptimal, we need a way to insert the length
   // after serializing the message.
   message: function(m) {
      var temp = ProtoWriter.create();
      var data = m.outProtobuf(temp);
      temp = temp.value_;
      this.varint(temp.length);
      this.bytes(temp);
   }
};

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
var SocketManager = {
    create: function() {
        return {
            __proto__: this
        };
    },

    get: function(address) {
        var parts = address.split(':');
        var type = parts[0];
        var host = parts[1];
        var port = parseInt(parts[2]);

        return amemo(function(cb) {
            chrome.socket.create(type, {}, function(info) {
                chrome.socket.connect(
                    info.socketId,
                    host,
                    port,
                    function(result) {
                        if (result == 0) {
                            cb({
                                socketId: info.socketId
                            });
                            return;
                        }
                        cb(null);
                    });
            });
        });
    }
};

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
String.prototype.hashCode = function() {
  var hash = 0;
  if ( this.length == 0 ) return hash;

  for (i = 0; i < this.length; i++) {
    var code = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + code;
    hash &= hash;
  }

  return hash;
};

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
var Base64Decoder = {

  lookup: function(data) {
    var c = data.charCodeAt(0);
    return c == 43 ? 62 : c == 47 ? 63 : c < 58 ? c+4 : c < 91 ? c-65 : c-71;
  },

  create: function(sink, bufsize) {
    bufsize = bufsize || 512;

    return {
      __proto__: this,
      bufsize: bufsize,
      buffer: new ArrayBuffer(bufsize),
      pos: 0,
      chunk: 3,
      sink: sink
    };
  },

  put: function(data) {
    var tmp = 0;
    this.view = new DataView(this.buffer);

    for(var i = 0; i < data.length; i++) {
      if (data[i] == '=') break;

      var value = this.lookup(data[i]);
      if (value === undefined) continue; // Be permissive, ignore unknown characters.

      tmp = tmp | (value << (6*this.chunk));
      if (this.chunk == 0) {
        this.emit(3, tmp);
        tmp = 0;
        this.chunk = 3;
      } else {
        this.chunk--;
      }
    }

    if (data[i] == '=') {
      i++;
      if (i < data.length) {
        if (data[i] == '=') {
          this.emit(1, tmp);
        }
      } else {
        this.emit(2, tmp);
      }
    }
  },

  emit: function(bytes, tmp) {
    for(var j = 0; j < bytes; j++) {
      this.view.setUint8(this.pos,
                         (tmp >> ((2-j)*8)) & 0xFF);
      this.pos++;
      if (this.pos >= this.buffer.byteLength ) {
        this.sink.put(this.buffer);
        this.buffer = new ArrayBuffer(this.bufsize);
        this.view = new DataView(this.buffer);
        this.pos = 0;
      }
    }
  },

  eof: function() {
    this.sink.put(this.buffer.slice(0, this.pos));
    this.sink.eof && this.sink.eof();
  }
};

var Base64Encoder = {
  table: [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
    'Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f',
    'g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v',
    'w','x','y','z','0','1','2','3','4','5','6','7','8','9','+','/'],

  encode: function(b, opt_break) {
    var result = "";
    if ( opt_break >= 0 ) {
      var count = 0;
      var out = function(c) {
        result += c;
        count = (count + 1) % opt_break;
        if ( count == 0 ) result += "\r\n";
      }
    } else {
      out = function(c) { result += c; };
    }

    for ( var i = 0; i + 2 < b.byteLength; i += 3 ) {
      out(this.table[b[i] >>> 2]);
      out(this.table[((b[i] & 3) << 4) | (b[i+1] >>> 4)]);
      out(this.table[((b[i+1] & 15) << 2) | (b[i+2] >>> 6)]);
      out(this.table[b[i+2] & 63]);
    }

    if ( i < b.byteLength ) {
      out(this.table[b[i] >>> 2]);
      if ( i + 1 < b.byteLength ) {
        out(this.table[((b[i] & 3) << 4) | (b[i+1] >>> 4)]);
        out(this.table[((b[i+1] & 15) << 2)]);
      } else {
        out(this.table[((b[i] & 3) << 4)]);
        out('=');
      }
      out('=');
    }
    return result;
  }
};

/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

var QuotedPrintable = {
  encode: function(str) {
  },
  decode: function(str, decoder) {
    var result = "";

    var normal = function(s) {
      if ( s === '=' ) state = quoted;
      else result += s;
    };

    var quoted = (function() {
      var buffer = "";
      var index = 0;

      return function(s) {
        if ( s === '\r' || s === '\n' ) {
          index = 0;
          state = normal;
          return;
        }

        buffer += s;
        index++;

        if ( index == 2 ) {
          decoder.put(parseInt(buffer, 16));
          if ( decoder.remaining == 0 ) {
            result += decoder.string;
            decoder.reset();
          }
          buffer = "";
          index = 0;
          state = normal;
        }
      };
    })();

    var state = normal;

    for ( var i = 0; i < str.length; i++ ) {
      state(str[i]);
    }

    return result;
  }
};

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
String.fromCharCode = (function() {
  var oldLookup = String.fromCharCode;
  var lookupTable = [];
  return function(a) {
    if (arguments.length == 1) return lookupTable[a] || (lookupTable[a] = oldLookup(a));
    var result = "";
    for (var i = 0; i < arguments.length; i++) {
      result += lookupTable[arguments[i]] || (lookupTable[arguments[i]] = oldLookup(arguments[i]));
    }
    return result;
  };
})();

// WARNING: This is a hastily written UTF-8 decoder it probably has bugs.
var IncrementalUtf8 = {
  create: function() {
    return {
      __proto__: this,
      charcode: undefined,
      remaining: 0,
      string: ''
    };
  },

  reset: function() {
    this.string = '';
    this.remaining = 0;
    this.charcode = undefined;
  },

  put: function(byte) {
    if (this.charcode == undefined) {
      this.charcode = byte;
      if (!(this.charcode & 0x80)) {
        this.remaining = 0;
        this.charcode = (byte & 0x7f) << (6 * this.remaining);
      } else if ((this.charcode & 0xe0) == 0xc0) {
        this.remaining = 1;
        this.charcode = (byte & 0x1f) << (6 * this.remaining);
      } else if ((this.charcode & 0xf0) == 0xe0) {
        this.remaining = 2;
        this.charcode = (byte & 0x0f) << (6 * this.remaining);
      } else if ((this.charcode & 0xf8) == 0xf0) {
        this.remaining = 3;
        this.charcode = (byte & 0x07) << (6 * this.remaining);
      } else if ((this.charcode & 0xfc) == 0xf8) {
        this.remaining = 4;
        this.charcode = (byte & 0x03) << (6 * this.remaining);
      } else if ((this.charcode & 0xfe) == 0xfc) {
        this.remaining = 5;
        this.charcode = (byte & 0x01) << (6 * this.remaining);
      } else throw "Bad charcode value";
    } else if ( this.remaining > 0 ) {
      this.remaining--;
      this.charcode |= (byte & 0x3f) << (6 * this.remaining);
    }

    if ( this.remaining == 0 ) {
      // NOTE: Turns out fromCharCode can't handle all unicode code points.
      // We need fromCodePoint from ES 6 before this will work properly.
      // However it should be good enough for most cases.
      this.string += String.fromCharCode(this.charcode);
      this.charcode = undefined;
    }
  }
};

var utf8tostring = (function() {
  var decoder = IncrementalUtf8.create();

  return function utf8tostring(bytes) {
    for ( var i = 0; i < bytes.length; i++ ) decoder.put(bytes[i]);

    var str = decoder.string;
    decoder.reset();

    return str;
  };
})();

function stringtoutf8(str) {
    var res = [];
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);

        var count = 0;
        if ( code < 0x80 ) {
            res.push(code);
            continue;
        }

        // while(code > (0x40 >> count)) {
        //     res.push(code & 0x3f);
        //     count++;
        //     code = code >> 7;
        // }
        // var header = 0x80 >> count;
        // res.push(code | header)
    }
    return res;
}

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
  var ErrorReportingPS = {
  create: function(delegate, opt_pos) {
  console.log('ERPS:',delegate.head);
  return {
  __proto__: this,
  pos: opt_pos || 0,
  delegate: delegate
  };
  },
  get head() {
  console.log('head:',this.pos, this.delegate.head);
  return this.delegate.head;
  },
  get tail() {
  return this.tail_ || (this.tail_ = this.create(this.delegate.tail, this.pos+1));
  },
  get value() {
  return this.delegate.value;
  },
  setValue: function(value) {
  console.log('setValue:',value);
  //    return ErrorReportingPS.create(this.delegate.setValue(value));
  this.delegate = this.delegate.setValue(value);
  return this;
  }
  };
*/

/** String PStream **/
var StringPS = {
  create: function(str) {
    return {
      __proto__: this,
      pos:   0,
      str_:  [str],
      tail_: []
    };
  },
  set str(str) { this.str_[0] = str; },
  get head() { return this.pos >= this.str_[0].length ? null : this.str_[0].charAt(this.pos); },
  get value() { return this.hasOwnProperty('value_') ? this.value_ : this.str_[0].charAt(this.pos-1); },
  get tail() { return /*this.pos >= this.str_[0].length ? this : */this.tail_[0] || ( this.tail_[0] = { __proto__: this.__proto__, str_: this.str_, pos: this.pos+1, tail_: [] } ); },
  setValue: function(value) { return { __proto__: this.__proto__, str_: this.str_, pos: this.pos, tail_: this.tail_, value_: value }; }
};

function prep(arg) {
  if ( typeof arg === 'string' ) return literal(arg);

  return arg;
}

function prepArgs(args) {
  for ( var i = 0 ; i < args.length ; i++ ) {
    args[i] = prep(args[i]);
  }

  return args;
}

function range(c1, c2) {
  var f = function(ps) {
    if ( ! ps.head ) return undefined;
    if ( ps.head < c1 || ps.head > c2 ) return undefined;
    return ps.tail.setValue(ps.head);
  };

  f.toString = function() { return 'range(' + c1 + ', ' + c2 + ')'; };

  return f;
}

function literal(str, opt_value) {
  var f = function(ps) {
    for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
      if ( str.charAt(i) !== ps.head ) return undefined;
    }

    return ps.setValue(opt_value || str);
  };

  f.toString = function() { return '"' + str + '"'; };

  return f;
}

/**
 * Case-insensitive String literal.
 * Doesn't work for Unicode characters.
 **/
function literal_ic(str, opt_value) {
  str = str.toLowerCase();

  var f = function(ps) {
    for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
      if ( ! ps.head || str.charAt(i) !== ps.head.toLowerCase() ) return undefined;
    }

    return ps.setValue(opt_value || str);
  };

  f.toString = function() { return '"' + str + '"'; };

  return f;
}

function anyChar(ps) {
  return ps.head ? ps.tail/*.setValue(ps.head)*/ : undefined;
}

function notChar(c) {
  return function(ps) {
    return ps.head && ps.head !== c ? ps.tail.setValue(ps.head) : undefined;
  };
}

function notChars(s) {
  return function(ps) {
    return ps.head && s.indexOf(ps.head) == -1 ? ps.tail.setValue(ps.head) : undefined;
  };
}

function not(p, opt_else) {
  p = prep(p);
  opt_else = prep(opt_else);
  var f = function(ps) {
    return this.parse(p,ps) ? undefined :
      opt_else ? this.parse(opt_else, ps) :
      ps;
  };

  f.toString = function() { return 'not(' + p + ')'; };

  return f;
}

function optional(p) {
  p = prep(p);
  var f = function(ps) { return this.parse(p,ps) || ps.setValue(undefined); };

  f.toString = function() { return 'optional(' + p + ')'; };

  return f;
}


function copyInput(p) {
  p = prep(p);
  var f = function(ps) {
    var res = this.parse(p, ps);

    return res ? res.setValue(ps.str_.toString().substring(ps.pos, res.pos)) : res;
  };

  f.toString = function() { return 'copyInput(' + p + ')'; };

  return f;
}


/** Parses if the delegate parser parses, but doesn't advance the pstream. **/
function lookahead(p) {
  p = prep(p);
  var f = function(ps) { return this.parse(p,ps) && ps; };

  f.toString = function() { return 'lookahead(' + p + ')'; };

  return f;
}

function repeat(p, opt_delim, opt_min, opt_max) {
  p = prep(p);
  opt_delim = prep(opt_delim);

  var f = function(ps) {
    var ret = [];

    for ( var i = 0 ; ! opt_max || i < opt_max ; i++ ) {
      var res;

      if ( opt_delim && ret.length != 0 ) {
        if ( ! ( res = this.parse(opt_delim, ps) ) ) break;
        ps = res;
      }

      if ( ! ( res = this.parse(p,ps) ) ) break;

      ret.push(res.value);
      ps = res;
    }

    if ( opt_min && ret.length < opt_min ) return undefined;

    return ps.setValue(ret);
  };

  f.toString = function() { return 'repeat(' + p + ', ' + opt_delim + ', ' + opt_min + ', ' + opt_max + ')'; };

  return f;
}

function plus(p) { return repeat(p, undefined, 1); }

function noskip(p) {
  return function(ps) {
    this.skip_ = false;
    ps = this.parse(p, ps);
    this.skip_ = true;
    return ps;
  };
}

/** A simple repeat which doesn't build an array of parsed values. **/
function repeat0(p) {
  p = prep(p);

  return function(ps) {
    var res;
    while ( res = this.parse(p, ps) ) ps = res;
    return ps.setValue('');
  };
}

function seq(/* vargs */) {
  var args = prepArgs(arguments);

  var f = function(ps) {
    var ret = [];

    for ( var i = 0 ; i < args.length ; i++ ) {
      if ( ! ( ps = this.parse(args[i], ps) ) ) return undefined;
      ret.push(ps.value);
    }

    return ps.setValue(ret);
  };

  f.toString = function() { return 'seq(' + argsToArray(args).join(',') + ')'; };

  return f;
}

/**
 * A Sequence which only returns one of its arguments.
 * Ex. seq1(1, '"', sym('string'), '"'),
 **/
function seq1(n /*, vargs */) {
  var args = prepArgs(argsToArray(arguments).slice(1));

  var f = function(ps) {
    var ret;

    for ( var i = 0 ; i < args.length ; i++ ) {
      if ( ! ( ps = this.parse(args[i], ps) ) ) return undefined;
      if ( i == n ) ret = ps.value;
    }

    return ps.setValue(ret);
  };

  f.toString = function() { return 'seq1(' + n + ', ' + argsToArray(args).join(',') + ')'; };

  return f;
}

function alt(/* vargs */) {
  var args = prepArgs(arguments);
  var map  = {};

  function nullParser() { return undefined; }

  function testParser(p, ps) {
    var c = ps.head;
    var trapPS = {
      getValue: function() {
        return this.value;
      },
      setValue: function(v) {
        this.value = v;
      },
      value: ps.value,
      head: c
    };
    var goodChar = false;

    trapPS.__defineGetter__('tail', function() {
      goodChar = true;
      return {
        value: this.value,
        getValue: function() {
          return this.value;
        },
        setValue: function(v) {
          this.value = v;
        }
      };
    });

    this.parse(p, trapPS);

    // console.log('*** TestParser:',p,c,goodChar);
    return goodChar;
  }

  function getParserForChar(ps) {
    var c = ps.head;
    var p = map[c];

    if ( ! p ) {
      var alts = [];

      for ( var i = 0 ; i < args.length ; i++ ) {
        var parser = args[i];

        if ( testParser.call(this, parser, ps) ) alts.push(parser);
      }

      p = alts.length == 0 ? nullParser :
        alts.length == 1 ? alts[0] :
        simpleAlt.apply(null, alts);

      map[c] = p;
    }

    return p;
  }

  return function(ps) {
    return this.parse(getParserForChar.call(this, ps), ps);
  };
}

// function simpleAlt(/* vargs */) {
function alt(/* vargs */) {
  var args = prepArgs(arguments);

  var f = function(ps) {
    for ( var i = 0 ; i < args.length ; i++ ) {
      var res = this.parse(args[i], ps);

      if ( res ) return res;
    }

    return undefined;
  };

  f.toString = function() { return 'alt(' + argsToArray(args).join(' | ') + ')'; };

  return f;
}

/** Takes a parser which returns an array, and converts its result to a String. **/
function str(p) {
  p = prep(p);
  var f = function(ps) {
    var ps = this.parse(p, ps);
    return ps ? ps.setValue(ps.value.join('')) : undefined ;
  };

  f.toString = function() { return 'str(' + p + ')'; };

  return f;
}

/** Ex. attr: pick([0, 2], seq(sym('label'), '=', sym('value'))) **/
function pick(as, p) {
  p = prep(p);
  var f = function(ps) {
    var ps = this.parse(p, ps);
    if ( ! ps ) return undefined;
    var ret = [];
    for ( var i = 0 ; i < as.length ; i++ ) ret.push(ps.value[as[i]]);
    return ps.setValue(ret);
  };

  f.toString = function() { return 'pick(' + as + ', ' + p + ')'; };

  return f;
}

function parsedebug(p) {
  return function(ps) {
    debugger;
    var old = DEBUG_PARSE;
    DEBUG_PARSE = true;
    var ret = this.parse(p, ps);
    DEBUG_PARSE = old;
    return ret;
  };
}


// alt = simpleAlt;

function sym(name) {
  var f = function(ps) {
    var p = this[name];

    if ( ! p ) console.log('PARSE ERROR: Unknown Symbol <' + name + '>');

    return this.parse(p, ps);
  };

  f.toString = function() { return '<' + name + '>'; };

  return f;
}


// This isn't any faster because V8 does the same thing already.
// function sym(name) { var p; return function(ps) { return (p || ( p = this[name])).call(this, ps); }; }


// function sym(name) { return function(ps) { var ret = this[name](ps); console.log('<' + name + '> -> ', !! ret); return ret; }; }

var DEBUG_PARSE = false;

var grammar = {

  parseString: function(str) {
    var ps = this.stringPS;
    ps.str = str;
    var res = this.parse(this.START, ps);

    return res && res.value;
  },

  parse: function(parser, pstream) {
    //    if ( DEBUG_PARSE ) console.log('parser: ', parser, 'stream: ',pstream);
    if ( DEBUG_PARSE && pstream.str_ ) {
            console.log(new Array(pstream.pos).join('.'), pstream.head);
      console.log(pstream.pos + '> ' + pstream.str_[0].substring(0, pstream.pos) + '(' + pstream.head + ')');
    }
    var ret = parser.call(this, pstream);
    if ( DEBUG_PARSE ) {
      console.log(parser + ' ==> ' + (!!ret) + '  ' + (ret && ret.value));
    }
    return ret;
  },

  /** Export a symbol for use in another grammar or stand-alone. **/
  'export': function(str) {
    return this[str].bind(this);
  },

  addAction: function(sym, action) {
    var p = this[sym];
    this[sym] = function(ps) {
      var val = ps.value;
      var ps2 = this.parse(p, ps);

      return ps2 && ps2.setValue(action.call(this, ps2.value, val));
    };

    this[sym].toString = function() { return '<<' + sym + '>>'; };
  },

  addActions: function(map) {
    for ( var key in map ) this.addAction(key, map[key]);

    return this;
  }
};

function defineTTLProperty(obj, name, ttl, f) {
  Object.defineProperty(obj, name, {
    get: function() {
      var accessed;
      var value = undefined;
      Object.defineProperty(this, name, {
        get: function() {
          function scheduleTimer() {
            setTimeout(function() {
              if ( accessed ) {
                scheduleTimer();
              } else {
                value = undefined;
              }
              accessed = false;
            }, ttl);
          }
          if ( ! value ) {
            accessed = false;
            value = f();
            scheduleTimer();
          } else {
            accessed = true;
          }

          return value;
        }
      });

      return this[name];
    }
  });
}

defineTTLProperty(grammar, 'stringPS', 5000, function() { return StringPS.create(""); });


var SkipGrammar = {
  create: function(gramr, skipp) {
    return {
      __proto__: gramr,

      skip_: true,

      parse: function(parser, pstream) {
        if (this.skip_) pstream = this.skip.call(grammar, pstream) || pstream;
        return this.__proto__.parse.call(this, parser, pstream);
      },

      skip: skipp
    };
  }
};

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

// todo: add enabled/disabled support
// todo: bind
// todo: generateTopic()
// todo: cleanup empty topics after subscriptions removed

// http://www.republicofcode.com/tutorials/flash/as3tweenclass/
// http://mootools.net/docs/core/Fx/Fx.Transitions
// http://jquery.malsup.com/cycle/adv.html

/** Publish and Subscribe Event Notification Service. **/
// ??? Whould 'Observable' be a better name?
var EventService = {

  /** If listener thows this exception, it will be removed. **/
  UNSUBSCRIBE_EXCEPTION: 'unsubscribe',


  /** Used as topic suffix to specify broadcast to all sub-topics. **/
  WILDCARD: "*",


  /** Create a "one-time" listener which unsubscribes itself after its first invocation. **/
  oneTime: function(listener) {
    return function() {
      listener.apply(this, argsToArray(arguments));

      throw EventService.UNSUBSCRIBE_EXCEPTION;
    };
  },


  /** Log all listener invocations to console. **/
  consoleLog: function(listener) {
    return function() {
      var args = argsToArray(arguments);
      console.log(args);

      listener.apply(this, args);
    };
  },


  /**
   * Merge all notifications occuring in the specified time window into a single notification.
   * Only the last notification is delivered.
   *
   * @param opt_delay time in milliseconds of time-window, defaults to 16ms, which is
   *        the smallest delay that humans aren't able to perceive.
   **/
  merged: function(listener, opt_delay, opt_X) {
    var delay = opt_delay || 16;

    return function() {
      var STACK        = null;
      var triggered    = false;
      var unsubscribed = false;
      var lastArgs     = null;

      var f = function() {
        STACK = DEBUG_STACK();
        lastArgs = arguments;

        if ( unsubscribed ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        if ( ! triggered ) {
          triggered = true;
          ((opt_X && opt_X.setTimeout) || setTimeout)(
            function() {
              triggered = false;
              var args = argsToArray(lastArgs);
              lastArgs = null;
              try {
                listener.apply(this, args);
              } catch (x) {
                if ( x === EventService.UNSUBSCRIBE_EXCEPTION ) unsubscribed = true;
              }
            }, delay);
        }
      };

      f.toString = function() {
        return 'MERGED(' + delay + ', ' + listener.$UID + ', ' + listener + ')';
      };

      return f;
    }();
  },


  /**
   * Merge all notifications occuring until the next animation frame.
   * Only the last notification is delivered.
   **/
  // TODO: execute immediately from within a requestAnimationFrame
  animate: function(listener, opt_X) {
//    if ( ! opt_X ) debugger;
//    if ( opt_X.isBackground ) debugger;

    return function() {
      var STACK        = null;
      var triggered    = false;
      var unsubscribed = false;
      var lastArgs     = null;

      var f = function() {
        STACK = DEBUG_STACK();
        lastArgs = arguments;

        if ( unsubscribed ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        if ( ! triggered ) {
          triggered = true;
          ((opt_X && opt_X.requestAnimationFrame) || requestAnimationFrame)(
            function() {
              triggered = false;
              var args = argsToArray(lastArgs);
              lastArgs = null;
              try {
                listener.apply(this, args);
              } catch (x) {
                if ( x === EventService.UNSUBSCRIBE_EXCEPTION ) unsubscribed = true;
              }
            });
        }
      };

      f.toString = function() {
        return 'ANIMATE(' + listener.$UID + ', ' + listener + ')';
      };

      return f;
    }();
  },

  /** Decroate a listener so that the event is delivered asynchronously. **/
  async: function(listener) {
    return this.delay(0, listener);
  },

  delay: function(delay, listener) {
    return function() {
      var args = argsToArray(arguments);

      // Is there a better way of doing this?
      setTimeout( function() { listener.apply(this, args); }, delay );
    };
  },

  hasListeners: function (topic) {
    // TODO:
    return true;
  },


  /**
   * Publish a notification to the specified topic.
   *
   * @return number of subscriptions notified
   **/
  publish: function (topic) {
    return this.subs_ ?
      this.pub_(
        this.subs_,
        0,
        topic,
        this.appendArguments([this, topic], arguments, 1)) :
      0;
  },


  /** Publish asynchronously. **/
  publishAsync: function (topic) {
    var args = argsToArray(arguments);
    var me   = this;

    setTimeout( function() { me.publish.apply(me, args); }, 0);
  },


  /**
   * Publishes a message to this object and all of its children.
   * Objects/Protos which have children should override the
   * standard definition, which is the same as just calling publish().
   **/
  deepPublish: function(topic) {
    return this.publish.apply(this, arguments);
  },


  /**
   * Publish a message supplied by a factory function.
   *
   * This is useful if the message is expensive to generate and you
   * don't want to waste the effort if there are no listeners.
   *
   * arg fn: function which returns array
   **/
  lazyPublish: function (topic, fn) {
    if ( this.hasListeners(topic) ) return this.publish.apply(this, fn());

    return 0;
  },


  /** Subscribe to notifications for the specified topic. **/
  subscribe: function (topic, listener) {
    if ( ! this.subs_ ) this.subs_ = {};

    this.sub_(this.subs_, 0, topic, listener);
  },


  /** Unsubscribe a listener from the specified topic. **/
  unsubscribe: function (topic, listener) {
    if ( ! this.subs_ ) return;

    this.unsub_(this.subs_, 0, topic, listener);
  },


  /** Unsubscribe all listeners from this service. **/
  unsubscribeAll: function () {
    this.sub_ = {};
  },


  ///////////////////////////////////////////////////////
  //                                            Internal
  /////////////////////////////////////////////////////

  pub_: function(map, topicIndex, topic, msg) {
    var count = 0;

    // There are no subscribers, so nothing to do
    if ( map == null ) return 0;

    if ( topicIndex < topic.length ) {
      var t = topic[topicIndex];

      // wildcard publish, so notify all sub-topics, instead of just one
      if ( t == this.WILDCARD )
        return this.notifyListeners_(topic, map, msg);

      if ( t ) count += this.pub_(map[t], topicIndex+1, topic, msg);
    }

    count += this.notifyListeners_(topic, map[null], msg);

    return count;
  },


  sub_: function(map, topicIndex, topic, listener) {
    if ( topicIndex == topic.length ) {
      if ( ! map[null] ) map[null] = [];
      map[null].push(listener);
    } else {
      var key = topic[topicIndex];

      if ( ! map[key] ) map[key] = {};

      this.sub_(map[key], topicIndex+1, topic, listener);
    }
  },

  unsub_: function(map, topicIndex, topic, listener) {
    if ( topicIndex == topic.length ) {
      if ( ! map[null] ) return true;

      if ( ! map[null].deleteI(listener) ) {
        console.warn('phantom unsubscribe');
      } else {
//        console.log('remove', topic);
      }

      if ( ! map[null].length ) delete map[null];
    } else {
      var key = topic[topicIndex];

      if ( ! map[key] ) return false;

      if ( this.unsub_(map[key], topicIndex+1, topic, listener) )
        delete map[key];
    }
    return Object.keys(map).length == 0;
  },


  /** @return number of listeners notified **/
  notifyListeners_: function(topic, listeners, msg) {
    if ( listeners == null ) return 0;

    if ( Array.isArray(listeners) ) {
      for ( var i = 0 ; i < listeners.length ; i++ ) {
        var listener = listeners[i];

        try {
          listener.apply(null, msg);
        } catch ( err ) {
          if ( err !== this.UNSUBSCRIBE_EXCEPTION ) {
            console.error('Error delivering event (removing listener): ', topic.join('.'));
          } else {
            console.warn('Unsubscribing listener: ', topic.join('.'));
          }
          listeners.splice(i,1);
          i--;
        }
      }

      return listeners.length;
    }

    for ( var key in listeners ) {
      return this.notifyListeners_(topic, listeners[key], msg);
    }
  },


  // convenience method to turn 'arguments' into a real array
  appendArguments: function (a, args, start) {
    for ( var i = start ; i < args.length ; i++ ) a.push(args[i]);

    return a;
  }

};


/** Extend EventService with support for dealing with property-change notification. **/
var PropertyChangeSupport = {

  __proto__: EventService,

  /** Root for property topics. **/
  PROPERTY_TOPIC: 'property',

  /** Create a topic for the specified property name. **/
  propertyTopic: function (property) {
    return [ this.PROPERTY_TOPIC, property ];
  },


  /** Indicate that a specific property has changed. **/
  propertyChange: function (property, oldValue, newValue) {
    // don't bother firing event if there are no listeners
    if ( ! this.subs_ ) return;

    // don't fire event if value didn't change
    if ( property != null && oldValue === newValue ) return;

    this.publish(this.propertyTopic(property), oldValue, newValue);
  },

  propertyChange_: function (propertyTopic, oldValue, newValue) {
    // don't bother firing event if there are no listeners
    if ( ! this.subs_ ) return;

    // don't fire event if value didn't change
    if ( oldValue === newValue ) return;

    this.publish(propertyTopic, oldValue, newValue);
  },


  /** Indicates that one or more unspecified properties have changed. **/
  globalChange: function () {
    this.publish(this.propertyTopic(this.WILDCARD), null, null);
  },


  addListener: function(listener) {
    // this.addPropertyListener([ this.PROPERTY_TOPIC ], listener);
    this.addPropertyListener(null, listener);
  },


  removeListener: function(listener) {
    this.removePropertyListener(null, listener);
  },


  /** @arg property the name of the property to listen to or 'null' to listen to all properties. **/
  addPropertyListener: function(property, listener) {
    this.subscribe(this.propertyTopic(property), listener);
  },


  removePropertyListener: function(property, listener) {
    this.unsubscribe(this.propertyTopic(property), listener);
  },


  /** Create a Value for the specified property. **/
  propertyValue: function(property) {
    var obj = this;
    return {
      $UID: obj.$UID + "." + property,

      get: function() { return obj[property]; },

      set: function(val) { obj[property] = val; },

      get value() { return this.get(); },

      set value(val) { this.set(val); },

      addListener: function(listener) {
        obj.addPropertyListener(property, listener);
      },

      removeListener: function(listener) {
        obj.removePropertyListener(property, listener);
      },

      toString: function () { return 'PropertyValue(' + property + ')'; }
    };
  }

};


var FunctionStack = {
  create: function() {
    var stack = [false];
    return {
      stack: stack,
      push: function(f) { stack.unshift(f); },
      pop: function() { stack.shift(); },
    };
  }
};


/** Static support methods for working with Events. **/
var Events = {

  /** Collection of all 'following' listeners. **/
  listeners_: {},

  identity: function (x) { return x; },

  /** Have the dstValue listen to changes in the srcValue and update its value to be the same. **/
  follow: function (srcValue, dstValue) {
    if ( ! srcValue || ! dstValue ) return;

    var listener = function () {
      var sv = srcValue.get();
      var dv = dstValue.get();

      if ( sv !== dv ) dstValue.set(sv);
    };

    // TODO: put back when cleanup implemented
    //    this.listeners_[[srcValue.$UID, dstValue.$UID]] = listener;

    srcValue.addListener(listener);

    listener();
  },


  /**
   * Maps values from one model to another.
   * @param f maps values from srcValue to dstValue
   */
  map: function (srcValue, dstValue, f) {
    if ( ! srcValue || ! dstValue ) return;

    var listener = function () {
      var s = f(srcValue.get());
      var d = dstValue.get();

      if ( s !== d ) dstValue.set(s);
    };

    listener();

    // TODO: put back when cleanup implemented
    //    this.listeners_[[srcValue.$UID, dstValue.$UID]] = listener;

    srcValue.addListener(listener);
  },


  /** Have the dstValue stop listening for changes to the srcValue. **/
  unfollow: function (srcValue, dstValue) {
    if ( ! srcValue || ! dstValue ) return;

    var key      = [srcValue.$UID, dstValue.$UID];
    var listener = this.listeners_[key];

    if ( listener ) {
      delete this.listeners_[key];
      srcValue.removeListener(listener);
    }
  },


  /**
   * Link the values of two models by having them follow each other.
   * Initial value is copied from srcValue to dstValue.
   **/
  link: function (srcValue, dstValue) {
    if ( ! srcValue || ! dstValue ) return;

    this.follow(srcValue, dstValue);
    this.follow(dstValue, srcValue);
  },


  /**
   * Relate the values of two models.
   * @param f maps value1 to model2
   * @param fprime maps model2 to value1
   * @param removeFeedback disables feedback
   */
  relate: function (srcValue, dstValue, f, fprime, removeFeedback) {
    if ( ! srcValue || ! dstValue ) return;

    var feedback = false;

    var l = function(sv, dv, f) { return function () {
      if ( removeFeedback && feedback ) return;
      var s = f(sv.get());
      var d = dv.get();

      if ( s !== d ) {
        feedback = true;
        dv.set(s);
        feedback = false;
      }
    }};

    // TODO: put back when cleanup implemented
    //    this.listeners_[[srcValue.$UID, dstValue.$UID]] = listener;

    var l1 = l(srcValue, dstValue, f);
    var l2 = l(dstValue, srcValue, fprime);

    srcValue.addListener(l1);
    dstValue.addListener(l2);

    l1();
  },

  /** Unlink the values of two models by having them no longer follow each other. **/
  unlink: function (value1, value2) {
    this.unfollow(value1, value2);
    this.unfollow(value2, value1);
  },


  //////////////////////////////////////////////////
  //                                   FRP Support
  //////////////////////////////////////////////////

  /**
   * Trap the dependencies of 'fn' and re-invoke whenever
   * their values change.  The return value of 'fn' is
   * passed to 'opt_fn'.
   * @param opt_fn also invoked when dependencies change,
   *        but its own dependencies are not tracked.
   */
  dynamic: function(fn, opt_fn, opt_X) {
    var fn2 = opt_fn ? function() { opt_fn(fn()); } : fn;
    var listener = EventService.animate(fn2, opt_X);
    Events.onGet.push(function(obj, name, value) {
      // Uncomment next line to debug.
      // obj.propertyValue(name).addListener(function() { console.log('name: ', name); });
      obj.propertyValue(name).addListener(listener);
    });
    var ret = fn();
    Events.onGet.pop();
    opt_fn && opt_fn(ret);
  },

  onSet: FunctionStack.create(),
  onGet: FunctionStack.create(),

  // ???: would be nice to have a removeValue method
  // or maybe add an 'owner' property, combine with Janitor
}

// TODO: Janitor
/*
  subscribe(subject, topic, listener);
  addCleanupTask(fn)

  cleanup();

*/

Function.prototype.o = function(f2) {
  var f1 = this;
  return function() { return f1.call(this, f2.apply(this, argsToArray(arguments))); };
};


var Movement = {

  distance: function(x, y) { return Math.sqrt(x*x + y*y); },

  /** Combinator to create the composite of two functions. **/
  o: function(f1, f2) { return function(x) { return f1(f2(x)); }; },

  /** Combinator to create the average of two functions. **/
  avg: function(f1, f2) { return function(x) { return (f1(x) + f2(x))/2; }; },

  /** Constant speed. **/
  linear: function(x) { return x; },

  /** Move to target value and then return back to original value. **/
  back: function(x) { return x < 0.5 ? 2*x : 2-2*x; },

  /** Start slow and accelerate until half-way, then start slowing down. **/
  accelerate: function(x) { return (Math.sin(x * Math.PI - Math.PI/2)+1)/2; },

  /** Start slow and ease-in to full speed. **/
  easeIn: function(a) {
    var v = 1/(1-a/2);
    return function(x) {
      var x1 = Math.min(x, a);
      var x2 = Math.max(x-a, 0);
      return (a ? 0.5*x1*(x1/a)*v : 0) + x2*v;
    };
  },

  /** Combinator to reverse behaviour of supplied function. **/
  reverse: function(f) { return function(x) { return 1-f(1-x); }; },

  /** Reverse of easeIn. **/
  easeOut: function(b) { return Movement.reverse(Movement.easeIn(b)); },

  /**
   * Cause an oscilation at the end of the movement.
   * @param b percentage of time to to spend bouncing [0, 1]
   * @param a amplitude of maximum bounce
   * @param opt_c number of cycles in bounce (default: 3)
   */
  oscillate:  function(b, a, opt_c) {
    var c = opt_c || 3;
    return function(x) {
      if ( x < (1-b) ) return x/(1-b);
      var t = (x-1+b)/b;
      return 1+(1-t)*2*a*Math.sin(2*c*Math.PI * t);
    };
  },

  /**
   * Cause an bounce at the end of the movement.
   * @param b percentage of time to to spend bouncing [0, 1]
   * @param a amplitude of maximum bounce
   */
  bounce:  function(b,a,opt_c) {
    var c = opt_c || 3;
    return function(x) {
      if ( x < (1-b) ) return x/(1-b);
      var t = (x-1+b)/b;
      return 1-(1-t)*2*a*Math.abs(Math.sin(2*c*Math.PI * t));
    };
  },
  bounce2: function(a) {
    var v = 1 / (1-a);
    return function(x) {
      if ( x < (1-a) ) return v*x;
      var p = (x-1+a)/a;
      return 1-(x-1+a)*v/2;
    };
  },

  /** Move backwards a% before continuing to end. **/
  stepBack: function(a) {
    return function(x) {
      return ( x < a ) ? -x : -2*a+(1+2*a)*x;
    };
  },

  /** Combination of easeIn and easeOut. **/
  ease: function(a, b) {
    return Movement.o(Movement.easeIn(a), Movement.easeOut(b));
  },

  seq: function(f1, f2) {
    return ( f1 && f2 ) ? function() { f1.apply(this, argsToArray(arguments)); f2(); } :
    f1 ? f1
      : f2 ;
  },

  /** @return a latch function which can be called to stop the animation. **/
  animate: function(duration, fn, opt_interp, opt_onEnd) {
    if ( duration == 0 ) return Movement.seq(fn, opt_onEnd);
    var interp = opt_interp || Movement.linear;

    return function() {
      var STACK     = DEBUG_STACK();
      var ranges    = [];
      var timer;

      function stop() {
        clearInterval(timer);
        opt_onEnd && opt_onEnd();
        opt_onEnd = null;
      }

      if ( fn ) {
        Events.onSet.push(function(obj, name, value2) {
          ranges.push([obj, name, obj[name], value2]);
        });
        fn.apply(this, argsToArray(arguments));
        Events.onSet.pop();
      }

      var startTime = Date.now();

      if ( ranges.length > 0 ) {
        timer = setInterval(function() {
          var now = Date.now();
          var p   = interp((Math.min(now, startTime + duration)-startTime)/duration);

          for ( var i = 0 ; i < ranges.length ; i++ ) {
            var r = ranges[i];
            var obj = r[0], name = r[1], value1 = r[2], value2 = r[3];

            obj[name] = value1 + (value2-value1) * p;
          }

          if ( now >= startTime + duration ) stop();
        }, 16);
      }

      return stop;
    };
  },

  // requires unsubscribe to work first (which it does now)
  /*
  animate2: function(timer, duration, fn) {
    return function() {
      var startTime = timer.time;
      Events.onSet.push(function(obj, name, value2) {
        var value1 = obj[name];

        Events.dynamic(function() {
          var now = timer.time;

          obj[name] = value1 + (value2-value1) * (now-startTime)/duration;

          if ( now > startTime + duration ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        });

        return false;
      });
      fn.apply(this, argsToArray(arguments));
      Events.onSet.pop();
      update();
    };
  },
  */

  // TODO: if this were an object then you could sub-class to modify playback
  compile: function (a, opt_rest) {
    function noop() {}

    function isPause(op) {
      return Array.isArray(op) && op[0] == 0;
    }

    function compilePause(op, rest) {
      return function() {
        document.onclick = function() {
          document.onclick = null;
          rest();
        };
      };
    }

    function isSimple(op) {
      return Array.isArray(op) && typeof op[0] === 'number';
    }

    function compileSimple(op, rest) {
      op[3] = Movement.seq(op[3], rest);
      return function() { Movement.animate.apply(null, op)(); };
    }

    function isParallel(op) {
      return Array.isArray(op) && Array.isArray(op[0]);
    }

    function compileParallel(op, rest) {
      var join = (function(num) {
        return function() { --num || rest(); };
      })(op.length);

      return function() {
        for ( var i = 0 ; i < op.length ; i++ )
          if ( isSimple(op[i]) )
            Movement.animate(op[i][0], op[i][1], op[i][2], Movement.seq(op[i][3], join))();
        else
          Movement.compile(op[i], join)();
      };
    }

    function compileFn(fn, rest) {
      return Movement.seq(fn, rest);
    }

    function compile_(a, i) {
      if ( i >= a.length ) return opt_rest || noop;

      var rest = compile_(a, i+1);
      var op = a[i];

      if ( isPause(op)    ) return compilePause(op, rest);
      if ( isSimple(op)   ) return compileSimple(op, rest);
      if ( isParallel(op) ) return compileParallel(op, rest);

      return compileFn(op, rest);
    }

    return compile_(a, 0);
  },


  onIntersect: function (o1, o2, fn) {

  },


  stepTowards: function(src, dst, maxStep) {
    var dx = src.x - dst.x;
    var dy = src.y - dst.y;
    var theta = Math.atan2(dy,dx);
    var r     = Math.sqrt(dx*dx+dy*dy);
    r = r < 0 ? Math.max(-maxStep, r) : Math.min(maxStep, r);

    dst.x += r*Math.cos(-theta);
    dst.y -= r*Math.sin(-theta);
  },


  /**
   * Cause one object to move towards another at a specified rate.
   *
   * @arg t timer
   * @arg body body to be orbitted
   * @arg sat object to orbit body
   * @arg r radius of orbit
   * @arg p period of orbit
   */
  moveTowards: function (t, body, sat, v) {
    var bodyX = body.propertyValue('x');
    var bodyY = body.propertyValue('y');
    var satX  = sat.propertyValue('x');
    var satY  = sat.propertyValue('y');

    t.addListener(function() {
      var dx = bodyX.get() - satX.get();
      var dy = (bodyY.get() - satY.get());
      var theta = Math.atan2(dy,dx);
      var r     = Math.sqrt(dx*dx+dy*dy);

      r = r < 0 ? Math.max(-v, r) : Math.min(v, r);

      satX.set(satX.get() + r*Math.cos(-theta));
      satY.set(satY.get() - r*Math.sin(-theta));
    });
  },


  /**
   * Cause one object to orbit another.
   *
   * @arg t timer
   * @arg body body to be orbitted
   * @arg sat object to orbit body
   * @arg r radius of orbit
   * @arg p period of orbit
   */
  orbit: function (t, body, sat, r, p) {
    var bodyX = body.x$;
    var bodyY = body.y$;
    var satX  = sat.x$;
    var satY  = sat.y$;

    t.addListener(EventService.animate(function() {
      var time = t.time;
      satX.set(bodyX.get() + r*Math.sin(time/p*Math.PI*2));
      satY.set(bodyY.get() + r*Math.cos(time/p*Math.PI*2));
    }));
  }

};

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
var AbstractFormatter = {
  /** @param p a predicate function or an mLang **/
  where: function(p) {
    return {
      __proto__: this,
      p: ( p.f && p.f.bind(p) ) || p
    };
  },

  p: function() { return true; }
};


var JSONUtil = {

  keyify: function(str) {
    // TODO: check if contains single-quote or other characters
    return '"' + str + '"';
  },

  escape: function(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/[\x00-\x1f]/g, function(c) {
        return "\\u00" + ((c.charCodeAt(0) < 0x10) ?
                          "0" + c.charCodeAt(0).toString(16) :
                          c.charCodeAt(0).toString(16));
      });
  },

  parseToMap: function(str) {
    return eval('(' + str + ')');
  },

  parse: function(str) {
    return this.mapToObj(this.parseToMap(str));
  },

  arrayToObjArray: function(a, opt_defaultModel) {
    for ( var i = 0 ; i < a.length ; i++ ) {
      a[i] = this.mapToObj(a[i], opt_defaultModel);
    }
    return a;
  },

  /**
   * Convert JS-Maps which contain the 'model_' property, into
   * instances of that model.
   **/
  mapToObj: function(obj, opt_defaultModel) {
    if ( ! obj || typeof obj.model_ === 'object' ) return obj;

    if ( Array.isArray(obj) ) return this.arrayToObjArray(obj);

    if ( obj instanceof Function ) return obj;

    if ( obj instanceof Date ) return obj;

    if ( obj instanceof Object ) {
      var j = 0;

      for ( var key in obj ) {
        if ( key != 'model_' && key != 'prototype_' ) obj[key] = this.mapToObj(obj[key]);
        j++;
      }
/*      var keys = Object.keys(obj);
      for ( var j = 0, key; key = keys[j]; j++ ) {
        if ( key != 'model_' && key != 'prototype_' ) obj[key] = this.mapToObj(obj[key]);
      }
      */

      if ( opt_defaultModel && ! obj.model_ ) return opt_defaultModel.create(obj);

      return GLOBAL[obj.model_] ? GLOBAL[obj.model_].create(obj) : obj;
    }

    return obj;
  },

  compact: {
    __proto__: AbstractFormatter,

    stringify: function(obj) {
      var buf = "";

      this.output(function() {
        for (var i = 0; i < arguments.length; i++)
          buf += arguments[i];
      }, obj);

      return buf;
    },

    output: function(out, obj) {
      if ( Array.isArray(obj) ) {
        this.outputArray_(out, obj);
      }
      else if ( typeof obj === 'string' ) {
        out("\"");
        out(JSONUtil.escape(obj));
        out("\"");
      }
      else if ( obj instanceof Function ) {
        out(obj);
      }
      else if ( obj instanceof Date ) {
        out(obj.getTime());
      }
      else if ( obj instanceof Object ) {
        if ( obj.model_ )
          this.outputObject_(out, obj);
        else
          this.outputMap_(out, obj);
      }
      else if (typeof obj === "number") {
        if (!isFinite(obj)) obj = null;
        out(obj);
      }
      else {
        if (obj === undefined) obj = null;
        out(obj);
      }
    },

    outputObject_: function(out, obj) {
      var str = "";

      out('{', '"model_":"', obj.model_.name, '"');

      for ( var key in obj.model_.properties ) {
        var prop = obj.model_.properties[key];

        if ( ! this.p(prop) ) continue;

        if ( prop.name in obj.instance_ ) {
          var val = obj[prop.name];
          if ( val == prop.defaultValue ) continue;
          out(",", JSONUtil.keyify(prop.name), ':');
          this.output(out, val);
        }
      }

      out('}');
    },

    outputMap_: function(out, obj) {
      var str   = "";
      var first = true;

      out('{');

      for ( var key in obj ) {
        var val = obj[key];

        if ( ! first ) out(",");
        out(JSONUtil.keyify(key), ':');
        this.output(out, val);

        first = false;
      }

      out('}');
    },

    outputArray_: function(out, a) {
      if ( a.length == 0 ) { out('[]'); return out; }

      var str   = "";
      var first = true;

      out('[');

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        if ( ! first ) out(',');

        this.output(out, obj);
      }

      out(']');
    }
  },


  pretty: {
    __proto__: AbstractFormatter,

    stringify: function(obj) {
      var buf = "";

      this.output(function() {
        for (var i = 0; i < arguments.length; i++)
          buf += arguments[i];
      }, obj);

      return buf;
    },

    output: function(out, obj, opt_indent) {
      var indent = opt_indent || "";

      if ( Array.isArray(obj) ) {
        this.outputArray_(out, obj, indent);
      }
      else if ( typeof obj == 'string' ) {
        out("\"");
        out(JSONUtil.escape(obj));
        out("\"");
      }
      else if ( obj instanceof Function ) {
        out(obj);
      }
      else if ( obj instanceof Date ) {
        out("new Date('", obj, "')");
      }
      else if ( obj instanceof Object ) {
        if ( obj.model_ )
          this.outputObject_(out, obj, indent);
        else
          this.outputMap_(out, obj, indent);
      } else if (typeof obj === "number") {
        if (!isFinite(obj)) obj = null;
        out(obj);
      } else {
        if (obj === undefined) obj = null;
        out(obj);
      }
    },

    outputObject_: function(out, obj, opt_indent) {
      var indent       = opt_indent || "";
      var nestedIndent = indent + "   ";
      var str          = "";

      out(/*"\n", */indent, '{\n', nestedIndent, '"model_": "', obj.model_.name, '"');

      for ( var key in obj.model_.properties ) {
        var prop = obj.model_.properties[key];

        if ( ! this.p(prop) ) continue;

        if ( prop.name === 'parent' ) continue;
        if ( prop.name in obj.instance_ ) {
          var val = obj[prop.name];
          out(",\n", nestedIndent, "\"", prop.name, "\"", ': ');
          this.output(out, val, nestedIndent);
        }
      }

      out("\n", indent, '}');
    },

    outputMap_: function(out, obj, opt_indent) {
      var indent       = opt_indent || "";
      var nestedIndent = indent + "   ";
      var str          = "";
      var first        = true;

      out(/*"\n",*/ indent, '{\n', nestedIndent);

      for ( var key in obj )
      {
        var val = obj[key];

        if ( ! first ) out(",\n");
        out(nestedIndent, JSONUtil.keyify(key), ': ');
        this.output(out, val, nestedIndent);

        first = false;
      }

      out("\n", indent, '}');
    },

    outputArray_: function(out, a, opt_indent) {
      if ( a.length == 0 ) { out('[]'); return out; }

      var indent       = opt_indent || "";
      var nestedIndent = indent + "   ";
      var str          = "";
      var first        = true;

      out('[\n');

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        if ( ! first ) out(',\n');

        if ( typeof obj == 'string' ) {
          out(nestedIndent);
        }

        this.output(out, obj, nestedIndent);
      }

      out("\n", indent, ']');
    }
  },

  moreCompact: {
    __proto__: AbstractFormatter,
    // TODO: use short-names
  },

  compressed: {
    __proto__: AbstractFormatter,

    stringify: function(obj) {
      return Iuppiter.Base64.encode(Iuppiter.compress(JSONUtil.compact.stringify(obj),true));
    }
  }

};

JSONUtil.stringify = JSONUtil.pretty.stringify.bind(JSONUtil.pretty);
JSONUtil.output = JSONUtil.pretty.output.bind(JSONUtil.pretty);;
JSONUtil.where = JSONUtil.pretty.where.bind(JSONUtil.pretty);;

var NOT_TRANSIENT = function(prop) { return ! prop.transient; };

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
var XMLParser = {
  __proto__: grammar,

  START: seq1(1, sym('whitespace'), sym('tag'), sym('whitespace')),

  tag: seq(
      '<',
      sym('label'),
      sym('whitespace'),
      repeat(sym('attribute'), sym('whitespace')),
      sym('whitespace'),
      '>',
      repeat(alt(
        sym('tag'),
        sym('text')
      )),
      '</', sym('label'), '>'
    ),

  label: str(plus(notChars(' =/\t\r\n<>\'"'))),

  text: str(plus(notChar('<'))),

  attribute: seq(sym('label'), '=', sym('value')),

  value: str(alt(
    seq1(1, '"', repeat(notChar('"')), '"'),
    seq1(1, "'", repeat(notChar("'")), "'")
  )),

  whitespace: repeat(alt(' ', '\t', '\r', '\n'))
};

XMLParser.addActions({
  // Trying to abstract all the details of the parser into one place,
  // and to use a more generic representation in XMLUtil.parse().
  tag: function(xs) {
    // < label ws attributes ws > children </ label >
    // 0 1     2  3          4  5 6        7  8     9

    // Mismatched XML tags
    // TODO: We should be able to set the error message on the ps here.
    if ( xs[1] != xs[8] ) return undefined;

    var obj = { tag: xs[1], attrs: {}, children: xs[6] };

    xs[3].forEach(function(attr) { obj.attrs[attr[0]] = attr[2]; });

    return obj;
  }
});


var XMLUtil = {

  escape: function(str) {
    return str && str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  },

  unescape: function(str) {
    return str && str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
  },

  escapeAttr: function(str) {
    return str && str.replace(/"/g, '&quot;');
  },

  unescapeAttr: function(str) {
    return str && str.replace(/&quot;/g, '"');
  },

  parse: function(str) {
    var result = XMLParser.parseString(str);
    if ( ! result ) return result; // Parse error on undefined.

    // Otherwise result is the <foam> tag.
    return this.parseArray(result.children);
  },

  parseObject: function(tag) {
    var obj = {};
    var self = this;
    tag.children.forEach(function(c) {
      // Ignore children which are not tags.
      if (typeof c === 'object' && c.attrs && c.attrs.name) {
        var result;
        if ( c.attrs.type && c.attrs.type == 'function' ) {
          var code = XMLUtil.unescape(c.children.join(''));
          if ( code.startsWith('function') ) {
            result = eval('(' + code + ')');
          } else {
            result = new Function(code);
          }
        } else {
          result = self.parseArray(c.children);
        }

        obj[self.unescapeAttr(c.attrs.name)] = result;
      }
    });

    if ( !tag.attrs.model ) return obj;
    var model = this.unescapeAttr(tag.attrs.model);
    return GLOBAL[model] ?  GLOBAL[model].create(obj) : obj;
  },

  parseArray: function(a) {
    // Turn <i> tags into primitive values, everything else goes through
    // parseObject.
    // Any loose primitive values are junk whitespace, and ignored.
    var self = this;
    var ret = [];
    a.forEach(function(x) {
      if ( typeof x !== 'object' ) return;
      if ( x.tag == 'i' ) {
        ret.push(XMLUtil.unescape(x.children[0])); // Literal content.
      } else {
        ret.push(self.parseObject(x));
      }
    });

    // Special case: If we found nothing, return all children as a string.
    return ret.length ? ret : XMLUtil.unescape(a.join(''));
  },

  compact: {
    stringify: function(obj) {
      var buf = [];

      this.output(buf.push.bind(buf), obj);

      return '<foam>' + buf.join('') + '</foam>';
    },

    output: function(out, obj) {
      if ( Array.isArray(obj) ) {
        this.outputArray_(out, obj);
      }
      else if ( typeof obj == 'string' ) {
        out(XMLUtil.escape(obj));
      }
      else if ( obj instanceof Function ) {
        out(obj);
      }
      else if ( obj instanceof Object ) {
        if ( obj.model_ )
          this.outputObject_(out, obj);
        else
          this.outputMap_(out, obj);
      }
      else {
        out(obj);
      }
    },

    outputObject_: function(out, obj) {
      out('<object model="', XMLUtil.escapeAttr(obj.model_.name), '">');

      for ( var key in obj.model_.properties ) {
        var prop = obj.model_.properties[key];

        if ( prop.name === 'parent' ) continue;
        if ( obj.instance_ && prop.name in obj.instance_ ) {
          var val = obj[prop.name];

          if ( Array.isArray(val) && val.length == 0 ) continue;

          if ( val == prop.defaultValue ) continue;

          out('<property name="', XMLUtil.escapeAttr(prop.name), '" ' +
              (typeof val === 'function' ? 'type="function"' : '') + '>');
          this.output(out, val);
          out('</property>');
        }
      }

      out('</object>');
    },

    outputMap_: function(out, obj) {
      out('<object>');

      for ( var key in obj ) {
        var val = obj[key];

        out('<property name="', XMLUtil.escapeAttr(key), '">');
        this.output(out, val);
        out('</property>');
      }

      out('</object>');
    },

    outputArray_: function(out, a) {
      if ( a.length == 0 ) return out;

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        if (typeof obj === 'string' || typeof obj === 'number')
          out('<i>', XMLUtil.escape(obj), '</i>');
        else
          this.output(out, obj);
      }
    }
  },

  pretty: {
    stringify: function(obj) {
      var buf = [];

      this.output(buf.push.bind(buf), obj);

      return '<foam>\n' + buf.join('') + '</foam>\n';
    },

    output: function(out, obj, opt_indent) {
      var indent = opt_indent || "";

      if ( Array.isArray(obj) ) {
        this.outputArray_(out, obj, indent);
      }
      else if ( typeof obj == 'string' ) {
        out(XMLUtil.escape(obj));
      }
      else if ( obj instanceof Function ) {
        out(obj);
      }
      else if ( obj instanceof Object ) {
        try {
          if ( obj.model_ && typeof obj.model_ !== 'string' )
            this.outputObject_(out, obj, indent);
          else
            this.outputMap_(out, obj, indent);
        }
        catch (x) {
          console.log('toXMLError: ', x);
        }
      }
      else {
        out(obj);
      }
    },

    outputObject_: function(out, obj, opt_indent) {
      var indent       = opt_indent || "";
      var nestedIndent = indent + "  ";

      out(indent, '<object model="', XMLUtil.escapeAttr(obj.model_.name), '">');

      for ( var key in obj.model_.properties ) {
        var prop = obj.model_.properties[key];

        if ( prop.name === 'parent' ) continue;
        if ( obj.instance_ && prop.name in obj.instance_ ) {
          var val = obj[prop.name];

          if ( Array.isArray(val) && val.length == 0 ) continue;

          if ( val == prop.defaultValue ) continue;

          var type = typeof obj[prop.name] == 'function' ?
              ' type="function"' : '';
          out("\n", nestedIndent, '<property name="',
              XMLUtil.escapeAttr(prop.name), '"', type, '>');
          this.output(out, val, nestedIndent);
          out('</property>');
        }
      }

      out('\n', indent, '</object>');
      out('\n');
    },

    outputMap_: function(out, obj, opt_indent) {
      var indent       = opt_indent || "";
      var nestedIndent = indent + "  ";

      out(indent, '<object>');

      for ( var key in obj ) {
        var val = obj[key];

        out("\n", nestedIndent, '<property name="', XMLUtil.escapeAttr(key), '">');
        this.output(out, val, nestedIndent);
        out('</property>');
      }

      out("\n", indent, '</object>\n');
    },

    outputArray_: function(out, a, opt_indent) {
      if ( a.length == 0 ) return out;

      var indent       = opt_indent || "";
      var nestedIndent = indent + "  ";

      for ( var i = 0 ; i < a.length ; i++, first = false ) {
        var obj = a[i];

        out('\n');
        if (typeof obj === 'string' || typeof obj === 'number')
          out(nestedIndent, '<i>', XMLUtil.escape(obj), '</i>');
        else
          this.output(out, obj, nestedIndent);
      }
      out('\n',indent);
    }
  }
};

XMLUtil.stringify = XMLUtil.pretty.stringify.bind(XMLUtil.pretty);
XMLUtil.output = XMLUtil.pretty.output.bind(XMLUtil.pretty);;

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

/** Create a sub-context, populating with bindings from opt_args. **/
function sub(opt_args, opt_name) {
//  var sub = Object.create(this);
  var sub = {__proto__: this};

  if ( opt_args ) for ( var key in opt_args ) {
    if ( opt_args.hasOwnProperty(key) ) {
      // It looks like the chrome debug console is overwriting sub.window
      // but this prevents it.
      Object.defineProperty(sub, key, {value: opt_args[key], writable: key !== 'window'});
    }
  }
  if ( opt_name ) {
    sub.NAME = opt_name;
    sub.toString = function() { return 'CONTEXT(' + opt_name + ')'; };
  }
  return sub;
}


function subWindow(w, opt_name, isBackground) {
  if ( ! w ) return this.sub();

  var document = w.document;
  var map = {
    isBackground: !!isBackground,
    window: w,
    document: document,
    console: w.console,
    log: w.console.log.bind(console),
    warn: w.console.warn.bind(console),
    info: w.console.info.bind(console),
    error: w.console.error.bind(console),
    $: function(id) {
      if ( document.FOAM_OBJECTS && document.FOAM_OBJECTS[id] )
        return document.FOAM_OBJECTS[id];

      return document.getElementById(id);
    },
    $$: function(cls) {
      return document.getElementsByClassName(cls);
    },
    dynamic: function(fn, opt_fn) { Events.dynamic(fn, opt_fn, this); },
//    animate: function(fn, opt_fn) { Events.dynamic(fn, opt_fn, this); },
    memento: w.WindowHashValue && w.WindowHashValue.create({window: w}),
    setTimeout: w.setTimeout.bind(w),
    clearTimeout: w.clearTimeout.bind(w),
    setInterval: w.setInterval.bind(w),
    clearInterval: w.clearInterval.bind(w),
    requestAnimationFrame: function(f) { return w.requestAnimationFrame(f); },
    cancelAnimationFrame: w.cancelAnimationFrame && w.cancelAnimationFrame.bind(w)
  };

  if ( isBackground ) {
    map.requestAnimationFrame = function(f) { return w.setTimeout(f, 16); };
    map.cancelAnimationFrame = map.clearTimeout;
  }

  var X = this.sub(map, opt_name);
  w.X = X;
  return X;
}

var X = this.subWindow(window, 'DEFAULT WINDOW').sub({IN_WINDOW: false});

function registerModel(model, opt_name) {
  /*
  if ( model.X === this ) {
    this[model.name] = model;

    return model;
  }
  */
  var thisX = this;

  var thisModel = this === GLOBAL ? model : {
    __proto__: model,
      create: function(args, opt_X) {
        return this.__proto__.create(args, thisX);
      }
  };

  Object.defineProperty(
    this,
    opt_name || model.name,
    {
      get: function() {
        return ( this === thisX ) ? thisModel : this.registerModel(model);
      },
      configurabe: true
    }
  );

  return thisModel;
};

var registerFactory = function(model, factory) {
  // TODO
};

var registerModelForModel = function(modelType, targetModel, model) {

};

var registerFactoryForModel = function(factory, targetModel, model) {

};

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var $documents = [];

if ( window ) $documents.push(window.document);

// TODO: clean this up, hide $WID__ in closure
var $WID__ = 0;
function $addWindow(w) {
   w.window.$WID = $WID__++;
   $documents.push(w.document);
}
function $removeWindow(w) {
  for ( var i = $documents.length - 1 ; i >= 0 ; i-- ) {
    if ( ! $documents[i].defaultView || $documents[i].defaultView === w )
      $documents.splice(i,1);
  }
}

/** Replacement for getElementById **/
var $ = function (id) {
  for ( var i = 0 ; i < $documents.length ; i++ ) {
    if ( document.FOAM_OBJECTS && document.FOAM_OBJECTS[id] )
      return document.FOAM_OBJECTS[id];

    var ret = $documents[i].getElementById(id);

    if ( ret ) return ret;
  }
  return undefined;
};
/** Replacement for getElementByClassName **/
var $$ = function (cls) {
  for ( var i = 0 ; i < $documents.length ; i++ ) {
    var ret = $documents[i].getElementsByClassName(cls);

    if ( ret.length > 0 ) return ret;
  }
  return [];
};


var FOAM = function(map) {
   var obj = JSONUtil.mapToObj(map);
   return obj;
};

/**
 * Register a lazy factory for the specified name within a
 * specified context.
 * The first time the name is looked up, the factory will be invoked
 * and its value will be stored in the named slot and then returned.
 * Future lookups to the same slot will return the originally created
 * value.
 **/
FOAM.putFactory = function(ctx, name, factory) {
  ctx.__defineGetter__(name, function() {
    console.log('Bouncing Factory: ', name);
    delete ctx[name];
    return ctx[name] = factory();
  });
};

/*
// Simple Immediate Model Definition
var FOAModel = function(m) {
  var model = Model.create(m);

  GLOBAL[model.name] = model;
}
*/

/*
// Lazy Model Definition - Only creates Model when first referenced
var FOAModel = function(m) {
  Object.defineProperty(GLOBAL, m.name, {
    get: function () {
      // console.log('bounceFactory: ', m.name);
      Object.defineProperty(GLOBAL, m.name, {value: null});
      var model = JSONUtil.mapToObj(m, Model);
      Object.defineProperty(GLOBAL, m.name, {value: model});
      return model;
    },
    configurable: true
  });
}
*/

var UNUSED_MODELS = {};
var USED_MODELS = {};

// Lazy Model Definition - Only creates Model when first referenced
var FOAModel = function(m) {
  // Templates need to access document.currentScript in order to know
  // where to load the template from, so the instantiation of Models
  // with templates can't be delayed (yet).
  if ( m.templates ) {
    registerModel.call(this, JSONUtil.mapToObj(m, Model));
    USED_MODELS[m.name] = true;
    return;
  }

  UNUSED_MODELS[m.name] = true;
  Object.defineProperty(GLOBAL, m.name, {
    get: function () {
      USED_MODELS[m.name] = true;
      delete UNUSED_MODELS[m.name];
      Object.defineProperty(GLOBAL, m.name, {value: null, configurable: true});
      registerModel(JSONUtil.mapToObj(m, Model));
      return this[m.name];
    },
    configurable: true
  });
}

FOAM.browse = function(model, opt_dao) {
   var dao = opt_dao || GLOBAL[model.name + 'DAO'] || GLOBAL[model.plural];

   if ( ! dao ) {
      dao = StorageDAO.create({ model: model });
      GLOBAL[model.name + 'DAO'] = dao;
   }

   var ctrl = DAOController.create({
      model:     model,
      dao:       dao,
      useSearchView: false
   }).addDecorator(ActionBorder.create({ actions: DAOController.actions }));

  var stack = GLOBAL.stack;
  ctrl.X.stack = stack;
  stack.pushView(ctrl);
};

FOAM.lookup = function(key, opt_X) {
  if ( ! typeof key === 'string' ) return key;

  var path = key.split('.');
  var root = opt_X || GLOBAL;
  for ( var i = 0 ; i < path.length ; i++ ) root = root[path[i]];

  return root;
}


FOAModel({
  name: 'UnitTestResultView',
  extendsModel: 'AbstractView',
  properties: [
    {
      name: 'value',
      type: 'Value'
    }
  ],

  methods: {
    toHTML: function() {
      var test = this.value.get();
      var cssClass = test.failed > 0 ? 'foamTestFailed' : 'foamTestPassed';
      var results = test.results.replace(/\n/g, '<br/>\n');
      var pre = '<div class="' + cssClass + ' foamTest" id="' + this.getID() + '">' +
          '<p><strong>' + test.description + '</strong></p>' +
          '<p><span>Passed: ' + test.passed + '</span>&nbsp;&nbsp;' +
          '<span>Failed: ' + test.failed + '</span></p>';
      if (results.length) {
        pre += '<div class="foamTestOutput">' + results + '</div>';
      }

      if (test.tests && test.tests.length > 0) {
        return pre + '<div class="foamInnerTests">' + this.toInnerHTML() + '</div></div>';
      } else {
        return pre + "</div>";
      }
    },

    toInnerHTML: function() {
      var inner = ArrayListView.create({
        value: SimpleValue.create(this.value.get().tests),
        listView: UnitTestResultView
      });
      this.addChild(inner);
      return inner.toHTML();
    }
  }
});

// Given a model and a DOM element, render test results into the element.
// TODO: Put me into a method on models.
function testModel(model, element) {
  if (!model.tests || !element) return;
  model.tests.forEach(function(t) {
    t.test();
    var view = UnitTestResultView.create({ value: SimpleValue.create(t) });
    element.insertAdjacentHTML('beforeend', view.toHTML());
    view.initHTML();
  });
}


function arequire(modelName) {
  var model = GLOBAL[modelName];

  /** This is so that if the model is arequire'd concurrently the
   *  initialization isn't done more than once.
   **/
  if ( ! model.required__ ) {
    // TODO: eventually this should just call the arequire() method on the Model
    var args = [];
    for ( var i = 0 ; i < model.templates.length ; i++ ) {
      var t = model.templates[i];
      args.push(aseq(
        aevalTemplate(model.templates[i]),
        (function(t) { return function(ret, m) {
          model.getPrototype()[t.name] = m;
          ret();
        };})(t)
      ));
    }

    model.required__ = amemo(aseq(
      apar.apply(apar, args),
      aconstant(model)));
  }

  return model.required__;
}


var FOAM_POWERED = '<a style="text-decoration:none;" href="http://code.google.com/p/foam-framework/" target="_blank">\
<font size=+1 face="catull" style="text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">\
<font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#FFCC00">A</font><font color="#33CC00">M</font>\
<font color="#555555" > POWERED</font></font></a>';

/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

/**
 * JSON Parser.
 */
var JSONParser = SkipGrammar.create({
  __proto__: grammar,

  START: copyInput(sym('objAsString')),

  objAsString: copyInput(sym('obj')),

  obj: seq1(1, '{', repeat(sym('pair'), ','), '}'),
    pair: seq(sym('key'), ':', sym('value')),

      key: alt(
        sym('symbol'),
        sym('string')),

        symbol: noskip(str(seq(sym('char'), str(repeat(sym('alpha')))))),
          char: alt(range('a','z'), range('A','Z'), '_', '$'),
          alpha: alt(sym('char'), range('0', '9')),

  value: alt(
    sym('expr'),
    sym('number'),
    sym('string'),
    sym('obj'),
    sym('bool'),
    sym('array')
  ),

  expr: str(seq(
    sym('symbol'), optional(str(alt(
      seq('.', sym('expr')),
      seq('(', str(repeat(sym('value'), ',')), ')')))))),

  number: noskip(seq(
    optional('-'),
    repeat(range('0', '9'), null, 1),
    optional(seq('.', repeat(range('0', '9')))))),

  string: noskip(alt(
    sym('single quoted string'),
    sym('double quoted string'))),

    'double quoted string': seq1(1, '"', str(repeat(sym('double quoted char'))), '"'),
    'double quoted char': alt(
      sym('escape char'),
      literal('\\"', '"'),
      notChar('"')),

    'single quoted string': seq1(1, "'", str(repeat(sym('single quoted char'))), "'"),
    'single quoted char': alt(
      sym('escape char'),
      literal("\\'", "'"),
      notChar("'")),

    'escape char': alt(
      literal('\\\\', '\\'),
      literal('\\n', '\n')),

  bool: alt(
    literal('true', true),
    literal('false', false)),

  array: seq1(1, '[', repeat(sym('value'), ','), ']')
}.addActions({
  obj: function(v) {
    var m = {};
    for ( var i = 0 ; i < v.length ; i++ ) m[v[i][0]] = v[i][2];
    return m;
  }
}), repeat0(alt(' ', '\t', '\n', '\r')));

/*
TODO: move to FUNTest
var res = JSONParser.parseString('{a:1,b:"2",c:false,d:f(),e:g(1,2),f:h.j.k(1),g:[1,"a",false,[]]}');
console.log(res);
*/
/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

/**
 * Simple template system modelled after JSP's.
 *
 * Syntax:
 *    <% code %>: code inserted into template, but nothing implicitly output
 *    <%= comma-separated-values %>: all values are appended to template output
 *    <%# expression %>: dynamic (auto-updating) expression is output
 *    \<new-line>: ignored
 *    %%value(<whitespace>|<): output a single value to the template output
 *    $$feature(<whitespace>|<): output the View or Action for the current Value
 *
 * TODO: add support for arguments
 */

var TemplateParser = {
  __proto__: grammar,

  START: sym('markup'),

  markup: repeat0(alt(
    sym('create child'),
    sym('simple value'),
    sym('live value tag'),
    sym('raw values tag'),
    sym('values tag'),
    sym('code tag'),
    sym('ignored newline'),
    sym('newline'),
    sym('single quote'),
    sym('text')
  )),

  'create child': seq('$$', repeat(notChars(' $\n<{')),
                      optional(JSONParser.export('objAsString'))),

  'simple value': seq('%%', repeat(notChars(' "\n<'))),

  'live value tag': seq('<%#', repeat(not('%>', anyChar)), '%>'),

  'raw values tag': alt(
    seq('<%=', repeat(not('%>', anyChar)), '%>'),
    seq('{{{', repeat(not('}}}', anyChar)), '}}}')
  ),

  'values tag': seq('{{', repeat(not('}}', anyChar)), '}}'),

  'code tag': seq('<%', repeat(not('%>', anyChar)), '%>'),
  'ignored newline': literal('\\\n'),
  newline: literal('\n'),
  'single quote': literal("'"),
  text: anyChar
};

var TemplateOutput = {
  create: function(obj) {
    var buf = '';
    var f = function(/* arguments */) {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var o = arguments[i];
        if ( o ) {
          if ( o.appendHTML ) {
            o.appendHTML(this);
          } else if ( o.toHTML ) {
            buf += o.toHTML();
          } else {
            buf += o;
          }
          if ( o.initHTML && obj.addChild ) obj.addChild(o);
        }
      }
    };

    f.toString = function() { return buf; };

    return f;
  }
};

var TemplateCompiler = {
  __proto__: TemplateParser,

  out: [],

  push: function() { this.out.push.apply(this.out, arguments); },

  header: 'var self = this; var escapeHTML = View.getPrototype().strToHTML; var out = opt_out ? opt_out : TemplateOutput.create(this);' +
    "out('",

  footer: "');" +
    "return out.toString();"

}.addActions({
   markup: function (v) {
     var ret = this.header + this.out.join('') + this.footer;
     this.out = [];
     return ret;
   },
   'create child': function(v) {
     var name = v[1].join('').constantize();
     this.push("', this.createTemplateView('", name, "'",
               v[2] ? ', ' + v[2] : '',
               "),\n'");
   },
   'simple value': function(v) { this.push("',\n this.", v[1].join(''), ",\n'"); },
   'raw values tag': function (v) { this.push("',\n", v[1].join(''), ",\n'"); },
   'values tag': function (v) { this.push("',\n", v[1].join(''), ",\n'"); },
   'live value tag': function (v) { this.push("',\nthis.dynamicTag('span', function() { return ", v[1].join(''), "; }.bind(this)),\n'"); },
   'code tag': function (v) { this.push("');\n", v[1].join(''), "out('"); },
   'single quote': function () { this.push("\\'"); },
   newline: function () { this.push("\\n"); },
   text: function(v) { this.push(v); }
});


var TemplateUtil = {

   /** Create a method which only compiles the template when first used. **/
   lazyCompile: function(t) {
     var delegate;

     return function() {
       if ( ! delegate ) {
         if ( ! t.template )
           throw 'Must arequire() template model before use for ' + t.name;
         delegate = TemplateUtil.compile(t.template);
       }

       return delegate.apply(this, arguments);
     };
   },

   compile: window.chrome && window.chrome.app && window.chrome.app.runtime ?
     function() {
       return function() {
         return "Models must be arequired()'ed for Templates to be compiled in Packaged Apps.";
       };
     } :
     function(str) {
       var code = TemplateCompiler.parseString(str);

       try {
         return new Function("opt_out", code);
       } catch (err) {
         console.log("Template Error: ", err);
         console.log(code);
         return function() {};
       }
     },

   /**
    * Combinator which takes a template which expects an output parameter and
    * converts it into a function which returns a string.
    */
   stringifyTemplate: function (template) {
      return function() {
         var buf = [];

         this.output(buf.push.bind(buf), obj);

         return buf.join('');
      };
   }
};


/** Is actually synchronous but is replaced in ChromeApp with an async version. **/
var aeval = function(src) {
  return aconstant(eval('(' + src + ')'));
};


var aevalTemplate = function(t) {
  if ( t.template ) {
    return aeval('function (opt_out) {' + TemplateCompiler.parseString(t.template) + '}');
  }

  return aseq(
    t.futureTemplate,
    function(ret, template) {
      aeval('function (opt_out) {' + TemplateCompiler.parseString(template) + '}')(ret);
    });
};



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

var prefix = '';

/** The Prototype for all Generated Prototypes. **/
// TODO: Rename FOAMObject or FObject
var AbstractPrototype = {
  __proto__: PropertyChangeSupport,

  TYPE: 'AbstractPrototype',

  create: function(args, opt_X) {
    var o = Object.create(this);
    o.instance_ = {};
    if ( opt_X ) o.X = opt_X;
    if ( typeof args === 'object' ) o.copyFrom(args);

    o.init(args);

    return o;
  },

  /** Context defaults to the global namespace by default. **/
  X: X,

  selectProperties_: function(name, p) {
    if ( this.hasOwnProperty(name) ) return this[name];

    var a = [];
    var ps = this.model_.properties;
    for ( var i = 0 ; i < ps.length ; i++ ) if ( ps[i][p] ) a.push(ps[i]);
    this[name] = a;

    return a;
  },

  init: function(_) {
    if ( ! this.model_ ) return;

    var ps = this.selectProperties_('dynamicValueProperties_', 'dynamicValue');
    for ( var i = 0 ; i < ps.length ; i++ ) {
      var prop = ps[i];

      (function(self, name, dynamicValue) {
        Events.dynamic(dynamicValue.bind(self), function(value) { self[name] = value; } );
      })(this, prop.name, prop.dynamicValue);
    }

    ps = this.selectProperties_('factoryProperties_', 'factory');
    for ( var i = 0 ; i < ps.length ; i++ ) {
      var prop = ps[i];

      // I'm not sure why I added this next line, but it isn't used
      // so I've disabled it.  There is no 'init' property on Property
      // but maybe it would be a good idea.
      //     if ( prop.init ) prop.init.call(this);

      // If a value was explicitly provided in the create args
      // then don't call the factory if it exists.
      // if ( ! this.instance_[prop.name] ) this[prop.name] = prop.factory.call(this);
      if ( ! this.hasOwnProperty(prop.name) ) this[prop.name] = prop.factory.call(this);
    }

    // Add shortcut create() method to Models which allows them to be
    // used as constructors.  Don't do this for the Model though
    // because we need the regular behavior there.
    if ( this.model_ == Model && this.name != 'Model' )
      this.create = ModelProto.create;
  },


  defineFOAMGetter: function(name, getter) {
    var stack = Events.onGet.stack;
    this.__defineGetter__(name, function() {
      var value = getter.call(this, name);
      var f = stack[0];
      f && f(this, name, value);
      return value;
    });
  },

  defineFOAMSetter: function(name, setter) {
    var stack = Events.onSet.stack;
    this.__defineSetter__(name, function(newValue) {
      var f = stack[0];
      if ( f && ! f(this, name, newValue) ) return;
      setter.call(this, newValue, name);
    });
  },

  toString: function() {
    // TODO: do something to detect loops which cause infinite recurrsions.
// console.log(this.model_.name + "Prototype");
    return this.model_.name + "Prototype";
    // return this.toJSON();
  },

  hasOwnProperty: function(name) {
    return typeof this.instance_[name] !== 'undefined';
//    return this.instance_.hasOwnProperty(name);
  },

  writeActions: function(other, out) {
    for ( var i = 0, property ; property = this.model_.properties[i] ; i++ ) {
      if ( property.actionFactory ) {
        var actions = property.actionFactory(this, property.f(this), property.f(other));
        for (var j = 0; j < actions.length; j++)
          out(actions[j]);
      }
    }
  },

  equals: function(other) { return this.compareTo(other) == 0; },

  compareTo: function(other) {
    var ps = this.model_.properties;

    for ( var i = 0 ; i < ps.length ; i++ ) {
      var r = ps[i].compare(this, other);

      if ( r ) return r;
    }

    return 0;
  },

  diff: function(other) {
    var diff = {};

    for ( var i = 0, property; property = this.model_.properties[i]; i++ ) {
      if ( Array.isArray(property.f(this)) ) {
        var subdiff = property.f(this).diff(property.f(other));
        if ( subdiff.added.length !== 0 || subdiff.removed.length !== 0 ) {
          diff[property.name] = subdiff;
        }
        continue;
      }

      if ( property.f(this).compareTo(property.f(other)) !== 0) {
        diff[property.name] = property.f(other);
      }
    }

    return diff;
  },

  /** Reset a property to its default value. **/
  clearProperty: function(name) {
    delete this.instance_[name];
  },

  defineProperty: function(prop) {
    // this method might be a good candidate for a decision table

    var name = prop.name;
    prop.name$_ = name + '$';

    // TODO: add caching
    if ( ! AbstractPrototype.__lookupGetter__(prop.name$_) ) {
      Object.defineProperty(AbstractPrototype, prop.name$_, {
        get: function() { return this.propertyValue(name); },
        set: function(value) { Events.link(value, this.propertyValue(name)); },
        configurable: true
      });
    }

    if ( prop.getter ) {
      this.defineFOAMGetter(name, prop.getter);
    } else {
      this.defineFOAMGetter(name, prop.defaultValueFn ?
        function() {
          return typeof this.instance_[name] !== 'undefined' ? this.instance_[name] : prop.defaultValueFn.call(this, prop);
        } :
        function() {
          return typeof this.instance_[name] !== 'undefined' ? this.instance_[name] : prop.defaultValue;
        });
    }

    if ( prop.setter ) {
      this.defineFOAMSetter(name, prop.setter);
    } else {
      var setter = function(oldValue, newValue) {
        this.instance_[name] = newValue;
      };

      if ( prop.type === 'int' || prop.type === 'float' ) {
        setter = (function(setter) { return function(oldValue, newValue) {
          setter.call(this, oldValue, typeof newValue !== 'number' ? Number(newValue) : newValue);
        }; })(setter);
      }

      if ( prop.postSet ) {
        setter = (function(setter, postSet) { return function(oldValue, newValue) {
          setter.call(this, oldValue, newValue);
          postSet.call(this, oldValue, newValue)
        }; })(setter, prop.postSet);
      }

      var propertyTopic = PropertyChangeSupport.propertyTopic(name);
      setter = (function(setter) { return function(oldValue, newValue) {
        setter.call(this, oldValue, newValue);
        this.propertyChange_(propertyTopic, oldValue, newValue);
      }; })(setter);

      if ( prop.preSet ) {
        setter = (function(setter, preSet) { return function(oldValue, newValue) {
          setter.call(this, oldValue, preSet.call(this, oldValue, newValue, prop));
        }; })(setter, prop.preSet);
      }

      setter = (function(setter) { return function(newValue) {
        setter.call(this, this[name], newValue);
      }; })(setter);

      this.defineFOAMSetter(name, setter);
    }
  },

  hashCode: function() {
    var hash = 17;

    for ( var i = 0; i < this.model_.properties.length ; i++ ) {
      var prop = this[this.model_.properties[i].name];
      var code = ! prop ? 0 :
        prop.hashCode   ? prop.hashCode()
                        : prop.toString().hashCode();

      hash = ((hash << 5) - hash) + code;
      hash &= hash;
    }

    return hash;
  },

  // TODO: this should be monkey-patched from a 'ProtoBuf' library
  toProtobuf: function() {
    var out = ProtoWriter.create();
    this.outProtobuf(out);
    return out.value;
  },

  // TODO: this should be monkey-patched from a 'ProtoBuf' library
  outProtobuf: function(out) {
    for ( var i = 0; i < this.model_.properties.length; i++ ) {
      var prop = this.model_.properties[i];
      if ( Number.isFinite(prop.prototag) )
        prop.outProtobuf(this, out);
    }
  },

  /** Create a shallow copy of this object. **/
  clone: function() {
    var c = Object.create(this.__proto__);
    c.instance_ = {};
    for ( var key in this.instance_ ) {
      var value = this[key];
      c[key] = Array.isArray(value) ? value.clone() : value;
    }
    return c;
//    return ( this.model_ && this.model_.create ) ? this.model_.create(this) : this;
  },

  /** Create a deep copy of this object. **/
  deepClone: function() {
    var cln = this.clone();

    // now clone inner collections
    for ( var key in cln.instance_ ) {
      var val = cln.instance_[key];

      if ( Array.isArray(val) ) {
        for ( var i = 0 ; i < val.length ; i++ ) {
          var obj = val[i];

          obj = obj.deepClone();
        }
      }
    }

    return cln;
  },

  /** @return this **/
  copyFrom: function(src) {
/*
    // TODO: remove the 'this.model_' check when all classes modelled
    if ( src && this.model_ ) {
      for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
        var prop = this.model_.properties[i];

        // If the src is modelled, and it has an instance_
        //   BUT the instance doesn't have a value for the property,
        //   then don't copy this value over since it's a default value.
        if ( src.model_ && src.instance_ &&
            !src.instance_.hasOwnProperty(prop.name) ) continue;

        if ( prop.name in src ) this[prop.name] = src[prop.name];
      }
    }
*/

    if ( src && this.model_ ) {
      var ps = this.model_.properties;
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var prop = ps[i];

        if ( src.hasOwnProperty(prop.name) ) this[prop.name] = src[prop.name];
        if ( src.hasOwnProperty(prop.name$_) ) this[prop.name$_] = src[prop.name$_];
      }
    }

    return this;
  },


  output: function(out) {
    return JSONUtil.output(out, this);
  },


  toJSON: function() {
    return JSONUtil.stringify(this);
  },

  toXML: function() {
    return XMLUtil.stringify(this);
  },

  write: function(document, opt_view) {
    var view = (opt_view || DetailView).create({
      model: this.model_,
      value: SimpleValue.create(this),
      showActions: true
    });

    document.writeln(view.toHTML());
    view.initHTML();
  },

  decorate: function(name, func, that) {
    var delegate = this[name];
    this[name] = function() {
      return func.call(this, that, delegate.bind(this), arguments);
    };
    return this;
  },

  addDecorator: function(decorator) {
    if ( decorator.decorateObject )
      decorator.decorateObject(this);

    for ( var i = 0; i < decorator.model_.methods.length; i++ ) {
      var method = decorator.model_.methods[i];
      if ( method.name !== 'decorateObject' )
        this.decorate(method.name, method.code, decorator);
    }
    return this;
  }
};

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
/**
 * Prototype for original proto-Models.
 * Used during bootstrapping to create the real Model
 * and PropertyModel.
 *
 * TODO: The handling of the various property types (properties,
 *   templates, listeners, etc.) shouldn't be handled here because
 *   it isn't extensible.  The handling should be defined in the
 *   properties property (so meta).
 *
 * TODO: Is still used by a few views in view.js.  Those views
 * should be fixed and then ModelProto should be deleted at
 * the end of metamodel.js once the real Model is created.
 **/

this.Method = null;
this.Action = null;
this.Relationship = null;

/**
 * Override a method, making calling the overridden method possible by
 * calling this.SUPER();
 **/
/* Begin Rhino Compatible Version */
// The try/catch prevents JIT-ing of this method, but it is still faster than
// the alternate version
function override(cls, methodName, method) {
  var super_ = cls[methodName];

  var SUPER = function() { return super_.apply(this, arguments); };

  var f = function() {
    var OLD_SUPER = this.SUPER;
    this.SUPER = SUPER;
    try {
      return method.apply(this, arguments);
    } finally {
      this.SUPER = OLD_SUPER;
    }
  };

  f.super_ = super_;

  cls[methodName] = f;
}
/* End Rhino Compatible Version */

/* Begin Non-Rhino Version */
/*
function override(cls, methodName, method) {
  method.super_ = cls[methodName];
  cls[methodName] = method;
}

Object.defineProperty(AbstractPrototype, 'SUPER', {
  get: function() {
    return arguments.callee.caller.super_.bind(this);
  }
});
*/
/* End Non-Rhino Version */


var ModelProto = {

  __proto__: PropertyChangeSupport,

  TYPE: 'ModelProto <startup only, error if you see this>',

  buildPrototype: function() {
    var extendsModel = this.extendsModel && GLOBAL[this.extendsModel];
    var cls = Object.create(extendsModel ? extendsModel.getPrototype() : AbstractPrototype);
    cls.instance_ = {};
    cls.model_    = this;
    cls.name_     = this.name;
    cls.TYPE      = this.name + "Prototype";

    /** Add a method to 'cls' and set it's name. **/
    function addMethod(name, method) {
      if ( cls.__proto__[name] ) {
        override(cls, name, method);
      } else {
        cls[name] = method;
      }
    }

    // add sub-models
    //        this.models && this.models.forEach(function(m) {
    //          cls[m.name] = JSONUtil.mapToObj(m);
    //        });
    // Workaround for crbug.com/258552
    this.models && Object_forEach(this.models, function(m) {
      cls.model_[m.name] = cls[m.name] = JSONUtil.mapToObj(m, Model);
    });

    // build properties
    if ( this.properties ) {
      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var p = this.properties[i];
        if ( extendsModel ) {
          var superProp = extendsModel.getProperty(p.name);
          if ( superProp ) {
            p = superProp.clone().copyFrom(p);
            this.properties[i] = p;
            this[p.name.constantize()] = p;
          }
        }
        cls.defineProperty(p);
      }
      this.propertyMap_ = null;
    }

    // Copy parent Model's Property Contants to this Model.
    if ( extendsModel ) {
      for ( var i = 0 ; i < extendsModel.properties.length ; i++ ) {
        var p = extendsModel.properties[i];
        var name = p.name.constantize();

        if ( ! this[name] ) this[name] = p;
      }
    }

    // templates
    this.templates && Object_forEach(this.templates, function(t) {
      addMethod(t.name, TemplateUtil.lazyCompile(t));
    });

    // mix-in mixins
    // Workaround for crbug.com/258522
    // this.mixins && Object_forEach(this.mixins, function(m) { /* TODO: something */ });

    // add action
    if ( this.actions ) {
      for ( var i = 0 ; i < this.actions.length ; i++ ) {
        (function(a) {
          if ( extendsModel ) {
            var superAction = extendsModel.getAction(a.name);
            if ( superAction ) {
              console.log('superAction: ', a.name, a.model_.name);
              a = superAction.clone().copyFrom(a);
              this.actions[i] = a;
            }
          }
          addMethod(a.name, function() { a.callIfEnabled(this); });
        }.bind(this))(this.actions[i]);
      }
    }

    // add methods
    for ( var key in this.methods ) {
      var m = this.methods[key];
      if ( Method && Method.isInstance(m) ) {
        addMethod(m.name, m.generateFunction());
      } else {
        addMethod(key, m);
      }
    }

    // add relationships
    for ( var key in this.relationships ) {
      var r = this.relationships[key];

      // console.log('************** rel: ', r, r.name, r.label, r.relatedModel, r.relatedProperty);

      //           this[r.name.constantize()] = r;

      Object.defineProperty(cls, r.name, {
        get: (function (r) {
          return function() {
            return GLOBAL[r.relatedModel].where(EQ(r.relatedProperty, this.id));
          };
        })(r),
        configurable: false
      });
    }

    // todo: move this somewhere better
    var createListenerTrampoline = function(cls, name, fn, isMerged, isAnimated) {
      // bind a trampoline to the function which
      // re-binds a bound version of the function
      // when first called
      fn.name = name;

      Object.defineProperty(cls, name, {
        get: function () {
          var l = fn.bind(this);
          /*
          if ( ( isAnimated || isMerged ) && this.X.isBackground ) {
            console.log('*********************** ', this.model_.name);
            debugger;
          }
          */
          if ( isAnimated )
            l = EventService.animate(l, this.X);
          else if ( isMerged ) {
            l = EventService.merged(
              l,
              (isMerged === true) ? undefined : isMerged, this.X);
          }

          Object.defineProperty(this, name, { value: l});

          return l;
        },
        configurable: true
      });
    };

    // add listeners
    if ( Array.isArray(this.listeners) ) {
      for ( var i = 0 ; i < this.listeners.length ; i++ ) {
        var l = this.listeners[i];
        createListenerTrampoline(cls, l.name, l.code, l.isMerged, l.isAnimated);
      }
    } else if ( this.listeners )
      //          this.listeners.forEach(function(l, key) {
      // Workaround for crbug.com/258522
      Object_forEach(this.listeners, function(l, key) {
        createListenerTrampoline(cls, key, l);
      });

    // add topics
    //        this.topics && this.topics.forEach(function(t) {
    // Workaround for crbug.com/258522
    this.topics && Object_forEach(this.topics, function(t) {
      // TODO: something
    });

    // copy parent model's properties and actions into this model
    if ( extendsModel ) {
      for ( var i = extendsModel.properties.length-1 ; i >= 0 ; i-- ) {
        var p = extendsModel.properties[i];
        if ( ! ( this.getProperty && this.getPropertyWithoutCache_(p.name) ) )
          this.properties.unshift(p);
      }
      this.propertyMap_ = null;
      this.actions = extendsModel.actions.concat(this.actions);
    }

    // build primary key getter and setter
    if ( this.properties.length > 0 && ! cls.__lookupGetter__('id') ) {
      var primaryKey = this.ids;

      if ( primaryKey.length == 1 ) {
        cls.__defineGetter__('id', function() { return this[primaryKey[0]]; });
        cls.__defineSetter__('id', function(val) { this[primaryKey[0]] = val; });
      } else if (primaryKey.length > 1) {
        cls.__defineGetter__('id', function() {
          return primaryKey.map(function(key) { return this[key]; }); });
        cls.__defineSetter__('id', function(val) {
          primaryKey.map(function(key, i) { this[key] = val[i]; }); });
      }
    }

    return cls;
  },

  getPrototype: function() {
    return this.prototype_ && this.prototype_.model_ == this ?
      this.prototype_ :
      ( this.prototype_ = this.buildPrototype() );
  },

  create: function(args, X) { return this.getPrototype().create(args, X); },

  isSubModel: function(model) {
    try {
      return model && ( model === this || this.isSubModel(model.getPrototype().__proto__.model_) );
    } catch (x) {
      return false;
    }
  },

  getPropertyWithoutCache_: function(name) {
    for ( var i = 0 ; i < this.properties.length ; i++ ) {
      var p = this.properties[i];

      if ( p.name === name ) return p;
    }

    return null;
  },

  getProperty: function(name) {
    // NOTE: propertyMap_ is invalidated in a few places
    // when properties[] is updated.
    if ( ! this.propertyMap_ ) {
      if ( ! this.properties.length ) return undefined;

      var m = {};

      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var prop = this.properties[i];
        m[prop.name] = prop;
      }

      this.propertyMap_ = m;
    }

    return this.propertyMap_[name];
  },

  getAction: function(name) {
    for ( var i = 0 ; i < this.actions.length ; i++ )
      if ( this.actions[i].name === name ) return this.actions[i];
  },

  hashCode: function() {
    var string = "";
    for ( var key in this.properties ) {
      string += this.properties[key].toString();
    }
    return string.hashCode();
  },

  isInstance: function(obj) { return obj && obj.model_ && this.isSubModel(obj.model_); },

  toString: function() { return "ModelProto(" + this.name + ")"; }
};

/*
 * Ex.
 * OR(EQ(Issue.ASSIGNED_TO, 'kgr'), EQ(Issue.SEVERITY, 'Minor')).toSQL();
 *   -> "(assignedTo = 'kgr' OR severity = 'Minor')"
 * OR(EQ(Issue.ASSIGNED_TO, 'kgr'), EQ(Issue.SEVERITY, 'Minor')).f(Issue.create({assignedTo: 'kgr'}));
 *   -> true
 */

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
var BinaryProtoGrammar;

var Model = {
  __proto__: ModelProto,

  name:  'Model',
  plural:'Models',
  help:  "Describes the attributes and properties of an entity.",

  tableProperties: [
    'name', 'label', 'plural'
  ],

  ids: [ 'name' ],

  properties: [
    {
      name:  'package',
      help: 'Java class package.',
      defaultValueFn: function() {
        return this.extendsModel ? GLOBAL[this.extendsModel].package : '';
      }
    },
    {
      name:  'abstract',
      type: 'boolean',
      defaultValue: false,
      help: 'If the java class is abstract.'
    },
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the entity.'
    },
    {
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The display label for the entity.'
    },
    {
      name: 'javaClassName',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return (this.abstract ? 'Abstract' : '') + this.name; },
      help: 'The Java classname of this Model.'
    },
    {
      name: 'extendsModel',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The parent model of this model.'
    },
    {
      name: 'plural',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name + 's'; },
      help: 'The plural form of this model\'s name.'
    },
    {
      name: 'version',
      type: 'int',
      defaultValue: 1,
      help: 'Version number of model.'
    },
    {
      name: 'ids',
      label: 'Key Properties',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValueFn: function() {
        return this.properties.length ? [this.properties[0].name] : [];
      },
      help: 'Properties which make up unique id.'
    },
    {
      name: 'tableProperties',
      type: 'Array[String]',
      view: 'StringArrayView',
      displayWidth: 70,
      factory: function() {
        return this.properties.map(function(o) { return o.name; });
      },
      help: 'Properties to be displayed in table view. Defaults to all properties.'
    },
    {
      name: 'searchProperties',
      type: 'Array[String]',
      view: 'StringArrayView',
      displayWidth: 70,
      defaultValueFn: function() {
        return this.tableProperties;
      },
      help: 'Properties display in a search view. Defaults to table properties.'
    },
    {
      name: 'properties',
      type: 'Array[Property]',
      subType: 'Property',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Properties associated with the entity.',
      preSet: function(oldValue, newValue) {
        if ( ! Property ) return;
        // Convert Maps to Properties if required
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var p = newValue[i];

          if ( typeof p === 'string' ) newValue[i] = p = { name: p };

          if ( ! p.model_ ) {
            p = newValue[i] = Property.create(p);
          } else if ( typeof p.model_ === 'string' ) {
            p = newValue[i] = FOAM(p);
          }

          // create property constant
          this[p.name.constantize()] = newValue[i];
        }

        this.propertyMap_ = null;

        return newValue;
      }
    },
    {
      name: 'actions',
      type: 'Array[Action]',
      subType: 'Action',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Actions associated with the entity.',
      preSet: function(_, newValue) {
        if ( ! Action ) return;

        // Convert Maps to Properties if required
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var p = newValue[i];

          if ( ! p.model_ ) {
            newValue[i] = Action.create(p);
          } else if ( typeof p.model_ === 'string' ) {
            newValue[i] = FOAM(p);
          }

          // create property constant
          this[p.name.constantize()] = newValue[i];
        }

        return newValue;
      }
    },
    {
      name: 'methods',
      type: 'Array[Method]',
      subType: 'Method',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Methods associated with the entity.',
      preSet: function(_, newValue) {
        if ( ! Method ) return;

        if ( Array.isArray(newValue) ) return JSONUtil.arrayToObjArray(newValue, Method);

        // convert a map of functions to an array of Method instances
        var methods = [];

        for ( var key in newValue ) {
          var oldValue = newValue[key];
          var method   = Method.create({name: key, code: oldValue});

          methods.push(method);
        }

        return methods;
      }
    },
    {
      name: 'listeners',
      type: 'Array[Method]',
      subType: 'Method',
      view: 'ArrayView',
      factory: function() { return []; },
      preSet: function(_, newValue) {
        if ( Array.isArray(newValue) ) return JSONUtil.arrayToObjArray(newValue, Method);
        return newValue;
      },
      defaultValue: [],
      help: 'Event listeners associated with the entity.'
    },
    /*
      {
      name: 'topics',
      type: 'Array[topic]',
      subType: 'Topic',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Event topics associated with the entity.'
      },
    */
    {
      name: 'templates',
      type: 'Array[Template]',
      subType: 'Template',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      postSet: function(_, templates) {
        // Load templates from an external file
        // if their 'template' property isn't set
        var i = 0;
        templates.forEach(function(t) {
          if ( typeof t === 'function' ) {
            t = templates[i] = Template.create({name: t.name, template: multiline(t)});
          } else if ( ! t.template ) {
            // console.log('loading: '+ this.name + ' ' + t.name);

            var future = afuture();
            var path = document.currentScript.src;

            t.futureTemplate = future.get;
            path = path.substring(0, path.lastIndexOf('/')+1);
            path += this.name + '_' + t.name + '.ft';

            var xhr = new XMLHttpRequest();
            xhr.open("GET", path);
            xhr.asend(function(data) {
              t.template = data;
              future.set(data);
              t.futureTemplate = undefined;
            });
          } else if ( typeof t.template === 'function' ) {
            t.template = multiline(t.template);
          }

          i++;
        }.bind(this));
      },
      //         defaultValueFn: function() { return []; },
      help: 'Templates associated with this entity.'
    },
    {
      name: 'models',
      type: 'Array[Model]',
      subType: 'Model',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Sub-models embedded within this model.'
    },
    {
      name: 'tests',
      label: 'Unit Tests',
      type: 'Array[Unit Test]',
      subType: 'UnitTest',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Unit tests associated with this model.'
    },
    {
      name: 'relationships',
      subType: 'Relationship',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Relationships of this model to other models.',
      preSet: function(_, newValue) {
        if ( ! Relationship ) return;

        // Convert Maps to Properties if required
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var p = newValue[i];

          if ( ! p.model_ ) {
            p = newValue[i] = Relationship.create(p);
          } else if ( typeof p.model_ === 'string' ) {
            p = newValue[i] = FOAM(p);
          }

          // create property constant
          this[p.name.constantize()] = newValue[i];
        }

        return newValue;
      }
    },
    {
      name: 'issues',
      type: 'Array[Issue]',
      subType: 'Issue',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Issues associated with this model.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      view: 'TextAreaView',
      defaultValue: '',
      help: 'Help text associated with the entity.'
    },
    {
      name: 'notes',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      view: 'TextAreaView',
      defaultValue: '',
      help: 'Internal documentation associated with this entity.'
    },
    {
      name: 'createActionFactory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Factory to create the action object for creating this object'
    },
    {
      name: 'deleteActionFactory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Factory to create the action object for deleting this object'
    }
  ],

  templates:[
    {
      model_: 'Template',
      name: 'javaSource',
      description: 'Java Source',
      "template": "// Generated by FOAM, do not modify.\u000a// Version <%= this.version %>\u000a<%\u000a  var className       = this.javaClassName;\u000a  var parentClassName = this.extendsModel ? this.extendsModel : 'AbstractFObject';\u000a\u000a  if ( GLOBAL[parentClassName] && GLOBAL[parentClassName].abstract ) parentClassName = 'Abstract' + parentClassName;\u000a\u000a%>\u000a<% if ( this.package ) { %>\\\u000apackage <%= this.package %>;\u000a\u000a<% } %>\\\u000aimport foam.core.*;\u000a\u000apublic<%= this.abstract ? ' abstract' : '' %> class <%= className %>\u000a   extends <%= parentClassName %>\u000a{\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   public final static Property <%= prop.name.constantize() %> = new Abstract<%= prop.javaType.capitalize() %>Property() {\u000a     public String getName() { return \"<%= prop.name %>_\"; }\u000a     public String getLabel() { return \"<%= prop.label %>\"; }\u000a     public Object get(Object o) { return ((<%= this.name %>) o).get<%= prop.name.capitalize() %>(); }\u000a     public void set(Object o, Object v) { ((<%= this.name %>) o).set<%= prop.name.capitalize() %>(toNative(v)); }\u000a     public int compare(Object o1, Object o2) { return compareValues(((<%= this.name%>)o1).<%= prop.name %>_, ((<%= this.name%>)o2).<%= prop.name %>_); }\u000a   };\u000a   <% } %>\u000a\u000a   final static Model model__ = new AbstractModel(new Property[] {<% for ( var key in this.properties ) { var prop = this.properties[key]; %> <%= prop.name.constantize() %>,<% } %> }) {\u000a     public String getName() { return \"<%= this.name %>\"; }\u000a     public String getLabel() { return \"<%= this.label %>\"; }\u000a     public Property id() { return <%= this.ids.length ? this.ids[0].constantize() : 'null' %>; }\u000a   };\u000a\u000a   public Model model() {\u000a     return model__;\u000a   }\u000a   public static Model MODEL() {\u000a     return model__;\u000a   }\u000a\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   private <%= prop.javaType %> <%= prop.name %>_;   <% } %>\u000a\u000a   public <%= className %>()\u000a   {\u000a   }\u000a<% if ( this.properties.length ) { %> \u000a   public <%= className %>(<% for ( var key in this.properties ) { var prop = this.properties[key]; %><%= prop.javaType, ' ', prop.name, key < this.properties.length-1 ? ', ': '' %><% } %>)\u000a   {   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      <%= prop.name %>_ = <%= prop.name %>;   <% } %>\u000a   }\u000a<% } %>\u000a\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a   public <%= prop.javaType %> get<%= prop.name.capitalize() %>() {\u000a       return <%= prop.name %>_;\u000a   };\u000a   public void set<%= prop.name.capitalize() %>(<%= prop.javaType, ' ', prop.name %>) {\u000a       <%= prop.name %>_ = <%= prop.name %>;\u000a   };\u000a   <% } %>\u000a\u000a   public int hashCode() { \u000a      int hash = 1;\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      hash = hash * 31 + hash(<%= prop.name %>_);   <% } %>\u000a\u000a      return hash;\u000a   }\u000a\u000a   public int compareTo(Object obj) {\u000a      if ( obj == this ) return 0;\u000a      if ( obj == null ) return 1;\u000a\u000a      <%= this.name %> other = (<%= this.name %>) obj;\u000a \u000a      int cmp;\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\u000a      if ( ( cmp = compare(get<%= prop.name.capitalize() %>(), other.get<%= prop.name.capitalize() %>()) ) != 0 ) return cmp;   <% } %>\u000a\u000a      return 0;\u000a   }\u000a\u000a   public StringBuilder append(StringBuilder b) {\u000a      return b\u000a   <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\\\u000a      .append(\"<%= prop.name %>=\").append(get<%= prop.name.capitalize() %>())<%= key < this.properties.length-1 ? '.append(\", \")' : '' %> \u000a   <% } %>      ;\u000a   }\u000a\u000a   public Object fclone() {\u000a      <%= this.name %> c = new <%= this.name %>();\u000a      <% for ( var key in this.properties ) { var prop = this.properties[key]; %>\\\u000ac.set<%= prop.name.capitalize() %>(get<%= prop.name.capitalize() %>());\u000a      <% } %>\\\u000areturn c;\u000a   }\u000a\u000a}"
    },
    {
      model_: 'Template',
      name: 'closureExterns',
      description: 'Closure Externs JavaScript Source',
      template: '/**\n' +
        ' * @constructor\n' +
        ' */\n' +
        '<%= this.name %> = function() {};\n' +
        '<% for ( var i = 0 ; i < this.properties.length ; i++ ) { var prop = this.properties[i]; %>' +
        '\n<%= prop.closureSource(undefined, this.name) %>\n' +
        '<% } %>' +
        '<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '\n<%= meth.closureSource(undefined, this.name) %>\n' +
        '<% } %>'
    },
    {
      model_: 'Template',
      name: 'dartSource',
      description: 'Dart Class Source',
      template: '<% out(this.name); %>\n{\n<% for ( var key in this.properties ) { var prop = this.properties[key]; %>   var <%= prop.name %>;\n<% } %>\n\n   <%= this.name %>()\n   {\n\n   }\n\n   <%= this.name %>(<% for ( var key in this.properties ) { var prop = this.properties[key]; %>this.<%= prop.name, key < this.properties.length-1 ? ", ": "" %><% } %>)\n}'
    }
  ],

  toString: function() { return "Model"; }
};

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
var Property = {
  __proto__: ModelProto,

  name:  'Property',
  plural:'Properties',
  help:  'Describes a properties of a modelled entity.',

  ids: [ 'name' ],

  tableProperties: [
    'name',
    'label',
    'type',
    'required',
    'defaultValue'
  ],

  properties: [
    {
      name: 'name',
      type: 'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the property.'
    },
    {
      name: 'label',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The display label for the property.'
    },
    {
      name: 'tableLabel',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The table display label for the entity.'
    },
    {
      name: 'type',
      type: 'String',
      required: true,
      // todo: curry arguments
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Array',
          'Boolean',
          'Color',
          'Date',
          'DateTime',
          'Email',
          'Enum',
          'Float',
          'Function',
          'Image',
          'Int',
          'Object',
          'Password',
          'String',
          'String[]',
          'URL'
        ]});}
      },
      defaultValue: 'String',
      help: 'The type of the property.'
    },
    {
      name: 'javaType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The java type that represents the type of this property.'
    },
    {
      name: 'javascriptType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The javascript type that represents the type of this property.'
    },
    {
      name: 'shortName',
      type: 'String',
      required: true,
      displayWidth: 10,
      displayHeight: 1,
      defaultValue: '',
      help: 'A short alternate name to be used for compact encoding.'
    },
    {
      name: 'aliases',
      type: 'Array[String]',
      view: 'StringArrayView',
      defaultValue: [],
      help: 'Alternate names for this property.'
    },
    {
      name: 'mode',
      type: 'String',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); } }
    },
    {
      name: 'subType',
      label: 'Sub-Type',
      type: 'String',
      displayWidth: 30,
      // todo: keyView of Models
      help: 'The type of the property.'
    },
    {
      name: 'units',
      type: 'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The units of the property.'
    },
    {
      name: 'required',
      type: 'Boolean',
      view: 'BooleanView',
      defaultValue: true,
      help: 'Indicates if the property is a required field.'
    },
    {
      name: 'hidden',
      type: 'Boolean',
      view: 'BooleanView',
      defaultValue: false,
      help: 'Indicates if the property is hidden.'
    },
    {
      name: 'transient',
      type: 'Boolean',
      view: 'BooleanView',
      defaultValue: false,
      help: 'Indicates if the property is transient.'
    },
    {
      name: 'displayWidth',
      type: 'int',
      displayWidth: 8,
      displayHeight: 1,
      defaultValue: '30',
      help: 'The display width of the property.'
    },
    {
      name: 'displayHeight',
      type: 'int',
      displayWidth: 8,
      displayHeight: 1,
      defaultValue: 1,
      help: 'The display height of the property.'
    },
    {
      name: 'view',
      type: 'view',
      defaultValue: 'TextFieldView',
      help: 'View component for the property.'
    },
    {
      model_: 'FunctionProperty',
      name: 'detailViewPreRow',
      defaultValue: function() { return ""; },
      help: 'Inject HTML before row in DetailView.'
    },
    {
      model_: 'FunctionProperty',
      name: 'detailViewPostRow',
      defaultValue: function() { return ""; },
      help: 'Inject HTML before row in DetailView.'
    },
    {
      name: 'defaultValue',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The property\'s default value.'
    },
    {
      name: 'defaultValueFn',
      label: 'Default Value Function',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'The property\'s default value function.'
    },
    {
      name: 'dynamicValue',
      label: "Value's Dynamic Function",
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: "A dynamic function which computes the property's value."
    },
    {
      name: 'factory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Factory for creating initial value when new object instantiated.'
    },
    {
      name: 'getter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'The property\'s default value function.'
    },
    {
      name: 'preSet',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'An adapter function called before normal setter logic.'
    },
    {
      name: 'postSet',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'A function called after normal setter logic, but before property change event fired.'
    },
    {
      name: 'setter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'The property\'s default value function.'
    },
    {
      name: 'tableFormatter',
      label: 'Table Cell Formatter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Function to format value for display in TableView.'
    },
    {
      name: 'summaryFormatter',
      label: 'Summary Formatter',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Function to format value for display in SummaryView.'
    },
    {
      name: 'tableWidth',
      type: 'String',
      required: false,
      defaultValue: '',
      help: 'Table View Column Width.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      required: false,
      displayWidth: 70,
      displayHeight: 6,
      view: 'TextAreaView',
      defaultValue: '',
      help: 'Help text associated with the property.'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'actionFactory',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      rows:3,
      view: 'FunctionView',
      defaultValue: '',
      help: 'Factory to create the action objects for taking this property from value A to value B'
    },
    {
      name: 'compareProperty',
      type: 'Function',
      view: 'FunctionView',
      displayWidth: 70,
      displayHeight: 5,
      defaultValue: function(o1, o2) {
        return (o1.localeCompare || o1.compareTo).call(o1, o2);
      },
      help: 'Comparator function.'
    },
    {
      name: 'fromElement',
      defaultValue: function(e) { return e.innerHTML; },
      help: 'Function to extract from from DOM Element.'
    },
    {
      name: 'autocompleter',
      subType: 'Autocompleter',
      help: 'Name or model for the autocompleter for this property.',
    },
  ],

  methods: {
    f: function(obj) { return obj[this.name] || obj; },
    compare: function(o1, o2) {
      return this.compareProperty(this.f(o1), this.f(o2));
    },
    toSQL: function() { return this.name; },
    toMQL: function() { return this.name; }
  },

  getProperty: function(name) {
debugger; // Why is this here?  Is it ever called?
    for ( var i = 0 ; i < this.properties.length ; i++ ) {
      var p = this.properties[i];

      if ( p.name === name ) return p;
    }

    document.writeln("couldn't find: " + name);
    return null;
  },

  templates: [
    {
      model_: 'Template',
      name: 'closureSource',
      description: 'Closure Externs JavaScript Source',
      template:
      '/**\n' +
        ' * @type {<%= this.javascriptType %>}\n' +
        ' */\n' +
        '<%= arguments[1] %>.prototype.<%= this.name %> = undefined;'
    }
  ],

  toString: function() { return "Property"; }
};


Model.methods = {
  getPropertyWithoutCache_: ModelProto.getPropertyWithoutCache_,
  getProperty:              ModelProto.getProperty,
  getAction:                ModelProto.getAction,
  hashCode:                 ModelProto.hashCode,
  buildPrototype:           ModelProto.buildPrototype,
  getPrototype:             ModelProto.getPrototype,
  isSubModel:               ModelProto.isSubModel,
  isInstance:               ModelProto.isInstance
};

// This is the coolest line of code that I've ever written
// or ever will write. Oct. 4, 2011 -- KGR
Model = Model.create(Model);
Model.model_ = Model;

Property = Model.create(Property);

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
var StringProperty = Model.create({
  extendsModel: 'Property',

  name:  'StringProperty',
  help:  "Describes a properties of type String.",

  properties: [
    {
      name: 'displayHeight',
      type: 'int',
      displayWidth: 8,
      defaultValue: 1,
      help: 'The display height of the property.'
    },
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'String',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'preSet',
      defaultValue: function (_, v) {
        return v === undefined || v === null ? '' : v.toString();
      }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 70,
      defaultValue: 'String',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'TextFieldView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var BooleanProperty = Model.create({
  extendsModel: 'Property',

  name:  'BooleanProperty',
  help:  "Describes a properties of type String.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Boolean',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 70,
      defaultValue: 'bool',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'BooleanView'
    },
    {
      name: 'defaultValue',
      defaultValue: false
    },
    {
      name: 'preSet',
      defaultValue: function (_, v) { return !!v; }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'fromElement',
      defaultValue: function(e) {
        var txt = e.innerHTML.trim();
        return txt.equalsIC('y') || txt.equalsIC('yes') || txt.equalsIC('true') || txt.equalsIC('t');
      }
    }

  ]
});


/*
  preSet: function (d) {
  return typeof d === 'string' ? new Date(d) : d;
  },
  tableFormatter: function(d) {
  return d.toDateString();
  },
  factory: function() { return new Date(); }

*/


var DateProperty = Model.create({
  extendsModel: 'Property',

  name:  'DateProperty',
  help:  "Describes a properties of type String.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Date',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 50
    },
    {
      name: 'javaType',
      type: 'String',
      defaultValue: 'Date',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      // TODO: create custom DateView
      defaultValue: 'DateFieldView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'preSet',
      defaultValue: function (_, d) {
        return typeof d === 'string' ? new Date(d) : d;
      }
    },
    {
      name: 'tableFormatter',
      defaultValue2: function(d) {
        return d.toDateString();
      },
      defaultValue: function(d) {
        return d.toRelativeDateString();
      }
    }
  ]
});


var DateTimeProperty = Model.create({
  extendsModel: 'DateProperty',

  name:  'DateTimeProperty',
  help:  "Describes a properties of type String.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 25,
      defaultValue: 'datetime',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'preSet',
      defaultValue: function(_, d) {
        if ( typeof d === 'number' ) return new Date(d);
        if ( typeof d === 'string' ) return new Date(d);
        return d;
      }
    },
    {
      name: 'view',
      defaultValue: 'DateTimeFieldView'
    }
  ]
});


var IntProperty = Model.create({
  extendsModel: 'Property',

  name:  'IntProperty',
  help:  "Describes a properties of type Int.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Int',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 10
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'int',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'IntFieldView'
    },
    {
      name: 'preSet',
      defaultValue: function (_, v) { return parseInt(v || 0); }
    },
    {
      name: 'defaultValue',
      defaultValue: 0
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    },
    {
      name: 'compareProperty',
      defaultValue: function(o1, o2) {
        return o1 === o2 ? 0 : o1 > o2 ? 1 : -1;
      }
    }
  ]
});


var FloatProperty = Model.create({
  extendsModel: 'Property',

  name:  'FloatProperty',
  help:  "Describes a properties of type Float.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Float',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'defaultValue',
      defaultValue: 0.0
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'double',
      help: 'The Java type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 15
    },
    {
      name: 'view',
      defaultValue: 'FloatFieldView'
    },
    {
      name: 'preSet',
      defaultValue: function (_, v) { return parseFloat(v || 0.0); }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var FunctionProperty = Model.create({
  extendsModel: 'Property',

  name:  'FunctionProperty',
  help:  "Describes a properties of type Function.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Function',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'Function',
      help: 'The Java type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 15
    },
    {
      name: 'view',
      defaultValue: 'FunctionView'
    },
    {
      name: 'defaultValue',
      defaultValue: function() {}
    },
    {
      name: 'fromElement',
      defaultValue: function(e) {
        var txt = e.innerHTML.trim();

        return txt.startsWith('function') ?
          eval('(' + txt + ')') :
          new Function(txt) ;
      }
    },
    {
      name: 'preSet',
      defaultValue: function(_, value) {
        if ( typeof value === 'string' ) {
          return value.startsWith('function') ?
              eval('(' + value + ')') :
              new Function(value);
        }
        return value;
      }
    }
  ]
});


var ArrayProperty = Model.create({
  extendsModel: 'Property',

  name:  'ArrayProperty',
  help:  "Describes a properties of type Array.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Array',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: '',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'preSet',
      defaultValue: function(_, a, prop) {
        var m = GLOBAL[prop.subType];

        if ( ! m ) return a;

        for ( var i = 0 ; i < a.length ; i++ ) {
          // TODO: remove when 'redundant model_'s removed
          /*
            if ( a[i].model_ ) {
            if ( a[i].model_ == prop.subType ) {
            console.log('********* redundant model_ ', prop.subType)
            } else {
            console.log('*');
            }
            }
          */
          a[i] = a[i].model_ ? FOAM(a[i]) : m.create(a[i]);
        }

        return a;
      }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValueFn: function(p) { return p.subType + '[]'; },
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'ArrayView'
    },
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var ReferenceProperty = Model.create({
  extendsModel: 'Property',

  name:  'ReferenceProperty',
  help:  "A foreign key reference to another Entity.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Reference',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: '',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'subKey',
      type: 'EXPR',
      displayWidth: 20,
      factory: function() { return this.subType + '.ID'; },
      help: 'The foreign key that this property references.'
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      // TODO: should obtain primary-key type from subType
      defaultValueFn: function(p) { return 'Object'; },
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'TextFieldView'
// TODO: Uncomment when all usages of ReferenceProperty/ReferenceArrayProperty fixed.
//      defaultValue: 'KeyView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var StringArrayProperty = Model.create({
  extendsModel: 'Property',

  name:  'StringArrayProperty',
  help:  "An array of String values.",

  properties: [
    {
      name: 'type',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'Array[]',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'subType',
      type: 'String',
      displayWidth: 20,
      defaultValue: 'String',
      help: 'The FOAM sub-type of this property.'
    },
    {
      name: 'displayWidth',
      defaultValue: 50
    },
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'javaType',
      type: 'String',
      displayWidth: 10,
      defaultValue: 'String[]',
      help: 'The Java type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'StringArrayView'
    },
    {
      name: 'prototag',
      label: 'Protobuf tag',
      type: 'Int',
      required: false,
      help: 'The protobuf tag number for this field.'
    }
  ]
});


var DAOProperty = Model.create({
  extendsModel: 'Property',

  name:  'DAOProperty',
  help:  "Describes a DAO property.",

  properties: [
    {
      name: 'type',
      defaultValue: 'DAO',
      help: 'The FOAM type of this property.'
    },
    {
      name: 'view',
      defaultValue: 'ArrayView'
    },
    {
      name: 'getter',
      defaultValue: function(name) {
        if ( ! this.instance_[name] )
          this.instance_[name] = ProxyDAO.create({ delegate: NullDAO.create({}) });
        return this.instance_[name];
      }
    },
    {
      name: 'setter',
      defaultValue: function(dao, name) {
        if ( ! dao ) return;
        if ( ! this.instance_[name] ) this.instance_[name] = ProxyDAO.create();
        this.instance_[name].delegate = dao;
      }
    }
  ]
});

var ReferenceArrayProperty = Model.create({
  name: 'ReferenceArrayProperty',
  extendsModel: 'ReferenceProperty',

  properties: [
    {
      name: 'type',
      defaultValue: 'Array',
      displayWidth: 20,
      help: 'The FOAM type of this property.'
    },
    {
      name: 'factory',
      defaultValue: function() { return []; },
    },
    {
      name: 'view',
      defaultValue: 'StringArrayView',
// TODO: Uncomment when all usages of ReferenceProperty/ReferenceArrayProperty fixed.
//      defaultValue: 'DAOKeyView'
    }
  ]
});

var EMailProperty = StringProperty;
var URLProperty = StringProperty;

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
// Now remove ModelProto so nobody tries to use it
// TODO: do this once no views use it directly
// delete ModelProto;

FOAModel({
  name: 'Action',

  tableProperties: [
    'name',
    'label'
  ],

  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the action.'
    },
    {
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The display label for the action.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      help: 'Help text associated with the action.'
    },
    {
      name: 'default',
      type: 'Boolean',
      view: 'BooleanView',
      defaultValue: false,
      help: 'Indicates if this is the default action.'
    },
    {
      model_: 'FunctionProperty',
      name: 'isAvailable',
      label: 'Available',
      displayWidth: 70,
      displayHeight: 3,
      defaultValue: function() { return true; },
      help: 'Function to determine if action is available.'
    },
    {
      model_: 'FunctionProperty',
      name: 'isEnabled',
      label: 'Enabled',
      displayWidth: 70,
      displayHeight: 3,
      defaultValue: function() { return true; },
      help: 'Function to determine if action is enabled.'
    },
    {
      model_: 'FunctionProperty',
      name: 'labelFn',
      label: 'Label Function',
      defaultValue: function(action) { return action.label; },
      help: "Function to determine label. Defaults to 'this.label'."
    },
    {
      name: 'iconUrl',
      type: 'String',
      defaultValue: undefined,
      help: 'Provides a url for an icon to render for this action'
    },
    {
      name: 'showLabel',
      type: 'String',
      defaultValue: true,
      help: 'Property indicating whether the label should be rendered along side the icon'
    },
    {
      name: 'children',
      type: 'Array',
      factory: function() { return []; },
      subType: 'Action',
      view: 'ArrayView',
      help: 'Child actions of this action.',
      persistent: false
    },
    {
      name: 'parent',
      type: 'String',
      help: 'The parent action of this action'
    },
    {
      model_: 'FunctionProperty',
      name: 'action',
      displayWidth: 80,
      displayHeight: 20,
      defaultValue: '',
      help: 'Function to implement action.'
    },
    {
      model_: 'StringArrayProperty',
      name: 'keyboardShortcuts'
    }
  ],
  methods: {
    callIfEnabled: function(that) {
      if ( this.isEnabled.call(that, this) ) this.action.call(that, this);
    }
  }
});

Action.getPrototype().callIfEnabled = function(that) {
  if ( this.isEnabled.call(that, this) ) this.action.call(that, this);
};


/* Not used yet
   FOAModel({
   name: 'Topic',

   tableProperties: [
   'name',
   'description'
   ],

   properties: [
   {
   name:  'name',
   type:  'String',
   required: true,
   displayWidth: 30,
   displayHeight: 1,
   defaultValue: '',
   // todo: test this
   preSet: function (newValue) {
   return newValue.toUpperCase();
   },
   help: 'The coding identifier for this topic.'
   },
   {
   name: 'description',
   type: 'String',
   displayWidth: 70,
   displayHeight: 1,
   defaultValue: '',
   help: 'A brief description of this topic.'
   }
   ]
   });
*/

FOAModel({
  name: 'Arg',

  tableProperties: [
    'type',
    'name',
    'description'
  ],

  properties: [
    {
      name:  'type',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: 'Object',
      help: 'The type of this argument.'
    },
    {
      name: 'javaType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The java type that represents the type of this property.'
    },
    {
      name: 'javascriptType',
      type: 'String',
      required: false,
      defaultValueFn: function() { return this.type; },
      help: 'The javascript type that represents the type of this property.'
    },
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the entity.'
    },
    {
      model_: 'BooleanProperty',
      name: 'required',
      defaultValue: true
    },
    {
      name: 'defaultValue',
      help: 'Default Value if not required and not provided.'
    },
    {
      name: 'description',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'A brief description of this topic.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      help: 'Help text associated with the entity.'
    }
  ],

  methods: {
    decorateFunction: function(f, i) {
      if ( this.type === 'Object' ) return f;
      var type = this.type;

      return this.required ?
        function() {
          if ( arguments[i] === undefined ) {
            console.assert(false, 'Missing required argument# ' + i);
            debugger;
          }
          if ( typeof arguments[i] !== type ) {
            console.assert(false,  'argument# ' + i + ' type expected to be ' + type + ', but was ' + (typeof arguments[i]) + ': ' + arguments[i]);
            debugger;
          }

          return f.apply(this, arguments);
        } :
        function() {
          if ( arguments[i] !== undefined && typeof arguments[i] !== type ) {
            console.assert(false,  'argument# ' + i + ' type expected to be ' + type + ', but was ' + (typeof arguments[i]) + ': ' + arguments[i]);
            debugger;
          }

          return f.apply(this, arguments);
        } ;
    }
  },

  templates:[
    {
      model_: 'Template',

      name: 'javaSource',
      description: 'Java Source',
      template: '<%= this.type %> <%= this.name %>'
    },
    {
      model_: 'Template',

      name: 'closureSource',
      description: 'Closure JavaScript Source',
      template: '@param {<%= this.javascriptType %>} <%= this.name %> .'
    },
    {
      model_: 'Template',

      name: 'webIdl',
      description: 'Web IDL Source',
      template: '<%= this.type %> <%= this.name %>'
    }
  ]
});


FOAModel({
  name: 'Method',

  tableProperties: [
    'name',
    'description'
  ],

  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The coding identifier for the entity.'
    },
    {
      name: 'description',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'A brief description of this topic.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      help: 'Help text associated with the entity.'
    },
    {
      name: 'code',
      type: 'Function',
      displayWidth: 80,
      displayHeight: 30,
      view: 'FunctionView',
      help: 'Javascript code to implement this method.'
    },
    {
      name:  'returnType',
      defaultValue: '',
      help: 'Interface package.'
    },
    {
      model_: 'BooleanProperty',
      name: 'returnTypeRequired',
      defaultValue: true
    },
    {
      model_: 'ArrayProperty',
      name: 'args',
      type: 'Array[Arg]',
      subType: 'Arg',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Method arguments.'
    },
    {
      name: 'isMerged',
      help: 'As a listener, should this be merged?'
    },
    {
      model_: 'BooleanProperty',
      name: 'isAnimated',
      help: 'As a listener, should this be animated?',
      defaultValue: false
    },
  ],

  templates:[
    {
      model_: 'Template',

      name: 'javaSource',
      description: 'Java Source',
      template: '<%= this.returnType || "void" %> <%= this.name %>(' +
        '<% for ( var i = 0 ; i < this.args.length ; i++ ) { var arg = this.args[i]; %>' +
        '<%= arg.javaSource() %><% if ( i < this.args.length-1 ) out(", ");%>' +
        '<% } %>' +
        ')'
    },
    {
      model_: 'Template',

      name: 'closureSource',
      description: 'Closure JavaScript Source',
      // TODO:  Change returnType to returnType.javascriptType
      template:
      '/**\n' +
        '<% for ( var i = 0; i < this.args.length ; i++ ) { var arg = this.args[i]; %>' +
        ' * <%= arg.closureSource() %>\n' +
        '<% } %>' +
        '<% if (this.returnType) { %>' +
        ' * @return {<%= this.returnType %>} .\n' +
        '<% } %>' +
        ' */\n' +
        '<%= arguments[1] %>.prototype.<%= this.name %> = goog.abstractMethod;'
    },
    {
      model_: 'Template',

      name: 'webIdl',
      description: 'Web IDL Source',
      template:
      '<%= this.returnType || \'void\' %> <%= this.name %>(' +
        '<% for ( var i = 0 ; i < this.args.length ; i++ ) { var arg = this.args[i]; %>' +
        '<%= arg.webIdl() %><% if ( i < this.args.length-1 ) out(", "); %>' +
        '<% } %>' +
        ')'
    }
  ]
});

Method.getPrototype().decorateFunction = function(f) {
  for ( var i = 0 ; i < this.args.length ; i++ ) {
    var arg = this.args[i];

    f = arg.decorateFunction(f, i);
  }

  var returnType = this.returnType;

  return returnType ?
    function() {
      var ret = f.apply(this, arguments);

      if ( typeof ret !== returnType ) {
        console.assert(false, 'return type expected to be ' + returnType + ', but was ' + (typeof ret) + ': ' + ret);
        debugger;
      }

      return ret;
    } : f ;
};

Method.getPrototype().generateFunction = function() {
  return DEBUG ? this.decorateFunction(this.code) : this.code;
};


FOAModel({
  name: 'Interface',

  tableProperties: [
    'package', 'name', 'description'
  ],

  properties: [
    {
      name:  'package',
      help: 'Interface package.'
    },
    {
      name: 'extends',
      type: 'Array[String]',
      view: 'StringArrayView',
      help: 'Interfaces extended by this interface.'
    },
    {
      name:  'name',
      required: true,
      help: 'Interface name.'
    },
    {
      name:  'description',
      type:  'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The template\'s unique name.'
    },
    {
      name: 'help',
      label: 'Help Text',
      displayWidth: 70,
      displayHeight: 6,
      view: 'TextAreaView',
      help: 'Help text associated with the argument.'
    },
    {
      model_: 'ArrayProperty',
      name: 'methods',
      type: 'Array[Method]',
      subType: 'Method',
      view: 'ArrayView',
      factory: function() { return []; },
      defaultValue: [],
      help: 'Methods associated with the interface.'
    }
  ],
  templates:[
    {
      model_: 'Template',

      name: 'javaSource',
      description: 'Java Source',
      template: 'public interface <% out(this.name); %>\n' +
        '<% if ( this.extends.length ) { %>   extends <%= this.extends.join(", ") %>\n<% } %>' +
        '{\n<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '   <%= meth.javaSource() %>;\n' +
        '<% } %>' +
        '}'
    },
    {
      model_: 'Template',

      name: 'closureSource',
      description: 'Closure JavaScript Source',
      template:
      'goog.provide(\'<%= this.name %>\');\n' +
        '\n' +
        '/**\n' +
        ' * @interface\n' +
        '<% for ( var i = 0 ; i < this.extends.length ; i++ ) { var ext = this.extends[i]; %>' +
        ' * @extends {<%= ext %>}\n' +
        '<% } %>' +
        ' */\n' +
        '<%= this.name %> = function() {};\n' +
        '<% for ( var i = 0 ; i <  this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '\n<%= meth.closureSource(undefined, this.name) %>\n' +
        '<% } %>'
    },
    {
      model_: 'Template',

      name: 'webIdl',
      description: 'Web IDL Source',
      template:
      'interface <%= this.name %> <% if (this.extends.length) { %>: <%= this.extends[0] %> <% } %>{\n' +
        '<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '  <%= meth.webIdl() %>;\n' +
        '<% } %>' +
        '}'
    }
  ]

});


FOAModel({
  name: 'Template',

  tableProperties: [
    'name', 'description'
  ],

  properties: [
    {
      name:  'name',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The template\'s unique name.'
    },
    {
      name:  'description',
      type:  'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The template\'s unique name.'
    },
    {
      name: 'template',
      type: 'String',
      displayWidth: 180,
      displayHeight: 30,
      rows: 30, cols: 80,
      defaultValue: '',
      view: 'TextAreaView',
      // Doesn't work because of bootstrapping issues.
      // preSet: function(_, t) { return typeof t === 'function' ? multiline(t) : t ; },
      help: 'Template text. <%= expr %> or <% out(...); %>'
    }/*,
       {
       name: 'templates',
       type: 'Array[Template]',
       subType: 'Template',
       view: 'ArrayView',
       defaultValue: [],
       help: 'Sub-templates of this template.'
       }*/
  ]

});

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
FOAModel({
  name: 'UnitTest',
  plural: 'Unit Tests',
  tableProperties: [ 'description', 'passed', 'failed' ],
  properties:
  [
    {
      model_: 'Property',
      name: 'name',
      type: 'String',
      required: true,
      displayWidth: 50,
      help: "The unit test's name."
    },
    {
      model_: 'Property',
      name: 'description',
      type: 'String',
      displayWidth: 70,
      displayHeight: 5,
      defaultValue: '',
      // defaultValueFn: function() { return "Test " + this.name; },
      help: 'A multi-line description of the unit test.'
    },
    {
      model_: 'IntProperty',
      name: 'passed',
      required: true,
      displayWidth: 8,
      displayHeight: 1,
      view: 'IntFieldView',
      help: 'Number of sub-tests to pass.'
    },
    {
      model_: 'IntProperty',
      name: 'failed',
      required: true,
      displayWidth: 8,
      displayHeight: 1,
      help: 'Number of sub-tests to fail.'
    },
    {
      name:  'scope',
      hidden: true,
      factory: function() { return {}; }
    },
    {
      model_: 'BooleanProperty',
      name: 'async',
      defaultValue: false
    },
    {
      model_: 'FunctionProperty',
      name: 'code',
      label: 'Test Code',
      displayWidth: 80,
      displayHeight: 30,
      fromElement: function(e) {
        var txt = e.innerHTML;

        txt =
          txt.trim().startsWith('function') ? txt                               :
          this.async                        ? 'function(ret) {\n' + txt + '\n}' :
                                              'function() {\n'    + txt + '\n}' ;

        return eval('(' + txt + ')');
      },
      preSet: function(_, value) {
        if ( typeof value === 'string' ) {
          if ( value.startsWith('function') ) {
            value = eval('(' + value + ')');
          } else {
            value = new Function(value);
          }
        }

        // Now value is a function either way.
        // We just need to check that if it's async it has an argument.
        if ( typeof value === 'function' && this.async && value.length === 0 ) {
          var str = value.toString();
          return eval('(function(ret)' + str.substring(str.indexOf('{')) + ')');
        } else {
          return value;
        }
      }
    },
    {
      model_: 'Property',
      name: 'results',
      type: 'String',
      mode: 'read-only',
      required: true,
      displayWidth: 80,
      displayHeight: 20
    },
    {
      model_: 'StringArrayProperty',
      name:  'tags',
      label: 'Tags'
    },
    {
      name: 'tests',
      label: 'Unit Tests',
      type: 'Array[Unit Test]',
      subType: 'UnitTest',
      view: 'ArrayView',
      fromElement: function(e) { return DOM.initElementChildren(e); },
      preSet: function(_, tests) {
        if ( Array.isArray(tests) ) return tests;

        var a = [];
        for ( key in tests ) {
          a.push(UnitTest.create({name: key, code: tests[key]}));
        }

        return a;
      },
      factory: function() { return []; },
      help: 'Sub-tests of this test.'
    }
  ],

  actions: [
    {
      name:  'test',
      help:  'Run the unit tests.',

      action: function(obj) { asynchronized(this.atest(), this.LOCK)(function() {}); }
    }
  ],

  methods:{
    // Lock to prevent more than one top-level Test from running at once.
    LOCK: {},

    // Run test asynchronously as an afunc.
    atest: function() {
      var self = this;

      this.scope.log    = this.log.bind(this);
      this.scope.jlog   = this.jlog.bind(this);
      this.scope.assert = this.assert.bind(this);
      this.scope.fail   = this.fail.bind(this);
      this.scope.ok     = this.ok.bind(this);

      this.results = '';

      this.passed = 0;
      this.failed = 0;

      var code;
      with ( this.scope ) { code = eval('(' + this.code.toString() + ')'); }

      var afuncs = [];
      var oldLog;

      afuncs.push(function(ret) {
        oldLog = console.log;
        console.log = self.scope.log;
        ret();
      });

      afuncs.push(this.async ? code.bind(this) : code.abind(this));

      afuncs.push(function(ret) {
        console.log = oldLog;
        ret();
      });

      this.tests.forEach(function(test) {
        afuncs.push(function(ret) {
          test.scope.__proto__ = self.scope;
          test.atest()(ret);
        });
        afuncs.push(function(ret) {
          self.passed += test.passed;
          self.failed += test.failed;
          ret();
        });
      });

      return aseq.apply(this, afuncs);
    },
    append: function(s) { this.results += s; },
    log: function(/*arguments*/) {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.append(arguments[i]);
      this.append('\n');
    },
    jlog: function(/*arguments*/) {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.append(JSONUtil.stringify(arguments[i]));
      this.append('\n');
    },
    addHeader: function(name) {
      this.log('<tr><th colspan=2 class="resultHeader">' + name + '</th></tr>');
    },
    assert: function(condition, comment) {
      if ( condition ) this.passed++; else this.failed++;
      this.log(
        (comment ? comment : '(no message)') +
        ' ' +
        (condition ? "<font color=green>OK</font>" : "<font color=red>ERROR</font>"));
    },
    fail: function(comment) {
      this.assert(false, comment);
    },
    ok: function(comment) {
      this.assert(true, comment);
    }
  }
});


FOAModel({
  name: 'Relationship',
  tableProperties: [
    'name', 'label', 'relatedModel', 'relatedProperty'
  ],
  properties: [
    {
      name:  'name',
      type:  'String',
      displayWidth: 30,
      displayHeight: 1,
      defaultValueFn: function() { return GLOBAL[this.relatedModel].plural; },
      help: 'The coding identifier for the action.'
    },
    {
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The display label for the action.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      help: 'Help text associated with the relationship.'
    },
    {
      name:  'relatedModel',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The name of the related Model.'
    },
    {
      name:  'relatedProperty',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The join property of the related Model.'
    }
  ]/*,
     methods: {
     dao: function() {
     var m = GLOBAL[this.relatedModel];
     return GLOBAL[m.name + 'DAO'];
     },
     JOIN: function(sink, opt_where) {
     var m = GLOBAL[this.relatedModel];
     var dao = GLOBAL[m.name + 'DAO'];
     return MAP(JOIN(
     dao.where(opt_where || TRUE),
     m.getProperty(this.relatedProperty),
     []), sink);
     }
     }*/
});


FOAModel({
  name: 'Issue',
  plural: 'Issues',
  help: 'An issue describes a question, feature request, or defect.',
  ids: [
    'id'
  ],
  tableProperties:
  [
    'id', 'severity', 'status', 'summary', 'assignedTo'
  ],
  properties:
  [
    {
      model_: 'Property',
      name: 'id',
      label: 'Issue ID',
      type: 'String',
      required: true,
      displayWidth: 12,
      displayHeight: 1,
      defaultValue: 0,
      view: 'IntFieldView',
      help: 'Issue\'s unique sequence number.'
    },
    {
      name: 'severity',
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Feature',
          'Minor',
          'Major',
          'Question'
        ]});}
      },
      defaultValue: 'String',
      help: 'The severity of the issue.'
    },
    {
      name: 'status',
      type: 'String',
      required: true,
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Open',
          'Accepted',
          'Complete',
          'Closed'
        ]});}
      },
      defaultValue: 'String',
      help: 'The status of the issue.'
    },
    {
      model_: 'Property',
      name: 'summary',
      type: 'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      help: 'A one line summary of the issue.'
    },
    {
      model_: 'Property',
      name: 'created',
      type: 'DateTime',
      required: true,
      displayWidth: 50,
      displayHeight: 1,
      factory: function() { return new Date(); },
      help: 'When this issue was created.'
    },
    {
      model_: 'Property',
      name: 'createdBy',
      type: 'String',
      defaultValue: 'kgr',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      help: 'Who created the issue.'
    },
    {
      model_: 'Property',
      name: 'assignedTo',
      type: 'String',
      defaultValue: 'kgr',
      displayWidth: 30,
      displayHeight: 1,
      help: 'Who the issue is currently assigned to.'
    },
    {
      model_: 'Property',
      name: 'notes',
      displayWidth: 75,
      displayHeight: 20,
      view: 'TextAreaView',
      help: 'Notes describing issue.'
    }
  ],
  tests: [
    {
      model_: 'UnitTest',
      description: 'test1',
      code: function() {this.addHeader("header");this.ok("pass");this.fail("fail");}
    }
  ]
});

(function() {
  for ( var i = 0 ; i < Model.templates.length ; i++ )
    Model.templates[i] = JSONUtil.mapToObj(Model.templates[i]);

  (function() {
    var a = Model.properties;
    for ( var i = 0 ; i < a.length ; i++ ) {
      if ( ! Property.isInstance(a[i]) ) {
        a[i] = Property.getPrototype().create(a[i]);
      }
    }
  })();
})();

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
Model.properties = Model.properties.concat(
  [
    {
      name: 'protoparser',
      label: 'ProtoParser',
      type: 'Grammar',
      hidden: true,
      transient: true,
      // TODO: this will be regenerated for each use, fix
      defaultValueFn: function() {
        var parser = {
          __proto__: BinaryProtoGrammar,

          START: sym('model'),

          model: []
        };
        for (var i = 0, prop; prop = this.properties[i]; i++) {
          if (!prop.prototag) continue;
          var p;
          var type = ArrayProperty.isInstance(prop) ? prop.subType : prop.type;
          switch(type) {
          case 'uint32':
          case 'int32':
            p = protouint32(prop.prototag);
            break;
          case 'uint64':
          case 'int64':
          case 'fixed64':
            p = protovarintstring(prop.prototag);
            break;
          case 'boolean':
          case 'bool':
            p = protobool(prop.prototag);
            break;
          case 'string':
            p = protostring(prop.prototag);
            break;
          case 'bytes':
            p = protobytes(prop.prototag);
            break;
          default:
            var model = GLOBAL[type];

            if (!model) throw "Could not find model for " + type;

            // HUGE HACK UNTIL ENUMS ARE BETTER IMPLEMENTED
            if (model.type == 'Enum') {
              p = protouint32(prop.prototag);
              break;
            }
            p = protomessage(prop.prototag, model.protoparser.export('START'));
          }

          parser[prop.name] = p;
          (function(prop) {
            parser.addAction(prop.name, function(a) {
              return [prop, a[1]];
            });
          })(prop);
          parser.model.push(sym(prop.name));
        }
        parser.model.push(sym('unknown field'));
        parser.model = repeat(alt.apply(undefined, parser.model));
        var self = this;
        parser.addAction('model', function(a) {
          var createArgs = {};
          for (var i = 0, field; field = a[i]; i++) {
            if (!field[0] || !Property.isInstance(field[0])) continue;
            if (ArrayProperty.isInstance(field[0]))
              createArgs[field[0].name] = (createArgs[field[0].name] || []).concat(field[1]);
            else
              createArgs[field[0].name] = field[1];
          }
          return self.create(createArgs);
        });

        this.instance_.protoparser = parser;

        return parser;
      }
    }
  ]);

// When we first bootstrap using Model = Model.create(Model), the Method model
// is not defined.  As a result in the preSet of the 'methods' property,
// the value of 'methods' is not copied over from the original Model definition
// into the bootstrapped one.  So we need to re-set the methods property here
// before re-creating Model.
Model.methods = {
  getPropertyWithoutCache_: ModelProto.getPropertyWithoutCache_,
  getProperty:              ModelProto.getProperty,
  getAction:                ModelProto.getAction,
  hashCode:                 ModelProto.hashCode,
  buildPrototype:           ModelProto.buildPrototype,
  getPrototype:             ModelProto.getPrototype,
  isSubModel:               ModelProto.isSubModel,
  isInstance:               ModelProto.isInstance
};

// We use getPrototype() because we need to re-create the Model prototype now
// that it has been mutated.  Normally Model.create() is for reading model
// definitions and creating new models (like EMail or Issue).  But for
// re-creating Model we need to rebuild it's prototype.
Model = Model.getPrototype().create(Model);
Model.model_ = Model;
Model.create = ModelProto.create;

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

// TODO: standardize on either get()/set() or .value
var SimpleValue = Model.create({
  name: 'SimpleValue',

  properties: [ { name: 'value' } ],

  methods: {
    init: function(value) { this.value = value || ""; },
    get: function() { return this.value; },
    set: function(val) { this.value = val; },
    toString: function() { return "SimpleValue(" + this.value + ")"; }
  }
});

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

// TODO: used in saturnmail/bg.js, see if can be merged with Action keyboard support.
function KeyboardShortcutController(win, view) {
  this.contexts_ = {};
  this.body_ = {};

  this.processView_(view);

  win.addEventListener('keydown', this.processKey_.bind(this));
}

KeyboardShortcutController.prototype.processView_ = function(view) {
  var keyShortcuts = view.shortcuts;
  if (keyShortcuts) {
    keyShortcuts.forEach(function(nav) {
      var key = nav[0];
      var cb = nav[1];
      var context = nav[2];
      this.addAccelerator(key, cb, context);
    }.bind(this));
  }

  try {
    var children = view.children;
    children.forEach(this.processView_.bind(this));
  } catch(e) { console.log(e); }
};

KeyboardShortcutController.prototype.addAccelerator = function(key, callback, context) {
  if (context) {
    if (typeof(context) != 'string')
      throw "Context must be an identifier for a DOM node.";
    if (!(context in this.contexts_))
      this.contexts_[context] = {};

    this.contexts_[context][key] = callback;
  } else {
    this.body_[key] = callback;
  }
};

KeyboardShortcutController.prototype.shouldIgnoreKeyEventsForTarget_ = function(event) {
  var target = event.target;
  return target.isContentEditable || target.tagName == 'INPUT' || target.tagName == 'TEXTAREA';
};

KeyboardShortcutController.prototype.processKey_ = function(event) {
  if (this.shouldIgnoreKeyEventsForTarget_(event))
    return;

  for ( var node = event.target; node && node != document.body; node = node.parentNode ) {
    var id = node.id;
    if ( id && (id in this.contexts_) ) {
      var cbs =  this.contexts_[id];
      if ( event.keyIdentifier in cbs ) {
        var cb = cbs[event.keyIdentifier];
        cb(event);
        event.preventDefault();
        return;
      }
    }
  }
  console.log('Looking for ' + event.keyIdentifier);
  if ( event.keyIdentifier in this.body_ ) {
    var cb = this.body_[event.keyIdentifier];
    cb(event);
    event.preventDefault();
  }
};


var DOM = {
  /** Instantiate FOAM Objects in a document. **/
  init: function(X) {
    if ( ! X.document.FOAM_OBJECTS ) X.document.FOAM_OBJECTS = {};

    var fs = X.document.querySelectorAll('foam');
    for ( var i = 0 ; i < fs.length ; i++ ) {
      var e = fs[i];
      // console.log(e.getAttribute('model'), e.getAttribute('view'));
      GLOBAL[e.getAttribute('view')];
      GLOBAL[e.getAttribute('model')];
    }
    var models = [];
    for ( var key in USED_MODELS ) {
      models.push(arequire(key));
    }

    aseq(apar.apply(null, models), function(ret) {
      for ( var i = 0 ; i < fs.length ; i++ ) {
        this.initElement(fs[i], X.document);
      }
    }.bind(this))();
  },

  initElementChildren: function(e) {
    var a = [];

    for ( var i = 0 ; i < e.children.length ; i++ ) {
      var c = e.children[i];

      if ( c.tagName === 'FOAM' ) {
        a.push(DOM.initElement(c));
      }
    }

    return a;
  },

  // TODO: Supply X and set on created children
  /** opt_document -- if supplied the object's view will be added to the document. **/
  initElement: function(e, opt_document) {
    // If was a sub-object for an object that has already been displayed,
    // then it will no longer be in the DOM and doesn't need to be shown.
    if ( opt_document && ! opt_document.contains(e) ) return;

    var args = {};
    var modelName = e.getAttribute('model');
    var model = GLOBAL[modelName];

    if ( ! model ) {
      console.error('Unknown Model: ', modelName);
      e.outerHTML = 'Unknown Model: ' + modelName;
      return;
    }

    // This is because of a bug that the model.properties isn't populated
    // with the parent model's properties until after the prototype is
    // created.  TODO: remove after FO
    model.getPrototype();

    for ( var i = 0 ; i < e.attributes.length ; i++ ) {
      var a   = e.attributes[i];
      var key = a.name;
      var val = a.value;
      var p   = model.getProperty(key);

      if ( p ) {
        if ( val.startsWith('#') ) {
          val = val.substring(1);
          val = $(val);
        }
        args[key] = val;
      } else {
        if ( ! {model:true, view:true, id:true, oninit:true, showactions:true}[key] ) {
          console.log('unknown attribute: ', key);
        }
      }
    }

    function findProperty(name) {
      for ( var j = 0 ; j < model.properties.length ; j++ ) {
        var p = model.properties[j];

        if ( p.name.toUpperCase() == name ) return p;
      }

      return null;
    }

    for ( var i = 0 ; i < e.children.length ; i++ ) {
      var c = e.children[i];
      var key = c.nodeName;
      var p = findProperty(key);

      if ( p ) {
        args[p.name] = p.fromElement(c);
      } else {
        console.log('unknown element: ', key);
      }
    }

    var obj = model.create(args);

    var onLoad = e.getAttribute('oninit');
    if ( onLoad ) {
      Function(onLoad).bind(obj)();
    }

    if ( opt_document ) {
      var view;
      if ( View.isInstance(obj) || CView.isInstance(obj) ) {
        view = obj;
      } else {
        var viewName = e.getAttribute('view');
        var viewModel = viewName ? GLOBAL[viewName] : DetailView;
        view = viewModel.create({model: model, value: SimpleValue.create(obj)});
        if ( ! viewName ) {
          // default value is 'true' if 'showActions' isn't specified.
          var a = e.getAttribute('showActions');

          view.showActions = a ?
            a.equalsIC('y') || a.equalsIC('yes') || a.equalsIC('true') || a.equalsIC('t') :
            true ;
        }
      }

      if ( e.id ) opt_document.FOAM_OBJECTS[e.id] = obj;
      obj.view_ = view;
      e.outerHTML = view.toHTML();
      view.initHTML();
    }

    return obj;
  },

  setClass: function(e, className, opt_enabled) {
    var oldClassName = e.className || '';
    var enabled = opt_enabled === undefined ? true : opt_enabled;
    e.className = oldClassName.replace(' ' + className, '').replace(className, '');
    if ( enabled ) e.className = e.className + ' ' + className;
  }
};


window.addEventListener('load', function() { DOM.init(X); }, false);


// TODO: document and make non-global
/** Convert a style size to an Int.  Ex. '10px' to 10. **/
function toNum(p) { return p.replace ? parseInt(p.replace('px','')) : p; };


// ??? Should this have a 'data' property?
// Or maybe a DataView and ModelView
FOAModel({
  name: 'View',
  label: 'View',

  properties: [
    {
      name:  'id',
      label: 'Element ID',
      type:  'String',
      factory: function() { return this.nextID(); }
    },
    {
      name: 'parent',
      type: 'View',
      hidden: true
    },
    {
      name: 'children',
      type: 'Array[View]',
      factory: function() { return []; }
    },
    {
      name:   'shortcuts',
      type:   'Array[Shortcut]',
      factory: function() { return []; }
    },
    {
      name:   '$',
      hidden: true,
      mode:   "read-only",
      getter: function() { return $(this.id); },
      help:   'DOM Element.'
    },
    {
      name: 'tagName',
      defaultValue: 'span'
    },
    {
      name: 'className',
      defaultValue: ''
    },
    {
      name: 'extraClassName',
      defaultValue: ''
    }
  ],

  methods: {
    // TODO: Model as Topics
    ON_HIDE: ['onHide'], // Indicates that the View has been hidden
    ON_SHOW: ['onShow'], // Indicates that the View is now being reshown

    deepPublish: function(topic) {
      var count = this.publish.apply(this, arguments);

      if ( this.children ) {
        for ( var i = 0 ; i < this.children.length ; i++ ) {
          var child = this.children[i];
          count += child.deepPublish.apply(child, arguments);
        }
      }

      return count;
    },

    strToHTML: function(str) {
      return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    cssClassAttr: function() {
      return this.className ? ' class="' + this.className + ' ' + this.extraClassName + '"' : '';
    },

    dynamicTag: function(tagName, f) {
      var id = this.nextID();
      this.X.dynamic(function() {
        var html = f();
        var e = $(id);
        if ( e ) e.innerHTML = html;
      }.bind(this));
      return '<' + tagName + ' id="' + id + '"></' + tagName + '>';
    },

    /** Bind a sub-View to a sub-Value. **/
    bindSubView: function(view, prop) {
      view.setValue(this.propertyValue(prop.name));
    },

    viewModel: function() { return this.model_; },

    /** Create the sub-view from property info. **/
    createView: function(prop, opt_args) {
      var X = ( opt_args && opt_args.X ) || this.X;
      var v = X.PropertyView.create({prop: prop, args: opt_args});
      this.addChild(v);
      return v;
    },

    createActionView: function(action, value, opt_args) {
      var X = ( opt_args && opt_args.X ) || this.X;
      var modelName = opt_args && opt_args.model_ ? opt_args.model_ : 'ActionButton';
      var v = X[modelName].create({
        action: action,
        value: value}).copyFrom(opt_args);

      this[action.name + 'View'] = v;

      return v;
    },

    createTemplateView: function(name, opt_args) {
      var o = this.model_[name];
      return Action.isInstance(o) ?
        this.createActionView(o, SimpleValue.create(this), opt_args) :
        this.createView(o, opt_args) ;
    },

    focus: function() { if ( this.$ && this.$.focus ) this.$.focus(); },

    addChild: function(child) {
      // Check prevents duplicate addChild() calls,
      // which can happen when you use creatView() to create a sub-view (and it calls addChild)
      // and then you write the View using TemplateOutput (which also calls addChild).
      // That should all be cleaned up and all outputHTML() methods should use TemplateOutput.
      if ( child.parent ) return;

      try {
        child.parent = this;
      } catch (x) { console.log(x); }

      var children = this.children;
      children.push(child);
      this.children = children;

      return this;
    },

    removeChild: function(child) {
      this.children.deleteI(child);
      child.parent = undefined;

      return this;
    },

    addChildren: function() {
      Array.prototype.forEach.call(arguments, this.addChild.bind(this));

      return this;
    },

    addShortcut: function(key, callback, context) {
      this.shortcuts.push([key, callback, context]);
    },

    // TODO: make use new static_ scope when available
    nextID: function() {
      return "view" + (arguments.callee._nextId = (arguments.callee._nextId || 0) + 1);
    },

    addInitializer: function(f) {
      (this.initializers_ || (this.initializers_ = [])).push(f);
    },

    on: function(event, listener, opt_id) {
      opt_id = opt_id || this.nextID();
      listener = listener.bind(this);

      this.addInitializer(function() {
        var e = $(opt_id);
        // if ( ! e ) console.log('Error Missing element for id: ' + opt_id + ' on event ' + event);
        if ( e ) e.addEventListener(event, listener.bind(this), false);
      });

      return opt_id;
    },

    setAttribute: function(attributeName, valueFn, opt_id) {
      opt_id = opt_id || this.nextID();
      valueFn = valueFn.bind(this);
      this.addInitializer(function() {
        this.X.dynamic(valueFn, function() {
          var e = $(opt_id);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          var newValue = valueFn(e.getAttribute(attributeName));
          if ( newValue == undefined ) e.removeAttribute(attributeName);
          else e.setAttribute(attributeName, newValue);
        })
      }.bind(this));
    },

    setClass: function(className, predicate, opt_id) {
      opt_id = opt_id || this.nextID();
      predicate = predicate.bind(this);

      this.addInitializer(function() {
        this.X.dynamic(predicate, function() {
          var e = $(opt_id);
          if ( ! e ) throw EventService.UNSUBSCRIBE_EXCEPTION;
          DOM.setClass(e, className, predicate());
        });
      }.bind(this));

      return opt_id;
    },

    /** Insert this View's toHTML into the Element of the supplied name. **/
    insertInElement: function(name) {
      var e = $(name);
      e.innerHTML = this.toHTML();
      this.initHTML();
    },

    write: function(document) {
      // Write the View's HTML to the provided document and then initialize.
      document.writeln(this.toHTML());
      this.initHTML();
    },

    updateHTML: function() {
      if ( ! this.$ ) return;

      this.$.innerHTML = this.toInnerHTML();
      this.initInnerHTML();
    },

    toInnerHTML: function() { return ''; },

    toHTML: function() {
      return '<' + this.tagName + ' id="' + this.id + '"' + this.cssClassAttr() + '>' +
        this.toInnerHTML() +
        '</' + this.tagName + '>';
    },

    initHTML: function() {
      this.initInnerHTML();
    },

    initInnerHTML: function() {
      // Initialize this View and all of it's children.
      // This mostly involves attaching listeners.
      // Must be called activate a view after it has been added to the DOM.

      this.invokeInitializers();
      this.initChildren();
    },

    initChildren: function() {
      if ( this.children ) {
        // init children
        for ( var i = 0 ; i < this.children.length ; i++ ) {
          // console.log("init child: " + this.children[i]);
          try {
            this.children[i].initHTML();
          } catch (x) {
            console.log("Error on View.child.initHTML", x, x.stack);
          }
        }
      }
    },

    invokeInitializers: function() {
      if ( ! this.initializers_ ) return;

      for ( var i = 0 ; i < this.initializers_.length ; i++ ) this.initializers_[i]();

      this.initializers_ = undefined;
    },

    destroy: function() {
      // TODO: remove listeners
    },

    close: function() {
      this.$ && this.$.remove();
      this.destroy();
      this.publish('closed');
    }
  }
});


FOAModel({
  name: 'PropertyView',

  extendsModel: 'View',

  properties: [
    {
      name: 'prop',
      type: 'Property'
    },
    {
      name: 'parent',
      type: 'View',
      postSet: function(_, p) {
        p[this.prop.name + 'View'] = this.view;
        if ( ! this.data ) {
          // TODO: replace with just 'p.data' when data-binding done
          this.data = p.data || ( p.get && p.get() );
        }
        if ( this.view ) this.view.parent = p;
      }
    },
    {
      name: 'data',
      postSet: function() { this.bindData(); }
    },
    {
      name: 'innerView',
      help: 'Override for prop.view'
    },
    {
      name: 'view',
      type: 'View'
    },
    'args'
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);

      if ( this.args && this.args.model_ ) {
        var view = this.X[this.args.model_].create(this.prop);
        delete this.args.model_;
      } else {
        view = this.createViewFromProperty(this.prop);
      }

      view.copyFrom(this.args);
      view.parent = this.parent;

      this.view = view;
      this.bindData();
    },
    createViewFromProperty: function(prop) {
      var viewName = this.innerView || prop.view
      if ( ! viewName ) return this.X.TextFieldView.create(prop);
      if ( typeof viewName === 'string' ) return this.X[viewName].create(prop);
      if ( viewName.model_ && typeof viewName.model_ === 'string' ) return FOAM(prop.view);
      if ( viewName.model_ ) { var v = viewName.deepClone().copyFrom(prop); v.id = v.nextID(); return v; }
      if ( typeof viewName === 'function' ) return viewName(prop, this);

      return viewName.create(prop);
    },
    bindData: function() {
      var view = this.view;
      var data = this.data;
      if ( ! view || ! data ) return;

      var pValue = data.propertyValue(this.prop.name);
      if ( view.model_.DATA ) {
        // When all views are converted to data-binding,
        // only this method will be supported.
        Events.link(pValue, view.data$);
      } else if ( view.setValue ) {
        view.setValue(pValue);
      } else {
        view.value = pValue;
      }
    },
    toHTML: function() { return this.view.toHTML(); },
    initHTML: function() { this.view.initHTML(); }
  }
});


FOAModel({
  name: 'PopupView',

  extendsModel: 'View',

  properties: [
    {
      name: 'view',
      type: 'View',
    },
    {
      name: 'x'
    },
    {
      name: 'y'
    },
    {
      name: 'width',
      defaultValue: undefined
    },
    {
      name: 'maxWidth',
      defaultValue: undefined
    },
    {
      name: 'maxHeight',
      defaultValue: undefined
    },
    {
      name: 'height',
      defaultValue: undefined
    }
  ],

  methods: {
    open: function(e, opt_delay) {
      if ( this.$ ) return;
      var document = (e.$ || e).ownerDocument;
      var div      = document.createElement('div');
      div.style.left = this.x + 'px';
      div.style.top = this.y + 'px';
      if ( this.width ) div.style.width = this.width + 'px';
      if ( this.height ) div.style.height = this.height + 'px';
      if ( this.maxWidth ) div.style.maxWidth = this.maxWidth + 'px';
      if ( this.maxHeight ) div.style.maxHeight = this.maxHeight + 'px';
      div.style.position = 'absolute';
      div.id = this.id;
      div.innerHTML = this.view.toHTML();

      document.body.appendChild(div);
      this.view.initHTML();
    },
    close: function() {
      this.$ && this.$.remove();
    },
    destroy: function() {
      this.close();
      this.view.destroy();
    }
  }
});

FOAModel({
  name: 'AutocompleteView',
  extendsModel: 'PopupView',
  help: 'Default autocomplete popup.',

  properties: [
    'closeTimeout',
    'autocompleter',
    'completer',
    'current',
    {
      model_: 'IntProperty',
      name: 'closeTime',
      units: 'ms',
      help: 'Time to delay the actual close on a .close call.',
      defaultValue: 200
    },
    {
      name: 'view',
      postSet: function(prev, v) {
        if ( prev ) {
          prev.data$.removeListener(this.complete);
          prev.choices$.removeListener(this.choicesUpdate);
        }

        v.data$.addListener(this.complete);
        v.choices$.addListener(this.choicesUpdate);
      }
    },
    {
      name: 'target',
      postSet: function(prev, v) {
        prev && prev.unsubscribe('keydown', this.onKeyDown);
        v.subscribe('keydown', this.onKeyDown);
      }
    },
    {
      name: 'maxHeight',
      defaultValue: 400
    },
    {
      name: 'className',
      defaultValue: 'autocompletePopup'
    }
  ],

  methods: {
    autocomplete: function(partial) {
      if ( ! this.completer ) {
        var proto = FOAM.lookup(this.autocompleter, this.X);
        this.completer = proto.create();
      }
      if ( ! this.view ) {
        this.view = this.makeView();
      }

      this.current = partial;
      this.open(this.target);
      this.completer.autocomplete(partial);
    },

    makeView: function() {
      return this.X.ChoiceListView.create({
        dao: this.completer.autocompleteDao,
        extraClassName: 'autocomplete',
        orientation: 'vertical',
        mode: 'final',
        objToChoice: this.completer.f,
        useSelection: true
      });
    },

    init: function(args) {
      this.SUPER(args);
      this.subscribe('blur', (function() {
        this.close();
      }).bind(this));
    },

    open: function(e, opt_delay) {
      if ( this.closeTimeout ) {
        this.X.clearTimeout(this.closeTimeout);
        this.closeTimeout = 0;
      }

      if ( this.$ ) { this.position(this.$.firstElementChild, e.$ || e); return; }

      var parentNode = e.$ || e;
      var document = parentNode.ownerDocument;

      if ( this.X.document !== document ) debugger;

      var div      = document.createElement('div');
      var window = document.defaultView;

      if ( this.X.window !== window ) debugger;


      parentNode.insertAdjacentHTML('afterend', this.toHTML().trim());

      this.position(this.$.firstElementChild, parentNode);
      this.initHTML();
    },

    close: function(opt_now) {
      if ( opt_now ) {
        if ( this.closeTimeout ) {
          this.X.clearTimeout(this.closeTimeout);
          this.closeTimeout = 0;
        }
        this.SUPER();
        return;
      }

      if ( this.closeTimeout ) return;

      var realClose = this.SUPER;
      var self = this;
      this.closeTimeout = this.X.setTimeout(function() {
        self.closeTimeout = 0;
        realClose.call(self);
      }, this.closeTime);
    },

    position: function(div, parentNode) {
      var document = parentNode.ownerDocument;

      var pos = findPageXY(parentNode);
      var pageWH = [document.firstElementChild.offsetWidth, document.firstElementChild.offsetHeight];

      if ( pageWH[1] - (pos[1] + parentNode.offsetHeight) < (this.height || this.maxHeight || 400) ) {
        div.style.bottom = parentNode.offsetHeight; document.defaultView.innerHeight - pos[1];
      }

      if ( pos[2].offsetWidth - pos[0] < 600 ) div.style.left = 600 - pos[2].offsetWidth;
      else div.style.left = -parentNode.offsetWidth;

      if ( this.width ) div.style.width = this.width + 'px';
      if ( this.height ) div.style.height = this.height + 'px';
      if ( this.maxWidth ) {
        div.style.maxWidth = this.maxWidth + 'px';
        div.style.overflowX = 'auto';
      }
      if ( this.maxHeight ) {
        div.style.maxHeight = this.maxHeight + 'px';
        div.style.overflowY = 'auto';
      }
    }
  },

  listeners: [
    {
      name: 'onKeyDown',
      code: function(_,_,e) {
        if ( ! this.view ) return;

        if ( e.keyCode === 38 /* arrow up */ ) {
          this.view.index--;
          this.view.scrollToSelection(this.$);
          e.preventDefault();
        } else if ( e.keyCode  === 40 /* arrow down */ ) {
          this.view.index++;
          this.view.scrollToSelection(this.$);
          e.preventDefault();
        } else if ( e.keyCode  === 13 /* enter */ ) {
          this.view.commit();
          e.preventDefault();
        }
      }
    },
    {
      name: 'complete',
      code: function() {
        this.target.onAutocomplete(this.view.data);
        this.view = this.makeView();
        this.close(true);
      }
    },
    {
      name: 'choicesUpdate',
      code: function() {
        if ( this.view &&
             ( this.view.choices.length === 0 ||
               ( this.view.choices.length === 1 &&
                 this.view.choices[0][1] === this.current ) ) ) {
          this.close(true);
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
  <span id="<%= this.id %>" style="position:relative"><div %%cssClassAttr() style="position:absolute"><%= this.view %></div></span>
    */}
  ]
});

FOAModel({
  name: 'StaticHTML',
  extendsModel: 'View',
  properties: [
    {
      model_: 'StringProperty',
      name: 'content'
    },
    {
      model_: 'BooleanProperty',
      name: 'escapeHTML',
      defaultValue: false
    }
  ],

  methods: {
    toHTML: function() {
      if ( this.escapeHTML ) {
        return this.strToHTML(this.content);
      }
      return this.content;
    }
  }
});


FOAModel({
  name: 'MenuSeparator',
  extendsModel: 'StaticHTML',
  properties: [
    {
      name: 'content',
      defaultValue: '<hr class="menuSeparator">'
    }
  ]
});


// TODO: Model
var DomValue = {
  DEFAULT_EVENT:    'change',
  DEFAULT_PROPERTY: 'value',

  create: function(element, opt_event, opt_property) {
    if ( ! element ) {
      throw "Missing Element in DomValue";
    }

    return {
      __proto__: this,
      element:   element,
      event:     opt_event    || this.DEFAULT_EVENT,
      property:  opt_property || this.DEFAULT_PROPERTY };
  },

  setElement: function ( element ) { this.element = element; },

  get: function() { return this.element[this.property]; },

  set: function(value) {
    if ( this.element[this.property] !== value )
      this.element[this.property] = value;
  },

  addListener: function(listener) {
    if ( ! this.event ) return;
    try {
      this.element.addEventListener(this.event, listener, false);
    } catch (x) {
    }
  },

  removeListener: function(listener) {
    if ( ! this.event ) return;
    try {
      this.element.removeEventListener(this.event, listener, false);
    } catch (x) {
      // could be that the element has been removed
    }
  },

  toString: function() {
    return "DomValue(" + this.event + ", " + this.property + ")";
  }
};


FOAModel({
  name: 'WindowHashValue',

  properties: [
    {
      name: 'window',
      defaultValueFn: function() { return this.X.window; }
    }
  ],

  methods: {
    get: function() { return this.window.location.hash ? this.window.location.hash.substring(1) : ''; },

    set: function(value) { this.window.location.hash = value; },

    addListener: function(listener) {
      this.window.addEventListener('hashchange', listener, false);
    },

    removeListener: function(listener) {
      this.window.removeEventListener('hashchange', listener, false);
    },

    toString: function() { return "WindowHashValue(" + this.get() + ")"; }
  }
});

X.memento = X.WindowHashValue.create();


FOAModel({
  name: 'ImageView',

  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && Events.unfollow(oldValue, this.domValue);
        Events.follow(newValue, this.domValue);
      }
    },
    {
      // TODO: make 'data' be the actual source of the data
      name: 'data',
      getter: function() { return this.value.get(); },
      setter: function(d) { this.value = SimpleValue.create(d); }
    },
    {
      name: 'backupImage'
    },
    {
      name: 'domValue',
      postSet: function(oldValue, newValue) {
        oldValue && Events.unfollow(this.value, oldValue);
        Events.follow(this.value, newValue);
      }
    },
    {
      name: 'displayWidth',
      postSet: function(_, newValue) {
        if ( this.$ ) {
          this.$.style.width = newValue;
        }
      }
    },
    {
      name: 'displayHeight',
      postSet: function(_, newValue) {
        if ( this.$ ) {
          this.$.style.height = newValue;
        }
      }
    }
  ],

  methods: {
    setValue: function(value) { this.value = value; },
    toHTML: function() {
      return this.backupImage && window.IS_CHROME_APP ?
        '<img class="imageView" id="' + this.id + '" src="' + this.backupImage + '">' :
        '<img class="imageView" id="' + this.id + '" src="' + this.data + '">' ;
    },
    isSupportedUrl: function(url) {
      url = url.trim().toLowerCase();
      return url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('filesystem:');
    },
    initHTML: function() {
      this.SUPER();

      if ( this.backupImage ) this.$.addEventListener('error', function() {
        this.data = this.backupImage;
      }.bind(this));

      if ( window.IS_CHROME_APP && ! this.isSupportedUrl(this.value.get()) ) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", this.value.get());
        xhr.responseType = 'blob';
        xhr.asend(function(blob) {
          if ( blob ) {
            self.$.src = URL.createObjectURL(blob);
          }
        });
      } else {
        this.domValue = DomValue.create(this.$, undefined, 'src');
        this.displayHeight = this.displayHeight;
        this.displayWidth = this.displayWidth;
      }
    }
  }
});


FOAModel({
  name: 'BlobImageView',

  extendsModel: 'View',

  help: 'Image view for rendering a blob as an image.',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.onValueChange);
        newValue.addListener(this.onValueChange);
      }
    },
    {
      model_: 'IntProperty',
      name: 'displayWidth'
    },
    {
      model_: 'IntProperty',
      name: 'displayHeight'
    }
  ],

  methods: {
    setValue: function(value) {
      this.value = value;
    },

    toHTML: function() {
      return '<img id="' + this.id + '">';
    },

    initHTML: function() {
      this.SUPER();
      var self = this;
      this.$.style.width = self.displayWidth;
      this.$.style.height = self.displayHeight;
      this.onValueChange();
    }
  },

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        if ( ! this.value.get() ) return;
        if ( this.$ )
          this.$.src = URL.createObjectURL(this.value.get());
      }
    }
  ]
});


FOAModel({
  name:  'TextFieldView',
  label: 'Text Field',

  extendsModel: 'View',

  properties: [
    {
      model_: 'StringProperty',
      name: 'name',
      defaultValue: 'field'
    },
    {
      model_: 'IntProperty',
      name: 'displayWidth',
      defaultValue: 30
    },
    {
      model_: 'IntProperty',
      name: 'displayHeight',
      defaultValue: 1
    },
    {
      model_: 'StringProperty',
      name: 'type',
      defaultValue: 'text'
    },
    {
      model_: 'StringProperty',
      name: 'placeholder',
      defaultValue: undefined
    },
    {
      model_: 'BooleanProperty',
      name: 'onKeyMode',
      help: 'If true, value is updated on each keystroke.'
    },
    {
      model_: 'BooleanProperty',
      name: 'escapeHTML',
      // defaultValue: true,
      // TODO: make the default 'true' for security reasons
      help: 'If true, HTML content is excaped in display mode.'
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); }
      }
    },
    {
      name: 'domValue'
    },
    {
      name: 'data'
    },
    {
      model_: 'StringProperty',
      name: 'readWriteTagName',
      defaultValueFn: function() {
        return this.displayHeight === 1 ? 'input' : 'textarea';
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'autocomplete',
      defaultValue: true
    },
    'autocompleter',
    'autocompleteView'
  ],

  methods: {
    /** Escape topic published when user presses 'escape' key to abort edits. **/
    // TODO: Model as a 'Topic'
    ESCAPE: ['escape'],

    toHTML: function() {
      return this.mode === 'read-write' ?
        this.toReadWriteHTML() :
        this.toReadOnlyHTML()  ;
    },

    toReadWriteHTML: function() {
      var str = '<' + this.readWriteTagName + ' id="' + this.id + '"';
      str += ' type="' + this.type + '" ' + this.cssClassAttr();

      str += this.readWriteTagName === 'input' ?
        ' size="' + this.displayWidth + '"' :
        ' rows="' + this.displayHeight + '" cols="' + this.displayWidth + '"';

      str += ' name="' + this.name + '">';
      str += '</' + this.readWriteTagName + '>';
      return str;
    },

    toReadOnlyHTML: function() {
      return '<' + this.tagName + ' id="' + this.id + '"' + this.cssClassAttr() + ' name="' + this.name + '"></' + this.tagName + '>';
    },

    setupAutocomplete: function() {
      if ( ! this.autocomplete || ! this.autocompleter ) return;

      var view = this.autocompleteView = this.X.AutocompleteView.create({
        autocompleter: this.autocompleter,
        target: this
      });

      this.bindAutocompleteEvents(view);
    },

    onAutocomplete: function(data) {
      this.data = data;
    },

    bindAutocompleteEvents: function(view) {
      this.$.addEventListener('blur', function() {
        // Notify the autocomplete view of a blur, it can decide what to do from there.
        view.publish('blur');
      });
      this.$.addEventListener('input', (function() {
        view.autocomplete(this.textToValue(this.$.value));
      }).bind(this));
      this.$.addEventListener('focus', (function() {
        view.autocomplete(this.textToValue(this.$.value));
      }).bind(this));
    },

    initHTML: function() {
      this.SUPER();

      if ( this.placeholder ) this.$.placeholder = this.placeholder;

      if ( this.mode === 'read-write' ) {
        this.domValue = DomValue.create(
          this.$,
          this.onKeyMode ? 'input' : 'change');

        // In KeyMode we disable feedback to avoid updating the field
        // while the user is still typing.  Then we update the view
        // once they leave(blur) the field.
        Events.relate(
          this.data$,
          this.domValue,
          this.valueToText.bind(this),
          this.textToValue.bind(this),
          this.onKeyMode);

        if ( this.onKeyMode )
          this.$.addEventListener('blur', this.onBlur);

        this.$.addEventListener('keydown', this.onKeyDown);

        this.setupAutocomplete();
      } else {
        this.domValue = DomValue.create(
          this.$,
          'undefined',
          this.escapeHTML ? 'textContent' : 'innerHTML');

        Events.map(
          this.data$,
          this.domValue,
          this.valueToText.bind(this))
      }
    },

    textToValue: function(text) { return text; },

    valueToText: function(value) { return value; },

    destroy: function() { Events.unlink(this.domValue, this.data$); }
  },

  listeners: [
    {
      name: 'onKeyDown',
      code: function(e) {
        if ( e.keyCode == 27 /* ESCAPE KEY */ ) {
          this.domValue.set(this.data);
          this.publish(this.ESCAPE);
        } else {
          this.publish('keydown', e);
        }
      }
    },
    {
      name: 'onBlur',
      code: function(e) {
        if ( this.domValue.get() !== this.data )
          this.domValue.set(this.data);
      }
    }
  ]
});


FOAModel({
  name:  'DateFieldView',
  label: 'Date Field',

  extendsModel: 'TextFieldView',

  properties: [
    {
      model_: 'StringProperty',
      name: 'type',
      defaultValue: 'date'
    }
  ],

  methods: {
    initHTML: function() {
      this.domValue = DomValue.create(this.$, undefined, 'valueAsDate');
      Events.link(this.data$, this.domValue);
    }
  }
});


FOAModel({
  name:  'DateTimeFieldView',
  label: 'Date-Time Field',

  extendsModel: 'View',

  properties: [
    {
      model_: 'StringProperty',
      name: 'name'
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write'
    },
    {
      name: 'domValue',
      postSet: function(oldValue) {
        if ( oldValue && this.value ) {
          Events.unlink(oldValue, this.value);
        }
      }
    },
    {
      name: 'data',
    }
  ],

  methods: {
    valueToDom: function(value) { return value ? value.getTime() : 0; },
    domToValue: function(dom) { return new Date(dom); },

    toHTML: function() {
      // TODO: Switch type to just datetime when supported.
      return ( this.mode === 'read-write' ) ?
        '<input id="' + this.id + '" type="datetime-local" name="' + this.name + '"/>' :
        '<span id="' + this.id + '" name="' + this.name + '"></span>' ;
    },

    initHTML: function() {
      this.SUPER();

      this.domValue = DomValue.create(
        this.$,
        this.mode === 'read-write' ? 'input' : undefined,
        this.mode === 'read-write' ? 'valueAsNumber' : 'textContent' );

      Events.relate(this.data$, this.domValue, this.valueToDom, this.domToValue);

      Events.relate(
        this.data$,
        this.domValue,
        this.valueToDom.bind(this),
        this.domToValue.bind(this));
    }
  }
});


FOAModel({
  name:  'RelativeDateTimeFieldView',
  label: 'Relative Date-Time Field',

  extendsModel: 'DateTimeFieldView',

  properties: [
    { name: 'mode', defaultValue: 'read-only' }
  ],

  methods: {
    valueToDom: function(value) {
      return value.toRelativeDateString();
    }
  }
});


FOAModel({
  name:  'HTMLView',
  label: 'HTML Field',

  extendsModel: 'View',

  properties: [
    {
      name: 'name',
      type: 'String',
      defaultValue: ''
    },
    {
      model_: 'StringProperty',
      name: 'tag',
      defaultValue: 'span'
    },
    {
      name: 'value',
      type: 'Value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        if ( this.mode === 'read-write' ) {
          Events.unlink(this.domValue, oldValue);
          Events.link(newValue, this.domValue);
        } else {
          Events.follow(newValue, this.domValue);
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      var s = '<' + this.tag + ' id="' + this.id + '"';
      if ( this.name ) s+= ' name="' + this.name + '"';
      s += '></' + this.tag + '>';
      return s;
    },

    // TODO: deprecate
    getValue: function() { return this.value; },

    // TODO: deprecate
    setValue: function(value) { this.value = value; },

    initHTML: function() {
      var e = this.$;

      if ( ! e ) {
        console.log('stale HTMLView');
        return;
      }
      this.domValue = DomValue.create(e, undefined, 'innerHTML');
      this.setValue(this.value);
    },

    destroy: function() { Events.unlink(this.domValue, this.value); }
  }
});


FOAModel({
  name: 'RoleView',

  extendsModel: 'View',

  properties: [
    {
      name: 'roleName',
      type: 'String',
      defaultValue: ''
    },
    {
      name: 'models',
      type: 'Array[String]',
      defaultValue: []
    },
    {
      name: 'selection',
      type: 'Value',
      factory: function() { return SimpleValue.create(); }
    },
    {
      name: 'model',
      type: 'Model'
    }
  ],

  methods: {
    initHTML: function() {
      var e = this.$;
      this.domValue = DomValue.create(e);
      Events.link(this.value, this.domValue);
    },

    toHTML: function() {
      var str = "";

      str += '<select id="' + this.id + '" name="' + this.name + '" size=' + this.size + '/>';
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        str += "\t<option>" + this.choices[i].toString() + "</option>";
      }
      str += '</select>';

      return str;
    },

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      Events.unlink(this.domValue, this.value);
      this.value = value;
      Events.link(value, this.domValue);
    },

    destroy: function() {
      Events.unlink(this.domValue, this.value);
    }
  }
});


FOAModel({
  name: 'BooleanView',

  extendsModel: 'View',

  properties: [
    {
      name:  'name',
      label: 'Name',
      type:  'String',
      defaultValue: 'field'
    }
  ],

  methods: {
    toHTML: function() {
      return '<input type="checkbox" id="' + this.id + '" name="' + this.name + '"' + this.cssClassAttr() + '/>';
    },

    initHTML: function() {
      var e = this.$;

      this.domValue = DomValue.create(e, 'change', 'checked');

      Events.link(this.value, this.domValue);
    },

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      Events.unlink(this.domValue, this.value);
      this.value = value;
      Events.link(value, this.domValue);
    },

    destroy: function() {
      Events.unlink(this.domValue, this.value);
    }
  }
});


FOAModel({
  name: 'ImageBooleanView',

  extendsModel: 'View',

  properties: [
    {
      name:  'name',
      label: 'Name',
      type:  'String',
      defaultValue: ''
    },
    {
      name: 'value',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.update);
        newValue.addListener(this.update);
        this.update();
      }
    },
    {
      name: 'trueImage'
    },
    {
      name: 'falseImage'
    }
  ],

  methods: {
    image: function() {
      return this.value.get() ? this.trueImage : this.falseImage;
    },
    toHTML: function() {
      var id = this.id;
 // TODO: next line appears slow, check why
      this.on('click', this.onClick, id);
      return this.name ?
        '<img id="' + id + '" ' + this.cssClassAttr() + '" name="' + this.name + '">' :
        '<img id="' + id + '" ' + this.cssClassAttr() + '>' ;
    },
    initHTML: function() {
      if ( ! this.$ ) return;
      this.invokeInitializers();
      this.$.src = this.image();
    },
    // deprecated: remove
    getValue: function() { return this.value; },
    // deprecated: remove
    setValue: function(value) { this.value = value; },
    destroy: function() {
      this.value.removeListener(this.update);
    }
  },

  listeners: [
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;
        this.$.src = this.image();
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        e.stopPropagation();
        this.value.set(! this.value.get());
      }
    }
  ]
});


FOAModel({
  name: 'CSSImageBooleanView',

  extendsModel: 'View',

  properties: [
    'data',
  ],

  methods: {
    initHTML: function() {
      if ( ! this.$ ) return;
      this.data$.addListener(this.update);
      this.$.addEventListener('click', this.onClick);
    },
    toHTML: function() {
      return '<span id="' + this.id + '" class="' + this.className + ' ' + (this.data ? 'true' : '') + '">&nbsp;&nbsp;&nbsp;</span>';
    }
  },

  listeners: [
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;
        DOM.setClass(this.$, 'true', this.data);
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        e.stopPropagation();
        this.data = ! this.data;
        this.update();
      }
    }
  ]
});


FOAModel({
  name: 'ImageBooleanView2',

  extendsModel: 'View',

  properties: [
    {
      name:  'name',
      label: 'Name',
      type:  'String',
      defaultValue: 'field'
    },
    {
      name: 'value',
      postSet: function() { if ( this.$ ) this.$.src = this.image(); }
    },
    {
      name: 'trueImage'
    },
    {
      name: 'falseImage'
    }
  ],

  methods: {
    image: function() { return this.value ? this.trueImage : this.falseImage; },
    toHTML: function() {
      return '<img id="' + this.id + '" name="' + this.name + '">';
    },
    initHTML: function() {
      this.$.addEventListener('click', this.onClick);
      this.$.src = this.image();
    }
  },

  listeners: [
    {
      name: 'onClick',
      code: function(e) {
        e.stopPropagation();
        this.value = ! this.value;
      }
    }
  ]
});


FOAModel({
  name: 'TextAreaView',

  extendsModel: 'TextFieldView',

  label: 'Text-Area View',

  properties: [
    {
      model_: 'IntProperty',
      name: 'displayHeight',
      defaultValue: 5
    },
    {
      model_: 'IntProperty',
      name: 'displayWidth',
      defaultValue: 70
    }
  ]
});


FOAModel({
  name:  'FunctionView',

  extendsModel: 'TextFieldView',

  properties: [
    {
      name: 'onKeyMode',
      defaultValue: true
    },
    {
      name: 'displayWidth',
      defaultValue: 80
    },
    {
      name: 'displayHeight',
      defaultValue: 8
    },
    {
      name: 'errorView',
      factory: function() { return TextFieldView.create({mode:'read-only'}); }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.errorView.initHTML();
      this.errorView.$.style.color = 'red';
      this.errorView.$.style.display = 'none';
    },

    toHTML: function() {
      return this.errorView.toHTML() + ' ' + this.SUPER();
    },

    setError: function(err) {
      this.errorView.data = err || "";
      this.errorView.$.style.display = err ? 'block' : 'none';
    },

    textToValue: function(text) {
      if ( ! text ) return null;

      try {
        var ret = eval("(" + text + ")");

        this.setError(undefined);

        return ret;
      } catch (x) {
        console.log("JS Error: ", x, text);
        this.setError(x);

        return text;
      }
    },

    valueToText: function(value) {
      return value ? value.toString() : "";
    }
  }
});


FOAModel({
  name: 'JSView',

  extendsModel: 'TextAreaView',

  methods: {
    init: function(args) {
      this.SUPER();

      this.cols = (args && args.displayWidth)  || 100;
      this.rows = (args && args.displayHeight) || 50;
    },

    textToValue: function(text) {
      try {
        return JSONUtil.parse(text);
      } catch (x) {
        console.log("error");
      }
      return text;
    },

    valueToText: function(val) {
      return JSONUtil.pretty.stringify(val);
    }
  }
});


FOAModel({
  name:  'XMLView',
  label: 'XML View',

  extendsModel: 'TextAreaView',

  methods: {
    init: function(args) {
      this.SUPER();

      this.cols = (args && args.displayWidth)  || 100;
      this.rows = (args && args.displayHeight) || 50;
    },

    textToValue: function(text) {
      return this.val_; // Temporary hack until XML parsing is implemented
      // TODO: parse XML
      return text;
    },

    valueToText: function(val) {
      this.val_ = val;  // Temporary hack until XML parsing is implemented
      return XMLUtil.stringify(val);
    }
  }
});


/** A display-only summary view. **/
FOAModel({
  name: 'SummaryView',

  extendsModel: 'View',

  properties: [
    {
      name: 'model',
      type: 'Model'
    },
    {
      name: 'value',
      type: 'Value',
      factory: function() { return SimpleValue.create(); }
    }
  ],

  methods: {
    getValue: function() {
      return this.value;
    },

    toHTML: function() {
      return (this.model.getPrototype().toSummaryHTML || this.defaultToHTML).call(this);
    },

    defaultToHTML: function() {
      this.children = [];
      var model = this.model;
      var obj   = this.get();
      var out   = [];

      out.push('<div id="' + this.id + '" class="summaryView">');
      out.push('<table>');

      // TODO: Either make behave like DetailView or else
      // make a mode of DetailView.
      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        var value = obj[prop.name];

        if ( ! value ) continue;

        out.push('<tr>');
        out.push('<td class="label">' + prop.label + '</td>');
        out.push('<td class="value">');
        if ( prop.summaryFormatter ) {
          out.push(prop.summaryFormatter(this.strToHTML(value)));
        } else {
          out.push(this.strToHTML(value));
        }
        out.push('</td></tr>');
      }

      out.push('</table>');
      out.push('</div>');

      return out.join('');
    },

    get: function() {
      return this.getValue().get();
    }
  }
});


/** A display-only on-line help view. **/
FOAModel({
  name: 'HelpView',

  extendsModel: 'View',

  properties: [
    {
      name: 'model',
      type: 'Model'
    }
  ],

  methods: {
    // TODO: make this a template?
    toHTML: function() {
      var model = this.model;
      var out   = [];

      out.push('<div id="' + this.id + '" class="helpView">');

      out.push('<div class="intro">');
      out.push(model.help);
      out.push('</div>');

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        out.push('<div class="label">');
        out.push(prop.label);
        out.push('</div><div class="text">');
        if ( prop.subType /*&& value instanceof Array*/ && prop.type.indexOf('[') != -1 ) {
          var subModel = this.X[prop.subType];
          var subView  = HelpView.create({model: subModel});
          if ( subModel != model )
            out.push(subView.toHTML());
        } else {
          out.push(prop.help);
        }
        out.push('</div>');
      }

      out.push('</div>');

      return out.join('');
    }
  }
});


FOAModel({
  name: 'EditColumnsView',

  extendsModel: 'View',

  properties: [
    {
      name: 'model',
      type: 'Model'
    },
    {
      model_: 'StringArrayProperty',
      name: 'properties'
    },
    {
      model_: 'StringArrayProperty',
      name: 'availableProperties'
    }
  ],

  listeners: [
    {
      name: 'onAddColumn',
      code: function(prop) {
        this.properties = this.properties.concat([prop]);
      }
    },
    {
      name: 'onRemoveColumn',
      code: function(prop) {
        this.properties = this.properties.deleteF(prop);
      }
    }

  ],

  methods: {
    toHTML: function() {
      var s = '<span id="' + this.id + '" class="editColumnView" style="position: absolute;right: 0.96;background: white;top: 138px;border: 1px solid black;">'

      s += 'Show columns:';
      s += '<table>';

      // Currently Selected Properties
      for ( var i = 0 ; i < this.properties.length ; i++ ) {
        var p = this.model.getProperty(this.properties[i]);
        s += '<tr><td id="' + this.on('click', this.onRemoveColumn.bind(this, p.name)) + '">&nbsp;&#x2666;&nbsp;' + p.label + '</td></tr>';
      }

      // Available but not Selected Properties
      for ( var i = 0 ; i < this.availableProperties.length ; i++ ) {
        var p = this.availableProperties[i];
        if ( this.properties.indexOf(p.name) == -1 ) {
          s += '<tr><td id="' + this.on('click', this.onAddColumn.bind(this, p.name)) + '">&nbsp;&nbsp;&nbsp;&nbsp;' + p.label + '</td></tr>';
        }
      }

      s += '</table>';
      s += '</span>';

      return s;
    }
  }
});


// TODO: add ability to set CSS class and/or id
FOAModel({
  name: 'ActionButton',

  extendsModel: 'View',

  properties: [
    {
      name: 'action',
      postSet: function(old, nu) {
        old && old.removeListener(this.render)
        nu.addListener(this.render);
      }
    },
    {
      name: 'data',
      setter: function(_, d) { this.value = SimpleValue.create(d); }
    },
    {
      name: 'value',
      type: 'Value',
      factory: function() { return SimpleValue.create(); }
    },
    {
      name: 'className',
      factory: function() { return 'actionButton actionButton-' + this.action.name; }
    },
    {
      name: 'tagName',
      defaultValue: 'button'
    },
    {
      name: 'showLabel',
      defaultValueFn: function() { return this.action.showLabel; }
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() { return this.action.iconUrl; }
    }
  ],

  listeners: [
    {
      name: 'render',
      isAnimated: true,
      code: function() { this.updateHTML(); }
    }
  ],

  methods: {
    toHTML: function() {
      var self = this;
      var value = self.value.get();

      this.on('click', function() {
        self.action.callIfEnabled(self.value.get());
      }, this.id);

      this.setAttribute('data-tip', function() {
        return self.action.help || undefined;
      }, this.id);

      this.setAttribute('disabled', function() {
        var value = self.value.get();
        return self.action.isEnabled.call(value, self.action) ? undefined : 'disabled';
      }, this.id);

      this.X.dynamic(function() { self.action.labelFn.call(value, self.action); self.updateHTML(); });

      return this.SUPER();
    },

    toInnerHTML: function() {
      var out = '';

      if ( this.iconUrl ) {
        out += '<img src="' + XMLUtil.escapeAttr(this.action.iconUrl) + '">';
      }

      if ( this.showLabel ) {
        var value = this.value.get();
        out += value ? this.action.labelFn.call(value, this.action) : this.action.label;
      }

      return out;
    }
  }
});


FOAModel({
  name: 'ActionLink',

  extendsModel: 'ActionButton',

  properties: [
    {
      name: 'className',
      factory: function() { return 'actionLink actionLink-' + this.action.name; }
    },
    {
      name: 'tagName',
      defaultValue: 'a'
    }
  ],

  methods: {
    toHTML: function() {
      this.setAttribute('href', function() { return '#' }, this.id);
      return this.SUPER();
    },

    toInnerHTML: function() {
      if ( this.action.iconUrl ) {
        return '<img src="' + XMLUtil.escapeAttr(this.action.iconUrl) + '" />';
      }

      if ( this.action.showLabel ) {
        var value = this.value.get();
        return value ? this.action.labelFn.call(value, this.action) : this.action.label;
      }
    }
  }
});


// TODO: ActionBorder should use this.
FOAModel({
  name:  'ToolbarView',
  label: 'Toolbar',

  extendsModel: 'View',

  properties: [
    {
      model_: 'BooleanProperty',
      name: 'horizontal',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'icons',
      defaultValueFn: function() {
        return this.horizontal;
      }
    },
    {
      name: 'value',
      type: 'Value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
      }
    },
    {
      name: 'left'
    },
    {
      name: 'top'
    },
    {
      name: 'bottom'
    },
    {
      name: 'right'
    },
    {
      // TODO: This should just come from X instead
      name: 'document'
    },
    {
      model_: 'BooleanPropery',
      name: 'openedAsMenu',
      defaultValue: false
    }
  ],

  methods: {
    preButton: function(button) { return ' '; },
    postButton: function() { return this.horizontal ? ' ' : '<br>'; },

    openAsMenu: function() {
      var div = this.document.createElement('div');
      this.openedAsMenu = true;

      div.id = this.nextID();
      div.className = 'ActionMenuPopup';
      this.top ? div.style.top = this.top : div.style.bottom = this.bottom;
      this.left ? div.style.left = this.left : div.style.right = this.right;
      div.innerHTML = this.toHTML(true);

      var self = this;
      // Close window when clicked
      div.onclick = function() { self.close(); };

      div.onmouseout = function(e) {
        if ( e.toElement.parentNode != div && e.toElement.parentNode.parentNode != div ) {
          self.close();
        }
      };

      this.document.body.appendChild(div);
      this.initHTML();
    },

    close: function() {
      if ( ! this.openedAsMenu ) return this.SUPER();

      this.openedAsMenu = false;
      this.$.parentNode.remove();
      this.destroy();
      this.publish('closed');
    },

    toHTML: function(opt_menuMode) {
      var str = '';
      var cls = opt_menuMode ? 'ActionMenu' : 'ActionToolbar';

      str += '<div id="' + this.id + '" class="' + cls + '">';

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        str += this.preButton(this.children[i]) +
          this.children[i].toHTML() +
          (MenuSeparator.isInstance(this.children[i]) ?
           '' : this.postButton(this.children[i]));
      }

      str += '</div>';

      return str;
    },

    initHTML: function() {
      this.SUPER();

      // this.value.addListener(function() { console.log('****ActionToolBar'); });
      // When the focus is in the toolbar, left/right arrows should move the
      // focus in the direction.
      this.addShortcut('Right', function(e) {
        var i = 0;
        for (; i < this.children.length; ++i) {
          if (e.target == this.children[i].$)
            break;
        }
        i = (i + 1) % this.children.length;
        this.children[i].$.focus();
      }.bind(this), this.id);
      this.addShortcut('Left', function(e) {
        var i = 0;
        for (; i < this.children.length; ++i) {
          if (e.target == this.children[i].$)
            break;
        }
        i = (i + this.children.length - 1) % this.children.length;
        this.children[i].$.focus();
      }.bind(this), this.id);
    },

    addAction: function(a) {
      var view = ActionButton.create({ action: a, value: this.value });
      if ( a.children.length > 0 ) {
        var self = this;
        view.action = a.clone();
        view.action.action = function() {
          var toolbar = ToolbarView.create({
            value: self.value,
            document: self.document,
            left: view.$.offsetLeft,
            top: view.$.offsetTop
          });
          toolbar.addActions(a.children);
          toolbar.openAsMenu(view);
        };
      }
      this.addChild(view);
    },
    addActions: function(actions) {
      actions.forEach(this.addAction.bind(this));
    },
    addSeparator: function() {
      this.addChild(MenuSeparator.create());
    }
  }
});

/** Add Action Buttons to a decorated View. **/
/* TODO:
   These are left over Todo's from the previous ActionBorder, not sure which still apply.

   The view needs a standard interface to determine it's Model (getModel())
   listen for changes to Model and change buttons displayed and enabled
   isAvailable
*/
FOAModel({
  name: 'ActionBorder',

  properties: [
    {
      name: 'actions'
    },
    {
      name: 'value'
    }
  ],

  methods: {
    toHTML: function(border, delegate, args) {
      var str = "";
      str += delegate.apply(this, args);
      str += '<div class="actionToolbar">';
      var actions = border.actions || this.model.actions;
      for ( var i = 0 ; i < actions.length; i++ ) {
        var action = actions[i];
        var button = ActionButton.create({ action: action });
        if ( border.value )
          button.value$ = border.value$
        else if ( this.value )
          button.value$ = this.value$;
        else
          button.value = SimpleValue.create(this);
        str += " " + button.toHTML() + " ";
        this.addChild(button);
      }

      str += '</div>';
      return str;
    }
  }
});

FOAModel({
  name: 'ProgressView',

  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      type: 'Value',
      factory: function() { return SimpleValue.create(); }
    }
  ],

  methods: {

    toHTML: function() {
      return '<progress value="25" id="' + this.id + '" max="100" >25</progress>';
    },

    setValue: function(value) {
      this.value.removeListener(this.listener_);

      this.value = value;
      value.addListener(this.listener_);
    },

    updateValue: function() {
      var e = this.$;

      e.value = parseInt(this.value.get());
    },

    initHTML: function() {
      var e = this.$;

      // TODO: move to modelled listener
      this.listener_ = this.updateValue.bind(this);

      this.value.addListener(this.listener_);
    },

    destroy: function() {
      this.value.removeListener(this.listener_);
    }
  }
});


var ArrayView = {
  create: function(prop) {
    var view = DAOController.create({
      model: GLOBAL[prop.subType]
    });
    return view;
  }
};


FOAModel({
  name: 'GridView',

  extendsModel: 'View',

  properties: [
    {
      name: 'row',
      type: 'ChoiceView',
      factory: function() { return ChoiceView.create(); }
    },
    {
      name: 'col',
      label: 'column',
      type: 'ChoiceView',
      factory: function() { return ChoiceView.create(); }
    },
    {
      name: 'acc',
      label: 'accumulator',
      type: 'ChoiceView',
      factory: function() { return ChoiceView.create(); }
    },
    {
      name: 'accChoices',
      label: 'Accumulator Choices',
      type: 'Array',
      factory: function() { return []; }
    },
    {
      name: 'scrollMode',
      type: 'String',
      defaultValue: 'Bars',
      view: { model_: 'ChoiceView', choices: [ 'Bars', 'Warp' ] }
    },
    {
      name: 'model',
      type: 'Model'
    },
    {
      name: 'dao',
      label: 'DAO',
      type: 'DAO',
      postSet: function() { this.repaint_(); }
    },
    {
      name: 'grid',
      type: 'GridByExpr',
      factory: function() { return GridByExpr.create(); }
    }
  ],

  // TODO: need an 'onChange:' property to handle both value
  // changing and values in the value changing

  // TODO: listeners should be able to mark themselves as mergable
  // or updatable on 'animate', ie. specify decorators
  methods: {
    updateHTML: function() {
      if ( ! this.$ ) return;

      var self = this;
      this.grid.xFunc = this.col.data || this.grid.xFunc;
      this.grid.yFunc = this.row.data || this.grid.yFunc;
      this.grid.acc   = this.acc.data || this.grid.acc;

      this.dao.select(this.grid.clone())(function(g) {
        if ( self.scrollMode === 'Bars' ) {
          console.time('toHTML');
          var html = g.toHTML();
          console.timeEnd('toHTML');
          self.$.innerHTML = html;
          g.initHTML();
        } else {
          var cview = this.X.GridCView.create({grid: g, x:5, y: 5, width: 1000, height: 800});
          self.$.innerHTML = cview.toHTML();
          cview.initHTML();
          cview.paint();
        }
      });
    },

    initHTML: function() {
      // TODO: I think this should be done automatically some-how/where.
      this.scrollModeView.data$ = this.scrollMode$;

      var choices = [
        [ { f: function() { return ''; } }, 'none' ]
      ];
      this.model.properties.orderBy(Property.LABEL).select({put: function(p) {
        choices.push([p, p.label]);
      }});
      this.row.choices = choices;
      this.col.choices = choices;

      this.acc.choices = this.accChoices;

      this.row.initHTML();
      this.col.initHTML();
      this.acc.initHTML();

      this.SUPER();

      this.row.data$.addListener(this.repaint_);
      this.col.data$.addListener(this.repaint_);
      this.acc.data$.addListener(this.repaint_);
      this.scrollMode$.addListener(this.repaint_);

      this.updateHTML();
    }
  },

  listeners: [
    {
      name: 'repaint_',
      isAnimated: true,
      code: function() { this.updateHTML(); }
    }
  ],

  templates:[
    /*
    {
      model_: 'Template',

      name: 'toHTML2',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %><br/></div>' +
        '<div id="<%= this.id%>" class="gridViewArea column" style="flex: 1 1 100%"></div>' +
        '</div>'
    },
    */
    {
      model_: 'Template',

      name: 'toHTML',
      description: 'TileView',
      template: '<div class="column expand">' +
        '<div class="gridViewControl">Rows: <%= this.row.toHTML() %> &nbsp;Cols: <%= this.col.toHTML() %> &nbsp;Cells: <%= this.acc.toHTML() %> &nbsp;Scroll: $$scrollMode <br/></div>' +
        '<div id="<%= this.id%>" class="gridViewArea column" style="flex: 1 1 100%"></div>' +
        '</div>'
    }
  ]
});


FOAModel({
  name: 'Mouse',

  properties: [
    {
      name: 'x',
      type: 'int',
      view: 'IntFieldView',
      defaultValue: 0
    },
    {
      name: 'y',
      type: 'int',
      view: 'IntFieldView',
      defaultValue: 0
    }
  ],
  methods: {
    connect: function(e) {
      e.addEventListener('mousemove', this.onMouseMove);
      return this;
    }
  },

  listeners: [
    {
      name: 'onMouseMove',
      isAnimated: true,
      code: function(evt) {
        this.x = evt.offsetX;
        this.y = evt.offsetY;
      }
    }
  ]
});


// TODO: This should be replaced with a generic Choice.
FOAModel({
  name: 'ViewChoice',

  tableProperties: [
    'label',
    'view'
  ],

  properties: [
    {
      name: 'label',
      type: 'String',
      displayWidth: 20,
      defaultValue: '',
      help: "View's label."
    },
    {
      name: 'view',
      type: 'view',
      defaultValue: 'DetailView',
      help: 'View factory.'
    }
  ]
});


FOAModel({
  name: 'AlternateView',

  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create(''); }
    },
    {
      name: 'views',
      type: 'Array[ViewChoice]',
      subType: 'ViewChoice',
      view: 'ArrayView',
      defaultValue: [],
      help: 'View choices.'
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      postSet: function(_, dao) {
        if ( this.choice ) {
          if ( this.view ) {
            this.view.dao = dao;
          } else {
            this.installSubView();
          }
        }
      }
    },
    {
      name: 'choice',
      postSet: function(oldValue, viewChoice) {
        if ( this.$ && oldValue != viewChoice ) this.installSubView();
      },
      hidden: true
    },
    {
      name: 'mode',
      getter: function() { return this.choice.label; },
      setter: function(label) {
        for ( var i = 0 ; i < this.views.length ; i++ ) {
          if ( this.views[i].label === label ) {
            var oldValue = this.mode;

            this.choice = this.views[i];

            this.propertyChange('mode', oldValue, label);
            return;
          }
        }
      }
    },
    {
      name: 'headerView',
      help: 'Optional View to be displayed in header.',
      defaultValue: null
    },
    {
      name: 'view'
    }
  ],

  listeners: [
    {
      name: 'installSubView',
      isAnimated: true,
      code: function(evt) {
        var viewChoice = this.choice;
        var view = typeof(viewChoice.view) === 'function' ?
          viewChoice.view(this.value.get().model_, this.value) :
          GLOBAL[viewChoice.view].create({
            model: this.value.get().model_,
            value: this.value
          });

        // TODO: some views are broken and don't have model_, remove
        // first guard when fixed.
        if ( view.model_ && view.model_.getProperty('dao') ) view.dao = this.dao;

        this.$.innerHTML = view.toHTML();
        view.initHTML();
        view.value && view.value.set(this.value.get());
        //       if ( view.set ) view.set(this.model.get());
        //       Events.link(this.model, this.view.model);

        this.view = view;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.choice = this.views[0];
    },

    toHTML: function() {
      var str  = [];
      var viewChoice = this.views[0];

      str.push('<div class="AltViewOuter column" style="margin-bottom:5px;">');
      str.push('<div class="altViewButtons rigid">');
      if ( this.headerView ) {
        str.push(this.headerView.toHTML());
        this.addChild(this.headerView);
      }
      for ( var i = 0 ; i < this.views.length ; i++ ) {
        var choice = this.views[i];
        var listener = function (choice) {
          this.choice = choice;
          return false;
        }.bind(this, choice);

        var id = this.nextID();

        this.addPropertyListener('choice', function(choice, id) {
          DOM.setClass($(id), 'mode_button_active', this.choice === choice);
        }.bind(this, choice, id));

        var cls = 'buttonify';
        if ( i == 0 ) cls += ' capsule_left';
        if ( i == this.views.length - 1 ) cls += ' capsule_right';
        if ( choice == this.choice ) cls += ' mode_button_active';
        str.push('<a class="' + cls + '" id="' + this.on('click', listener, id) + '">' + choice.label + '</a>');
        if ( choice.label == this.selected ) viewChoice = choice
      }
      str.push('</div>');
      str.push('<br/>');
      str.push('<div class="altView column" id="' + this.id + '"> </div>');
      str.push('</div>');

      return str.join('');
    },

    initHTML: function() {
      this.SUPER();

      this.choice = this.choice || this.views[0];
      this.installSubView();
    }
  }
});


// TODO: Currently this view is "eager": it renders all the child views.
// It could be made more lazy , and therefore more memory-efficient.
FOAModel({
  name: 'SwipeAltView',
  extendsModel: 'View',

  properties: [
    {
      name: 'views',
      type: 'Array[ViewChoice]',
      subType: 'ViewChoice',
      view: 'ArrayView',
      factory: function() { return []; },
      help: 'Child views'
    },
    {
      name: 'index',
      help: 'The index of the currently selected view',
      defaultValue: 0,
      preSet: function(old, nu) {
        if (nu < 0) return 0;
        if (nu >= this.views.length) return this.views.length - 1;
        return nu;
      },
      postSet: function(oldValue, viewChoice) {
        this.views[oldValue].view.deepPublish(this.ON_HIDE);
        // ON_SHOW is called after the animation is done.
        this.snapToCurrent(Math.abs(oldValue - viewChoice));
      },
      hidden: true
    },
    {
      name: 'headerView',
      help: 'Optional View to be displayed in header.',
      factory: function() {
        return ChoiceListView.create({
          choices: this.views.map(function(x) {
            return x.label;
          }),
          index$: this.index$,
          className: 'swipeAltHeader foamChoiceListView horizontal'
        });
      }
    },
    {
      name: 'data',
      help: 'Generic data field for the views. Proxied to all the child views.',
      postSet: function(old, nu) {
        this.views.forEach(function(c) {
          c.view.data = nu;
        });
      }
    },
    {
      name: 'slider',
      help: 'Internal element which gets translated around',
      hidden: true
    },
    {
      name: 'width',
      help: 'Set when we know the width',
      hidden: true
    },
    {
      name: 'x',
      help: 'X coordinate of the translation',
      hidden: true,
      postSet: function(old, nu) {
        // TODO: Other browsers.
        this.slider.style['-webkit-transform'] = 'translate3d(-' +
            nu + 'px, 0, 0)';
      }
    },
    {
      name: 'touch',
      help: 'TouchManager\'s FOAMTouch object',
      hidden: true
    },
    {
      name: 'touchStarted',
      model_: 'BooleanProperty',
      defaultValue: false,
      help: 'True if we received a touchstart',
      hidden: true
    },
    {
      name: 'touchLive',
      model_: 'BooleanProperty',
      defaultValue: false,
      help: 'True if a touch is currently active',
      hidden: true
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      this.views.forEach(function(choice, index) {
        if ( index != self.index )
          choice.view.deepPublish(self.ON_HIDE);
      });
    },

    // The general structure of the carousel is:
    // - An outer div (this.$), with position: relative.
    // - A second div (this.slider) with position: relative.
    //   This is the div that gets translated to and fro.
    // - A set of internal divs (this.slider.children) for the child views.
    //   These are positioned inside the slider right next to each other,
    //   and they have the same width as the outer div.
    //   At most two of these can be visible at a time.
    //
    // If the width is not set yet, this renders a fake carousel. It has the
    // outer, slider and inner divs, but there's only one inner div and it
    // can't slide yet. Shortly thereafter, the slide is expanded and the
    // other views are added. This should be imperceptible to the user.
    toHTML: function() {
      var str  = [];
      var viewChoice = this.views[this.index];

      if ( this.headerView ) {
        str.push(this.headerView.toHTML());
        this.addChild(this.headerView);
      }

      str.push('<div id="' + this.id + '" class="swipeAltOuter">');
      str.push('<div class="swipeAltSlider" style="width: 100%">');
      str.push('<div class="swipeAltInner" style="left: 0px">');

      str.push(viewChoice.view.toHTML());

      str.push('</div>');
      str.push('</div>');
      str.push('</div>');

      return str.join('');
    },

    initHTML: function() {
      if ( ! this.$ ) return;
      this.SUPER();

      // Now is the time to inflate our fake carousel into the real thing.
      // For now we won't worry about re-rendering the current one.
      // TODO: Stop re-rendering if it's slow or causes flicker or whatever.

      this.slider = this.$.children[0];
      this.width = this.$.clientWidth;

      var str = [];
      for ( var i = 0 ; i < this.views.length ; i++ ) {
        str.push('<div class="swipeAltInner">');
        str.push(this.views[i].view.toHTML());
        str.push('</div>');
      }

      this.slider.innerHTML = str.join('');

      window.addEventListener('resize', this.resize, false);
      this.X.touchManager.install(TouchReceiver.create({
        id: 'swipeAltView-' + this.id,
        element: this.$,
        delegate: this
      }));


      // Wait for the new HTML to render first, then init it.
      var self = this;
      window.setTimeout(function() {
        self.resize();
        self.views.forEach(function(choice) {
          choice.view.initHTML();
        });
      }, 0);
    },

    snapToCurrent: function(sizeOfMove) {
      var self = this;
      var time = 150 + sizeOfMove * 150;
      Movement.animate(time, function(evt) {
        self.x = self.index * self.width;
      }, Movement.ease(150/time, 150/time), function() {
        self.views[self.index].view.deepPublish(self.ON_SHOW);
      })();
    }
  },

  listeners: [
    {
      name: 'resize',
      code: function() {
        // When the orientation of the screen has changed, update the
        // left and width values of the inner elements and slider.
        if ( ! this.$ ) {
          window.removeEventListener('resize', this.resize, false);
          return;
        }

        this.width = this.$.clientWidth;
        var self = this;
        var frame = window.requestAnimationFrame(function() {
          self.x = self.index * self.width;

          for ( var i = 0 ; i < self.slider.children.length ; i++ ) {
            self.slider.children[i].style.left = (i * 100) + '%';
          }

          window.cancelAnimationFrame(frame);
        });
      }
    },
    {
      name: 'onTouchStart',
      code: function(touches, changed) {
        // Only handle single-point touches.
        if ( Object.keys(touches).length > 1 ) return { drop: true };

        // Otherwise we're moderately interested, until it moves.
        this.touch = touches[changed[0]];
        this.touchStarted = true;
        this.touchLive = false;
        return { weight: 0.5 };
      }
    },
    {
      name: 'onTouchMove',
      code: function(touches, changed) {
        if ( ! this.touchStarted ) return { drop: true };

        var deltaX = Math.abs(this.touch.x - this.touch.startX);
        var deltaY = Math.abs(this.touch.y - this.touch.startY);
        if ( ! this.touchLive &&
            Math.sqrt(deltaX*deltaX + deltaY*deltaY) < 6 ) {
          // Prevent default, but don't decide if we're scrolling yet.
          return { preventDefault: true, weight: 0.5 };
        }

        if ( ! this.touchLive && deltaX < deltaY ) {
          // Drop our following of this touch.
          return { drop: true };
        }

        // Otherwise the touch is live.
        this.touchLive = true;
        var x = this.index * this.width -
            (this.touch.x - this.touch.startX);

        // Limit x to be within the scope of the slider: no dragging too far.
        if (x < 0) x = 0;
        var maxWidth = (this.views.length - 1) * this.width;
        if ( x > maxWidth ) x = maxWidth;

        this.x = x;
        return { claim: true, weight: 0.9 };
      }
    },
    {
      name: 'onTouchEnd',
      code: function(touches, changed) {
        if ( ! this.touchLive ) return this.onTouchCancel(touches, changed);

        this.touchLive = false;

        var finalX = this.touch.x;
        if ( Math.abs(finalX - this.touch.startX) > this.width / 3 ) {
          // Consider that a move.
          if (finalX < this.touch.startX) {
            this.index++;
          } else {
            this.index--;
          }
        } else {
          this.snapToCurrent(1);
        }

        return { drop: true };
      }
    },
    {
      name: 'onTouchCancel',
      code: function(touches, changed) {
        this.touchLive = false;
        this.touchStarted = false;
        return { drop: true };
      }
    }
  ]
});

FOAModel({
  name: 'GalleryView',
  extendsModel: 'SwipeAltView',

  properties: [
    {
      name: 'images',
      required: true,
      help: 'List of image URLs for the gallery',
      postSet: function(old, nu) {
        this.views = nu.map(function(src) {
          return ViewChoice.create({
            view: GalleryImageView.create({ source: src })
          });
        });
      }
    },
    {
      name: 'height',
      help: 'Optionally set the height'
    },
    {
      name: 'headerView',
      factory: function() { return null; }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      // Add an extra div to the outer one.
      // It's absolutely positioned at the bottom, and contains the circles.
      var circlesDiv = document.createElement('div');
      circlesDiv.classList.add('galleryCirclesOuter');
      for ( var i = 0 ; i < this.views.length ; i++ ) {
        var circle = document.createElement('div');
        //circle.appendChild(document.createTextNode('*'));
        circle.classList.add('galleryCircle');
        if ( this.index == i ) circle.classList.add('selected');
        circlesDiv.appendChild(circle);
      }

      this.$.appendChild(circlesDiv);
      this.$.classList.add('galleryView');
      this.$.style.height = this.height;

      this.index$.addListener(function(obj, prop, old, nu) {
        circlesDiv.children[old].classList.remove('selected');
        circlesDiv.children[nu].classList.add('selected');
      });
    }
  }
});


FOAModel({
  name: 'GalleryImageView',
  extendsModel: 'View',

  properties: [ 'source' ],

  methods: {
    toHTML: function() {
      return '<img class="galleryImage" src="' + this.source + '" />';
    }
  }
});


FOAModel({
  name: 'ModelAlternateView',
  extendsModel: 'AlternateView',
  methods: {
    init: function() {
      // TODO: super.init
      this.views = FOAM([
        {
          model_: 'ViewChoice',
          label:  'GUI',
          view:   'DetailView'
        },
        {
          model_: 'ViewChoice',
          label:  'JS',
          view:   'JSView'
        },
        {
          model_: 'ViewChoice',
          label:  'XML',
          view:   'XMLView'
        },
        {
          model_: 'ViewChoice',
          label:  'UML',
          view:   'XMLView'
        },
        {
          model_: 'ViewChoice',
          label:  'Split',
          view:   'SplitView'
        }
      ]);
    }
  }
});


FOAModel({
  name: 'FloatFieldView',

  extendsModel: 'TextFieldView',

  properties: [
    { name: 'precision', defaultValue: undefined },
    { name: 'type',      defaultValue: 'number' }
  ],

  methods: {
    formatNumber: function(val) {
      if ( ! val ) return '0';
      val = val.toFixed(this.precision);
      var i = val.length-1;
      for ( ; i > 0 && val.charAt(i) === '0' ; i-- );
      return val.substring(0, val.charAt(i) === '.' ? i : i+1);
    },
    valueToText: function(val) {
      return this.hasOwnProperty('precision') ?
        this.formatNumber(val) :
        String.valueOf(val) ;
    },
    textToValue: function(text) { return parseFloat(text) || 0; }
  }
});


FOAModel({
  name: 'IntFieldView',

  extendsModel: 'TextFieldView',

  properties: [
    { name: 'type', defaultValue: 'number' }
  ],

  methods: {
    textToValue: function(text) { return parseInt(text) || "0"; },
    valueToText: function(value) { return value ? value : '0'; }
  }
});


FOAModel({
  name: 'StringArrayView',

  extendsModel: 'TextFieldView',

  methods: {
    findCurrentValues: function() {
      var start = this.$.selectionStart;
      var value = this.$.value;

      var values = value.split(',');
      var i = 0;
      var sum = 0;

      while ( sum + values[i].length < start ) {
        sum += values[i].length + 1;
        i++;
      }

      return { values: values, i: i };
    },
    setValues: function(values, index) {
      this.domValue.set(this.valueToText(values) + ',');
      this.data = this.textToValue(this.domValue.get());

      var isLast = values.length - 1 === index;
      var selection = 0;
      for ( var i = 0; i <= index; i++ ) {
        selection += values[i].length + 1;
      }
      this.$.setSelectionRange(selection, selection);
      isLast && this.X.setTimeout((function() {
        this.autocompleteView.autocomplete('');
      }).bind(this), 0);
    },
    onAutocomplete: function(data) {
      var current = this.findCurrentValues();
      current.values[current.i] = data;
      this.setValues(current.values, current.i);
    },
    bindAutocompleteEvents: function(view) {
      // TODO: Refactor this.
      var self = this;
      function onInput() {
        var values = self.findCurrentValues();
        view.autocomplete(values.values[values.i]);
      }
      this.$.addEventListener('input', onInput);
      this.$.addEventListener('focus', onInput);
      this.$.addEventListener('blur', function() {
        // Notify the autocomplete view of a blur, it can decide what to do from there.
        view.publish('blur');
      });
    },
    textToValue: function(text) { return text.replace(/\s/g,'').split(','); },
    valueToText: function(value) { return value ? value.toString() : ""; }
  }
});


FOAModel({
  name: 'MultiLineStringArrayView',
  extendsModel: 'View',

  properties: [
    {
      model_: 'StringProperty',
      name: 'name'
    },
    {
      model_: 'StringProperty',
      name: 'type',
      defaultValue: 'text'
    },
    {
      model_: 'IntProperty',
      name: 'displayWidth',
      defaultValue: 30
    },
    {
      model_: 'BooleanProperty',
      name: 'onKeyMode',
      defaultValue: true
    },
    {
      model_: 'BooleanProperty',
      name: 'autocomplete',
      defaultValue: true
    },
    {
      name: 'data'
    },
    'autocompleter',
    {
      model_: 'ArrayProperty',
      subType: 'MultiLineStringArrayView.RowView',
      name: 'inputs'
    }
  ],

  models: [
    {
      model_: 'Model',
      name: 'RowView',
      extendsModel: 'View',
      properties: [
        'field',
        {
          name: 'tagName',
          defaultValue: 'div'
        }
      ],
      methods: {
        toInnerHTML: function() {
          this.children = [this.field];
          return this.field.toHTML() + '<input type="button" id="' +
            this.on('click', (function(){ this.publish('remove'); }).bind(this)) +
            '" class="multiLineStringRemove" value="X">';
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      var toolbar = ToolbarView.create({
        value: SimpleValue.create(this)
      });
      toolbar.addActions([this.model_.ADD]);
      this.children = [toolbar];

      return '<div id="' + this.id + '"><div></div>' +
        toolbar.toHTML() +
        '</div>';
    },
    initHTML: function() {
      this.SUPER();
      this.data$.addListener(this.update);
      this.update();
    },
    row: function() {
      // TODO: Find a better way to copy relevant values as this is unsustainable.
      var view = this.model_.RowView.create({
        field: this.X.TextFieldView.create({
          name: this.name,
          type: this.type,
          displayWidth: this.displayWidth,
          onKeyMode: this.onKeyMode,
          autocomplete: this.autocomplete,
          autocompleter: this.autocompleter
        })
      });
      return view;
    },
    setValue: function(value) {
      this.value = value;
    }
  },

  listeners: [
    {
      name: 'update',
      code: function() {
        if ( ! this.$ ) return;

        var inputs = this.inputs;
        var inputElement = this.$.firstElementChild;
        var newViews = [];
        var data = this.data;

        // Add/remove rows as necessary.
        if ( inputs.length > data.length ) {
          for ( var i = data.length; i < inputs.length; i++ ) {
            inputs[i].$.remove();
            this.removeChild(inputs[i]);
          }
          inputs.length = data.length;
        } else {
          var extra = "";

          for ( i = inputs.length; i < data.length; i++ ) {
            var view = this.row();

            // TODO: This seems ridiculous.
            this.addChild(view);
            newViews.push(view);
            inputs.push(view);

            view.subscribe('remove', this.onRemove);
            view.field.data$.addListener(this.onInput);
            extra += view.toHTML();
          }

          if ( extra ) inputElement.insertAdjacentHTML('beforeend', extra);
        }

        // Only update the value for a row if it does not match.
        for ( i = 0; i < data.length; i++ ) {
          if ( inputs[i].field.data !== data[i] )
            inputs[i].field.data = data[i];
        }

        this.inputs = inputs;

        for ( i = 0; i < newViews.length; i++ )
          newViews[i].initHTML();
      }
    },
    {
      name: 'onRemove',
      code: function(src) {
        var inputs = this.inputs;
        for ( var i = 0; i < inputs.length; i++ ) {
          if ( inputs[i] === src ) {
            this.data = this.data.slice(0, i).concat(this.data.slice(i+1));
            break;
          }
        }
      }
    },
    {
      name: 'onInput',
      code: function(e) {
        if ( ! this.$ ) return;

        var inputs = this.inputs;
        var newdata = [];

        for ( var i = 0; i < inputs.length; i++ ) {
          newdata.push(inputs[i].field.data);
        }
        this.data = newdata;
      }
    }
  ],

  actions: [
    {
      name: 'add',
      label: 'Add',
      action: function() {
        this.data = this.data.pushF('');
      }
    }
  ]
});


FOAModel({
  extendsModel: 'View',

  name: 'SplitView',

  properties: [
    {
      name:  'view1',
      label: 'View 1'
    },
    {
      name:  'view2',
      label: 'View 2'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      /*
        this.view1 = AlternateView.create();
        this.view2 = AlternateView.create();
      */
      this.view1 = DetailView.create();
      this.view2 = JSView.create();

      this.setValue(SimpleValue.create(""));
    },

    // Sets the Data-Model
    setValue: function(value) {
      this.value = value;
      if ( this.view1 ) this.view1.setValue(value);
      if ( this.view2 ) this.view2.setValue(value);
    },

    set: function(obj) {
      this.value.set(obj);
    },

    get: function() {
      return this.value.get();
    },

    toHTML: function() {
      var str  = [];
      str.push('<table width=80%><tr><td width=40%>');
      str.push(this.view1.toHTML());
      str.push('</td><td>');
      str.push(this.view2.toHTML());
      str.push('</td></tr></table><tr><td width=40%>');
      return str.join('');
    },

    initHTML: function() {
      this.view1.initHTML();
      this.view2.initHTML();
    }
  }
});


FOAModel({
  name: 'ListValueView',
  help: 'Combines an input view with a value view for the edited value.',

  extendsModel: 'View',

  properties: [
    {
      name: 'valueView'
    },
    {
      name: 'inputView'
    },
    {
      name: 'placeholder',
      postSet: function(_, newValue) {
        this.inputView.placeholder = newValue;
      }
    },
    {
      name: 'value',
      factory: function() { return SimpleValue.create({ value: [] }); },
      postSet: function(oldValue, newValue) {
        this.inputView.setValue(newValue);
        this.valueView.value = newValue;
      }
    }
  ],

  methods: {
    focus: function() { this.inputView.focus(); },
    toHTML: function() {
      this.valueView.lastView = this.inputView;
      return this.valueView.toHTML();
    },
    setValue: function(value) {
      this.value = value;
    },
    initHTML: function() {
      this.SUPER();
      this.valueView.initHTML();
    }
  }
});


FOAModel({
  extendsModel: 'View',

  name: 'ListInputView',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'dao',
      help: 'The DAO to fetch autocomplete objects from.',
    },
    {
      name: 'property',
      help: 'The property model to map autocomplete objecst to values with.'
    },
    {
      model_: 'ArrayProperty',
      name: 'searchProperties',
      help: 'The properties with which to construct the autocomplete query with.'
    },
    {
      name: 'autocompleteView',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.unsubscribe('selected', this.selected);
        newValue.subscribe('selected', this.selected);
      }
    },
    {
      name: 'placeholder',
      postSet: function(oldValue, newValue) {
        if ( this.$ && this.usePlaceholer ) this.$.placeholder = newValue;
      }
    },
    {
      model_: 'BooleanValue',
      name: 'usePlaceholder',
      defaultValue: true,
      postSet: function(_, newValue) {
        if ( this.$ ) this.$.placeholder = newValue ?
          this.placeholder : '';
      }
    },
    {
      name: 'value',
      help: 'The array value we are editing.',
      factory: function() {
        return SimpleValue.create({
          value: []
        });
      },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.onValueChange);
        newValue.addListener(this.onValueChange);
      }
    },
    {
      name: 'domInputValue'
    }
  ],

  methods: {
    toHTML: function() {
      this.on('keydown', this.onKeyDown, this.id);
      this.on('blur', this.animate(this.delay(200, this.animate(this.animate(this.onBlur)))), this.id);
      this.on('focus', this.onInput, this.id);

      return '<input name="' + this.name + '" type="text" id="' + this.id + '" class="listInputView">' + this.autocompleteView.toHTML();
    },
    setValue: function(value) {
      this.value = value;
    },
    initHTML: function() {
      this.SUPER();
      if ( this.usePlaceholder && this.placeholder )
        this.$.placeholder = this.placeholder;
      this.autocompleteView.initHTML();
      this.domInputValue = DomValue.create(this.$, 'input');
      this.domInputValue.addListener(this.onInput);
    },
    pushValue: function(v) {
      this.value.set(this.value.get().concat(v));
      this.domInputValue.set('');
      // Previous line doesn't trigger listeners.
      this.onInput();
    },
    popValue: function() {
      var value = this.value.get().slice();
      value.pop();
      this.value.set(value);
    }
  },

  listeners: [
    {
      name: 'selected',
      code: function() {
        if ( this.autocompleteView.value.get() ) {
          this.pushValue(
            this.property.f(this.autocompleteView.value.get()));
        }
      }
    },
    {
      name: 'onInput',
      code: function() {
        var value = this.domInputValue.get();

        if ( value.charAt(value.length - 1) === ',' ) {
          if ( value.length > 1 ) this.pushValue(value.substring(0, value.length - 1));
          else this.domInputValue.set('');
          return;
        }

        if ( value === '' ) {
          this.autocompleteView.dao = [];
          return;
        }

        var predicate = OR();
        value = this.domInputValue.get();
        for ( var i = 0; i < this.searchProperties.length; i++ ) {
          predicate.args.push(STARTS_WITH(this.searchProperties[i], value));
        }
        value = this.value.get();
        if ( value.length > 0 ) {
          predicate = AND(NOT(IN(this.property, value)), predicate);
        }
        this.autocompleteView.dao = this.dao.where(predicate);
      }
    },
    {
      name: 'onKeyDown',
      code: function(e) {
        if ( e.keyCode === 40 /* down */) {
          this.autocompleteView.nextSelection();
          e.preventDefault();
        } else if ( e.keyCode === 38 /* up */ ) {
          this.autocompleteView.prevSelection();
          e.preventDefault();
        } else if ( e.keyCode === 13 /* RET */ || e.keyCode === 9 /* TAB */ ) {
          if ( this.autocompleteView.value.get() ) {
            this.pushValue(
              this.property.f(this.autocompleteView.value.get()));
            e.preventDefault();
          }
        } else if ( e.keyCode === 8 && this.domInputValue.get() === '' ) {
          this.popValue();
        }
      }
    },
    {
      name: 'onBlur',
      code: function(e) {
        var value = this.domInputValue.get();
        if ( value.length > 0 ) {
          this.pushValue(value);
        } else {
          this.domInputValue.set('');
        }
        this.autocompleteView.dao = [];
      }
    },
    {
      name: 'onValueChange',
      code: function() {
        this.usePlaceholder = this.value.get().length == 0;
      }
    }
  ]
});


FOAModel({
  name: 'ArrayTileView',

  extendsModel: 'View',

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'property'
    },
    {
      name: 'tileView'
    },
    {
      name: 'lastView'
    },
    {
      name: 'value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.paint);
        newValue.addListener(this.paint);
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'painting',
      defaultValue: false
    }
  ],

  methods: {
    toHTML: function() {
      this.on('click', this.onClick, this.id);

      return '<ul id="' + this.id + '" class="arrayTileView"><li class="arrayTileLastView">' +
        this.lastView.toHTML() + '</li></ul>';
    },
    initHTML: function() {
      this.SUPER();

      this.lastView.initHTML();
      this.paint();
      this.$.ownerDocument.defaultView.addEventListener('resize', this.layout);
    },
  },

  listeners: [
    {
      // Clicking anywhere in the View should give focus to the
      // lastView.
      name: 'onClick',
      code: function() {
        this.lastView.focus();
      }
    },
    {
      name: 'layout',
      isAnimated: true,
      code: function() {
        if ( ! this.$ ) return;
        var last = this.$.lastChild;
        last.style.width = '100px';
        last.style.width = 100 + last.parentNode.clientWidth -
          (last.offsetWidth + last.offsetLeft) - 4 /* margin */ - 75;
        this.painting = false;
      }
    },
    {
      name: 'paint',
      isAnimated: true,
      code: function() {
        // If we're currently painting, don't actually paint now,
        // queue up another paint on the next animation frame.
        // This doesn't spin infinitely because paint is set to animate: true,
        // meaning that it's merged to the next animation frame.
        if ( this.painting ) {
          this.paint();
          return;
        }

        this.painting = true;
        this.children = [];
        var value = this.value.get();
        var count = value.length;
        var self = this;
        var render = function() {
          while ( self.$.firstChild !== self.$.lastChild ) {
            self.$.removeChild(self.$.firstChild);
          }

          var temp = document.createElement('div');
          temp.style.display = 'None';
          self.$.insertBefore(temp, self.$.lastChild);
          temp.outerHTML = self.children.map(
            function(c) { return '<li class="arrayTileItem">' + c.toHTML() + '</li>'; }).join('');
          self.children.forEach(
            function(c) { c.initHTML(); });
          self.layout();
        };

        if ( value.length == 0 ) {
          render();
        } else {
          self.$.style.display = '';
        }

        for ( var i = 0; i < value.length; i++ ) {
          this.dao.find(EQ(this.property, value[i]), {
            put: function(obj) {
              var view = self.tileView.create();
              view.value.set(obj);
              view.subscribe('remove', self.onRemove);
              self.addChild(view);
              count--;
              if ( count == 0 ) render();
            },
            error: function() {
              // Ignore missing values
              count--;
              if ( count == 0 ) render();
            },
          });
        }
      }
    },
    {
      name: 'onRemove',
      code: function(src, topic, obj) {
        var self = this;
        this.value.set(this.value.get().removeF({
          f: function(o) {
            return o === self.property.f(obj);
          }
        }));
      }
    }
  ]
});


FOAModel({
  name: 'ArrayListView',
  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create([]) },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.update);
        newValue.addListener(this.update);
        this.update();
      }
    },
    {
      name: 'listView'
    },
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.id + '"></div>';
    },
    initHTML: function() {
      this.SUPER();
      this.update();
    },
    setValue: function(value) {
      this.value = value;
    }
  },

  listeners: [
    {
      name: 'update',
      animate: true,
      code: function() {
        if ( ! this.$ ) return;
        this.$.innerHTML = '';

        var objs = this.value.get();
        var children = new Array(objs.length);

        for ( var i = 0; i < objs.length; i++ ) {
          var view = this.listView.create();
          children[i] = view;
          view.value = SimpleValue.create(objs[i]);
        }

        this.$.innerHTML = children.map(function(c) { return c.toHTML(); }).join('');
        children.forEach(function(c) { c.initHTML(); });
      }
    }
  ]
});

FOAModel({
  name: 'KeyView',
  extendsModel: 'View',

  properties: [
    {
      name: 'dao',
      factory: function() { return this.X[this.subType + 'DAO']; }
    },
    { name: 'mode' },
    {
      name: 'data',
      postSet: function(_, value) {
        var self = this;
        var subKey = FOAM.lookup(this.subKey, this.X);
        this.dao.where(EQ(subKey, value)).limit(1).select({
          put: function(o) {
            self.innerData = o;
          }
        });
      }
    },
    {
      name: 'innerData',
    },
    { name: 'subType' },
    {
      name: 'model',
      defaultValueFn: function() { return this.X[this.subType]; }
    },
    { name: 'subKey' },
    {
      name: 'innerView',
      defaultValue: 'DetailView'
    },
  ],

  methods: {
    toHTML: function() {
      this.children = [];
      var view = FOAM.lookup(this.innerView).create({ model: this.model, mode: this.mode, data$: this.innerData$ });
      this.addChild(view);
      return view.toHTML();
    }
  }
});

FOAModel({
  name: 'DAOKeyView',
  extendsModel: 'View',

  properties: [
    {
      name: 'dao',
      factory: function() { return this.X[this.subType + 'DAO']; }
    },
    { name: 'mode' },
    {
      name: 'data',
      postSet: function(_, value) {
        var self = this;
        var subKey = FOAM.lookup(this.subKey, this.X);
        this.innerData = this.dao.where(IN(subKey, value));
      }
    },
    {
      name: 'innerData',
    },
    { name: 'subType' },
    {
      name: 'model',
      defaultValueFn: function() { return this.X[this.subType]; }
    },
    { name: 'subKey' },
    {
      name: 'innerView',
      defaultValue: 'DAOListView'
    },
    'dataView'
  ],

  methods: {
    toHTML: function() {
      this.children = [];
      var view = FOAM.lookup(this.innerView).create({ model: this.model, mode: this.mode, data$: this.innerData$ });
      this.addChild(view);
      return view.toHTML();
    }
  }
});

FOAModel({
  name: 'AutocompleteListView',

  extendsModel: 'View',

  properties: [
    {
      name: 'dao',
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.unlisten(this.paint);
        newValue.listen(this.paint);
        this.value.set('');
        this.paint();
      },
      hidden: true
    },
    {
      name: 'value',
      hidden: true,
      factory: function() { return SimpleValue.create(); }
    },
    {
      name: 'model',
      hidden: true
    },
    {
      name: 'innerView',
      type: 'View',
      preSet: function(_, value) {
        if ( typeof value === "string" ) value = GLOBAL[value];
        return value;
      },
      defaultValueFn: function() {
        return this.model.listView;
      }
    },
    {
      model_: 'ArrayProperty',
      name: 'objs'
    },
    {
      model_: 'IntProperty',
      name: 'selection',
      defaultValue: 0,
      postSet: function(oldValue, newValue) {
        this.value.set(this.objs[newValue]);
        if ( this.$ ) {
          if ( this.$.children[oldValue] )
            this.$.children[oldValue].className = 'autocompleteListItem';
          this.$.children[newValue].className += ' autocompleteSelectedItem';
        }
      }
    },
    {
      model_: 'IntProperty',
      name: 'count',
      defaultValue: 20
    },
    {
      model_: 'IntProperty',
      name: 'left'
    },
    {
      model_: 'IntProperty',
      name: 'top'
    },
  ],

  methods: {
    setValue: function(value) {
      this.value = value;
    },

    initHTML: function() {
      this.SUPER();
      this.$.style.display = 'none';
      var self = this;
      this.propertyValue('left').addListener(function(v) {
        self.$.left = v;
      });
      this.propertyValue('top').addListener(function(v) {
        self.$.top = v;
      });
    },

    nextSelection: function() {
      if ( this.objs.length === 0 ) return;
      var next = this.selection + 1;
      if ( next >= this.objs.length )
        next = 0;
      this.selection = next;
    },

    prevSelection: function() {
      if ( this.objs.length === 0 ) return;
      var next = this.selection - 1;
      if ( next < 0 )
        next = this.objs.length - 1;
      this.selection = next;
    }
  },

  templates: [
    {
      name: 'toHTML',
      template: '<ul class="autocompleteListView" id="<%= this.id %>"></ul>'
    }
  ],

  listeners: [
    {
      name: 'paint',
      isAnimated: true,
      code: function() {
        if ( ! this.$ ) return;

        // TODO Determine if its worth double buffering the dom.
        var objs = [];
        var newSelection = 0;
        var value = this.value.get();
        var self = this;

        this.dao.limit(this.count).select({
          put: function(obj) {
            objs.push(obj);
            if ( obj.id === value.id )
              newSelection = objs.length - 1;
          },
          eof: function() {
            // Clear old list
            self.$.innerHTML = '';
            self.objs = objs;

            if ( objs.length === 0 ) {
              self.$.style.display = 'none';
              return;
            }

            for ( var i = 0; i < objs.length; i++ ) {
              var obj = objs[i];
              var view = self.innerView.create({});
              var container = document.createElement('li');
              container.onclick = (function(index) {
                return function(e) {
                  self.selection = index;
                  self.publish('selected');
                };
              })(i);
              container.className = 'autocompleteListItem';
              self.$.appendChild(container);
              view.value.set(obj);
              container.innerHTML = view.toHTML();
              view.initHTML();
            }

            self.selection = newSelection;
            self.$.style.display = '';
          }
        });
      }
    }
  ]
});


FOAModel({
  name: 'ViewSwitcher',
  extendsModel: 'View',

  help: 'A view which cycles between an array of views.',

  properties: [
    {
      name: 'views',
      factory: function() { return []; },
      postSet: function() {
        this.viewIndex = this.viewIndex;
      },
    },
    {
      name: 'value',
      postSet: function(old, nu) {
        this.activeView.value = nu;
      }
    },
    {
      name: 'activeView',
      postSet: function(old, nu) {
        if ( old ) {
          old.unsubscribe('nextview', this.onNextView);
          old.unsubscribe('prevview', this.onPrevView);
        }
        nu.subscribe('nextview', this.onNextView);
        nu.subscribe('prevview', this.onPrevView);
        if ( this.value ) nu.value = this.value;
      }
    },
    {
      model_: 'IntProperty',
      name: 'viewIndex',
      preSet: function(_, value) {
        if ( value >= this.views.length ) return 0;
        if ( value < 0 ) return this.views.length - 1;
        return value;
      },
      postSet: function() {
        this.activeView = this.views[this.viewIndex];
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.id + '" style="display:none"></div>' + this.toInnerHTML();
    },

    updateHTML: function() {
      if ( ! this.$ ) return;
      this.$.nextElementSibling.outerHTML = this.toInnerHTML();
      this.initInnerHTML();
    },

    toInnerHTML: function() {
      return this.activeView.toHTML();
    },

    initInnerHTML: function() {
      this.activeView.initInnerHTML();
    }
  },

  listeners: [
    {
      name: 'onNextView',
      code: function() {
        this.viewIndex = this.viewIndex + 1;
        this.updateHTML();
      }
    },
    {
      name: 'onPrevView',
      code: function() {
        this.viewIndex = this.viewIndex - 1;
        this.updateHTML();
      }
    }
  ]
});


FOAModel({
  name: 'PredicatedView',
  extendsModel: 'View',

  properties: [
    {
      name: 'predicate',
      defaultValueFn: function() { return TRUE; },
      postSet: function() { this.updateDAO(); }
    },
    {
      name: 'data',
      help: 'Payload of the view; assumed to be a DAO.',
      postSet: function() { this.updateDAO(); }
    },
    {
      name: 'view',
      required: true
    }
  ],

  methods: {
    init: function() {
      if ( typeof this.view === 'string' )
        this.view = FOAM.lookup(this.view);
      // Necessary for events and other things that walk the view tree.
      this.children = [this.view];
    },
    toHTML: function() {
      return this.view.toHTML();
    },
    initHTML: function() {
      this.view.initHTML();
    },
    updateDAO: function() {
      if ( this.data && this.data.where )
        this.view.data = this.data.where(this.predicate);
    }
  }
});


FOAModel({
  name: 'DAOListView',
  extendsModel: 'View',

  properties: [
    {
      name: 'dao',
      postSet: function(oldDAO, newDAO) {
        this.X.DAO = newDAO;
        if ( oldDAO ) oldDAO.unlisten(this.onDAOUpdate);
        if ( ! this.hidden ) {
          newDAO.listen(this.onDAOUpdate);
          this.updateHTML();
        }
      }
    },
    {
      name: 'hidden',
      postSet: function(old, nu) {
        if ( ! this.dao ) return;
        if ( nu ) this.dao.unlisten(this.onDAOUpdate);
        else {
          this.dao.listen(this.onDAOUpdate);
          this.updateHTML();
        }
      }
    },
    {
      name: 'data',
      setter: function(value) {
        this.value = SimpleValue.create(value);
      }
    },
    {
      name: 'value',
      setter: function(value) {
        this.dao = value.value;
        value.addListener(function() { this.dao = value.value; }.bind(this));
      }
    },
    { name: 'rowView', defaultValue: 'DetailView' },
    {
      name: 'mode',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); }
      }
    },
    { model_: 'BooleanProperty', name: 'useSelection', defaultValue: false },
    'selection',
    {
      name: 'scrollContainer',
      help: 'Containing element that is responsible for scrolling.'
    },
    {
      name: 'chunkSize',
      defaultValue: 0,
      help: 'Number of entries to load in each infinite scroll chunk.'
    },
    {
      name: 'chunksLoaded',
      hidden: true,
      defaultValue: 1,
      help: 'The number of chunks currently loaded.'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.X = this.X.sub();

      var self = this;
      this.subscribe(this.ON_HIDE, function() {
        self.hidden = true;
      });

      this.subscribe(this.ON_SHOW, function() {
        self.hidden = false;
      });
    },

    initHTML: function() {
      // this.SUPER();

      // If we're doing infinite scrolling, we need to find the container.
      // Either an overflow: scroll element or the window.
      // We keep following the parentElement chain until we get null.
      if ( this.chunkSize > 0 ) {
        var e = this.$;
        while ( e ) {
          if ( window.getComputedStyle(e).overflow === 'scroll' ) break;
          e = e.parentElement;
        }
        this.scrollContainer = e || window;
        e.addEventListener('scroll', this.onScroll, false);
      }

      if ( ! this.hidden ) this.updateHTML();
    },

    updateHTML: function() {
      if ( ! this.dao || ! this.$ ) return;
      if ( this.painting ) return;
      this.painting = true;

      var out = [];
      var rowView = FOAM.lookup(this.rowView);

      this.children = [];
      this.initializers_ = [];

      var d = this.dao;
      if ( this.chunkSize ) {
        d = d.limit(this.chunkSize * this.chunksLoaded);
      }
      d.select({put: function(o) {
        if ( this.mode === 'read-write' ) o = o.clone();
        var view = rowView.create({value: SimpleValue.create(o), model: o.model_}, this.X);
        // TODO: Something isn't working with the Context, fix
        view.DAO = this.dao;
        if ( this.mode === 'read-write' ) {
          o.addListener(function() {
            this.dao.put(o);
          }.bind(this, o));
        }
        this.addChild(view);
        if ( this.useSelection ) {
          out.push('<div class="' + this.className + ' row' + '" id="' + this.on('click', (function() {
            this.selection = o
          }).bind(this)) + '">');
        }
        out.push(view.toHTML());
        if ( this.useSelection ) {
          out.put('</div>');
        }
      }.bind(this)})(function() {
        var e = this.$;

        if ( ! e ) return;

        e.innerHTML = out.join('');
        this.initInnerHTML();
        this.children = [];
        this.painting = false;
      }.bind(this));
    }
  },

  listeners: [
    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function() { this.updateHTML(); }
    },
    {
      name: 'onScroll',
      code: function() {
        var e = this.scrollContainer;
        if ( this.chunkSize > 0 && e.scrollTop + e.offsetHeight >= e.scrollHeight ) {
          this.chunksLoaded++;
          this.updateHTML();
        }
      }
    }
  ]
});


FOAModel({
  name: 'TouchListView',

  extendsModel: 'View',

  properties: [
    {
      model_: 'DAOProperty',
      name: 'dao'
    },
    {
      name: 'model'
    },
    {
      // TODO: Can we calculate this reliably?
      model_: 'IntProperty',
      name: 'rowViewHeight'
    },
    {
      model_: 'IntProperty',
      name: 'height'
    },
    {
      model_: 'IntProperty',
      name: 'scrollTop',
      defaultValue: 0,
      preSet: function(_, v) {
        if ( v < 0 ) return 0;
        return v;
      },
      postSet: function(old, nu) {
        this.scroll();
      }
    },
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.dao.listen(this.scroll);
    },
    toHTML: function() {
      var id = this.id;
      var overlay = this.nextID();
      var touch = this.X.TouchInput;
      touch.subscribe(touch.TOUCH_START, this.onTouchStart);
      touch.subscribe(touch.TOUCH_END, this.onTouchEnd);

      return '<div id="' + this.id + '" style="height:' + this.height + 'px;overflow:hidden;"><div id="' + overlay + '" style="z-index:1;position:absolute;height:' + this.height + ';width:100%"></div><div></div></div>';
    },
    formatObject: function(o) {
      var out = "";
      for ( var i = 0, prop; prop = this.model.properties[i]; i++ ) {
        if ( prop.summaryFormatter )
          out += prop.summaryFormatter(prop.f(o), o);
        else out += this.strToHTML(prop.f(o));
      }
      return out;
    },
    initHTML: function() {
      this.SUPER();
      this.scroll();
    }
  },

  listeners: [
    {
      name: 'scroll',
      code: function() {
        if ( ! this.$ ) return;

        var offset = -(this.scrollTop % this.rowViewHeight);
        var limit = Math.floor(this.height / this.rowViewHeight) + 2;
        var skip = Math.floor(this.scrollTop / this.rowViewHeight);
        var self = this;
        this.dao.skip(skip).limit(limit).select()(function(objs) {
          var out = "";
          for ( var i = 0; i < objs.length; i++ ) {
            out += '<div style="height:' + self.rowViewHeight + 'px;overflow:hidden">';
            out += self.formatObject(objs[i]);
            out += '</div>';
          }
          self.$.lastElementChild.innerHTML = out;
          self.$.lastElementChild.style.webkitTransform = "translate3d(0px, " + offset + "px, 0px)";
        });
      }
    },
    {
      name: 'onTouchStart',
      code: function(_, _, touch) {
        if ( ! this.touch ) this.touch = touch;
        var self = this;
        this.touch.y$.addListener(function(_, _, old, nu) {
          self.scrollTop = self.scrollTop + old - nu;
        });
      }
    },
    {
      name: 'onTouchEnd',
      code: function(_, _, touch) {
        if ( touch.id === this.touch.id ) {
          this.touch = '';
        }
      }
    },
  ]
});



FOAModel({
  name: 'UITestResultView',
  label: 'UI Test Result View',

  extendsModel: 'View',

  properties: [
    {
      name: 'data'
    }
  ],

  methods: {
    initHTML: function() {
      var parent = this.parent;
      var test   = parent.obj;
      var $ = this.$;
      test.append = function(s) { $.insertAdjacentHTML('beforeend', s); };
      test.scope.render = function(v) {
        test.append(v.toHTML());
        v.initHTML();
      };
      // Temporarily remove sub-tests to prevent them from being tested also.
      // This means, that unlike regular UnitTests, UITests do not inherit
      // variables from their ancestors.
      var oldTests = test.tests;
      test.tests = [];
      test.test();
      test.tests = oldTests;
    }
  }
});


FOAModel({
  name: 'UITest',
  label: 'UI Test',

  extendsModel: 'UnitTest',

  properties: [
    {
      name: 'results',
      view: 'UITestResultView'
    }
  ],

  /*
  actions: [
    {
      name: 'test',
      action: function(obj) { }
    }
  ],
  */

  methods: {
    //atest: function() { return aconstant('output'); },
  }
});

FOAModel({
  name: 'TwoModeTextFieldView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      postSet: function(_, value) {
        if ( this.$ ) this.$.textContent = value || this.placeholder;
      }
    },
    {
      name: 'placeholder'
    },
    { name: 'editView' },
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.editView = this.X.FullScreenTextFieldView.create(args);
    },
    initHTML: function() {
      this.SUPER();
      this.data = this.data;
    }
  },

  templates: [
    function toHTML() {/*
    <div id="<%= this.id %>" <%= this.cssClassAttr() %>></div>
    <%
      this.on('click', this.onClick, this.id);
      this.setClass('placeholder', (function() { return ! this.data }).bind(this), this.id);
    %>
    */}
  ],

  listeners: [
    {
      name: 'onClick',
      code: function() {
        this.editView.data = this.data;
        this.X.stack.pushView(this.editView);
        this.editView.data$.addListener(this.onDataSet);
      }
    },
    {
      name: 'onDataSet',
      code: function() {
        this.editView.data$.removeListener(this.onDataSet);
        this.data = this.editView.data;
        this.X.stack.back();
      }
    }
  ]
});

FOAModel({
  name: 'FullScreenTextFieldView',
  extendsModel: 'View',

  properties: [
    'data',
    'softData',
    'autocompleter',
    { model_: 'BooleanProperty', name: 'autocomplete', defaultValue: true },
    'autocompleteView',
    'placeholder',
    'domValue'
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      var input = this.$.firstElementChild;

      if ( this.placeholder ) input.placeholder = this.placeholder;

      this.domValue = DomValue.create(input, 'input');

      Events.follow(this.data$, this.softData$);

      Events.relate(
        this.softData$,
        this.domValue,
        this.valueToText.bind(this),
        this.textToValue.bind(this));

      input.addEventListener('keydown', this.onKeyDown);
    },
    focus: function() { this.$.firstElementChild.focus(); },
    valueToText: function(value) { return value; },
    textToValue: function(text) { return text; },
  },

  templates: [
    function toHTML() {/*
      <div class="fullScreenTextFieldView" id="{{this.id}}">
        <input type="text">
        <div class="fullScreenTextFieldView-autocomplete"><%=
          (this.autocompleteView = this.X.DAOListView.create({
            mode: 'final',
            rowView: 'SummaryView',
            useSelection: true
          }))
        %></div>
      </div>
    */}
  ],

  listeners: [
    {
      name: 'onKeyDown',
      code: function(e) {
        if ( e.keyCode === 13 /* ENTER */ ) {
          this.data = this.softData;
        }
      }
    }
  ]
});

FOAModel({
  name: 'SlidePanelView',
  help: 'A controller that shows a main view with a small strip of the ' +
      'secondary view visible at the right edge. This "panel" can be dragged ' +
      'by a finger or mouse pointer to any position from its small strip to ' +
      'fully exposed. If the containing view is wide enough, both panels ' +
      'will be always visible.',
  extendsModel: 'View',

  properties: [
    'mainView', 'panelView',
    {
      name: 'minWidth',
      defaultValueFn: function() {
        var e = this.main$();
        return e ?
            toNum(this.X.window.getComputedStyle(e).width) :
            300;
      }
    },
    {
      name: 'width',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, x) {
        this.main$().style.width = x + 'px';
      }
    },
    {
      name: 'minPanelWidth',
      defaultValueFn: function() {
        if ( this.panelView && this.panelView.minWidth )
          return this.panelView.minWidth;
        var e = this.panel$();
        return e ?
            toNum(this.X.window.getComputedStyle(e).width) :
            250;
      }
    },
    {
      name: 'panelWidth',
      hidden: true,
      help: 'Set internally by the resize handler',
      postSet: function(_, x) {
        this.panel$().style.width = x + 'px';
      }
    },
    {
      name: 'parentWidth',
      help: 'A pseudoproperty that returns the current with (CSS pixels) of the containing element',
      getter: function() {
        return toNum(this.X.window.getComputedStyle(this.$.parentNode).width);
      }
    },
    {
      name: 'stripWidth',
      help: 'The width in (CSS) pixels of the minimal visible strip of panel',
      defaultValue: 30
    },
    {
      name: 'panelRatio',
      help: 'The ratio (0-1) of the total width occupied by the panel, when ' +
          'the containing element is wide enough for expanded view.',
      defaultValue: 0.5
    },
    {
      name: 'panelX',
      //defaultValueFn: function() { this.width - this.stripWidth; },
      preSet: function(_, x) {
        // Bound it between its left and right limits: full open and just the
        // strip.
        if ( x <= this.parentWidth - this.panelWidth ) {
          return this.parentWidth - this.panelWidth;
        } else if ( x >= this.parentWidth - this.stripWidth ) {
          return this.parentWidth - this.stripWidth;
        }
        return x;
      },
      postSet: function(_, x) {
        this.panel$().style.webkitTransform = 'translate3d(' + x + 'px, 0,0)';
      }
    },
    'dragging',
    'firstDragX', 'oldPanelX',
    'expanded'
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.id + '" ' +
          'style="display: inline-block; position: relative; height: 100%">' +
          '<div id="' + this.id + '-main" style="height:100%">' +
              this.mainView.toHTML() +
          '</div>' +
          '<div id="' + this.id + '-panel" style="height:100%; position: absolute; top: 0; left: 0">' +
              this.panelView.toHTML() +
          '</div>' +
          '</div>';
    },

    initHTML: function() {
      this.SUPER();

      // Mousedown and touch events on the sliding panel itself.
      // Mousemove and mouseup on the whole window, so that you can drag the
      // cursor off the slider and have it still following until you release the mouse.
      this.panel$().addEventListener('mousedown', this.onMouseDown);
      this.panel$().addEventListener('touchstart', this.onTouchStart);
      this.panel$().addEventListener('touchmove', this.onTouchMove);
      this.panel$().addEventListener('touchend', this.onTouchEnd);

      this.X.document.addEventListener('mousemove', this.onMouseMove);
      this.X.document.addEventListener('mouseup', this.onMouseUp);

      // Resize first, then init the outer view, and finally the panel view.
      this.X.window.addEventListener('resize', this.onResize);
      this.onResize();
      this.mainView.initHTML();
      this.panelView.initHTML();
    },

    main$: function() {
      return this.X.window.document.getElementById(this.id + '-main');
    },
    panel$: function() {
      return this.X.window.document.getElementById(this.id + '-panel');
    }
  },

  listeners: [
    {
      name: 'onResize',
      isAnimated: true,
      code: function(e) {
        if ( ! this.$ ) return;
        if ( this.parentWidth >= this.minWidth + this.minPanelWidth ) {
          // Expanded mode. Show the two side by side, setting their widths
          // based on the panelRatio.
          this.panelWidth = Math.max(this.panelRatio * this.parentWidth, this.minPanelWidth);
          this.width = this.parentWidth - this.panelWidth;
          this.panelX = this.width;
          this.expanded = true;
        } else {
          this.width = Math.max(this.parentWidth - this.stripWidth, this.minWidth);
          this.panelWidth = this.minPanelWidth;
          this.panelX = this.width;
          this.expanded = false;
        }
      }
    },
    {
      name: 'onMouseDown',
      code: function(e) {
        if ( this.expanded ) return;
        this.firstDragX = e.clientX;
        this.oldPanelX = this.panelX;
        this.dragging = true;
        // Stop propagation so that only the uppermost panel is dragged, if
        // they are nested.
        e.stopPropagation();
      }
    },
    {
      name: 'onTouchStart',
      code: function(e) {
        if ( this.expanded ) return;
        if ( e.touches.length > 1 ) return;
        var t = e.touches[0];
        this.firstDragX = e.touches[0].clientX;
        this.oldPanelX = this.panelX;
        this.dragging = true;
        e.stopPropagation();
        e.preventDefault();
      }
    },
    {
      name: 'onMouseMove',
      code: function(e) {
        if ( this.expanded ) return;
        if ( ! this.dragging ) return;
        e.preventDefault(); // Necessary to make browser handle this nicely.
        var dx = e.clientX - this.firstDragX;
        this.panelX = this.oldPanelX + dx;
      }
    },
    {
      name: 'onTouchMove',
      code: function(e) {
        if ( this.expanded ) return;
        if ( ! this.dragging ) return;
        e.preventDefault();
        var dx = e.touches[0].clientX - this.firstDragX;
        this.panelX = this.oldPanelX + dx;
      }
    },
    {
      name: 'onMouseUp',
      code: function(e) {
        if ( this.expanded ) return;
        this.dragging = false;
      }
    },
    {
      name: 'onTouchEnd',
      code: function(e) {
        if ( this.expanded ) return;
        this.dragging = false;
      }
    }
  ]
});

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
FOAModel({
  name: 'AbstractChoiceView',

  extendsModel: 'View',

  properties: [
    // This is the real, final choice. The internals use index only.
    // When useSelection is enabled, data is not set until a final choice is made.
    {
      model_: 'BooleanProperty',
      name: 'autoSetData',
      help: 'If true, this.data is set when choices update and the current data is not one of the choices.',
      defaultValue: true
    },
    {
      name: 'data',
      help: 'The value of the current choice (ie. [value, label] -> value).',
      postSet: function(_, d) {
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.choices[i][0] === d ) {
            if ( this.index !== i ) this.index = i;
            return;
          }
        }
      }
    },
    {
      name: 'label',
      help: 'The label of the current choice (ie. [value, label] -> label).',
      postSet: function(_, d) {
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          if ( this.choices[i][1] === d ) {
            if ( this.index !== i ) this.index = i;
            return;
          }
        }
      }
    },
    // See above; choice works the same as data.
    {
      name: 'choice',
      help: 'The current choice (ie. [value, label]).',
      getter: function() {
        var value = this.data;
        for ( var i = 0 ; i < this.choices.length ; i++ ) {
          var choice = this.choices[i];
          if ( value === choice[0] ) return choice;
        }
        return undefined;
      },
      setter: function(choice) {
        var oldValue = this.choice;
        this.data = choice[0];
        this.label = choice[1];
        this.propertyChange('choice', oldValue, this.choice);
      }
    },
    {
      name:  'choices',
      type:  'Array[StringField]',
      help: 'Array of [value, label] choices.  Simple String values will be upgraded to [value, value].',
      defaultValue: [],
      preSet: function(_, a) {
        a = a.clone();
        // Upgrade single values to [value, value]
        for ( var i = 0 ; i < a.length ; i++ )
          if ( ! Array.isArray(a[i]) )
            a[i] = [a[i], a[i]];
        return a;
      },
      postSet: function(_, newValue) {
        var value = this.data;

        // Update current choice when choices update.
        for ( var i = 0 ; i < newValue.length ; i++ ) {
          var choice = newValue[i];

          if ( value === choice[0] ) {
            if ( this.useSelection ) this.index = i;
            else this.choice = choice;
            break;
          }
        }

        if ( this.autoSetData && i === newValue.length ) {
          if ( this.useSelection ) this.index = 0;
          else this.data = newValue.length ? newValue[0][0] : undefined;
        }

        if ( this.$ ) this.updateHTML();
      }
    },
    // The authoritative selection internally. data and choice are outputs when
    // useSelection is enabled.
    {
      name: 'index',
      help: 'The index of the current choice.',
      preSet: function(_, i) {
        if ( i < 0 || this.choices.length == 0 ) return 0;
        if ( i >= this.choices.length ) return this.choices.length - 1;
        return i;
      },
      postSet: function(_, i) {
        // If useSelection is enabled, don't update data or choice.
        if ( this.useSelection ) return;
        if ( this.data !== this.choices[i][0] ) this.data = this.choices[i][0];
      }
    },
    {
      model_: 'FunctionProperty',
      name: 'objToChoice',
      help: 'A Function which adapts an object from the DAO to a [key, value, ...] choice.'
    },
    {
      name: 'useSelection',
      help: 'When set, data and choice do not update until an entry is firmly selected',
      model_: 'BooleanProperty'
    },
    {
      name: 'dao',
      postSet: function(oldDAO, dao) {
        if ( oldDAO ) {
          oldDAO.unlisten(this.onDAOUpdate);
        }
        if ( dao && this.$ ) {
          dao.listen(this.onDAOUpdate);
          this.onDAOUpdate();
        }
      }
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isMerged: 100,
      code: function() {
        this.dao.select(MAP(this.objToChoice))(function(map) {
          // console.log('***** Update Choices ', map.arg2, this.choices);
          this.choices = map.arg2;
        }.bind(this));
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();

      this.dao = this.dao;
    },

    findChoiceIC: function(name) {
      name = name.toLowerCase();
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        if ( this.choices[i][1].toLowerCase() == name )
          return this.choices[i];
      }
    },

    commit: function() {
      if ( ! this.useSelection ) return;
      this.choice = this.choices[this.index];
    }
  }
});


FOAModel({
  name:  'ChoiceListView',

  extendsModel: 'AbstractChoiceView',

  properties: [
    {
      name: 'orientation',
      defaultValue: 'horizontal',
      view: {
        model_: 'ChoiceView',
        choices: [
          [ 'horizontal', 'Horizontal' ],
          [ 'vertical',   'Vertical'   ]
        ]
      },
      postSet: function(old, nu) {
        if ( this.$ ) {
          DOM.setClass(this.$, old, false);
          DOM.setClass(this.$, nu);
        }
      }
    },
    {
      name: 'className',
      defaultValueFn: function() { return 'foamChoiceListView ' + this.orientation; }
    },
    {
      name: 'tagName',
      defaultValue: 'ul'
    },
    {
      name: 'innerTagName',
      defaultValue: 'li'
    }
  ],

  listeners: [
    {
      name: 'updateSelected',
      code: function() {
        if ( ! this.$ || ! this.$.children ) return;
        for ( var i = 0 ; i < this.$.children.length ; i++ ) {
          var c = this.$.children[i];
          DOM.setClass(c, 'selected', i === this.index);
        }
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      // Doing this at the low level rather than with this.setClass listeners
      // to avoid creating loads of listeners when autocompleting or otherwise
      // rapidly changing this.choices.
      this.index$.addListener(this.updateSelected);
      this.choices$.addListener(this.updateSelected);
    },
    choiceToHTML: function(id, choice) {
      return '<' + this.innerTagName + ' id="' + id + '" class="choice">' +
          choice[1] + '</' + this.innerTagName + '>';
    },
    toInnerHTML: function() {
      var out = [];
      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        this.on(
          'click',
          function(index) {
            this.choice = this.choices[index];
          }.bind(this, i),
          id);

        out.push(this.choiceToHTML(id, choice));
      }
      return out.join('');
    },

    initHTML: function() {
      this.SUPER();
      this.updateSelected();
    },

    scrollToSelection: function() {
      // Three cases: in view, need to scroll up, need to scroll down.
      // First we determine the parent's scrolling bounds.
      var e = this.$.children[this.index];
      if ( ! e ) return;
      var parent = e.parentElement;
      while ( parent ) {
        var overflow = this.X.window.getComputedStyle(parent).overflow;
        if ( overflow === 'scroll' || overflow === 'auto' ) {
          break;
        }
        parent = parent.parentElement;
      }
      parent = parent || this.X.window;

      if ( e.offsetTop < parent.scrollTop ) { // Scroll up
        e.scrollIntoView(true);
      } else if ( e.offsetTop + e.offsetHeight >=
          parent.scrollTop + parent.offsetHeight ) { // Down
        e.scrollIntoView();
      }
    }
  }
});


FOAModel({
  name:  'ChoiceView',

  extendsModel: 'AbstractChoiceView',

  /*
   * <select size="">
   *    <choice value="" selected></choice>
   * </select>
   */
  properties: [
    {
      name:  'name',
      type:  'String',
      defaultValue: 'field'
    },
    {
      name:  'helpText',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'size',
      type:  'int',
      defaultValue: 1
    }
  ],

  methods: {
    toHTML: function() {
      return '<select id="' + this.id + '" name="' + this.name + '" size=' + this.size + '/></select>';
    },

    updateHTML: function() {
      var out = [];

      if ( this.helpText ) {
        out.push('<option disabled="disabled">');
        out.push(this.helpText);
        out.push('</option>');
      }

      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();

        try {
          this.on('click', this.onClick, id);
          this.on('mouseover', this.onMouseOver, id);
          this.on('mouseout', this.onMouseOut, id);
        } catch (x) {
          // Fails on iPad, which is okay, because this feature doesn't make
          // sense on the iPad anyway.
        }

        out.push('\t<option id="' + id + '"');

        if ( choice[0] === this.data ) out.push(' selected');
        out.push(' value="');
        out.push(i + '">');
        out.push(choice[1].toString());
        out.push('</option>');
      }

      this.$.innerHTML = out.join('');
      View.getPrototype().initHTML.call(this);
    },

    initHTML: function() {
      this.SUPER();

      var e = this.$;

      this.updateHTML();
      this.domValue = DomValue.create(e);
      Events.link(this.index$, this.domValue);
    }
  },

  listeners: [
    {
      name: 'onMouseOver',
      code: function(e) {
        if ( this.timer_ ) this.X.clearTimeout(this.timer_);
        this.prev = ( this.prev === undefined ) ? this.data : this.prev;
        this.index = e.target.value;
      }
    },
    {
      name: 'onMouseOut',
      code: function(e) {
        if ( this.timer_ ) this.X.clearTimeout(this.timer_);
        this.timer_ = this.X.setTimeout(function() {
          this.data = this.prev || '';
          this.prev = undefined;
        }.bind(this), 1);
      }
    },
    {
      name: 'onClick',
      code: function(e) {
        this.data = this.prev = this.choices[e.target.value][0];
      }
    }
  ]
});


FOAModel({
  name:  'RadioBoxView',

  extendsModel: 'ChoiceView',

  methods: {
    toHTML: function() {
      return '<span id="' + this.id + '"/></span>';
    },

    updateHTML: function() {
      var out = '';
      var self = this;
      this.choices.forEach(function(choice) {
        var value  = choice[0];
        var label  = choice[1];
        var id     = self.nextID();

        out += label + ':<input type="radio" name="';
        out += self.id;
        out += '" value="';
        out += value;
        out += '" ';
        out += 'id="' + id + '"';
        if ( self.data === value ) out += ' checked';
        out += '> ';

        self.on('click', function() { self.data = value; }, id)
        self.data$.addListener(function() { $(id).checked = ( self.data == value ); });
      });

      this.$.innerHTML = out;
      View.getPrototype().initHTML.call(this);
    },

    initHTML: function() {
      this.SUPER();

      Events.dynamic(function() { this.choices; }.bind(this), this.updateHTML.bind(this));
    }
  }
});


FOAModel({
  name:  'PopupChoiceView',

  extendsModel: 'AbstractChoiceView',

  properties: [
    {
      name: 'linkLabel'
    },
    {
      name: 'iconUrl'
    },
    {
      name: 'tagName',
      defaultValue: 'button'
    },
    {
      name: 'className',
      defaultValue: 'popupChoiceView'
    },
    {
      model_: 'BooleanProperty',
      name: 'showValue'
    }
  ],

  listeners: [
    {
      name: 'popup',
      code: function(e) {
        var view = this.X.ChoiceListView.create({
          className: 'popupChoiceList',
          data: this.data,
          choices: this.choices,
          autoSetData: this.autoSetData
        });

        // I don't know why the 'animate' is required, but it sometimes
        // doesn't remove the view without it.
        view.data$.addListener(EventService.animate(function() {
          this.data = view.data;
          if ( view.$ ) view.$.remove();
        }.bind(this), this.X));

        var pos = findPageXY(this.$.querySelector('.action'));
        var e = this.X.document.body.insertAdjacentHTML('beforeend', view.toHTML());
        var s = this.X.window.getComputedStyle(view.$);
        var parentNode = view.$.parentNode;

        view.$.style.top = pos[1]-2;
        view.$.style.left = pos[0]-toNum(s.width)+30;
        view.$.style.maxHeight = Math.max(200, this.X.window.innerHeight-pos[1]-10);
        view.initHTML();
        view.$.addEventListener('click', function() { if ( view.$ ) view.$.remove(); });
        parentNode.addEventListener('mousemove', function(evt) {
          if ( ! view.$ ) {
            parentNode.removeEventListener('mousemove', arguments.callee);
          } else if ( ! view.$.contains(evt.target) ) {
            parentNode.removeEventListener('mousemove', arguments.callee);
            view.$.remove();
          }
        });
      }
    }
  ],

  methods: {
    toInnerHTML: function() {
      var out = '';

      if ( this.showValue ) {
        var id = this.nextID();
        out += '<span id="' + id + '" class="value">' + (this.choice[1] || '') + '</span>';
        this.data$.addListener(function() { this.X.$(id).innerHTML = this.choice[1]; }.bind(this));
      }

      out += '<span class="action">';
      if ( this.iconUrl ) {
        out += '<img src="' + XMLUtil.escapeAttr(this.iconUrl) + '">';
      }

      if ( this.linkLabel ) {
        out += this.linkLabel;
      }
      out += '</span>';

      return out;
    },

    initHTML: function() {
      this.SUPER();
      this.$.addEventListener('click', this.popup);
    }
  }
});

FOAModel({
  name: 'DetailView',
  extendsModel: 'View',

  properties: [
    {
      // TODO: remove 'value' and make this the real source of data
      name:  'data',
      getter: function() { return this.value.value; },
      setter: function(data) { this.value = SimpleValue.create(data); }
    },
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        if ( oldValue ) oldValue.removeListener(this.onValueChange);
        if ( newValue ) newValue.addListener(this.onValueChange);
        this.onValueChange();
      }
    },
    {
      name:  'model',
      type:  'Model',
      postSet: function(_, m) {
        if ( this.$ ) {
          this.children = [];
          this.$.outerHTML = this.toHTML();
          this.initHTML();
        }
      }
    },
    {
      name: 'title',
      defaultValueFn: function() { return "Edit " + this.model.label; }
    },
    {
      name: 'obj',
      getter: function() { return this.value.value; }
    },
    {
      model_: 'BooleanProperty',
      name: 'showActions',
      defaultValue: false,
      postSet: function(old, nu) {
        // TODO: No way to remove the decorator.
        if ( nu ) {
          this.addDecorator(this.X.ActionBorder.create());
        }
      }
    },
    {
      model_: 'StringProperty',
      name: 'mode',
      defaultValue: 'read-write'
    }
  ],

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        // TODO: Allow overriding of listeners
        this.onValueChange_.apply(this, arguments);

        if ( this.obj && this.obj.model_ ) this.model = this.obj.model_;
        if ( this.$ ) this.updateSubViews();
      }
    },
    {
      name: 'onKeyboardShortcut',
      code: function(evt) {
        var action = this.keyMap_[this.evtToKeyCode(evt)];
        if ( action ) action.callIfEnabled(this.obj);
      }
    }
  ],

  methods: {
    onValueChange_: function() {
    },

    bindSubView: function(view, prop) {
      if ( this.get() ) {
        // TODO: setValue is deprecated
        if ( view.setValue ) {
          view.setValue(this.get().propertyValue(prop.name));
        } else {
          view.value = this.get().propertyValue(prop.name);
        }
      }
    },

    viewModel: function() { return this.model; },

    getValue: function() { return this.value; },

    setValue: function (value) {
      if ( this.getValue() ) {
        // todo:
        /// getValue().removeListener(???)
      }
      this.value = value;
      this.updateSubViews();
      // TODO: model this class and make updateSubViews a listener
      // instead of bind()'ing
      value.addListener(this.updateSubViews.bind(this));
    },

    createTemplateView: function(name, opt_args) {
      var o = this.viewModel()[name];
      if ( o ) return Action.isInstance(o) ?
        this.createActionView(o, this.value, opt_args) :
        this.createView(o, opt_args) ;

      return this.SUPER(name, opt_args);
    },

    titleHTML: function() {
      var title = this.title;

      return title ?
        '<tr><th colspan=2 class="heading">' + title + '</th></tr>' :
        '';
    },

    startColumns: function() { return '<tr><td colspan=2><table valign=top><tr><td valign=top><table>'; },
    nextColumn:   function() { return '</table></td><td valign=top><table valign=top>'; },
    endColumns:   function() { return '</table></td></tr></table></td></tr>'; },

    rowToHTML: function(prop, view) {
      var str = "";

      if ( prop.detailViewPreRow ) str += prop.detailViewPreRow(this);

      str += '<tr class="detail-' + prop.name + '">';
      if ( view.model_ === DAOController ) {
        str += "<td colspan=2><div class=detailArrayLabel>" + prop.label + "</div>";
        str += view.toHTML();
        str += '</td>';
      } else {
        str += "<td class='label'>" + prop.label + "</td>";
        str += '<td>';
        str += view.toHTML();
        str += '</td>';
      }
      str += '</tr>';

      if ( prop.detailViewPostRow ) str += prop.detailViewPostRow(this);

      return str;
    },

    // If the Model supplies a toDetailHTML method, then use it instead.
    toHTML: function() { return (this.model.getPrototype().toDetailHTML || this.defaultToHTML).call(this); },

    defaultToHTML: function() {
      this.children = [];
      var model = this.model;
      var str  = "";

      str += '<div id="' + this.id + '" class="detailView" name="form">';
      str += '<table>';
      str += this.titleHTML();

      for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.hidden ) continue;

        str += this.rowToHTML(prop, this.createView(prop));
      }

      str += '</table>';
      str += '</div>';

      return str;
    },

    initHTML: function() {
      this.SUPER();

      // hooks sub-views upto sub-models
      this.updateSubViews();
      this.initKeyboardShortcuts();
    },

    set: function(obj) {
      this.getValue().set(obj);
    },

    get: function() {
      return this.getValue().get();
    },

    evtToKeyCode: function(evt) {
      var s = '';
      if ( evt.ctrlKey ) s += 'ctrl-';
      if ( evt.shiftKey ) s += 'shift-';
      s += evt.keyCode;
      return s;
    },

    initKeyboardShortcuts: function() {
      var keyMap = {};
      var found = false;
      for ( var i = 0 ; i < this.model.actions.length ; i++ ) {
        var action = this.model.actions[i];
        for ( var j = 0 ; j < action.keyboardShortcuts.length ; j++ ) {
          var key = action.keyboardShortcuts[j];
          var keyCode = key.toString();
          keyMap[keyCode] = action;
          found = true;
        }
      }
      if ( found ) {
        this.keyMap_ = keyMap;
        this.$.parentElement.addEventListener('keydown', this.onKeyboardShortcut);
      }
    },

    updateSubViews: function() {
      var obj = this.get();

      if ( obj === '' ) return;

      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        var prop  = child.prop;

        if ( ! prop ) continue;

        try {
          if ( child.model_.DATA ) child.data = obj;
          else child.value = obj.propertyValue(prop.name);
        } catch (x) {
          console.log("error: ", prop.name, " ", x);
        }
      }
    },

    setModel: function(obj) {
      if ( ! obj ) return;

      this.obj = obj;
    }
  }
});




FOAModel({
  name: 'UpdateDetailView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'originalData'
    },
    {
      // TODO: remove 'value' and make this the real source of data
      name:  'data',
      getter: function() { return this.value.value; },
      setter: function(data) {
        this.originalData = data.deepClone();
        this.value = SimpleValue.create(data);
      }
    },
    /*
    {
      name: 'data',
      postSet: function(_, data) { this.originalData = data.deepClone(); }
    },
    */
    {
      name: 'dao'
    },
    {
      name: 'stack',
      defaultValueFn: function() { return this.X.stack; }
    },
    {
      name: 'view'
    }
  ],

  actions: [
    {
      name:  'save',
      help:  'Save updates.',

      isEnabled: function() { return ! this.originalData.equals(this.data); },
      action: function() {
        var self = this;
        var obj  = this.data;
        this.dao.put(obj, {
          put: function() {
            console.log("Saving: ", obj.toJSON());

            self.stack.back();
          },
          error: function() {
            console.error("Error saving", arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',
      isEnabled: function() { return ! this.originalData.equals(this.data); },
      action: function() { this.stack.back(); }
    },
    {
      name:  'back',
      isEnabled: function() { return this.originalData.equals(this.data); },
      action: function() { this.stack.back(); }
    }
  ]
});

/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

  onResize:
    resize scrollbar
    repaint

  onDAOUpdate
    reCount size
    repaint

*/
FOAModel({
  name: 'TableView',
  extendsModel: 'View',

  label: 'Table View',

  properties: [
    {
      name:  'model',
      type:  'Model',
      defaultValueFn: function() { return this.X.model; }
    },
    {
      model_: 'StringArrayProperty',
      name:  'properties',
      preSet: function(_, a) { return ! a || a.length == 0 ? null : a; },
      postSet: function() { this.repaint(); },
      defaultValue: null
    },
    {
      name:  'hardSelection',
      type:  'Value',
      postSet: function(_, v) { this.publish(this.ROW_SELECTED, v); },
      factory: function() { return SimpleValue.create(); }
    },
    {
      name:  'selection',
      type:  'Value',
      factory: function() { return SimpleValue.create(); }
    },
    {
      name:  'children',
      type:  'Array[View]',
      factory: function() { return []; }
    },
    {
      name:  'sortOrder',
      type:  'Comparator',
      postSet: function() { this.repaint(); },
      defaultValue: undefined
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      required: true,
      hidden: true,
      postSet: function(oldValue, newValue) {
        if ( this.daoListener ) {
          if ( oldValue ) oldValue.unlisten(this.daoListener);
          if ( newValue ) newValue.listen(this.daoListener);
        }
        this.scrollbar.value = 0;
        this.onDAOUpdate();
      }
    },
    {
      name: 'value',
      postSet: function(old, nu) {
        old && old.removeListener(this.onValueChange);
        nu.addListener(this.onValueChange);
        this.onValueChange();
      }
    },
    {
      name: 'rows',
      type:  'Int',
      defaultValue: 50,
      postSet: function(oldValue, newValue) {
        if ( oldValue !== newValue ) this.repaint();
      }
    },
    {
      model_: 'IntProperty',
      name: 'height'
    },
    {
      model_: 'BooleanProperty',
      name: 'scrollEnabled',
      defaultValue: false
    },
    {
      model_: 'BooleanProperty',
      name: 'editColumnsEnabled',
      defaultValue: false
    },
    {
      name: 'scrollbar',
      type: 'ScrollCView',
      factory: function() {
        var sb = this.X.ScrollCView.create({height:800, width: 24, x: 1, y: 0, size: 200, extent: 10});

//        if ( this.dao ) this.dao.select(COUNT())(function(c) { sb.size = c.count; });

        sb.value$.addListener(this.repaint);

        return sb;
      }
    },
    {
      name: 'scrollPitch',
      help: 'Number of (CSS) pixels of touch drag required to scroll by one',
      defaultValue: 10
    },
    {
      name: 'touchScrolling',
      model_: 'BooleanProperty',
      defaultValue: false,
      hidden: true,
      transient: true
    },
    {
      name: 'touchPrev',
      hidden: true,
      transient: true,
      defaultValue: 0
    }
  ],

  listeners: [
    {
      name: 'onResize',
      isMerged: 200,
      code: function() {
        if ( ! this.$ ) return;

        var h = this.$.parentElement.offsetHeight;
        var rows = Math.ceil((h - 47)/20)+1;
        // TODO: update the extent somehow
//        this.scrollbar.extent = rows;
        this.rows = rows;
        this.scrollbar.height = h-1;
        this.scrollbar.paint();
      }
    },

    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function() {
        if ( ! this.dao ) return;
        this.dao.select(COUNT())(function(c) {
          this.scrollbar.size = c.count;
          this.repaint();
        }.bind(this));
      }
    },
    {
      name: 'repaint',
      isAnimated: true,
      code: function() { this.repaintNow(); }
    },
    {
      name: 'onValueChange',
      code: function() { this.dao = this.value.value; }
    },
    {
      name: 'onEditColumns',
      code: function(evt) {
        var v = EditColumnsView.create({
          model:               this.model,
          properties:          this.properties || this.model.tableProperties,
          availableProperties: this.model.properties
        });

        v.addPropertyListener('properties', function() {
          v.close();
          this.properties = v.properties;
          v.removePropertyListener('properties', arguments.callee);
          this.repaint();
        }.bind(this));

        this.$.insertAdjacentHTML('beforebegin', v.toHTML());
        v.initHTML();
      }
    },
    {
      name: 'onTouchStart',
      code: function(touches, changed) {
        if ( touches.length > 1 ) return { drop: true };
        return { weight: 0.3 };
      }
    },
    {
      name: 'onTouchMove',
      code: function(touches, changed) {
        var t = touches[changed[0]];
        if ( this.touchScrolling ) {
          var sb = this.scrollbar;
          var dy = t.y - this.touchPrev;
          if ( dy > this.scrollPitch && sb.value > 0 ) {
            this.touchPrev = t.y;
            sb.value--;
          } else if ( dy < -this.scrollPitch && sb.value < sb.size - sb.extent ) {
            this.touchPrev = t.y;
            sb.value++;
          }

          return { claim: true, weight: 0.99, preventDefault: true };
        }

        if ( Math.abs(t.dy) > 10 && Math.abs(t.dx) < 10 ) {
          // Moving mostly vertically, so start scrolling.
          this.touchScrolling = true;
          this.touchPrev = t.y;
          return { claim: true, weight: 0.8, preventDefault: true };
        } else if ( t.distance < 10 ) {
          return { preventDefault: true };
        } else {
          return { drop: true };
        }
      }
    },
    {
      name: 'onTouchEnd',
      code: function(touches, changed) {
        this.touchScrolling = false;
        return { drop: true };
      }
    }
  ],

  methods: {
    ROW_SELECTED: ['escape'],

    // Not actually a method, but still works
    // TODO: add 'Constants' to Model
    DOUBLE_CLICK: "double-click", // event topic

    toHTML: function() {
      return '<div style="display:flex;width:100%;height:100%">' +
        '<span id="' + this.id + '" style="flex:1 1 100%;overflow-x:auto;overflow-y:hidden;">' +
        this.tableToHTML() +
        '</span>' +
        '<span style="width:19px;flex:none;overflow:hidden;">' +
        this.scrollbar.toHTML() +
        '</span>' +
        '</div>';
    },

    initHTML: function() {
      this.scrollbar.initHTML();

      this.onDAOUpdate();

      this.daoListener = {
        put:    this.onDAOUpdate,
        remove: this.onDAOUpdate
      };

      if ( this.scrollEnabled ) {
        (this.window || window).addEventListener('resize', this.onResize, false);

        var sb = this.scrollbar;

        this.$.parentElement.onmousewheel = function(e) {
          if ( e.wheelDeltaY > 0 && sb.value ) {
            sb.value--;
          } else if ( e.wheelDeltaY < 0 && sb.value < sb.size - sb.extent ) {
            sb.value++;
          }
        };

        if ( this.X.touchManager ) {
          this.X.touchManager.install(TouchReceiver.create({
            id: 'qbug-table-scroll-' + this.id,
            element: this.$.parentElement,
            delegate: this
          }));
        }

        this.onResize();
      }

      if ( this.dao ) this.dao.listen(this.daoListener);
    },

    /** Call repaint() instead to repaint on next animation frame. **/
    repaintNow: function() {
      var dao = this.dao;

      /*
      this.show__ = ! this.show__;
      if ( this.show__ ) return;
      */
      // this.count__ = ( this.count__ || 0)+1;
      // if ( this.count__ % 3 !== 0 ) return;

      if ( ! dao || ! this.$ ) return;

      dao = dao.skip(this.scrollbar.value);

      var self = this;
      if ( this.sortOrder ) dao = dao.orderBy(this.sortOrder);

      dao.limit(this.rows).select()(function(objs) {
        self.objs = objs;
        if ( self.$ ) {
          self.$.innerHTML = self.tableToHTML();
          self.initHTML_();
        }
      });
    },

    tableToHTML: function() {
      var model = this.model;

      if ( this.initializers_ ) {
        // console.log('Warning: TableView.tableToHTML called twice without initHTML');
        delete this['initializers_'];
        this.children = [];
      }

      var str = [];
      var props = [];

      str.push('<table class="foamTable ' + model.name + 'Table">');

      //str += '<!--<caption>' + model.plural + '</caption>';
      str.push('<thead><tr>');
      var properties = this.properties || this.model.tableProperties;
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var key  = properties[i];
        var prop = model.getProperty(key);

        if ( ! prop ) continue;

        if ( prop.hidden ) continue;

        str.push('<th scope=col ');
        str.push('id=' +
                 this.on(
                   'click',
                   (function(table, prop) { return function() {
                     if ( table.sortOrder === prop ) {
                       table.sortOrder = DESC(prop);
                     } else {
                       table.sortOrder = prop;
                     }
                     table.repaintNow();
                   };})(this, prop)));
        if ( prop.tableWidth ) str.push(' width="' + prop.tableWidth + '"');

        var arrow = '';

        if ( this.sortOrder === prop ) {
          arrow = ' <span class="indicator">&#9650;</span>';
        } else if ( this.sortOrder && DescExpr.isInstance(this.sortOrder) && this.sortOrder.arg1 === prop ) {
          arrow = ' <span class="indicator">&#9660;</span>';
        }

        str.push('>' + prop.tableLabel + arrow + '</th>');

        props.push(prop);
      }
      if ( this.editColumnsEnabled ) {
        str.push('<th width=15 id="' + this.on('click', this.onEditColumns) + '">...</th>');
      }
      str.push('</tr><tr style="height:2px"></tr></thead><tbody>');
      var objs = this.objs;
      if ( objs ) {
        var hselect = this.hardSelection.get();
        for ( var i = 0 ; i < objs.length; i++ ) {
          var obj = objs[i];
          var className = "tr-" + this.id;

          if ( hselect && obj.id == hselect.id ) {
            className += " rowSelected";
          }

          str.push('<tr class="' + className + '">');

          for ( var j = 0 ; j < props.length ; j++ ) {
            var prop = props[j];

            if ( j == props.length - 1 && this.editColumnsEnabled ) {
              str.push('<td colspan=2 class="' + prop.name + '">');
            } else {
              str.push('<td class="' + prop.name + '">');
            }
            var val = obj[prop.name];
            if ( prop.tableFormatter ) {
              str.push(prop.tableFormatter(val, obj, this));
            } else {
              str.push(( val == null ) ? '&nbsp;' : this.strToHTML(val));
            }
            str.push('</td>');
          }

          str.push('</tr>');
        }
      }

      str.push('</tbody></table>');

      return str.join('');
    },

    initHTML_: function() {
      this.initHTML.super_.call(this);

      var es = $$('tr-' + this.id);
      var self = this;

      /*
      if ( es.length ) {
        if ( ! this.sized_ ) {
          this.sized_ = true;
          this.layout();
          return;
        }
      }
      */

      for ( var i = 0 ; i < es.length ; i++ ) {
        var e = es[i];

        e.onmouseover = function(value, obj) { return function() {
          value.set(obj);
        }; }(this.selection, this.objs[i]);
        e.onmouseout = function(value, obj) { return function() {
          value.set(self.hardSelection.get());
        }; }(this.selection, this.objs[i]);
        e.onclick = function(value, obj) { return function(evt) {
          self.hardSelection.set(obj);
          value.set(obj);
          delete value['prevValue'];
          var row = evt.srcElement;
          while ( row && row.tagName !== "TR") row = row.parentNode;
          var table = row;
          while (table && table.tagName !== "TBODY")  table = table.parentNode;

          var siblings = table ? table.childNodes : [];
          for ( var i = 0 ; i < siblings.length ; i++ ) {
            siblings[i].classList.remove("rowSelected");
          }
          row && row.classList.add('rowSelected');
        }; }(this.selection, this.objs[i]);
        e.ondblclick = function(value, obj) { return function(evt) {
          self.publish(self.DOUBLE_CLICK, obj, value);
        }; }(this.selection, this.objs[i]);
      }

      delete this['initializers_'];
      this.children = [];
    },

    setValue: function(value) {
      this.value = value;
    },

    destroy: function() {
    }
  }
});

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

/** A Canvas View for embedding CView's in. **/
// TODO: add a 'mouse' property which creates and connects a Mouse model.
FOAModel({
  name: 'Canvas',
  extendsModel: 'View',

  properties: [
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 100,
      postSet: function(_, width) {
        if ( this.$ ) this.$.width = width;
      }
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 100,
      postSet: function(_, height) {
        if ( this.$ ) this.$.height = height;
      }
    }
  ],

  listeners: [
    {
      name: 'paint',
      isAnimated: true,
      code: function() {
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;
        this.erase();
        this.paintChildren();
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<canvas id="' + this.id + '" width="' + this.width + '" height="' + this.height + '"> </canvas>';
    },

    initHTML: function() {
      if ( ! this.$ ) return;
      this.canvas = this.$.getContext('2d');
    },

    addChild: function(child) {
      child.parent = null; // needed because super.addChild() skips childen with parents already

      this.SUPER(child);

      try {
        child.addListener(this.paint);
      } catch (x) { console.log(x); }

      return this;
    },

    erase: function() {
      this.canvas.fillStyle = this.background;
      this.canvas.fillRect(0, 0, this.width, this.height);
    },

    paintChildren: function() {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        this.canvas.save();
        child.paint();
        this.canvas.restore();
      }
    }
  }
});


/**
 * Abstract Canvas View (CView).
 *
 * CView's can also be used as regular (DOM) Views because if you call
 * toHTML() on them they will create their own 'Canvas' View parent.
 **/
FOAModel({
  name:  'CView',
  label: 'CView',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'x',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10
    },
    {
      name:  'y',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10
    },
    {
      name:  'width',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10
    },
    {
      name:  'height',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 10
    },
    {
      name:  'children',
      type:  'CView[]',
      factory: function() { return []; },
      hidden: true
    },
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'canvas',
      type:  'Canvas',
      getter: function() {
        return this.parent && this.parent.canvas;
      },
      setter: undefined,
      hidden: true
    }
  ],

  listeners: [
    {
      name: 'resizeParent',
      code: function(evt) {
        this.parent.width  = this.x + this.width + 1;
        this.parent.height = this.y + this.height + 2;
      }
    }
  ],

  methods: {
    toHTML: function() {
      // If being added to HTML directly, then needs to create own Canvas as parent.
      // Calling addChild() will set this.parent = canvas.
      if ( ! this.parent ) {
        this.parent = this.X.Canvas.create();

        this.x$.addListener(this.resizeParent);
        this.y$.addListener(this.resizeParent);
        this.width$.addListener(this.resizeParent);
        this.height$.addListener(this.resizeParent);

        this.resizeParent();
      }
      return this.parent.toHTML();
    },

    initHTML: function() {
      var self = this;
      var parent = this.parent;

      parent.addChild(this);
      parent.initHTML();
      this.X.dynamic(
        function() { self.background; }, function() {
          parent.background = self.background;
        });
    },

    write: function(document) {
      document.writeln(this.toHTML());
      this.initHTML();
    },

    addChild: function(child) {
      this.children.push(child);
      child.parent = this;
      return this;
    },

    removeChild: function(child) {
      this.children.deleteI(child);
      child.parent = undefined;
      return this;
    },

    erase: function() {
      this.canvas.fillStyle = this.background;
      this.canvas.fillRect(0, 0, this.width, this.height);
    },

    paintChildren: function() {
      for ( var i = 0 ; i < this.children.length ; i++ ) {
        var child = this.children[i];
        this.canvas.save();
        child.paint();
        this.canvas.restore();
      }
    },

    paintSelf: function() {},

    paint: function() {
      if ( ! this.parent.$ ) return;
      this.erase();
      this.paintSelf();
      this.paintChildren();
    }
  }
});


FOAModel({
  name:  'Label',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'text',
      type:  'String',
      defaultValue: ''
    },
    {
      name:  'align',
      label: 'Alignment',
      type:  'String',
      defaultValue: 'start' // values: left, right, center, start, end
    },
    {
      name:  'font',
      type:  'String',
      defaultValue: ''
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'maxWidth',
      label: 'Maximum Width',
      type:  'int',
      defaultValue: -1
    }
  ],

  methods: {
    paint: function() {
      var canvas = this.parent.canvas;
      var oldFont = canvas.font;
      var oldAlign = canvas.textAlign;

      if ( this.font ) canvas.font = this.font;

      canvas.textAlign = this.align;
      canvas.fillStyle = this.color;
      canvas.fillText(this.text, this.x, this.y);

      canvas.font = oldFont;
      canvas.textAlign = oldAlign;
    }
  }
});


FOAModel({
  name:  'Box',
  extendsModel: 'Label',

  properties: [
    {
      name:  'background',
      label: 'Background Color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'border',
      label: 'Border Color',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'a',
      label: 'Angle',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 100
    }
  ],

  methods: {
    paint: function() {
      var c = this.parent.canvas;

      c.save();

      if ( this.a ) {
        c.translate(this.x+this.width/2, this.y+this.height/2);
        c.rotate(this.a);
        c.translate(-this.x-this.width/2, -this.y-this.height/2);
      }

      c.fillStyle = this.background;
      c.fillRect(this.x, this.y, this.width, this.height);

      if ( this.border && this.width && this.height ) {
        c.strokeStyle = this.border;
        c.strokeRect(this.x, this.y, this.width, this.height);
      }

      var oldFont = c.font;
      var oldAlign = c.textAlign;

      if ( this.font ) c.font = this.font;

      c.textAlign = 'center'; //this.align;
      c.fillStyle = this.color;
      c.fillText(
        this.text,
        this.x + this.width/2,
        this.y+this.height/2+10);

      c.font = oldFont;
      c.textAlign = oldAlign;

      var grad = c.createLinearGradient(this.x, this.y, this.x+this.width, this.y+this.height);

      grad.addColorStop(  0, 'rgba(0,0,0,0.35)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0)');
      grad.addColorStop(  1, 'rgba(255,255,255,0.45)');
      c.fillStyle = grad;
      c.fillRect(this.x, this.y, this.width, this.height);

      c.restore();
    }
  }
});


FOAModel({
  name:  'Circle',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'border',
      label: 'Border Color',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'borderWidth',
      type:  'int',
      defaultValue: 1
    },
    {
      name:  'alpha',
      type:  'int',
      defaultValue: 1
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    },
    {
      name: 'r',
      label: 'Radius',
      type: 'int',
      defaultValue: 20
    }
  ],


  methods: {

    paint3d: function() {
      var canvas = this.parent.canvas;

      var radgrad = canvas.createRadialGradient(this.x+this.r/6,this.y+this.r/6,this.r/3,this.x+2,this.y,this.r);
      radgrad.addColorStop(0, '#a7a7a7'/*'#A7D30C'*/);
      radgrad.addColorStop(0.9, this.color /*'#019F62'*/);
      radgrad.addColorStop(1, 'black');

      canvas.fillStyle = radgrad;;

      canvas.beginPath();
      canvas.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
      canvas.closePath();
      canvas.fill();
    },

    paint: function() {
      var canvas = this.parent.canvas;

      canvas.save();

      canvas.globalAlpha = this.alpha;

      canvas.fillStyle = this.color;

      if ( this.border && this.r ) {
        canvas.lineWidth = this.borderWidth;
        canvas.strokeStyle = this.border;
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
        canvas.closePath();
        canvas.stroke();
      }

      if ( this.color ) {
        canvas.beginPath();
        canvas.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
        canvas.closePath();
        canvas.fill();
      }

      canvas.restore();
    }
  }
});


FOAModel({
  name:  'ImageCView',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'alpha',
      type:  'int',
      defaultValue: 1
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'scale',
      type:  'int',
      defaultValue: 1
    },
    {
      name: 'src',
      label: 'Source',
      type: 'String'
    }
  ],


  methods: {

    init: function() {
      this.SUPER();

      this.image_ = new Image();
      this.image_.src = this.src;
    },

    paint: function() {
      var c = this.parent.canvas;

      c.translate(this.x, this.y);
      c.scale(this.scale, this.scale);
      c.translate(-this.x, -this.y);
      c.drawImage(this.image_, this.x, this.y);
    }
  }
});


FOAModel({
  name:  'Rectangle',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true
    },
    {
      name:  'color',
      type:  'String',
      defaultValue: 'white',
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 1000
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 100
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 100
    }
  ],

  methods: {
    paint: function() {
      var canvas = this.parent.canvas;

      canvas.fillStyle = this.color;
      canvas.fillRect(this.x, this.y, this.width, this.height);
    }
  }
});


FOAModel({
  name:  'ProgressCView',
  extendsModel: 'CView',

  properties: [
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        oldValue && oldValue.removeListener(this.updateValue);
        newValue.addListener(this.updateValue);
      }
    }
  ],

  listeners: {
    updateValue: function() {
      this.paint();
    }
  },

  methods: {

    paint: function() {
      var c = this.canvas;

      c.fillStyle = '#fff';
      c.fillRect(0, 0, 104, 20);

      c.strokeStyle = '#000';
      c.strokeRect(0, 0, 104, 20);
      c.fillStyle = '#f00';
      c.fillRect(2, 2, parseInt(this.value.get()), 16);
    },

    destroy: function() {
      this.value.removeListener(this.listener_);
    }
  }
});


FOAModel({
  name:  'Graph',
  extendsModel: 'CView',

  properties: [
    {
      name:  'style',
      type:  'String',
      defaultValue: 'Line',
      // TODO: fix the view, it's not storabe
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Bar',
          'Line',
          'Point'
        ]});}
      }
    },
    {
      name:  'width',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 5
    },
    {
      name:  'height',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 5
    },
    {
      name:  'graphColor',
      type:  'String',
      defaultValue: 'green'
    },
    {
      name:  'backgroundColor',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'lineWidth',
      type:  'int',
      defaultValue: 6
    },
    {
      name:  'drawShadow',
      type:  'boolean',
      defaultValue: true
    },
    {
      name:  'capColor',
      type:  'String',
      defaultValue: ''
    },
    {
      name:  'axisColor',
      type:  'String',
      defaultValue: 'black'
    },
    {
      name:  'gridColor',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'axisSize',
      type:  'int',
      defaultValue: 2
    },
    {
      name:  'xAxisInterval',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'yAxisInterval',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'maxValue',
      label: 'Maximum Value',
      type:  'float',
      defaultValue: -1
    },
    {
      name:  'data',
      type:  'Array[float]',
      factory: function() { return []; }
    },
    {
      name: 'f',
      label: 'Data Function',
      type: 'Function',
      required: false,
      displayWidth: 70,
      displayHeight: 3,
      view: 'FunctionView',
      defaultValue: function (x) { return x; },
      help: 'The graph\'s data function.'
    }
  ],

  issues: [
    {
      id: 1000,
      severity: 'Major',
      status: 'Open',
      summary: 'Make \'style\' view serializable',
      created: 'Sun Dec 23 2012 18:14:56 GMT-0500 (EST)',
      createdBy: 'kgr',
      assignedTo: 'kgr',
      notes: 'ChoiceView factory prevents Model from being serializable.'
    }
  ],

  methods: {
    paintLineData: function(canvas, x, y, xs, w, h, maxValue) {
      if ( this.graphColor ) {
        canvas.fillStyle = this.graphColor;
        canvas.beginPath();
        canvas.moveTo(x+xs, y+h-xs);
        for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.f(this.data[i]);
          var lx = x+xs+(i==0?0:w*i/(this.data.length-1));
          var ly = this.toY(d, maxValue);

          canvas.lineTo(lx, ly);
        }

        canvas.lineTo(x+this.width-1, y+h-xs);
        canvas.lineTo(x+xs, y+h-xs);
        canvas.fill();
      }

      if ( this.capColor ) {
        if ( this.drawShadow ) {
          canvas.shadowOffsetX = 0;
          canvas.shadowOffsetY = 2;
          canvas.shadowBlur = 2;
          canvas.shadowColor = "rgba(0, 0, 0, 0.5)";
        }

        canvas.strokeStyle = this.capColor;
        canvas.lineWidth = this.lineWidth;
        canvas.lineJoin = 'round';
        canvas.beginPath();
        for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.f(this.data[i]);
          var lx = this.toX(i)+0.5;
          var ly = this.toY(d, maxValue)/*+0.5*/-5;

          if ( i == 0 )
            canvas.moveTo(lx, ly);
          else
            canvas.lineTo(lx, ly);
        }

        canvas.stroke();
      }
    },

    paintPointData: function(canvas, x, y, xs, w, h, maxValue) {
      canvas.shadowOffsetX = 2;
      canvas.shadowOffsetY = 2;
      canvas.shadowBlur = 2;
      canvas.shadowColor = "rgba(0, 0, 0, 0.5)";

      canvas.strokeStyle = this.capColor;
      canvas.lineWidth = 2;
      canvas.lineJoin = 'round';
      canvas.beginPath();
      for ( var i = 0 ; i < this.data.length ; i++ ) {
        var d = this.f(this.data[i]);
        var lx = this.toX(i)+0.5;
        var ly = this.toY(d, maxValue)+0.5;

        if ( i == 0 ) canvas.moveTo(lx, ly); else canvas.lineTo(lx, ly);
      }

      canvas.stroke();

      canvas.lineWidth = 3;
      for ( var i = 0 ; i < this.data.length ; i++ ) {
        var d = this.f(this.data[i]);
        var lx = this.toX(i)+0.5;
        var ly = this.toY(d, maxValue)+0.5;

        canvas.beginPath();
        canvas.arc(lx,ly,4,0,-Math.PI/2);
        canvas.closePath();
        canvas.stroke();
      }
    },

    paintBarData: function(canvas, x, y, xs, w, h, maxValue) {
      canvas.fillStyle = this.graphColor;

      for ( var i = 0 ; i < this.data.length ; i++ ) {
        var d = this.f(this.data[i]);
        var x1 = x+xs+w*i/this.data.length;
        var y1 = this.toY(d, maxValue);

        canvas.fillRect(x1, y1, w/this.data.length+1.5, d*h/maxValue);
      }
    },

    paint: function() {
      var canvas = this.canvas;
      var x  = this.x;
      var y  = this.y;
      var xs = this.axisSize;
      var w  = this.width-xs;
      var h  = this.height-xs;
      var maxValue = this.maxValue;

      if ( this.backgroundColor ) {
        canvas.fillStyle = this.backgroundColor;
        canvas.fillRect(x,y,w,h);
      }

      if ( maxValue == -1 ) {
        maxValue = 0.001;

        for ( var i = 0 ; i < this.data.length ; i++ ) {
          var d = this.f(this.data[i]);

          maxValue = Math.max(maxValue, d);
        }
      }

      if ( this.style == 'Line' ) this.paintLineData(canvas, x, y, xs, w, h, maxValue);
      else if ( this.style == 'Bar' ) this.paintBarData(canvas, x, y, xs, w, h, maxValue);
      else if ( this.style == 'Point' ) this.paintPointData(canvas, x, y, xs, w, h, maxValue);

      if ( this.axisColor && xs != 0 ) {
        canvas.fillStyle = this.axisColor;
        // x-axis
        canvas.fillRect(x, y+h-xs*1.5, this.width, xs);
        // y-axis
        canvas.fillRect(x, y, xs, this.height-xs*1.5);
      }

      if ( this.xAxisInterval ) {
        for ( var i = this.xAxisInterval ; i <= this.data.length ; i += this.xAxisInterval ) {
          var x2 = this.toX(i);

          if ( this.gridColor ) {
            canvas.save();
            canvas.shadowOffsetX = 0;
            canvas.shadowOffsetY = 0;
            canvas.shadowBlur = 0;
            canvas.fillStyle = this.gridColor;
            canvas.fillRect(x2+1.5, this.toY(0,1)-2*xs, 0.5, -this.height);
            canvas.restore();
          }

          canvas.fillRect(x2, this.toY(0,1)-2*xs, xs/2, -xs);
        }
      }

      if ( this.yAxisInterval ) {
        for ( var i = this.yAxisInterval ; i <= maxValue ; i += this.yAxisInterval ) {
          var y = this.toY(i, maxValue);

          if ( this.gridColor ) {
            canvas.save();
            canvas.shadowOffsetX = 0;
            canvas.shadowOffsetY = 0;
            canvas.shadowBlur = 0;
            canvas.fillStyle = this.gridColor;
            canvas.fillRect(x+xs, y+3, this.width, 0.5);
            canvas.restore();
          }

          canvas.fillRect(x+xs, y, xs, xs/2);
        }
      }
    },

    toX: function(val) {
      var w = this.width - this.axisSize;
      return this.x+this.axisSize+(val==0?0:w*val/(this.data.length-1));
    },

    toY: function(val, maxValue) {
      var h = this.height - this.axisSize;
      return this.y+h-val*h/maxValue+0.5;
    },

    lastValue: function() {
      return this.data[this.data.length-1];
    },

    addData: function(value, opt_maxNumValues) {
      var maxNumValues = opt_maxNumValues || this.width;

      if ( this.data.length == maxNumValues ) this.data.shift();
      this.data.push(value);
    },

    watch: function(value, opt_maxNumValues) {
      var graph = this;

      value.addListener(function() {
        graph.addData(value.get(), opt_maxNumValues);
      });
    }
  }
});


var WarpedCanvas = {
  create: function(c, mx, my, w, h, mag) {
    return {
      __proto__: c,
      warp: function(x, y) {
        if ( Math.abs(mag) < 0.01 || ( mx < 1 && my < 1 ) ) { this.x = x; this.y = y; return; }

        var dx = x-mx;
        var dy = y-my;
        var r  = Math.sqrt(dx*dx + dy*dy);
        var t  = Math.atan2(dy, dx);

        var R = 400 * (1+mag);
        r = r/R;
        if ( r < 1 ) r += mag*3*r*Math.pow(1-r, 4);
        r = r*R;

        this.x = mx + Math.cos(t) * r;
        this.y = my + Math.sin(t) * r;
      },
      moveTo: function(x, y) { this.warp(x, y); c.moveTo(this.x, this.y); this.X = x; this.Y = y; },
      lineTo: function(x2, y2) {
        var N = 100;
        var x1 = this.X;
        var y1 = this.Y;
        var dx = (x2 - x1)/N;
        var dy = (y2 - y1)/N;
        var x = x1, y = y1;
        for ( var i = 0 ; i < N ; i++ ) {
          x += dx;
          y += dy;
          this.warp(x, y);
          c.lineTo(this.x, this.y);
        }
        this.X = x2;
        this.Y = y2;
      },
      line: function(x1, y1, x2, y2) {
        c.beginPath();
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
        c.stroke();
      },
      fillText: function(t, x, y) {
        this.warp(x, y);
        c.fillText(t, this.x, this.y);
      },
      fillRect: function(x, y, width, height) {
        c.beginPath();
        this.moveTo(x, y);
        this.lineTo(x+width, y);
        this.lineTo(x+width, y+height);
        this.lineTo(x, y+height);
        this.lineTo(x, y);
        c.closePath();
        c.fill();
      },
      get font()        { return c.linewidth; },   set font(v)        { c.linewidth = v; },
      get lineWidth()   { return c.linewidth; },   set lineWidth(v)   { c.linewidth = v; },
      get strokeStyle() { return c.strokeStyle; }, set strokeStyle(v) { c.strokeStyle = v; },
      get fillStyle()   { return c.fillStyle; },   set fillStyle(v)   { c.fillStyle = v; },
      get textAlign()   { return c.textAlign; },   set textAlign(v)   { c.textAlign = v; }
    };
  }
};


FOAModel({
  name:  'GridCView',
  extendsModel: 'CView',
  label: 'GridCView',

  properties: [
    {
      name: 'grid',
      type: 'GridByExpr',
    },
    {
      name: 'mag',
      help: 'The current magnification level.  Animates to desiredMag.',
      defaultValue: 0.6
    },
    {
      name: 'desiredMag',
      postSet: function(_, mag) { this.mag = mag; },
      defaultValue: 0.6
    },
    {
      name: 'mouse',
      factory: function() { return this.X.Mouse.create(); }
    }
  ],

  listeners: [
    {
      name: 'onMouseMove',
      code: function(evt) {
        this.parent.paint()
      }
    }
  ],

  methods: {
    initHTML: function() {
      var self = this;

      this.SUPER();

      this.mouse.connect(this.parent.$);

      this.parent.$.addEventListener('mouseout', function() {
        this.animation_ && this.animation_();
        this.animation_ = Movement.animate(
          800,
          function() { self.mag = 0; },
          Movement.oscillate(0.8, self.mag/4))();
      });

      this.parent.$.addEventListener('mouseenter', function() {
        this.animation_ && this.animation_();
        this.animation_ = Movement.animate(
          400,
          function() { self.mag = self.desiredMag; })();
      });

      this.parent.$.onmousewheel = function(e) {
        if ( e.wheelDeltaY > 0 ) {
          this.desiredMag += 0.05;
        } else {
          this.desiredMag = Math.max(0, this.desiredMag-0.05);
        }
        this.parent.paint();
      }.bind(this);

      this.mouse.addListener(this.onMouseMove);
    },

    // TODO: move to CView
    line: function(x1, y1, x2, y2) {
      var c = this.canvas;

      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.closePath();
      c.stroke();
    },

    paint: function() {
      var ROW_LABEL_WIDTH = 140;
      var COL_LABEL_HEIGHT = 30;

      this.width  = this.parent.$.parentElement.clientWidth;
      this.height = this.parent.$.parentElement.clientHeight;

      var c = this.canvas;

      var g = this.grid;
      var cols = g.cols.groups;
      var rows = g.rows.groups;
      var sortedCols = g.sortedCols();
      var sortedRows = g.sortedRows();
      var w = this.width;
      var h = this.height;
      var wc = WarpedCanvas.create(c, this.mouse.x, this.mouse.y, w, h, this.mag);

      var xw = (w-ROW_LABEL_WIDTH) / sortedCols.length;
      var yw = (h-COL_LABEL_HEIGHT) / sortedRows.length;

      wc.fillStyle = '#eee';
      wc.fillRect(0, 0, this.width, COL_LABEL_HEIGHT);
      wc.fillRect(0, 0, ROW_LABEL_WIDTH, this.height);

      wc.lineWidth = 1;
      wc.strokeStyle = '#000';
      wc.fillStyle = '#000';
      wc.textAlign = 'left';
      wc.font = 'bold 10px arial';

      // Vertical Grid Lines
      for ( var i = 0 ; i < sortedCols.length ; i++ ) {
        var x = ROW_LABEL_WIDTH + i * xw;

        wc.fillText(sortedCols[i], x+2, COL_LABEL_HEIGHT/2+2);

        wc.line(x, 0, x, h);
      }
      // First line
      wc.line(0, 0, 0, h);
      // Last line
      wc.line(w, 0, w, h);

      // Horizontal Grid Lines
      for ( var i = 0 ; i < sortedRows.length ; i++ ) {
        var y = COL_LABEL_HEIGHT + i * yw;

        wc.fillText(sortedRows[i], 5, y + yw/2);

        wc.line(0, y, w, y);
      }

      // First line
      wc.line(0, 0, w, 0);
      // Last line
      wc.line(0, h, w, h);

      function wdist(x1, y1, x2, y2) {
        wc.warp(x2, y2);
        var dx = x1-wc.x;
        var dy = y1-wc.y;
        return dx*dx + dy*dy;
      }

      for ( var j = 0 ; j < sortedRows.length ; j++ ) {
        var y = sortedRows[j];
        for ( var i = 0 ; i < sortedCols.length ; i++ ) {
          var x = sortedCols[i];
          var value = rows[y].groups[x];

          if ( value && value.toCView ) {
            var cv = value.toCView();

            var cx = ROW_LABEL_WIDTH + xw * (i+0.5);
            var cy = COL_LABEL_HEIGHT + yw * (j+0.5);
            wc.warp(cx, cy);
            cv.x = wc.x;
            cv.y = wc.y;
            cv.r = Math.sqrt(Math.min(
              wdist(cv.x, cv.y, cx+xw/2, cy),
              wdist(cv.x, cv.y, cx-xw/2, cy),
              wdist(cv.x, cv.y, cx, cy+yw/2),
              wdist(cv.x, cv.y, cx, cy-yw/2)))-4;
            cv.x -= cv.r;
            cv.y -= cv.r;

            cv.parent = this.parent;

            if ( cv.r > 3 ) cv.paint();
          }
        }
      }
    }
  }
});

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
 * TODO:
 *    handle multiple-selection
 *    map <enter> key to <br>
 *    support removing/toggling an attribute
 *    check that the selected text is actually part of the element
 *    add the rest of the common styling options
 *    improve L&F
 */

FOAModel({
  name: 'Link',
  properties: [
    {
      name: 'richTextView'
    },
    {
      name: 'label',
      displayWidth: 28
    },
    {
      name: 'link',
      displayWidth: 19,
      view: { model_: 'TextFieldView', placeholder: 'Type or paste link.' },
      preSet: function(_, value) {
        value = value.trim();
        // Disallow javascript URL's
        if ( value.toLowerCase().startsWith('javascript:') ) value = '';
        return value;
      }
    }
  ],
  methods: {
    open: function(x, y) {
      var view = LinkView.create({model: Link, value: SimpleValue.create(this)});
      this.richTextView.$.parentNode.insertAdjacentHTML('beforebegin', view.toHTML());
      view.$.style.left = x + this.richTextView.$.offsetLeft;
      view.$.style.top = y + this.richTextView.$.offsetTop;
      view.initHTML();
      this.view = view;
    }
  },
  actions: [
    {
      name:  'insert',
      label: 'Apply',
      help:  'Insert this link into the document.',

      action: function() {
        var a   = document.createElement('a');
        var txt = document.createTextNode(this.label);
        a.href = this.link;
        a.appendChild(txt);

        this.richTextView.insertElement(a);

        this.view.close();
      }
    }
  ]
});


FOAModel({
  name: 'LinkView',

  extendsModel: 'DetailView',

  properties: [
    {
      name: 'insertButton',
      factory: function() {
        return ActionButton.create({
          action: Link.INSERT,
          value: this.value
        });
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.addChild(this.insertButton);
    },
    initHTML: function() {
      this.SUPER();
      this.$.addEventListener('keyup', this.keyUp);
      this.labelView.focus();
    },
    close: function() { this.$.remove(); }
  },

  listeners: [
    {
      name: 'keyUp',
      code: function(e) {
        if ( e.keyCode == 27 /* Esc */ ) {
          e.stopPropagation();
          this.close();
        }
      }
    }
  ],

  templates: [
    {
      name: "toHTML",
      template:
        '<div id="<%= this.id %>" class="linkDialog" style="position:absolute">\
        <table><tr>\
        <th>Text</th><td>$$label</td></tr><tr>\
        <th>Link</th><td>$$link\
        %%insertButton</td>\
        </tr></table>\
        </div>'
    }
  ]
});


FOAModel({
  name: 'ColorPickerView',

  extendsModel: 'View',

  properties: [
    {
      name: 'value',
      factory: function() { return SimpleValue.create({}); }
    }
  ],

  methods: {
    toHTML: function() {
      var out = '<table>';
      out += '<tr>';
      var self = this;
      var cell = function(r, g, b) {
        var value = 'rgb(' + r + ',' + g + ',' + b + ')';

        out += '<td class="pickerCell"><div id="' +
          self.on('click', function(e) {
            self.value.set(value);
            e.preventDefault();
          }) +
          '" class="pickerDiv" style="background-color: ' + value + '"></div></td>';
      };
      for ( var col = 0; col < 8; col++ ) {
        var shade = Math.floor(255 * col / 7);
        cell(shade, shade, shade);
      }
      out += '</tr><tr>';
      cell(255, 0, 0);
      cell(255, 153, 0);
      cell(255, 255, 0);
      cell(0, 255, 0);
      cell(0, 255, 255);
      cell(0, 0, 255);
      cell(153, 0, 255);
      cell(255, 0, 255);
      out += '</tr></table>';
      return out;
    }
  }
});


FOAModel({
  name: 'RichTextView',

  extendsModel: 'View',

  properties: [
    {
      model_: 'StringProperty',
      name:  'height',
      defaultValue: '400'
    },
    {
      model_: 'StringProperty',
      name:  'width',
      defaultValue: '100%'
    },
    {
      name:  'mode',
      type:  'String',
      defaultValue: 'read-write',
      view: {
        create: function() { return ChoiceView.create({choices:[
          "read-only", "read-write", "final"
        ]}); } }
    },
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(); },
      postSet: function(oldValue, newValue) {
        Events.unlink(oldValue, this.domValue);
        Events.link(newValue, this.domValue);
        oldValue && oldValue.removeListener(this.maybeShowPlaceholder);
        newValue.addListener(this.maybeShowPlaceholder);
      }
    },
    {
      name: 'placeholder',
      help: 'Placeholder text to appear when no text is entered.'
    },
    {
      name: 'document',
      hidden: true
    }
  ],

  listeners: [
    {
      name: 'maybeShowPlaceholder',
      code: function() {
        var e = $(this.placeholderId);
        if ( e ) {
          e.style.visibility = this.value.get() == '' ? 'visible' : 'hidden';
        }
      }
    }
  ],

  methods: {
    toHTML: function() {
      var sandbox = this.mode === 'read-write' ?
        '' :
        ' sandbox="allow-same-origin"';

      var id = this.id;
      this.dropId = this.nextID();
      this.placeholderId = this.nextID();

      return '<div class="richtext">' +
        '<div id="' + this.dropId + '" class="dropzone"><div class=spacer></div>Drop files here<div class=spacer></div></div>' +
        '<div id="' + this.placeholderId + '" class="placeholder">' + this.placeholder + '</div>' +
        '<iframe style="width:' + this.width + 'px;min-height:' + this.height + 'px" id="' + this.id + '"' + sandbox + ' img-src="*"></iframe>' +
        '</div>';
    },

    initHTML: function() {
      this.SUPER();
      var drop = $(this.dropId);
      this.dropzone = drop;
      this.document = this.$.contentDocument;
      var body = this.document.body;

      $(this.placeholderId).addEventListener('click', function() { body.focus(); });
      this.document.head.insertAdjacentHTML(
        'afterbegin',
        '<style>blockquote{border-left-color:#ccc;border-left-style:solid;padding-left:1ex;}</style>');

      body.style.overflow = 'auto';
      body.style.margin = '5px';
      body.style.height = '100%';

      var self = this;
      body.ondrop = function(e) {
        e.preventDefault();
        self.showDropMessage(false);
        var length = e.dataTransfer.files.length;
        for ( var i = 0 ; i < length ; i++ ) {
          var file = e.dataTransfer.files[i];
          var id = this.addAttachment(file);
          if ( file.type.startsWith("image/") ) {
            var img   = document.createElement('img');
            img.id = id;
            img.src = URL.createObjectURL(file);
            this.insertElement(img);
          }
        }

        length = e.dataTransfer.items.length;
        if ( length ) {
          var div = this.sanitizeDroppedHtml(e.dataTransfer.getData('text/html'));
          this.insertElement(div);
        }
      }.bind(this);
      self.dragging_ = 0;
      body.ondragenter = function(e) {
        self.dragging_++;
        self.showDropMessage(true);
      };
      body.ondragleave = function(e) {
        if ( --self.dragging_ == 0 ) self.showDropMessage(false);
      };
      if ( this.mode === 'read-write' ) {
        this.document.body.contentEditable = true;
      }
      this.domValue = DomValue.create(this.document.body, 'input', 'innerHTML');
      this.value = this.value; // connects listeners
      this.maybeShowPlaceholder();
    },

    setValue: function(value) {
      this.value = value;
    },

    getSelectionText: function() {
      var window    = this.$.contentWindow;
      var selection = window.getSelection();

      if ( selection.rangeCount ) {
        return selection.getRangeAt(0).toLocaleString();
      }

      return '';
    },

    insertElement: function(e) {
      var window    = this.$.contentWindow;
      var selection = window.getSelection();

      if ( selection.rangeCount ) {
        var r = selection.getRangeAt(0);
        r.deleteContents();
        r.insertNode(e);
      } else {
        // just insert into the body if no range selected
        var range = window.document.createRange();
        range.selectNodeContents(window.document.body);
        range.insertNode(e);
      }

      // Update the value directly because modifying the DOM programatically
      // doesn't fire an update event.
      this.updateValue();
    },

    // Force updating the value after mutating the DOM directly.
    updateValue: function() {
      this.value.set(this.document.body.innerHTML);
    },

    showDropMessage: function(show) {
      this.$.style.opacity = show ? '0' : '1';
    },

    sanitizeDroppedHtml: function(html) {
      var self = this;
      var allowedElements = [
        {
          name: 'B',
          attributes: []
        },
        {
          name: 'I',
          attributes: []
        },
        {
          name: 'U',
          attributes: []
        },
        {
          name: 'P',
          attributes: []
        },
        {
          name: 'SECTION',
          attributes: []
        },
        {
          name: 'BR',
          attributes: []
        },
        {
          name: 'BLOCKQUOTE',
          attributes: []
        },
        {
          name: 'DIV',
          attributes: []
        },
        {
          name: 'IMG',
          attributes: ['src'],
          clone: function(node) {
            var newNode = document.createElement('img');
            if ( node.src.startsWith('http') ) {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", node.src);
              xhr.responseType = 'blob';
              xhr.asend(function(blob) {
                blob.name = 'dropped image';
                if ( blob ) {
                  newNode.id = self.addAttachment(blob);
                  newNode.src = URL.createObjectURL(blob);
                } else {
                  blob.parent.removeChild(blob);
                }
                self.updateValue();
              });
            } else if ( node.src.startsWith('data:') ) {
              var type = node.src.substring(5, node.src.indexOf(';'));
              var decoder = Base64Decoder.create([], node.src.length);
              decoder.put(node.src.substring(node.src.indexOf('base64,') + 7));
              decoder.eof();

              var blob = new Blob(decoder.sink, { type: type });
              blob.name = 'dropped image';
              newNode.id = self.addAttachment(blob);
              newNode.src = URL.createObjectURL(blob);
            } else {
              // Unsupported image scheme dropped in.
              return null;
            }

            return newNode;
          }
        },
        {
          name: 'A',
          attributes: ['href']
        },
        {
          name: '#TEXT',
          attributes: []
        },
      ];

      function copyNodes(parent, node) {
        for ( var i = 0; i < allowedElements.length; i++ ) {
          if ( allowedElements[i].name === node.nodeName ) {
            if ( allowedElements[i].clone ) {
              newNode = allowedElements[i].clone(node);
            } else if ( node.nodeType === Node.ELEMENT_NODE ) {
              newNode = document.createElement(node.nodeName);
              for ( var j = 0; j < allowedElements[i].attributes.length; j++ ) {
                if ( node.hasAttribute(allowedElements[i].attributes[j]) ) {
                  newNode.setAttribute(allowedElements[i].attributes[j],
                                       node.getAttribute(allowedElements[i].attributes[j]));
                }
              }
            } else if ( node.nodeType === Node.TEXT_NODE ) {
              newNode = document.creatTextNode(node.nodeValue);
            } else {
              newNode = document.createTextNode('');
            }
            break;
          }
        }
        if ( i === allowedElements.length ) {
          newNode = document.createElement('div');
        }
        if ( newNode ) parent.appendChild(newNode);
        for ( j = 0; j < node.children.length; j++ ) {
          copyNodes(newNode, node.children[j]);
        }
      }

      var frame = document.createElement('iframe');
      frame.sandbox = 'allow-same-origin';
      frame.style.display = 'none';
      document.body.appendChild(frame);
      frame.contentDocument.body.innerHTML = html;

      var sanitizedContent = new DocumentFragment();
      for ( var i = 0; i < frame.contentDocument.body.children.length; i++ ) {
        copyNodes(sanitizedContent, frame.contentDocument.body.children[i]);
      }
      document.body.removeChild(frame);
      return sanitizedContent;
    },

    addAttachment: function(file) {
      var id   = 'att' + {}.$UID;
      console.log('file: ', file, id);
      this.publish('attachmentAdded', file, id);
      return id;
    },

    removeImage: function(imageID) {
      var e = this.document.getElementById(imageID);
      if ( e ) {
        e.outerHTML = '';
        this.value.set(this.document.body.innerHTML);
      }
    },

    destroy: function() {
      Events.unlink(this.domValue, this.value);
    },

    textToValue: function(text) { return text; },

    valueToText: function(value) { return value; },

    setForegroundColor: function(color) {
      this.$.contentWindow.focus();
      this.document.execCommand("foreColor", false, color);
    },

    setBackgroundColor: function(color) {
      this.$.contentWindow.focus();
      this.document.execCommand("backColor", false, color);
    }
  },

  actions: [
    {
      name: 'bold',
      label: '<b>B</b>',
      help: 'Bold (Ctrl-B)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("bold");
      }
    },
    {
      name: 'italic',
      label: '<i>I</i>',
      help: 'Italic (Ctrl-I)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("italic");
      }
    },
    {
      name: 'underline',
      label: '<u>U</u>',
      help: 'Underline (Ctrl-U)',
      action: function () {
        this.$.contentWindow.focus();
        this.document.execCommand("underline");
      }
    },
    {
      name: 'link',
      label: 'Link',
      help: 'Insert link (Ctrl-K)',
      action: function () {
        // TODO: determine the actual location to position
        Link.create({
          richTextView: this,
          label: this.getSelectionText()}).open(5,120);
      }
    },
    {
      name: 'fontSize',
      label: 'Font Size',
      help: 'Change the font size.',
      action: function(){}
    },
    {
      name: 'small',
      help: 'Set\'s the font size to small.',
      label: 'small',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "2");
      }
    },
    {
      name: 'normal',
      help: 'Set\'s the font size to normal.',
      label: 'normal',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "3");
      }
    },
    {
      name: 'large',
      help: 'Set\'s the font size to small.',
      label: 'large',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "5");
      }
    },
    {
      name: 'huge',
      help: 'Set\'s the font size to huge.',
      label: 'huge',
      parent: 'fontSize',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontSize", false, "7");
      }
    },
    {
      name: 'fontFace',
      help: 'Set\'s the font face.',
      label: 'Font',
    },
    {
      name: 'sansSerif',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial, sans-serif");
      }
    },
    {
      name: 'serif',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "times new roman, serif");
      }
    },
    {
      name: 'wide',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial bold, sans-serif");
      }
    },
    {
      name: 'narrow',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "arial narrow, sans-serif");
      }
    },
    {
      name: 'comicSans',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "comic sans, sans-serif");
      }
    },
    {
      name: 'courierNew',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "courier new, monospace");
      }
    },
    {
      name: 'garamond',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "garamond, sans-serif");
      }
    },
    {
      name: 'georgia',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "georgia, sans-serif");
      }
    },
    {
      name: 'tahoma',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "tahoma, sans-serif");
      }
    },
    {
      name: 'trebuchet',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "trebuchet ms, sans-serif");
      }
    },
    {
      name: 'verdana',
      help: 'Set\'s the font face.',
      parent: 'fontFace',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("fontName", false, "verdana, sans-serif");
      }
    },
    {
      name: 'removeFormatting',
      help: 'Removes formatting from the current selection.',
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("removeFormat");
      }
    },
    {
      name: 'justification',
      action: function(){}
    },
    {
      name: 'leftJustify',
      parent: 'justification',
      help: 'Align Left (Ctrl-Shift-W)',
      // Ctrl-Shift-L
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("justifyLeft");
      }
    },
    {
      name: 'centerJustify',
      parent: 'justification',
      help: 'Align Center (Ctrl-Shift-E)',
      // Ctrl-Shift-E
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand("justifyCenter");
      }
    },
    {
      name: 'rightJustify',
      parent: 'justification',
      help: 'Align Right (Ctrl-Shift-R)',
      // Ctrl-Shift-R
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('justifyRight');
      }
    },
    {
      name: 'numberedList',
      help: 'Numbered List (Ctrl-Shift-7)',
      // Ctrl-Shift-7
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('insertOrderedList');
      }
    },
    {
      name: 'bulletList',
      help: 'Bulleted List (Ctrl-Shift-7)',
      // Ctrl-Shift-8
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('insertUnorderedList');
      }
    },
    {
      name: 'decreaseIndentation',
      help: 'Indent Less (Ctrl-[)',
      // Ctrl-[
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('outdent');
      }
    },
    {
      name: 'increaseIndentation',
      help: 'Indent More (Ctrl-])',
      // Ctrl-]
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('indent');
      }
    },
    {
      name: 'blockQuote',
      help: 'Quote (Ctrl-Shift-9)',
      // Ctrl-Shift-9
      action: function() {
        this.$.contentWindow.focus();
        this.document.execCommand('formatBlock', false, '<blockquote>');
      }
    }
  ]
});

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

// TODO: Move any missing functionality to ChoiceView and then delete this.

var ListChoiceViewRenderer = {
  start: function(id) {
    return '<ul id="' + id + '"/>';
  },
  choice: function(name, c, autoId, index, isCurrentSelection) {
    return '<li id="' + autoId + '" name="' + name + '"' +
      (isCurrentSelection ? ' class="' + this.selectedCssClass + '"' : '') +
      ' value="' + index + '">' + c.n.toString() + '</li>';
  },
  end: function() {
    return '</ul>';
  }
};

FOAModel({
  name:  'ListChoiceView',

  extendsModel: 'View',

  properties: [
    {
      name:  'name',
      type:  'String',
      defaultValue: 'field'
    },
    {
      name:  'helpText',
      type:  'String',
      defaultValue: undefined
    },
    {
      name:  'cssClass',
      type:  'String',
      defaultValue: 'foamListChoiceView'
    },
    {
      name:  'selectedCssClass',
      type:  'String',
      defaultValue: 'foamListChoiceViewSelected'
    },
    {
      name:  'value',
      type:  'Value',
      factory: function() { return SimpleValue.create(""); },
    },
    {
      name:  'choicesDao',
      type:  'DAO',
      help:  'A DAO providing choices to populate the list.',
      defaultValue: undefined,
      postSet: function(_, newValue) {
        newValue.listen({
          put: EventService.merged(this.updateHTML.bind(this), 500),
          remove: EventService.merged(this.updateHTML.bind(this), 500)
        });
      }
    },
    {
      name:  'displayNameProperty',
      type:  'Property',
      help:  'The property used to retrieve the display name from the DAO'
      //defaultValue: { f: this.displayName.bind(this) }
    },
    {
      name:  'valueProperty',
      type:  'Property',
      help:  'The property used to retieve the value from the DAO'
      //defaultValue: { f: this.value.bind(this) }
    },
    {
      name:  'renderableProperty',
      type:  'Property',
      help:  'The property used to query the DOA to see if the choice is renderable.',
      defaultValue: { f: function() { return true; } }
    },
    {
      name:  'choices',
      type:  'Array[StringField]',
      help: 'Array of choices or array of { n: name, v: value } pairs.',
      defaultValue: [],
      postSet: function() {
      }
    },
    {
      name:  'initialSelectionValue',
      type:  'Value',
      factory: function() { return SimpleValue.create(); }
    },
    {
      name:  'renderer',
      help:  'The renderer that renders the view.',
      defaultValue:  ListChoiceViewRenderer
    }
  ],

  methods: {
    toHTML: function() {
      var renderer = this.renderer;
      var out = renderer.start(this.id) + renderer.end();
      return out;
    },

    updateHTML: function() {
      var self = this;
      if ( this.choicesDao ) {
        var choices = [];
        this.choicesDao.select({ put: function(c) {
          if ( self.renderableProperty.f(c) ) {
            c = { n: self.displayNameProperty.f(c), v: self.valueProperty.f(c), o: c };
            choices.push(c);
          }
        }})(function() {
          var oldChoices = self.choices;
          if (oldChoices != choices) {
            self.choices = choices;
            self.listToHTML();
          }
        });
      } else {
        self.listToHTML();
      }
    },

    listToHTML: function() {
      var out = [];

      // TODO
      if ( this.helpText ) {
      }

      for ( var i = 0 ; i < this.choices.length ; i++ ) {
        var choice = this.choices[i];
        var id     = this.nextID();
        var name   = this.name;

        try {
          this.on('click', this.onClick, id);
          this.on('mouseover', this.onMouseOver, id);
          this.on('mouseout', this.onMouseOut, id);
        } catch (x) {
        }

        var isCurrentSelection = this.prev ? choice.v == this.prev.get() :
          this.value ? choice.v == this.value.get() :
          choice.v == this.initialSelectedValue.get();

        out.push(this.renderer.choice(name, choice, id, i, isCurrentSelection));
      }

      this.$.innerHTML = out.join('');

      selectedAsList = this.$.getElementsByClassName(this.selectedCssClass);
      if ( selectedAsList && selectedAsList.length ) {
        this.selectedElement = selectedAsList[0];
      }

      View.getPrototype().initHTML.call(this);
    },

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      this.value = value;
    },

    initHTML: function() {
      var e = this.$;

      Events.dynamic(function() { this.choices; }.bind(this), this.listToHTML.bind(this));

      this.updateHTML();

      this.setValue(this.value);
    },

    indexToValue: function(v) {
      var i = parseInt(v);
      if ( isNaN(i) ) return v;

      return this.choices[i].v;
    },

    evtToValue: function(e) {
      var labelView = e.target;
      while (labelView.parentNode != this.$) {
        labelView = labelView.parentNode;
      }
      return this.indexToValue(labelView.getAttribute('value'));
    }
  },

  listeners:
  [
    {
      name: 'onMouseOver',
      code: function(e) {
        if ( this.timer_ ) window.clearTimeout(this.timer_);
        this.prev = ( this.prev === undefined ) ? this.value.get() : this.prev;
        this.value.set(this.evtToValue(e));
      }
    },

    {
      name: 'onMouseOut',
      code: function(e) {
        if ( this.timer_ ) window.clearTimeout(this.timer_);
        this.timer_ = window.setTimeout(function() {
          this.value.set(this.prev || "");
          this.prev = undefined;
        }.bind(this), 1);
      }
    },

    {
      name: 'onClick',
      code: function(e) {
        this.prev = this.evtToValue(e);
        this.value.set(this.prev);
        if (this.selectedElement) {
          this.selectedElement.className = '';
        }
        e.target.className = 'selected';
        this.selectedElement = e.target;
      }
    }
  ]
});

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
FOAModel({
  name:  'ScrollCView',

  extendsModel: 'CView',

  properties: [
    {
      name:  'parent',
      type:  'CView',
      hidden: true,
      postSet: function(oldValue, newValue) {
        //         oldValue && oldValue.removeListener(this.updateValue);
        //         newValue.addListener(this.updateValue);
        var e = newValue && newValue.$;
        if ( ! e ) return;
        e.addEventListener('mousedown', this.mouseDown, false);
        e.addEventListener('touchstart', this.touchStart, false);
        //           e.addEventListener('mouseup',   this.mouseUp,   false);
      }
    },
    {
      name:  'vertical',
      type:  'boolean',
      defaultValue: true
    },
    {
      name:  'value',
      type:  'int',
      help:  'The first element being shown, starting at zero.',
      preSet: function(_, value) { return Math.max(0, Math.min(this.size-this.extent, value)); },
      defaultValue: 0
    },
    {
      name:  'extent',
      help:  'Number of elements shown.',
      type:  'int',
      minValue: 1,
      defaultValue: 10
    },
    {
      name:  'size',
      type:  'int',
      defaultValue: 0,
      help:  'Total number of elements being scrolled through.',
      postSet: function() { this.paint(); }
    },
    {
      name:  'minHandleSize',
      type:  'int',
      defaultValue: 10,
      help:  'Minimum size to make the drag handle.'
    },
    {
      name: 'startY',
      type: 'int',
      defaultValue: 0
    },
    {
      name: 'startValue',
      help: 'Starting value or current drag operation.',
      type: 'int',
      defaultValue: 0
    },
    {
      name:  'handleColor',
      type:  'String',
      defaultValue: 'rgb(107,136,173)'
    },
    {
      name:  'borderColor',
      type:  'String',
      defaultValue: '#555'
    }
  ],

  listeners: {
    mouseDown: function(e) {
      //       this.parent.$.addEventListener('mousemove', this.mouseMove, false);
      this.startY = e.y - e.offsetY;
      e.target.ownerDocument.defaultView.addEventListener('mouseup', this.mouseUp, true);
      e.target.ownerDocument.defaultView.addEventListener('mousemove', this.mouseMove, true);
      e.target.ownerDocument.defaultView.addEventListener('touchstart', this.touchstart, true);
      this.mouseMove(e);
    },
    mouseUp: function(e) {
      e.preventDefault();
      e.target.ownerDocument.defaultView.removeEventListener('mousemove', this.mouseMove, true);
      e.target.ownerDocument.defaultView.removeEventListener('mouseup', this.mouseUp, true);
      //       this.parent.$.removeEventListener('mousemove', this.mouseMove, false);
    },
    mouseMove: function(e) {
      var y = e.y - this.startY;
      e.preventDefault();

      this.value = Math.max(0, Math.min(this.size - this.extent, Math.round((y - this.y ) / (this.height-4) * this.size)));
    },
    touchStart: function(e) {
      this.startY = e.targetTouches[0].pageY;
      this.startValue = this.value;
      e.target.ownerDocument.defaultView.addEventListener('touchmove', this.touchMove, false);
      //       this.parent.$.addEventListener('touchmove', this.touchMove, false);
      this.touchMove(e);
    },
    touchEnd: function(e) {
      e.target.ownerDocument.defaultView.removeEventListener('touchmove', this.touchMove, false);
      e.target.ownerDocument.defaultView.removeEventListener('touchend', this.touchEnd, false);
      //       this.parent.$.removeEventListener('touchmove', this.touchMove, false);
    },
    touchMove: function(e) {
      var y = e.targetTouches[0].pageY;
      e.preventDefault();
      this.value = Math.max(0, Math.min(this.size - this.extent, Math.round(this.startValue + (y - this.startY) / (this.height-4) * this.size )));
    }
  },

  methods: {

    paint: function() {
      if ( ! this.size ) return;

      var c = this.canvas;
      if ( ! c ) return;

      this.erase();

      if ( this.extent >= this.size ) return;

      c.strokeStyle = this.borderColor;
      c.strokeRect(this.x, this.y, this.width-7, this.height);

      c.fillStyle = this.handleColor;

      var h = this.height-8;
      var handleSize = this.extent / this.size * h;

      if ( handleSize < this.minHandleSize ) {
        handleSize = this.minHandleSize;
        h -= this.minHandleSize - handleSize;
      }

      c.fillRect(
        this.x+2,
        this.y + 2 + this.value / this.size * h,
        this.width - 11,
        this.y + 4 + handleSize);
    },

    destroy: function() {
      //      this.value.removeListener(this.listener_);
    }
  }
});


/** Add a scrollbar around an inner-view. **/
FOAModel({
  name:  'ScrollBorder',

  extendsModel: 'View',

  properties: [
    {
      name: 'view',
      type: 'view',
      postSet: function(_, view) {
        this.scrollbar.extent = this.view.rows;
      }
    },
    {
      name: 'scrollbar',
      type: 'ScrollCView',
      factory: function() {
        var sb = ScrollCView.create({height:1800, width: 20, x: 0, y: 0, extent: 10});

        if ( this.dao ) this.dao.select(COUNT())(function(c) { sb.size = c.count; });

        return sb;
      }
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      hidden: true,
      required: true,
      postSet: function(oldValue, newValue) {
        this.view.dao = newValue;
        var self = this;

        if ( this.dao ) this.dao.select(COUNT())(function(c) {
          self.scrollbar.size = c.count;
          self.scrollbar.value = Math.max(0, Math.min(self.scrollbar.value, self.scrollbar.size - self.scrollbar.extent));
          if ( self.dao ) self.view.dao = self.dao.skip(self.scrollbar.value);
        });
        /*
          if ( oldValue && this.listener ) oldValue.unlisten(this.listener);
          this.listener && val.listen(this.listener);
          this.repaint_ && this.repaint_();
        */
      }
    }
  ],

  listeners: [
    {
      name: 'layout',
      code: function() {
        this.view.layout();
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<table id="' + this.id + '" width=100% height=100% border=0><tr><td valign=top>' +
        this.view.toHTML() +
        '</td><td valign=top><div class="scrollSpacer"></div>' +
        this.scrollbar.toHTML() +
        '</td></tr></table>';
    },
    initHTML: function() {
      window.addEventListener('resize', this.layout, false);
      this.view.initHTML();
      this.scrollbar.initHTML();
      this.scrollbar.paint();

      var view = this.view;
      var scrollbar = this.scrollbar;
      var self = this;

      view.$.onmousewheel = function(e) {
        if ( e.wheelDeltaY > 0 && scrollbar.value ) {
          scrollbar.value--;
        } else if ( e.wheelDeltaY < 0 && scrollbar.value < scrollbar.size - scrollbar.extent ) {
          scrollbar.value++;
        }
      };
      scrollbar.addPropertyListener('value', EventService.animate(function() {
        if ( self.dao ) self.view.dao = self.dao.skip(scrollbar.value);
      }));

      /*
        Events.dynamic(function() {scrollbar.value;}, );
      */
      Events.dynamic(function() {view.rows;}, function() {
        scrollbar.extent = view.rows;
      });
      Events.dynamic(function() {view.height;}, function() {
        scrollbar.height = Math.max(view.height - 26, 0);
      });

      this.layout();
    }
  }
});

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
// TODO: remove these three redundant definitions when
// meta-weirdness fixed

Property.getPrototype().partialEval = function() { return this; };

Property.getPrototype().toSQL = function() { return this.name; };

Property.getPrototype().toMQL = function() { return this.name; };

Property.getPrototype().f = function(obj) { return obj[this.name]; };

Property.getPrototype().compare = function(o1, o2) {
  return this.compareProperty(this.f(o1), this.f(o2));
};


// TODO: add type-checking in partialEval
//  (type-checking is a subset of partial-eval)

FOAModel({
  name: 'Expr',

  package: 'foam.mlang',

  methods: {
    // Mustang Query Language
    toMQL: function() {
      return this.toString();
    },
    toSQL: function() {
      return this.toString();
    },
    collectInputs: function(terms) {
      terms.push(this);
    },
    partialEval: function() { return this; },
    minterm: function(index, term) {
      // True if this bit is set in the minterm number.
      return !!((term >>> index[0]--) & 1 );
    },
    normalize: function() {
      // Each input term to the expression.
      var inputs = [];
      this.collectInputs(inputs);

      // Truth table for every minterm (combination of inputs).
      var minterms = new Array(Math.pow(2, inputs.length));

      for ( var i = 0; i < minterms.length; i++ ) {
        minterms[i] = this.minterm([inputs.length - 1], i);
      }

      // TODO: Calculate prime implicants and reduce to minimal set.
      var terms = [];
      for ( i = 0; i < minterms.length; i++ ) {
        if ( minterms[i] ) {
          var subterms = [];
          for ( var j = 0; j < inputs.length; j++ ) {
            if ( i & (1 << (inputs.length - j - 1))) subterms.push(inputs[j]);
          }
          terms.push(AndExpr.create({ args: subterms }));
        }
      }
      return OrExpr.create({ args: terms }).partialEval();
    },
    toString: function() { return this.label_; },
    pipe: function(sink) {
      var expr = this;
      return {
        __proto__: sink,
        put:    function(obj) { if ( expr.f(obj) ) sink.put(obj);   },
        remove: function(obj) { if ( expr.f(obj) ) sink.remove(obj); }
      };
    }
  }
});


var TRUE = (FOAM({
  model_: 'Model',
  name: 'TRUE',
  extendsModel: 'Expr',

  methods: {
    toSQL: function() { return '( 1 = 1 )'; },
    toMQL: function() { return ''; },
    f:     function() { return true; }
  }
})).create();


var FALSE = (FOAM({
  model_: 'Model',
  name: 'FALSE',
  extendsModel: 'Expr',

  methods: {
    toSQL: function(out) { return '( 1 <> 1 )'; },
    toMQL: function(out) { return '<false>'; },
    f:     function() { return false; }
  }
})).create();

var IDENTITY = (FOAM({
  model_: 'Model',
  name: 'IDENTITY',
  extendsModel: 'Expr',

  methods: {
    f: function(obj) { return obj; },
    toString: function() { return 'IDENTITY'; }
  }
})).create();

/** An n-ary function. **/
FOAModel({
  name: 'NARY',

  extendsModel: 'Expr',
  abstract: true,

  properties: [
    {
      name:  'args',
      label: 'Arguments',
      type:  'Expr[]',
      help:  'Sub-expressions',
      factory: function() { return []; }
    }
  ],

  methods: {
    toSQL: function() {
      var s;
      s = this.model_.label;
      s += '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length-1 ) out.push(',');
      }
      s += ')';
      return s;
    },
    toMQL: function() {
      var s;
      s = this.model_.label;
      s += '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toMQL();
        if ( i < this.args.length-1 ) out.push(',');
      }
      s += ')';
      return str;
    }
  }
});


/** An unary function. **/
FOAModel({
  name: 'UNARY',

  extendsModel: 'Expr',
  abstract: true,

  properties: [
    {
      name:  'arg1',
      label: 'Argument',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE
    }
  ],

  methods: {
    toSQL: function() {
      return this.label_ + '(' + this.arg1.toSQL() + ')';
    },
    toMQL: function() {
      return this.label_ + '(' + this.arg1.toMQL() + ')';
    }
  }
});


/** An unary function. **/
FOAModel({
  name: 'BINARY',

  extendsModel: 'UNARY',
  abstract: true,

  properties: [
    {
      name:  'arg2',
      label: 'Argument',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE
    }
  ],

  methods: {
    toSQL: function() {
      return this.arg1.toSQL() + ' ' + this.label_ + ' ' + this.arg2.toSQL();
    },
    toMQL: function() {
      return this.arg1.toMQL() + ' ' + this.label_ + ' ' + this.arg2.toMQL();
    }
  }
});


FOAModel({
  name: 'AndExpr',

  extendsModel: 'NARY',
  abstract: true,

  methods: {
    // AND has a higher precedence than OR so doesn't need parenthesis
    toSQL: function() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length-1 ) s += (' AND ');
      }
      return s;
    },
    toMQL: function() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        var sub = a.toMQL();
        if ( OrExpr.isInstance(a) ) {
          sub = '(' + sub + ')';
        }
        s += sub;
        if ( i < this.args.length-1 ) s += (' ');
      }
      return s;
    },
    collectInputs: function(terms) {
      for ( var i = 0; i < this.args.length; i++ ) {
        this.args[i].collectInputs(terms);
      }
    },
    minterm: function(index, term) {
      var out = true;
      for ( var i = 0; i < this.args.length; i++ ) {
        out = this.args[i].minterm(index, term) && out;
      }
      return out;
    },

    partialEval: function() {
      var newArgs = [];
      var updated = false;

      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a    = this.args[i];
        var newA = this.args[i].partialEval();

        if ( newA === FALSE ) return FALSE;

        if ( AndExpr.isInstance(newA) ) {
          // In-line nested AND clauses
          for ( var j = 0 ; j < newA.args.length ; j++ ) {
            newArgs.push(newA.args[j]);
          }
          updated = true;
        }
        else {
          if ( newA === TRUE ) {
            updated = true;
          } else {
            newArgs.push(newA);
            if ( a !== newA ) updated = true;
          }
        }
      }

      if ( newArgs.length == 0 ) return TRUE;
      if ( newArgs.length == 1 ) return newArgs[0];

      return updated ? AndExpr.create({args: newArgs}) : this;
    },

    f: function(obj) {
      return this.args.every(function(arg) {
        return arg.f(obj);
      });
    }
  }
});


FOAModel({
  name: 'OrExpr',

  extendsModel: 'NARY',
  abstract: true,

  methods: {
    toSQL: function() {
      var s;
      s = '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length-1 ) s += (' OR ');
      }
      s += ')';
      return s;
    },
    toMQL: function() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toMQL();
        if ( i < this.args.length-1 ) s += (' OR ');
      }
      return s;
    },

    collectInputs: function(terms) {
      for ( var i = 0; i < this.args.length; i++ ) {
        this.args[i].collectInputs(terms);
      }
    },

    minterm: function(index, term) {
      var out = false;
      for ( var i = 0; i < this.args.length; i++ ) {
        out = this.args[i].minterm(index, term) || out;
      }
      return out;
    },

    partialEval: function() {
      var newArgs = [];
      var updated = false;

      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a    = this.args[i];
        var newA = this.args[i].partialEval();

        if ( newA === TRUE ) return TRUE;

        if ( OrExpr.isInstance(newA) ) {
          // In-line nested OR clauses
          for ( var j = 0 ; j < newA.args.length ; j++ ) {
            newArgs.push(newA.args[j]);
          }
          updated = true;
        }
        else {
          if ( newA !== FALSE ) {
            newArgs.push(newA);
          }
          if ( a !== newA ) updated = true;
        }
      }

      if ( newArgs.length == 0 ) return FALSE;
      if ( newArgs.length == 1 ) return newArgs[0];

      return updated ? OrExpr.create({args: newArgs}) : this;
    },

    f: function(obj) {
      return this.args.some(function(arg) {
        return arg.f(obj);
      });
    }
  }
});


FOAModel({
  name: 'NotExpr',

  extendsModel: 'UNARY',
  abstract: true,

  methods: {
    toSQL: function() {
      return 'not ( ' + this.arg1.toSQL() + ' )';
    },
    toMQL: function() {
      return '-( ' + this.arg1.toMQL() + ' )';
    },
    collectInputs: function(terms) {
      this.arg1.collectInputs(terms);
    },

    minterm: function(index, term) {
      return ! this.arg1.minterm(index, term);
    },

    partialEval: function() {
      var newArg = this.arg1.partialEval();

      if ( newArg === TRUE ) return FALSE;
      if ( newArg === FALSE ) return TRUE;
      if ( NotExpr.isInstance(newArg) ) return newArg.arg1;
      if ( EqExpr.isInstance(newArg)  ) return NeqExpr.create(newArg);
      if ( NeqExpr.isInstance(newArg) ) return EqExpr.create(newArg);
      if ( LtExpr.isInstance(newArg)  ) return GteExpr.create(newArg);
      if ( GtExpr.isInstance(newArg)  ) return LteExpr.create(newArg);
      if ( LteExpr.isInstance(newArg) ) return GtExpr.create(newArg);
      if ( GteExpr.isInstance(newArg) ) return LtExpr.create(newArg);

      return this.arg1 === newArg ? this : NOT(newArg);
    },

    f: function(obj) { return ! this.arg1.f(obj); }
  }
});


FOAModel({
  name: 'DescribeExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'plan',
      help:  'Execution Plan',
      defaultValue: ""
    }
  ],

  methods: {
    toString: function() { return this.plan; },
    toSQL: function() { return this.arg1.toSQL(); },
    toMQL: function() { return this.arg1.toMQL(); },
    partialEval: function() {
      var newArg = this.arg1.partialEval();

      return this.arg1 === newArg ? this : EXPLAIN(newArg);
    },
    f: function(obj) { return this.arg1.f(obj); }
  }
});


FOAModel({
  name: 'EqExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '=' + this.arg2.toSQL(); },
    toMQL: function() {
      return this.arg2 === TRUE ?
        'is:' + this.arg1.toMQL() :
        this.arg1.toMQL() + '=' + this.arg2.toMQL();
    },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() == newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 !== newArg2 ?
        EqExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) {
      var arg1 = this.arg1.f(obj);
      var arg2 = this.arg2.f(obj);

      if ( Array.isArray(arg1) ) {
        return arg1.some(function(arg) {
          return arg == arg2;
        });
      }

      if ( arg2 === TRUE ) return !! arg1;
      if ( arg2 === FALSE ) return ! arg1;

      return arg1 == arg2;
    }
  }
});

FOAModel({
  name: 'InExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'arg2',
      label: 'Argument',
      type:  'Expr',
      help:  'Sub-expression',
      postSet: function() { this.valueSet_ = undefined; }
    }
  ],

  methods: {
    valueSet: function() {
      if ( ! this.valueSet_ ) {
        var s = {};
        for ( var i = 0 ; i < this.arg2.length ; i++ ) s[this.arg2[i]] = true;
        this.valueSet_ = s;
      }
      return this.valueSet_;
    },
    toSQL: function() { return this.arg1.toSQL() + ' IN ' + this.arg2; },
    toMQL: function() { return this.arg1.toMQL() + '=' + this.arg2.join(',') },

    f: function(obj) {
      return this.valueSet().hasOwnProperty(this.arg1.f(obj));
    }
  }
});

FOAModel({
  name: 'ContainsExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    toMQL: function() { return this.arg1.toMQL() + ':' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f().indexOf(newArg2.f()) != -1);
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        ContainsExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) {
      var arg1 = this.arg1.f(obj);
      var arg2 = this.arg2.f(obj);

      if ( Array.isArray(arg1) ) {
        return arg1.some(function(arg) {
          return arg.indexOf(arg2) != -1;
        });
      }

      return arg1.indexOf(arg2) != -1;
    }
  }
});


FOAModel({
  name: 'ContainsICExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'arg2',
      label: 'Argument',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE,
      postSet: function(_, value) {
        // Escape Regex escape characters
        this.pattern_ = new RegExp(value.f().toString().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      }
    }
  ],

  methods: {
    // No different that the non IC-case
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    toMQL: function() { return this.arg1.toMQL() + ':' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f().toLowerCase().indexOf(newArg2.f()) != -1);
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        ContainsICExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) {
      var arg1 = this.arg1.f(obj);

      if ( Array.isArray(arg1) ) {
        var pattern = this.pattern_;

        return arg1.some(function(arg) {
          return pattern.test(arg);
        });
      }

      return this.pattern_.test(arg1);
    }
  }
});


FOAModel({
  name: 'NeqExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '<>' + this.arg2.toSQL(); },
    toMQL: function() { return '-' + this.arg1.toMQL() + '=' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() != newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        NeqExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) != this.arg2.f(obj); }
  }
});

FOAModel({
  name: 'LtExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '<' + this.arg2.toSQL(); },
    toMQL: function() { return this.arg1.toMQL() + '-before:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() < newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        LtExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) < this.arg2.f(obj); }
  }
});

FOAModel({
  name: 'GtExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '>' + this.arg2.toSQL(); },
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() > newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        GtExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) > this.arg2.f(obj); }
  }
});

FOAModel({
  name: 'LteExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '<=' + this.arg2.toSQL(); },
    toMQL: function() { return this.arg1.toMQL() + '-before:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() <= newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        LtExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) <= this.arg2.f(obj); }
  }
});

FOAModel({
  name: 'GteExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '>=' + this.arg2.toSQL(); },
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() >= newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        GtExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) >= this.arg2.f(obj); }
  }
});


// TODO: A TrieIndex would be ideal for making this very fast.
FOAModel({
  name: 'StartsWithExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    // TODO: Does MQL support this operation?
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f().startsWith(newArg2.f()));
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        StartsWithExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj).startsWith(this.arg2.f(obj)); }
  }
});


FOAModel({
  name: 'ConstantExpr',

  extendsModel: 'UNARY',

  methods: {
    escapeSQLString: function(str) {
      return "'" +
        str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") +
        "'";
    },
    escapeMQLString: function(str) {
      if ( str.length > 0 && str.indexOf(' ') == -1 && str.indexOf('"') == -1 && str.indexOf(',') == -1 ) return str;
      return '"' +
        str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
        '"';
    },
    toSQL: function() {
      return ( typeof this.arg1 === 'string' ) ?
        this.escapeSQLString(this.arg1) :
        this.arg1.toString() ;
    },
    toMQL: function() {
      return ( typeof this.arg1 === 'string' ) ?
        this.escapeMQLString(this.arg1) :
        (this.arg1.toMQL ? this.arg1.toMQL() :
         this.arg1.toString());
    },
    f: function(obj) { return this.arg1; }
  }
});


FOAModel({
  name: 'ConcatExpr',
  extendsModel: 'NARY',

  label: 'concat',

  methods: {

    partialEval: function() {
      // TODO: implement
      return this;
    },

    f: function(obj) {
      var str = [];

      for ( var i = 0 ; i < this.args.length ; i++ ) {
        str.push(this.args[i].f(obj));
      }

      return str.join('');
    }
  }
});


function compile_(a) {
  return /*Expr.isInstance(a) || Property.isInstance(a)*/ a.f ? a :
    a === true  ? TRUE        :
    a === false ? FALSE       :
    ConstantExpr.create({arg1:a});
}

function compileArray_(args) {
  var b = [];

  for ( var i = 0 ; i < args.length ; i++ ) {
    var a = args[i];

    if ( a !== null && a !== undefined ) b.push(compile_(a));
  }

  return b;
};


FOAModel({
  name: 'SumExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'sum',
      type:  'int',
      help:  'Sum of values.',
      factory: function() { return 0; }
    }
  ],

  methods: {
    pipe: function(sink) { sink.put(this); },
    put: function(obj) { this.instance_.sum += this.arg1.f(obj); },
    remove: function(obj) { this.sum -= this.arg1.f(obj); },
    toString: function() { return this.sum; }
  }
});


FOAModel({
  name: 'AvgExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'count',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'sum',
      type:  'int',
      help:  'Sum of values.',
      defaultValue: 0
    },
    {
      name:  'avg',
      type:  'floag',
      help:  'Average of values.',
      getter: function() { return this.sum / this.count; }
    }
  ],

  methods: {
    pipe: function(sink) { sink.put(this); },
    put: function(obj) { this.count++; this.sum += this.arg1.f(obj); },
    remove: function(obj) { this.count--; this.sum -= this.arg1.f(obj); },
    toString: function() { return this.avg; }
  }
});


FOAModel({
  name: 'MaxExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'max',
      type:  'int',
      help:  'Maximum value.',
      defaultValue: undefined
    }
  ],

  methods: {
    reduce: function(other) {
      return MaxExpr.create({max: Math.max(this.max, other.max)});
    },
    reduceI: function(other) {
      this.max = Math.max(this.max, other.max);
    },
    pipe: function(sink) { sink.put(this); },
    put: function(obj) {
      var v = this.arg1.f(obj);
      this.max = this.max === undefined ? v : Math.max(this.max, v);
    },
    remove: function(obj) { },
    toString: function() { return this.max; }
  }
});


FOAModel({
  name: 'MinExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'min',
      type:  'int',
      help:  'Minimum value.',
      defaultValue: undefined
    }
  ],

  methods: {
    reduce: function(other) {
      return MinExpr.create({max: Math.min(this.min, other.min)});
    },
    reduceI: function(other) {
      this.min = Math.min(this.min, other.min);
    },
    pipe: function(sink) { sink.put(this); },
    put: function(obj) {
      var v = this.arg1.f(obj);
      this.min = this.min === undefined ? v : Math.min(this.min, v);
    },
    remove: function(obj) { },
    toString: function() { return this.min; }
  }
});


FOAModel({
  name: 'DistinctExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'values',
      help:  'Distinct values.',
      factory: function() { return {}; }
    }
  ],

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
      // TODO:
    },
    put: function(obj) {
      var key = this.arg1.f(obj);
      if ( this.values.hasOwnProperty(key) ) return;
      this.values[key] = true;
      this.arg2.put(obj);
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.arg2.toString(); },
    toHTML: function() { return this.arg2.toHTML(); }
  }
});


FOAModel({
  name: 'GroupByExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'groups',
      type:  'Map[Expr]',
      help:  'Groups.',
      factory: function() { return {}; }
    }
  ],

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
      for ( var i in other.groups ) {
        if ( this.groups[i] ) this.groups[i].reduceI(other.groups[i]);
        else this.groups[i] = other.groups[i].deepClone();
      }
    },
    pipe: function(sink) {
      for ( key in this.groups ) {
        sink.push([key, this.groups[key].toString()]);
      }
      return sink;
    },
    put: function(obj) {
      var key = this.arg1.f(obj);
      if ( Array.isArray(key) ) {
        for ( var i = 0 ; i < key.length ; i++ ) {
          var group = this.groups.hasOwnProperty(key[i]) && this.groups[key[i]];
          if ( ! group ) {
            group = this.arg2.clone();
            this.groups[key[i]] = group;
          }
          group.put(obj);
        }
        // Perhaps we should use a key value of undefiend instead of '', since '' may actually
        // be a valid key.
        if ( key.length == 0 ) {
          var group = this.groups.hasOwnProperty('') && this.groups[''];
          if ( ! group ) {
            group = this.arg2.clone();
            this.groups[''] = group;
          }
          group.put(obj);
        }
      } else {
        var group = this.groups.hasOwnProperty(key) && this.groups[key];
        if ( ! group ) {
          group = this.arg2.clone();

          this.groups[key] = group;
        }
        group.put(obj);
      }
    },
    clone: function() {
      // Don't use default clone because we don't want to copy 'groups'
      return GroupByExpr.create({arg1: this.arg1, arg2: this.arg2});
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.groups; },
    deepClone: function() {
      var cl = this.clone();
      cl.groups = {};
      for ( var i in this.groups ) {
        cl.groups[i] = this.groups[i].deepClone();
      }
      return cl;
    },
    toHTML: function() {
      var out = [];

      out.push('<table border=1>');
      for ( var key in this.groups ) {
        var value = this.groups[key];
        var str = value.toHTML ? value.toHTML() : value;
        out.push('<tr><th>', key, '</th><td>', str, '</td></tr>');
      }
      out.push('</table>');

      return out.join('');
    },
    initHTML: function() {
      for ( var key in this.groups ) {
        var value = this.groups[key];
        value.initHTML && value.initHTML();
      }
    }
  }
});


FOAModel({
  name: 'GridByExpr',

  extendsModel: 'Expr',

  properties: [
    {
      name:  'xFunc',
      label: 'X-Axis Function',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE
    },
    {
      name:  'yFunc',
      label: 'Y-Axis Function',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE
    },
    {
      name:  'acc',
      label: 'Accumulator',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE
    },
    {
      name:  'rows',
      type:  'Map[Expr]',
      help:  'Rows.',
      factory: function() { return {}; }
    },
    {
      name:  'cols',
      label: 'Columns',
      type:  'Map[Expr]',
      help:  'Columns.',
      factory: function() { return {}; }
    },
    {
      model_: 'ArrayProperty',
      name: 'children'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      var f = function() {
        self.cols = GROUP_BY(self.xFunc, COUNT());
        self.rows = GROUP_BY(self.yFunc, GROUP_BY(self.xFunc, self.acc));
      };

      self.addPropertyListener('xFunc', f);
      self.addPropertyListener('yFunc', f);
      self.addPropertyListener('acc', f);
      f();
      /*
        Events.dynamic(
        function() { self.xFunc; self.yFunc; self.acc; },
        function() {
        self.cols = GROUP_BY(self.xFunc, COUNT());
        self.rows = GROUP_BY(self.yFunc, GROUP_BY(self.xFunc, self.acc));
        });
      */
    },

    reduce: function(other) {
    },
    reduceI: function(other) {
    },
    pipe: function(sink) {
    },
    put: function(obj) {
      this.rows.put(obj);
      this.cols.put(obj);
    },
    clone: function() {
      // Don't use default clone because we don't want to copy 'groups'
      return this.model_.create({xFunc: this.xFunc, yFunc: this.yFunc, acc: this.acc});
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.groups; },
    deepClone: function() {
    },
    renderCell: function(x, y, value) {
      var str = value ? (value.toHTML ? value.toHTML() : value) : '';
      if ( value && value.toHTML && value.initHTML ) this.children.push(value);
      return '<td>' + str + '</td>';
    },
    sortAxis: function(values, f) { return values.sort(f.compareProperty); },
    sortCols: function(cols, xFunc) { return this.sortAxis(cols, xFunc); },
    sortRows: function(rows, yFunc) { return this.sortAxis(rows, yFunc); },
    sortedCols: function() {
      return this.sortCols(
        Object.getOwnPropertyNames(this.cols.groups),
        this.xFunc);
    },
    sortedRows: function() {
      return this.sortRows(
        Object.getOwnPropertyNames(this.rows.groups),
        this.yFunc);
    },
    toHTML: function() {
      var out;
      this.children = [];
      var cols = this.cols.groups;
      var rows = this.rows.groups;
      var sortedCols = this.sortedCols();
      var sortedRows = this.sortedRows();

      out = '<table border=0 cellspacing=0 class="gridBy"><tr><th></th>';

      for ( var i = 0 ; i < sortedCols.length ; i++ ) {
        var x = sortedCols[i];
        var str = x.toHTML ? x.toHTML() : x;
        out += '<th>' + str + '</th>';
      }
      out += '</tr>';

      for ( var j = 0 ; j < sortedRows.length ; j++ ) {
        var y = sortedRows[j];
        out += '<tr><th>' + y + '</th>';

        for ( var i = 0 ; i < sortedCols.length ; i++ ) {
          var x = sortedCols[i];
          var value = rows[y].groups[x];
          out += this.renderCell(x, y, value);
        }

        out += '</tr>';
      }
      out += '</table>';

      return out;
    },

    initHTML: function() {
      for ( var i = 0; i < this.children.length; i++ ) {
        this.children[i].initHTML();
      }
      this.children = [];
    }
  }
});


FOAModel({
  name: 'MapExpr',

  extendsModel: 'BINARY',

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
    },
    pipe: function(sink) {
    },
    put: function(obj) {
      var val = this.arg1.f ? this.arg1.f(obj) : this.arg1(obj);
      var acc = this.arg2;
      acc.put(val);
    },
    clone: function() {
      // Don't use default clone because we don't want to copy 'groups'
      return MapExpr.create({arg1: this.arg1, arg2: this.arg2.clone()});
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.arg2.toString(); },
    deepClone: function() {
    },
    toHTML: function() {
      return this.arg2.toHTML ? this.arg2.toHTML() : this.toString();
    },
    initHTML: function() {
      this.arg2.initHTML && this.arg2.initHTML();
    }
  }
});


FOAModel({
  name: 'CountExpr',

  extendsModel: 'Expr',

  properties: [
    {
      name:  'count',
      type:  'int',
      defaultValue: 0
    }
  ],

  methods: {
    reduce: function(other) {
      return CountExpr.create({count: this.count + other.count});
    },
    reduceI: function(other) {
      this.count = this.count + other.count;
    },
    pipe: function(sink) { sink.put(this); },
    put: function(obj) { this.count++; },
    remove: function(obj) { this.count--; },
    toString: function() { return this.count; }
  }
});


FOAModel({
  name: 'SeqExpr',

  extendsModel: 'NARY',

  methods: {
    pipe: function(sink) { sink.put(this); },
    put: function(obj) {
      var ret = [];
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        a.put(obj);
      }
    },
    f: function(obj) {
      var ret = [];
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];

        ret.push(a.f(obj));
      }
      return ret;
    },
    clone: function() {
      return SeqExpr.create({args:this.args.clone()});
    },
    toString: function(obj) {
      var out = [];
      out.push('(');
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        out.push(a.toString());
        if ( i < this.args.length-1 ) out.push(',');
      }
      out.push(')');
      return out.join('');
    },
    toHTML: function(obj) {
      var out = [];
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        out.push(a.toHTML ? a.toHTML() : a.toString());
        if ( i < this.args.length-1 ) out.push('&nbsp;');
      }
      return out.join('');
    }
  }
});

FOAModel({
  name: 'UpdateExpr',
  extendsModel: 'NARY',

  label: 'UpdateExpr',

  properties: [
    {
      name: 'dao',
      type: 'DAO',
      transient: true,
      hidden: true
    }
  ],

  methods: {
    // TODO: put this back to process one at a time and then
    // have MDAO wait until it's done before pushing all data.
    put: function(obj) {
      (this.objs_ || (this.objs_ = [])).push(obj);
    },
    eof: function() {
      for ( var i = 0 ; i < this.objs_.length ; i++ ) {
        var obj = this.objs_[i];
        var newObj = this.f(obj);
        if (newObj.id !== obj.id) this.dao.remove(obj.id);
        this.dao.put(newObj);
      }
      this.objs_ = undefined;
    },
    f: function(obj) {
      var newObj = obj.clone();
      for (var i = 0; i < this.args.length; i++) {
        this.args[i].f(newObj);
      }
      return newObj;
    },
    reduce: function(other) {
      return UpdateExpr.create({
        args: this.args.concat(other.args),
        dao: this.dao
      });
    },
    reduceI: function(other) {
      this.args = this.args.concat(other.args);
    },
    toString: function() {
      return this.toSQL();
    },
    toSQL: function() {
      var s = 'SET ';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length-1 ) s += ', ';
      }
      return s;
    }
  }
});

FOAModel({
  name: 'SetExpr',
  label: 'SetExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() { return this.arg1.toSQL() + ' = ' + this.arg2.toSQL(); },
    f: function(obj) {
      // TODO: This should be an assertion when arg1 is set rather than be checked
      // for every invocation.
      if ( Property.isInstance(this.arg1) ) {
        obj[this.arg1.name] = this.arg2.f(obj);
      }
    }
  }
});

function SUM(expr) {
  return SumExpr.create({arg1: expr});
}

function MIN(expr) {
  return MinExpr.create({arg1: expr});
}

function MAX(expr) {
  return MaxExpr.create({arg1: expr});
}

function AVG(expr) {
  return AvgExpr.create({arg1: expr});
}

function COUNT() {
  return CountExpr.create();
}

function SEQ() {
  //  return SeqExpr.create({args: compileArray_.call(null, arguments)});
  return SeqExpr.create({args: argsToArray(arguments)});
}

function UPDATE(expr, dao) {
  return UpdateExpr.create({
    args: compileArray_.call(null, Array.prototype.slice.call(arguments, 0, -1)),
    dao: arguments[arguments.length - 1]
  });
}

function SET(arg1, arg2) {
  return SetExpr.create({ arg1: compile_(arg1), arg2: compile_(arg2) });
}

function GROUP_BY(expr1, expr2) {
  return GroupByExpr.create({arg1: expr1, arg2: expr2});
}

function GRID_BY(xFunc, yFunc, acc) {
  return GridByExpr.create({xFunc: xFunc, yFunc: yFunc, acc: acc});
}

function MAP(fn, opt_sink) {
  return MapExpr.create({arg1: fn, arg2: opt_sink || []});
}

function DISTINCT(fn, sink) {
  return DistinctExpr.create({arg1: fn, arg2: sink});
}

function AND() {
  return AndExpr.create({args: compileArray_.call(null, arguments)});
}

function OR() {
  return OrExpr.create({args: compileArray_.call(null, arguments)});
}

function NOT(arg) {
  return NotExpr.create({arg1: compile_(arg)});
}

function EXPLAIN(arg) {
  return DescribeExpr.create({arg1: arg});
}

function IN(arg1, arg2) {
  return InExpr.create({arg1: compile_(arg1), arg2: arg2 });
}

function EQ(arg1, arg2) {
  var eq = EqExpr.create();
  eq.instance_.arg1 = compile_(arg1);
  eq.instance_.arg2 = compile_(arg2);
  return eq;
  //  return EqExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

// TODO: add EQ_ic

function NEQ(arg1, arg2) {
  return NeqExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function LT(arg1, arg2) {
  return LtExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function GT(arg1, arg2) {
  return GtExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function LTE(arg1, arg2) {
  return LteExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function GTE(arg1, arg2) {
  return GteExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function STARTS_WITH(arg1, arg2) {
  return StartsWithExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function CONTAINS(arg1, arg2) {
  return ContainsExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function CONTAINS_IC(arg1, arg2) {
  return ContainsICExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function CONCAT() {
  return ConcatExpr.create({args: compileArray_.call(null, arguments)});
}


FOAModel({
  name: 'ExpandableGroupByExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'groups',
      type:  'Map[Expr]',
      help:  'Groups.',
      factory: function() { return {}; }
    },
    {
      name:  'expanded',
      type:  'Map',
      help:  'Expanded.',
      factory: function() { return {}; }
    },
    {
      name:  'values',
      type:  'Object',
      help:  'Values',
      factory: function() { return []; }
    }
  ],

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
      // TODO:
    },
    /*
      pipe: function(sink) {
      for ( key in this.groups ) {
      sink.push([key, this.groups[key].toString()]);
      }
      return sink;
      },*/
    select: function(sink, options) {
      var self = this;
      this.values.select({put: function(o) {
        sink.put(o);
        var key = self.arg1.f(o);
        var a = o.children;
        if ( a ) for ( var i = 0 ; i < a.length ; i++ ) sink.put(a[i]);
      }}, options);
      return aconstant(sink);
    },
    putKeyValue_: function(key, value) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];

      if ( ! group ) {
        group = value.clone();
        if ( this.expanded[key] ) group.children = [];
        this.groups[key] = group;
        group.count = 1;
        this.values.push(group);
      } else {
        group.count++;
      }

      if ( group.children ) group.children.push(obj);
    },
    put: function(obj) {
      var key = this.arg1.f(obj);

      if ( Array.isArray(key) ) {
        for ( var i = 0 ; i < key.length ; i++ ) this.putKeyValue_(key[i], obj);
      } else {
        this.putKeyValue_(key, obj);
      }
    },
    where: function(query) {
      return filteredDAO(query, this);
    },
    limit: function(count) {
      return limitedDAO(count, this);
    },
    skip: function(skip) {
      return skipDAO(skip, this);
    },

    orderBy: function() {
      return orderedDAO(arguments.length == 1 ? arguments[0] : argsToArray(arguments), this);
    },
    listen: function() {},
    unlisten: function() {},
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.groups; },
    deepClone: function() {
      return this;
    }
  }
});

FOAModel({
  name: 'TreeExpr',

  extendsModel: 'Expr',

  properties: [
    {
      name: 'parentProperty'
    },
    {
      name: 'childrenProperty'
    },
    {
      name: 'items_',
      help: 'Temporary map to store collected objects.',
      factory: function() { return {}; },
      transient: true
    },
    {
      model_: 'ArrayProperty',
      name: 'roots'
    }
  ],

  methods: {
    put: function(o) {
      this.items_[o.id] = o;
      if ( ! this.parentProperty.f(o) ) {
        this.roots.push(o);
      }
    },
    eof: function() {
      var pprop = this.parentProperty;
      var cprop = this.childrenProperty;

      for ( var key in this.items_ ) {
        var item = this.items_[key];
        var parentId = pprop.f(item);
        if ( ! parentId ) continue;
        var parent = this.items_[parentId];

        parent[cprop.name] = cprop.f(parent).concat(item);
      }

      // Remove temporary holder this.items_.
      this.items_ = {};
    },
  }
});

function TREE(parentProperty, childrenProperty) {
  return TreeExpr.create({
    parentProperty: parentProperty,
    childrenProperty: childrenProperty
  });
}

FOAModel({
  name: 'DescExpr',

  extendsModel: 'UNARY',

  methods: {
    toMQL: function() {
      return '-' + this.arg1.toMQL();
    },
    compare: function(o1, o2) {
      return -1 * this.arg1.compare(o1, o2);
    }
  }
});

FOAModel({
  name: 'AddExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() {
      return this.arg1.toSQL() + ' + ' + this.arg2.toSQL();
    },
    f: function(o) {
      return this.arg1.f(o) + this.arg2.f(o);
    }
  }
});

function ADD(arg1, arg2) {
  return AddExpr.create({ arg1: compile_(arg1), arg2: compile_(arg2) });
}

function DESC(arg1) {
  if ( DescExpr.isInstance(arg1) ) return arg1.arg1;
  return DescExpr.create({ arg1: arg1 });
}

var JOIN = function(dao, key, sink) {
  return {
    f: function(o) {
      var s = sink.clone();
      dao.where(EQ(key, o.id)).select(s);
      return [o, s];
    }
  };
};


// TODO: add other Date functions
var MONTH = function(p) { return {f: function (o) { return p.f(o).getMonth(); } }; };

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
var ME = "";

/**
 * Generic Mustang-like query-language parser generator.
 *
 * key:value                  key contains "value"
 * key=value                  key exactly matches "value"
 * key:value1,value2          key contains "value1" OR "value2"
 * key1:value key2:value      key1 contains value AND key2 contains "value"
 * key1:value AND key2:value  "
 * key1:value OR key2:value   key1 contains value OR key2 contains "value"
 * key1:value or key2:value   "
 * (expr)                     groups expression
 * -expr                      not expression, ie. -pri:1
 * has:key                    key has a value
 * is:key                     key is a boolean TRUE value
 * key>value                  key is greater than value
 * key-after:value            "
 * key<value                  key is less than value
 * key-before:value           "
 * date:YY/MM/DD              date specified
 * date:today                 date of today
 * date-after:today-7         date newer than 7 days ago
 * key:me                     key is the current user
 */
var QueryParserFactory = function(model) {
  var g = {
    __proto__: grammar,

    START: sym('query'),

    query: sym('or'),

    or: repeat(sym('and'), literal_ic(' OR '), 1),

    and: repeat(
      sym('expr'),
      alt(literal_ic('AND '), not(literal_ic(' OR'), ' ')),
      1),

    expr: alt(
      sym('negate'),
      sym('has'),
      sym('is'),
      sym('equals'),
      sym('before'),
      sym('after'),
      sym('id')
    ),

    paren: seq1(1, '(', sym('query'), ')'),

    negate: seq('-', sym('expr')),

    id: sym('number'),

    has: seq(literal_ic('has:'), sym('fieldname')),

    is: seq(literal_ic('is:'), sym('fieldname')),

    equals: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

    // TODO: merge with 'equals'
    before: seq(sym('fieldname'), alt('<','-before:'), sym('value')),

    // TODO: merge with 'equals'
    after: seq(sym('fieldname'), alt('>', '-after:'), sym('value')),

    value: alt(
      sym('me'),
      sym('date'),
      sym('string'),
      sym('number')),

    valueList: repeat(sym('value'), ',', 1),

    me: seq(literal_ic('me'), lookahead(not(sym('char')))),

    date: alt(
      sym('literal date'),
      sym('relative date')),

    'literal date': seq(sym('number'), '/', sym('number'), '/', sym('number')),

    'relative date': seq(literal_ic('today'), optional(seq('-', sym('number')))),

    string: alt(
      sym('word'),
      sym('quoted string')),

    'quoted string': str(seq1(1, '"', repeat(alt(literal('\\"', '"'), notChar('"'))), '"')),

    word: str(plus(sym('char'))),

    char: alt(range('a','z'), range('A', 'Z'), range('0', '9'), '-', '^', '_', '@', '%', '.'),

    number: str(plus(range('0', '9')))
  };

  var fields = [];

  for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var prop = model.properties[i];
    fields.push(literal_ic(prop.name, prop));
  }

  // Aliases
  for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var prop = model.properties[i];

    for ( var j = 0 ; j < prop.aliases.length ; j++ )
      if ( prop.aliases[j] ) fields.push(literal_ic(prop.aliases[j], prop));
  }

  // ShortNames
  for ( var i = 0 ; i < model.properties.length ; i++ ) {
    var prop = model.properties[i];

    if ( prop.shortName ) fields.push(literal_ic(prop.shortName, prop));
  }

  fields.sort(function(a, b) {
    var d = a.length - b.length;

    if ( d !== 0 ) return d;

    if ( a == b ) return 0;

    return a < b ? 1 : -1;
  });

  g.fieldname = alt.apply(null, fields);

  g.addActions({
    id: function(v) { return EQ(model.ID, v); },

    or: function(v) { return OR.apply(OR, v); },

    and: function(v) { return AND.apply(AND, v); },

    negate: function(v) { return NOT(v[1]); },

    number: function(v) { return parseInt(v); },

    me: function() { return this.ME || ME; },

    has: function(v) { return NEQ(v[1], ''); },

    is: function(v) { return EQ(v[1], TRUE); },

    before: function(v) { return LT(v[0], v[2]); },

    after: function(v) { return GT(v[0], v[2]); },

    equals: function(v) {
      // Always treat an OR'ed value list and let the partial evalulator
      // simplify it when it isn't.

      if ( v[1] === '=' ) return IN(v[0], v[2]);

      var or = OR();
      var values = v[2];
      for ( var i = 0 ; i < values.length ; i++ ) {
        or.args.push(v[1] == ':' && ( v[0].type === 'String' || v[0].subType === 'String' ) ?
                     CONTAINS_IC(v[0], values[i]) :
                     EQ(v[0], values[i]));
      }
      return or;
    },

    'literal date': function(v) { return new Date(v[0], v[2]-1, v[4]); },

    'relative date': function(v) {
      var d = new Date();
      if ( v[1] ) d.setDate(d.getDate() - v[1][1]);
      return d;
    }
  });

  return g;
};

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
FOAModel({
  name:  'GroupBySearchView',
  extendsModel: 'View',

  label: 'GroupBy Search View',

  properties: [
    {
      name: 'view',
      type: 'view',
      factory: function() { return ChoiceView.create({size:this.size, cssClass: 'foamSearchChoiceView'}); }
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 47
    },
    {
      name:  'size',
      type:  'int',
      defaultValue: 17
    },
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      required: true,
      postSet: function() {
        if ( this.view.id ) this.updateDAO();
      }
    },
    {
      name: 'property',
      type: 'Property'
    },
    {
      name: 'filter',
      type: 'Object',
      defaultValue: TRUE
    },
    {
      name: 'predicate',
      type: 'Object',
      defaultValue: TRUE
    },
    {
      name: 'label',
      type: 'String',
      defaultValueFn: function() { return this.property.label; }
    }
  ],

  methods: {
    toHTML: function() {
      return '<div class="foamSearchView">' +
        '<div class="foamSearchViewLabel">' +
        this.label +
        '</div>' +
        this.view.toHTML() +
        '</div>';
    },
    initHTML: function() {
      this.view.initHTML();

      //       Events.dynamic(function() { this.view.value; }, console.log.bind(console));
      Events.dynamic(function() { this.dao; }, this.updateDAO);
      this.propertyValue('filter').addListener(this.updateDAO);
      /*
        this.propertyValue('filter').addListener((function(a,b,oldValue,newValue) {
        this.updateDAO();
        }).bind(this));
      */
      this.view.data$.addListener(this.updateChoice);

      //       this.updateDAO();
      //       this.view.addListener(console.log.bind(console));
      //       this.view.value.addListener(console.log.bind(console));
    }
  },

  listeners:
  [
    {
      name: 'updateDAO',

      code: function() {
        var self = this;

        this.dao.where(this.filter).select(GROUP_BY(this.property, COUNT()))(function(groups) {
          var options = [];
          for ( var key in groups.groups ) {
            var count = ('(' + groups.groups[key] + ')').intern();
            var subKey = key.substring(0, self.width-count.length-3);
            var cleanKey = subKey.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            options.push([key, cleanKey + (Array(self.width-subKey.length-count.length).join('&nbsp;')).intern() + count]);
          }
          options.sort();
          options.splice(0,0,['','-- CLEAR SELECTION --']);
          self.view.choices = options;
          // console.log(groups.groups, options);
        });
      }
    },
    {
      name: 'updateChoice',

      code: function(_, _, _, choice) {
        this.predicate = choice ? EQ(this.property, choice) : TRUE ;
      }
    }

  ]

});


FOAModel({
  name:  'TextSearchView',

  extendsModel: 'View',

  properties: [
    {
      name:  'width',
      type:  'int',
      defaultValue: 47
    },
    {
      name: 'property',
      type: 'Property'
    },
    {
      name: 'predicate',
      type: 'Object',
      defaultValue: TRUE
    },
    {
      name: 'view',
      type: 'view',
      factory: function() { return TextFieldView.create({displayWidth:this.width, cssClass: 'foamSearchTextField'}); }
    },
    {
      name: 'label',
      type: 'String',
      defaultValueFn: function() { return this.property.label; }
    }
  ],

  methods: {
    toHTML: function() {
      return '<div class="foamSearchView">' +
        '<div class="foamSearchViewLabel">' +
        this.label +
        '</div>' +
        this.view.toHTML() + '</div>' +
        '<div id=' + this.on('click', this.clear) + ' style="text-align:right;width:100%;float:right;margin-bottom:20px;" class="searchTitle"><font size=-1><u>Clear</u></font></div>';
    },
    initHTML: function() {
      this.SUPER();
      this.view.initHTML();

      this.view.data$.addListener(this.updateValue);
    }
  },

  listeners:
  [
    {
      name: 'updateValue',
      code: function() {
        var value = this.view.data;
        if ( ! value ) {
          this.predicate = TRUE;
          return;
        }
        this.predicate = CONTAINS_IC(this.property, value);
      }
    },
    {
      name: 'clear',
      code: function() {
        console.log('**************************** clear');
        this.view.getValue().set('');
        this.predicate = TRUE;
      }
    }

  ]
});

FOAModel({
  name: 'SearchView',
  extendsModel: 'View',

  properties: [
    {
      name: 'dao'
    },
    {
      name: 'model'
    },
    {
      name: 'predicate',
      type: 'Object',
      defaultValue: TRUE
    }
  ],

  methods: {
    buildSubViews: function() {
      var props = this.model.searchProperties;
      for ( var i = 0; i < props.length; i++ ) {
        var view = GroupBySearchView.create({
          dao: this.dao,
          property: this.model[props[i].constantize()]
        });
        this.addChild(view);
        view.addPropertyListener(
          'predicate',
          this.updatePredicate
        );
      }
    },

    toInnerHTML: function() {
      if ( ! this.children.length )
        this.buildSubViews();

      var str = ""
      for ( var i = 0; i < this.children.length; i++ ) {
        str += this.children[i].toHTML();
      }
      return str;
    }
  },

  listeners: [
    {
      name: 'updatePredicate',
      code: function() {
        var p = TRUE;
        for ( var i = 0; i < this.children.length; i++ ) {
          var view = this.children[i];
          if ( view.predicate ) {
            p = AND(p, view.predicate);
          }
        }
        this.predicate = p.partialEval();
      }
    }
  ]
});

FOAModel({
  name: 'SearchBorder',

  properties: [
    {
      name: 'dao',
    },
    {
      name: 'model',
    },
    {
      name: 'view',
      factory: function() {
        return SearchView.create({
          dao: this.dao,
          model: this.model
        });
      }
    }
  ],

  methods: {
    decorateObject: function(object) {
      this.view.addPropertyListener(
        'predicate',
        function(border, _, _, pred) {
          object.dao = border.dao.where(pred);
        });
    },

    toHTML: function(border, delegate, args) {
      this.addChild(border.view);
      return border.view.toHTML() + delegate();
    }
  }
});

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
// TODO: time-travelling debugger, ala:
//    "Debugging Standard ML Without Reverse Engineering"

/** Adapt a synchronous method into a psedo-afunc. **/
Function.prototype.abind = function(self) {
  return function(ret) { this.apply(self, arguments); ret(); }.bind(this);
};

/** NOP afunc. **/
function anop(ret) { ret && ret(undefined); }


/** afunc log. **/
function alog() {
  var args = arguments;
  return function (ret) {
    console.log.apply(console, args);
    ret && ret.apply(this, [].shift.call(arguments));
  };
}

/** console.profile an afunc. **/
function aprofile(afunc) {
  return function(ret) {
     var a = argsToArray(arguments);
     console.profile();
     var ret2 = function () {
        console.profileEnd();
        ret && ret(arguments);
     };
     aapply_(afunc, ret2, a);
  };
}


/** Create an afunc which always returns the supplied constant value. **/
function aconstant(v) { return function(ret) { ret && ret(v); }; }


/** Execute the supplied afunc N times. **/
function arepeat(n, afunc) {
  if ( ! n ) return anop;
  return function(ret) {
    var a = argsToArray(arguments);
    a.splice(1, 0, 0, n); // insert (0, n) after 'ret' argument
    var next = atramp(function() {
      if ( a[1] == n-1 ) { a[0] = ret; afunc.apply(this, a); return; };
      afunc.apply(this, a);
      a[1]++;
    });

    a[0] = next;
    next.apply(this, a);
  };
}


/** Execute the supplied afunc on each element of an array. */
function aforEach(arr, afunc) {
  // TODO: implement
}


/** Execute the supplied afunc until cond() returns false. */
function awhile(cond, afunc) {
  return function(ret) {
    var a = argsToArray(arguments);

    var g = function() {
      if ( ! cond() ) { ret.apply(undefined, arguments); return; }
      afunc.apply(this, a);
    };

    a[0] = g;
    g.apply(this, a);
  };
}


/** Execute the supplied afunc if cond. */
function aif(cond, afunc, aelse) {
  return function(ret) {
    if ( cond ) {
       afunc.apply(this, arguments);
    } else {
      if ( aelse ) aelse.apply(this, arguments);
      else ret();
    }
  };
}

/** Time an afunc. **/
var atime = (function() {
  // Add a unique suffix to timer names in case multiple instances
  // of the same timing are active at once.
  var id = 1;
  var activeOps = {};
  return function (str, afunc, opt_endCallback, opt_startCallback) {
    return function(ret) {
      var name = str;
      if ( activeOps[str] ) {
         name += '-' + id++;
         activeOps[str]++;
      } else {
         activeOps[str] = 1;
      }
      var start = performance.now();
      if ( opt_startCallback ) opt_startCallback(name);
      if ( ! opt_endCallback ) console.time(name);
      var a = arguments;
      var args = [function() {
        activeOps[str]--;
        var end = performance.now();
        if ( opt_endCallback ) opt_endCallback(name, end - start);
        else console.timeEnd(name);
        ret && ret.apply(this, [].shift.call(a));
      }];
      for ( var i = 1 ; i < a.length ; i++ ) args[i] = a[i];
      afunc.apply(this, args);
    };
  };
})();


/** Time an afunc and record its time as a metric. **/
var ametric = atime;

/** Sleep for the specified delay. **/
function asleep(ms) {
  return function(ret) {
    window.setTimeout(ret, ms);
  };
}

var ayield = asleep.bind(null, 0);


/** Create a future value. **/
function afuture() {
  var set     = false;
  var values  = undefined;
  var waiters = [];

  return {
    set: function() {
      if ( set ) {
        console.log('ERROR: redundant set on future');
        return;
      }
      values = arguments;
      set = true;
      for (var i = 0 ; i < waiters.length; i++) {
        waiters[i].apply(null, values);
      }
      waiters = undefined;
    },

    get: function(ret) {
      if ( set ) { ret.apply(null, values); return; }
      waiters.push(ret);
    }
  };
};


function aapply_(f, ret, args) {
  args.unshift(ret);
  f.apply(this, args);
}


/**
 * A Binary Semaphore which only allows the delegate function to be
 * executed by a single thread of execution at once.
 * Like Java's synchronized blocks.
 * @param opt_lock an empty map {} to be used as a lock
 *                 sharable across multiple asynchronized instances
 **/
function asynchronized(f, opt_lock) {
  var lock = opt_lock || {};
  if ( ! lock.q ) { lock.q = []; lock.active = false; }

  // Decorate 'ret' to check for blocked continuations.
  function onExit(ret) {
    return function() {
      var next = lock.q.shift();

      if ( next ) {
        setTimeout(next, 0);
      } else {
        lock.active = false;
      }

      ret();
    };
  }

  return function(ret) {
    // Semaphore is in use, so just queue f for execution when the current
    // continuation exits.
    if ( lock.active ) {
       lock.q.push(function() { f(onExit(ret)); });
       return;
    }

    lock.active = true;

    f(onExit(ret));
  };
}


/**
 * Execute an optional timeout function and abort the continuation
 * of the delegate function, if it doesn't finish in the specified
 * time.
 **/
// Could be generalized into an afirst() combinator which allows
// for the execution of multiple streams but only the first to finish
// gets to continue.
function atimeout(delay, f, opt_timeoutF) {
  return function(ret) {
    var timedOut  = false;
    var completed = false;
    setTimeout(function() {
      if ( completed ) return;
      timedOut = true;
      console.log('timeout');
      opt_timeoutF && opt_timeoutF();
    }, delay);

    f(aseq(
      function(ret) {
        if ( ! timedOut ) completed = true;
        if ( completed ) ret();
      }, ret));
  };
}


/** Memoize an async function. **/
function amemo(f) {
  var memoized = false;
  var values;
  var waiters;

  return function(ret) {
    if ( memoized ) { ret.apply(null, values); return; }

    var first = ! waiters;

    if ( first ) waiters = [];

    waiters.push(ret);

    if ( first ) {
      f(function() {
        values = arguments;
        for (var i = 0 ; i < waiters.length; i++) {
          waiters[i] && waiters[i].apply(null, values);
        }
        f = undefined;
        memoized = true;
        waiters = undefined;
      });
    }
  };
}

/**
 * Decorates an afunc to merge all calls to one active execution of the
 * delegate.
 * Similar to asynchronized, but doesn't queue up a number of calls
 * to the delegate.
 */
function amerged(f) {
  var waiters;

  return function(ret) {
    var first = ! waiters;

    if ( first ) {
      waiters = [];
      var args = argsToArray(arguments);
    }

    waiters.push(ret);

    if ( first ) {
      args[0] = function() {
        var calls = waiters;
        waiters = undefined;
        for (var i = 0 ; i < calls.length; i++) {
          calls[i] && calls[i].apply(null, arguments);
        }
      }

      f.apply(null, args);
    }
  };
}


/** Async Compose (like Function.prototype.O, but for async functions **/
Function.prototype.ao = function(f2) {
  var f1 = this;
  return function(ret) {
    var args = argsToArray(arguments);
    args[0] = f1.bind(this, ret);
    f2.apply(this, args);
  };
};

Function.prototype.aseq = function(f2) {
  return f2.ao(this);
};


/** Compose a variable number of async functions. **/
function ao(/* ... afuncs */) {
  var ret = arguments[arguments.length-1];

  for ( var i = 0 ; i < arguments.length-1 ; i++ ) {
    ret = arguments[i].ao(ret);
  }

  return ret;
}


/** Compose a variable number of async functions. **/
function aseq(/* ... afuncs */) {
  var f = arguments[arguments.length-1];

  for ( var i = arguments.length-2 ; i >= 0 ; i-- ) {
    f = arguments[i].aseq(f);
  }

  return f;
}


/**
 * Create a function which executes several afunc's in parallel and passes
 * their joined return values to an optional afunc.
 *
 * Usage: apar(f1,f2,f3)(opt_afunc, opt_args)
 * @param opt_afunc called with joined results after all afuncs finish
 * @param opt_args passed to all afuncs
 **/
function apar(/* ... afuncs */) {
  var aargs = [];
  var count = 0;
  var fs = arguments;

  return function(ret /* opt_args */) {
    if ( fs.length == 0 ) {
      ret && ret();
      return;
    }
    var opt_args = Array.prototype.splice.call(arguments, 1);
    var join = function (i) {
      aargs[i] = Array.prototype.splice.call(arguments, 1);
      if ( ++count == fs.length ) {
        var a = [];
        for ( var j = 0 ; j < fs.length ; j++ )
          for ( var k = 0 ; k < aargs[j].length ; k++ )
            a.push(aargs[j][k]);
        ret && ret.apply(null, a);
      }
    };

    for ( var i = 0 ; i < fs.length ; i++ )
      fs[i].apply(null, [join.bind(null, i)].concat(opt_args));
  };
}

/** Convert the supplied afunc into a trampolined-afunc. **/
var atramp = (function() {
   var active = false;
   var jobs = [];

   return function(afunc) {
      return function() {
         jobs.push([afunc, arguments]);
         if ( ! active ) {
if ( jobs.length > 1 ) debugger;
           active = true;
           var job;
           // Take responsibility for bouncing
           while ( (job = jobs.pop()) != null ) {
             job[0].apply(this, job[1]);
           }
           active = false;
         }
      };
   };
})();

/** Execute the supplied afunc concurrently n times. **/
function arepeatpar(n, afunc) {
  return function(ret /* opt_args */) {
    var aargs = [];
    var count = 0;

    var opt_args = Array.prototype.splice.call(arguments, 1);
    var join = function (i) {
      // aargs[i] = Array.prototype.splice.call(arguments, 1);
      if ( ++count == n ) {
        var a = [];
        /*
        for ( var j = 0 ; j < n ; j++ )
          for ( var k = 0 ; k < aargs[j].length ; k++ )
            a.push(aargs[j][k]);
         */
        ret && ret.apply(null, a);
      }
    };

    for ( var i = 0 ; i < n ; i++ ) {
      afunc.apply(null, [join.bind(null, i)].concat([i, n]).concat(opt_args));
    }
  };
}

function axhr(url, opt_op, opt_params) {
  var op = opt_op || "GET";
  var params = opt_params || [];

  return function(ret) {
    var xhr = new XMLHttpRequest();
    xhr.open(op, url);
    xhr.asend(function(json) { ret(JSON.parse(json)); }, params && params.join('&'));
  };
}

var __JSONP_CALLBACKS__ = {};
var wrapJsonpCallback = (function() {
  var nextID = 0;

  return function(ret, opt_nonce) {
    var id = 'c' + (nextID++);
    if ( opt_nonce ) id += Math.floor(Math.random() * 0xffffff).toString(16);

    var cb = __JSONP_CALLBACKS__[id] = function(data) {
      delete __JSONP_CALLBACKS__[id];

      // console.log('JSONP Callback', id, data);

      ret && ret.call(this, data);
    };
    cb.id = id;

    return cb;
  };
})();

// Note: this doesn't work for packaged-apps
var ajsonp = function(url, params) {
  return function(ret) {
    var cb = wrapJsonpCallback(ret);

    var script = document.createElement('script');
    script.src = url + '?callback=__JSONP_CALLBACKS__.' + cb.id + (params ? '&' + params.join('&') : '');
    script.onload = function() {
      document.body.removeChild(this);
    };
    document.body.appendChild(script);
  };
};

function futurefn(future) {
  return function() {
    var args = arguments;
    future.get(function(f) {
      f.apply(undefined, args);
    });
  };
}

/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

var OAM = {
  time: function(name, fn) {
    return function() {
      console.time(name);
      var ret = fn.apply(this, arguments);
      console.timeEnd(name);
      return ret;
    };
  },

  profile: function(fn) {
    return function() {
      console.profile();
      var ret = fn.apply(this, arguments);
      console.profileEnd();
      return ret;
    };
  }

};

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
var Visitor = {
  create: function() {
    return { __proto__: this, stack: [] };
  },

  push: function(o) { this.stack.push(o); },

  pop: function() { return this.stack.pop(); },

  top: function() {
    return this.stack.length && this.stack[this.stack.length-1];
  },

  visit: function(o) {
    return Array.isArray(o)           ? this.visitArray(o)    :
           ( typeof o === 'string' )  ? this.visitString(o)   :
           ( typeof o === 'number' )  ? this.visitNumber(o)   :
           ( o instanceof Function )  ? this.visitFunction(o) :
           ( o instanceof Date )      ? this.visitDate(o)     :
           ( o === true )             ? this.visitTrue()      :
           ( o === false )            ? this.visitFalse()     :
           ( o === null )             ? this.visitNull()      :
           ( o instanceof Object )    ? ( o.model_            ?
             this.visitObject(o)      :
             this.visitMap(o)
           )                          : this.visitUndefined() ;
  },

  visitArray: function(o) {
    var len = o.length;
    for ( var i = 0 ; i < len ; i++ ) this.visitArrayElement(o, i);
    return o;
  },
  visitArrayElement: function (arr, i) { this.visit(arr[i]); },

  visitString: function(o) { return o; },

  visitFunction: function(o) { return o; },

  visitNumber: function(o) { return o; },

  visitDate: function(o) { return o; },

  visitObject: function(o) {
    for ( var key in o.model_.properties ) {
      var prop = o.model_.properties[key];

      if ( prop.name in o.instance_ ) {
        this.visitProperty(o, prop);
      }
    }
    return o;
  },
  visitProperty: function(o, prop) { this.visit(o[prop.name]); },

  visitMap: function(o) {
    for ( var key in o ) { this.visitMapElement(key, o[key]); };
    return o;
  },
  visitMapElement: function(key, value) { },

  visitTrue: function() { return true; },

  visitFalse: function() { return false; },

  visitNull: function() { return null; },

  visitUndefined: function() { return undefined; }

};

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

// ???: Is there any point in making this an Interface, or just a Concrete Model
FOAModel({
  model_: 'Interface',

  package: 'dao',
  name: 'FlowControl',
  description: 'DAO FLow Control.  Used to control select() behavior.',

  methods: [
    {
      name: 'stop'
    },
    {
      name: 'error',
      args: [
        { name: 'e', type: 'Object' }
      ]
    },
    {
      name: 'isStopped',
      description: 'Returns true iff this selection has been stopped.',
      returnType: 'Boolean'
    },
    {
      name: 'getError',
      description: 'Returns error passed to error(), or undefined if error() never called',
      returnType: 'Object'
    }
    /*
    // For future use.
    {
    name: 'advance',
    description: 'Advance selection to the specified key.',
    args: [
    { name: 'key', type: 'Object' },
    { name: 'inclusive', type: 'Object', optional: true, defaultValue: true },

    ]
    }*/
  ]
});


FOAModel({
  model_: 'Interface',

  package: 'dao',
  name: 'Sink',
  description: 'Data Sink',

  methods: [
    {
      name: 'put',
      description: 'Put (add) an object to the Sink.',
      args: [
        { name: 'obj', type: 'Object' },
        { name: 'sink', type: 'Sink' }
      ]
    },
    {
      name: 'remove',
      description: 'Remove a single object.',
      args: [
        { name: 'obj', type: 'Object' },
        { name: 'sink', type: 'Sink' }
      ]
    },
    {
      name: 'error',
      description: 'Report an error.',
      args: [
        { name: 'obj', type: 'Object' }
      ]
    },
    {
      name: 'eof',
      description: 'Indicate that no more operations will be performed on the Sink.'
    }
  ]
});


FOAModel({
  model_: 'Interface',

  name: 'Predicate',
  description: 'A boolean Predicate.',

  methods: [
    {
      name: 'f',
      description: 'Find a single object, using either a Predicate or the primary-key.',
      returnType: 'Boolean',
      args: [
        { name: 'o', description: 'The object to be predicated.' }
      ]
    },
  ]
});


FOAModel({
  model_: 'Interface',

  name: 'Comparator',
  description: 'A strategy for comparing pairs of Objects.',

  methods: [
    {
      name: 'compare',
      description: 'Compare two objects, returning 0 if they are equal, > 0 if the first is larger, and < 0 if the second is.',
      returnType: 'Int',
      args: [
        { name: 'o1', description: 'The first object to be compared.' },
        { name: 'o2', description: 'The second object to be compared.' }
      ]
    },
  ]
});


// 'options': Map including 'query', 'order', and 'limit', all optional

FOAModel({
  model_: 'Interface',

  package: 'dao',
  name: 'DAO',
  description: 'Data Access Object',
  extends: ['Sink'],

  methods: [
    {
      name: 'find',
      description: 'Find a single object, using either a Predicate or the primary-key.',
      args: [
        { name: 'key', type: 'Predicate|Object' },
        { name: 'sink', type: 'Sink' }
      ]
    },
    {
      name: 'removeAll',
      description: 'Remove all (scoped) objects.',
      args: [
        { name: 'sink', type: 'Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'select',
      description: 'Select all (scoped) objects.',
      args: [
        { name: 'sink', type: 'SinkI', optional: true, help: 'Defaults to [].' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'pipe',
      description: 'The equivalent of doing a select() followed by a listen().',
      args: [
        { name: 'sink', type: 'Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'listen',
      description: 'Listen for future (scoped) updates to the DAO.',
      args: [
        { name: 'sink', type: 'Sink' },
        { name: 'options', type: 'Object', optional: true }
      ]
    },
    {
      name: 'unlisten',
      description: 'Remove a previously registered listener.',
      args: [
        { name: 'sink', type: 'Sink' }
      ]
    },
    {
      name: 'where',
      description: 'Return a DAO that will be filtered to the specified predicate.',
      returnValue: 'DAO',
      args: [
        { name: 'query', type: 'Predicate' }
      ]
    },
    {
      name: 'limit',
      description: 'Return a DAO that will limit future select()\'s to the specified number of results.',
      returnValue: 'DAO',
      args: [
        { name: 'count', type: 'Int' }
      ]
    },
    {
      name: 'skip',
      description: 'Return a DAO that will skip the specified number of objects from future select()\'s',
      returnValue: 'DAO',
      args: [
        { name: 'skip', type: 'Int' }
      ]
    },
    {
      name: 'orderBy',
      description: 'Return a DAO that will order future selection()\'s by the specified sort order.',
      returnValue: 'DAO',
      args: [
        {
          name: 'comparators',
          rest: true,
          type: 'Comparator',
          description: 'One or more comparators that specify the sort-order.'
        }
      ]
    }
    // Future: drop() - drop/remove the DAO
    //         cmd()  - handle extension operations
  ]
});


/** A DAO proxy that delays operations until the delegate is set in the future. **/
var FutureDAO = {
  create: function(/* future */ futureDelegate) {

    // This is kind-of-tricky.  We actually return an object whose proto is the future-proxy
    // code.  This is so that once the future-delegate is set, that we can rewrite the proto
    // to be that delegate.  This removes the future related code so that we no longer have
    // pay the overhead once the delegate has been set.

    function setupFuture(delegate) {
      if ( ret.__proto__ !== delegate ) {
        var listeners = ret.__proto__.daoListeners_;
        ret.__proto__ = delegate;
        for ( var i = 0 ; i < listeners.length ; i++ ) {
          console.log('******************************************************* AddingListener ', ret, listeners[i]);
          ret.listen.apply(ret, listeners[i]);
        }
//        ret.notify_('put', []);
      }
    }

    var ret = {
      __proto__: {
        // TODO: implement other DAO methods
        daoListeners_: [],

        select: function() {
          var a = arguments;
          var f = afuture();
          futureDelegate(function(delegate) {
            // This removes this code from the delegate-chain and replaces the real delegate.
            setupFuture(delegate);
            delegate.select.apply(delegate, a)(f.set);
          });
          return f.get;
        },
        pipe: function() {
          var a = arguments;
          futureDelegate(function(delegate) {
            // This removes this code from the delegate-chain and replaces the real delegate.
            setupFuture(delegate);
            delegate.pipe.apply(delegate, a);
          });
        },
        put: function() {
          var a = arguments;
          futureDelegate(function(delegate) {
            setupFuture(delegate);
            delegate.put.apply(delegate, a);
          });
        },
        find: function() {
          var a = arguments;
          futureDelegate(function(delegate) {
            setupFuture(delegate);
            delegate.find.apply(delegate, a);
          });
        },
        where: function(query) {
          if ( arguments.length > 1 ) query = CompoundComparator.apply(null, arguments);
          return filteredDAO(query, this);
        },
        limit: function(count) {
          return limitedDAO(count, this);
        },
        skip: function(skip) {
          return skipDAO(skip, this);
        },
        orderBy: function() {
          return orderedDAO(arguments.length == 1 ? arguments[0] : argsToArray(arguments), this);
        },
        listen: function(sink, options) {
          // this.daoListeners_.push([sink, options]);
        },
        unlisten: function(sink) {
          /*
          for ( var i = 0 ; i < this.daoListeners_ ; i++ ) {
            if ( this.daoListeners_[i][0] === sink ) {
              this.daoListeners_.splice(i, 1);
              return;
            }
          }
          console.warn('phantom DAO unlisten: ', sink);
          */
        }
      }};
    return ret;
  }
};


var LoggingDAO = {

  create: function(/*[logger], delegate*/) {
    var logger, delegate;
    if ( arguments.length == 2 ) {
      logger = arguments[0];
      delegate = arguments[1];
    } else {
      logger = console.log.bind(console);
      delegate = arguments[0];
    }

    return {
      __proto__: delegate,

      put: function(obj, sink) {
        logger('put', obj);
        delegate.put(obj, sink);
      },
      remove: function(query, sink) {
        logger('remove', query);
        delegate.remove(query, sink);
      },
      select: function(sink, options) {
        logger('select', options || "");
        return delegate.select(sink, options);
      },
      removeAll: function(query, sink) {
        logger('removeAll', query);
        return delegate.remove(query, sink);
      }
    };
  }
};


var TimingDAO = {

  create: function(name, delegate) {
    // Used to distinguish between concurrent operations
    var id;
    var activeOps = {put: 0, remove:0, find: 0, select: 0};
    function start(op) {
      var str = name + '-' + op;
      var key = activeOps[op]++ ? str + '-' + (id++) : str;
      console.time(id);
      return [key, str, window.performance.now(), op];
    }
    function end(act) {
      activeOps[act[3]]--;
      id--;
      console.timeEnd(act[0]);
      console.log('Timing: ', act[1], ' ', (window.performance.now()-act[2]).toFixed(3), ' ms');
    }
    function endSink(act, sink) {
      return {
        put:    function() { end(act); sink && sink.put    && sink.put.apply(sink, arguments); },
        remove: function() { end(act); sink && sink.remove && sink.remove.apply(sink, arguments); },
        error:  function() { end(act); sink && sink.error  && sink.error.apply(sink, arguments); },
        eof:    function() { end(act); sink && sink.eof    && sink.eof.apply(sink, arguments); }
      };
    }
    return {
      __proto__: delegate,

      put: function(obj, sink) {
        var act = start('put');
        delegate.put(obj, endSink(act, sink));
      },
      remove: function(query, sink) {
        var act = start('remove');
        delegate.remove(query, endSink(act, sink));
      },
      find: function(key, sink) {
        var act = start('find');
        delegate.find(key, endSink(act, sink));
      },
      select: function(sink, options) {
        var act = start('select');
        var fut = afuture();
        delegate.select(sink, options)(function(s) {
          end(act);
          fut.set(s);
        });
        return fut.get;
      }
    };
  }
};


var ObjectToJSON = {
  __proto__: Visitor.create(),

  visitFunction: function(o) {
    return o.toString();
  },

  visitObject: function(o) {
    this.push({model_: o.model_.name});
    this.__proto__.visitObject.call(this, o);
    return this.pop();
  },
  visitProperty: function(o, prop) {
    this.top()[prop.name] = this.visit(o[prop.name]);
  },

  visitMap: function(o) {
    this.push({});
    Visitor.visitMap.call(this, o);
    return this.pop();
  },
  visitMapElement: function(key, value) { this.top()[key] = this.visit(value); },

  visitArray: function(o) {
    this.push([]);
    this.__proto__.visitArray.call(this, o);
    return this.pop();
  },
  visitArrayElement: function (arr, i) { this.top().push(this.visit(arr[i])); }
};


var JSONToObject = {
  __proto__: ObjectToJSON.create(),

  visitString: function(o) {
    try {
      return o.substr(0, 8) === 'function' ?
        eval('(' + o + ')') :
        o ;
    } catch (x) {
      console.log(x, o);
      return o;
    }
  },

  visitObject: function(o) {
    var model   = GLOBAL[o.model_];
    if ( ! model ) throw ('Unknown Model: ', o.model_);
    var obj     = model.create();

    //    o.forEach((function(value, key) {
    // Workaround for crbug.com/258522
    Object_forEach(o, (function(value, key) {
      if ( key !== 'model_' ) obj[key] = this.visit(value);
    }).bind(this));

    return obj;
  },

  // Substitute in-place
  visitArray: Visitor.visitArray,
  visitArrayElement: function (arr, i) { arr[i] = this.visit(arr[i]); }
};


FOAModel({
  name: 'AbstractDAO',

  methods: {

    update: function(expr) {
      return this.select(UPDATE(expr, this));
    },

    listen: function(sink, options) {
      sink = this.decorateSink_(sink, options, true);
      if ( ! this.daoListeners_ ) {
        Object.defineProperty(this, 'daoListeners_', {
          enumerable: false,
          value: []
        });
      }
      this.daoListeners_.push(sink);
    },

    pipe: function(sink, options) {
      sink = this.decorateSink_(sink, options, true);

      var fc   = this.createFlowControl_();
      var self = this;

      this.select({
        put: function() {
          sink.put && sink.put.apply(sink, arguments);
        },
        remove: function() {
          sink.remove && sink.remove.apply(sink, arguments);
        },
        error: function() {
          sink.error && sink.error.apply(sink, arguments);
        },
        eof: function() {
          if ( fc.stopped ) {
            sink.eof && sink.eof();
          } else {
            self.listen(sink, options);
          }
        }
      }, options, fc);
    },

    decorateSink_: function(sink, options, isListener, disableLimit) {
      if ( options ) {
        if ( ! disableLimit ) {
          if ( options.limit ) sink = limitedSink(options.limit, sink);
          if ( options.skip )  sink = skipSink(options.skip, sink);
        }

        if ( options.order && ! isListener ) {
          sink = orderedSink(options.order, sink);
        }

        if ( options.query ) {
          sink = predicatedSink(
            options.query.partialEval ?
              options.query.partialEval() :
              options.query,
            sink) ;
        }
      }

      return sink;
    },

    createFlowControl_: function() {
      return {
        stop: function() { this.stopped = true; },
        error: function(e) { this.errorEvt = e; }
      };
    },

    where: function(query) {
      return filteredDAO(query, this);
    },

    limit: function(count) {
      return limitedDAO(count, this);
    },

    skip: function(skip) {
      return skipDAO(skip, this);
    },

    orderBy: function() {
      return orderedDAO(arguments.length == 1 ?
                        arguments[0] :
                        argsToArray(arguments), this);
    },

    unlisten: function(sink) {
      var ls = this.daoListeners_;
      if ( ls ) {
        for ( var i = 0; i < ls.length ; i++ ) {
          if ( ls[i].$UID === sink.$UID ) {
            ls.splice(i, 1);
            return true;
          }
        }
        console.warn('Phantom DAO unlisten: ', this, sink);
      }
    },

    // Default removeAll: calls select() with the same options and
    // calls remove() for all returned values.
    removeAll: function(sink, options) {
      var self = this;
      var future = afuture();
      this.select({
        put: function(obj) {
          self.remove(obj, { remove: sink && sink.remove });
        }
      })(function() {
        sink && sink.eof();
        future.set();
      });
      return future.get;
    },

    /**
     * Notify all listeners of update to DAO.
     * @param fName the name of the method in the listeners to call.
     *        possible values: 'put', 'remove'
     **/
    notify_: function(fName, args) {
//       console.log(this.TYPE, ' ***** notify ', fName, ' args: ', args, ' listeners: ', this.daoListeners_);
      if ( ! this.daoListeners_ ) return;
      for( var i = 0 ; i < this.daoListeners_.length ; i++ ) {
        var l = this.daoListeners_[i];
        var fn = l[fName];
        if ( fn ) {
          // Create flow-control object
          args[2] = {
            stop: (function(fn, l) {
              return function() { fn(l); };
            })(this.unlisten.bind(this), l),
            error: function(e) { /* Don't care. */ }
          };
          fn.apply(l, args);
        }
      }
    }
  }
});


FOAModel({
  name: 'ProxyDAO',

  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'delegate',
      type: 'DAO',
      mode: "read-only",
      hidden: true,
      required: true,
      transient: true,
      postSet: function(oldDAO, newDAO) {
        this.model = newDAO.model;
        if ( this.daoListeners_ && this.daoListeners_.length ) {
          if ( oldDAO ) oldDAO.unlisten(this.relay());
          newDAO.listen(this.relay());
          this.notify_('put', []);
        }
      }
    }
  ],

  methods: {
    relay: function() {
      if ( ! this.relay_ ) {
        var self = this;

        this.relay_ = {
          put:    function() { self.notify_('put', arguments);    },
          remove: function() { self.notify_('remove', arguments); },
          toString: function() { return 'RELAY(' + this.$UID + ', ' + self.model_.name + ', ' + self.delegate + ')'; }
        };
      }

      return this.relay_;
    },

    put: function(value, sink) {
      this.delegate.put(value, sink);
    },

    remove: function(query, sink) {
      this.delegate.remove(query, sink);
    },

    removeAll: function() {
      return this.delegate.removeAll.apply(this.delegate, arguments);
    },

    find: function(key, sink) {
      this.delegate.find(key, sink);
    },

    select: function(sink, options) {
      return this.delegate.select(sink, options);
    },

    listen: function(sink, options) {
      // Adding first listener, so listen to delegate
      if ( ! this.daoListeners_ || ! this.daoListeners_.length ) {
        this.delegate.listen(this.relay());
      }

      this.SUPER(sink, options);
    },

    unlisten: function(sink) {
      this.SUPER(sink);

      // Remove last listener, so unlisten to delegate
      if ( ! this.daoListeners_ || ! this.daoListeners_.length ) {
        this.delegate.unlisten(this.relay());
      }
    }
  }
});

/**
 * Set a specified properties value with an auto-increment
 * sequence number on DAO.put() if the properties value
 * is set to the properties default value.
 */
FOAModel({
  name: 'SeqNoDAO',
  label: 'SeqNoDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'property',
      type: 'Property',
      required: true,
      hidden: true,
      defaultValueFn: function() {
        return this.delegate.model ? this.delegate.model.ID : undefined;
      },
      transient: true
    },
    {
      model_: 'IntProperty',
      name: 'sequenceValue',
      defaultValue: 1
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var future = afuture();
      this.WHEN_READY = future.get;

      // Scan all DAO values to find the largest
      this.delegate.select(MAX(this.property))(function(max) {
        if ( max.max ) this.sequenceValue = max.max + 1;
        future.set(true);
      }.bind(this));
    },
    put: function(obj, sink) {
      this.WHEN_READY(function() {
        var val = this.property.f(obj);

        if ( val == this.property.defaultValue ) {
          obj[this.property.name] = this.sequenceValue++;
        }

        this.delegate.put(obj, sink);
      }.bind(this));
    }
  }
});


FOAModel({
  name: 'CachingDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'src'
    },
    {
      name: 'cache',
      help: 'Alias for delegate.',
      getter: function() { return this.delegate },
      setter: function(dao) { this.delegate = dao; }
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.src.model || this.cache.model; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var src   = this.src;
      var cache = this.cache;

      var futureDelegate = afuture();
      this.cache = FutureDAO.create(futureDelegate.get);

      src.select(cache)(function() {
        // Actually means that cache listens to changes in the src.
        src.listen(cache);
        futureDelegate.set(cache);
        this.cache = cache;
      }.bind(this));
    },
    put: function(obj, sink) { this.src.put(obj, sink); },
    remove: function(query, sink) { this.src.remove(query, sink); },
    removeAll: function(sink, options) { return this.src.removeAll(sink, options); }
  }
});


/**
 * Provide Cascading Remove.
 * Remove dependent children from a secondary DAO when parent is
 * removed from the delegate DAO.
 */
FOAModel({
  name: 'CascadingRemoveDAO',
  label: 'Cascading Remove DAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'childDAO',
      type: 'DAO',
      mode: "read-only",
      hidden: true,
      required: true,
      transient: true
    },
    {
      name: 'property',
      type: 'Property',
      required: true,
      hidden: true,
      transient: true
    }
  ],

  methods: {
    remove: function(query, sink) {
      this.childDAO.where(EQ(this.property, query)).removeAll();
      this.delegate.remove(query, sink);
    },
    removeAll: function(sink, options) {
      return apar(
        this.childDAO.removeAll(null, options), // TODO: Sane?
        this.delegate.removeAll(sink, options)
      );
    }
  }
});


// TODO: filter notifications also
function filteredDAO(query, dao) {
  if ( query === TRUE ) return dao;

  return {
    __proto__: dao,
    select: function(sink, options) {
      return dao.select(sink, options ? {
        __proto__: options,
        query: options.query ?
          AND(query, options.query) :
          query
      } : {query: query});
    },
    removeAll: function(sink, options) {
      return dao.removeAll(sink, options ? {
        __proto__: options,
        query: options.query ?
          AND(query, options.query) :
          query
      } : {query: query});
    },
    listen: function(sink, options) {
      return dao.listen(sink, options ? {
        __proto__: options,
        query: options.query ?
          AND(query, options.query) :
          query
      } : {query: query});
    }

  };
}


function orderedDAO(comparator, dao) {
  //  comparator = toCompare(comparator);
  //  if ( comparator.compare ) comparator = comparator.compare.bind(comparator);

  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        if ( ! options.order )
          options = { __proto__: options, order: comparator };
      } else {
        options = {order: comparator};
      }

      return dao.select(sink, options);
    }
  };
}


function limitedDAO(count, dao) {
  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        if ( 'limit' in options ) {
          options = {
            __proto__: options,
            limit: Math.min(count, options.limit)
          };
        } else {
          options = { __proto__: options, limit: count };
        }
      }
      else {
        options = { limit: count };
      }

      return dao.select(sink, options);
    }
  };
}


function skipDAO(skip, dao) {
  return {
    __proto__: dao,
    select: function(sink, options) {
      if ( options ) {
        options = {
          __proto__: options,
          skip: skip
        };
      } else {
        options = { __proto__: options, skip: skip };
      }

      return dao.select(sink, options);
    }
  };
}


// Copy AbstractDAO methods in Array prototype

var pmap = {};
for ( var key in AbstractDAO.methods ) {
  pmap[AbstractDAO.methods[key].name] = AbstractDAO.methods[key].code;
}

defineProperties(Array.prototype, pmap);

defineProperties(Array.prototype, {
  // Clone this Array and remove 'v' (only 1 instance)
  // TODO: make faster by copying in one pass, without splicing
  deleteF: function(v) {
    var a = this.clone();
    for (var i = 0; i < a.length; i++) {
      if ( a[i] === v ) { a.splice(i, 1); break; }
    }
    return a;
  },
  // Remove 'v' from this array (only 1 instance removed)
  // return true iff the value was removed
  deleteI: function(v) {
    for (var i = 0; i < this.length; i++) {
      if ( this[i] === v ) { this.splice(i, 1); return true; }
    }
    return false;
  },
  // Clone this Array and remove first object where predicate 'p' returns true
  // TODO: make faster by copying in one pass, without splicing
  removeF: function(p) {
    var a = this.clone();
    for (var i = 0; i < a.length; i++) {
      if (p.f(a[i])) { a.splice(i, 1); break; }
    }
    return a;
  },
  // Remove first object in this array where predicate 'p' returns true
  removeI: function(p) {
    for (var i = 0; i < this.length; i++) {
      if (p.f(this[i])) { this.splice(i, 1); breeak; }
    }
    return this;
  },
  pushF: function(obj) {
    var a = this.clone();
    a.push(obj);
    return a;
  },
  clone: function() {
    return this.slice(0);
  },
  deepClone: function() {
    var a = this.slice(0);
    for ( var i = 0 ; i < a.length ; i++ ) {
      a[i] = a[i].deepClone();
    }
    return a;
  },
  put: function(obj, sink) {
    // With this block of code an [] is a real DAO
    // but is much slower for collecting results.
    /*
      for (var idx in this) {
      if (this[idx].id === obj.id) {
      this[idx] = obj;
      sink && sink.put && sink.put(obj);
      this.notify_('put', arguments);
      //        sink && sink.error && sink.error('put', obj, duplicate);
      return;
      }
      }
    */
    this.push(obj);
    this.notify_('put', arguments);
    sink && sink.put && sink.put(obj);
  },
  find: function(query, sink) {
    if ( query.f ) {
      for (var idx in this) {
        if ( query.f(this[idx]) ) {
          sink && sink.put && sink.put(this[idx]);
          return;
        }
      }
    } else {
      for (var idx in this) {
        if ( this[idx].id === query ) {
          sink && sink.put && sink.put(this[idx]);
          return;
        }
      }
    }
    sink && sink.error && sink.error('find', query);
  },
  // TODO: make this faster, should stop after finding first item.
  remove: function(query, sink) {
    var id = query.id ? query.id : query;
    this.removeAll({ remove: sink && sink.remove },
                   { query: { f: function(obj) { return obj.id ? obj.id === id : obj === id; } } });
  },
  removeAll: function(sink, options) {
    if (!options) options = {};
    if (!options.query) options.query = { f: function() { return true; } };

    for (var i = 0; i < this.length; i++) {
      var obj = this[i];
      if (options.query.f(obj)) {
        var rem = this.splice(i,1)[0];
        this.notify_('remove', [rem]);
        sink && sink.remove && sink.remove(rem);
        i--;
      }
    }
    sink && sink.eof && sink.eof();
    return anop();
  },
  select: function(sink, options) {
    sink = sink || [];
    var hasQuery = options && ( options.query || options.order );
    var originalsink = sink;
    sink = this.decorateSink_(sink, options, false, ! hasQuery);

    // Short-circuit COUNT.
    if ( sink.model_ === CountExpr ) {
      sink.count = this.length;
      return aconstant(originalsink);
    }

    var fc = this.createFlowControl_();
    var start = Math.max(0, hasQuery ? 0 : ( options && options.skip ) || 0);
    var end = hasQuery ?
      this.length :
      Math.min(this.length, start + ( ( options && options.limit ) || this.length));
    for ( var i = start ; i < end ; i++ ) {
      sink.put(this[i], null, fc);
      if ( fc.stopped ) break;
      if ( fc.errorEvt ) {
        sink.error && sink.error(fc.errorEvt);
        return aconstant(originalsink, fc.errorEvt);
      }
    }

    sink.eof && sink.eof();

    return aconstant(originalsink);
  }
});

function atxn(afunc) {
  return function(ret) {
    if ( GLOBAL.__TXN__ ) {
      afunc.apply(this, arguments);
    } else {
      GLOBAL.__TXN__ = {};
      var a = argsToArray(arguments);
      a[0] = function() {
        GLOBAL.__TXN__ = undefined;
        ret();
      };
      afunc.apply(this, a);
    }
  };
}

/* Usage:
 * var dao = IDBDAO.create({model: Issue});
 * var dao = IDBDAO.create({model: Issue, name: 'ImportantIssues'});
 *
 * TODO:
 * Optimization.  This DAO doesn't use an indexes in indexeddb yet, which
 * means for any query other than a single find/remove we iterate the entire
 * data store.  Obviously this will get slow if you store large amounts
 * of data in the database.
 */
FOAModel({
  name: 'IDBDAO',
  label: 'IndexedDB DAO',

  extendsModel: 'AbstractDAO',

  properties: [
    {
      name:  'model',
      label: 'Model',
      type:  'Model',
      required: true
    },
    {
      name:  'name',
      label: 'Store Name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural;
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'useSimpleSerialization',
      defaultValue: true
    }
  ],

  methods: {

    init: function() {
      this.SUPER();

      if ( this.useSimpleSerialization ) {
        this.serialize = this.SimpleSerialize;
        this.deserialize = this.SimpleDeserialize;
      } else {
        this.serialize = this.FOAMSerialize;
        this.deserialize = this.FOAMDeserialize;
      }

      this.withDB = amemo(this.openDB.bind(this));
    },

    FOAMDeserialize: function(json) {
      return JSONToObject.visitObject(json);
    },

    FOAMSerialize: function(obj) {
      return ObjectToJSON.visitObject(obj);
    },

    SimpleDeserialize: function(json) {
      return this.model.create(json);
    },

    SimpleSerialize: function(obj) {
      return obj.instance_;
    },

    openDB: function(cc) {
      var indexedDB = window.indexedDB ||
        window.webkitIndexedDB         ||
        window.mozIndexedDB;

      var request = indexedDB.open("FOAM:" + this.name, 1);

      request.onupgradeneeded = (function(e) {
        e.target.result.createObjectStore(this.name);
      }).bind(this);

      request.onsuccess = (function(e) {
        cc(e.target.result);
      }).bind(this);

      request.onerror = function (e) {
        console.log('************** failure', e);
      };
    },

    withStore: function(mode, fn) {
      if ( mode !== 'readwrite' ) return this.withStore_(mode, fn);

      var self = this;

      if ( ! this.q_ ) {
        var q = [fn];
        this.q_ = q;
        setTimeout(function() {
          self.withStore_(mode, function(store) {
            // console.log('q length: ', q.length);
            if ( self.q_ == q ) self.q_ = undefined;
            for ( var i = 0 ; i < q.length ; i++ ) q[i](store);
          });
        },0);
      } else {
        this.q_.push(fn);
        // Diminishing returns after 10000 per batch
        if ( this.q_.length == 10000 ) this.q_ = undefined;
      }
    },

    withStore_: function(mode, fn) {
      if ( GLOBAL.__TXN__ && GLOBAL.__TXN__.store ) {
        try {
          fn.call(this, __TXN__.store);
          return;
        } catch (x) {
          GLOBAL.__TXN__ = undefined;
        }
      }
      this.withDB((function (db) {
        var tx = db.transaction([this.name], mode);
        var os = tx.objectStore(this.name);
        if ( GLOBAL.__TXN__ ) GLOBAL.__TXN__.store = os;
        fn.call(this, os);
      }).bind(this));
    },

    put: function(value, sink) {
      var self = this;
      this.withStore("readwrite", function(store) {
        var request = store.put(self.serialize(value), value.id);

        request.transaction.addEventListener(
          'complete',
          function(e) {
            self.notify_('put', [value]);
            sink && sink.put && sink.put(value);
          });
        request.transaction.addEventListener(
          'error',
          function(e) {
            // TODO: Parse a better error mesage out of e
            sink && sink.error && sink.error('put', value);
          });
      });
    },

    find: function(key, sink) {
      if ( Expr.isInstance(key) ) {
        var found = false;
        this.limit(1).where(key).select({
          put: function() {
            found = true;
            sink.put.apply(sink, arguments);
          },
          eof: function() {
            found || sink.error('find', key);
          }
        });
        return;
      }

      var self = this;
      this.withStore("readonly", function(store) {
        var request = store.get(key);
        request.transaction.addEventListener(
          'complete',
          function() {
            if (!request.result) {
              sink && sink.error && sink.error('find', key);
              return;
            }
            var result = self.deserialize(request.result);
            sink && sink.put && sink.put(result);
          });
        request.onerror = function(e) {
          // TODO: Parse a better error out of e
          sink && sink.error && sink.error('find', key);
        };
      });
    },

    remove: function(obj, sink) {
      var self = this;
      this.withStore("readwrite", function(store) {
        var key = obj.id ? obj.id : obj;

        var getRequest = store.get(key);
        getRequest.onsuccess = function(e) {
          if (!getRequest.result) {
            sink && sink.error && sink.error('remove', obj);
            return;
          }
          var data = self.deserialize(getRequest.result);
          var delRequest = store.delete(key);
          delRequest.transaction.addEventListener('complete', function(e) {
            self.notify_('remove', [data]);
            sink && sink.remove && sink.remove(data);
          });

          delRequest.onerror = function(e) {
            sink && sink.error && sink.error('remove', e);
          };
        };
        getRequest.onerror = function(e) {
          sink && sink.error && sink.error('remove', e);
        };
        return;
      });
    },

    removeAll: function(sink, options) {
      var query = (options && options.query && options.query.partialEval()) ||
        { f: function() { return true; } };

      var future = afuture();
      var self = this;
      this.withStore('readwrite', function(store) {
        var request = store.openCursor();
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            var value = self.deserialize(cursor.value);
            if (query.f(value)) {
              var deleteReq = cursor.delete();
              deleteReq.transaction.addEventListener(
                'complete',
                function() {
                  self.notify_('remove', [value]);
                  sink && sink.remove && sink.remove(value);
                });
              deleteReq.onerror = function(e) {
                sink && sink.error && sink.error('remove', e);
              };
            }
            cursor.continue();
          }
        };
        request.transaction.oncomplete = function() {
          sink && sink.eof && sink.eof();
          future.set();
        };
        request.onerror = function(e) {
          sink && sink.error && sink.error('remove', e);
        };
      });
      return future.get;
    },

    select: function(sink, options) {
      sink = sink || [];
      sink = this.decorateSink_(sink, options, false);

      var fc = this.createFlowControl_();
      var future = afuture();
      var self = this;

      this.withStore("readonly", function(store) {
        var request = store.openCursor();
        request.onsuccess = function(e) {
          var cursor = e.target.result;
          if ( fc.stopped ) return;
          if ( fc.errorEvt ) {
            sink.error && sink.error(fc.errorEvt);
            future.set(sink, fc.errorEvt);
            return;
          }

          if (!cursor) {
            sink.eof && sink.eof();
            future.set(sink);
            return;
          }

          var value = self.deserialize(cursor.value);
          sink.put(value);
          cursor.continue();
        };
        request.onerror = function(e) {
          sink.error && sink.error(e);
        };
      });

      return future.get;
    }
  },

  listeners: [
    {
      name: 'updated',
      code: function(evt) {
        console.log('updated: ', evt);
        this.publish('updated');
      }
    }
  ]

});


FOAModel({
  name: 'StorageDAO',

  extendsModel: 'MDAO',

  properties: [
    {
      name:  'name',
      label: 'Store Name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var objs = localStorage.getItem(this.name);
      if ( objs ) JSONUtil.parse(objs).select(this);

      this.addRawIndex({
        execute: function() {},
        bulkLoad: function() {},
        toString: function() { return "StorageDAO Update"; },
        plan: function() {
          return { cost: Number.MAX_VALUE };
        },
        put: this.updated,
        remove: this.updated
      });
    }
  },

  listeners: [
    {
      name: 'updated',
      isMerged: 100,
      code: function() {
        this.select()(function(a) {
          localStorage.setItem(this.name, JSONUtil.compact.where(NOT_TRANSIENT).stringify(a));
        }.bind(this));
      }
    }
  ]
});


FOAModel({
  extendsModel: 'AbstractDAO',

  name: 'AbstractFileDAO',

  properties: [
    {
      name:  'model',
      type:  'Model',
      requred: true
    },
    {
      name:  'filename',
      label: 'Storage file name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural;
      }
    },
    {
      name:  'type',
      label: 'Filesystem Type',
      type:  'String',
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Persistent',
          'Temporary'
        ]});}
      },
      defaultValue: 'Persistent'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;

      var withEntry = amemo(aseq(
        function(ret) {
          window.webkitStorageInfo.requestQuota(
            self.type === 'Persistent' ? 1 : 0,
            1024 * 1024 * 200, // 200 MB should be fine.
            function() { ret(1024 * 1024 * 200); },
            console.error.bind(console));
        },
        function(ret, quota) {
          window.requestFileSystem(
            self.type === 'Persistent' ? 1 : 0,
            quota, /* expected size*/
            ret,
            console.error.bind(console));
        },
        function(ret, filesystem) {
          filesystem.root.getFile(
            self.filename,
            { create: true },
            ret,
            console.error.bind(console));
        }));


      this.withWriter = amemo(aseq(
        withEntry,
        function(ret, entry) {
          entry.createWriter(ret, console.error.bind(console));
        })),


      this.withStorage = amemo(aseq(
        withEntry,
        function(ret, entry) {
          entry.file(ret, console.error.bind(console));
        },
        function(ret, file) {
          var reader = new FileReader();
          var storage = {};

          reader.onerror = console.error.bind(console);
          reader.onloadend = function() {
            self.parseContents_(ret, reader.result, storage);
          };

          this.readFile_(reader, file);
        }));
    },

    put: function(obj, sink) {
      var self = this;
      this.withStorage(function(s) {
        s.put(obj, {
          __proto__: sink,
          put: function() {
            sink && sink.put && sink.put(obj);
            self.notify_('put', [obj]);
            self.update_('put', obj);
          }
        });
      });
    },

    find: function(key, sink) {
      this.withStorage(function(s) {
        s.find(key, sink);
      });
    },

    remove: function(obj, sink) {
      var self = this;
      this.withStorage(function(s) {
        s.remove(obj, {
          __proto__: sink,
          remove: function(obj) {
            self.__proto__.remove && self.__proto__.remove(obj);
            self.notify_('remove', [obj]);
            self.update_('remove', obj);
          }
        });
      });
    },

    removeAll: function(sink, options) {
      var self = this;
      var future = afuture();
      this.withStorage(function(s) {
        var fut = s.removeAll({
          __proto__: sink,
          remove: function(obj) {
            self.__proto__.remove && self.__proto__.remove(obj);
            self.notify_('remove', [obj]);
            self.update_('remove', obj);
          }
        }, options);
        fut(future.set);
      });
      return future.get;
    },

    select: function(sink, options) {
      this.withStorage(function(s) {
        s.select(sink, options);
      });
    }
  }
});


FOAModel({
  name: 'JSONFileDAO',
  extendsModel: 'AbstractFileDAO',

  label: 'JSON File DAO',

  properties: [
    {
      name:  'writeQueue',
      type:  'Array[String]',
      defaultValueFn: function() {
        return [];
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.withWriter((function(writer) {
        writer.addEventListener(
          'writeend',
          (function(e) {
            this.writeOne_(e.target);
          }).bind(this));
      }).bind(this));
    },

    readFile_: function(reader, file) {
      reader.readAsText(file);
    },

    parseContents_: function(ret, contents, storage) {
      with (storage) { eval(contents); }
      ret(storage);
    },

    writeOne_: function(writer) {
      if ( writer.readyState == 1 ) return;
      if ( this.writeQueue.length == 0 ) return;

      writer.seek(writer.length);
      var queue = this.writeQueue;
      var blob = queue.shift();
      this.writeQueue = queue;
      writer.write(blob);
    },

    update_: function(mutation, obj) {
      var parts = [];

      if (mutation === 'put') {
        parts.push("put(" + JSONUtil.compact.stringify(obj) + ");\n");
      } else if (mutation === 'remove') {
        parts.push("remove(" + JSONUtil.compact.stringify(obj.id) + ");\n");
      }

      this.writeQueue = this.writeQueue.concat(new Blob(parts));

      this.withWriter((function(writer) {
        this.writeOne_(writer);
      }).bind(this));
    }
  }
});


FOAModel({
  name: 'KeyCollector',
  help: "A sink that collects the keys of the objects it's given.",

  properties: [
    {
      name: 'keys',
      type: 'Array',
      factory: function() { return []; }
    }
  ],

  methods: {
    put: function(value) {
      this.keys.push(value.id);
    },
    remove: function(value) {
      this.keys.remove(value.id);
    }
  }
});


FOAModel({
  name: 'WorkerDAO',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'model',
      type: 'Model',
      required: true
    },
    {
      name: 'delegate',
      type: 'Worker',
      help: 'The web-worker to delegate all actions to.',
      factory: function() {
        var url = window.location.protocol +
          window.location.host +
          window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1);
        var workerscript = [
          "var url = '" + url + "';\n",
          "var a = importScripts;",
          "importScripts = function(scripts) { \nfor (var i = 0; i < arguments.length; i++) \na(url + arguments[i]); \n};\n",
          "try { importScripts('bootFOAMWorker.js'); } catch(e) { \n debugger; }\n",
          "WorkerDelegate.create({ dao: [] });\n"
        ];
        return new Worker(window.URL.createObjectURL(
          new Blob(workerscript, { type: "text/javascript" })));
      },
      postSet: function(oldVal, val) {
        if ( oldVal ) {
          oldVal.terminate();
        }
        val.addEventListener("message", this.onMessage);
      }
    },
    {
      name:  'requests_',
      type:  'Object',
      label: 'Requests',
      help:  'Map of pending requests to delegate.',
      factory: function() { return {}; }
    },
    {
      name:  'nextRequest_',
      type:  'Int',
      label: 'Next Request',
      help:  'Id of the next request to the delegate.',
      factory: function() { return 1; }
    },
    { // Consider making this a DAO.  Challenge is keeping in sync if this throws errors after delegate has completed something.
      name:  'storage_',
      type:  'Object',
      label: 'Storage',
      help:  'Local cache of the data in the delegate.',
      factory: function() { return {}; }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.delegate.postMessage("");
    },
    destroy: function() {
      // Send a message to the delegate?
      this.delegate.terminate();
    },
    makeRequest_: function(method, params, callback, error) {
      var reqid = this.nextRequest_++;
      params = params ?
        ObjectToJSON.visit(params) :
        {};
      var message = {
        method: method,
        params: params,
        request: reqid
      };
      this.requests_[reqid] = {
        method: method,
        callback: callback,
        error: error
      };
      this.delegate.postMessage(message);
    },
    put: function(obj, sink) {
      this.makeRequest_(
        "put", obj,
        (function(response) {
          this.storage_[obj.id] = obj;
          this.notify_("put", [obj]);
          sink && sink.put && sink.put(obj);
        }).bind(this),
        sink && sink.error && sink.error.bind(sink));
    },
    remove: function(query, sink) {
      this.makeRequest_(
        "remove", query,
        (function(response) {
          for ( var i = 0, key = response.keys[i]; key; i++) {
            var obj = this.storage_[key];
            delete this.storage_[key];
            sink && sink.remove && sink.remove(obj);
          }
        }).bind(this),
        sink && sink.error && sink.error.bind(sink));
    },
    // TODO: Implement removeAll()
    find: function(id, sink) {
      // No need to go to worker.
      this.storage_.find(id, sink);
    },
    select: function(sink, options) {
      sink = sink || [];
      // Cases:
      // 1) Cloneable reducable sink. -- Clone sync, get response, reduceI
      // 2) Non-cloneable reducable sink -- treat same as case 3.
      // 3) Non-cloneable non-reducable sink -- Use key-creator, just put into sink

      var fc = this.createFlowControl_();

      if (sink.model_ && sink.reduceI) {
        var request = {
          sink: sink,
          options: options
        };

        this.makeRequest_(
          "select", request,
          (function(response) {
            var responsesink = JSONToObject.visit(response.sink);
            sink.reduceI(responsesink);
            sink.eof && sink.eof();
          }).bind(this),
          sink && sink.error && sink.error.bind(sink));
      } else {
        var mysink = KeyCollector.create();
        request = {
          sink: mysink,
          options: options
        };

        this.makeRequest_(
          "select", request,
          (function(response) {
            var responsesink = JSONToObject.visit(response.sink);
            for (var i = 0; i < responsesink.keys.length; i++) {
              var key = responsesink.keys[i];
              if ( fc.stopped ) break;
              if ( fc.errorEvt ) {
                sink.error && sink.error(fc.errorEvt);
                break;
              }
              var obj = this.storage_[key];
              sink.put(obj);
            }
            sink.eof && sink.eof();
          }).bind(this),
          sink && sink.error && sink.error.bind(sink));
      }
    },
    handleNotification_: function(message) {
      if (message.method == "put") {
        var obj = JSONToObject.visitObject(message.obj);
        this.storage_[obj.id] = obj;
        this.notify_("put", [obj]);
      } else if (message.method == "remove") {
        var obj = this.stroage_[message.key];
        delete this.storage_[message.key];
        this.notify_("remove", [obj]);
      }
    }
  },

  listeners: [
    {
      name: 'onMessage',
      help: 'Callback for message events from the delegate.',
      code: function(e) {
        // FIXME: Validate origin.
        var message = e.data;
        if (message.request) {
          var request = this.requests_[message.request];
          delete this.requests_[message.request];
          if (message.error) {
            request.error(message.error);
            return;
          }
          request.callback(message);
          return;
        } // If no request was specified this is a notification.
        this.handleNotification_(message);
      }
    }
  ]
});


FOAModel({
  name: 'WorkerDelegate',
  help:  'The client side of a web-worker DAO',

  properties: [
    {
      name:  'dao',
      label: 'DAO',
      type:  'DAO',
      required: 'true',
      postSet: function(oldVal, val) {
        if (oldVal) oldVal.unlisten(this);
        val.listen(this);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      self.addEventListener('message', this.onMessage);
    },
    put: function(obj) {
      self.postMessage({
        method: "put",
        obj: ObjectToJSON.visitObject(obj)
      });
    },
    remove: function(obj) {
      self.postMessage({
        method: "remove",
        key: obj.id
      });
    }
  },

  listeners: [
    {
      name: 'onMessage',
      code: function(e) {
        // This is a nightmare of a function, clean it up.
        var message = e.data;
        if ( !message.method ) return;
        var me = this;
        var params = message.params.model_ ?
          JSONToObject.visitObject(message.params) :
          message.params;
        if (message.method == "put") {
          this.dao.put(params, {
            put: function() {
              self.postMessage({
                request: message.request
              });
            },
            error: function() {
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          });
        } else if(message.method == "remove") {
          this.dao.remove(params, {
            remove: function() {
              self.postMessage({
                request: message.request
              });
            },
            error: function() {
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          });
        } else if(message.method == "select") {
          var request = JSONToObject.visit(message.params);
          var mysink = {
            __proto__: request.sink,
            eof: function() {
              request.sink.eof && request.sink.eof();
              self.postMessage({
                request: message.request,
                sink: ObjectToJSON.visit(this.__proto__)
              });
            },
            error: function() {
              request.sink.error && request.sink.error();
              self.postMessage({
                request: message.request,
                error: true
              });
            }
          };
          this.dao.select(mysink, request.options);
        }
      }
    }
  ]
});


var ModelDAO = {
  create: function(namespace, dao) {
    var res = {
      __proto__: dao,
      namespace: namespace,
      dao:       dao,
      created:   { },

      init_: function() {
        var self = this;
        this.pipe({
          put: self.add_.bind(this),
          remove: self.del_.bind(this)
        });
      },

      add_: function(obj) {
        if ( obj.name == 'Model' ) return;

        var dao = this;

        this.namespace[obj.name] = obj;

        FOAM.putFactory(this.namespace, obj.name + "Proto", function() {
          return this.namespace[obj.name].getPrototype();
        });

        FOAM.putFactory(this.namespace, obj.name + 'DAO', function() {
          console.log("Creating '" + obj.name + "DAO'");
          return StorageDAO.create({ model: obj });
        });
      },

      del_: function() {
        for (var objID in this.created) {
          delete this.namespace[objID];
        }
      }

      //TODO: remove models from namespace on remove()
    };
    res.init_();
    return res;
  }
};


FOAModel({
  name: 'OrderedCollectorSink',

  properties: [
    {
      name: 'storage',
      type: 'Array',
      factory: function() { return []; }
    },
    {
      name: 'comparator',
      type: 'Value',
      required: true
    }
  ],

  methods: {
    reduceI: function(other) {
      this.storage = this.storage.reduce(this.comparator, other.storage);
    },
    put: function(obj) {
      this.storage.push(obj);
    }
  }
});


FOAModel({
  name: 'CollectorSink',

  properties: [
    {
      name: 'storage',
      type: 'Array',
      factory: function() { return []; }
    }
  ],

  methods: {
    reduceI: function(other) {
      this.storage = this.storage.concat(other.storage);
    },
    put: function(obj) {
      this.storage.push(obj);
    }
  }
});


FOAModel({
  name: 'ParitionDAO',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'partitions',
      type: 'Array[DAO]',
      mode: "read-only",
      required: true
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      for ( var i = 0; i < this.partitions.length; i++) {
        var part = this.partitions[i];
        var self = this;
        part.listen({
          put: function(value) {
            self.notify_("put", [value]);
          },
          remove: function(value) {
            self.notify_("remove", [value]);
          }
        });
      }
    },
    getPartition_: function(value) {
      return this.partitions[Math.abs(value.hashCode()) % this.partitions.length];
    },
    put: function(value, sink) {
      this.getPartition_(value).put(value, sink);
    },
    remove: function(obj, sink) {
      if (obj.id) {
        this.getPartition_(obj).remove(obj, sink);
      } else {
        var self = this;
        this.find(obj, { put: function(obj) { self.remove(obj, sink); }, error: sink && sink.error });
      }
    },
    find: function(key, sink) {
      // Assumes no data redundancy
      for (var i = 0; i < this.partitions.length; i++) {
        this.partitions[i].find(key, sink);
      }
    },
    select: function(sink, options) {
      sink = sink || [];
      var myoptions = {};
      var originalsink = sink;
      options = options || {};
      if ( 'limit' in options ) {
        myoptions.limit = options.limit + (options.skip || 0),
        myoptions.skip = 0;
      }

      myoptions.order = options.order;
      myoptions.query = options.query;

      var pending = this.partitions.length;

      var fc = this.createFlowControl_();
      var future = afuture();

      if (sink.model_ && sink.reduceI) {
        var mysink = sink;
      } else {
        if (options.order) {
          mysink = OrderedCollectorSink.create({ comparator: options.order });
        } else {
          mysink = CollectorSink.create({});
        }
        if ( 'limit' in options ) sink = limitedSink(options.limit, sink);
        if ( options.skip ) sink = skipSink(options.skip, sink);

        mysink.eof = function() {
          for (var i = 0; i < this.storage.length; i++) {
            if ( fc.stopped ) break;
            if ( fc.errorEvt ) {
              sink.error && sink.error(fc.errorEvt);
              future.set(sink, fc.errorEvt);
              break;
            }
            sink.put(this.storage[i], null, fc);
          }
        };
      }

      var sinks = new Array(this.partitions.length);
      for ( var i = 0; i < this.partitions.length; i++ ) {
        sinks[i] = mysink.deepClone();
        sinks[i].eof = function() {
          mysink.reduceI(this);
          pending--;
          if (pending <= 0) {
            mysink.eof && mysink.eof();
            future.set(originalsink);
          }
        };
      }

      for ( var i = 0; i < this.partitions.length; i++ ) {
        this.partitions[i].select(sinks[i], myoptions);
      }

      return future.get;
    }
  }
});


FOAModel({
  name: 'ActionFactoryDAO',
  extendsModel: 'ProxyDAO',
  label: 'ActionFactoryDAO',

  properties: [
    {
      name: 'actionDao',
      type: 'DAO',
      hidden: true,
      required: true
    }
  ],

  methods: {
    put: function(value, sink) {
      var self = this;
      aseq(
        function(ret) {
          self.delegate.find(value.id, {
            put: function(obj) {
              ret(obj);
            },
            error: function() { ret(); }
          });
        },
        function(ret, existing) {
          if (existing) {
            existing.writeActions(
              value,
              self.actionDao.put.bind(self.actionDao));
          } else if (value.model_.createActionFactory) {
            value.model_.createActionFactory(function(actions) {
              for (var j = 0; j < actions.length; j++)
                self.actionDao.put(actions[j]);
            }, value);
          }
          self.delegate.put(value, sink);
          ret();
        })(function() {});
    },
    remove: function(value, sink) {
      if (value.model_.deleteActionFactory) {
        var actions = value.model_.deleteActionFactory(value);
        for (var j = 0; j < actions.length; j++)
          this.actionDao.put(actions[j]);
      }
      this.delegate.remove(value, sink);
    }
  }
});


// TODO Why is this even a DAO, it literally only does find.
FOAModel({
  name: 'BlobReaderDAO',

  properties: [
    {
      name: 'blob',
      type: 'Blob',
      required: true
    }
  ],
  methods: {
    put: function(value, sink) {
      sink && sink.error && sink.error("Unsupported");
    },

    remove: function(query, sink) {
      sink && sink.error && sink.error("Unsupported");
    },

    select: function(query, sink) {
      sink = sink || [];
      sink && sink.error && sink.error("Unsupported");
    },

    find: function(key, sink) {
      var slice = this.blob.slice(key[0], key[0] + key[1]);
      var reader = new FileReader();
      reader.readAsText(slice);
      reader.onload = function(e) {
        sink && sink.put && sink.put(reader.result);
      };
      reader.onerror = function(e) {
        sink && sink.error && sink.error("find", e);
      };
    }
  }
});

FOAModel({
  name: 'GDriveDAO',
  properties: [
    {
      name: 'authtoken',
      label: 'Authentication Token'
    }
  ],

  methods: {
    put: function(value, sink) {
    },
    remove: function(query, sink) {
    },
    select: function(sink, options) {
      sink = sink || [];
      var xhr = new XMLHttpRequest();
      var params = [
        'maxResults=10'
      ];
      xhr.open(
        'GET',
        "https://www.googleapis.com/drive/v2/files?" + params.join('&'));
      xhr.setRequestHeader('Authorization', 'Bearer ' + this.authtoken);

      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;

        var response = JSON.parse(xhr.responseText);
        if (!response || !response.items) {
          sink && sink.error && sink.error(xhr.responseText);
          return;
        }

        for (var i = 0; i < response.items.length; i++) {
          sink && sink.put && sink.put(response.items[i]);
        }
      };
      xhr.send();
    },
    find: function(key, sink) {
    }
  }
});

FOAModel({
  name: 'RestDAO',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'model',
      label: 'Type of data stored in this DAO.'
    },
    {
      name: 'url',
      label: 'REST API URL.'
    },
    {
      model_: 'ArrayProperty',
      subType: 'Property',
      name: 'paramProperties',
      help: 'Properties that are handled as separate parameters rather than in the query.'
    },
    {
      model_: 'IntProperty',
      name: 'batchSize',
      defaultValue: 200
    },
    {
      model_: 'IntProperty',
      name: 'skipThreshold',
      defaultValue: 1000
    }
  ],

  methods: {
    jsonToObj: function(json) {
      return this.model.create(json);
    },
    objToJson: function(obj) {
      return JSONUtil.compact.stringify(obj);
    },
    buildURL: function(query) {
      return this.url;
    },
    buildFindURL: function(key) {
      return this.url + '/' + key;
    },
    buildPutURL: function(obj) {
      return this.url;
    },
    buildPutParams: function(obj) {
      return [];
    },
    buildSelectParams: function(sink, query) {
      return [];
    },
    put: function(value, sink) {
      var self = this;
      var extra = {};
      this.X.ajsonp(this.buildPutURL(value),
             this.buildPutParams(value),
             "POST",
             this.objToJson(value, extra)
            )(
        function(resp, status) {
          if ( status !== 200 ) {
            sink && sink.error && sink.error([resp, status]);
            return;
          }
          var obj = self.jsonToObj(resp, extra);
          sink && sink.put && sink.put(obj);
          self.notify_('put', [obj]);
        });
    },
    remove: function(query, sink) {
    },
    select: function(sink, options) {
      sink = sink || [];
      var fut = afuture();
      var self = this;
      var limit;
      var skipped = 0;
      var index = 0;
      var fc = this.createFlowControl_();
      // TODO: This is a very ugly way of passing additional data
      // from buildURL to jsonToObj, used by the IssueCommentNetworkDAO
      // Clean this up.
      var extra = {};
      var params = [];

      if ( options ) {
        index += options.skip || 0;

        var query = options.query;
        var url;

        if ( query ) {
          var origQuery = query;
          query = query.normalize();

          var outquery = [query, origQuery.deepClone()];

          params = this.buildSelectParams(sink, outquery);

          url = this.buildURL(outquery, extra);

          query = outquery[0];
          origQuery = outquery[1];

          var mql = query.toMQL();
          if ( mql ) params.push('q=' + encodeURIComponent(query.toMQL()));
        } else {
          url = this.buildURL();
        }

        if ( options.order ) {
          var sort = options.order.toMQL();
          params.push("sort=" + sort);
        }

        if ( options.limit ) {
          limit = options.limit;
        }
      }

      var finished = false;
      awhile(
        function() { return !finished; },
        function(ret) {
          var batch = self.batchSize;

          if ( Number.isFinite(limit) )
            var batch = Math.min(batch, limit);

          // No need to fetch items for count.
          if ( CountExpr.isInstance(sink) ) {
            batch = 0;
          }

          var myparams = params.slice();
          myparams.push('maxResults=' + batch);
          myparams.push('startIndex=' + index);

          this.X.ajsonp(url, myparams)(function(data) {
            // Short-circuit count.
            // TODO: This count is wrong for queries that use
            if ( CountExpr.isInstance(sink) ) {
              sink.count = data.totalResults;
              finished = true;
              ret(); return;
            }

            var items = data && data.items ? data.items : [];

            // Fetching no items indicates EOF.
            if ( items.length == 0 ) finished = true;
            index += items.length;

            for ( var i = 0 ; i < items.length; i++ ) {
              var item = self.jsonToObj(items[i], extra)

              // Filter items that don't match due to
              // low resolution of Date parameters in MQL
              if ( origQuery && !origQuery.f(item) ) {
                skipped++;
                continue;
              }

              if ( Number.isFinite(limit) ) {
                if ( limit <= 0 ) { finished = true; break; }
                limit--;
              }

              if ( fc.stopped ) { finished = true; break; }
              if ( fc.errorEvt ) {
                sink.error && sink.error(fc.errorEvt);
                finished = true;
                break;
              }

              sink && sink.put && sink.put(item, null, fc);
            }
            if ( limit <= 0 ) finished = true;
            if ( ! data || index >= data.totalResults ) finished = true;
            if ( skipped >= self.skipThreshold ) finished = true;
            ret();
          });
        })(function() { sink && sink.eof && sink.eof(); fut.set(sink); });

      return fut.get;
    },
    find: function(key, sink) {
      var self = this;
      this.X.ajsonp(this.buildFindURL(key))(function(data) {
        if ( data ) {
          sink && sink.put && sink.put(self.jsonToObj(data));
        } else {
          sink && sink.error && sink.error('No Network Response');
        }
      });
    }
  }
});


FOAModel({
  name: 'DefaultObjectDAO',
  help: 'A DAO decorator that will generate a default object if no object is found on a .find() call.',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'factory',
      help: 'A factory method to construct the default object.'
    }
  ],

  methods: {
    find: function(q, sink) {
      var self = this;
      var mysink = {
        put: sink.put.bind(sink),
        error: function() {
          sink.put(self.factory(q));
        },
      };
      this.delegate.find(q, mysink);
    }
  }
});


FOAModel({
  name: 'LRUCachingDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      model_: 'IntProperty',
      name: 'maxSize',
      defaultValue: 30
    },
    {
      name: 'cacheFactory',
      defaultValueFn: function() { return MDAO; }
    },
    {
      name: 'cache',
      hidden: true
    },
  ],

  models: [
    {
      model_: 'Model',
      name: 'LRUCacheItem',
      ids: ['id'],
      properties: [
        {
          name: 'id',
        },
        {
          name: 'obj',
        },
        {
          model_: 'DateTimeProperty',
          name: 'timestamp'
        }
      ]
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER();
      this.cache = this.cacheFactory.create({
        model: this.LRUCacheItem
      });
      var self = this;
      this.delegate.listen({
        remove: function(obj) {
          self.cache.remove(obj);
        }
      });
    },
    find: function(id, sink) {
      var self = this;
      this.cache.find(id, {
        put: function(obj) {
          obj.timestamp = new Date();
          self.cache.put(obj, {
            put: function() {
              sink && sink.put && sink.put(obj.obj);
            }
          });
        },
        error: function() {
          self.delegate.find(id, {
            put: function(obj) {
              self.cache.put(self.LRUCacheItem.create({
                id: id,
                timestamp: new Date(),
                obj: obj
              }), {
                put: function(obj) {
                  sink && sink.put && sink.put(obj.obj);
                  self.cleanup_();
                },
                error: function() {
                  sink && sink.error && sink.error.apply(sink, arguments);
                }
              });
            },
            error: function() {
              sink && sink.error && sink.error.apply(sink, arguments);
            }
          });
        }
      });
    },
    put: function(obj, sink) {
      var self = this;
      this.cache.find(obj.id, {
        put: function(obj) {
          obj.timestamp = new Date();
          self.cache.put(obj, {
            put: function(obj) {
              self.delegate.put(obj.obj, sink);
            },
            error: function() {
              sink && sink.error && sink.error.apply(this, arguments);
            }
          });
        },
        error: function() {
          self.cache.put(self.LRUCacheItem.create({
            timestamp: new Date(),
            id: obj.id,
            obj: obj
          }), {
            put: function() {
              self.delegate.put(obj, sink);
              self.cleanup_();
            },
            error: function() {
              sink && sink.error && sink.error.apply(this, arguments);
            }
          });
        }
      });
    },
    remove: function(obj, sink) {
      if ( obj.id ) var id = obj.id;
      else id = obj;

      var self = this;
      this.cache.remove(obj.id, {
        put: function() {
          self.delegate.remove(obj, sink);
        },
        error: function() {
          sink && sink.error && sink.error('remove', obj);
        }
      });
    },
    removeAll: function(sink, options) {
      var self = this;
      this.delegate.removeAll({
        remove: function(obj) {
          self.cache.remove(obj.id, {
            remove: function() {
              sink && sink.remove && sink.remove(obj);
            },
            error: function() {
              // TODO: what's the right course of action here?
            }
          });
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      }, options);
    },
    cleanup_: function() {
      // TODO: Use removeAll instead of select when
      // all DAOs respect skip in removeAll.
      var self = this;
      this.cache
        .orderBy(DESC(this.LRUCacheItem.TIMESTAMP))
        .skip(this.maxSize).select({
          put: function(obj) {
            self.cache.remove(obj);
          }
        });
    }
  }
});


FOAModel({
  name: 'LazyCacheDAO',

  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'cache'
    }
  ],

  methods: {
    find: function(id, sink) {
      var self = this;

      var mysink = {
        put: sink.put.bind(sink),
        error: function() {
          self.delegate.find(id, {
            put: function(obj) {
              var args = arguments;
              self.cache.put(obj, {
                put: function() { sink.put.apply(sink, args); }
              });
            },
            error: function() {
              sink && sink.error && sink.error.apply(sink, arguments);
            }
          });
        }
      };

      this.cache.find(id, mysink);
    }
  }
});


FOAModel({
  name: 'PropertyOffloadDAO',
  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'property'
    },
    {
      name: 'model'
    },
    {
      name: 'offloadDAO'
    },
    {
      model_: 'BooleanProperty',
      name: 'loadOnSelect'
    }
  ],

  methods: {
    put: function(obj, sink) {
      if ( obj.hasOwnProperty(this.property.name) ) {
        var offload = this.model.create({ id: obj.id });
        offload[this.property.name] = this.property.f(obj);
        obj[this.property.name] = '';
        this.offloadDAO.put(offload);
      }
      this.delegate.put(obj, sink);
    },

    select: function(sink, options) {
      if ( ! this.loadOnSelect ) return this.delegate.select(sink, options);

      var mysink = this.offloadSink(sink);
      return this.delegate.select(mysink, options);
    },

    offloadSink: function(sink) {
      var self = this;
      return {
        __proto__: sink,
        put: function(obj) {
          sink.put && sink.put.apply(sink, arguments);
          self.offloadDAO.find(obj.id, {
            put: function(offload) {
              if ( offload[self.property.name] )
                obj[self.property.name] = offload[self.property.name];
            }
          });
        },
      };
    },

    find: function(id, sink) {
      this.delegate.find(id, this.offloadSink(sink));
    }
  }
});


FOAModel({
  name: 'BlobSerializeDAO',
  extendsModel: 'ProxyDAO',

  properties: [
    {
      model_: 'ArrayProperty',
      name: 'properties',
      subType: 'Property'
    }
  ],

  methods: {
    serialize: function(ret, obj) {
      obj = obj.clone();
      var afuncs = [];
      for ( var i = 0, prop; prop = this.properties[i]; i++ ) {
        afuncs.push((function(prop) {
          return (function(ret) {
            if ( !obj[prop.name] ) {
              ret();
              return;
            }

            var reader = new FileReader();
            reader.onloadend = function() {
              var type = obj[prop.name].type;
              obj[prop.name] = 'data:' + type + ';base64,' + Base64Encoder.encode(new Uint8Array(reader.result));
              ret();
            }

            reader.readAsArrayBuffer(obj[prop.name]);
          });
        })(prop));
      }

      apar.apply(undefined, afuncs)(function() {
        ret(obj);
      });
    },

    deserialize: function(obj) {
      for ( var i = 0, prop; prop = this.properties[i]; i++ ) {
        var value = prop.f(obj);
        if ( !value ) continue;
        var type = value.substring(value.indexOf(':') + 1,
                                   value.indexOf(';'));
        value = value.substring(value.indexOf(';base64') + 7);
        var decoder = Base64Decoder.create([]);
        decoder.put(value);
        decoder.eof();
        obj[prop.name] = new Blob(decoder.sink, { type: type });
      }
    },

    put: function(o, sink) {
      var self = this;
      this.serialize(function(obj) {
        self.delegate.put(obj, sink);
      }, o);
    },

    select: function(sink, options) {
      var self = this;
      var mysink = {
        __proto__: sink,
        put: function() {
          var args = Array.prototype.slice.call(arguments);
          self.deserialize(args[0]);
          sink.put.apply(sink, args);
        }
      };
      var args = Array.prototype.slice.call(arguments);
      args[0] = mysink;
      this.delegate.select.apply(this.delegate, args);
    },

    find: function(q, sink) {
      var self = this;
      var mysink = {
        __proto__: sink,
        put: function() {
          var args = Array.prototype.slice.call(arguments);
          self.deserialize(args[0]);
          sink.put.apply(sink, args);
        }
      };
      this.delegate.find(q, mysink);
    }
  }
});


FOAModel({
  name: 'NullDAO',
  help: 'A DAO that stores nothing and does nothing.',
  methods: {
    put: function(obj, sink) { sink && sink.put && sink.put(obj); },
    remove: function(obj, sink) { sink && sink.remove && sink.remove(obj); },
    select: function(sink) {
      sink && sink.eof && sink.eof();
      return aconstant(sink);
    },
    find: function(q, sink) { sink && sink.error && sink.error('find', q); },
    listen: function() {},
    removeAll: function() {},
    unlisten: function() {},
    pipe: function() {},
    where: function() { return this; },
    limit: function() { return this; },
  }
});


var WaitCursorDAO = FOAM({
  model_: 'Model',
  name: 'WaitCursorDAO',
  extendsModel: 'ProxyDAO',

  properties: [
    {
      name: 'count',
      defaultValue: 0,
      postSet: function(oldValue, newValue) {
        if ( ! this.window ) return;
        if ( oldValue == 0 ) DOM.setClass(this.window.document.body, 'waiting');
        else if ( newValue == 0 ) DOM.setClass(this.window.document.body, 'waiting', false);
      }
    },
    {
      name: 'window'
    }
  ],

  methods: {
    select: function(sink, options) {
      var self = this;
      var future = afuture();

      this.count++;
      var f = function() {
        self.delegate.select(sink, options)(function(sink) {
          try {
            future.set(sink);
          } finally {
          // ???: Do we need to call this asynchronously if count == 0?
            self.count--;
          }
        });
      };

      // Need to delay when turning on hourglass to give DOM a chance to update
      if ( this.count > 1 ) { f(); } else { this.window.setTimeout(f, 1); };

      return future.get;
    }
  }
});


FOAModel({
  name: 'EasyDAO',
  extendsModel: 'ProxyDAO',

  help: 'A facade for easy DAO setup.',

  properties: [
    {
      name: 'model'
    },
    {
      name: 'name',
      defaultValueFn: function() { return this.model.plural; }
    },
    {
      model_: 'BooleanProperty',
      name: 'seqNo',
      defaultValue: false
    },
    {
      name: 'seqProperty',
      type: 'Property'
    },
    {
      model_: 'BooleanProperty',
      name: 'cache',
      defaultValue: false
    },
    {
      model_: 'BooleanProperty',
      name: 'logging',
      defaultValue: false
    },
    {
      model_: 'BooleanProperty',
      name: 'timing',
      defaultValue: false
    },
    {
      name: 'daoType',
      defaultValue: 'IDBDAO'
    },
    {
      model_: 'BooleanProperty',
      name: 'autoIndex',
      defaultValue: false
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var daoModel = typeof this.daoType === 'string' ? GLOBAL[this.daoType] : this.daoType;
      var params = { model: this.model, autoIndex: this.autoIndex };

      if ( this.name  ) params.name = this.name;
      if ( this.seqNo ) params.property = this.seqProperty;

      var dao = daoModel.create(params);

      if ( MDAO.isInstance(dao) ) {
        this.mdao = dao;
      } else if ( this.cache ) {
        this.mdao = MDAO.create(params);
        dao = CachingDAO.create({cache: this.mdao, src: dao, model: this.model});
      }

      if ( this.seqNo ) {
        var args = {__proto__: params, delegate: dao, model: this.model};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = SeqNoDAO.create(args);
      }

      if ( this.timing  ) dao = TimingDAO.create(this.name + 'DAO', dao);
      if ( this.logging ) dao = LoggingDAO.create(dao);

      this.delegate = dao;
    },

    addIndex: function() {
      this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
    },

    addRawIndex: function() {
      this.mdao && this.mdao.addRawIndex.apply(this.mdao, arguments);
    },

  }
});


// Experimental, convert all functions into sinks
Function.prototype.put    = function() { this.apply(this, arguments); };
Function.prototype.remove = function() { this.apply(this, arguments); };
//Function.prototype.error  = function() { this.apply(this, arguments); };
//Function.prototype.eof    = function() { this.apply(this, arguments); };

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

FOAModel({
  name: 'ClientDAO',
  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'asend',
      help: 'afunc used to send request to the DAOServer.',
      required: true
    },
    {
      name: 'model',
      required: true
    },
    {
      name: 'subject',
      factory: function() { return this.model.name + 'DAO'; }
    },
  ],

  methods: {
    oneShot_: function(method, params, sink) {
      var self = this;
      this.asend(function(resp) {
        if ( !sink ) return;
        if ( ! resp ) sink && sink.error && sink.error(method, params[0]);
        if ( resp.put ) {
          if ( resp.put.model_ )
            self.notify_('put', resp.put);
          else
            self.notify_('put', params[0]);
          sink && sink.put && sink.put(resp.put);
        } else if ( resp.remove ) {
          self.notify_('remove', params[0]);
          sink && sink.remove && sink.remove(resp.remove);
        } else if ( resp.error ) sink.error(resp.error);
      }, {
        subject: self.subject,
        method: method,
        params: params
      });
    },
    put: function(obj, sink) {
      this.oneShot_('put', [obj], sink);
    },
    remove: function(obj, sink) {
      this.oneShot_('remove', [obj], sink);
    },
    find: function(q, sink) {
      this.oneShot_('find', [q], sink);
    },
    removeAll: function(sink, options) {
      // If sink.remove is not defined, we can skip the expensive returning of data.
      // If we need results back, the server returns an array of removed values.
      var hasSink = !!(sink && sink.remove);
      var future = afuture();
      this.asend(function(response) {
        if (hasSink && response) {
          if (sink.remove) response.forEach(sink.remove);
        }
        sink && sink.eof && sink.eof();
        future.set();
      }, {
        subject: self.subject,
        method: 'removeAll',
        params: [hasSink, options]
      });
      return future;
    },
    select: function(sink, options) {
      sink = sink || [];
      var future = afuture();

      var self = this;

      if ( sink.model_ || Array.isArray(sink) ) {
        this.asend(function(response) {
          if ( ! response ) sink && sink.error && sink.error();
          future.set(response || sink);
        }, {
          subject: self.subject,
          method: 'select',
          params: [sink, options]
        });
      } else {
        var fc = this.createFlowControl_();

        this.asend(function(response) {
          if ( ! response ) {
            sink && sink.error && sink.error('');
            future.set(sink);
            return;
          }
          for ( var i = 0; i < response.length; i++ ) {
            if ( fc.stopped ) break;
            if ( fc.errorEvt ) {
              sink.error && sink.error(fc.errorEvt);
              break;
            }
            sink.put && sink.put(response[i], null, fc);
          }
          sink.eof && sink.eof();
          future.set(sink);
        }, {
          subject: self.subject,
          method: 'select',
          params: [[], options]
        });
      }

      return future.get;
    }
  }
});

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

defineProperties(Array.prototype, {
    diff: function(other) {
        var added = other.slice(0);
        var removed = [];
        for (var i = 0; i < this.length; i++) {
            for (var j = 0; j < added.length; j++) {
                if (this[i].compareTo(added[j]) == 0) {
                    added.splice(j, 1);
                    j--;
                    break;
                }
            }
            if (j == added.length) removed.push(this[i]);
        }
        return { added: added, removed: removed };
    }
});

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
FOAModel({
   name: 'SplitDAO',

   extendsModel: 'AbstractDAO',

   properties: [
      {
         model_: 'StringProperty',
         name: 'activeQuery'
      },
      {
         name:  'model',
         label: 'Model',
         type:  'Model',
         hidden: true,
         required: true
      },
      {
         name: 'local',
         type: 'DAO',
         mode: "read-only",
         hidden: true,
         required: true
      },
      {
         name: 'remote',
         type: 'DAO',
         mode: "read-only",
         hidden: true,
         required: true
      }
   ],

   methods: {
      init: function() {
        this.SUPER();
      },

      put: function(value, sink) {
         this.local.put(value, sink);
      },

      remove: function(query, sink) {
         this.local.remove(query, sink);
      },

      find: function(key, sink) {
         // Assumes 'local' has all of the data
         this.local.find(key, sink);
      },

      select: function(sink, options) {
         var query = ( options.query && options.query.toSQL() ) || "";

         if ( query !== this.activeQuery ) {
            this.activeQuery = query;
            console.log('new Query');

            var buf = this.buf = MDAO.create({model: this.model});

            // Add an index for the specified sort order if one is provided
            if ( options && options.order ) this.buf.addIndex(options.order);

            this.local.select(buf, options.query ? {query: options.query} : {})((function() {
               buf.select(sink, options);
               this.remote.select(buf, options)(function() {
                 // Notify listeners that the DAO's data has changed
                 if ( buf === this.buf ) this.notify_('put');
               });
            }).bind(this));
         } else {
            this.buf.select(sink, options);
         }
      }
   }
});



/*
var dao = ProxyDAO.create({delegate: []});
dao.listen(console.log);

dao.put("foo");
dao.put("bar")

*/


FOAModel({
   name: 'DelayedDAO',

   extendsModel: 'ProxyDAO',

   properties: [
      {
         model_: 'IntProperty',
         name: 'initialDelay'
      },
      {
         model_: 'IntProperty',
         name: 'rowDelay'
      }
   ],

   methods: {
      select: function(sink, options) {
         var i = 0;
         var delayedSink = {
            __proto__: sink,
            put: function() {
               var args = arguments;
               setTimeout(function() {
                  sink.put.apply(sink, args);
               }, this.rowDelay * ++i);
            }.bind(this)
         };
         setTimeout(function() {
            this.delegate.select(delayedSink, options);
         }.bind(this), this.initialDelay);
      }
   }
});

/*
var dao = DelayedDAO.create({delegate: [1,2,3], initialDelay: 5000, rowDelay: 2000});
dao.select(console.log);
*/

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
 * TODO:
 *  reuse plans
 *  add ability for indices to pre-populate data
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
      tail: tail,
      selectCount: 0
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

  maybeClone: function(s) {
    if ( s && this.selectCount > 0 ) return s.clone();
    return s;
  },

  put: function(s, newValue) {
    return this.putKeyValue(s, this.prop.f(newValue), newValue);
  },

  putKeyValue: function(s, key, value) {
    if ( ! s ) {
      return [key, this.tail.put(null, value), 1, 1];
    }

    s = this.maybeClone(s);

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
      var l = this.maybeClone(s[LEFT]);

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
      var r = this.maybeClone(s[RIGHT]);

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

    s = this.maybeClone(s);

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
      s[RIGHT] = this.skew(this.maybeClone(s[RIGHT]));
      if ( s[RIGHT][RIGHT] ) s[RIGHT][RIGHT] = this.skew(this.maybeClone(s[RIGHT][RIGHT]));
    }
    s = this.split(s);
    s[RIGHT] = this.split(this.maybeClone(s[RIGHT]));

    return s;
  },

  removeNode: function(s, key) {
    if ( ! s ) return s;

    s = this.maybeClone(s);

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
        s[RIGHT] = this.maybeClone(s[RIGHT]);
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
      if ( options.skip >= size && ! options.query ) {
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

  findPos: function(s, key, incl) {
    if ( ! s ) return 0;
    var r = this.compare(s[KEY], key);
    if ( r === 0 ) {
      return incl ?
        this.size(s[LEFT]) :
        this.size(s) - this.size(s[RIGHT]);
    }
    return r > 0 ?
      this.findPos(s[LEFT], key, incl) :
      this.findPos(s[RIGHT], key, incl) + this.size(s) - this.size(s[RIGHT]);
  },

  size: function(s) { return s ? s[SIZE] : 0; },

  compare: function(o1, o2) {
    return this.prop.compareProperty(o1, o2);
  },

  plan: function(s, sink, options) {
    var query = options && options.query;

    if ( query === FALSE ) return NOT_FOUND;

    if ( ! query && sink.model_ === CountExpr ) {
      var count = this.size(s);
      //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
      return {
        cost: 0,
        execute: function(unused, sink, options) { sink.count += count; },
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
            if ( q.model_ === model && q.arg1 === prop ) {
              query = query.clone();
              query.args[i] = TRUE;
              query = query.partialEval();
              if ( query === TRUE ) query = null;
              return q.arg2;
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
    if ( arg2 &&
         // Just scan if that would be faster.
         Math.log(this.size(s))/Math.log(2) * arg2.length < this.size(s) ) {
      var keys = arg2;
      var subPlans = [];
      var results  = [];
      var cost = 1;

      var newOptions = {};
      if ( query ) newOptions.query = query;
      if ( 'limit' in options ) newOptions.limit = options.limit;
      if ( 'skip'  in options ) newOptions.skip  = options.skip;
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
      var pos = this.findPos(s, key, false);
      var newOptions = {skip: ((options && options.skip) || 0) + pos};
      if ( query ) newOptions.query = query;
      if ( 'limit' in options ) newOptions.limit = options.limit;
      if ( 'order' in options ) newOptions.order = options.order;
      options = newOptions;
    }

    arg2 = isExprMatch(GteExpr);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var pos = this.findPos(s, key, true);
      var newOptions = {skip: ((options && options.skip) || 0) + pos};
      if ( query ) newOptions.query = query;
      if ( 'limit' in options ) newOptions.limit = options.limit;
      if ( 'order' in options ) newOptions.order = options.order;
      options = newOptions;
    }

    arg2 = isExprMatch(LtExpr);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var pos = this.findPos(s, key, true);
      var newOptions = {limit: (pos - (options && options.skip) || 0)};
      if ( query ) newOptions.query = query;
      if ( 'limit' in options ) newOptions.limit = Math.min(options.limit, newOptions.limit);
      if ( 'skip' in options ) newOptions.skip = options.skip;
      if ( 'order' in options ) newOptions.order = options.order;
      options = newOptions;
    }

    arg2 = isExprMatch(LteExpr);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var pos = this.findPos(s, key, false);
      var newOptions = {limit: (pos - (options && options.skip) || 0)};
      if ( query ) newOptions.query = query;
      if ( 'limit' in options ) newOptions.limit = Math.min(options.limit, newOptions.limit);
      if ( 'skip' in options ) newOptions.skip = options.skip;
      if ( 'order' in options ) newOptions.order = options.order;
      options = newOptions;
    }

    var cost = this.size(s);
    var sortRequired = false;
    var reverseSort = false;

    if ( options && options.order ) {
      if ( options.order === prop ) {
        // sort not required
      } else if ( DescExpr.isInstance(options.order) && options.order.arg1 === prop ) {
        // reverse-sort, sort not required
        reverseSort = true;
      } else {
        sortRequired = true;
        cost *= Math.log(cost) / Math.log(2);
      }
    }

    if ( options && ! sortRequired ) {
      if ( options.skip ) cost -= options.skip;
      if ( options.limit ) cost = Math.min(cost, options.limit);
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
          index.selectCount++;
          index.select(s, a, {query: options.query});
          index.selectCount--;
          a.sort(toCompare(options.order));

          var skip = options.skip || 0;
          var limit = Number.isFinite(options.limit) ? options.limit : a.length;
          limit += skip;
          limit = Math.min(a.length, limit);

          for ( var i = skip; i < limit; i++ )
            sink.put(a[i]);
        } else {
// What did this do?  It appears to break sorting in saturn mail
/*          if ( reverseSort && options && options.skip )
            // TODO: temporary fix, should include range in select and selectReverse calls instead.
            options = {
              __proto__: options,
              skip: index.size(s) - options.skip - (options.limit || index.size(s)-options.skip)
            };*/
          index.selectCount++;
          reverseSort ?
            index.selectReverse(s, sink, options) :
            index.select(s, sink, options) ;
          index.selectCount--;
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
  GOOD_ENOUGH_PLAN: 10, // put to 10 or more when not testing

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
    // TODO: Should we clone s here?  That would be more
    // correct in terms of the purely functional interface
    // but maybe we can get away with it.
    s = s || this.mlang.clone();
    s.put(newValue);
    return s;
  },

  remove: function(s, obj) {
    // TODO: Should we clone s here?  That would be more
    // correct in terms of the purely functional interface
    // but maybe we can get away with it.
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


/** An Index which adds other indices as needed. **/
var AutoIndex = {
  create: function(mdao) {
    return {
      __proto__: this,
      properties: { id: true },
      mdao: mdao
    };
  },

  put: function(s, newValue) { return s; },

  remove: function(s, obj) { return s; },

  bulkLoad: function(a) {
    return 'auto';
  },

  addIndex: function(prop) {
    if ( DescExpr.isInstance(prop) ) prop = prop.arg1;

    console.log('Adding AutoIndex : ', prop.name);
    this.properties[prop.name] = true;
    this.mdao.addIndex(prop);
  },

  plan: function(s, sink, options) {
    if ( options ) {
      if ( options.order && Property.isInstance(options.order) && ! this.properties[options.order.name] ) {
        this.addIndex(options.order);
      } else if ( options.query ) {
        // TODO: check for property in query
      }
    }

    return NO_PLAN;
  },

  toString: function() { return 'AutoIndex()'; }
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
    },
    {
      model_: 'BooleanProperty',
      name: 'autoIndex',
      defaultValue: false
    }
  ],

  methods: {

    init: function() {
      this.SUPER();

      this.map = {};
      this.index = TreeIndex.create(this.model.getProperty(this.model.ids[0]));

      if ( this.autoIndex ) this.addRawIndex(AutoIndex.create(this));
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
      var oldValue = this.map[obj.id];
      if ( oldValue ) {
        this.root = this.index.put(this.index.remove(this.root, oldValue), obj);
        this.notify_('remove', [oldValue]);
      } else {
        this.root = this.index.put(this.root, obj);
      }
      this.map[obj.id] = obj;
      this.notify_('put', [obj]);
      sink && sink.put && sink.put(obj);
    },

    findObj_: function(key, sink) {
      var obj = this.map[key];
      // var obj = this.index.get(this.root, key);
      if ( obj ) {
        sink.put && sink.put(obj);
      } else {
        sink.error && sink.error('find', key);
      }
    },

    find: function(key, sink) {
      if (!key) {
        sink && sink.error && sink.error('missing key');
        return;
      }
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

    remove: function(obj, sink) {
      if ( ! obj ) {
        sink && sink.error && sink.error('missing key');
        return;
      }
      var id = (obj.id !== undefined && obj.id !== '') ? obj.id : obj;
      var self = this;
      this.find(id, {
        put: function(obj) {
          self.root = self.index.remove(self.root, obj);
          delete self.map[obj.id];
          self.notify_('remove', [obj]);
          sink && sink.remove && sink.remove(obj);
        },
        error: function() {
          sink && sink.error && sink.error('remove', obj);
        }
      });
    },

    removeAll: function(sink, options) {
      if (!options) options = {};
      if (!options.query) options.query = TRUE;
      var future = afuture();
      this.where(options.query).select([])(function(a) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.index.remove(this.root, a[i]);
          delete this.map[a[i].id];
          this.notify_('remove', [a[i]]);
          sink && sink.remove && sink.remove(a[i]);
        }
        sink && sink.eof && sink.eof();
        future.set();
      }.bind(this));
      return future.get;
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

/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
 TODO:
   Use MementoMgr.
   destroy() views when removed.
   Switch to use flexbox instead of <table>.
   Browser history support.
*/
FOAModel({
  name:  'StackView',
  extendsModel: 'View',

  properties: [
    {
      name:  'stack',
      factory: function() { return []; }
    },
    {
      name:  'redo',
      factory: function() { return []; }
    },
    {
      name: 'className',
      defaultValue: 'stackView'
    },
    {
      name: 'tagName',
      defaultValue: 'div'
    },
    {
      model_: 'BooleanProperty',
      name: 'sliderOpen'
    }
  ],

  actions: [
    {
      name:  'back',
      label: '<',
      help:  'Go to previous view',

      isEnabled: function() { return this.stack.length > 1 || this.sliderOpen; },
      action: function() {
        if ( this.sliderOpen ) {
          this.sliderOpen = false;
          this.dimmer$().style.zIndex = -1;
          this.dimmer$().style.opacity = -1;
          this.slideArea$().style.transition = 'left 0.2s cubic-bezier(0.4, 0.0, 1, 1)';
          this.slideArea$().style.left = '-304px';
          setTimeout(function() {
            this.slideArea$().style.transition = '';
            this.slideArea$().innerHTML = '';
          }.bind(this), 300);
        } else {
          this.redo.push(this.stack.pop());
          this.pushView(this.stack.pop(), undefined, true);
          this.propertyChange('stack', this.stack, this.stack);
        }
      }
    },
    {
      name:  'forth',
      label: '>',
      help:  'Undo the previous back.',

      action: function() {
        this.pushView(this.redo.pop());
        this.propertyChange('stack', this.stack, this.stack);
      }
    }
  ],

  methods: {
    dimmer$:      function() { return this.$.querySelector('.stackview-dimmer'); },
    navBar$:      function() { return this.$.querySelector('.stackview_navbar'); },
    navActions$:  function() { return this.$.querySelector('.stackview_navactions'); },
    slideArea$:   function() { return this.$.querySelector('.stackview-slidearea'); },
    viewArea$:    function() { return this.$.querySelector('.stackview-viewarea'); },
    previewArea$: function() { return this.$.querySelector('.stackview-previewarea'); },

    initHTML: function() {
      this.SUPER();

      this.dimmer$().addEventListener('click', this.back.bind(this));
    },

    setTopView: function(view, opt_label) {
      this.stack = [];
      this.pushView(view);
    },

    updateNavBar: function() {
      var buf = [];

      for ( var i = 0 ; i < this.stack.length ; i++ ) {
        var view = this.stack[i];

        if ( buf.length != 0 ) buf.push(' > ');
        buf.push(view.stackLabel);
      }

      this.navBar$().innerHTML = buf.join('');
    },

    slideView: function (view, opt_label) {
      this.sliderOpen = true;
      this.redo.length = 0;
      this.setPreview(null);
      // view.stackLabel = opt_label || view.stackLabel || view.label;
      // this.stack.push(view);
      this.slideArea$().style.left = -2000;
      var s = this.X.window.getComputedStyle(this.slideArea$());
      this.slideArea$().innerHTML = view.toHTML();
      view.initHTML();
      this.slideArea$().style.transition = '';
      this.slideArea$().style.left = -toNum(s.width);

      setTimeout(function() {
        this.dimmer$().style.zIndex = 3;
        this.dimmer$().style.opacity = 0.4;
        this.slideArea$().style.transition = 'left 0.2s cubic-bezier(0.0, 0.0, 0.2, 1)';
        this.slideArea$().style.left = '0';
        // view.stackView = this;
        // this.propertyChange('stack', this.stack, this.stack);
      }.bind(this), 10);
    },

    pushView: function (view, opt_label, opt_back) {
      if ( ! opt_back ) this.redo.length = 0;
      this.setPreview(null);
      view.stackLabel = opt_label || view.stackLabel || view.label;
      this.stack.push(view);
      this.viewArea$().innerHTML = view.toHTML();
      this.updateNavBar();
      view.stackView = this;
      view.initHTML();
      this.propertyChange('stack', this.stack, this.stack);
    },

    setPreview: function(view) {
      if ( ! view ) {
        this.viewArea$().parentNode.width = '100%';
        this.previewArea$().innerHTML = '';
        return;
      }

      this.viewArea$().parentNode.width = '65%';
      this.previewArea$().innerHTML = view.toHTML();
      view.initHTML();
    }
  },

  templates: [
    function toInnerHTML() {/*
      <div class="stackview_navbar"></div>
      <div class="stackview_navactions">$$back $$forward</div>
      <table width=100% style="table-layout:fixed;">
        <tr>
          <td width=48% valign=top class="stackview-viewarea-td">
            <div class="stackview-slidearea"></div>
            <div class="stackview-dimmer"></div>
            <div class="stackview-viewarea"></div>
          </td>
          <td width=48% valign=top class="stackview-previewarea-td"><div class="stackview-previewarea"></div></td>
        </tr>
      </table>
    */}
  ]
});

/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
FOAModel({
  name: 'MementoMgr',

  properties: [
    {
      name: 'memento'
    },
    {
      name:  'stack',
      factory: function() { return []; }
    },
    {
      name:  'redo',
      factory: function() { return []; }
    }
  ],

  actions: [
    {
      name:  'back',
      label: ' <-- ',
      help:  'Go to previous view',

      isEnabled:   function() { return this.stack.length; },
      action:      function() {
      this.dumpState('preBack');
        this.redo.push(this.memento.value);
        this.restore(this.stack.pop());
        this.propertyChange('stack', '', this.stack);
        this.propertyChange('redo', '', this.redo);
      this.dumpState('postBack');
      }
    },
    {
      name:  'forth',
      label: ' --> ',
      help:  'Undo the previous back.',

      isEnabled:   function() { return this.redo.length; },
      action:      function() {
      this.dumpState('preForth');
        this.remember(this.memento.value);
        this.restore(this.redo.pop());
        this.propertyChange('stack', '', this.stack);
        this.propertyChange('redo', '', this.redo);
      this.dumpState('postForth');
      }
    }
  ],

  listeners: [
    {
      name: 'onMementoChange',
      code: function(_, _, oldValue, newValue) {
        if ( this.ignore_ ) return;

        // console.log('MementoMgr.onChange', oldValue, newValue);
        this.remember(oldValue);
        this.redo = [];
        this.propertyChange('redo', '', this.redo);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.memento.addListener(this.onMementoChange);
    },

    remember: function(value) {
      this.dumpState('preRemember');
      this.stack.push(value);
      this.propertyChange('stack', '', this.stack);
      this.dumpState('postRemember');
    },

    restore: function(value) {
      this.dumpState('restore');
      this.ignore_ = true;
      this.memento.set(value);
      this.ignore_ = false;
    },

    dumpState: function(spot) {
      /*
      console.log('--- ', spot);
      console.log('stack: ', JSON.stringify(this.stack));
      console.log('redo: ', JSON.stringify(this.redo));
      */
    }
  }
});

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
FOAModel({
  name:  'DAOController',
  label: 'DAO Controller',

  extendsModel: 'View',

  properties: [
    {
      name:  'selection'
    },
    {
      name:  'model',
      postSet: function(_, model) {
        // TODO: Is this the best way to pass the model to the TableView?
        this.X.model = model;
      }
    },
    {
      model_: 'DAOProperty',
      name:  'dao',
      label: 'DAO',
      view: 'TableView',
      postSet: function(_, dao) {
        // TODO Is this going to be useful?
        this.X.DAO = dao;
      }
    },
    {
      name:  'value',
      help: 'Alias value property to set the dao.',
      postSet: function(old, value) {
        old && old.removeListener(this.onValueChange);
        value.addListener(this.onValueChange);
        this.onValueChange();
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'useSearchView',
      defaultValue: false,
      postSet: function(_, value) {
        if ( value ) {
          this.addDecorator(SearchBorder.create({
            model: this.model,
            dao: this.dao
          }));
        }
      },
    }
  ],

  actions: [
    {
      name:  'new',
      help:  'Create a new record.',
      action: function() {
        var createView = DAOCreateController.create({
          model: this.model,
          dao:   this.dao
        }).addDecorator(ActionBorder.create({
          actions: DAOCreateController.actions,
        }));

        createView.parentController = this;

        this.X.stack.pushView(createView, 'New');
      }
    },
    {
      name:  'edit',
      help:  'Edit the current record.',
      default: 'true',

      action: function() {
        // Todo: fix, should already be connected
        this.selection = this.daoView.selection.get();

        var obj = this.selection;
        var actions = DAOUpdateController.actions.slice(0);

        for ( var i = 0 ; i < this.model.actions.length ; i++ ) {
          var action = this.model.actions[i];

          var newAction = Action.create(action);
          newAction.action = function (oldAction) {
            return function()
            {
              oldAction.call(obj);
            };
          }(action.action);

          actions.push(newAction);
        }

        console.log(["selection: ", this.selection]);
        var updateView = DAOUpdateController.create({
          obj:   this.selection/*.deepClone()*/,
          model: this.model,
          dao:   this.dao
        }).addDecorator(ActionBorder.create({
          actions: DAOUpdateController.actions,
        }));

        this.X.stack.pushView(updateView, 'Edit');
      }
    },
    {
      name:  'delete',
      help:  'Delete the current record.',

//      isEnabled: function()   { return this.selection; },
      action: function()      {
        // Todo: fix, should already be connected
        this.selection = this.daoView.selection.get();
        var self = this;
        this.dao.remove(this.selection, {
          // Hack: shouldn't be needed
          remove: function() {
            self.refresh();
          }
        });
      }
    }
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      this.daoView.unsubscribe(this.daoView.DOUBLE_CLICK, this.onDoubleClick);
      this.daoView.subscribe(this.daoView.DOUBLE_CLICK, this.onDoubleClick);
      this.daoView.selection.addListener(this.onSelection);
    },

    refresh: function() {
      this.dao = this.dao;
    }
  },

  templates: [
    {
      name: 'toHTML',
      template: '$$dao'
    }
  ],

  listeners:
  [
    {
      name: 'onDoubleClick',
      code: function(evt) {
        for ( var i = 0 ; i < this.model_.actions.length ; i++ ) {
          var action = this.model_.actions[i];

          if ( action.default ) {
            action.action.call(this);
            break;
          }
        }
      }
    },
    {
      name: 'onSelection',
      code: function(evt) {
        var obj = this.daoView.selection.get();
        if ( ! obj ) return;

        this.X.stack.setPreview(
          DetailView.create({
            model: this.model,
            value: this.daoView.selection
          }));
      }
    },
    {
      name: 'onValueChange',
      code: function() {
        this.dao = this.value.value;
      }
    },
  ]
});


FOAModel({
  name:  'DAOCreateController',
  label: 'DAO Create',

  extendsModel: 'View',

  properties: [
    {
      name:  'obj',
      label: 'New Object',
    },
    {
      name:  'model'
    },
    {
      name:  'dao',
      label: 'DAO',
    }
  ],

  actions: [
    {
      name:  'save',
      label: 'Create',
      help:  'Create a new record.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        var self = this;
        this.dao.put(this.obj, {
          put: function(value) {
            console.log("Created: ", value);
            self.X.stack.back();
          },
          error: function() {
            console.error("Error creating value: ", arguments);
          }
        });
      }
    },
    {
      name:  'cancel',
      help:  'Cancel creation.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        this.X.stack.back();
      }
    },
    {
      name:  'help',
      help:  'View help.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        var model = this.obj.model_;
        var helpView = HelpView.create(model);
        this.X.stack.pushView(helpView);
      }
    }
  ],

  methods: {
    newObj: function(obj, dao) {
      // TODO is this ever called?
      debugger;
      var model = {
        __proto__: obj.model_,
        create: function() { return obj; }
      };
      var createView = DAOCreateController.create({
        model: model,
        dao:   dao
      }).addDecorator(ActionBorder.create({ actions: DAOCreateController.actions }));

      createView.parentController = this;
      this.X.stack.pushView(createView);
    },

    init: function() {
      var tmp = this.model;
      this.SUPER();
      this.model = tmp;

      this.obj = this.model.create();

      this.view = DetailView.create({model: this.model, value: this.propertyValue('obj')});
    },

    toHTML: function() {
      return this.view.toHTML();
    },

    initHTML: function() {
      this.SUPER();
      this.view.initHTML();
    }
  }
});


FOAModel({
  name:  'DAOUpdateController',
  label: 'DAO Update',

  extendsModel: 'View',

  properties: [
    {
      name:  'obj',
      label: 'Edited Object'
    },
    {
      name:  'model',
    },
    {
      name:  'dao',
      label: 'DAO',
    }
  ],

  actions: [
    {
      name:  'save',
      help:  'Save updates.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        var self = this;
        var obj = this.obj;
        this.dao.put(obj, {
          put: function() {
            console.log("Saving: ", obj.toJSON());

            self.X.stack.back();
          },
          error: function() {
            console.error("Error saving", arguments);
          }
        });
      }
    },
    {
      name:  'copy',
      help:  'Create a new object which is a copy of this one.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
      }
    },
    {
      name:  'cancel',
      help:  'Cancel update.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        this.X.stack.back();
      }
    },
    {
      name:  'help',
      help:  'View help.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return true; },
      action:      function() {
        var model = this.obj.model_;
        var helpView = HelpView.create(model);
        this.X.stack.pushView(helpView);
      }
    }
  ],

  methods: {

    /*
      TODO: I don't think this is need. Remove when verified.
    toHTML: function() {
      return '<div id="' + this.id + '">controller</div>';
    },
    */

    init: function() {
      var tmp = this.model;
      this.SUPER();
      this.model = tmp;

      this.view = FOAM({
        model_: 'AlternateView',

        selection: 'GUI',
        views: [
          {
            model_: 'ViewChoice',
            label:  'GUI',
            view:   'DetailView'
          },
          {
            model_: 'ViewChoice',
            label:  'JS',
            view:   'JSView'
          },
          {
            model_: 'ViewChoice',
            label:  'XML',
            view:   'XMLView'
          }/*,
             {
             model_: 'ViewChoice',
             label:  'UML',
             view:   'XMLView'
             },
             {
             model_: 'ViewChoice',
             label:  'Split',
             view:   'SplitView'
             }*/
        ]
      });

      this.view.value.set(this.obj);
    },

    toHTML: function() {
      return this.view.toHTML();
    },

    initHTML: function() {
      this.SUPER();
      this.view.initHTML();
    }
  }
});

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

function pos(e, top, left, width, height) {
   var s = e.style;
   left = left || 0;

   top != null && (e.style.top = toNum(top) + 'px');
   left != null && (e.style.left = toNum(left) + 'px');
   width != null && (e.style.width = toNum(width) + 'px');
   height != null && (e.style.height = toNum(height) + 'px');
}

FOAModel({
  name: 'ThreePaneController',
  label: 'ThreePaneController',

  extendsModel: 'View',

  properties: [
    {
      name: 'model',
      type: 'Model',
      required: true
    },
    {
      name: 'daoListener',
      hidden: true,
      factory: function() {
        return {
          put: this.onDaoUpdate,
          remove: this.onDaoUpdate
        };
      },
      postSet: function(oldValue, newValue) {
        if (this.dao) {
          this.dao.unlisten(oldValue);
          this.dao.listen(newValue);
        }
      }
    },
    {
      name: 'dao',
      type: 'DAO',
      required: true,
      postSet: function(oldValue, newValue) {
        if (oldValue) oldValue.unlisten(this.daoListener);
        newValue.listen(this.daoListener);
      }
    },
    {
      name: 'queryParser',
      factory: function() {
        return QueryParserFactory(this.model);
      }
    },
    {
      name: 'searchField',
      type: 'TextFieldView',
      factory: function() {
        return TextFieldView.create({
          name: 'search',
          type: 'search',
          onKeyMode: true,
          displayWidth: 95
        });
      },
      postSet: function(oldValue, newValue) {
        if (oldValue) oldValue.value.addListener(this.performQuery);
        newValue.value.addListener(this.performQuery);
      }
    },
    {
      name: 'countField',
      type: 'TextFieldView',
      factory: function() {
        return TextFieldView.create({
          name: 'count',
          mode: 'read-only',
          displayWidth: 40
        });
      }
    },
    {
      name: 'searchChoice',
      type: 'ListChoiceView',
      required: true,
      postSet: function(oldValue, newValue) {
        if (oldValue) oldValue.value.removeListener(this.performQuery);
        newValue.value.addListener(this.performQuery);
      }
    },
    {
      model_: 'IntProperty',
      name: 'width',
      defaultValue: 500
    },
    {
      model_: 'IntProperty',
      name: 'height',
      defaultValue: 500
    },
    {
      model_: 'IntProperty',
      name: 'headerHeight',
      defaultValue: 119
    },
    {
      model_: 'IntProperty',
      name: 'footerHeight',
      defaultValue: 30
    },
    {
      model_: 'IntProperty',
      name: 'maxSearchWidth',
      defaultValue: 160
    },
    {
      model_: 'IntProperty',
      name: 'searchWidth',
      defaultValue: 160
    },
    {
      model_: 'IntProperty',
      name: 'minThreeColumnWidth',
      defaultValue: 1250
    },
    {
      name: 'threeColumnLeftPaneWeight',
      defaultValue: 0.45
    },
    {
      name: 'table',
      type: 'View',
      factory: function() {
        return TableView.create({
            model: this.model,
            dao: this.dao,
            scrollEnabled: true,
            rows: 20
          });
      },
      postSet: function(oldValue, newValue) {
        if (oldValue) oldValue.scrollbar.removeListener(this.updateCount);
        newValue.scrollbar.addListener(this.updateCount);
        this.addChild(newValue);
        this.removeChild(oldValue);
      }
    },
    {
      name: 'toolbar',
      type: 'View',
      factory: function() {
        return ToolbarView.create({
          actions: this.model.actions,
          value: this.table.selection
        });
      },
      postSet: function(oldValue, newValue) {
        this.addChild(newValue);
        this.removeChild(oldValue);
      }
    },
    {
      name: 'editView',
      type: 'View',
      factory: function() {
        return DetailView.create({model: this.model}/*, this.table.selection*/);
      },
      postSet: function(oldValue, newValue) {
        this.addChild(newValue);
        this.removeChild(oldValue);
        oldValue && oldValue.value && oldValue.value.removeListener(this.onValueChange);
        newValue.value.addListener(this.onValueChange);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      Events.dynamic(function() {
        self.headerHeight;
        self.footerHeight;
        self.searchWidth;
        self.minThreeColumnWidth;
        self.threeColumnLeftPaneWeight;
      }, self.layout);
    },
    setLogo: function(src) {
      $('logo-' + this.id).src = src;
    },
    toHTML: function() {
      return '<div style="width: 100%; height: 100%;" id="' + this.id + '">\n' +
        '<table class="header" id="header-' + this.id + '">\n' +
        '  <tr>\n' +
        '  <td style="height: 49px; padding: 5px 0px">\n' +
        '    <img id="logo-' + this.id + '" height="49" style="margin-left: 10px" src="images/logo.png">\n' +
        '  </td>\n' +
        '  <td width="5%"></td>\n' +
        '  <td width="45"><img src="images/search-icon.png" style="vertical-align:middle;"></td>\n' +
        '  <td width=65% valign2="bottom">\n' +
        '  <div class="titleBar">\n' +
        this.searchField.toHTML() +
        '  </div>\n' +
        '  </td>\n' +
        '  <td width="5%"></td>\n' +
        '  <td width="20%" align=center valign2="bottom">\n' +
        this.countField.toHTML() +
        '  </td>\n' +
        '  <td width="10%"></td>\n' +
        '  <td align="right">\n' +
        '    <div><img id="settings-' + this.id + '" src="images/settings.svg"> &nbsp;</div>\n' +
        '  </td>\n' +
        '  </tr>\n' +
        '</table>\n' +
        '<span class="toolbar" id="toolbar-' + this.id + '">' + this.toolbar.toHTML() + '</span>\n' +
        '<div id="search-' + this.id + '" style="position:absolute;background-color:#fff;overflow-y:auto;overflow-x:hidden">\n' +
        '  <span class="searchChoice">' + this.searchChoice.toHTML() + '</span>\n' +
        '</div>\n' +
        '<div class="browse" id="browse-' + this.id + '" style="position:absolute;background-color:#FFF;float:left;">' + this.table.toHTML() + '</div>\n' +
        '<div class="edit" id="edit-' + this.id + '" style="position:absolute;position:absolute;background-color:#FFF;overflow:scroll;">\n' +
        this.editView.toHTML() +
        '</div>\n' +
        '<div id="footer-' + this.id + '" style="position:absolute;text-align:right;padding-top:3px;width:100%"> \n' +
        '  <a href="https://code.google.com/p/foam-framework/" style="text-decoration: none" target="_blank">\n' +
        '  <font size=-1 face="catull" style="padding-left:10px;text-shadow:rgba(64,64,64,0.3) 3px 3px 4px;">\n' +
        '  <font color="#3333FF">F</font><font color="#FF0000">O</font><font color="#ddaa00">A</font><font color="#33CC00">M</font>\n\n' +
        '  <font color2="#555555"> POWERED</font></a>\n' +
        '</div>\n' +
        '</div>';
    },
    initHTML: function() {
       var self = this;
       var lastSelection = undefined;

       this.searchField.initHTML();
       this.searchChoice.initHTML();
       this.table.initHTML();
       this.editView.initHTML();
       this.countField.initHTML();
       this.toolbar.initHTML();

       this.searchField.$.style.display = 'table-cell';
       this.searchField.$.style.width = '100%';

       this.table.selection.addListener(EventService.merged(function (value) {
         var newValue = value.get();
         var oldValue = self.editView.value.get();

         // No need to reload from database if we're updating to same row
        // if ( ! newValue || oldValue && newValue === oldValue ) return;
         if ( newValue === lastSelection ) return;

         self.editView.value.set(newValue);
       }, 200));

       if ( this.model.OPEN && Action.isInstance( this.model.OPEN ) ) {
         this.table.hardSelection.addListener(function(value) {
           value.get().open();
         });
       }
    }
  },

  listeners: [
    {
      name: 'onValueChange',
      code: function() {
        this.editView.initHTML();
      }
    },
    {
      name: 'performQuery',
      code: function() {
        var predicate = AND(
          this.queryParser.parseString(this.searchChoice.value.get()) || TRUE,
          this.queryParser.parseString(this.searchField.value.get()) || TRUE)
          .partialEval();

        console.log('query: ', predicate.toMQL());

        this.table.scrollbar.value = 0;

        this.table.model = this.model;
        this.table.dao = this.dao.where(predicate);
      }
    },
    {
      name: 'layout',
      isMerged: true,
      code: function() {
        if ( !this.$ ) return;

        var hideTable = this.table.scrollbar.size == 1;
        var W         = this.$.offsetWidth; //window.innerWidth;
        var H         = this.$.offsetHeight; //window.innerHeight;
        var SEARCH_H  = H - this.headerHeight - this.footerHeight;
        var RIGHT_W   = W - this.searchWidth-1;

        //  pos(header,null,null,W,HEADER_H-10);
        pos($('search-' + this.id), this.headerHeight, null, this.maxSearchWidth, SEARCH_H);

        if ( W > this.minThreeColumnWidth ) {
          pos($('browse-' + this.id),
              this.headerHeight,
              this.searchWidth + 1,
              RIGHT_W * this.threeColumnLeftPaneWeight,
              SEARCH_H);

          pos($('edit-' + this.id),
              this.headerHeight,
              this.searchWidth + 1 + RIGHT_W * this.threeColumnLeftPaneWeight,
              RIGHT_W * 0.55-10,
              SEARCH_H-10);
        } else {
          pos($('browse-' + this.id),
              this.headerHeight,
              this.searchWidth + 1,
              RIGHT_W,
              SEARCH_H/2-4);

          pos($('edit-' + this.id),
              hideTable ? this.headerHeight : toNum($('browse-' + this.id).style.top) + toNum($('browse-' + this.id).style.height),
              this.searchWidth + 1,
              RIGHT_W,
              hideTable ? SEARCH_H : SEARCH_H / 2);
        }
        pos($('footer-' + this.id),
            H-this.footerHeight+10,
            null,
            W,
            this.footerHeight);
      }
    },
    {
      name: 'onDaoUpdate',
      isMerged: 100,
      code: function() {
         var self = this;
         if ( this.table.selection.get() )
            this.dao.find(this.table.selection.get().id, {
               put: function(obj) {
                  self.table.selection.set(obj);
                  self.table.dao = self.table.dao;
               }
             });
         else
            this.table.dao = this.table.dao;
      }
    },
    {
      name: 'updateCount',
      isMerged: true,
      code: function() {
        var self = this;
        this.dao.select(COUNT())(function(c) {
          self.countField.value.set(
            self.table.scrollbar.size + ' of ' + c.count + ' selected');
        });
      }
    }
  ]
});

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
// Translated from EBNF at https://groups.google.com/forum/?fromgroups=#!topic/protobuf/HMz8YkzWEto

var ProtoBufGrammar = {
  __proto__: grammar,

  START: sym('proto'),

  d: range('0', '9'),

  w: alt(sym('d'), range('a', 'z'), range('A', 'Z'), "_"),

  a: alt(range('a', 'z'), range('A', 'Z')),

  proto: repeat(alt(
    sym('message'),
    sym('extend'),
    sym('enum'),
    sym('import'),
    sym('package'),
    sym('option'),
    sym('syntax'), ';')),

  syntax: seq("syntax", "=", sym('strLit'), ";"),

  import: seq("import", sym('strLit'), ";"),

  package: seq("package", sym('ident'), ";"),

  option: seq("option", sym('optionBody'), ";"),

  optionBody: seq(sym('ident'), repeat(seq(".", sym('ident'))), "=", sym('constant')),

  message: seq("message", sym('ident'), sym('messageBody')),

  extend: seq("extend", sym('userType'), sym('messageBody')),

  enum: seq("enum", sym('ident'), "{", repeat(alt(sym('option'), sym('enumField'), ";")), "}"),

  enumField: seq(sym('ident'), "=", sym('sintLit'), ";"),

  service: seq("service", sym('ident'), "{", repeat(seq(sym('option'), sym('rpc')), ";"), "}"),

  rpc: seq("rpc", sym('ident'), "(", sym('userType'), ")", "returns", "(", sym('userType'), ")", ";"),

  messageBody: seq(
    "{",
      repeat(
        alt(sym('field'), sym('enum'), sym('message'), sym('extend'), sym('extensions'), sym('group'), sym('option'), ';')
      ),
    "}"),

  group: seq(sym('modifier'), "group", sym('camelIdent'), "=", sym('intLit'), sym('messageBody')),

  // tag number must be 2^28-1 or lower
  field: seq(
    sym('modifier'),
    sym('type'),
    sym('ident'),
    "=",
    sym('intLit'),
    optional(seq("[", sym('fieldOption'), repeat(",", sym('fieldOption') ), "]")),
    ";"),

  fieldOption: alt(sym('optionBody'), seq("default", "=", sym('constant'))),

  extensions: seq("extensions", sym('intLit'), "to", alt(sym('intLit'), "max"), ";"),

  modifier: alt("required", "optional", "repeated"),

  type: alt(
      "double", "float", "int32", "int64", "uint32", "uint64",
      "sint32", "sint64", "fixed32", "fixed64", "sfixed32",
      "sfixed64", "bool", "string", "bytes", sym('userType')),

  // leading dot for identifiers means they're fully qualified
  userType: noskip(plus(seq(optional("."), sym('ident')))),

  constant: alt(sym('ident'), sym('sintLit'), sym('floatLit'), sym('strLit'), sym('boolLit')),

  ident: seq(sym('a'), repeat(sym('w'))),

  // according to parser.cc, group names must start with a capital letter as a
  // hack for backwards-compatibility
  camelIdent: seq(range('A', 'Z'), repeat(sym('w'))),

  intLit: alt(sym('decInt'), sym('hexInt'), sym('octInt')),

  sintLit: alt(
      seq(optional(alt('+', '-')), sym('decInt')),
      sym('intLit')),

  decInt: plus(sym('d')),

  hexInt: seq('/0', alt('x', 'X'), plus(alt(range('A','F'), range('a', 'f'), range('0', '9')))),

  octInt: seq('/0', plus(range('0', '7'))),

  floatLit:
    seq(
        seq(
            sym('decInt'),
            optional('.', sym('decInt'))),
        optional(
            seq(
                alt('E', 'e'),
                optional(alt('+', '-')),
                sym('decInt')))),

  boolLit: alt("true", "false"),

  strLit: noskip(seq(sym('quote'), repeat(alt(sym('hexEscape'), sym('octEscape'), sym('charEscape'), sym('quoteEscape'), not(sym('quote'), anyChar))) ,sym('quote'))),

  quote: alt('"', "'"),

  hexEscape: seq('\\', alt('x', 'X'), repeat(alt(range('A','F'), range('a', 'f'), range('0', '9'), undefined, 1,2))),

  octEscape: seq('\\0', repeat(range('0', '7'), undefined, 1, 3)),

  charEscape: seq('\\', alt('a', 'b', 'f', 'n', 'r', 't', 'v','?')),

  quoteEscape: seq('\\"'),

}.addActions({

  quoteEscape: function(a) {
      return ['"'];
  },

  enumField: function(a) {
    return [a[0], a[2]];
  },

  enum: function(a) {
    var e = {};
    var name = a[1];
    var values = a[3];
    for ( var i = 0 ; i < values.length ; i++ ) {
      var value = values[i];
      e[value[0]] = value[1][1];
    }
    e.type = 'Enum';
    (this.ctx || GLOBAL)[name] = e;
  },

  userType: function(a) {
    return a[0].join('');
  },

  field: function(a) {
    if (a[0] === 'repeated') {
        return ArrayProperty.create({
            subType: a[1],
            name: a[2],
            prototag: a[4]
        });
    } else {
        var prop = Property.create({
            type: a[1],
            name: a[2],
            prototag: a[4],
            required: a[0] === 'required'
        });
        // TODO: Hack for enums unti they're modelled.
        var subtype = (this.ctx || GLOBAL)[prop.type];
        if ( subtype && subtype.type === 'Enum' ) {
            prop.outProtobuf = function(obj, out) {
                if ( this.f(obj) === "" ) return;
                outProtobufPrimitive('int32', this.prototag, this.f(obj), out);
            };
        }
        return prop;
    }
  },

  message: function(a) {
    var properties = [];
    for (var i = 0; i < a[2].length; i++) {
      if (a[2][i] && Property.isInstance(a[2][i])) {
        properties.push(a[2][i]);
      }
    }
    var model = Model.create({
      name: a[1],
      properties: properties
    });
    (this.ctx || GLOBAL)[a[1]] = model;
    return model;
  },

  messageBody: function(a) { return a[1]; },

  ident: function(a) { return a[0] + a[1].join(''); },

  decInt: function(a) { return parseInt(a.join('')); }
});



/*
console.log('parsing');
console.log('Parseing ProtoBuf:', ProtoBufGrammar.parseString(sample)[0].toJSON());

console.log('Parseing Enum:', ProtoBufGrammar.parseString(sample2)[0]);
console.log('PhoneType: ', PhoneType);
*/

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

// Experimental protocol buffer support, including binary parsing.

Number.prototype.toVarintString = function() {
  var result = "";
  var int = this;
  while (int > 0x7f) {
    var str = ((int & 0x7f) | 0x80).toString(16);
    if (str.length == 1) str = "0" + str;
    result += str;
    int = int >> 7;
  }
  str = int.toString(16);
  if (str.length == 1) str = "0" + str;
  result += str;
  return result;
};

// Compares two hexidecimal numbers represented as
// strings.  Compares them based upon their numerical
// value.
var hexStringCompare = (function() {
  var TABLE = "0123456789abcdef";

  return function(a, b) {
    if ( a.length !==  b.length ) return a.length < b.length ? -1 : 1;

    for ( var i = 0; i < a.length; i++ ) {
      var ia = TABLE.indexOf(a[i]);
      var ib = TABLE.indexOf(b[i]);

      if ( ia !== ib ) {
        return ia < ib ? -1 : 1;
      }
    }
    return 0;
  };
})();

function outProtobufPrimitive(type, tag, value, out) {
  switch(type) {
  case 'String':
  case 'string':
  case 'bytes':
    out.varint((tag << 3) | 2);
    bytes = stringtoutf8(value);
    out.varint(bytes.length);
    out.bytes(bytes);
    break;
  case 'Int':
  case 'uint64':
  case 'int64':
  case 'uint32':
  case 'int32':
    out.varint(tag << 3);
    if (value instanceof String || typeof value == 'string') out.varintstring(value);
    else out.varint(value);
    break;
  case 'bool':
  case 'boolean':
  case 'Boolean':
    out.varint(tag << 3);
    out.varint(Number(value));
    break;
  default: // Sub messages must be modelled.
    if (value && value.model_) {
      out.varint((tag << 3) | 2);
      out.message(value);
    }
  }
}

Property.getPrototype().outProtobuf = function(obj, out) {
  if (this.f(obj) === "") return;
  outProtobufPrimitive(this.type, this.prototag, this.f(obj), out);
};

ArrayProperty.getPrototype().outProtobuf = function(obj, out) {
  var values = this.f(obj);
  for (var i = 0, value; value = values[i]; i++) {
    outProtobufPrimitive(this.subType, this.prototag, value, out);
  }
};

IntProperty.getPrototype().outProtobuf = function(obj, out) {
  out(this.prototag << 3);
  var value = this.f(obj);
  // Hack for handling large numbers that we can't handle in JS.
  if (value instanceof String || typeof value == 'string')
    out.bytestring(value);
  else
    out.varint(value);
};

var BinaryPS = {
  create: function(view) {
     var NO_VALUE = {};
     var eof_;

     if (view instanceof ArrayBuffer) view = new Uint8Array(view);

     var p = {
        create: function(pos, tail, value) {
           var ps = {
              __proto__: p,
              pos: pos,
              tail_: tail
           };

           ps.value = value === NO_VALUE ? ps.head : value;

           return ps;
        },
        clone: function() {
           return this.create(this.pos, this.tail_, this.value);
        },
        // Imperative Tail - destroys the current PS
        get itail() {
           if ( this.tail_ ) return this.tail_;

           this.pos++;
           this.value = this.head;

           return this;
        },
        destroy: function() { view = undefined; },
        limit: function(eof) { var ret = eof_; eof_ = eof; return ret; },
        get head() {
           if ( eof_ && this.pos >= eof_ ) return null;
           return this.pos >= view.length ? null : view[this.pos];
        },
        get tail() {
           return this.tail_ || ( this.tail_ = this.create(this.pos+1, undefined, NO_VALUE) );
        },
        setValue: function (value) {
           return this.create(this.pos, this.tail, value);
        }
     };

     return p.create(0, undefined, NO_VALUE);
  }
};

// parse a protocol buffer varint
// Verifies that it matches the given value if opt_value is specified.
function varint(opt_value) {
  var f = function(ps) {
    var parts = [];
    var rest = 0;
    while(ps) {
      var b = ps.head;
      if (b == null) return undefined;
      parts.push(b & 0x7f);
      ps = ps.tail;
      if (!(b & 0x80)) break; // Break when MSB is not 1, indicating end of a varint.
    }
    var res = 0;
    for (var i = 0; i < parts.length; i++) {
//      res |= parts[i] << (7 * i);  Workaround for no ints.
      res += parts[i] * Math.pow(2, 7 * i);
    }
    if ((opt_value != undefined) && res != opt_value) return undefined;
    return ps.setValue(res);
  };

  f.toString = function() { return 'varint(' + opt_value + ')'; };

  return f;
}

// Parses a varint and returns a hex string.  Used for field too big
// for js to handle as Numbers.
function varintstring(opt_value) {
  var f = function(ps) {
    var parts = [];
    var rest = 0;
    while(ps) {
      var b = ps.head;
      if (b == null) return undefined;
      parts.push(b & 0x7f);
      ps = ps.tail;
      if (!(b & 0x80)) break; // Break when MSB is not 1, indicating end of a varint.
    }
    var res = 0;
    var out = [];
    var shifts = 0;
    for (var i = 0; i < parts.length; i++) {
//      res |= parts[i] << (7 * i);  Workaround for no ints.
      res += parts[i] * Math.pow(2, 7 * i - 8 * shifts);
      while ( res > 0xff ) {
        out.unshift((res & 0xff).toString(16));
        if ( out[0].length == 0 ) {
          out[0] = '00';
        } else if ( out[0].length == 1 ) {
          out[0] = '0' + out[0];
        }
        shifts++;
        res >>= 8;
      }
    }
    if ( res > 0 || out.length == 0) {
     out.unshift(res.toString(16));
      if ( out[0].length == 0 ) {
        out[0] = '00';
      } else if ( out[0].length == 1 ) {
        out[0] = '0' + out[0];
      }
    }
    out = out.join('');

    if ((opt_value != undefined) && out != opt_value) return undefined;
    return ps.setValue(out);
  };

  f.toString = function() { return 'varintstring(' + opt_value + ')'; };

   return f;
}

// Parses a varintkey which is (varint << 3) | type
// Verifies that the value and type match if specified.
function varintkey(opt_value, opt_type) {
  var p = varint();
  var f = function(ps) {
    if (!(ps = this.parse(p, ps))) return undefined;
    var type = ps.value & 7;
    var value = ps.value >> 3;
    if ((opt_value != undefined && opt_value != value) ||
        (opt_type != undefined && opt_type != type)) return undefined;
    return ps.setValue([value, type]);
  };

  f.toString = function() { return 'varintkey(' + opt_value + ', ' + opt_type + ')'; };


   return f;
}

function toboolean(p) {
   return function(ps) {
      if ( ! (ps = this.parse(p, ps)) ) return undefined;
      return ps.setValue( !! ps.value);
   };
}

function index(i, p) {
   return function(ps) {
      if (!(ps = this.parse(p, ps))) return undefined;
      return ps.setValue(ps.value[i]);
   };
}

function protouint32(tag) {
  return seq(varintkey(tag, 0), varint());
}

function protovarintstring(tag) {
  return seq(varintkey(tag, 0), varintstring());
}

function protoint32(tag) {
  return protouint32(tag);
}

function protobool(tag) {
  return seq(varintkey(tag, 0), toboolean(varint()));
}

function protobytes(tag) {
  var header = seq(varintkey(tag, 2), varint());
  var f = function(ps) {
    if ( ! (ps = this.parse(header, ps))) return undefined;
    var oldvalue = ps.value;
    var length = oldvalue[1];
    if ( ! (ps = this.parse(repeat(anyChar, undefined, length, length), ps))) return undefined;
    return ps.setValue([oldvalue[0], ps.value]);
  };

  f.toString = function() { return 'protobytes(' + tag + ')'; };

   return f;
}

function protobytes0(tag) {
  var header = seq(varintkey(tag, 2), varint());
  var f = function(ps) {
    if ( ! (ps = this.parse(header, ps))) return undefined;
    var oldvalue = ps.value;
    var length = oldvalue[1];
    while(length--) ps = ps.itail;
    return ps.setValue([oldvalue, undefined]);
  };

  f.toString = function() { return 'protobytes0(' + tag + ')'; };

   return f;
}

function protostring(tag) {
  var header = seq(varintkey(tag, 2), varint());
  var decoder = IncrementalUtf8.create();
  var f = function(ps) {
    if ( ! (ps = this.parse(header, ps))) return undefined;
    var oldvalue = ps.value;
    var length = oldvalue[1];
    for (var i = 0; i < length; i++) {
      var head = ps.head;
      if (!head) { decoder.reset(); return undefined; }
      decoder.put(ps.head);
      ps = ps.itail;
    }
    var ret = ps.setValue([oldvalue[0], decoder.string]);
    decoder.reset();
    return ret;
  };

  f.toString = function() { return 'protostring(' + tag + ')'; };

   return f;
}

function protomessage(tag, opt_p) {
  var header = seq(varintkey(tag, 2), varint());
  var f = function(ps) {
     if (!(ps = this.parse(header, ps))) return undefined;
     var key = ps.value[0];
     var length = ps.value[1];
     opt_p = opt_p || repeat(anyChar);
     var eof = ps.limit(ps.pos + length+1);
     var ps2 = this.parse(opt_p, ps);
     if ( ! ps2 ) { ps.limit(eof); return undefined; }
     ps2.limit(eof);
     return ps2.setValue([key, ps2.value]);
  };

  f.toString = function() { return 'protomessage(' + tag + ')'; };

   return f;
}

/*
function varstring() {
  var size = varint();
  return function(ps) {
    if (! (ps = this.parse(size, ps)) ) return undefined;
    var length = ps.value;
    if (! (ps = this.parse(repeat(anyChar, undefined, length, length)))) return undefined;
    INCOMPLETE;
    should be able to use unescape(encodeURIComponent(str)) if we can set each character of str to the \u#### code point.
  }
}*/

var BinaryProtoGrammar = {
  __proto__: grammar,

  parseArrayBuffer: function(ab) {
    var ps = BinaryPS.create(ab);
    var res = this.parse(this.START, ps);
    var val = res && res.value;
    // This next line shouldn't change anything, but it does. Maybe a GC bug in Chrome 28.
    ps.destroy();
    return val;
  },

  'unknown field': alt(
      protouint32(),
      protobytes0())
};

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

/**
 * Only completely modelled models here.
 * All models in this file can be stored and loaded in a DAO.
 **/
FOAModel({
  name: 'Timer',

  properties: [
    {
      model_: 'IntProperty',
      name:  'interval',
      help:  'Interval of time between updating time.',
      units: 'ms',
      defaultValue: 10
    },
    {
      model_: 'IntProperty',
      name:  'i',
      defaultValue: 0
    },
    {
      model_: 'FloatProperty',
      name:  'timeWarp',
      defaultValue: 1.0
    },
    {
      model_: 'IntProperty',
      name:  'duration',
      units: 'ms',
      defaultValue: -1
    },
    {
      model_: 'FloatProperty',
      name: 'percent',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'startTime',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'time',
      help:  'The current time in milliseconds since epoch.',
      preSet: function(_, t) { return Math.ceil(t); },
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'second',
      help:  'The second of the current minute.',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'minute',
      help:  'The minute of the current hour.',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'hour',
      help:  'The hour of the current day.',
      defaultValue: 0
    },
    {
      name: 'isStarted',
      defaultValue: false,
      hidden: true
    }
  ],

  actions: [
    {
      name:  'start',
      help:  'Start the timer.',

      isAvailable: function() { return true; },
      isEnabled:   function() { return ! this.isStarted; },
      action:      function() { this.isStarted = true; this.tick(); }
    },
    {
      name:  'step',
      help:  'Step the timer.',

      isAvailable: function() { return true; },
      action: function()      {
        this.i++;
        this.time  += this.interval * this.timeWarp;
        this.second = this.time /    1000 % 60 << 0;
        this.minute = this.time /   60000 % 60 << 0;
        this.hour   = this.time / 3600000 % 24 << 0;
      }
    },
    {
      name:  'stop',
      help:  'Stop the timer.',

      isAvailable: function() { return true; },
      isEnabled: function() { return this.isStarted; },
      action: function() {
        this.isStarted = false;
        if ( this.timeout ) {
          clearTimeout(this.timeout);
          this.timeout = undefined;
        }
      }
    }
  ],

  listeners: [
    {
      name: 'tick',
      isAnimated: true,
      code: function(e) {
        this.timeout = undefined;
        if ( ! this.isStarted ) return;

        var prevTime = this.startTime_ || 0;
        this.startTime_ = Date.now();
        this.interval = Math.min(100, this.startTime_ - prevTime);
        this.step();
        this.tick();
      }
    }
  ]
});


/**
 * Used when creating PersistentContext's.
 * Ex.
 * var persistentContext = PersistentContext.create({
 *  dao: IDBDAO.create({model: Binding}),
 *   predicate: NOT_TRANSIENT,
 *   context: GLOBAL
 *  });
 * ...
 * persistentContext.bindObject('userInfo', UserInfo, {});
 *
 * TODO: Make simpler to setup.
 **/
FOAModel({
  name: 'Binding',

  properties: [
    // TODO: add support for named sub-contexts
    {
      name:  'id',
      hidden: true
    },
    {
      name:  'value',
      hidden: true
    }
  ]
});


FOAModel({
  name: 'PersistentContext',

  properties: [
    {
      name:  'dao',
      label: 'DAO',
      type: 'DAO',
      hidden: true
    },
    {
      name:  'context',
      hidden: true
    },
    {
      name: 'predicate',
      type: 'Expr',
      defaultValueFn: function() { return TRUE; },
      hidden: true
    }
  ],

  methods: {
    /**
     * Manage persistene for an object.
     * Resave it in the DAO whenever it first propertyChange events.
     **/
    manage: function(name, obj) {
      obj.addListener(EventService.merged((function() {
        console.log('PersistentContext', 'updating', name);
        this.dao.put(Binding.create({
          id:    name,
          value: JSONUtil.compact.where(this.predicate).stringify(obj)
        }));
      }).bind(this)));
    },
    bindObjects: function(a) {
      // TODO: implement
    },
    bindObject: function(name, model, createArgs) {
      console.log('PersistentContext', 'binding', name);
      var future = afuture();
      createArgs = createArgs || {};

      if ( this.context[name] ) {
        future.set(this.context[name]);
      } else {
        this.dao.find(name, {
          put: function (binding) {
            console.log('PersistentContext', 'existingInit', name);
            //                  var obj = JSONUtil.parse(binding.value);
            //                  var obj = JSON.parse(binding.value);
            var json = JSON.parse(binding.value);
            json.__proto__ = createArgs;
            var obj = JSONUtil.mapToObj(json);
            this.context[name] = obj;
            this.manage(name, obj);
            future.set(obj);
          }.bind(this),
          error: function() {
            console.log('PersistentContext', 'newInit', name);
            var obj = model.create(createArgs);
            this.context[name] = obj;
            this.manage(name, obj);
            future.set(obj);
          }.bind(this)
        });
      }

      return future.get;
    }
  }
});


FOAModel({
  name: 'UserInfo',
  label: 'UserInfo',

  properties: [
    {
      model_: 'StringProperty',
      name: 'email'
    }
  ]
});

/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

FOAModel({
  name: 'FOAMTouch',
  properties: [
    'id', 'startX', 'startY', 'x', 'y',
    {
      name: 'dx',
      getter: function() {
        return this.x - this.startX;
      }
    },
    {
      name: 'dy',
      getter: function() {
        return this.y - this.startY;
      }
    },
    {
      name: 'distance',
      getter: function() {
        var dx = this.dx;
        var dy = this.dy;
        return Math.sqrt(dx*dx + dy*dy);
      }
    }
  ],

  methods: {
    cancel: function(e) {
      // TODO:
    },
    leave: function(e) {
      // TODO:
    },
    move: function(t) {
      this.x = t.clientX;
      this.y = t.clientY;
    }
  }
});

FOAModel({
  name: 'TouchReceiver',
  properties: [
    'id',
    'element',
    {
      name: 'delegate',
      // Default delegate insta-captures every incoming single-point touch, and
      // drives the propX and propY values with it.
      defaultValueFn: function() {
        var oldX, oldY;
        var self = this;
        return {
          onTouchStart: function(touches, changed) {
            // Skip multi-touches.
            if ( Object.keys(touches).length > 1 ) return { drop: true };
            // Set oldX and oldY to the current values of their properties.
            oldX = self.propX && self.propX.get();
            oldY = self.propY && self.propY.get();

            return { claim: true, weight: 0.8 };
          },

          // Move the properties if they are defined, based on the delta.
          onTouchMove: function(touches, changed) {
            var t = touches[changed[0]];
            if ( self.propX ) self.propX.set(oldX + t.dx);
            if ( self.propY ) self.propY.set(oldY + t.dy);
            return { claim: true, weight: 0.8, preventDefault: true };
          }
        };
      }
    },
    'propX', 'propY',
    { name: 'activeTouches', factory: function() { return {}; } }
  ]
});

FOAModel({
  name: 'TouchManager',

  properties: [
    { name: 'touches', factory: function() { return {}; } },
    { name: 'receivers', factory: function() { return []; } },
    { name: 'attached', defautValue: false, model_: 'BooleanProperty' }
  ],

  methods: {
    TOUCH_START: 'touch-start',
    TOUCH_END: 'touch-end',

    attachHandlers: function() {
      this.X.window.document.addEventListener('touchstart', this.onTouchStart);
      this.attached = true;
    },

    install: function(recv) {
      if ( ! this.attached ) this.attachHandlers();

      this.receivers.push(recv);

      // Attach a touchstart handler to the capture phase, this checks
      // whether each touch is inside the given element, and records the
      // offset into that element.
      recv.element.addEventListener('touchstart', this.touchCapture.bind(recv),
          true);
    },

    // NB: 'this' is bound to the receiver, not the TouchManager!
    touchCapture: function(event) {
      for ( var i = 0; i < event.changedTouches.length; i++ ) {
        var t = event.changedTouches[i];
        // TODO: Maybe capture the offset into the element here?
        this.activeTouches[t.identifier] = true;
      }
    },

    notifyReceivers: function(type, event) {
      var changed = [];
      for ( var i = 0 ; i < event.changedTouches.length ; i++ ) {
        changed.push(event.changedTouches[i].identifier);
      }

      var rets = [];
      for ( i = 0 ; i < this.receivers.length; i++ ) {
        var matched = false;
        for ( var j = 0 ; j < changed.length; j++ ) {
          if ( this.receivers[i].activeTouches[changed[j]] ) {
            matched = true;
            break;
          }
        }

        // Skip if this receiver isn't watching any of the changed touches.
        if ( ! matched ) continue;

        // Since it is watching, let's notify it of the change.
        var d = this.receivers[i].delegate;
        var f = d[type].bind(d);
        if ( f ) rets.push(f(this.touches, changed));
      }

      // Now rets contains the responses from the listeners.
      // Any that set drop: true should have their active touches cleared.
      // Then any that set claim: true have their weights compared.
      // The highest is the winner and all others are dropped.
      // If none set claim, then preventDefault if any non-dropped ones set it.
      // If we did have a winner, then preventDefault based on its wishes.
      var winner = -1;
      for ( i = 0 ; i < rets.length ; i++ ) {
        var r = rets[i];
        if ( r.drop ) {
          this.receivers[i].activeTouches = {};
          continue;
        }

        if ( r.claim && ( winner < 0 || r.weight > rets[winner].weight ) ) {
          winner = i;
        }
      }

      if ( winner >= 0 ) {
        for ( i = 0 ; i < rets.length ; i++ ) {
          if ( i != winner ) this.receivers[i].activeTouches = {};
        }
        if ( rets[winner].preventDefault ) event.preventDefault();
      } else {
        for ( i = 0 ; i < rets.length ; i++ ) {
          if ( ! rets[i].drop && rets[i].preventDefault ) {
            event.preventDefault();
            break;
          }
        }
      }
    }
  },

  listeners: [
    {
      name: 'onTouchStart',
      code: function(e) {
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( this.touches[t.identifier] ) {
            console.warn('Touch start for known touch.');
            continue;
          }
          console.log(t);
          this.touches[t.identifier] = FOAMTouch.create({
            id: t.identifier,
            startX: t.clientX,
            startY: t.clientY,
            x: t.clientX,
            y: t.clientY
          });
        }

        e.target.addEventListener('touchmove', this.onTouchMove);
        e.target.addEventListener('touchend', this.onTouchEnd);
        e.target.addEventListener('touchcancel', this.onTouchCancel);
        e.target.addEventListener('touchleave', this.onTouchLeave);

        this.notifyReceivers('onTouchStart', e);
      }
    },
    {
      name: 'onTouchMove',
      code: function(e) {
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( ! this.touches[t.identifier] ) {
            console.warn('Touch move for unknown touch.');
            continue;
          }
          this.touches[t.identifier].move(t);
        }
        this.notifyReceivers('onTouchMove', e);
      }
    },
    {
      name: 'onTouchEnd',
      code: function(e) {
        for ( var i = 0; i < e.changedTouches.length; i++ ) {
          var t = e.changedTouches[i];
          if ( ! this.touches[t.identifier] ) {
            console.warn('Touch end for unknown touch.');
            continue;
          }
          this.touches[t.identifier].move(t);
        }
        this.notifyReceivers('onTouchEnd', e);
        for ( i = 0; i < e.changedTouches.length; i++ ) {
          delete this.touches[e.changedTouches[i].identifier];
        }
      }
    },
    {
      name: 'onTouchCancel',
      code: function(e) {
        this.notifyReceivers('onTouchCancel', e);
        for ( i = 0; i < e.changedTouches.length; i++ ) {
          delete this.touches[e.changedTouches[i].identifier];
        }
      }
    },
    {
      name: 'onTouchLeave',
      code: function(e) {
        this.notifyReceivers('onTouchLeave', e);
        for ( i = 0; i < e.changedTouches.length; i++ ) {
          delete this.touches[e.changedTouches[i].identifier];
        }
      }
    }
  ]
});

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
// gLang - Graphical mLang's

// See: https://developers.google.com/chart/interactive/docs/index

FOAModel({
  name: 'PieGraph',

  extendsModel: 'CView',

  properties: [
    {
      name:  'r',
      type:  'int',
      view:  'IntFieldView',
      postSet: function(_, r) {
        this.width = this.height = 2*r+2;
      },
      defaultValue: 50
    },
    {
      name:  'lineColor',
      type:  'String',
      defaultValue: 'white'
    },
    {
      name:  'lineWidth',
      type:  'int',
      defaultValue: 1
    },
    {
      name: 'colorMap',
      defaultValue: undefined
    },
    {
      name:  'data',
      type:  'Array[float]',
      factory: function() {
        return [];
      }
    },
    {
      name: 'groups',
      label: 'Group Data',
      defaultValue: { Apples: 5, Oranges: 6, Bananas: 4 }
    }
  ],

  methods: {
    toCount: function(o) {
      return CountExpr.isInstance(o) ? o.count : o;
    },
    toHSLColor: function(i, n) {
      return 'hsl(' + Math.floor(360*i/n) + ', 95%, 75%)';
    },
    toColor: function(key, i, n) {
      return this.colorMap && this.colorMap[key] || this.toHSLColor(i, n);
    },
    paint: function() {
      var c = this.canvas;

      if ( ! c ) return;

      var x = this.x;
      var y = this.y;
      var r = this.r;

      c.save();

      c.translate(x, y);

      var sum = 0;
      var n = 0;
      for ( var key in this.groups ) {
        sum += this.toCount(this.groups[key]);
        n++;
      }

      // Drop shadown
      if ( r > 10 ) {
        c.fillStyle = 'lightgray';
        c.beginPath();
        c.arc(r+2, r+2, r, 0, 2 * Math.PI);
        c.fill();
      }

      c.lineWidth = this.lineWidth;
      c.strokeStyle = this.lineColor;

      var rads = 0;
      var i = 0;
      for ( var key in this.groups ) {
        var start = rads;
        var count = this.toCount(this.groups[key]);
        rads += count / sum * 2 * Math.PI;
        c.fillStyle = this.toColor(key, i++, n);
        c.beginPath();
        if ( count < sum ) c.moveTo(r,r);
        c.arc(r, r, r, start, rads);
        if ( count < sum ) c.lineTo(r,r);
        c.fill();
        c.stroke();
      }

      /*
        var grad = c.createLinearGradient(0, 0, r*2, r*2);
        grad.addColorStop(  0, 'rgba(0,0,0,0.1)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0)');
        grad.addColorStop(  1, 'rgba(255,255,255,0.2)');
        c.fillStyle = grad;
        c.arc(r+2, r+2, r, 0, 2 * Math.PI);
        c.fill();
      */

      c.restore();
    }
  }
});


FOAModel({
  name: 'PieExpr',

  extendsModel: 'GroupByExpr',

  methods: {
    toCView: function() {
      if ( ! this.graph_ ) {
        this.graph_ = PieGraph.create({groups: this.groups, r: 50, x: 0});
        this.graph_.copyFrom(this.opt_args);
      }
      return this.graph_;
    },

    toHTML: function() {
      return this.toCView().toHTML();
    },
    initHTML: function() {
      this.graph_.initHTML();
      this.graph_.paint();
    },
    write: function(d) {
      if ( d.writeln ) { d.writeln(this.toHTML()); } else { d.log(this.toHTML()); }
      this.initHTML();
    },
    put: function(obj) {
      this.SUPER.apply(this, arguments);
      if ( this.graph_ ) {
        this.graph_.groups = this.groups;
        this.graph_.paint();
      }
    },
    remove: function() {
      this.SUPER.apply(this, arguments);
      this.graph_ && this.graph_.paint();
    },
    clone: function() {
      var p = PieExpr.create({arg1: this.arg1, arg2: this.arg2.clone()});
      p.opt_args = this.opt_args;
      return p;
    }
  }
});

var PIE = function(f, opt_args) {
  var p = PieExpr.create({arg1: f, arg2: COUNT()});

  // TODO: opt_args is a little hackish, better to either make into a real property
  // or take a PieGraph prototype as an argument/property.
  p.opt_args = opt_args;

  return p;
};

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

var OAuthXhr = {
  create: function(xhr, responsetype, agent) {
    xhr.responseType = responsetype;
    return {
      __proto__: this,
      xhr: xhr,
      agent: agent
    };
  },

  set responseType(type) {
    this.xhr.responseType = type;
  },
  get responseType() {
    return this.xhr.responseType;
  },

  asend: function(ret, method, url, payload) {
    var self = this;
    var finished = false;
    var attempts = 0;
    awhile(
      function() { return !finished; },
      aseq(
        function(ret) {
          self.xhr.open(method, url);
          self.xhr.setRequestHeader('Authorization', 'Bearer ' + self.agent.accessToken);
          // TODO: This should be added by a decorator, or via a parameter.
          self.xhr.setRequestHeader("Content-Type", "application/json");
          self.xhr.asend(ret, payload);
        },
        function(ret) {
          if (self.xhr.status == 401 || self.xhr.status == 403) {
            if (attempts >= 2) {
              finished = true;
              ret();
              return;
            }
            attempts++;
            self.agent.refresh(ret);
            return;
          }
          finished = true;
          ret(self.xhr.response, self.xhr.status);
        }))(ret);
  }
};

FOAModel({
  name: 'OAuthXhrFactory',
  label: 'OAuthXhrFactory',

  properties: [
    {
      name: 'authAgent',
      type: 'AuthAgent',
      required: true
    },
    {
      model_: 'StringProperty',
      name: 'responseType'
    }
  ],

  methods: {
    make: function() {
      return OAuthXhr.create(new XMLHttpRequest(), this.responseType, this.authAgent);
    }
  }
});

FOAModel({
  name: 'OAuth2',
  label: 'OAuth 2.0',

  properties: [
    {
      name: 'accessToken',
      help: 'Token used to authenticate requests.'
    },
    {
      name: 'clientId',
      required: true
    },
    {
      name: 'clientSecret',
      required: true
    },
    {
      model_: 'StringArrayProperty',
      name: 'scopes',
      required: true
    },
    {
      model_: 'URLProperty',
      name: 'endpoint',
      defaultValue: "https://accounts.google.com/o/oauth2/"
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      this.refresh_ = amerged(this.refreshNow_.bind(this));
    },

    refreshNow_: function(){},

    refresh: function(ret, opt_forceInteractive) {
      return this.refresh_(ret, opt_forceInteractive);
    }
  }
});

FOAModel({
  name: 'OAuth2WebClient',
  help: 'Strategy for OAuth2 when running as a web page.',

  extendsModel: 'OAuth2',

  methods: {
    refreshNow_: function(ret, opt_forceInteractive) {
      var self = this;
      var w;
      var cb = wrapJsonpCallback(function(code) {
        self.accessToken = code;
        try {
          ret(code);
        } finally {
          w && w.close();
        }
      }, true /* nonce */);

      var path = location.pathname;
      var returnPath = location.origin +
        location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/oauth.html';

      var queryparams = [
        '?response_type=token',
        'client_id=' + encodeURIComponent(this.clientId),
        'redirect_uri=' + encodeURIComponent(returnPath),
        'scope=' + encodeURIComponent(this.scopes.join(' ')),
        'state=' + cb.id,
        'approval_prompt=' + (opt_forceInteractive ? 'force' : 'auto')
      ];

      w = window.open(this.endpoint + "auth" + queryparams.join('&'));
    }
  }
});

FOAModel({
  name: 'OAuth2ChromeApp',
  help: 'Strategy for OAuth2 when running as a Chrome App',

  extendsModel: 'OAuth2',

  properties: [
    {
      name: 'refreshToken',
      help: 'Token used to generate new access tokens.'
    },
    {
      name: 'authCode',
      help: 'Authorization code used to generate a new refresh token.'
    }
  ],

  methods: {
    auth: function(ret) {
      var queryparams = [
        '?response_type=code',
        'client_id=' + encodeURIComponent(this.clientId),
        'redirect_uri=urn:ietf:wg:oauth:2.0:oob',
        'scope=' + encodeURIComponent(this.scopes.join(' '))
      ];

      var self = this;
      chrome.app.window.create(
        'empty.html', { width: 800, height: 600 },
        function(w) {
          var success = false;

          w.onClosed.addListener(function() {
            if ( ! success ) ret(false);
          });

          var window = w.contentWindow;
          var document = w.contentWindow.document;

          window.addEventListener('load', function() {
            var webview = document.createElement('webview');
            webview.style.width = '100%';
            webview.style.height = '100%';
            document.body.appendChild(webview);

            webview.addEventListener('contentload', function() {
              webview.executeScript({ code: 'window.document.title;' }, function(title) {
                if ( title[0] && title[0].startsWith('Success code=') ) {
                  self.authCode = title[0].substring(title[0].indexOf('=') + 1);
                  success = true;
                  w.close();
                  self.updateRefreshToken(ret);
                }
              });
            });

            webview.src = self.endpoint + "auth" + queryparams.join('&');
          });
        });
    },
    updateRefreshToken: function(ret) {
      var postdata = [
        'code=' + encodeURIComponent(this.authCode),
        'client_id=' + encodeURIComponent(this.clientId),
        'client_secret=' + encodeURIComponent(this.clientSecret),
        'grant_type=authorization_code',
        'redirect_uri=urn:ietf:wg:oauth:2.0:oob'
      ];

      var xhr = new XMLHttpRequest();
      xhr.open("POST", this.endpoint + "token");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.responseType = "json";
      var self = this;
      aseq(
        function(ret) {
          xhr.asend(ret, postdata.join('&'));
        },
        function(ret) {
          if ( xhr.status === 200 ) {
            self.accessToken = xhr.response.access_token;
            self.refreshToken = xhr.response.refresh_token;
          }

          ret && ret(xhr.status === 200 && self.accessToken);
        })(ret);
    },

    updateAccessToken: function(ret) {
      var postdata = [
        'refresh_token=' + encodeURIComponent(this.refreshToken),
        'client_id=' + encodeURIComponent(this.clientId),
        'client_secret=' + encodeURIComponent(this.clientSecret),
        'grant_type=refresh_token'
      ];

      var xhr = new XMLHttpRequest();
      xhr.open("POST", this.endpoint + "token")
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      var self = this;
      aseq(
        function(ret) {
          xhr.asend(ret, postdata.join('&'));
        },
        function(ret) {
          if ( xhr.status === 200 ) self.accessToken = xhr.response.access_token;

          ret && ret(xhr.status === 200 && self.accessToken)
        })(ret);
    },

    refreshNow_: function(ret, opt_forceInteractive) {
      if ( opt_forceInteractive ) {
        this.auth(ret);
        return;
      }

      aseq(
        (function(ret) {
          this.updateAccessToken(ret)
        }).bind(this),
        (function(ret, result) {
          if ( ! result ) {
            this.auth(ret);
            return;
          }

          ret && ret(result);
        }).bind(this)
      )(ret);
    }
  }
});


// TODO: Register model for model, or fix the facade.
if ( window.chrome && window.chrome.runtime && window.chrome.runtime.id ) {
  var EasyOAuth2 = OAuth2ChromeApp;
} else {
  EasyOAuth2 = OAuth2WebClient;
}

/*
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var LabelView = FOAM({

   model_: 'Model',

   name:  'LabelView',

   extendsModel: 'View',

   properties: [
      {
         // Must be a synchronous DAO
         name:  'dao',
         label: 'DAO',
         type: 'DAO',
         defaultValueFn: function() {
           return GLOBAL.EMailLabelDAO;
         },
         hidden: true
      },
      {
         name:  'value',
         type:  'Value',
         postSet: function(oldValue, newValue) {
            oldValue && oldValue.removeListener(this.updateHTML);
            newValue.addListener(this.updateHTML);
            this.updateHTML();
         },
         factory: function() { return SimpleValue.create(); }
      }
   ],

   listeners:
   [
      {
         model_: 'Method',

         name: 'updateHTML',
         code: function() {
            var e = this.$;
            if ( e ) e.innerHTML = this.labelsToHTML();
         }
      }
   ],

   methods: {
      // TODO: deprecate
      getValue: function() {
         return this.value;
      },

      // TODO: deprecate
      setValue: function(value) {
         this.value = value;
      },
/*
      initHTML: function() {
         View.getPrototype().initHTML.call(this);
         // if ( this.value ) this.value.addListener(this.updateHTML.bind(this));
      },
*/
      toHTML: function() {
         return '<div class="labelList" id="' + this.id + '"></div>';
      },

      updateHTML: function() {
      },

      labelsToHTML: function() {
         // TODO:  Make this a provided dao
         // TODO:  Extract property name to constant
         // TODO:  Update the string asynchornously so this doesn't depend on MDAO
         var customLabelColorMapStr = '';
         EMailPreferences.find(EQ(EMailPreference.NAME, 'sx_clcp'), {
           put: function(prop) {
             customLabelColorMapStr = prop.value;
           },
           err: function() { console.log('error'); }
         });

         var ps = StringPS.create(customLabelColorMapStr);

         var customLabelColorMap = CustomLabelColorMapParser.parse(
             CustomLabelColorMapParser.colormap, ps).value;

         var out = "";
         var a = this.value.get();

         for ( var i = 0 ; i < a.length ; i++ ) {
            var asHTML = this.labelToHTML(a[i], customLabelColorMap);
            if (asHTML) {
              out += "&nbsp;" + asHTML;
            }
         }

         return out;
      },

      labelToHTML: function(l, customColorMap) {
         var label;

         if ( this.dao ) {
           this.dao.find(EQ(EMailLabel.ID, l), {
             put: function(el) {
                label = el;
             },
             err: function() { console.log('error'); }
           });
         }

         if ( ! label || ! label.isRenderable() ) {
           return undefined;
         }

         var colorPair = this.lookupColorPair(label, customColorMap);
         var style = '';
         if (colorPair) {
           var background = colorPair.b;
           var foreground = colorPair.f;
           style = ' style="';
           style += 'background-color: ' + background + '; ';
           style += 'border-color: ' + foreground + '; ';
           style += 'color: ' + foreground + '"';
         }

         var displayName = label.getRenderName();
         return '<span' + style + ' class="label">' + displayName + '</span>';
      },

      lookupColorPair: function(label, customColorMap) {
        var colorIdx = label.color;
        if (label.isSystemLabel() && !colorIdx) {
          return this.getSystemLabelColor(label);
        } else if (!colorIdx) {
          return undefined;
        } else if (colorIdx >= 0) {
          return this.DEFAULT_LABEL_COLORS[colorIdx];
        } else {
          return customColorMap[colorIdx];
        }
      },

      getSystemLabelColor: function(label) {
        var labelId = label.displayName;
        switch(labelId) {
         case label.SystemLabels.STARRED:
         case label.SystemLabels.IMPORTANT:
          return { b: '#ffd76e', f: '#80572a' };
         case label.SystemLabels.DRAFT:
          return { b: '#ffffff', f: '#ff0000' };
         default:
          return { b: '#dddddd', f: '#666666' };
         }
      },

      DEFAULT_LABEL_COLORS: [
        { b: "#f1f5ec", f: "#006633"},
        { b: "#dee5f2", f: "#5a6986"},
        { b: "#e0ecff", f: "#206cff"},
        { b: "#dfe2ff", f: "#0000cc"},
        { b: "#e0d5f9", f: "#5229a3"},
        { b: "#fde9f4", f: "#854f61"},
        { b: "#ffe3e3", f: "#cc0000"},
        { b: "#fff0e1", f: "#ec7000"},
        { b: "#fadcb3", f: "#b36d00"},
        { b: "#f3e7b3", f: "#ab8b00"},
        { b: "#ffffd4", f: "#636330"},
        { b: "#f9ffef", f: "#64992c"},
        { b: "#f1f5ec", f: "#006633"},
        { b: "#5a6986", f: "#dee5f2"},
        { b: "#206cff", f: "#e0ecff"},
        { b: "#0000cc", f: "#dfe2ff"},
        { b: "#5229a3", f: "#e0d5f9"},
        { b: "#854f61", f: "#fde9f4"},
        { b: "#cc0000", f: "#ffe3e3"},
        { b: "#ec7000", f: "#fff0e1"},
        { b: "#b36d00", f: "#fadcb3"},
        { b: "#ab8b00", f: "#f3e7b3"},
        { b: "#636330", f: "#ffffd4"},
        { b: "#64992c", f: "#f9ffef"},
        { b: "#006633", f: "#f1f5ec"}
     ]
   }
});

var CustomLabelColorMapGrammar = {
  __proto__: grammar,

  START: sym('colormap'),

  dig: range('0', '9'),

  uint: plus(sym('dig')),

  num: seq(optional('-'), sym('uint')),

  hex: alt(range('0', '9'), range('a', 'f'), range('A', 'F')),

  hex3byte: repeat(sym('hex'), undefined, 6, 6),

  colormap: repeat(sym('colorentry'), ','),

  colorentry: seq(sym('colorindex'), ':', sym('color'), ':', sym('color')),

  colorindex: sym('num'),

  color: seq('#', sym('hex3byte'))
};

var CustomLabelColorMapParser = {
  __proto__: CustomLabelColorMapGrammar,
}.addActions({
  'uint': function(v) {
    return v.join('');
  },
  'num': function(v) {
    return Number(v.join(''));
  },
  'hex3byte': function(v) {
    return v.join('');
  },
  'color': function(v) {
    return v.join('');
  },
  'colorentry': function(v) {
    return [v[0], { b: v[2], f: v[4] }];
  },
  'colormap': function(v) {
    var result = [];
    var entry;
    for (var i = v.length; entry = v[--i];) {
      result[entry[0]] = entry[1];
    }
    return result;
  }
});

/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

/* TODO:
     - parse multiple addresses in 'to'
*/

function lazyEval(fn) {
   var result;
   return function() {
      if ( ! result ) {
         result = fn.call(this);
      }
      return result;
   };
};

var EMailLabel = FOAM({
    model_: 'Model',
    name: 'EMailLabel',
    label: 'EMailLabel',

    ids: [ 'id' ],

    properties: [
        {
            model_: 'StringProperty',
            name: 'id',
            label: 'Label ID'
        },
        {
            model_: 'StringProperty',
            name: 'displayName',
            label: 'Display Name'
        },
        {
            model_: 'IntProperty',
            name: 'color',
            label: 'color',
            defaultValue: 0
        }
    ],

    methods: {
        // TODO:  Not an exhaustive list
        SystemLabels: {
          ALL:       '^all',
          DRAFT:     '^r',
          IMPORTANT: '^io_im',
          INBOX:     '^i',
          MUTED:     '^g', // 'g' is second letter of 'ignored'
          OPENED:    '^o',
          REPLIED:   '^io_re', // User has replied to this message
          SENT:      '^f',
          SPAM:      '^s',
          STARRED:   '^t', // 't' originall stood for TODO
          TRASH:     '^k',
          UNREAD:    '^u'
        },

        RENDERABLE_SYSTEM_LABELS: lazyEval(function() {
          var result = {};
          var SystemLabels = this.SystemLabels;
          result[SystemLabels.INBOX]     = true;
          result[SystemLabels.STARRED]   = true;
          result[SystemLabels.IMPORTANT] = true;
          result[SystemLabels.SPAM]      = true;
          result[SystemLabels.TRASH]     = true;
          result[SystemLabels.DRAFT]     = true;
          result[SystemLabels.SENT]      = true;
          result[SystemLabels.MUTED]     = true;
          result[SystemLabels.UNREAD]    = true;
          return result;
        }),

        SYSTEM_LABEL_RENDER_NAMES: lazyEval(function() {
          var result = {};
          var SystemLabels = this.SystemLabels;
          result[SystemLabels.ALL]       = 'All Mail';
          result[SystemLabels.INBOX]     = 'Inbox';
          result[SystemLabels.STARRED]   = 'Starred';
          result[SystemLabels.IMPORTANT] = 'Important';
          result[SystemLabels.SPAM]      = 'Spam';
          result[SystemLabels.TRASH]     = 'Trash';
          result[SystemLabels.DRAFT]     = 'Draft';
          result[SystemLabels.SENT]      = 'Sent';
          result[SystemLabels.MUTED]     = 'Muted';
          result[SystemLabels.UNREAD]    = 'Unread';
          result[SystemLabels.REPLIED]   = 'Replied';
          result[SystemLabels.OPENED]    = 'Opened';
          return result;
        }),

        SEARCHABLE_SYSTEM_LABELS: lazyEval(function() {
          var result = {};
          var SystemLabels = this.SystemLabels;
          result[SystemLabels.ALL]       = true;
          result[SystemLabels.INBOX]     = true;
          result[SystemLabels.STARRED]   = true;
          result[SystemLabels.IMPORTANT] = true;
          result[SystemLabels.SPAM]      = true;
          result[SystemLabels.TRASH]     = true;
          result[SystemLabels.DRAFT]     = true;
          result[SystemLabels.SENT]      = true;
          return result;
        }),

        isSystemLabel: function() {
          return this.displayName.charAt(0) == '^';
        },

        isRenderable: function() {
          return !this.isSystemLabel() || this.RENDERABLE_SYSTEM_LABELS()[this.displayName];
        },

        getRenderName: function() {
          var displayName = this.displayName;
          return this.SYSTEM_LABEL_RENDER_NAMES()[displayName] || displayName;
        },

        isSearchable: function() {
          return !this.isSystemLabel() || this.SEARCHABLE_SYSTEM_LABELS()[this.displayName];
        },

        getSearch: function() {
          switch(this.displayName) {
           case this.SystemLabels.ALL:
            return '-label:^r,^s,^k';
           case this.SystemLabels.SENT:
            return 'f:me';
           default:
            return 'label:"' + this.displayName + '"';
          }
        }
    }
});

var EMailPreference = FOAM({
    model_: 'Model',
    name: 'EMailPreference',
    label: 'EMailPreference',

    ids: [ 'name' ],

    properties: [
        {
            model_: 'StringProperty',
            name: 'name',
            label: 'Preference Name'
        },
        {
            model_: 'StringProperty',
            name: 'value',
            label: 'Preference Value'
        }
    ]
});

var Attachment = FOAM({
   model_: 'Model',
   name: 'Attachment',
   plural: 'Attachments',
   tableProperties:
   [
      'type',
      'filename',
      'position',
      'size'
   ],
   properties:
   [
      {
         model_: 'StringProperty',
         name: 'id',
         label: 'Identifier',
         displayWidth: 50,
         factory: function() {
           return this.$UID;
         }
      },
      {
         model_: 'Property',
         name: 'filename',
         label: 'File Name',
         type: 'String',
         displayWidth: 50,
         view: 'TextFieldView'
      },
      {
         model_: 'Property',
         name: 'type',
         type: 'String',
         displayWidth: 30,
         view: 'TextFieldView'
      },
      {
         model_: 'Property',
         name: 'size',
         type: 'int',
         displayWidth: 10,
         view: 'TextFieldView'
      },
      /**
       * Used in the MBOX reader to point to the position in the MBOX, but
       * for other uses, this doesn't make sense.
       **/
      {
         model_: 'Property',
         name: 'position',
         type: 'int',
         displayWidth: 10,
         view: 'TextFieldView'
      },
      {
        name: 'file',
        type: 'File',
        hidden: true
      },
      {
        model_: 'BooleanProperty',
        name: 'inline',
        defaultValue: false
      }
   ],
   methods: {
     atoMime: function(ret) {
       if ( !this.file ) {
         ret();
         return;
       }

       var self = this;

       var reader = new FileReader();
       reader.onloadend = function() {
         var data = Base64Encoder.encode(new Uint8Array(reader.result), 78);

         if ( data[data.length-1] !== '\n' ) data += '\r\n';

         var sanitizedName = self.filename
           .replace(/[\x00-\x1f]/g, '')
           .replace(/"/g, '');

         // TODO: Content disposition
         ret(
           "Content-Type: " + self.type + "; name=\"" + sanitizedName + '"\r\n' +
             (self.inline ? '' : 'Content-Disposition: attachment; filename=\"' + sanitizedName + '\"\r\n') +
             "Content-Transfer-Encoding: base64\r\n" +
             "Content-ID: <" + self.id + ">\r\n" +
             "X-Attachment-Id: " + self.id + "\r\n\r\n" +
             data);
       };
       reader.readAsArrayBuffer(this.file);
     }
   },
   actions:
   [
      {
         model_: 'Action',
         name: 'view',
         help: 'View an attachment.',
         action: function () {
         }
      }
   ]
});

var openComposeView = function(email) {
  DAOCreateController.getPrototype().newObj(email, EMailDAO);
}

var EMail = FOAM({
   model_: 'Model',
   name: 'EMail',
   plural: 'EMail',
   ids: [ 'id' ],
   tableProperties:
   [
      'from',
//      'to',
      'subject',
//      'attachments',
      'timestamp'
   ],
   properties:
   [
      {
         model_: 'StringProperty',
         name: 'id',
         label: 'Message ID',
         mode: 'read-write',
         required: true,
         displayWidth: 50,
         hidden: true,
         compareProperty: hexStringCompare
      },
      {
         model_: 'StringProperty',
         name: 'convId',
         label: 'Conversation ID',
         mode: 'read-write',
         hidden: true,
         displayWidth: 30
      },
      {
         model_: 'DateProperty',
         name: 'timestamp',
         aliases: ['time', 'modified', 't'],
         label: 'Date',
         type: 'String',
         mode: 'read-write',
         required: true,
         displayWidth: 45,
         displayHeight: 1,
         view: 'TextFieldView',
         tableWidth: '100',
         preSet: function (_, d) {
           if (typeof d === 'string' || typeof d === 'number')
             return new Date(d);
           return d;
         },
         factory: function() { return new Date(); }
      },
      {
         model_: 'StringProperty',
         name: 'from',
         shortName: 'f',
         mode: 'read-write',
         required: true,
         displayWidth: 90,
         tableWidth: '120',
         tableFormatter: function(t) {
           var ret;
           if (t.search('<.*>') != -1) {
             // If it's a name followed by <email>, just use the name.
             ret = t.replace(/<.*>/, '').replace(/"/g, '');
           } else {
             // If it's just an email, only use everything before the @.
             ret = t.replace(/@.*/, '');
           }
           return ret.trim();
         },
         factory: function() { return GLOBAL.user || ""; }
      },
      {
         model_: 'StringArrayProperty',
         name: 'to',
         shortName: 't',
         required: true,
         displayWidth: 90,
         tableFormatter: function(t) {
           return t.replace(/"/g, '').replace(/<.*/, '');
         }
      },
      {
         model_: 'StringArrayProperty',
         name: 'cc',
         required: true,
         displayWidth: 90,
         tableFormatter: function(t) {
           return t.replace(/"/g, '').replace(/<.*/, '');
         }
      },
      {
         model_: 'StringArrayProperty',
         name: 'bcc',
         required: true,
         displayWidth: 90,
         tableFormatter: function(t) {
           return t.replace(/"/g, '').replace(/<.*/, '');
         }
      },
      {
        model_: 'StringArrayProperty',
        name: 'replyTo'
      },
      {
         model_: 'Property',
         name: 'subject',
         shortName: 's',
         type: 'String',
         mode: 'read-write',
         required: true,
         displayWidth: 100,
         tableWidth: '45%',
         view: 'TextFieldView'
      },
      {
         model_: 'StringArrayProperty',
         name: 'labels',
         view: 'LabelView',
         postSet: function(_, a) {
           for ( var i = 0 ; i < a.length ; i++ ) a[i] = a[i].intern();
         },
         help: 'Email labels.'
      },
      {
         model_: 'Property',
         name: 'attachments',
         label: 'Attachments',
         tableLabel: '@',
         type: 'Array[Attachment]',
         subType: 'Attachment',
         view: 'ArrayView',
         factory: function() { return []; },
         tableWidth: '20',
         tableFormatter: function(a) {
           return a.length ? a.length : "";
         },
         help: 'Email attachments.'
      },
      {
         model_: 'StringProperty',
         name: 'body',
         shortName: 'b',
         label: '',
//         view: 'RichTextView',
        view: 'TextFieldView',
         displayWidth: 70,
         displayHeight: 20,
         help: 'Email message body.',
         summaryFormatter: function(t) {
           return '<div class="messageBody">' + t.replace(/\n/g,'<br/>') + '</div>';
         }
      }
   ],

   methods: {
      updateLabelByName: function(id) {
         var self = this;
         EMailLabelDAO.find(EQ(EMailLabel.DISPLAY_NAME, id), {put: function(label) {
            var mail = self.clone(); mail.toggleLabel(label.id); EMailDAO.put(mail);
         }});
      },
      hasLabel: function(l) { return this.labels.indexOf(l) != -1; },
      toggleLabel: function(l) { this.hasLabel(l) ? this.removeLabel(l) : this.addLabel(l); },
      addLabel: function(l) { this.labels = this.labels.deleteF(l).pushF(l); },
      removeLabel: function(l) { this.labels = this.labels.deleteF(l); },
      atoMime: function(ret) {
        // Filter attachments into inline and non-inline attachments.
        var inline = [];
        var attachments = []
        for ( var i = 0; i < this.attachments.length; i++ ) {
          if ( this.attachments[i].inline )
            inline.push(this.attachments[i]);
          else
            attachments.push(this.attachments[i]);
        }

        // Utility function for defining unique bounday values.
        var newBoundary = (function() {
          var boundary = Math.floor(Math.random() * 10000);
          return function() {
            return (boundary += 1).toString(16);
          };
        })();

        var body = "Content-Type: text/html; charset=UTF-8\r\n\r\n";

        var fragment = new DocumentFragment();
        fragment.appendChild(document.createElement('body'));
        fragment.firstChild.innerHTML = this.body;
        var images = fragment.querySelectorAll('img');
        for ( var i = 0; i < images.length; i++ ) {
          if ( images[i].id ) {
            images[i].src = 'cid:' + images[i].id;
            images[i].removeAttribute('id');
          }
        }
        body += fragment.firstChild.innerHTML + "\r\n";

        var i;
        var self = this;

        var addAttachments = function(attachments, inline) {
          return aseq(
            function(ret) {
              boundary = newBoundary();

              body = "Content-Type: multipart/" +
                ( inline ? 'related' : 'mixed' ) + "; boundary=" + boundary + "\r\n\r\n"
                + "--" + boundary + "\r\n"
                + body
                + "\r\n--" + boundary;
              i = 0;
              ret();
            },
            awhile(
              function() { return i < attachments.length; },
              aseq(
                function(ret) {
                  var att = attachments[i];
                  i++;
                  att.atoMime(ret);
                },
                function(ret, data) {
                  body += "\r\n" + data;
                  body += "--" + boundary;
                  ret();
                })),
            function(ret) {
              body += "--";
              ret();
            });
        };

        aseq(
          aif(inline.length > 0,
              addAttachments(inline, true)),
          aif(attachments.length > 0,
              addAttachments(attachments, false)))(function() {
                body = "From: " + self.from + "\r\n" +
                  "To: " + self.to.join(', ') + "\r\n" +
                  (self.cc.length ? "Cc: " + self.cc.join(", ") + "\r\n" : "") +
                  (self.bcc.length ? "Bcc: " + self.bcc.join(", ") + "\r\n" : "") +
                  "Subject: " + self.subject + "\r\n" +
                  body;
                ret(body);
              });
      }
   },

   actions:
   [
      {
         model_: 'Action',
         name: 'send',
         help: 'Send the email.',
         action: function () {
           EmailDAO.put(this);
           stack.back();
         }
      },
      {
         model_: 'Action',
         name: 'reply',
         help: 'Reply to an email.',
         action: function () {
           var replyMail = EMail.create({
             to: [this.from],
             from: ME || this.to,
             subject: "Re.: " + this.subject,
             body: this.body.replace(/^|\n/g, '\n>'),
             id: Math.floor(Math.random() * 0xffffff).toVarintString()
           });
           openComposeView(replyMail);
         }
      },
      {
         model_: 'Action',
         name: 'replyAll',
         help: 'Reply to all recipients of an email.',
         action: function () {
           var replyMail = EMail.create({
             to: [this.from],
             cc: this.cc,
             from: ME || this.to,
             subject: "Re.: " + this.subject,
             body: this.body.replace(/^|\n/g, '\n>'),
             id: Math.floor(Math.random() * 0xffffff).toVarintString()
           });

           for ( var i = 0 ; i < this.to ; i++ ) {
              replyMail.to.push(this.to[i]);
           }
           openComposeView(replyMail);
         }
      },
      {
         model_: 'Action',
         name: 'forward',
         help: 'Forward an email.',
         action: function () {
           var forwardedMail = EMail.create({
             from: ME,
             subject: "Fwd.: " + this.subject,
             body: this.body.replace(/^|\n/g, '\n>'),
             id: Math.floor(Math.random() * 0xffffff).toVarintString()
           });
           openComposeView(forwardedMail);
         }
      },
      {
         model_: 'Action',
         name: 'star',
         help: 'Star an email.',
         action: function () { this.updateLabelByName('^t'); }
      },
      {
         model_: 'Action',
         name: 'archive',
         help: 'Archive an email.',
         action: function () { this.updateLabelByName('^i'); }
      },
      {
         model_: 'Action',
         name: 'spam',
         help: 'Report an email as SPAM.',
         action: function () {
             var mail = this;
             apar(
               function(ret) {
                 EMailLabelDAO.where(EQ(EMailLabel.DISPLAY_NAME, "^i")).select({
                   put: function(o) { ret(o); }
                 });
               },
               function(ret) {
                 EMailLabelDAO.where(EQ(EMailLabel.DISPLAY_NAME, "^s")).select({
                   put: function(o) { ret(o); }
                 });
               })(function(inbox, spam) {
                 mail = mail.clone();
                 mail.removeLabel(inbox.id);
                 mail.addLabel(spam.id);
                 EmailDAO.put(mail);
               });
         }
      },
      {
         model_: 'Action',
         name: 'trash',
         help: 'Move an email to the trash.',
         action: function () {
             var mail = this;
             apar(
               function(ret) {
                 EMailLabelDAO.where(EQ(EMailLabel.DISPLAY_NAME, "^i")).select({
                   put: function(o) { ret(o); }
                 });
               },
               function(ret) {
                 EMailLabelDAO.where(EQ(EMailLabel.DISPLAY_NAME, "^k")).select({
                   put: function(o) { ret(o); }
                 });
               })(function(inbox, trash) {
                 mail = mail.clone();
                 mail.removeLabel(inbox.id);
                 mail.addLabel(trash.id);
                 EMailDAO.put(mail);
               });
         }
      },
     {
       model_: 'Action',
       name: 'open',
       action: function() {
         var mail = this;
         apar(
           function(ret) {
             EMailLabelDAO.where(EQ(EMailLabel.DISPLAY_NAME, "^o")).select({
               put: function(o) { ret(o); }
             });
           },
           function(ret) {
             EMailLabelDAO.where(EQ(EMailLabel.DISPLAY_NAME, "^u")).select({
               put: function(o) { ret(o); }
             });
           })(function(opened, unread) {
             if ( mail.hasLabel(unread.id) ) {
               mail = mail.clone();
               mail.removeLabel(unread.id);
               mail.addLabel(opened.id);
               EMailDAO.put(mail);
             }
           });
       }
     }
   ]
});


var EmailAddressParser = {
  __proto__: grammar,

  START: sym('address'),

  'until eol': repeat(notChar('\r')),

  'address list': repeat(sym('address'), seq(',', repeat(' '))),

  'address': alt(
    sym('labelled address'),
    sym('simple address')),

  'labelled address': seq(
    repeat(notChars('<,')),
    '<', sym('simple address'), '>'),

  'simple address': seq(repeat(notChar('@')), '@', repeat(notChars('\r>,')))
}.addActions({
  'labelled address': function(v) { return v[0].join('') + v[1] + v[2] + v[3]; },
  'simple address': function(v) { return v[0].join('') + v[1] + v[2].join(''); }
});


var MBOXParser = {
  __proto__: grammar,

  START: sym('line'),

  'eol': literal('\n'),

  'until eol': repeat(notChar('\r')),

  line: alt(
    sym('start of email'),
    sym('id'),
    sym('conversation id'),
    sym('to'),
    sym('cc'),
    sym('bcc'),
    sym('from'),
    sym('subject'),
    sym('date'),
    sym('labels'),
    sym('block separator'),
    sym('content type'),
    sym('transfer encoding'),
    sym('empty line'),
    sym('start of attachment')
  ),

  'empty line': literal('\r\n'),

  'start of email': seq('From ', sym('until eol')),

  id: seq('Message-ID: ', sym('until eol')),

  'conversation id': seq('X-GM-THRID: ', sym('until eol')),

  address: EmailAddressParser.export('address'),

  'address list': EmailAddressParser.export('address list'),

  to: seq('To: ', sym('until eol')),
  cc: seq('Cc: ', sym('until eol')),
  bcc: seq('Bcc: ', sym('until eol')),
  from: seq('From: ', sym('until eol')),

  labels: seq('X-Gmail-Labels: ', repeat(sym('label'), ',')),

  label: repeat(alt(range('a','z'), range('A', 'Z'), range('0', '9'))),

  subject: seq('Subject: ', sym('until eol')),

  date: seq('Date: ', sym('until eol')),

  'other': sym('until eol'),

  'block separator': seq(
    '--', repeat(notChars('-\r\n')), optional('--')),

  'token': repeat(notChars(' ()<>@,;:\\"/[]?=')),

  'type': alt(
    sym('multipart type'),
    sym('text/plain'),
    sym('text/html'),
    sym('unknown content type')),

  'unknown content type': seq(sym('token'), '/', sym('token')),

  'multipart type': seq(literal('multipart/'), sym('token')),

  'text/plain': literal('text/plain'),
  'text/html': literal('text/html'),

  'content type': seq(
    'Content-Type: ',
    sym('type'),
    optional(seq('; ', sym('params')))),

  'params': repeat(alt(
    sym('boundary declaration'),
    sym('charset declaration'),
    seq(sym('token'), '=', sym('token')))),

  'boundary declaration': seq('boundary=', sym('token')),

  'charset declaration': seq('charset=', alt(
    sym('utf-8'),
    sym('iso-8859-1'),
    sym('token'))),


  'utf-8': literal('UTF-8'),
  'iso-8859-1': literal('ISO-8859-1'),

  'transfer encoding': seq(
    'Content-Transfer-Encoding: ',
    alt(sym('quoted printable'),
        sym('base64'),
        sym('until eol'))),

  'quoted printable': literal_ic('quoted-printable'),
  'base64': literal_ic('base64'),

  'start of attachment': seq(
    'Content-Type: ', repeat(notChar(';')), '; name="', sym("filename"), '"', sym('until eol')
//    'Content-Disposition: attachment; filename="', sym("filename"), '"', sym('until eol')
    ),

  filename: repeat(notChar('"'))

};

/** Sink which loads Emails into a DAO. **/
var MBOXLoader = {
  __proto__: MBOXParser,

  ps: StringPS.create(""),

  state: function(str) {
    this.states[0].call(this, str);
  },

  PARSE_HEADERS_STATE: function HEADERS(str) {
    this.parseString(str);
  },

  IGNORE_SECTION_STATE: function IGNORE_SECTION(str) {
    if ( str.slice(0, 5) === 'From ' ) {
      this.states.shift();
      this.state(str);
    } else if ( str.indexOf(this.blockIds[0]) == 2) {
      this.states.shift();
      if ( str.slice(-4, -2) == '--' ) {
        this.blockIds.shift();
      }
    }
  },

  PLAIN_BODY_STATE: function PLAIN_BODY(str) {
    if ( str.slice(0, 5) === 'From ' ) {
      this.states.shift();
      this.state(str);
      return;
    }

    if ( str.indexOf(this.blockIds[0]) == 2) {
      this.states.shift();
      if ( str.slice(-4, -2) == '--' ) {
        this.blockIds.shift();
      }
      return;
    }

    if ( ! this.hasHtml ) {
      this.b.push(str.trimRight());
    }
  },

  HTML_BODY_STATE: function HTML_BODY(str) {
    if ( str.slice(0, 5) === 'From ' ) {
      this.states.shift();
      this.state(str);
      return;
    }

    if ( str.indexOf(this.blockIds[0]) == 2) {
      this.states.shift();
      if ( str.slice(-4, -2) == '--' ) {
        this.blockIds.shift();
      }
      return;
    }

    this.b.push(str.trimRight());
  },

  SKIP_ATTACHMENT_STATE: function ATTACHMENT(str) {
    var att = this.email.attachments[this.email.attachments.length-1];
    if ( str.slice(0, 5) === 'From ' ) {
      att.size = att.pos - att.position;
      this.states.shift();
      this.state(str);
      return;
    }

    if ( str.indexOf(this.blockIds[0]) == 2) {
      this.states.shift();
      if ( str.slice(-4, -2) == '--' ) {
        this.blockIds.shift();
      }
      return;
    }
  },

  created: 0, // No of Emails created

  lineNo: 0,  // Current Line Number in mbox file

  pos: 0,     // Current byte position in mbox file

  segPos: 0,

  put: function(str) {
    if ( this.lineNo == 0 ) {
      this.segStartTime = this.startTime = Date.now();
      this.states = [this.PARSE_HEADERS_STATE];
    }

    this.lineNo++;
    this.pos += str.length;

    if ( ! ( this.lineNo % 100000 ) ) {
      var lps = Math.floor(this.lineNo / (Date.now() - this.startTime));
      var bps = Math.floor(this.pos / (Date.now() - this.startTime));
      var slps = Math.floor(100000 / (Date.now() - this.segStartTime));
      var sbps = Math.floor((this.pos-this.segPos) / (Date.now() - this.segStartTime));

      console.log(
        'line: ' + Math.floor(this.lineNo/1000) +
        'k  time: ' + Math.floor((Date.now() - this.startTime)) +
        'ms  bytes: ' + Math.floor(this.pos/1000) +
        'k  created: ' + this.created +
        '    SEGMENT:',
        ' lps: ' + slps +
        'k bps: ' + sbps + 'k' +
        '    TOTAL:',
        ' lps: ' + lps +
        'k bps: ' + bps + 'k ' +
        'state: ' + this.states[0].name);

      this.segStartTime = Date.now();
      this.segPos = this.pos;
    }

    this.state(str);
  },

  eof: function() { this.saveCurrentEmail(); },

  saveCurrentEmail: function() {
    if ( this.email ) {
      // TODO: Standardize encoding and charset interfaces.
      // Make them fetched from the context on demand.
      if ( this.b.encoding && this.b.encoding == 'quoted-printable' ) {
        var decoder = QuotedPrintable;

        if ( this.b.charset && this.b.charset == 'UTF-8' ) {
          var charset = IncrementalUtf8.create();
        } else {
          charset = {
            string: "",
            remaining: 0,
            put: function(s) {
              this.string += String.fromCharCode(s);
            },
            reset: function() {
              this.string = "";
            }
          };
        }

        var b = decoder.decode(this.b.join('\n'), charset);
      } else {
        b = this.b.join('\n');
      }



      this.email.body = b;

      this.charset = "";
      this.encoding = "";
      this.b = [];

      if ( this.email.to.length == 0 ) return;
      if ( this.email.to.indexOf('<<') != -1 ) return;
      if ( this.email.from.indexOf('<<') != -1 ) return;
      if ( this.email.to.indexOf('3D') != -1 ) return;
      if ( this.email.from.indexOf('3D') != -1 ) return;
      if ( this.email.from.indexOf('=') != -1 ) return;
      if ( this.email.from.indexOf('<') == 0 ) return;
      if ( this.email.from.indexOf(' ') == 0 ) return;

      this.created++;

      // console.log('creating: ', this.created);
      // console.log('creating: ', this.email.toJSON());
      if ( this.dao ) this.dao.put(this.email);
    }
  }
}.addActions({
  'start of email': function() {
    this.saveCurrentEmail();

    this.email = EMail.create();
    this.b = [];
    this.blockIds = [];
    this.states = [this.PARSE_HEADERS_STATE];
  },

//  id: function(v) { this.email.id = v[1].join('').trim(); },
  id: function(v) { this.email.id = Math.floor(Math.random()*100000000); },

  'conversation id': function(v) { this.email.convId = v[1].join('').trim(); },

  to: function(v) {
    this.email.to = v[1].join('').trim();
    var i = this.email.to.indexOf(',');
    if ( i != -1 ) this.email.to = this.email.to.substring(0, i);
},

  cc: function(v) {
    var cc = v[1].join('').split(',');
    for ( var i = 0; i < cc.length; i++ ) {
      cc[i] = cc[i].trim();
    }
    this.email.cc = cc;
  },

  bcc: function(v) {
    var bcc = v[1].join('').split(',');
    for ( var i = 0; i < bcc.length; i++ ) {
      bcc[i] = bcc[i].trim();
    }
    this.email.bcc = bcc;
  },

  from: function(v) { this.email.from = v[1].join('').trim(); },

  subject: function(v) { this.email.subject = v[1].join('').trim(); },

  date: function(v) { this.email.timestamp = new Date(v[1].join('').trim()); },

  label: function(v) { this.email.labels.push(v.join('')); },

  'text/plain': function(v) {
    this.nextState = this.PLAIN_BODY_STATE;
  },

  'text/html': function(v) {
    this.b = [];
    this.nextState = this.HTML_BODY_STATE;
  },

  'unknown content type': function() {
    this.nextState = this.IGNORE_SECTION_STATE;
  },

  'multipart type': function(v) {
    this.nextState = this.PARSE_HEADERS_STATE;
  },

  'empty line': function(v) {
    if ( this.nextState === this.PLAIN_BODY_STATE ||
         this.nextState === this.HTML_BODY_STATE ) {
      this.b.encoding = this.encoding;
      this.b.charset = this.charset;
    }
    this.states.unshift(this.nextState);
  },

  'boundary declaration': function(v) {
    this.blockIds.unshift(v[1].join('').trimRight());
  },

  'quoted printable': function() {
    this.encoding = 'quoted-printable';
  },

  'base64': function() {
    this.encoding = 'base64';
  },

  'utf-8': function() {
    this.charset = 'UTF-8';
  },

  'iso-8859-1': function() {
    this.charset = 'ISO-8859-1';
  },

  'block separator': function(v) {
    this.nextState = this.IGNORE_SECTION_STATE
    if ( v[2] ) {
      this.nextState = this.PARSE_HEADERS_STATE;
      this.blockIds.shift();
    }
  },

  'start of attachment': function(v, unused, pos) {
    this.nextState = this.SKIP_ATTACHMENT_STATE;

    var attachment = Attachment.create({
      type: v[1].join(''),
      filename: v[3].join(''),
      position: this.pos
    });

    this.email.attachments.push(attachment);
  }

  // TODO: timestamp, message-id, body, attachments
  // TODO: internalize common strings to save memory (or maybe do it at the DAO level)

});


var EMailBody = FOAM({
    model_: 'Model',
    name: 'EMailBody',
    label: 'EMailBody',

    ids: [
        'offset',
        'size'
    ],

    properties: [
        {
            name: 'offset',
            type: 'Int',
            required: true
        },
        {
            name: 'size',
            type: 'Int',
            required: true
        },
        {
            name: 'value',
            type: 'String',
            defaultValue: ''
        }
    ],

    methods: {
    }
});

var ConversationAction = FOAM({
  model_: 'Model',
  extendsModel: 'Action',

  properties: [
    {
      name: 'name',
      defaultValueFn: function() {
        return this.delegate ? this.delegate.name : 'ConversationAction';
      },
    },
    {
      name: 'iconUrl',
      defaultValueFn: function() {
        return this.delegate.iconUrl;
      },
    },
    {
      name: 'help',
      defaultValueFn: function() {
        return this.delegate.help;
      },
    },
    {
      name: 'delegate',
    },
    {
      name: 'action',
      defaultValue: function(action) {
        var emails = this.emails;
        if (action.applyOnAll) {
          emails.forEach(function(e) {
            action.delegate.action.call(e);
          });
        } else if (emails.length) {
          var e = emails[emails.length - 1];
          action.delegate.action.call(e);
        }
      },
    },
    {
      name: 'applyOnAll',
      defaultValue: true,
    },
  ],
});

var EMailsView = FOAM({
   model_: 'Model',
   name:  'EMailsView',

   extendsModel: 'DetailView',

   properties: [
      {
         name:  'value',
         type:  'Value',
         postSet: function(oldValue, newValue) {
            oldValue && oldValue.removeListener(this.updateHTML);
            newValue.addListener(this.updateHTML);
            this.updateHTML();
         },
         factory: function() { return SimpleValue.create(); }
      }
   ],

   listeners:
   [
     {
       model_: 'Method',
       name: 'updateHTML',
       code: function() {
         var c = this.value.get();
         if (!c) return;

         var html = "";
         this.children = [];

         var self = this;
         c.forEach(function(m) {
           var v = MessageView.create({});
           self.addChild(v);

           // This is done to actually get the email bodies.
           EMailDAO.find(m.id, {
             put: function(m2) {
               v.value.set(m2);
             }
           });

           html += v.toHTML();
         });

        this.$.innerHTML = html;

        this.initChildren();
       }
     }
  ],

   methods: {
     toHTML: function() {
       return '<div id="' + this.id + '"></div>';
     },
   }
});

var Conversation = FOAM({
  model_: 'Model',
  name: 'Conversation',

  tableProperties: [
    'recipients',
    'subject',
    'timestamp',
  ],

  ids: [ 'id' ],

  properties: [
    {
      name: 'id',
    },
    {
      name: 'recipients',
      tableWidth: '100',
    },
    {
      model_: 'StringProperty',
      name: 'subject',
      shortName: 's',
      mode: 'read-write',
      required: true,
      displayWidth: 100,
      tableWidth: '45%',
      view: 'TextFieldView',
      tableFormatter: function(s, self, view) {
        var sanitizedSubject = view.strToHTML(s);
        if (self.isUnread) {
          return '<b>' + sanitizedSubject + '</b>';
        } else {
          return sanitizedSubject;
        }
      },
    },
    {
      name: 'timestamp',
      model_: 'DateProperty',
      tableWidth: '75',
    },
    {
      name: 'emails',
      view: 'EMailsView',
    },
    {
      name: 'isUnread',
    },
    {
       model_: 'StringArrayProperty',
       name: 'labels',
       view: 'LabelView',
       help: 'Email labels.',
       postSet: function(oldValue, newValue) {
         if (!newValue || !newValue.length) return;
         var self = this;
         this.isUnread = false;
         EMailLabelDAO.find(EQ(EMailLabel.DISPLAY_NAME, '^u'), {put: function(unreadLabel) {
           newValue.forEach(function(label) {
             if (label == unreadLabel.id) {
               self.isUnread = true;
             }
           });
         }});
       },
    },
  ],

  listeners: [
    {
      // For some reason, when isAnimated is true, nothing renders.
      //isAnimated: true,
      name: 'update',
      code: function() {
        if (!this.emails || this.emails.length === 0) return;
        // TODO the primary email should be the most recent email that matches the query
        // that we haven't yet given this model.
        var primaryEmail = this.emails[0];

        this.subject = primaryEmail.subject;

        var allSenders = [];
        var seenSenders = {};
        for (var i = 0, m; m = this.emails[i]; i++) {
          // TODO this needs work:
          // 1. bold unread
          // 2. strip last names when more than one name
          // 3. limit to 3 senders (first sender followed by last two i think)
          // 4. dont dedupe senders that have an unread and a read message. They should show twice.
          if (!seenSenders[m.from]) {
            allSenders.push(EMail.FROM.tableFormatter(m.from));
            seenSenders[m.from] = true;
          }
        }
        this.recipients = allSenders.join(', ');
        if (this.emails.length > 1) {
          this.recipients += ' (' + this.emails.length + ')';
        }
        this.timestamp = primaryEmail.timestamp;

        // Concat all of the labels together.
        var m = {};
        this.emails.forEach(function(e) { e.labels.forEach(function(l) { m[l] = 1; }); });
        this.labels = Object.keys(m);
      }
    }
  ],

  methods: {
    put: function(email) {
      if (!this.emails) this.emails = [];
      this.emails.put(email);
      this.id = email.convId;
      this.update();
    },
    remove: function(email) {
      if (!this.emails) this.emails = [];
      for ( var i = 0; i < this.emails.length; i++ ) {
        if ( email.id === this.emails[i].id ) {
          this.emails.splice(i--, 1);
        }
      }
      this.update();
    }
  },

  actions: [
    {
       model_: 'ConversationAction',
       delegate: EMail.REPLY,
       applyOnAll: false,
    },
    {
       model_: 'ConversationAction',
       delegate: EMail.REPLY_ALL,
       applyOnAll: false,
    },
    {
       model_: 'ConversationAction',
       delegate: EMail.FORWARD,
       applyOnAll: false,
    },
    {
       model_: 'ConversationAction',
       delegate: EMail.STAR,
       applyOnAll: false,
    },
    {
       model_: 'ConversationAction',
       delegate: EMail.ARCHIVE,
    },
    {
       model_: 'ConversationAction',
       delegate: EMail.SPAM,
    },
    {
       model_: 'ConversationAction',
       delegate: EMail.TRASH,
    },
    {
      model_: 'ConversationAction',
      delegate: EMail.OPEN,
    }
  ]
});

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
FOAModel({
  name:  'Turntable',

  extendsModel: 'CView',

  properties: [
    {
      name:  'r',
      label: 'Radius',
      type:  'int',
      view:  'IntFieldView',
      defaultValue: 150
    },
    {
      name:  'width',
      type:  'int',
      defaultValue: 350
    },
    {
      name:  'height',
      type:  'int',
      defaultValue: 350
    },
    {
      name:  'x',
      type:  'int',
      defaultValue: 170
    },
    {
      name:  'y',
      type:  'int',
      defaultValue: 170
    },
    {
      name:  'rpm',
      label: 'RPM',
      type:  'float',
      view:  'FloatFieldView',
      help:  'Rotations Per Minute. Standard values: 33, 45, and 78.',
      defaultValue: 33
    },
    {
      name:  'internalTime',
      postSet: function(_, newValue) { if ( this.active ) this.time = newValue; }
    },
    {
      name:  'time',
      preSet: function(_, newValue) {
        // When active, don't accept external changes to time.  Override by firing event back to
        // internalTime value.
        if ( this.active ) {
          if ( newValue != this.internalTime ) this.propertyChange('time', newValue, this.internalTime);
          return this.internalTime;
        }

        return newValue;
      }
    }
  ],

  listeners: {
    mouseDown: function(evt) {
      this.active = true;
      this.internalTime = this.time;
      this.a = this.angle(evt.offsetX, evt.offsetY);
      this.touchX = evt.offsetX;
      this.touchY = evt.offsetY;
    },
    mouseUp: function(evt) {
      this.active = false;
    },
    mouseMove: function(evt) {
      if ( ! this.active ) return;

      this.touchX = evt.offsetX;
      this.touchY = evt.offsetY;

      var prevA = this.a;
      this.a = this.angle(evt.offsetX, evt.offsetY);
      var d = this.a - prevA;
      if ( d > Math.PI*1.5 ) d -= Math.PI*2;
      if ( d < -Math.PI*1.5 ) d += Math.PI*2;
      if ( d == 0 ) return;

      var dTime = d/(Math.PI*2)*36000/this.rpm;
      this.time = this.internalTime = this.internalTime + dTime;
    }
  },

  methods: {
    angle: function(x,y) {
      return Math.atan2(y-this.y, x-this.x);
    },

    paintSelf: function() {
      this.parent.$.onmousedown = this.mouseDown;
      this.parent.$.onmouseup   = this.mouseUp;
      this.parent.$.onmousemove = this.mouseMove;

      var c = this.canvas;

      c.save();
      c.font = "48pt Arial";

      c.lineWidth = 12;
      c.globalAlpha = 0.25;

      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x,this.y,this.r,0,Math.PI*2,true);
      c.stroke();

      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x,this.y,5+this.r/2,0,Math.PI*2,true);
      c.stroke();

      var r4 = (this.r-10)/4;
      var p = -0.25*this.rpm*this.time/36000*Math.PI*2;
      c.beginPath();
      c.strokeStyle = 'black';
      c.arc(this.x+(10+r4)*Math.sin(p),this.y+(10+r4)*Math.cos(p),r4,0,Math.PI*2,true);
      c.stroke();

      var p = -this.rpm*this.time/36000*Math.PI*2;
      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x+(10+3*r4)*Math.sin(p),this.y+(10+3*r4)*Math.cos(p),r4,0,Math.PI*2,true);
      c.stroke();

      /*
      c.save();
      c.translate(this.x,this.y);
      c.rotate(this.rpm*this.time/36000*Math.PI*2);
      c.translate(-this.x,-this.y);
      c.fillStyle = '#999';
      c.fillText("FOAM", this.x-92, this.y+25);
      c.restore();
      */

      c.beginPath();
      c.fillStyle = 'black';
      c.arc(this.x,this.y,8,0,Math.PI*2,true);
      c.stroke();

      if ( this.active ) {
        c.lineWidth = 15;
        c.strokeStyle = 'blue';
        c.beginPath();
        c.arc(this.touchX,this.touchY,r4,0,Math.PI*2,true);
        c.stroke();

        c.lineWidth = 3;
        var dx = this.touchX - this.x;
        var dy = this.touchY - this.y;
        var r  = Math.sqrt(dx*dx + dy*dy);
        var a = Math.atan2(dy, dx);

        r = Math.round(r / 20) * 20;
        c.beginPath();
        c.strokeStyle = 'blue';
        c.arc(this.x,this.y,r,a+Math.PI*0.8,a-Math.PI*0.8,true);
        c.stroke();
      }

      c.restore();
    }
  }
});
