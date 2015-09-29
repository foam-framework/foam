/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

CLASS({
  name: 'ExplainExpr',

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
    toBQL: function() { return this.arg1.toBQL(); },
    partialEval: function() {
      var newArg = this.arg1.partialEval();

      return this.arg1 === newArg ? this : EXPLAIN(newArg);
    },
    f: function(obj) { return this.arg1.f(obj); }
  }
});

function EXPLAIN(arg) {
  return ExplainExpr.create({arg1: arg});
}


CLASS({
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

    toBQL: function() {
      var s = '';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toBQL();
        if ( i < this.args.length-1 ) s += (' | ');
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
    }
  },

  constants: {
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

      console.log('************** Unknown partialOr combination: ', e1.name_, e2.name_);

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


CLASS({
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
    toBQL: function() {
      // TODO: only include params if necessary
      return '-' + this.arg1.toBQL();
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


CLASS({
  name: 'HasExpr',
  extendsModel: 'UNARY',

  documentation: 'Unary expression that checks if its argument has a ' +
      'meaningful, non-empty value (nonempty strings, nonempty arrays, etc.)',

  methods: [
    function toSQL() {
      return this.arg1.toSQL() + ' IS NOT NULL';
    },
    function toMQL() {
      return 'has:' + this.arg1.toMQL();
    },
    function toBQL() {
      return this.toMQL();
    },
    function collectInputs(terms) {
      this.arg1.collectInputs(terms);
    },
    function partialEval() {
      if (this.arg1 && this.arg1.partialEval)
        this.arg1 = this.arg1.partialEval();
      return this;
    },
    function f(obj) {
      var value = this.arg1.f(obj);
      var notHas = value === undefined || value === null || value === '' ||
          (Array.isArray(value) && value.length === 0);
      return !notHas;
    }
  ]
});


CLASS({
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
    toBQL: function() { return this.arg1.toBQL() + ':(' + this.arg2.join('|') + ')' },

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
        v = ('' + v).toUpperCase();
        for ( var i = 0 ; i < this.arg2.length ; i++ ) {
          if ( v.indexOf(this.arg2[i]) != -1 ) return true;
        }
      }
      return false;
    }
  }
});


CLASS({
  name: 'ContainsExpr',

  extendsModel: 'BINARY',

  //documentation: 'Checks

  methods: {
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    toMQL: function() { return this.arg1.toMQL() + ':' + this.arg2.toMQL(); },
    toBQL: function() { return this.arg1.toBQL() + ':' + this.arg2.toBQL(); },

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


CLASS({
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
    toBQL: function() { return this.arg1.toBQL() + ':' + this.arg2.toBQL(); },

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



// TODO: A TrieIndex would be ideal for making this very fast.
CLASS({
  name: 'StartsWithExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    // TODO: Does MQL support this operation?
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },
    // TODO: Likewise BQL.
    toBQL: function() { return this.arg1.toBQL() + '>=' + this.arg2.toBQL(); },

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


CLASS({
  name: 'StartsWithICExpr',

  extendsModel: 'BINARY',

  methods: {
    toSQL: function() { return this.arg1.toSQL() + " like '%' + " + this.arg2.toSQL() + "+ '%'"; },
    // TODO: Does MQL support this operation?
    toMQL: function() { return this.arg1.toMQL() + '-after:' + this.arg2.toMQL(); },
    // TODO: Does BQL support this operation?
    toBQL: function() { return this.arg1.toBQL() + '>=' + this.arg2.toBQL(); },

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


CLASS({
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


CLASS({
  name: 'SumExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'sum',
      type:  'int',
      help:  'Sum of values.',
      factory: function() { return 0; }
    },
    {
      name: 'value',
      compareProperty: function() { return 0; },
      getter: function() {
        return this.sum;
      }
    }
  ],

  methods: {
    pipe: function(sink) { sink.put(this); },
    put: function(obj) { this.instance_.sum += this.arg1.f(obj); },
    remove: function(obj) { this.sum -= this.arg1.f(obj); },
    toString: function() { return this.sum; }
  }
});


CLASS({
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
    },
    {
      name: 'value',
      compareProperty: function() { return 0; },
      getter: function() {
        return this.avg;
      }
    }
  ],

  methods: {
    pipe: function(sink) { sink.put(this); },
    put: function(obj) { this.count++; this.sum += this.arg1.f(obj); },
    remove: function(obj) { this.count--; this.sum -= this.arg1.f(obj); },
    toString: function() { return this.avg; }
  }
});


CLASS({
  name: 'MinExpr',

  extendsModel: 'UNARY',

  properties: [
    {
      name:  'min',
      type:  'int',
      help:  'Minimum value.',
      defaultValue: undefined
    },
    {
      name: 'value',
      compareProperty: function() { return 0; },
      getter: function() {
        return this.min;
      }
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


CLASS({
  name: 'DistinctExpr',

  extendsModel: 'BINARY',

  properties: [
    {
      name:  'values',
      help:  'Distinct values.',
      factory: function() { return {}; }
    },
    {
      name: 'value',
      compareProperty: function() { return 0; },
      getter: function() {
        return this.arg2.value;
      }
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


CLASS({
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
    sortedKeys: function(opt_comparator) {
      var c = opt_comparator || this.arg1.compareProperty;
      this.groupKeys.sort(c);
      return this.groupKeys;
    },
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
        group = this.arg2.exprClone();
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
    exprClone: function() {
      return GroupByExpr.create({
        arg1: this.arg1,
        arg2: this.arg2.exprClone()
      });
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
    toView_: function() { return this; },
    toHTML: function() {
      var out = [];

      out.push('<table border=1>');
      for ( var key in this.groups ) {
        var value = this.groups[key];
        var str = value.toView_ ? value.toView_().toHTML() : value;
        out.push('<tr><th>', key, '</th><td>', str, '</td></tr>');
      }
      out.push('</table>');

      return out.join('');
    },
    initHTML: function() {
      for ( var key in this.groups ) {
        var value = this.groups[key];
        value.toView_ && value.toView_().initHTML();
      }
    }
  }
});


CLASS({
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
    exprClone: function() {
      // Don't use default clone because we don't want to copy 'rows' or 'cols'.
      return this.model_.create({
        xFunc: this.xFunc,
        yFunc: this.yFunc,
        acc: this.acc.exprClone()
      });
    },
    remove: function(obj) { /* TODO: */ },
    toString: function() { return this.groups; },
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
    toHTML_: function() {
      return this;
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


CLASS({
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
    exprClone: function() {
      // Don't use default clone because we don't want to copy 'groups'
      return MapExpr.create({
        arg1: this.arg1,
        arg2: this.arg2.exprClone()
      });
    },
    remove: function(obj) {
      var acc = this.arg2;
      if ( acc.remove ) {
        var val = this.arg1.f ? this.arg1.f(obj) : this.arg1(obj);
        acc.remove(val);
      }
    },
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



CLASS({
  name: 'FilterExpr',

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
      var discard = ! (this.arg1.f ? this.arg1.f(obj) : this.arg1(obj));
      var acc = this.arg2;
      if ( ! discard ) acc.put(obj);
    },
    remove: function(obj) {
      var acc = this.arg2;
      if ( acc.remove ) {
        var discard = ! (this.arg1.f ? this.arg1.f(obj) : this.arg1(obj));
        if ( ! discard ) acc.remove(obj);
      }
    },
    toString: function() { return this.arg2.toString(); },
    exprClone: function() {
      // Don't use default clone because we don't want to copy 'groups'
      return FilterExpr.create({
        arg1: this.arg1,
        arg2: this.arg2.exprClone()
      });
    },
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


CLASS({
  name: 'SeqExpr',

  extendsModel: 'NARY',

  properties: [
    {
      name: 'value',
      compareProperty: function() { return 0; },
      getter: function() {
        return this.args.map(function(x) { return x.value; });
      }
    }
  ],

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
    exprClone: function() {
      return SeqExpr.create({
        args: this.args.map(function(o) { return o.exprClone(); })
      });
    },
    deepClone: function() {
      return SeqExpr.create({ args: this.args.deepClone() });
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


CLASS({
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
      if ( ! this.objs_ ) return;
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

CLASS({
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

function AVG(expr) {
  return AvgExpr.create({arg1: expr});
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

function FILTER(fn, sink) {
  return FilterExpr.create({ arg1: fn, arg2: sink });
}

function DISTINCT(fn, sink) {
  return DistinctExpr.create({arg1: fn, arg2: sink});
}

function OR() {
  return OrExpr.create({args: compileArray_.call(null, arguments)});
}

function NOT(arg) {
  return NotExpr.create({arg1: compile_(arg)});
}

function HAS(arg) {
  return HasExpr.create({arg1: compile_(arg)});
}

// TODO: add EQ_ic

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


CLASS({
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
    }
  }
});

function TREE(parentProperty, childrenProperty) {
  return TreeExpr.create({
    parentProperty: parentProperty,
    childrenProperty: childrenProperty
  });
}

CLASS({
  name: 'DescExpr',

  extendsModel: 'UNARY',

  methods: {
    toSQL: function() {
      return this.arg1.toSQL() + ' DESC';
    },
    toMQL: function() {
      return '-' + this.arg1.toMQL();
    },
    compare: function(o1, o2) {
      return -1 * this.arg1.compare(o1, o2);
    }
  }
});

CLASS({
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
  sink = sink || [].sink;
  return {
    f: function(o) {
      var s = sink.clone();
      dao.where(EQ(key, o.id)).select(s);
      return [o, s];
    }
  };
};


CLASS({
  name: 'MQLExpr',

  extendsModel: 'UNARY',

  documentation: 'Parse an MQL query string and use it as a predicate.',

  properties: [
    {
      name: 'specializations_',
      factory: function() { return {}; }
    }
  ],
  methods: {
    specialize: function(model) {
      var qp = QueryParserFactory(model, true /* keyword enabled */);
      return qp.parseString(this.arg1) || FALSE;
    },
    specialization: function(model) {
      return this.specializations_[model.name] ||
        ( this.specializations_[model.name] = this.specialize(model) );
    },
    // TODO: implement;
    toSQL: function() { return this.arg1; },
    toMQL: function() { return this.arg1; },

    partialEval: function() { return this; },

    f: function(obj) {
      return this.specialization(obj.model_).f(obj);
    }
  }
});


function MQL(mql) { return MQLExpr.create({arg1: mql}); }


CLASS({
  name: 'KeywordExpr',

  extendsModel: 'UNARY',

  documentation: 'Keyword search.',

  /*
  properties: [
    {
      name: 'model',
      factory: function() { return {}; }
    }
  ],
  */
  methods: {
    toSQL: function() { return this.arg1; },
    toMQL: function() { return this.arg1; },
    partialEval: function() { return this; },
    f: function(obj) {
      // Escape Regex escape characters
      var pattern = this.pattern_ ||
        ( this.pattern_ = new RegExp(this.arg1.toString().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') );

      return this.pattern_.test(obj.toJSON());
    }
  }
});


function KEYWORD(word) { return KeywordExpr.create({arg1: word}); }


// TODO: add other Date functions
var MONTH = function(p) { return {f: function (o) { return p.f(o).getMonth(); } }; };
