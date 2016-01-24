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

var DEBUG = DEBUG || false;
var _DOC_ = _DOC_ || false;
var FLAGS = FLAGS || {};
FLAGS.javascript = true;
FLAGS.debug = DEBUG;
FLAGS.documentation = _DOC_;

function FEATURE_ENABLED(labels) {
  for ( var i = 0 ; i < labels.length ; i++ ) {
    if ( FLAGS[labels[i]] ) return true;
  }
}

var GLOBAL = GLOBAL || this;

function MODEL(model) {
  var proto;

  function defineProperty(proto, key, map) {
    if ( ! map.value || proto === Object.prototype || proto === Array.prototype )
      Object.defineProperty.apply(this, arguments);
    else
      proto[key] = map.value;
  }

  if ( model.name ) {
    if ( ! GLOBAL[model.name] ) {
      if ( model.extends ) {
        GLOBAL[model.name] = { __proto__: GLOBAL[model.extends] };
      } else {
        GLOBAL[model.name] = {};
      }
    }
    proto = GLOBAL[model.name];
  } else {
    proto = model.extendsProto ? GLOBAL[model.extendsProto].prototype :
                                 GLOBAL[model.extendsObject] ;
  }

  if ( model.properties ) {
    for ( var i = 0 ; i < model.properties.length ; i++ ) {
      var p = model.properties[i];
      defineProperty(
        proto,
        p.name,
        { get: p.getter, enumerable: false });
    }
  }

  for ( key in model.constants )
    defineProperty(
      proto,
      key,
      { value: model.constants[key], writable: true, enumerable: false });

  if ( Array.isArray(model.methods) ) {
    for ( var i = 0 ; i < model.methods.length ; i++ ) {
      var m = model.methods[i];
      defineProperty(
        proto,
        m.name,
        { value: m, writable: true, enumerable: false });
    }
  } else {
    for ( var key in model.methods )
      defineProperty(
        proto,
        key,
        { value: model.methods[key], writable: true, enumerable: false });
  }
}

var MODEL0 = MODEL;

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
      /** Faster version of memoize() when only dealing with one argument. **/
      var cache = {};
      var g = function(arg) {
        var key = arg ? arg.toString() : '';
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

    function latchFn(f) {
      var tripped = false;
      var val;
      /* Create a function which always returns the supplied constant value. */
      return function() {
        if ( ! tripped ) {
          tripped = true;
          val = f();
          f = undefined;
        }
        return val;
      };
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

    function equals(a, b) {
      if ( a === b ) return true;
      if ( ! a || ! b ) return false;
      if ( a.equals ) return a.equals(b);
      return a == b;
    },

    function compare(a, b) {
      if ( a === b   ) return 0;
      if ( a == null ) return -1;
      if ( b == null ) return  1;
      if ( a.compareTo ) return  a.compareTo(b);
      if ( b.compareTo ) return -b.compareTo(a);
      return a > b ? 1 : -1 ;
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
      for ( var key in obj ) if ( obj.hasOwnProperty(key) ) fn(obj[key], key);
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
        reset: function() {
          sink.reset && sink.reset();
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
        $UID: sink.$UID,
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
        $UID: sink.$UID,
        put: function(obj, s, fc) {
          if ( i++ >= skip ) sink.put(obj, s, fc);
        }
      };
    },

    function orderedSink(comparator, sink) {
      comparator = toCompare(comparator);
      return {
        __proto__: sink,
        $UID: sink.$UID,
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
      if ( typeof f === 'string' ) return f;
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
    },

    function createGUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    }
  ]
});

var labelize = memoize1(function(str) {
  if ( str === '' ) return str;
  return capitalize(str.replace(/[a-z][A-Z]/g, function (a) { return a.charAt(0) + ' ' + a.charAt(1); }));
});

var constantize = memoize1(function(str) {
  // switchFromCamelCaseToConstantFormat to SWITCH_FROM_CAMEL_CASE_TO_CONSTANT_FORMAT
  // TODO: add property to specify constantization. For now catch special case to avoid conflict with context this.X and this.Y.
  if ( str === 'x' ) return 'X_';
  if ( str === 'y' ) return 'Y_';
  if ( str === '$' ) return '$_';
  return str.replace(/[a-z][^0-9a-z_]/g, function(a) {
    return a.substring(0,1) + '_' + a.substring(1,2);
  }).toUpperCase();
});

var capitalize = memoize1(function(str) {
  // switchFromProperyName to //SwitchFromPropertyName
  return str[0].toUpperCase() + str.substring(1);
});

var camelize = memoize1(function (str) {
  // change css-name-style or 'space separated words' to camelCase
  var ret = str.replace (/(?:[-\s_])(\w)/g, function (_, a) {
    return a ? a.toUpperCase () : '';
  });
  return ret[0].toLowerCase() + ret.substring(1);
});

var daoize = memoize1(function(str) {
  // Changes ModelName to modelNameDAO for relationships, reference properties, etc.
  return str[0].toLowerCase() + str.substring(1) + 'DAO';
});

// Replaces . with -, for eg. foam.u2.md.Input -> foam-u2-md-Input
var cssClassize = memoize1(function (str) {
  return str.replace(/\./g, '-');
});


