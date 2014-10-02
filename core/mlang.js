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
// TODO: remove these three redundant definitions when
// meta-weirdness fixed

Property.getPrototype().partialEval = function() { return this; };

Property.getPrototype().toSQL = function() { return this.name; };

Property.getPrototype().toMQL = function() { return this.name; };

Property.getPrototype().f = function(obj) { return obj[this.name]; };

Property.getPrototype().compare = function(o1, o2) {
  return this.compareProperty(this.f(o1), this.f(o2));
};


// TODO: add type-checking in partialEval
//  (type-checking is a subset of partial-eval)

MODEL({
  name: 'Expr',

  package: 'foam.mlang',

  documentation: 'Parent model for all mLang expressions. Contains default implementations for many methods.',

  methods: {
    // Mustang Query Language
    toMQL: function() { /* Outputs Mustang Query Language for this expression. */ return this.label_; },
    toSQL: function() { /* Outputs SQL for this expression. */ return this.label_; },
    toString: function() {
      /* Converts to a string form for debugging; defaults to $$DOC{ref: ".toMQL", text: "MQL"}. */
      return this.toMQL();
    },
    collectInputs: function(terms) {
      /* Recursively adds all inputs of an expression to an array. */
      terms.push(this);
    },
    partialEval: function() {
      /* <p>Simplifies the expression by eliminating unnecessary clauses and combining others.</p>
       <p>Can sometimes reduce whole (sub)expressions to TRUE or FALSE.</p>
      */
      return this;
    },
    minterm: function(index, term) {
      // True if this bit is set in the minterm number.
      return !!((term >>> index[0]--) & 1 );
    },
    normalize: function() {
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
    pipe: function(sink) {
      /* Returns a $$DOC{ref: "Sink"} which applies this expression to every value <tt>put</tt> or <tt>remove</tt>d, calling the provided <tt>sink</tt> only for those values which match the expression. */
      var expr = this;
      return {
        __proto__: sink,
        put:    function(obj) { if ( expr.f(obj) ) sink.put(obj);   },
        remove: function(obj) { if ( expr.f(obj) ) sink.remove(obj); }
      };
    }
  }
});


var TRUE = (FOAM({
  model_: 'Model',
  name: 'TRUE',
  extendsModel: 'Expr',

  documentation: 'Model for the primitive true value.',

  methods: {
    toString: function() { return '<true>'; },
    toSQL:    function() { return '( 1 = 1 )'; },
    toMQL:    function() { return ''; },
    f:        function() { return true; }
  }
})).create();


var FALSE = (FOAM({
  model_: 'Model',
  name: 'FALSE',
  extendsModel: 'Expr',

  documentation: 'Model for the primitive false value.',

  methods: {
    toSQL: function(out) { return '( 1 <> 1 )'; },
    toMQL: function(out) { return '<false>'; },
    f:     function() { return false; }
  }
})).create();

var IDENTITY = (FOAM({
  model_: 'Model',
  name: 'IDENTITY',
  extendsModel: 'Expr',

  documentation: 'The identity expression, which passes through its input unchanged.',

  methods: {
    f: function(obj) { return obj; },
    toString: function() { return 'IDENTITY'; }
  }
})).create();

/** An n-ary function. **/
MODEL({
  name: 'NARY',

  extendsModel: 'Expr',
  abstract: true,

  documentation: 'Parent model for expressions which take an arbitrary number of arguments.',

  properties: [
    {
      name:  'args',
      label: 'Arguments',
      type:  'Expr[]',
      help:  'Sub-expressions',
      documentation: 'An array of subexpressions which are the arguments to this n-ary expression.',
      factory: function() { return []; }
    }
  ],

  methods: {
    toString: function() {
      var s = this.TYPE + '(';
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
    }
  }
});


/** An unary function. **/
MODEL({
  name: 'UNARY',

  extendsModel: 'Expr',
  abstract: true,

  documentation: 'Parent model for one-argument expressions.',

  properties: [
    {
      name:  'arg1',
      label: 'Argument',
      type:  'Expr',
      help:  'Sub-expression',
      documentation: 'The first argument to the expression.',
      defaultValue: TRUE
    }
  ],

  methods: {
    toSQL: function() {
      return this.label_ + '(' + this.arg1.toSQL() + ')';
    },
    toMQL: function() {
      return this.label_ + '(' + this.arg1.toMQL() + ')';
    }
  }
});


/** An unary function. **/
MODEL({
  name: 'BINARY',

  extendsModel: 'UNARY',
  abstract: true,

  documentation: 'Parent model for two-argument expressions. Extends $$DOC{ref: "UNARY"} to include $$DOC{ref: ".arg2"}.',

  properties: [
    {
      name:  'arg2',
      label: 'Argument',
      type:  'Expr',
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
    }
  }
});


MODEL({
  name: 'AndExpr',

  extendsModel: 'NARY',
  abstract: true,

  documentation: 'N-ary expression which is true only if each of its 0 or more arguments is true. AND() === TRUE',

  methods: {
    // AND has a higher precedence than OR so doesn't need parenthesis
    toSQL: function() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length-1 ) s += (' AND ');
      }
      return s;
    },
    toMQL: function() {
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
    collectInputs: function(terms) {
      for ( var i = 0; i < this.args.length; i++ ) {
        this.args[i].collectInputs(terms);
      }
    },
    minterm: function(index, term) {
      var out = true;
      for ( var i = 0; i < this.args.length; i++ ) {
        out = this.args[i].minterm(index, term) && out;
      }
      return out;
    },

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
          debugger;
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

    partialAnd: function(e1, e2) {
      if ( e2.model_ === OrExpr ) { var tmp = e1; e1 = e2; e2 = tmp; }
      if ( e1.model_ === OrExpr ) {
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

      console.log('************** Unknown partialAnd combination: ', e1.TYPE, e2.TYPE);

      return null;
    },

    partialEval: function() {
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

    f: function(obj) {
      return this.args.every(function(arg) {
        return arg.f(obj);
      });
    }
  }
});


MODEL({
  name: 'OrExpr',

  extendsModel: 'NARY',

  documentation: 'N-ary expression which is true if any one of its 0 or more subexpressions is true. OR() === FALSE',

  methods: {
    toSQL: function() {
      var s;
      s = '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length-1 ) s += (' OR ');
      }
      s += ')';
      return s;
    },

    toMQL: function() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toMQL();
        if ( i < this.args.length-1 ) s += (' OR ');
      }
      return s;
    },

    collectInputs: function(terms) {
      for ( var i = 0; i < this.args.length; i++ ) {
        this.args[i].collectInputs(terms);
      }
    },

    minterm: function(index, term) {
      var out = false;
      for ( var i = 0; i < this.args.length; i++ ) {
        out = this.args[i].minterm(index, term) || out;
      }
      return out;
    },

    PARTIAL_OR_RULES: [
      [ 'InExpr', 'EqExpr',
        function(e1, e2) {
          return IN(e1.arg1, e1.arg1.union([e2.arg2.f()]));
        }
      ],
      [ 'InExpr', 'InExpr',
        function(e1, e2) {
          var i = e1.arg2.filter(function(o) { return e2.arg2.indexOf(o) !== -1; });
          return IN(e1.arg1, e1.arg2.union(e2.arg2));
        }
      ]
      /*
      [ 'InExpr', 'ContainsICExpr',
        function(e1, e2) {
          var i = e1.arg2.filter(function(o) { return o.indexOfIC(e2.arg2.f()) !== -1; });
          return i.length ? IN(e1.arg1, i) : FALSE;
        }
      ],
      [ 'InExpr', 'ContainsExpr',
        function(e1, e2) {
          var i = e1.arg2.filter(function(o) { return o.indexOf(e2.arg2.f()) !== -1; });
          return i.length ? IN(e1.arg1, i) : FALSE;
        }
      ],
      [ 'EqExpr', 'InExpr',
        function(e1, e2) {
          return e2.arg2.indexOf(e1.arg2.f()) === -1 ? FALSE : e1;
        }
      ]*/
    ],

    partialOr: function(e1, e2) {
      if ( ! BINARY.isInstance(e1) ) return null;
      if ( ! BINARY.isInstance(e2) ) return null;
      if ( e1.arg1 != e2.arg1 ) return null;

      var RULES = this.PARTIAL_OR_RULES;
      for ( var i = 0 ; i < RULES.length ; i++ ) {
        if ( e1.model_.name == RULES[i][0] && e2.model_.name == RULES[i][1] ) return RULES[i][2](e1, e2);
        if ( e2.model_.name == RULES[i][0] && e1.model_.name == RULES[i][1] ) return RULES[i][2](e2, e1);
      }

      console.log('************** Unknown partialOr combination: ', e1.TYPE, e2.TYPE);

      return null;
    },

    partialEval: function() {
      var newArgs = [];
      var updated = false;

      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a    = this.args[i];
        var newA = this.args[i].partialEval();

        if ( newA === TRUE ) return TRUE;

        if ( OrExpr.isInstance(newA) ) {
          // In-line nested OR clauses
          for ( var j = 0 ; j < newA.args.length ; j++ ) {
            newArgs.push(newA.args[j]);
          }
          updated = true;
        }
        else {
          if ( newA !== FALSE ) {
            newArgs.push(newA);
          }
          if ( a !== newA ) updated = true;
        }
      }

      for ( var i = 0 ; i < newArgs.length-1 ; i++ ) {
        for ( var j = i+1 ; j < newArgs.length ; j++ ) {
          var a = this.partialOr(newArgs[i], newArgs[j]);
          if ( a ) {
            console.log('***************** ', newArgs[i].toMQL(), ' <PartialOr> ', newArgs[j].toMQL(), ' -> ', a.toMQL());
            if ( a === TRUE ) return TRUE;
            newArgs[i] = a;
            newArgs.splice(j, 1);
          }
        }
      }

      if ( newArgs.length == 0 ) return FALSE;
      if ( newArgs.length == 1 ) return newArgs[0];

      return updated ? OrExpr.create({args: newArgs}) : this;
    },

    f: function(obj) {
      return this.args.some(function(arg) {
        return arg.f(obj);
      });
    }
  }
});


