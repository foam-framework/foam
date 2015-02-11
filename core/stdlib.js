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

var DEBUG  = DEBUG || false;
var GLOBAL = GLOBAL || this;
var global = global || GLOBAL;

function MODEL(model) {
  var proto;

  if ( model.name ) {
    if ( ! GLOBAL[model.name] ) {
      if ( model.extendsModel ) {
        GLOBAL[model.name] = { __proto__: GLOBAL[model.extendsModel] };
      } else {
        GLOBAL[model.name] = {};
      }
    }
    proto = GLOBAL[model.name];
  } else {
    proto = model.extendsProto ? GLOBAL[model.extendsProto].prototype :
                                 GLOBAL[model.extendsObject] ;
  }

  model.properties && model.properties.forEach(function(p) {
    Object.defineProperty(
      proto,
      p.name,
      { get: p.getter, enumerable: false });
  });

  for ( key in model.constants )
    Object.defineProperty(
      proto,
      key,
      { value: model.constants[key], writable: true, enumerable: false });

  if ( Array.isArray(model.methods) ) {
    model.methods.forEach(function(m) {
      Object.defineProperty(
        proto,
        m.name,
        { value: m, writable: true, enumerable: false });
    });
  } else {
    for ( var key in model.methods )
      Object.defineProperty(
        proto,
        key,
        { value: model.methods[key], writable: true, enumerable: false });
  }
}


MODEL({
  extendsObject: 'GLOBAL',

  methods: [
    function memoize(f) {
      var cache = {};
      var g = function() {
        var key = argsToArray(arguments).toString();
        if ( ! cache.hasOwnProperty(key) ) cache[key] = f.apply(this, arguments);
        return cache[key];
      };
      g.name = f.name;
      return g;
    },

    function memoize1(f) {
      var cache = {};
      var g = function(arg) {
        var key = arg.toString();
        if ( ! cache.hasOwnProperty(key) ) cache[key] = f.call(this, arg);
        return cache[key];
      };
      g.name = f.name;
      return g;
    },

    function constantFn(v) {
      /* Create a function which always returns the supplied constant value. */
      return function() { return v; };
    },

    function argsToArray(args) {
      var array = new Array(args.length);
      for ( var i = 0; i < args.length; i++ ) array[i] = args[i];
      return array;
    },

    function StringComparator(s1, s2) {
      if ( s1 == s2 ) return 0;
      return s1 < s2 ? -1 : 1;
    },

    function toCompare(c) {
      if ( Array.isArray(c) ) return CompoundComparator.apply(null, c);

      return c.compare ? c.compare.bind(c) : c;
    },

    function CompoundComparator() {
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
      f.toBQL = function() { return args.map(function(s) { return s.toBQL(); }).join(' '); };
      f.toString = f.toSQL;

      return f;
    },

    function randomAct() {
      /**
       * Take an array where even values are weights and odd values are functions,
       * and execute one of the functions with propability equal to it's relative
       * weight.
       */
      // TODO: move this method somewhere better
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
    },

    // Workaround for crbug.com/258552
    function Object_forEach(obj, fn) {
      for (var key in obj) if (obj.hasOwnProperty(key)) fn(obj[key], key);
    },

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
        toString: function() {
          return 'PredicatedSink(' +
            sink.$UID + ', ' + predicate + ', ' + sink + ')';
        }
      };
    },

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
    },

    function skipSink(skip, sink) {
      var i = 0;
      return {
        __proto__: sink,
        put: function(obj, s, fc) {
          if ( i++ >= skip ) sink.put(obj, s, fc);
        }
      };
    },

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
    },

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
    },

    // Function for returning multi-line strings from commented functions.
    // Ex. var str = multiline(function() { /* multi-line string here */ });
    function multiline(f) {
      var s = f.toString();
      var start = s.indexOf('/*');
      var end   = s.lastIndexOf('*/');
      return s.substring(start+2, end);
    },

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
    },

    // Computes the XY coordinates of the given node
    // relative to the viewport.
    function findViewportXY(node) {
      var rect = node.getBoundingClientRect();
      return [rect.left, rect.top];
    },

    function nop() { /** NOP function. **/ },

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
  ]
});

