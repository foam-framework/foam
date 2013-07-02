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

// Experimental protocol buffer support, including binary parsing.

var BinaryPS = {
  create: function(bytearray) {
    if (bytearray instanceof ArrayBuffer) bytearray = new Uint8Array(bytearray);
    return {
      __proto__: this,
      pos: 0,
      view_: [bytearray],
      tail_: []
    };
  },
  get head() { return this.pos >= this.view_[0].length ? null : this.view_[0][this.pos]; },
  get value() { return this.hasOwnProperty('value_') ? this.value_ : this.view_[0][this.pos-1]; },
  get tail() { return this.tail_[0] || ( this.tail_[0] = { __proto__: this.__proto__, view_: this.view_, pos: this.pos + 1, tail_: [] } ); },
  setValue: function (value) { return { __proto__: this.__proto__, pos: this.pos, view_: this.view_, tail_: this.tail_, value_: value }; }
};

var LimitedPS = {
  create: function(ps, limit) {
    return {
      __proto__: this,
      pos: 0,
      limit: limit,
      tail_: [],
      ps: [ps]
    };
  },
  get head() { return this.pos >= this.limit ? null : this.ps[0].head },
  get value() { return this.ps[0].value; },
  get tail() { return this.tail_[0] || (this.tail_ = { __proto__: this.__proto__, ps: [this.ps[0].tail], pos: this.pos + 1, tail_: [], limit: this.limit } ); },
  setValue: function(value) { return { __proto__: this.__proto__, pos: this.pos, limit: this.limit, ps: [this.ps[0].setValue(value)], tail_: this.tail_ }; }
};

// parse a protocol buffer varint
// Verifies that it matches the given value if opt_value is specified.
function varint(opt_value) {
  return function(ps) {
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
      res |= parts[i] << (7 * i);
    }
    if ((opt_value != undefined) && res != opt_value) return undefined;
    return ps.setValue(res);
  };
}

// Parses a varint and returns a hex string.  Used for field too big
// for js to handle as Numbers.
function varintstring(opt_value) {
  return function(ps) {
    var parts = [];
    var rest = 0;
    while(ps) {
      var b = ps.head;
      if (b == null) return undefined;
      var str = b.toString(16);
      if (str.length == 1) str = "0" + str;
      parts.push(str);
      ps = ps.tail;
      if (!(b & 0x80)) break; // Break when MSB is not 1, indicating end of a varint.
    }
    var result = parts.join('');
    if (opt_value && result !== opt_value) return undefined;
    return ps.setValue(result);
  };
}

// Parses a varintkey which is (varint << 3) | type
// Verifies that the value and type match if specified.
function varintkey(opt_value, opt_type) {
  var p = varint();
  return function(ps) {
    if (!(ps = this.parse(p, ps))) return undefined;
    var type = ps.value & 7;
    var value = ps.value >> 3
    if ((opt_value != undefined && opt_value != value) ||
        (opt_type != undefined && opt_type != type))  return undefined
    return ps.setValue([value, type]);
  }
}

function toboolean(p) {
  return function(ps) {
    if ( ! (ps = this.parse(p, ps)) ) return undefined;
    return ps.setValue( !! ps.value);
  }
}

function index(i, p) {
    return function(ps) {
        if (!(ps = this.parse(p, ps))) return undefined;
        return ps.setValue(ps.value[i]);
    }
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
  return function(ps) {
    if ( ! (ps = this.parse(header, ps))) return undefined;
    var oldvalue = ps.value;
    var length = oldvalue[1];
    if ( ! (ps = this.parse(repeat(anyChar, undefined, length, length), ps))) return undefined;
    return ps.setValue([oldvalue[0], ps.value]);
  }
}

function protobytes0(tag) {
  var header = seq(varintkey(tag, 2), varint());
  return function(ps) {
    if ( ! (ps = this.parse(header, ps))) return undefined;
    var oldvalue = ps.value;
    var length = oldvalue[1];
    while(length--) ps = ps.tail;
    return ps.setValue([oldvalue, undefined]);
  }
}

function protostring(tag) {
  var data = protobytes(tag);
  return function(ps) {
    if (!(ps = this.parse(data, ps))) return undefined;
    var str = utf8tostring(ps.value[1]);
    return str ? ps.setValue([ps.value[0], str]) : undefined;
  };
}

function protomessage(tag, opt_p) {
  var header = seq(varintkey(tag, 2), varint());
  return function(ps) {
    if (!(ps = this.parse(header, ps))) return undefined;
    var key = ps.value[0];
    var length = ps.value[1];
    opt_p = opt_p || repeat(anyChar);
    var start = ps.pos;
    var limitedps = LimitedPS.create(ps, length);
    if (!(limitedps = this.parse(opt_p, limitedps))) return undefined;
    return limitedps.ps[0].setValue([key, limitedps.ps[0].value]);
  };
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
    return res && res.value;
  },

  'unknown field': alt(
      protouint32(),
      protobytes0())
};