MODEL({
  name: 'NotExpr',

  extendsModel: 'UNARY',
  abstract: true,

  documentation: 'Unary expression which inverts the truth value of its argument.',

  methods: {
    toSQL: function() {
      return 'not ( ' + this.arg1.toSQL() + ' )';
    },
    toMQL: function() {
      // TODO: only include params if necessary
      return '-' + this.arg1.toMQL();
    },
    collectInputs: function(terms) {
      this.arg1.collectInputs(terms);
    },

    minterm: function(index, term) {
      return ! this.arg1.minterm(index, term);
    },

    partialEval: function() {
      var newArg = this.arg1.partialEval();

      if ( newArg === TRUE ) return FALSE;
      if ( newArg === FALSE ) return TRUE;
      if ( NotExpr.isInstance(newArg) ) return newArg.arg1;
      if ( EqExpr.isInstance(newArg)  ) return NeqExpr.create(newArg);
      if ( NeqExpr.isInstance(newArg) ) return EqExpr.create(newArg);
      if ( LtExpr.isInstance(newArg)  ) return GteExpr.create(newArg);
      if ( GtExpr.isInstance(newArg)  ) return LteExpr.create(newArg);
      if ( LteExpr.isInstance(newArg) ) return GtExpr.create(newArg);
      if ( GteExpr.isInstance(newArg) ) return LtExpr.create(newArg);

      return this.arg1 === newArg ? this : NOT(newArg);
    },

    f: function(obj) { return ! this.arg1.f(obj); }
  }
});


