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

// TODO: add type-checking in partialEval
//  (type-checking is a subset of partial-eval)

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
}


CLASS({
  name: 'Expr',
  implements: ['ExprProtocol'],

  documentation: 'Parent model for all mLang expressions. Contains default implementations for many methods.',

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          swiftType: 'AnyObject?',
        },
      ],
      swiftReturnType: 'AnyObject?',
      swiftCode: 'fatalError("You must extend and implement this.")',
    },
    function toMQL() { /* Outputs MQL for this expression. */ return this.label_; },
    function toSQL() { /* Outputs SQL for this expression. */ return this.label_; },
    function toBQL() { /* Outputs yet another query language for this expression. */ return this.label_; },
    function toString() {
      /* Converts to a string form for debugging; defaults to $$DOC{ref: ".toMQL", text: "MQL"}. */
      return this.toMQL();
    },
    function exprClone() {
      /* Expression-friendly cloning method. Basically a deepClone(), but many
         expressions override it with custom logic. */
      var c = Object.create(this.__proto__);
      c.instance_ = {};
      c.X = this.X;
      for ( var key in this.instance_ ) {
        var value = this[key];
        if ( value !== undefined ) {
          if ( typeof value.exprClone === 'function' )
            c.instance_[key] = value.exprClone();
          else
            c.instance_[key] = value;
        }
      }
      return c;
    },
    function collectInputs(terms) {
      /* Recursively adds all inputs of an expression to an array. */
      terms.push(this);
    },
    function partialEval() {
      /* <p>Simplifies the expression by eliminating unnecessary clauses and combining others.</p>
       <p>Can sometimes reduce whole (sub)expressions to TRUE or FALSE.</p>
      */
      return this;
    },
    function minterm(index, term) {
      // True if this bit is set in the minterm number.
      return !!((term >>> index[0]--) & 1 );
    },
    function normalize() {
      return this;
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
      var ret = OrExpr.create({ args: terms }).partialEval();
      console.log(this.toMQL(),' normalize-> ', ret.toMQL());
      return ret;
    },
    function pipe(sink) {
      /* Returns a $$DOC{ref: "Sink"} which applies this expression to every value <tt>put</tt> or <tt>remove</tt>d, calling the provided <tt>sink</tt> only for those values which match the expression. */
      var expr = this;
      return {
        __proto__: sink,
        put:    function(obj) { if ( expr.f(obj) ) sink.put(obj);   },
        remove: function(obj) { if ( expr.f(obj) ) sink.remove(obj); }
      };
    }
  ]
});

CLASS({
  name: 'TrueExpr',
  extends: 'Expr',

  documentation: 'Model for the primitive true value.',

  methods: [
    function clone() { return this; },
    function deepClone() { return this; },
    function exprClone() { return this; },
    function toString() { return '<true>'; },
    function toSQL() { return '( 1 = 1 )'; },
    function toMQL() { return ''; },
    function toBQL() { return ''; },
    function readResolve() { return TRUE; },
    {
      name: 'f',
      code: function() { return true; },
      swiftCode: 'return true',
    },
  ]
});

CLASS({
  name: 'FalseExpr',
  extends: 'Expr',

  documentation: 'Model for the primitive false value.',

  methods: [
    function clone() { return this; },
    function deepClone() { return this; },
    function exprClone() { return this; },
    function toSQL(out) { return '( 1 <> 1 )'; },
    function toMQL(out) { return '<false>'; },
    function toBQL(out) { return '<false>'; },
    function readResolve() { return FALSE; },
    {
      name: 'f',
      code: function() { return false; },
      swiftCode: 'return false',
    },
  ]
});

CLASS({
  name: 'IdentityExpr',
  extends: 'Expr',

  documentation: 'The identity expression, which passes through its input unchanged.',

  methods: {
    clone:     function() { return this; },
    deepClone: function() { return this; },
    exprClone: function() { return this; },
    f: function(obj) { return obj; },
    toString: function() { return 'IDENTITY'; },
    readResolve: function() { return IDENTITY; }
  }
});

var TRUE = TrueExpr.create();
var FALSE = FalseExpr.create();
var IDENTITY = IdentityExpr.create();

/** An n-ary function. **/
CLASS({
  name: 'NARY',
  extends: 'Expr',
  abstract: true,

  documentation: 'Parent model for expressions which take an arbitrary number of arguments.',

  properties: [
    {
      name:  'args',
      label: 'Arguments',
      // type:  'Expr[]',
      swiftType:  'NSArray',
      swiftFactory: 'return []',
      help:  'Sub-expressions',
      documentation: 'An array of subexpressions which are the arguments to this n-ary expression.',
      factory: function() { return []; }
    }
  ],

  methods: {
    toString: function() {
      var s = this.name_ + '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toString();
        if ( i < this.args.length-1 ) s += (', ');
      }
      return s + ')';
    },

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
    },
    toBQL: function() {
      var s;
      s = this.model_.label;
      s += '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toBQL();
        if ( i < this.args.length-1 ) out.push(',');
      }
      s += ')';
      return str;
    }
  }
});

