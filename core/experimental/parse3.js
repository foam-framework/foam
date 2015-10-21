/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
var CONDITION = 0;
var STREAM = 1;
var SUCCESS = 2;
var FAIL = 3;
var PAYLOAD = 4;

var EOF = {};

Function.prototype.desc = function(d) {
  this.toString = function() { return d; };
  return this;
}

var StringPS = {
  create: function(str) {
    var o = Object.create(this);
    o.pos = 0;
    o.str_ = [str];
    o.tail_ = [];
    return o;
  },
  set str(str) { this.str_[0] = str; },
  get head() { return this.pos >= this.str_[0].length ? EOF : this.str_[0].charAt(this.pos); },
  // TODO(kgr): next line is slow because it can't bet JITed, fix.
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
  toString: function() {
    return this.str_[0].substring(this.pos);
  }
};

function HEAD(state) {
  return state[STREAM].head;
}

function COPY_STATE(state, ps) {
  if ( state[CONDITION] === "END" ||
       state[CONDITION] === "END_FAIL" )
    return state;
  return [
    state[CONDITION],
    ps,
    state[SUCCESS],
    state[FAIL],
    state[PAYLOAD]
  ];
}

function TAIL(state) {
  return state[STREAM].tail;
}

function VALUE(state, value) {
  state[PAYLOAD] && state[PAYLOAD](value);
}

function COLLECT(state, f) {
  if ( state[PAYLOAD] ) {
    return f;
  }
}

function DO_SUCCESS(state, ps) {
//  if ( ! state[SUCCESS][STREAM] )
  //    state[SUCCESS][STREAM] = ps;
  if ( typeof state[SUCCESS] === "function" )
    return state[SUCCESS](ps);
  if ( ! state[SUCCESS][STREAM] ) state[SUCCESS][STREAM] = ps;
  return state[SUCCESS];
}

function DO_FAIL(state, ps) {
//  if ( ! state[FAIL][STREAM] )
//    state[FAIL][STREAM] = ps;
  if ( typeof state[FAIL] === "function" )
    return state[FAIL](ps);
  if ( ! state[FAIL][STREAM] ) state[FAIL][STREAM] = ps;
  return state[FAIL];
}

function char(c) {
  return function(state) {
    if ( HEAD(state) == c ) {
      VALUE(state, c);
      return DO_SUCCESS(state, TAIL(state));
    }
    return DO_FAIL(state, state[STREAM])
  }
}

function char_ic(c) {
  c = c.toLowerCase();
  return function(state) {
    if ( HEAD(state).toLowerCase() == c ) {
      VALUE(state, HEAD(state));
      return DO_SUCCESS(state, TAIL(state));
    }
    return DO_FAIL(state, state[STREAM]);
  }
}

function xxliteral(str, opt_value) {
  var s = [];
  for ( var i = 0; i < str.length ; i++ ) {
    s.push(char(str[i]));
  }
  return seq.apply(null, s);
}

function literal(str, opt_value) {
  return function(state) {
    var i = 0;
    var ps = state[STREAM];
    var c = ps.head;
    while ( c != null && i < str.length ) {
      if ( str.charAt(i) !== c) {
        return DO_FAIL(state, state[STREAM]);
      }
      ps = ps.tail;
      c = ps.head;
      i++;
    }
    if ( c == null ) {
      debugger;
      return [
        literal(str.subtring(i), opt_value || str),
        ps,
        state[SUCCESS],
        state[FAIL],
        state[PAYLOAD]
      ];
    }
    VALUE(state, opt_value || str);
    return DO_SUCCESS(state, ps);
  };
}

function literal_ic(str, opt_value) {
  var s = [];
  for ( var i = 0 ; i < str.length ; i++ ) {
    s.push(char_ic(str[i]));
  }
  return seq.apply(null, s);
}

function range(c1, c2) {
  return function(state) {
    if ( HEAD(state) >= c1 && HEAD(state) <= c2 ) {
      VALUE(state, HEAD(state));
      return DO_SUCCESS(state, TAIL(state));
    }
    return DO_FAIL(state, state[STREAM]);
  };
}