MODEL({
  name: 'DescribeExpr',

  extendsModel: 'UNARY',

  documentation: 'Pseudo-expression which outputs a human-readable description of its subexpression, and the plan for evaluating it.',

  properties: [
    {
      name:  'plan',
      help:  'Execution Plan',
      defaultValue: ""
    }
  ],

  methods: {
    toString: function() { return this.plan; },
    toSQL: function() { return this.arg1.toSQL(); },
    toMQL: function() { return this.arg1.toMQL(); },
    partialEval: function() {
      var newArg = this.arg1.partialEval();

      return this.arg1 === newArg ? this : EXPLAIN(newArg);
    },
    f: function(obj) { return this.arg1.f(obj); }
  }
});


MODEL({
  name: 'EqExpr',

  extendsModel: 'BINARY',
  abstract: true,

  documentation: function() { /*
    <p>Binary expression that compares its arguments for equality.</p>
    <p>When evaluated in Javascript, uses <tt>==</tt>.</p>
    <p>If the first argument is an array, returns true if any of its value match the second argument.</p>
  */},

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '=' + this.arg2.toSQL(); },
    toMQL: function() {
      if ( ! this.arg1.toMQL || ! this.arg2.toMQL ) return '';
      return this.arg2     === TRUE ? 'is:' + this.arg1.toMQL()   :
             this.arg2.f() == ''    ? '-has:' + this.arg1.toMQL() :
             this.arg1.toMQL() + '=' + this.arg2.toMQL()      ;
    },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() == newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 !== newArg2 ?
        EqExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) {
      var arg1 = this.arg1.f(obj);
      var arg2 = this.arg2.f(obj);

      if ( Array.isArray(arg1) ) {
        return arg1.some(function(arg) {
          return arg == arg2;
        });
      }

      if ( arg2 === TRUE ) return !! arg1;
      if ( arg2 === FALSE ) return ! arg1;

      return arg1 == arg2;
    }
  }
});

MODEL({
  name: 'InExpr',

  extendsModel: 'BINARY',

  documentation: 'Binary expression which is true if its first argument is EQ to any element of its second argument, which is an array.',

  properties: [
    {
      name:  'arg2',
      label: 'Argument',
      type:  'Expr',
      help:  'Sub-expression',
      postSet: function() { this.valueSet_ = undefined; }
    }
  ],

  methods: {
    partialEval: function() {
      if ( this.arg2.length == 1 ) return EQ(this.arg1, this.arg2[0]);
      return this;
    },
    valueSet: function() {
      if ( ! this.valueSet_ ) {
        var s = {};
        for ( var i = 0 ; i < this.arg2.length ; i++ ) s[this.arg2[i]] = true;
        this.valueSet_ = s;
      }
      return this.valueSet_;
    },
    toSQL: function() { return this.arg1.toSQL() + ' IN ' + this.arg2; },
    toMQL: function() { return this.arg1.toMQL() + '=' + this.arg2.join(',') },

    f: function(obj) {
      return this.valueSet().hasOwnProperty(this.arg1.f(obj));
    }
  }
});


MODEL({
  name: 'ContainedInICExpr',

  extendsModel: 'BINARY',

  documentation: 'Checks if the first argument is contained in the array-valued right argument, ignoring case in strings.',

  properties: [
    {
      name:  'arg2',
      label: 'Argument',
      type:  'Expr',
      help:  'Sub-expression',
      preSet: function(_, a) { return a.map(function(o) { return o.toUpperCase(); }); }
    }
  ],

  methods: {
    toSQL: function() { return this.arg1.toSQL() + ' IN ' + this.arg2; },
    toMQL: function() { return this.arg1.toMQL() + ':' + this.arg2.join(',') },

    f: function(obj) {
      var v = this.arg1.f(obj);
      if ( Array.isArray(v) ) {
        for ( var j = 0 ; j < v.length ; j++ ) {
          var a = v[j].toUpperCase();
          for ( var i = 0 ; i < this.arg2.length ; i++ ) {
            if ( a.indexOf(this.arg2[i]) != -1 ) return true;
          }
        }
      } else {
        v = v.toUpperCase();
        for ( var i = 0 ; i < this.arg2.length ; i++ ) {
          if ( v.indexOf(this.arg2[i]) != -1 ) return true;
        }
      }
      return false;
    }
  }
});