/** An unary function. **/
CLASS({
  name: 'UNARY',

  extends: 'Expr',
  abstract: true,

  documentation: 'Parent model for one-argument expressions.',

  properties: [
    {
      name:  'arg1',
      label: 'Argument',
      swiftType: 'AnyObject?',
      help:  'Sub-expression',
      documentation: 'The first argument to the expression.',
      defaultValue: TRUE,
      swiftDefaultValue: 'TRUE',
    }
  ],

  methods: {
    toSQL: function() {
      return this.label_ + '(' + this.arg1.toSQL() + ')';
    },
    toMQL: function() {
      return this.label_ + '(' + this.arg1.toMQL() + ')';
    },
    toBQL: function() {
      return this.label_ + '(' + this.arg1.toBQL() + ')';
    }
  }
});


/** An unary function. **/
CLASS({
  name: 'BINARY',

  extends: 'UNARY',
  abstract: true,

  documentation: 'Parent model for two-argument expressions. Extends $$DOC{ref: "UNARY"} to include $$DOC{ref: ".arg2"}.',

  properties: [
    {
      name:  'arg2',
      label: 'Argument',
      swiftType: 'AnyObject?',
      swiftDefaultValue: 'TRUE',
      help:  'Sub-expression',
      documentation: 'Second argument to the expression.',
      defaultValue: TRUE
    }
  ],

  methods: {
    toSQL: function() {
      return this.arg1.toSQL() + ' ' + this.label_ + ' ' + this.arg2.toSQL();
    },
    toMQL: function() {
      return this.arg1.toMQL() + ' ' + this.label_ + ' ' + this.arg2.toMQL();
    },
    toBQL: function() {
      return this.arg1.toBQL() + ' ' + this.label_ + ' ' + this.arg2.toBQL();
    }
  }
});