var constantize = memoize1(function(str) {
  // switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
  // TODO: add property to specify constantization. For now catch special case to avoid conflict with context this.X.
  return str === 'x' ?
    'X_' :
    str.replace(/[a-z_][^0-9a-z_]/g, function(a) {
      return a.substring(0,1) + '_' + a.substring(1,2);
    }).toUpperCase();
});


MODEL({
  extendsProto: 'Object',

  properties: [
    {
      name: '$UID',
      getter: (function() {
        var id = 1;
        return function() {
          if (this.$UID__) return this.$UID__;
          Object.defineProperty(this, '$UID__', { value: id });
          ++id;
          return this.$UID__;
        };
      })()
    }
  ],

  methods: [
    function clone() { return this; },

    function deepClone() { return this.clone(); },

    function become(other) {
      var local = Object.getOwnPropertyNames(this);
      for ( var i = 0; i < local.length; i++ ) {
        delete this[local[i]];
      }

      var remote = Object.getOwnPropertyNames(other);
      for ( i = 0; i < remote.length; i++ ) {
        Object.defineProperty(
          this,
          remote[i],
          Object.getOwnPropertyDescriptor(other, remote[i]));
      }
      this.__proto__ = other.__proto__;
    }
  ]
});


MODEL({
  extendsProto: 'Array',

  constants: {
    oldForEach_: Array.prototype.forEach
  },

  methods: [
    function forEach(f, opt_this) {
      /* Replace Array.forEach with a faster version. */
      if ( ! this || ! f || opt_this ) return this.oldForEach_.call(this, f, opt_this);

      var l = this.length;
      for ( var i = 0 ; i < l ; i++ ) f(this[i], i, this);
    },

    function binaryInsert(item) {
      /* binaryInsert into a sorted array, removing duplicates */
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
    },

    function union(other) {
      return this.concat(
        other.filter(function(o) { return this.indexOf(o) == -1; }.bind(this)));
    },

    function intersection(other) {
      return this.filter(function(o) { return other.indexOf(o) != -1; });
    },

    function intern() {
      for ( var i = 0 ; i < this.length ; i++ )
        if ( this[i].intern ) this[i] = this[i].intern();

      return this;
    },

    function compareTo(other) {
      if ( this.length !== other.length ) return -1;

      for ( var i = 0 ; i < this.length ; i++ ) {
        var result = this[i].compareTo(other[i]);
        if ( result !== 0 ) return result;
      }
      return 0;
    },

    function fReduce(comparator, arr) {
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
    },

    function pushAll(arr) {
      /**
       * Push an array of values onto an array.
       * @param arr array of values
       * @return new length of this array
       */
      // TODO: not needed, port and replace with pipe()
      this.push.apply(this, arr);
      return this.length;
    },

    function mapFind(map) {
      /**
       * Search for a single element in an array.
       * @param predicate used to determine element to find
       */
      for (var i = 0;  i < this.length ; i++ ) {
        var result = map(this[i], i);
        if ( result ) return result;
      }
    },

    function mapProp(prop) {
      // Called like myArray.mapProp('name'), that's equivalent to:
      // myArray.map(function(x) { return x.name; });
      return this.map(function(x) { return x[prop]; });
    },

    function mapCall() {
      var args = Array.prototype.slice.call(arguments, 0);
      var func = args.shift();
      return this.map(function(x) { return x[func] && x[func].apply(x[func], args); });
    }
  ]
});