function anyChar(state) {
  if ( HEAD(state) == EOF )
    return DO_FAIL(state, state[STREAM]);

  VALUE(state, HEAD(state));
  return DO_SUCCESS(state, TAIL(state));
}

function notChars(str) {
  return function(state) {
    if ( HEAD(state) != EOF &&
         str.indexOf(HEAD(state)) == -1 ) {
      VALUE(state, HEAD(state));
      return DO_SUCCESS(state, TAIL(state));
    }
    return DO_FAIL(state, state[STREAM]);
  }
}

function notChar(c) {
  return notChars(c);
}

function pass(state) {
  VALUE(state);
  return DO_SUCCESS(state, state[STREAM]);
}

function fail(state) {
  return DO_FAIL(state, state[STREAM]);
}

function prep(a) {
  if ( typeof a == "string" ) return literal(a);
  return a;
}

function seq2(a, b) {
  a = prep(a);
  b = prep(b);
  return function(state) {
    var tmp;
    return [
      a,
      state[STREAM],
      [
        b,
        null, // Need STREAM after b is done with it
        state[SUCCESS],
        state[FAIL],
        function(v) {
          VALUE(state, [tmp, v]);
        }
      ],
      state[FAIL],
      COLLECT(state, function(v) {
        tmp = v;
      })
    ];
  }
}

function alt2(a, b) {
  a = prep(a);
  b = prep(b);
  return function(state) {
    return [
      a,
      state[STREAM],
      state[SUCCESS],
      [
        b,
        state[STREAM],
        state[SUCCESS],
        state[FAIL],
        state[PAYLOAD]
      ],
      state[PAYLOAD]
    ];
  };
}


function not(a, opt_else) {
  a = prep(a);
  opt_else = prep(opt_else);

  if ( ! opt_else ) {
    return function(state) {
      return [
        a,
        state[STREAM],
        COPY_STATE(state[FAIL], state[STREAM]),
        COPY_STATE(state[SUCCESS], state[STREAM])
      ];
    }
  }

  return function(state) {
    return [
      a,
      state[STREAM],
      COPY_STATE(state[FAIL], state[STREAM]),
      [
        opt_else,
        null,
        state[SUCCESS],
        state[FAIL],
        state[PAYLOAD]
      ]
    ]
  };
}

function compose_pairs(args, p) {
  for ( var i = 0 ; i < args.length ; i++ ) {
    args[i] = prep(args[i]);
  }

  if ( args.length == 0 ) return pass;
  if ( args.length == 1 ) return args[0];
  if ( args.length == 2 ) return p(args[0], args[1]);

  var v = p(args[args.length - 2], args[args.length - 1]);

  for ( var i = args.length - 3 ; i >= 0 ; i-- ) {
    v = p(args[i], v);
  }

  return v;
}

function alt() {
  return compose_pairs(arguments, alt2);
}

function seq() {
  return compose_pairs(arguments, seq2);
}

function optional(a) {
  a = prep(a);
  return function(state) {
    return [
      a,
      state[STREAM],
      state[SUCCESS],
      state[SUCCESS],
      state[PAYLOAD]
    ];
  }
}

function repeat(a, opt_delim, opt_min, opt_max) {
  if ( opt_delim === undefined ) {
    if ( opt_min === undefined ) {
      if ( opt_max === undefined ) {
        return repeat_basic(a);
      } else {
        return repeat_max(a, opt_max);
      }
    } else {
      if ( opt_max === undefined ) {
        return repeat_min(a, opt_min);
      } else {
        return repeat_min_max(a, opt_min, opt_max);
      }
    }
  } else {
    if ( opt_min === undefined ) {
      if ( opt_max === undefined ) {
        return repeat_basic_delim(a, opt_delim);
      } else {
        return repeat_max_delim(a, opt_delim, opt_max);
      }
    } else {
      if ( opt_max === undefined ) {
        return repeat_min_delim(a, opt_delim, opt_min);
      } else {
        return repeat_min_max_delim(a, opt_delim, opt_min, opt_max);
      }
    }
  }
}

