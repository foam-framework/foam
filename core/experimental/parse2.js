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

function seq(a, b) {
  a = prep(a);
  b = prep(b);
  return function(state) {
    return [a, state[STREAM], [b, undefined, state[SUCCESS], state[FAIL]], state[FAIL]];
  };
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

function alt(a, b) {
  a = prep(a);
  b = prep(b);
  return function(state) {
    return [a, state[STREAM], state[SUCCESS], [b, undefined, state[SUCCESS], state[FAIL]]];
  };
}

// TODO: Resuming in the middle of a literal

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

  START: seq("aaaa", seq(sym('middle'), sym('end'))),
  middle: alt("b", "c"),
  end: literal("dddd")
}.addActions({
  middle: function(value) {
    console.log("Middle is: ", value);
  }
});

//log(TestGrammar.parseString("aaaabdddd"));

TestGrammar.parseString("aa");
TestGrammar.parseMore("aa");
TestGrammar.parseMore("bd");
TestGrammar.parseMore("dd");
log(TestGrammar.parseMore("d"));