CLASS({
  name: 'CountExpr',

  extends: 'Expr',

  properties: [
    {
      type:  'Int',
      name:  'count',
      defaultValue: 0
    },
    {
      name: 'value',
      getter: function() {
        return this.count;
      }
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

function COUNT() {
  return CountExpr.create();
}


CLASS({
  name: 'EqExpr',

  extends: 'BINARY',

  documentation: function() { /*
    <p>Binary expression that compares its arguments for equality.</p>
    <p>When evaluated in Javascript, uses <tt>==</tt>.</p>
    <p>If the first argument is an array, returns true if any of its value match the second argument.</p>
  */},

  methods: [
    function toSQL() { return this.arg1.toSQL() + '=' + this.arg2.toSQL(); },
    function toMQL() {
      if ( ! this.arg1.toMQL || ! this.arg2.toMQL ) return '';
      return this.arg2     === TRUE ? 'is:' + this.arg1.toMQL()   :
             this.arg2.f() == ''    ? '-has:' + this.arg1.toMQL() :
             this.arg1.toMQL() + '=' + this.arg2.toMQL()      ;
    },

    function toBQL() {
      if ( ! this.arg1.toBQL || ! this.arg2.toBQL ) return '';
      return this.arg2     === TRUE ? this.arg1.toBQL() + ':true' :
             this.arg1.toBQL() + ':' + this.arg2.toBQL()      ;
    },

    function partialEval() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) )
        return compile_(this.f());

      return this.arg1 !== newArg1 || this.arg2 !== newArg2 ?
        EqExpr.create({arg1: newArg1, arg2: newArg2}) :
        this ;
    },
    {
      name: 'f',
      code: function(obj) {
        var arg1 = this.arg1.f(obj);
        var arg2 = this.arg2.f(obj);

        if ( Array.isArray(arg1) ) {
          if ( ! Array.isArray(arg2) ) {
            return arg1.some(function(arg) {
              return arg == arg2;
            });
          }
          if ( arg1.length !== arg2.length ) return false;
          for ( var i = 0; i < arg1.length; i++ ) {
            if ( arg1[i] != arg2[i] ) return false;
          }
          return true;
        }

        if ( arg2 === TRUE ) return !! arg1;
        if ( arg2 === FALSE ) return ! arg1;

        return equals(arg1, arg2);
      },
      swiftCode: 'return equals(arg1?.f(obj), b: arg2?.f(obj))',
    }
  ]
});


function EQ(arg1, arg2) {
  var eq = EqExpr.create();
  eq.instance_.arg1 = compile_(arg1);
  eq.instance_.arg2 = compile_(arg2);
  return eq;
  //  return EqExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}


CLASS({
  name: 'ConstantExpr',

  extends: 'UNARY',

  methods: [
    function escapeSQLString(str) {
      return "'" +
        str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") +
        "'";
    },
    function escapeMQLString(str) {
      if ( str.length > 0 && str.indexOf(' ') == -1 && str.indexOf('"') == -1 && str.indexOf(',') == -1 ) return str;
      return '"' +
        str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
        '"';
    },
    function toSQL() {
      return ( typeof this.arg1 === 'string' ) ?
        this.escapeSQLString(this.arg1) :
        this.arg1.toString() ;
    },
      function toMQL() {
      return ( typeof this.arg1 === 'string' ) ?
        this.escapeMQLString(this.arg1) :
        (this.arg1.toMQL ? this.arg1.toMQL() :
         this.arg1.toString());
    },
        function toBQL() {
      return ( typeof this.arg1 === 'string' ) ?
        this.escapeMQLString(this.arg1) :
        (this.arg1.toBQL ? this.arg1.toBQL() :
         this.arg1.toString());
    },
    {
      name: 'f',
      code: function(obj) { return this.arg1; },
      swiftCode: 'return arg1',
    },
  ]
});


CLASS({
  name: 'AndExpr',

  extends: 'NARY',

  documentation: 'N-ary expression which is true only if each of its 0 or more arguments is true. AND() === TRUE',

  methods: [
    // AND has a higher precedence than OR so doesn't need parenthesis
    function toSQL() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length-1 ) s += (' AND ');
      }
      return s;
    },
    function toMQL() {
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
    function toBQL() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        var sub = a.toBQL();
        if ( OrExpr.isInstance(a) ) {
          sub = '(' + sub + ')';
        }
        s += sub;
        if ( i < this.args.length-1 ) s += (' ');
      }
      return s;
    },
    function collectInputs(terms) {
      for ( var i = 0; i < this.args.length; i++ ) {
        this.args[i].collectInputs(terms);
      }
    },
    function minterm(index, term) {
      var out = true;
      for ( var i = 0; i < this.args.length; i++ ) {
        out = this.args[i].minterm(index, term) && out;
      }
      return out;
    },
    function partialAnd(e1, e2) {
      if ( OrExpr.isInstance(e2) ) { var tmp = e1; e1 = e2; e2 = tmp; }
      if ( OrExpr.isInstance(e1) ) {
        var args = [];
        for ( var i = 0 ; i < e1.args.length ; i++ ) {
          args.push(AND(e2, e1.args[i]));
        }
        return OrExpr.create({args: args}).partialEval();
      }

      if ( ! BINARY.isInstance(e1) ) return null;
      if ( ! BINARY.isInstance(e2) ) return null;
      if ( e1.arg1 != e2.arg1 ) return null;

      var RULES = this.PARTIAL_AND_RULES;
      for ( var i = 0 ; i < RULES.length ; i++ ) {
        if ( e1.model_.name == RULES[i][0] && e2.model_.name == RULES[i][1] ) return RULES[i][2](e1, e2);
        if ( e2.model_.name == RULES[i][0] && e1.model_.name == RULES[i][1] ) return RULES[i][2](e2, e1);
      }

      if ( DEBUG )
        console.log('Unknown partialAnd combination: ', e1.name_, e2.name_);

      return null;
    },
    function partialEval() {
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

      for ( var i = 0 ; i < newArgs.length-1 ; i++ ) {
        for ( var j = i+1 ; j < newArgs.length ; j++ ) {
          var a = this.partialAnd(newArgs[i], newArgs[j]);
          if ( a ) {
            console.log('***************** ', newArgs[i].toMQL(), ' <PartialAnd> ', newArgs[j].toMQL(), ' -> ', a.toMQL());
            if ( a === FALSE ) return FALSE;
            newArgs[i] = a;
            newArgs.splice(j, 1);
          }
        }
      }

      if ( newArgs.length == 0 ) return TRUE;
      if ( newArgs.length == 1 ) return newArgs[0];

      return updated ? AndExpr.create({args: newArgs}) : this;
    },
    {
      name: 'f',
      code: function(obj) {
        return this.args.every(function(arg) {
          return arg.f(obj);
        });
      },
      swiftCode: function() {/*
        for arg in args {
          let b = arg.f(obj) as! Bool
          if !b { return false }
        }
        return true
      */},
    }
  ],

  constants: {
    PARTIAL_AND_RULES: [
      [ 'EqExpr', 'EqExpr',
        function(e1, e2) {
          return e1.arg1.exclusive ?
            e1.arg2.f() == e2.arg2.f() ? e1 : FALSE :
            e1.arg2.f() == e2.arg2.f() ? e1 : null ;
        }
      ],
      [ 'InExpr', 'InExpr',
        function(e1, e2) {
          var i = e1.arg1.exclusive ? e1.arg2.intersection(e2.arg2) : e1.arg2.union(e2.arg2) ;
          return i.length ? IN(e1.arg1, i) : FALSE;
        }
      ],
      [ 'InExpr', 'ContainedInICExpr',
        function(e1, e2) {
          if ( ! e1.arg1.exclusive ) return null;
          var i = e1.arg2.filter(function(o) { o = o.toUpperCase(); return e2.arg2.some(function(o2) { return o.indexOf(o2) != -1; }); });
          return i.length ? IN(e1.arg1, i) : FALSE;
        }
      ],
      [ 'ContainedInICExpr', 'ContainedInICExpr',
        function(e1, e2) {
          console.assert(false, 'AND.partialEval: ContainedInICExpr has no partialEval rule');
        }
      ],
      [ 'InExpr', 'ContainsICExpr',
        function(e1, e2) {
          if ( ! e1.arg1.exclusive ) return;
          var i = e1.arg2.filter(function(o) { return o.indexOfIC(e2.arg2.f()) !== -1; });
        }
      ],
      [ 'InExpr', 'ContainsExpr',
        function(e1, e2) {
          if ( ! e1.arg1.exclusive ) return;
          var i = e1.arg2.filter(function(o) { return o.indexOf(e2.arg2.f()) !== -1; });
          return i.length ? IN(e1.arg1, i) : FALSE;
        }
      ],
      [ 'EqExpr', 'InExpr',
        function(e1, e2) {
          if ( ! e1.arg1.exclusive ) return;
          return e2.arg2.indexOf(e1.arg2.f()) === -1 ? FALSE : e1;
        }
      ]
    ],
  }
});