MODEL({
  name: 'ContainsExpr',

  extendsModel: 'BINARY',

  //documentation: 'Checks 

  methods: {
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    toMQL: function() { return this.arg1.toMQL() + ':' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f().indexOf(newArg2.f()) != -1);
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        ContainsExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) {
      var arg1 = this.arg1.f(obj);
      var arg2 = this.arg2.f(obj);

      if ( Array.isArray(arg1) ) {
        return arg1.some(function(arg) {
          return arg.indexOf(arg2) != -1;
        });
      }

      return arg1.indexOf(arg2) != -1;
    }
  }
});


MODEL({
  name: 'ContainsICExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'arg2',
      label: 'Argument',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE,
      postSet: function(_, value) { this.pattern_ = undefined; }
    }
  ],

  methods: {
    // No different that the non IC-case
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    toMQL: function() { return this.arg1.toMQL() + ':' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f().toLowerCase().indexOf(newArg2.f()) != -1);
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        ContainsICExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) {
      var arg1 = this.arg1.f(obj);

      // Escape Regex escape characters
      var pattern = this.pattern_ ||
        ( this.pattern_ = new RegExp(this.arg2.f().toString().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') );

      if ( Array.isArray(arg1) ) {
        var pattern = this.pattern_;

        return arg1.some(function(arg) {
          return pattern.test(arg);
        });
      }

      return this.pattern_.test(arg1);
    }
  }
});


MODEL({
  name: 'NeqExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '<>' + this.arg2.toSQL(); },
    toMQL: function() { return '-' + this.arg1.toMQL() + '=' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() != newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        NeqExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) != this.arg2.f(obj); }
  }
});

MODEL({
  name: 'LtExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '<' + this.arg2.toSQL(); },
    toMQL: function() { return this.arg1.toMQL() + '-before:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() < newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        LtExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) < this.arg2.f(obj); }
  }
});

MODEL({
  name: 'GtExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '>' + this.arg2.toSQL(); },
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() > newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        GtExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) > this.arg2.f(obj); }
  }
});

MODEL({
  name: 'LteExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '<=' + this.arg2.toSQL(); },
    toMQL: function() { return this.arg1.toMQL() + '-before:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() <= newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        LtExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) <= this.arg2.f(obj); }
  }
});

MODEL({
  name: 'GteExpr',

  extendsModel: 'BINARY',
  abstract: true,

  methods: {
    toSQL: function() { return this.arg1.toSQL() + '>=' + this.arg2.toSQL(); },
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f() >= newArg2.f());
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        GtExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj) >= this.arg2.f(obj); }
  }
});


// TODO: A TrieIndex would be ideal for making this very fast.
MODEL({
  name: 'StartsWithExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    // TODO: Does MQL support this operation?
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f().startsWith(newArg2.f()));
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        StartsWithExpr.create({arg1: newArg1, arg2: newArg2}) :
        this;
    },

    f: function(obj) {
      var arg1 = this.arg1.f(obj);
      var arg2 = this.arg2.f(obj);

      if ( Array.isArray(arg1) ) {
        return arg1.some(function(arg) {
          return arg.startsWith(arg2);
        });
      }

      return arg1.startsWith(arg2);
    }
  }
});

MODEL({
  name: 'StartsWithICExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    // TODO: Does MQL support this operation?
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },

    partialEval: function() {
      var newArg1 = this.arg1.partialEval();
      var newArg2 = this.arg2.partialEval();

      if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
        return compile_(newArg1.f().startsWithIC(newArg2.f()));
      }

      return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
        StartsWithICExpr.create({arg1: newArg1, arg2: newArg2}) :
      this;
    },

    f: function(obj) { return this.arg1.f(obj).startsWithIC(this.arg2.f(obj)); }
  }
});


MODEL({
  name: 'ConstantExpr',

  extendsModel: 'UNARY',

  methods: {
    escapeSQLString: function(str) {
      return "'" +
        str.replace(/\\/g, "\\\\").replace(/'/g, "\\'") +
        "'";
    },
    escapeMQLString: function(str) {
      if ( str.length > 0 && str.indexOf(' ') == -1 && str.indexOf('"') == -1 && str.indexOf(',') == -1 ) return str;
      return '"' +
        str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
        '"';
    },
    toSQL: function() {
      return ( typeof this.arg1 === 'string' ) ?
        this.escapeSQLString(this.arg1) :
        this.arg1.toString() ;
    },
    toMQL: function() {
      return ( typeof this.arg1 === 'string' ) ?
        this.escapeMQLString(this.arg1) :
        (this.arg1.toMQL ? this.arg1.toMQL() :
         this.arg1.toString());
    },
    f: function(obj) { return this.arg1; }
  }
});


MODEL({
  name: 'ConcatExpr',
  extendsModel: 'NARY',

  label: 'concat',

  methods: {

    partialEval: function() {
      // TODO: implement
      return this;
    },

    f: function(obj) {
      var str = [];

      for ( var i = 0 ; i < this.args.length ; i++ ) {
        str.push(this.args[i].f(obj));
      }

      return str.join('');
    }
  }
});


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
};


