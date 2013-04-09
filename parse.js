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
  get value() { return this.value_ || this.str_[0].charAt(this.pos-1); },
  get tail() { return /*this.pos >= this.str_[0].length ? this : */this.tail_[0] || ( this.tail_[0] = { __proto__: this.__proto__, str_: this.str_, pos: this.pos+1, tail_: [] } ); },
  setValue: function(value) { return { __proto__: this.__proto__, str_: this.str_, pos: this.pos, tail_: this.tail_, value_: value }; }
};

var BinaryPS = {
  create: function(bytearray) {
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
  return function(ps) {
    if ( ! ps.head ) return undefined;
    if ( ps.head < c1 || ps.head > c2 ) return undefined;
    return ps.tail.setValue(ps.head);
  };
}

function literal(str) {
  return function(ps) {
    for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
      if ( str.charAt(i) !== ps.head ) return undefined;
    }

    return ps.setValue(str);
  };
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
  return function(ps) {
    return this.parse(p,ps) ? undefined :
      opt_else ? this.parse(opt_else, ps) :
      ps;
  };
}

function optional(p) {
  p = prep(p);
  return function(ps) { return this.parse(p,ps) || ps.setValue(undefined); };
}

function repeat(p, opt_delim, opt_min, opt_max) {
  p = prep(p);
  opt_delim = prep(opt_delim);

  return function(ps) {
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
}

function plus(p) { return this.repeat(p, undefined, 1); }

/** A simple repeat which doesn't build an array of parsed values. **/
function repeat0(p) {
  p = prep(p);

  return function(ps) {
    while ( true ) {
      var res;

      if ( ! ( res = this.parse(p,ps) ) ) break;

      ps = res;
    }

    return ps;
  };
}

function seq(/* vargs */) {
  var args = prepArgs(arguments);

  return function(ps) {
    var ret = [];

    for ( var i = 0 ; i < args.length ; i++ ) {
      if ( ! ( ps = this.parse(args[i], ps) ) ) return undefined;
      ret.push(ps.value);
    }

    return ps.setValue(ret);
  };
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

  return function(ps) {
    for ( var i = 0 ; i < args.length ; i++ ) {
      var res = this.parse(args[i], ps);

      if ( res ) return res;
    }

    return undefined;
  };
}

// parse a protocol buffer varint
// Verifies that it matches the given value if opt_value is specified.
function varint(opt_value) {
  return function(ps) {
    var parts = [];
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

function protouint32(tag) {
  return seq(varintkey(tag, 0), varint());
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
    var length = ps.value[1];
    return this.parse(repeat(anyChar, undefined, length, length), ps);
  }
}

// WARNING: This is a very primitive UTF-8 decoder it probably has bugs.
function protostring(tag) {
  tag = varintkey(tag, 2);
  var length = varint();
  return function(ps) {
    if ( ! (ps = this.parse(tag, ps)) ) return undefined;
    if ( ! (ps = this.parse(length, ps)) ) return undefined;
    var size = ps.value;

    var first;
    var chars = [];
    var j = 0;
    for (var i = 0; i < size; i++) {
      var buffer = []
      if ( !ps ) return undefined;
      buffer[0] = ps.head;
      ps = ps.tail;
      var remaining;
      if (!(buffer[0] & 0x80)) {
        remaining = 0;
        buffer[0] &= 0x7f;
      } else if ((buffer[0] & 0xe0) == 0xc0) {
        remaining = 1;
        buffer[0] &= 0x1f;
      } else if ((buffer[0] & 0xf0) == 0xe0) {
        remaining = 2;
        buffer[0] &= 0x0f;
      } else if ((buffer[0] & 0xf8) == 0xf0) {
        remaining = 3;
        buffer[0] &= 0x07;
      } else if ((buffer[0] & 0xfc) == 0xf8) {
        remaining = 4;
        buffer[0] &= 0x03;
      } else if ((buffer[0] & 0xfe) == 0xfc) {
        remaining = 5;
        buffer[0] &= 0x01;
      } else return undefined;

      for (var j = 0; j < remaining && j + i < size; j++) {
        if ( ! ps ) return undefined;
        buffer.unshift(ps.head);
        ps = ps.tail;
      }
      i += j;
      var charcode = 0;
      for (var k = 0; k < buffer.length; k++) {
        charcode |= (buffer[k] & 0x7f) << (6 * k);
      }
      chars.push(charcode);
    }
    // NOTE: Turns out fromCharCode can't handle all unicode code points.
    // We need fromCodePoint from ES 6 before this will work properly.
    return ps.setValue(String.fromCharCode.apply(undefined, chars));
  };
}

function protomessage(tag, opt_p) {
  var header = seq(varintkey(tag, 2), varint());
  return function(ps) {
    if (!(ps = this.parse(header, ps))) return undefined;
    var length = ps.value[1];
    opt_p = opt_p || repeat(anyChar);
    var start = ps.pos;
    var limiter = {
      __proto__: this,
      parse: function(parser, pstream) {
        if (pstream.pos == start + length) return undefined;
        return parser.call(this, pstream);
      }
    };
    return limiter.parse(opt_p, ps);
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

// alt = simpleAlt;

function sym(name) { return function(ps) {
  var p = this[name];

  if ( ! p ) console.log('PARSE ERROR: Unknown Symbol <' + name + '>');

  return this.parse(p, ps);
};}

// This isn't any faster because V8 does the same thing already.
// function sym(name) { var p; return function(ps) { return (p || ( p = this[name])).call(this, ps); }; }


// function sym(name) { return function(ps) { var ret = this[name](ps); console.log('<' + name + '> -> ', !! ret); return ret; }; }

var grammar = {
  parseString: function(str) {
    if ( ! this.hasOwnProperty('stringPS') ) this.stringPS = StringPS.create("");

    var ps = this.stringPS;
    ps.str = str;
    var res = this.parse(this.START, ps);

    return res && res.value;
  },

  parse: function(parser, pstream) {
 //   console.log('parser: ', parser, 'stream: ',pstream);
    return parser.call(this, pstream);
  },

  /** Export a symbol for use in another grammar or stand-alone. **/
  export: function(str) { 
    return this[str].bind(this);
  },

  addAction: function(sym, action) {
    var p = this[sym];
    this[sym] = function(ps) {
      var ps2 = this.parse(p, ps);

      return ps2 && ps2.setValue(action.call(this, ps2.value, ps.value));
    };
  },

  addActions: function(map) {
    for ( var key in map ) this.addAction(key, map[key]);

    return this;
  }
};

var binarygrammar = {
  __proto__: grammar,

  parseArrayBuffer: function(ab) {
    var ps = BinaryPS.create(ab);
    var res = this.parse(this.START, ps);
    return res && res.value;
  }
};