function AND() {
  return AndExpr.create({args: compileArray_.call(null, arguments)});
}

CLASS({
  name: 'NeqExpr',

  extends: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '<>' + this.arg2.toSQL(); },
    toMQL: function() { return '-' + this.arg1.toMQL() + '=' + this.arg2.toMQL(); },
    toBQL: function() { return '-' + this.arg1.toBQL() + ':' + this.arg2.toBQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) )
        return compile_(this.f());

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        NeqExpr.create({arg1: newArg1, arg2: newArg2}) :
        this ;
    },

    f: function(obj) {
      var arg1 = this.arg1.f(obj);
      var arg2 = this.arg2.f(obj);

      if ( Array.isArray(arg1) ) {
        if ( ! Array.isArray(arg2) ) {
          return ! arg1.some(function(arg) {
            return arg == arg2;
          });
        }
        if ( arg1.length !== arg2.length ) return true;
        for ( var i = 0; i < arg1.length; i++ ) {
          if ( arg1[i] != arg2[i] ) return true;
        }
        return false;
      }

      if ( arg2 === TRUE ) return ! arg1;
      if ( arg2 === FALSE ) return !! arg1;

      return ! equals(arg1, arg2);
    }
  }
});

function NEQ(arg1, arg2) {
  return NeqExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}


CLASS({
  name: 'UpperExpr',

  extends: 'UNARY',

  properties: [
    { name: 'label_', defaultValue: 'UPPER' }
  ],
  methods: [
    function partialEval() {
      var newArg1 = this.arg1.partialEval();

      if ( ConstantExpr.isInstance(newArg1) ) {
        var val = newArg1.f();
        if ( typeof val === 'string' ) return compile_(val.toUpperCase());
      } else if ( Array.isArray(newArg1) ) {
        debugger;
      }

      return this;
    },
    {
      name: 'f',
      code: function(obj) {
        var a = this.arg1.f(obj);
        if ( Array.isArray(a) )
          return a.map(function(s) { return s.toUpperCase ? s.toUpperCase() : s; });

        return a && a.toUpperCase ? a.toUpperCase() : a ;
      },
    },
    function toMQL() {
      if ( ConstantExpr.isInstance(this.arg1) && typeof this.arg1.arg1 == 'string' )
        return this.arg1.arg1.toUpperCase();
      return this.arg1.toMQL();
    }
  ]
});

function UPPER(arg1) { return UpperExpr.create({arg1: compile_(arg1)}); }
function EQ_IC(arg1, arg2) { return EQ(UPPER(arg1), UPPER(arg2)); }
function IN_IC(arg1, arg2) { return IN(UPPER(arg1), arg2.map(UPPER)); }