function repeat_max(a, opt_max) {
  var s = [];
  for ( var i = 0 ; i < opt_max ; i++ ) {
    s.push([
      a
    ]);
  };
  var i = 0;
  return function(state) {
    var current = s[i];

  }
}

function repeat_basic(a) {
  return function(state) {
    // Collect results
    var res = [];

    var s2 = [
      a,
      state[STREAM],
      function(ps) {
        s2[STREAM] = ps;
        return s2;
      },
      [
        pass,
        null,
        state[SUCCESS],
        null,
        function(v) {
          VALUE(state, res);
        }
      ],
      COLLECT(state, function(v) {
        res.push(v);
      })
    ];

    // Repeat s2
//    s2[SUCCESS] = s2;

    return s2
  }
}

function repeat_delim(a, delim) {
  return function(state) {
    var res = [];

    var s2 = [
      delim,
      state[STREAM],
      // success
      [
        pass,
        // stream
        null,
        state[SUCCESS],
        // fail
        null,
        function(v) {
          VALUE(state, res);
        }
      ],
      // fail
      [
        a,
        // stream
        null,
        // success
        null,
        // fail
        state[SUCCESS],
        COLLECT(state, function(v) {
          res.push(v);
        })
      ]
    ];

    s2[FAIL][SUCCESS] = s2;

    return s2;
  };
}

function sym(name) {
  return function(state) {
    return this[name](state);
  }
}

var grammar = {
  END: ["END"],
  END_FAIL: ["END_FAIL"],
  parseString: function(str, opt_start) {
    opt_start = opt_start || this.START;

    var ps = StringPS.create(str);
    var res;
    this.state = [opt_start,
                  ps,
                  this.END,
                  this.END_FAIL,
                  function(v) {
                    res = v;
                  }];
    this.parse();
    return res;
  },
  // Pumps the state machine until termination or more data needed.
  parse: function() {
    while ( true ) {
      if ( ! this.state ) {
        throw "Parser returned undefined.";
      }

      if ( this.state === this.END ) {
        break;
      }

      if ( this.state === this.END_FAIL ) {
        break;
      }

      // Need more data.
      if ( this.state[STREAM].head === null ) {
        return;
      }

      this.state = this.state[CONDITION].call(this, this.state);
    }
  },

  addAction: function(sym, action) {
    var old = this[sym];
    this[sym] = function(state) {
      var self = this;
      var oldfn = state[PAYLOAD];
      function wrapper(v) {
        v = action.call(self, v);
        oldfn && oldfn.call(self, v);
      };
      state[PAYLOAD] = wrapper;
      return old.call(this, state);
    }
    return this;
  },

  addActions: function(map) {
    for ( var key in map ) {
      this.addAction(key, map[key]);
    }
    return this;
  }
};

var TestParser = {
  __proto__: grammar,
  //  START: sym('code tag'),
  START: sym('create child'),
//  'code tag': seq('<%', repeat(not('%>', anyChar)), '%>'),
//    test: alt2(seq2(char('a'), char('c')), seq2(char('a'), char('b')))
  //  test: alt2(char('a'), char('b'))
//  test: repeat(not('hello', anyChar))
  'create child': seq(
    '$$',
    repeat(notChars(' $\r\n<{,.'))),
}.addActions({
  START: function(v) {
    console.log("Result is: ", v);
  }
});

//TestParser.parseString("b");
//  TestParser.parseString("$$hellb");
//  TestParser.parseString("<% true; %>", TestParser["code tag"]);

//TestParser.parseString("c", TestParser.test);
//TestParser.parseString("vvvvz", TestParser.testRepeat);
//TestParser.parseString("vvvb", TestParser.test2);
//TestParser.parseString("b", TestParser.test2)
//TestParser.parseString("vvvvxvv", TestParser.test);

 // console.log("Test1", TemplateParser.parseString('<div id="<%= this.id %>"'));