MODEL({
  name: 'SumExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'sum',
      type:  'int',
      help:  'Sum of values.',
      factory: function() { return 0; }
    }
  ],

  methods: {
    pipe: function(sink) { sink.put(this); },
    put: function(obj) { this.instance_.sum += this.arg1.f(obj); },
    remove: function(obj) { this.sum -= this.arg1.f(obj); },
    toString: function() { return this.sum; }
  }
});


MODEL({
  name: 'AvgExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'count',
      type:  'int',
      defaultValue: 0
    },
    {
      name:  'sum',
      type:  'int',
      help:  'Sum of values.',
      defaultValue: 0
    },
    {
      name:  'avg',
      type:  'floag',
      help:  'Average of values.',
      getter: function() { return this.sum / this.count; }
    }
  ],

  methods: {
    pipe: function(sink) { sink.put(this); },
    put: function(obj) { this.count++; this.sum += this.arg1.f(obj); },
    remove: function(obj) { this.count--; this.sum -= this.arg1.f(obj); },
    toString: function() { return this.avg; }
  }
});


MODEL({
  name: 'MaxExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'max',
      type:  'int',
      help:  'Maximum value.',
      defaultValue: undefined
    }
  ],

  methods: {
    maximum: function(o1, o2) {
      return o1.compareTo(o2) > 0 ? o1 : o2;
    },
    reduce: function(other) {
      return MaxExpr.create({max: this.maximum(this.max, other.max)});
    },
    reduceI: function(other) {
      this.max = this.maximum(this.max, other.max);
    },
    pipe: function(sink) { sink.put(this); },
    put: function(obj) {
      var v = this.arg1.f(obj);
      this.max = this.max === undefined ? v : this.maximum(this.max, v);
    },
    remove: function(obj) { },
    toString: function() { return this.max; }
  }
});


MODEL({
  name: 'MinExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'min',
      type:  'int',
      help:  'Minimum value.',
      defaultValue: undefined
    }
  ],

  methods: {
    minimum: function(o1, o2) {
      return o1.compareTo(o2) > 0 ? o2 : o1;
    },
    reduce: function(other) {
      return MinExpr.create({max: this.mininum(this.min, other.min)});
    },
    reduceI: function(other) {
      this.min = this.minimum(this.min, other.min);
    },
    pipe: function(sink) { sink.put(this); },
    put: function(obj) {
      var v = this.arg1.f(obj);
      this.min = this.min === undefined ? v : this.minimum(this.min, v);
    },
    remove: function(obj) { },
    toString: function() { return this.min; }
  }
});


MODEL({
  name: 'DistinctExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'values',
      help:  'Distinct values.',
      factory: function() { return {}; }
    }
  ],

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
      // TODO:
    },
    put: function(obj) {
      var key = this.arg1.f(obj);
      if ( this.values.hasOwnProperty(key) ) return;
      this.values[key] = true;
      this.arg2.put(obj);
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.arg2.toString(); },
    toHTML: function() { return this.arg2.toHTML(); }
  }
});


MODEL({
  name: 'GroupByExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'groups',
      type:  'Map[Expr]',
      help:  'Groups.',
      factory: function() { return {}; }
    },
    {
      // Maintain a mapping of real keys because the keys in
      // 'groups' are actually the toString()'s of the real keys
      // and his interferes with the property comparator used to
      // sort groups.
      name: 'groupKeys',
      factory: function() { return [] }
    }
  ],

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
      for ( var i in other.groups ) {
        if ( this.groups[i] ) this.groups[i].reduceI(other.groups[i]);
        else this.groups[i] = other.groups[i].deepClone();
      }
    },
    pipe: function(sink) {
      for ( key in this.groups ) {
        sink.push([key, this.groups[key].toString()]);
      }
      return sink;
    },
    putInGroup_: function(key, obj) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];
      if ( ! group ) {
        group = this.arg2.clone();
        this.groups[key] = group;
        this.groupKeys.push(key);
      }
      group.put(obj);
    },
    put: function(obj) {
      var key = this.arg1.f(obj);
      if ( Array.isArray(key) ) {
        if ( key.length ) {
          for ( var i = 0 ; i < key.length ; i++ ) this.putInGroup_(key[i], obj);
        } else {
          // Perhaps we should use a key value of undefiend instead of '', since
          // '' may actually be a valid key.
          this.putInGroup_('', obj);
        }
      } else {
        this.putInGroup_(key, obj);
      }
    },
    clone: function() {
      // Don't use default clone because we don't want to copy 'groups'
      return GroupByExpr.create({arg1: this.arg1, arg2: this.arg2});
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.groups; },
    deepClone: function() {
      var cl = this.clone();
      cl.groups = {};
      for ( var i in this.groups ) {
        cl.groups[i] = this.groups[i].deepClone();
      }
      return cl;
    },
    toHTML: function() {
      var out = [];

      out.push('<table border=1>');
      for ( var key in this.groups ) {
        var value = this.groups[key];
        var str = value.toHTML ? value.toHTML() : value;
        out.push('<tr><th>', key, '</th><td>', str, '</td></tr>');
      }
      out.push('</table>');

      return out.join('');
    },
    initHTML: function() {
      for ( var key in this.groups ) {
        var value = this.groups[key];
        value.initHTML && value.initHTML();
      }
    }
  }
});


