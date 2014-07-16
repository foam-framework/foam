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
 * State:
 */
var CONDITION = 0;
var STREAM = 1;
var SUCCESS = 2;
var FAIL = 3;

var log = console.log.bind(console);

// state = [ p, ps, success-state, fail-state ]

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

function literal(c, opt_value) {
  return function(state) {
    var ps = state[STREAM];
    for ( var i = 0; i < c.length; i++ ) {
      if ( ps.head === null ) {
        return [literal(c.substring(i), opt_value || c), ps, state[SUCCESS], state[FAIL]];
      }

      if ( ps.head === c[i] )
        ps = ps.tail;
      else
        break;
    }
    if ( i === c.length ) {
      state[SUCCESS][STREAM] = ps.setValue(opt_value || c);
      return state[SUCCESS];
    }
    state[FAIL][STREAM] = state[STREAM];
    return state[FAIL];
  };
}

function literal_ic(c, opt_value) {
  c = c.toLowerCase();
  return function(state) {
    var ps = state[STREAM]
    for ( var i = 0; i < c.length; i++ ) {
      if ( ps.head === null ) {
        return [literal(c.substring(i), opt_value || c), ps, state[SUCCESS], state[FAIL]];
      }

      if ( ps.head.toLowerCase() === c[i] )
        ps = ps.tail;
      else
        break;
    }
    if ( i === c.length ) {
      state[SUCCESS][STREAM] = ps.setValue(opt_value || c);
      return state[SUCCESS]
    }
    state[FAIL][STREAM] = state[STREAM];
    return state[FAIL];
  }
}

function range(c1, c2) {
  return function(state) {
    var ps = state[STREAM];
    if ( ps.head < c1 && ps.head > c2 ) {
      state[FAIL][STREAM] = ps;
      return state[FAIL];
    }
    state[SUCCESS][STREAM] = ps.tail.setValue(ps.head);
    return state[SUCCESS];
  };
};

function anyChar(state) {
  state[SUCCESS][STREAM] = state[STREAM].tail.setValue(state[STREAM].head);
  return state[SUCCESS];
}

function notChar(c) {
  return function(state) {
    var ps = state[STREAM];
    if ( ps.head !== c ) {
      state[SUCCESS][STREAM] = ps.tail.setValue(ps.head);
      return state[SUCCESS];
    }
    state[FAIL][STREAM] = ps;
    return state[FAIL];
  };
}

function notChars(s) {
  return function(state) {
    var ps = state[STREAM];
    if ( s.indexOf(ps.head) == -1 ) {
      state[SUCCESS][STREAM] = ps.tail.setValue(ps.head);
      return state[SUCCESS];
    }
    state[FAIL][STREAM] = ps;
    return state[FAIL];
  };
}

function not(a, opt_else) {
  a = prep(a);
  opt_else = prep(opt_else);
  return function(state) {
    return [a, state[STREAM],
            opt_else ? [opt_else, undefined, state[SUCCESS], state[FAIL]] : state[FAIL],
            state[SUCCESS]];
  };
}

function seq2(a, b) {
  a = prep(a);
  b = prep(b);
  return function(state) {
    return [a, state[STREAM], [b, undefined, state[SUCCESS], state[FAIL]], state[FAIL]];
  };
}

function seq() {
  if ( arguments.length == 1 ) return prep(arguments[0]);
  if ( arguments.legnth == 2 ) return seq2(arguments[0], arguments[1]);
  var a = seq2(arguments[arguments.length - 2], arguments[arguments.length - 1]);

  for ( var i = arguments.length - 3; i >= 0; i-- ) {
    a = seq2(arguments[i], a);
  }
  return a;
}

function optional(parser) {
  parser = prep(parser);
  return function(state) {
    return [parser, state[STREAM], state[SUCCESS], state[SUCCESS]];
  };
}

function sym(name) {
  return function(state) {
    return this[name](state);
  };
}

function alt2(a, b) {
  a = prep(a);
  b = prep(b);
  return function(state) {
    return [a, state[STREAM], state[SUCCESS], [b, undefined, state[SUCCESS], state[FAIL]]];
  };
}

function alt() {
  if ( arguments.length == 1 ) return prep(arguments[0]);
  if ( arguments.length == 2 ) return prep(arguments[1]);
  var a = alt2(arguments[arguments.length - 2], arguments[arguments.length - 1]);
  for ( var i = arguments.length - 3; i >= 0; i-- ) {
    a = alt2(arguments[i], a);
  }
  return a;
}

function fail(state) {
  state[FAIL][STREAM] = state[STREAM]
  return state[FAIL];
}

function repeat(a, opt_delim, opt_min, opt_max, i) {
  a = prep(a);
  opt_delim = prep(opt_delim) || fail;
  opt_min = opt_min || 0;
  i = i || 0;

  return function(state) {
    var fail = (i >= opt_min) ? state[SUCCESS] : state[FAIL];
    var success = (opt_max !== undefined && i === opt_max - 1) ?
      state[SUCCESS] :
      [repeat(a, opt_delim, opt_min, opt_max, i + 1),
       null, state[SUCCESS], state[FAIL]];

    return [
      opt_delim,
      state[STREAM],
      fail,
      [a,
       state[STREAM],
       success,
       fail
       ]
    ];
  };
}

function plus(a) { return repeat(a, undefined, 1); }

var grammar = {
  // Special end state indicator
  END: [],

  parseMore: function(str) {
    var ps = StringPS.create(str);
    this.state[STREAM] = ps;
    return this.parse();
  },
  parseString: function(str) {
    var ps = StringPS.create(str);
    this.state = [this.START, ps, this.END, this.END];
    return this.parse();
  },
  // Pumps the state machine until termination or more data needed.
  parse: function() {
    while ( this.state ) {
      if ( this.state === this.END ) {
        break;
      }

      if ( this.state[STREAM].head === null ) {
        return;
      }

      this.state = this.state[CONDITION].call(this, this.state);
    }
    return this.state[STREAM].value;
  },
  addAction: function(sym, action) {
    var old = this[sym];
    var wrapper = function(state) {
      action(state[STREAM].value);
      state[SUCCESS][STREAM] = state[STREAM];
      return state[SUCCESS];
    };

    this[sym] = function(state) {
      return [old, state[STREAM], [wrapper, undefined, state[SUCCESS], undefined], [state[FAIL]]];
    };
    return this;
  },
  addActions: function(map) {
    for ( var key in map ) this.addAction(key, map[key]);
    return this;
  }
};

var TestGrammar = {
  __proto__: grammar,

  START: seq(repeat("a", "delim"),'a', sym('middle'), sym('end')),
  middle: alt("b", "c"),
  end: literal("dddd")
}.addActions({
  middle: function(value) {
    console.log("Middle is: ", value);
  }
});

//log(TestGrammar.parseString("aaaabdddd"));
TestGrammar.parseString("aadelima");
TestGrammar.parseMore("bd");
TestGrammar.parseMore("dd");
log(TestGrammar.parseMore("d"));
