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