MODEL({
  name: 'GridByExpr',

  extendsModel: 'Expr',

  properties: [
    {
      name:  'xFunc',
      label: 'X-Axis Function',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE
    },
    {
      name:  'yFunc',
      label: 'Y-Axis Function',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE
    },
    {
      name:  'acc',
      label: 'Accumulator',
      type:  'Expr',
      help:  'Sub-expression',
      defaultValue: TRUE
    },
    {
      name:  'rows',
      type:  'Map[Expr]',
      help:  'Rows.',
      factory: function() { return {}; }
    },
    {
      name:  'cols',
      label: 'Columns',
      type:  'Map[Expr]',
      help:  'Columns.',
      factory: function() { return {}; }
    },
    {
      model_: 'ArrayProperty',
      name: 'children'
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      var self = this;
      var f = function() {
        self.cols = GROUP_BY(self.xFunc, COUNT());
        self.rows = GROUP_BY(self.yFunc, GROUP_BY(self.xFunc, self.acc));
      };

      self.addPropertyListener('xFunc', f);
      self.addPropertyListener('yFunc', f);
      self.addPropertyListener('acc', f);
      f();
      /*
        Events.dynamic(
        function() { self.xFunc; self.yFunc; self.acc; },
        function() {
        self.cols = GROUP_BY(self.xFunc, COUNT());
        self.rows = GROUP_BY(self.yFunc, GROUP_BY(self.xFunc, self.acc));
        });
      */
    },

    reduce: function(other) {
    },
    reduceI: function(other) {
    },
    pipe: function(sink) {
    },
    put: function(obj) {
      this.rows.put(obj);
      this.cols.put(obj);
    },
    clone: function() {
      // Don't use default clone because we don't want to copy 'groups'
      return this.model_.create({xFunc: this.xFunc, yFunc: this.yFunc, acc: this.acc});
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.groups; },
    deepClone: function() {
    },
    renderCell: function(x, y, value) {
      var str = value ? (value.toHTML ? value.toHTML() : value) : '';
      if ( value && value.toHTML && value.initHTML ) this.children.push(value);
      return '<td>' + str + '</td>';
    },
    sortAxis: function(values, f) { return values.sort(f.compareProperty); },
    sortCols: function(cols, xFunc) { return this.sortAxis(cols, xFunc); },
    sortRows: function(rows, yFunc) { return this.sortAxis(rows, yFunc); },
    sortedCols: function() {
      return this.sortCols(
        this.cols.groupKeys,
        this.xFunc);
    },
    sortedRows: function() {
      return this.sortRows(
        this.rows.groupKeys,
        this.yFunc);
    },
    toHTML: function() {
      var out;
      this.children = [];
      var cols = this.cols.groups;
      var rows = this.rows.groups;
      var sortedCols = this.sortedCols();
      var sortedRows = this.sortedRows();

      out = '<table border=0 cellspacing=0 class="gridBy"><tr><th></th>';

      for ( var i = 0 ; i < sortedCols.length ; i++ ) {
        var x = sortedCols[i];
        var str = x.toHTML ? x.toHTML() : x;
        out += '<th>' + str + '</th>';
      }
      out += '</tr>';

      for ( var j = 0 ; j < sortedRows.length ; j++ ) {
        var y = sortedRows[j];
        out += '<tr><th>' + y + '</th>';

        for ( var i = 0 ; i < sortedCols.length ; i++ ) {
          var x = sortedCols[i];
          var value = rows[y].groups[x];
          if ( value ) {
            value.x = x;
            value.y = y;
          }
          out += this.renderCell(x, y, value);
        }

        out += '</tr>';
      }
      out += '</table>';

      return out;
    },

    initHTML: function() {
      for ( var i = 0; i < this.children.length; i++ ) {
        this.children[i].initHTML();
      }
      this.children = [];
    }
  }
});


MODEL({
  name: 'MapExpr',

  extendsModel: 'BINARY',

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
    },
    pipe: function(sink) {
    },
    put: function(obj) {
      var val = this.arg1.f ? this.arg1.f(obj) : this.arg1(obj);
      var acc = this.arg2;
      acc.put(val);
    },
    clone: function() {
      // Don't use default clone because we don't want to copy 'groups'
      return MapExpr.create({arg1: this.arg1, arg2: this.arg2.clone()});
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.arg2.toString(); },
    deepClone: function() {
    },
    toHTML: function() {
      return this.arg2.toHTML ? this.arg2.toHTML() : this.toString();
    },
    initHTML: function() {
      this.arg2.initHTML && this.arg2.initHTML();
    }
  }
});


