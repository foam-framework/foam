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
    var o = Object.create(this);
    o.pos = 0;
    o.str_ = [str];
    o.tail_ = [];
    return o;
  },
  set str(str) { this.str_[0] = str; },
  get head() { return this.pos >= this.str_[0].length ? null : this.str_[0].charAt(this.pos); },
  // TODO(kgr): next line is slow because it can't bet JITed, fix.
  get value() { return this.hasOwnProperty('value_') ? this.value_ : this.str_[0].charAt(this.pos-1); },
  get tail() {
    if ( ! this.tail_[0] ) {
      var tail = Object.create(this.__proto__);
      tail.str_ = this.str_;
      tail.pos = this.pos+1;
      tail.tail_ = [];
      this.tail_[0] = tail;
    }
    return this.tail_[0];
  },
  setValue: function(value) {
    var ret = Object.create(this.__proto__);

    ret.str_ = this.str_;
    ret.pos = this.pos;
    ret.tail_ = this.tail_;
    ret.value_ = value;

    return ret;
  },
  toString: function() {
    return this.str_[0].substring(this.pos);
  }
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

var literal = (function() {
  // Cache of literal parsers, which repeat a lot
  var cache = {};

  return function(str, opt_value) {
    if ( ! opt_value && cache[str] ) return cache[str];

    var f;
    if ( str.length === 1 ) {
      f = function(ps) {
      return str === ps.head ? ps.tail.setValue(opt_value || str) : undefined;
    };
    } else {
      f = function(ps) {
        for ( var i = 0 ; i < str.length ; i++, ps = ps.tail ) {
          if ( str.charAt(i) !== ps.head ) return undefined;
        }

        return ps.setValue(opt_value || str);
      };
    }

    f.toString = function() { return '"' + str + '"'; };

    if ( ! opt_value ) return cache[str] = f;

    return f;
  };
})();

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

var alphaChar    = alt(range('a','z'), range('A', 'Z'));
var alphaNumChar = alt(alphaChar, range('0', '9'));
var wordChar     = alt(alphaNumChar, '_');

function anyChar(ps) {
  return ps.head ? ps.tail/*.setValue(ps.head)*/ : undefined;
}

function fail(ps) {
  return undefined;
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
      opt_else ? this.parse(opt_else, ps) : ps;
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

function plus(p, opt_delim) { return repeat(p, opt_delim, 1); }

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

  var f = function(ps) {
    var res;
    while ( res = this.parse(p, ps) ) ps = res;
    return ps.setValue('');
  };

  f.toString = function() { return 'repeat0(' + p + ')'; };

  return f;
}

/** A repeat-at-least-once which doesn't build an array of parsed values. **/
function plus0(p) {
  p = prep(p);

  var f = function(ps) {
    var res;
    if ( ! (res = this.parse(p, ps)) ) return undefined;
    ps = res;
    while ( res = this.parse(p, ps) ) ps = res;
    return ps.setValue('');
  };

  f.toString = function() { return 'repeat0(' + p + ')'; };

  return f;
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

var parserVersion_ = 1;
function invalidateParsers() {
  parserVersion_++;
}

function simpleAlt(/* vargs */) {
//function alt(/* vargs */) {
  var args = prepArgs(arguments);

  if ( args.length == 1 ) return args[0];

  var f = function(ps) {
    for ( var i = 0 ; i < args.length ; i++ ) {
      var res = this.parse(args[i], ps);

      if ( res ) return res;
    }

    return undefined;
  };

  f.toString = function() { return 'simpleAlt(' + argsToArray(args).join(' | ') + ')'; };

  return f;
}

var TrapPStream = {
  create: function(ps) {
    return {
      __proto__: this,
      head: ps.head,
      value: ps.value,
      goodChar: false
    };
  },
  getValue: function() { return this.value; },
  setValue: function(v) { this.value = v; return this; },
  get tail() {
    this.goodChar = true;
    return {
      value: this.value,
      getValue: function() { return this.value; },
      setValue: function(v) { this.value = v; }
    };
  }
};

function alt(/* vargs */) {
  var SIMPLE_ALT = simpleAlt.apply(null, arguments);
  var args = prepArgs(arguments);
  var map  = {};
  var parserVersion = parserVersion_;

  function nullParser() { return undefined; }

  function testParser(p, ps) {
    var trapPS = TrapPStream.create(ps);
    this.parse(p, trapPS);

    // console.log('*** TestParser:',p,c,goodChar);
    return trapPS.goodChar;
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

  var f = function(ps) {
    if ( parserVersion !== parserVersion_ ) {
      map = {};
      parserVersion = parserVersion_;
    }
    var r1 = this.parse(getParserForChar.call(this, ps), ps);
    // If alt and simpleAlt don't return same value then uncomment this
    // section to find out where the problem is occuring.
    /*
    var r2 = this.parse(SIMPLE_ALT, ps);
    if ( ! r1 !== ! r2 ) debugger;
    if ( r1 && ( r1.pos !== r2.pos ) ) debugger;
    */
    return r1;
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

  parseString: function(str, opt_start) {
    var ps = this.stringPS;
    ps.str = str;
    var res = this.parse(opt_start || this.START, ps);

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


// TODO(kgr): move this somewhere better
function defineTTLProperty(obj, name, ttl, f) {
  obj.__defineGetter__(name, function() {
    var accessed;
    var value = undefined;
    this.__defineGetter__(name, function() {
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
    });

    return this[name];
  });
}

defineTTLProperty(grammar, 'stringPS', 30000, function() { return StringPS.create(''); });


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

// TODO: move this out of Core