MODEL({
  extendsProto: 'Object',

  properties: [
    {
      name: '$UID',
      getter: (function() {
        var id = 1;
        return function() {
          if ( Object.hasOwnProperty.call(this, '$UID__') ) return this.$UID__;
          this.$UID__ = id;
          id++;
          return this.$UID__;
        };
      })()
    }
  ],

  methods: [
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
    function clone() { return this.slice(); },

    function deepClone() {
      var a = this.clone();
      for ( var i = 0 ; i < a.length ; i++ ) {
        var o = a[i];
        if ( o ) {
          if ( o.deepClone ) {
            a[i] = o.deepClone();
          } else if ( o.clone ) {
            a[i] = o.clone();
          }
        }
      }
      return a;
    },

    function forEach(f, opt_this) {
      /* Replace Array.forEach with a faster version. */
      if ( ! this || ! f || opt_this ) return this.oldForEach_.call(this, f, opt_this);

      var l = this.length;
      for ( var i = 0 ; i < l ; i++ ) f(this[i], i, this);
    },

    function diff(other) {
      var added = other.slice(0);
      var removed = [];
      for ( var i = 0 ; i < this.length ; i++ ) {
        for ( var j = 0 ; j < added.length ; j++ ) {
          if ( this[i].compareTo(added[j]) == 0 ) {
            added.splice(j, 1);
            j--;
            break;
          }
        }
        if ( j == added.length ) removed.push(this[i]);
      }
      return { added: added, removed: removed };
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

    // Clone this Array and remove 'v' (only 1 instance)
    // TODO: make faster by copying in one pass, without splicing
    function deleteF(v) {
      var a = this.clone();
      for ( var i = 0 ; i < a.length ; i++ ) {
        if ( a[i] === v ) {
          a.splice(i, 1);
          break;
        }
      }
      return a;
    },

    // Remove 'v' from this array (only 1 instance removed)
    // return true iff the value was removed
    function deleteI(v) {
      for ( var i = 0 ; i < this.length ; i++ ) {
        if ( this[i] === v ) {
          this.splice(i, 1);
          return true;
        }
      }
      return false;
    },

    // Clone this Array and remove first object where predicate 'p' returns true
    function removeF(p) {
      var a = [];
      for ( var i = 0 ; i < a.length ; i++ ) {
        if ( p.f(a[i]) ) {
          // Copy the rest of the array since we only want to remove one match
          for ( i++ ; i < a.length ; i++ ) a.push(a[i]);
        }
      }
      return a;
    },

    // Remove first object in this array where predicate 'p' returns true
    // return true iff the value was removed
    function removeI(p) {
      for ( var i = 0 ; i < this.length ; i++ ) {
        if ( p.f(this[i]) ) {
          this.splice(i, 1);
          return true;
        }
      }
      return false;
    },

    function pushF(obj) {
      var a = this.clone();
      a.push(obj);
      return a;
    },

    function spliceF(start, end /*, args */) {
      /** Functional version of splice. **/
      var r = [], i;

      for ( i = 0   ; i < start             ; i++ ) r.push(this[i]);
      for ( i = 2   ; i < arguments.length  ; i++ ) r.push(arguments[i]);
      for ( i = start+end ; i < this.length ; i++ ) r.push(this[i]);

      return r;
    },

    function fReduce(comparator, arr) {
      compare = toCompare(comparator);
      var result = [];

      var i = 0;
      var j = 0;
      var k = 0;
      while ( i < this.length && j < arr.length ) {
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
      for ( var i = 0 ;  i < this.length ; i++ ) {
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
  ],

  properties: [
    {
      name: 'memento',
      getter: function() {
        throw "Array's can not be memorized properly as a memento.";
      }
    }
  ]
});


MODEL({
  extendsProto: 'String',

  methods: [
    function indexOfIC(a) {
      return ( a.length > this.length ) ? -1 : this.toUpperCase().indexOf(a.toUpperCase());
    },

    function equals(other) { return this.compareTo(other) === 0; },

    function equalsIC(other) { return other && this.toUpperCase() === other.toUpperCase(); },

    // deprecated, use global instead
    function capitalize() { return this.charAt(0).toUpperCase() + this.slice(1); },

    // deprecated, use global instead
    function labelize() {
      return this.replace(/[a-z][A-Z]/g, function (a) { return a.charAt(0) + ' ' + a.charAt(1); }).capitalize();
    },

    function compareTo(o) { return ( o == this ) ? 0 : this < o ? -1 : 1; },

    // Polyfil
    String.prototype.startsWith || function startsWith(a) {
      // This implementation is very slow for some reason
      return 0 == this.lastIndexOf(a, 0);
    },

    // Polyfil
    String.prototype.endsWith || function endsWith(a) {
      return (this.length - a.length) == this.lastIndexOf(a);
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
        if ( arguments.length == 1 ) return simpleBind(this, arg);
        var args = new Array(arguments.length);
        for ( var i = 0 ; i < arguments.length ; i++ ) args[i] = arguments[i];
        return oldBind.apply(this, args);
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
  extendsObject: 'Math',

  methods: [
    function sign(n) { return n > 0 ? 1 : -1; }
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
        var noyear = this.toDateString().replace(' ' + year, '');
        return noyear.substring(4);
      }

      return this.toDateString().substring(4);
    },

    function equals(o) {
      if ( ! o ) return false;
      if ( ! o.getTime ) return false;
      return this.getTime() === o.getTime();
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
    obj.write(this.X);
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
    if ( arguments.length == 1 ) return lookupTable[a] || (lookupTable[a] = oldLookup(a));
    var result = '';
    for ( var i = 0 ; i < arguments.length ; i++ )
      result += lookupTable[arguments[i]] || (lookupTable[arguments[i]] = oldLookup(arguments[i]));
    return result;
  };
})();

var MementoProto = {};
Object.defineProperty(MementoProto, 'equals', {
  enumerable: false,
  configurable: true,
  value: function(o) {
    var keys = Object.keys(this);
    var otherKeys = Object.keys(o);
    if ( keys.length != otherKeys.length ) {
      return false;
    }
    for ( var i = 0 ; i < keys.length ; i++ ) {
      if ( ! equals(this[keys[i]], o[keys[i]]) )
        return false;
    }
    return true;
  }
});