MODEL({
  name: 'CountExpr',

  extendsModel: 'Expr',

  properties: [
    {
      name:  'count',
      type:  'int',
      defaultValue: 0
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


MODEL({
  name: 'SeqExpr',

  extendsModel: 'NARY',

  methods: {
    pipe: function(sink) { sink.put(this); },
    put: function(obj) {
      var ret = [];
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        a.put(obj);
      }
    },
    f: function(obj) {
      var ret = [];
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];

        ret.push(a.f(obj));
      }
      return ret;
    },
    clone: function() {
      return SeqExpr.create({args:this.args.clone()});
    },
    toString: function(obj) {
      var out = [];
      out.push('(');
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        out.push(a.toString());
        if ( i < this.args.length-1 ) out.push(',');
      }
      out.push(')');
      return out.join('');
    },
    toHTML: function(obj) {
      var out = [];
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        out.push(a.toHTML ? a.toHTML() : a.toString());
        if ( i < this.args.length-1 ) out.push('&nbsp;');
      }
      return out.join('');
    }
  }
});

MODEL({
  name: 'UpdateExpr',
  extendsModel: 'NARY',

  label: 'UpdateExpr',

  properties: [
    {
      name: 'dao',
      type: 'DAO',
      transient: true,
      hidden: true
    }
  ],

  methods: {
    // TODO: put this back to process one at a time and then
    // have MDAO wait until it's done before pushing all data.
    put: function(obj) {
      (this.objs_ || (this.objs_ = [])).push(obj);
    },
    eof: function() {
      for ( var i = 0 ; i < this.objs_.length ; i++ ) {
        var obj = this.objs_[i];
        var newObj = this.f(obj);
        if (newObj.id !== obj.id) this.dao.remove(obj.id);
        this.dao.put(newObj);
      }
      this.objs_ = undefined;
    },
    f: function(obj) {
      var newObj = obj.clone();
      for (var i = 0; i < this.args.length; i++) {
        this.args[i].f(newObj);
      }
      return newObj;
    },
    reduce: function(other) {
      return UpdateExpr.create({
        args: this.args.concat(other.args),
        dao: this.dao
      });
    },
    reduceI: function(other) {
      this.args = this.args.concat(other.args);
    },
    toString: function() {
      return this.toSQL();
    },
    toSQL: function() {
      var s = 'SET ';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toSQL();
        if ( i < this.args.length-1 ) s += ', ';
      }
      return s;
    }
  }
});

MODEL({
  name: 'SetExpr',
  label: 'SetExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() { return this.arg1.toSQL() + ' = ' + this.arg2.toSQL(); },
    f: function(obj) {
      // TODO: This should be an assertion when arg1 is set rather than be checked
      // for every invocation.
      if ( Property.isInstance(this.arg1) ) {
        obj[this.arg1.name] = this.arg2.f(obj);
      }
    }
  }
});

function SUM(expr) {
  return SumExpr.create({arg1: expr});
}

function MIN(expr) {
  return MinExpr.create({arg1: expr});
}

function MAX(expr) {
  return MaxExpr.create({arg1: expr});
}

function AVG(expr) {
  return AvgExpr.create({arg1: expr});
}

function COUNT() {
  return CountExpr.create();
}

function SEQ() {
  //  return SeqExpr.create({args: compileArray_.call(null, arguments)});
  return SeqExpr.create({args: argsToArray(arguments)});
}

function UPDATE(expr, dao) {
  return UpdateExpr.create({
    args: compileArray_.call(null, Array.prototype.slice.call(arguments, 0, -1)),
    dao: arguments[arguments.length - 1]
  });
}

function SET(arg1, arg2) {
  return SetExpr.create({ arg1: compile_(arg1), arg2: compile_(arg2) });
}

function GROUP_BY(expr1, opt_expr2) {
  return GroupByExpr.create({arg1: expr1, arg2: opt_expr2 || [].sink});
}

function GRID_BY(xFunc, yFunc, acc) {
  return GridByExpr.create({xFunc: xFunc, yFunc: yFunc, acc: acc});
}

function MAP(fn, opt_sink) {
  return MapExpr.create({arg1: fn, arg2: opt_sink || [].sink});
}

function DISTINCT(fn, sink) {
  return DistinctExpr.create({arg1: fn, arg2: sink});
}

function AND() {
  return AndExpr.create({args: compileArray_.call(null, arguments)});
}

function OR() {
  return OrExpr.create({args: compileArray_.call(null, arguments)});
}

function NOT(arg) {
  return NotExpr.create({arg1: compile_(arg)});
}

function EXPLAIN(arg) {
  return DescribeExpr.create({arg1: arg});
}

function IN(arg1, arg2) {
  return InExpr.create({arg1: compile_(arg1), arg2: arg2 });
}