MODEL({
  extendsProto: 'String',

  methods: [
    function indexOfIC(a) { return ( a.length > this.length ) ? -1 : this.toUpperCase().indexOf(a.toUpperCase()); },

    function equals(other) { return this.compareTo(other) === 0; },

    function equalsIC(other) { return other && this.toUpperCase() === other.toUpperCase(); },

    function capitalize() { return this.charAt(0).toUpperCase() + this.slice(1); },

    function labelize() {
      return this.replace(/[a-z][A-Z]/g, function (a) { return a.charAt(0) + ' ' + a.charAt(1); }).capitalize();
    },

    function clone() { return this.toString(); },

    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },

    // Polyfil
    String.prototype.startsWith || function startsWith(a) {
      // This implementation is very slow for some reason
      return 0 == this.lastIndexOf(a, 0);
    },

    function startsWithIC(a) {
      if ( a.length > this.length ) return false;
      var l = a.length;
      for ( var i = 0 ; i < l; i++ ) {
        if ( this[i].toUpperCase() !== a[i].toUpperCase() ) return false;
      }
      return true;
    },

    function put(obj) { return this + obj.toJSON(); },

    (function() {
      var map = {};

      return function intern() {
        /** Convert a string to an internal canonical copy. **/
        return map[this] || (map[this] = this.toString());
      };
    })(),

    function hashCode() {
      var hash = 0;
      if ( this.length == 0 ) return hash;

      for (i = 0; i < this.length; i++) {
        var code = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash &= hash;
      }

      return hash;
    }
  ]
});


MODEL({
  extendsProto: 'Function',

  methods: [
    /**
     * Replace Function.bind with a version
     * which is ~10X faster for the common case
     * where you're only binding 'this'.
     **/
    (function() {
      var oldBind    = Function.prototype.bind;
      var simpleBind = function(f, self) {
        return function() { return f.apply(self, arguments); };
        /*
        var ret = function() { return f.apply(self, arguments); };
        ret.toString = function bind() {
          return f.toString();
        };
        return ret;
        */
      };

      return function bind(arg) {
        return arguments.length == 1 ?
          simpleBind(this, arg) :
          oldBind.apply(this, argsToArray(arguments));
      };
    })(),

    function equals(o) { return this === o; },

    function compareTo(o) {
      return this === o ? 0 : ( this.name.compareTo(o.name) || 1 );
    },

    function o(f2) {
      var f1 = this;
      return function() {
        return f1.call(this, f2.apply(this, argsToArray(arguments)));
      };
    }
  ]
});


MODEL({
  extendsProto: 'Date',

  methods: [
    function toRelativeDateString(){
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
    },

    function compareTo(o){
      if ( o === this ) return 0;
      if ( ! o ) return 1;
      var d = this.getTime() - o.getTime();
      return d == 0 ? 0 : d > 0 ? 1 : -1;
    },

    function toMQL() {
      return this.getFullYear() + '/' + (this.getMonth() + 1) + '/' + this.getDate();
    },

    function toBQL() {
      var str = this.toISOString(); // eg. 2014-12-04T16:37:33.420Z
      return str.substring(0, str.indexOf('.')); // eg. 2014-12-04T16:37:33
    }
  ]
});


MODEL({
  extendsProto: 'Number',

  methods: [
    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },

    function clone() { return +this; }
  ]
});


MODEL({
  extendsProto: 'Boolean',

  methods: [
    function compareTo(o) { return (this.valueOf() ? 1 : 0) - (o ? 1 : 0); }
  ]
});


MODEL({
  extendsProto: 'RegExp',

  methods: [
    function quote(str) {
      return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }
  ]
});

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
console.log.put          = console.log.bind(console);
console.log.remove       = console.log.bind(console, 'remove: ');
console.log.error        = console.log.bind(console, 'error: ');
console.log.json.put     = console.log.json.bind(console);
console.log.json.reduceI = console.log.json.bind(console, 'reduceI: ');
console.log.json.remove  = console.log.json.bind(console, 'remove: ');
console.log.json.error   = console.log.json.bind(console, 'error: ');
console.log.str.put      = console.log.str.bind(console);
console.log.str.remove   = console.log.str.bind(console, 'remove: ');
console.log.str.error    = console.log.str.bind(console, 'error: ');

document.put = function(obj) {
  if ( obj.write ) {
    obj.write(this);
  } else {
    this.write(obj.toString());
  }
};


// Promote webkit apis; fallback on Node.js alternatives
// TODO(kgr): this should be somewhere web specific

window.requestFileSystem     = window.requestFileSystem ||
  window.webkitRequestFileSystem;
window.requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.setImmediate;
if ( window.Blob ) {
  Blob.prototype.slice = Blob.prototype.slice || Blob.prototype.webkitSlice;
}

if ( window.XMLHttpRequest ) {
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