function EQ(arg1, arg2) {
  var eq = EqExpr.create();
  eq.instance_.arg1 = compile_(arg1);
  eq.instance_.arg2 = compile_(arg2);
  return eq;
  //  return EqExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

// TODO: add EQ_ic

function NEQ(arg1, arg2) {
  return NeqExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function LT(arg1, arg2) {
  return LtExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function GT(arg1, arg2) {
  return GtExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function LTE(arg1, arg2) {
  return LteExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function GTE(arg1, arg2) {
  return GteExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function STARTS_WITH(arg1, arg2) {
  return StartsWithExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function STARTS_WITH_IC(arg1, arg2) {
  return StartsWithICExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function CONTAINS(arg1, arg2) {
  return ContainsExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function CONTAINS_IC(arg1, arg2) {
  return ContainsICExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function CONCAT() {
  return ConcatExpr.create({args: compileArray_.call(null, arguments)});
}


MODEL({
  name: 'ExpandableGroupByExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'groups',
      type:  'Map[Expr]',
      help:  'Groups.',
      factory: function() { return {}; }
    },
    {
      name:  'expanded',
      type:  'Map',
      help:  'Expanded.',
      factory: function() { return {}; }
    },
    {
      name:  'values',
      type:  'Object',
      help:  'Values',
      factory: function() { return []; }
    }
  ],

  methods: {
    reduce: function(other) {
      // TODO:
    },
    reduceI: function(other) {
      // TODO:
    },
    /*
      pipe: function(sink) {
      for ( key in this.groups ) {
      sink.push([key, this.groups[key].toString()]);
      }
      return sink;
      },*/
    select: function(sink, options) {
      var self = this;
      this.values.select({put: function(o) {
        sink.put(o);
        var key = self.arg1.f(o);
        var a = o.children;
        if ( a ) for ( var i = 0 ; i < a.length ; i++ ) sink.put(a[i]);
      }}, options);
      return aconstant(sink);
    },
    putKeyValue_: function(key, value) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];

      if ( ! group ) {
        group = value.clone();
        if ( this.expanded[key] ) group.children = [];
        this.groups[key] = group;
        group.count = 1;
        this.values.push(group);
      } else {
        group.count++;
      }

      if ( group.children ) group.children.push(obj);
    },
    put: function(obj) {
      var key = this.arg1.f(obj);

      if ( Array.isArray(key) ) {
        for ( var i = 0 ; i < key.length ; i++ ) this.putKeyValue_(key[i], obj);
      } else {
        this.putKeyValue_(key, obj);
      }
    },
    where: function(query) {
      return filteredDAO(query, this);
    },
    limit: function(count) {
      return limitedDAO(count, this);
    },
    skip: function(skip) {
      return skipDAO(skip, this);
    },

    orderBy: function() {
      return orderedDAO(arguments.length == 1 ? arguments[0] : argsToArray(arguments), this);
    },
    listen: function() {},
    unlisten: function() {},
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.groups; },
    deepClone: function() {
      return this;
    }
  }
});

MODEL({
  name: 'TreeExpr',

  extendsModel: 'Expr',

  properties: [
    {
      name: 'parentProperty'
    },
    {
      name: 'childrenProperty'
    },
    {
      name: 'items_',
      help: 'Temporary map to store collected objects.',
      factory: function() { return {}; },
      transient: true
    },
    {
      model_: 'ArrayProperty',
      name: 'roots'
    }
  ],

  methods: {
    put: function(o) {
      this.items_[o.id] = o;
      if ( ! this.parentProperty.f(o) ) {
        this.roots.push(o);
      }
    },
    eof: function() {
      var pprop = this.parentProperty;
      var cprop = this.childrenProperty;

      for ( var key in this.items_ ) {
        var item = this.items_[key];
        var parentId = pprop.f(item);
        if ( ! parentId ) continue;
        var parent = this.items_[parentId];

        parent[cprop.name] = cprop.f(parent).concat(item);
      }

      // Remove temporary holder this.items_.
      this.items_ = {};
    },
  }
});

function TREE(parentProperty, childrenProperty) {
  return TreeExpr.create({
    parentProperty: parentProperty,
    childrenProperty: childrenProperty
  });
}

MODEL({
  name: 'DescExpr',

  extendsModel: 'UNARY',

  methods: {
    toSQL: function() {
      return this.arg1.toMQL() + 'DESC';
    },
    toMQL: function() {
      return '-' + this.arg1.toMQL();
    },
    compare: function(o1, o2) {
      return -1 * this.arg1.compare(o1, o2);
    }
  }
});

MODEL({
  name: 'AddExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() {
      return this.arg1.toSQL() + ' + ' + this.arg2.toSQL();
    },
    f: function(o) {
      return this.arg1.f(o) + this.arg2.f(o);
    }
  }
});

function ADD(arg1, arg2) {
  return AddExpr.create({ arg1: compile_(arg1), arg2: compile_(arg2) });
}

function DESC(arg1) {
  if ( DescExpr.isInstance(arg1) ) return arg1.arg1;
  return DescExpr.create({ arg1: arg1 });
}

var JOIN = function(dao, key, sink) {
  return {
    f: function(o) {
      var s = sink.clone();
      dao.where(EQ(key, o.id)).select(s);
      return [o, s];
    }
  };
};


// TODO: add other Date functions
var MONTH = function(p) { return {f: function (o) { return p.f(o).getMonth(); } }; };
