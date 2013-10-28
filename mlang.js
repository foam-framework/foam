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
  o1 = this.f(o1);
  o2 = this.f(o2);

  return o1.localeCompare ?
    o1.localeCompare(o2) :
    o1 - o2 ;
};


// TODO: add DISTINCT
// TODO: add 'contains', 'startsWith'
// TODO: add type-checking in partialEval
//  (type-checking is a subset of partial-eval)

var EXPR = FOAM({
   model_: 'Model',

   name: 'EXPR',

   methods: {
     // Mustang Query Language
     toMQL: function() {
       return this.toString();
     },
     toSQL: function() {
       return this.toString();
     },
     partialEval: function() { return this; },
     normalize: function() { return this; },
     toString: function() { return this.label_; },
     pipe: function(sink) {
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

   extendsModel: 'EXPR',

   name: 'TRUE',

   methods: {
     toSQL: function() { return '( 1 = 1 )'; },
     toMQL: function() { return ''; },
     f:     function() { return true; }
   }
})).create();


var FALSE = (FOAM({
   model_: 'Model',

   extendsModel: 'EXPR',

   name: 'FALSE',

   methods: {
     toSQL: function(out) { return '( 1 <> 1 )'; },
     toMQL: function(out) { return '<false>'; },
     f:     function() { return false; }
   }
})).create();

var IDENTITY = (FOAM({
    model_: 'Model',
    extendsModel: 'EXPR',
    name: 'IDENT',
    methods: {
        f: function(obj) { return obj; },
        toString: function() { return 'IDENTITY'; }
    }
})).create();

/** An n-ary function. **/
var NARY = FOAM({
   model_: 'Model',

   extendsModel: 'EXPR',

   name: 'NARY',

   properties: [
      {
         name:  'args',
         label: 'Arguments',
         type:  'Expr[]',
         help:  'Sub-expressions',
         valueFactory: function() { return []; }
      }
   ],

   methods: {
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
var UNARY = FOAM({
   model_: 'Model',

   extendsModel: 'EXPR',

   name: 'UNARY',

   properties: [
      {
         name:  'arg1',
         label: 'Argument',
         type:  'Expr',
         help:  'Sub-expression',
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
var BINARY = FOAM({
   model_: 'Model',

   extendsModel: 'UNARY',

   name: 'BINARY',

   properties: [
      {
         name:  'arg2',
         label: 'Argument',
         type:  'Expr',
         help:  'Sub-expression',
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


var AndExpr = FOAM({
   model_: 'Model',

   extendsModel: 'NARY',

   name: 'AndExpr',

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
            s += a.toMQL();
            if ( i < this.args.length-1 ) s += (' ');
         }
         return s;
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

        if ( newArgs.length == 0 ) return TRUE;
        if ( newArgs.length == 1 ) return newArgs[0];

        return updated ? AndExpr.create({args: newArgs}) : this;
      },

      f: function(obj) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          var a = this.args[i];

          if ( ! a.f(obj) ) return false;
        }
        return true;
      }
   }
});


var OrExpr = FOAM({
   model_: 'Model',

   extendsModel: 'NARY',

   name: 'OrExpr',

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
         var s;
         s = '(';
         for ( var i = 0 ; i < this.args.length ; i++ ) {
            var a = this.args[i];
            s += a.toMQL();
            if ( i < this.args.length-1 ) s += (' OR ');
         }
         s += ')';
         return s;
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

        if ( newArgs.length == 0 ) return FALSE;
        if ( newArgs.length == 1 ) return newArgs[0];

        return updated ? OrExpr.create({args: newArgs}) : this;
      },

      f: function(obj) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          var a = this.args[i];

          if ( a.f(obj) ) return true;
        }
        return false;
      }
   }
});


var NotExpr = FOAM({
   model_: 'Model',

   extendsModel: 'UNARY',

   name: 'NotExpr',

   methods: {
      toSQL: function() {
         return 'not ( ' + this.arg1.toSQL() + ' )';
      },
      toMQL: function() {
         return '-( ' + this.arg1.toMQL() + ' )';
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


var DescribeExpr = FOAM({
   model_: 'Model',

   extendsModel: 'UNARY',

   name: 'DescribeExpr',

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

        return this.arg1 === newArg ? this : DESCRIBE(newArg);
      },
      f: function(obj) { return this.arg1.f(obj); }
   }
});


var EqExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'EqExpr',

   methods: {
      toSQL: function() { return this.arg1.toSQL() + '=' + this.arg2.toSQL(); },
      toMQL: function() { return this.arg1.toMQL() + '=' + this.arg2.toMQL(); },

      partialEval: function() {
        var newArg1 = this.arg1.partialEval();
        var newArg2 = this.arg2.partialEval();

        if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
          return compile_(newArg1.f() === newArg2.f());
        }

        return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
          EqExpr.create({arg1: newArg1, arg2: newArg2}) :
          this;
      },

      f: function(obj) {
        var arg1 = this.arg1.f(obj);
        var arg2 = this.arg2.f(obj);

        if ( Array.isArray(arg1) ) {
          for ( var i = 0 ; i < arg1.length ; i++ ) {
            if ( arg1[i] === arg2 ) return true;
          }
          return false;
        }

        return arg1 === arg2;
      }
   }
});

var InExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'InExpr',

   properties: [
      {
         name:  'arg2',
         label: 'Argument',
         type:  'Expr',
         help:  'Sub-expression',
         preSet: function(a) {
            var s = {};
            for ( var i = 0 ; i < a.length ; i++ ) s[a[i]] = true;
            return s;
         }
      }
   ],

   methods: {
      toSQL: function() { return this.arg1.toSQL() + ' IN ' + this.arg2.toSQL(); },
      toMQL: function() { return this.arg1.toMQL() + ' IN ' + this.arg2.toMQL(); },

      f: function(obj) {
        var arg1 = this.arg1.f(obj);
        var arg2 = this.arg2       ;

        return arg2.hasOwnProperty(arg1);
      }
   }
});

var ContainsExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'ContainsExpr',

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
          for ( var i = 0 ; i < arg1.length ; i++ ) {
            if ( arg1.indexOf(arg2) != -1 ) return true;
          }
          return false;
        }

        return arg1.indexOf(arg2) != -1;
      }
   }
});


var ContainsICExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'ContainsICExpr',

   properties: [
      {
         name:  'arg2',
         label: 'Argument',
         type:  'Expr',
         help:  'Sub-expression',
         defaultValue: TRUE,
         preSet: function(oldValue) {
            return ConstantExpr.isInstance(oldValue) ?
               compile_(oldValue.f().toString().toLowerCase()) :
               oldValue;
         }
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
          ContainsExpr.create({arg1: newArg1, arg2: newArg2}) :
          this;
      },

      f: function(obj) {
        var arg1 = this.arg1.f(obj);
        var arg2 = this.arg2.f(obj);

        if ( Array.isArray(arg1) ) {
          for ( var i = 0 ; i < arg1.length ; i++ ) {
            if ( arg1[i].toLowerCase().indexOf(arg2) != -1 ) return true;
          }
          return false;
        }

        return arg1.toLowerCase().indexOf(arg2) != -1;
      }
   }
});


var NeqExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'NeqExpr',

   methods: {
      toSQL: function() { return this.arg1.toSQL() + '<>' + this.arg2.toSQL(); },
      toMQL: function() { return '-' + this.arg1.toMQL() + '=' + this.arg2.toMQL(); },

      partialEval: function() {
        var newArg1 = this.arg1.partialEval();
        var newArg2 = this.arg2.partialEval();

        if ( ConstantExpr.isInstance(newArg1) && ConstantExpr.isInstance(newArg2) ) {
          return compile_(newArg1.f() !== newArg2.f());
        }

        return this.arg1 !== newArg1 || this.arg2 != newArg2 ?
          NeqExpr.create({arg1: newArg1, arg2: newArg2}) :
          this;
      },

      f: function(obj) { return this.arg1.f(obj) !== this.arg2.f(obj); }
   }
});

var LtExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'LtExpr',

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

var GtExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'GtExpr',

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

var LteExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'LteExpr',

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

var GteExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'GteExpr',

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


var ConstantExpr = FOAM({
   model_: 'Model',

   extendsModel: 'UNARY',

   name: 'ConstantExpr',

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
            this.arg1.toString() ;
      },
      f: function(obj) { return this.arg1; }
   }
});


var ConcatExpr = FOAM({
   model_: 'Model',

   extendsModel: 'NARY',

   name: 'ConcatExpr',
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
  return /*EXPR.isInstance(a) || Property.isInstance(a)*/ a.f ? a :
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


var SumExpr = FOAM({
   model_: 'Model',

   extendsModel: 'UNARY',

   name: 'SumExpr',

   properties: [
      {
         name:  'sum',
         type:  'int',
         help:  'Sum of values.',
         valueFactory: function() { return 0; }
      }
   ],

   methods: {
     pipe: function(sink) { sink.put(this); },
     put: function(obj) { this.instance_.sum += this.arg1.f(obj); },
     remove: function(obj) { this.sum -= this.arg1.f(obj); },
     toString: function() { return this.sum; },
     clone: function() { return this; var c = SumExpr.create(); c.instance_.sum = this.instance_.sum; return c; }
   }
});


var AvgExpr = FOAM({
   model_: 'Model',

   extendsModel: 'UNARY',

   name: 'AvgExpr',

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


var MaxExpr = FOAM({
   model_: 'Model',

   extendsModel: 'UNARY',

   name: 'MaxExpr',

   properties: [
      {
         name:  'max',
         type:  'int',
         help:  'Maximum value.',
         defaultValue: undefined
      }
   ],

   methods: {
     reduce: function(other) {
       return MaxExpr.create({max: Math.max(this.max, other.max)});
     },
     reduceI: function(other) {
       this.max = Math.max(this.max, other.max);
     },
     pipe: function(sink) { sink.put(this); },
     put: function(obj) {
       var v = this.arg1.f(obj);
       this.max = this.max === undefined ? v : Math.max(this.max, v);
     },
     remove: function(obj) { },
     toString: function() { return this.max; }
   }
});


var MinExpr = FOAM({
   model_: 'Model',

   extendsModel: 'UNARY',

   name: 'MinExpr',

   properties: [
      {
         name:  'min',
         type:  'int',
         help:  'Minimum value.',
         defaultValue: undefined
      }
   ],

   methods: {
     reduce: function(other) {
       return MinExpr.create({max: Math.min(this.min, other.min)});
     },
     reduceI: function(other) {
       this.min = Math.min(this.min, other.min);
     },
     pipe: function(sink) { sink.put(this); },
     put: function(obj) {
       var v = this.arg1.f(obj);
       this.min = this.min === undefined ? v : Math.min(this.min, v);
     },
     remove: function(obj) { },
     toString: function() { return this.min; }
   }
});


var DistinctExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'DistinctExpr',

   properties: [
      {
         name:  'values',
         help:  'Distinct values.',
         valueFactory: function() { return {}; }
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


var GroupByExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'GroupByExpr',

   properties: [
      {
         name:  'groups',
         type:  'Map[EXPR]',
         help:  'Groups.',
         valueFactory: function() { return {}; }
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
     put: function(obj) {
       var key = this.arg1.f(obj);
       if ( Array.isArray(key) ) {
         for ( var i = 0 ; i < key.length ; i++ ) {
           var group = this.groups.hasOwnProperty(key[i]) && this.groups[key[i]];
           if ( ! group ) {
             group = this.arg2.clone();
             this.groups[key[i]] = group;
           }
           group.put(obj);
         }
       } else {
         var group = this.groups.hasOwnProperty(key) && this.groups[key];
         if ( ! group ) {
           group = this.arg2.clone();

           this.groups[key] = group;
         }
         group.put(obj);
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


var GridByExpr = FOAM({
   model_: 'Model',

   extendsModel: 'EXPR',

   name: 'GridByExpr',

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
         type:  'Map[EXPR]',
         help:  'Rows.',
         valueFactory: function() { return {}; }
      },
      {
         name:  'cols',
         label: 'Columns',
         type:  'Map[EXPR]',
         help:  'Columns.',
         valueFactory: function() { return {}; }
      }
   ],

   methods: {
    init: function() {
      AbstractPrototype.init.call(this);

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
       return GroupByExpr.create({xFunc: this.xFunc, yFunc: this.yFunc, acc: this.acc});
     },
     remove: function(obj) { /* TODO: */ },
     toString: function() { return this.groups; },
     deepClone: function() {
     },
     toHTML: function() {
       var out;
       var cols = this.cols.groups;
       var rows = this.rows.groups;

       out = '<table border=0 cellspacing=0 class="gridBy"><tr><th></th>';

       for ( var x in cols ) {
         var str = x.toHTML ? x.toHTML() : x;
         out += '<th>', str, '</th>';
       }
       out += '</tr>';

       for ( var y in rows ) {
         out += '<tr><th>' + y + '</th>';

         for ( var x in cols ) {
           var value = rows[y].groups[x];
           var str = value ? (value.toHTML ? value.toHTML() : value) : '';
           out += '<td>' + str + '</td>';
         }
         out += '</tr>';
       }
       out += '</table>';

       return out;
     },

     initHTML: function() {
       var rows = this.rows.groups;

       for ( var y in rows ) {
         for ( var x in rows[y].groups ) {
            var value = rows[y].groups[x];
            value.initHTML && value.initHTML();
         }
       }
     }
   }
});


var MapExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'MapExpr',

   methods: {
     reduce: function(other) {
       // TODO:
     },
     reduceI: function(other) {
     },
     pipe: function(sink) {
     },
     put: function(obj) {
       var val = this.arg1.f(obj);
       var acc = this.arg2;
       if ( Array.isArray(acc) ) {
         acc.push(val);
       } else {
         acc.put(val);
       }
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
     }
   }
});


var CountExpr = FOAM({
   model_: 'Model',

   extendsModel: 'EXPR',

   name: 'CountExpr',

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


var SeqExpr = FOAM({
   model_: 'Model',

   extendsModel: 'NARY',

   name: 'SeqExpr',

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

var UpdateExpr = FOAM({
    model_: 'Model',

    extendsModel: 'NARY',

    name: 'UpdateExpr',
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
      put: function(obj) {
        var newObj = this.f(obj);
        if (newObj.id !== obj.id) this.dao.remove(obj.id);
        this.dao.put(newObj);
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

var SetExpr = FOAM({
    model_: 'Model',

    name: 'SetExpr',
    label: 'SetExpr',

    extendsModel: 'BINARY',

    methods: {
      toSQL: function() { return this.arg1.toSQL() + ' = ' + this.arg2.toSQL(); },
      f: function(obj) {
        if (Property.isInstance(this.arg1) && ConstantExpr.isInstance(this.arg2)) {
          obj[this.arg1.name] = this.arg2.f();
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

function GROUP_BY(expr1, expr2) {
  return GroupByExpr.create({arg1: expr1, arg2: expr2});
}

function GRID_BY(xFunc, yFunc, acc) {
  return GridByExpr.create({xFunc: xFunc, yFunc: yFunc, acc: acc});
}

function MAP(fn, sink) {
  return MapExpr.create({arg1: fn, arg2: sink});
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

function DESCRIBE(arg) {
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

function CONTAINS(arg1, arg2) {
  return ContainsExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function CONTAINS_IC(arg1, arg2) {
  return ContainsICExpr.create({arg1: compile_(arg1), arg2: compile_(arg2)});
}

function CONCAT() {
  return ConcatExpr.create({args: compileArray_.call(null, arguments)});
}


var ExpandableGroupByExpr = FOAM({
   model_: 'Model',

   extendsModel: 'BINARY',

   name: 'ExpandableGroupByExpr',

   properties: [
      {
         name:  'groups',
         type:  'Map[EXPR]',
         help:  'Groups.',
         valueFactory: function() { return {}; }
      },
      {
         name:  'expanded',
         type:  'Map',
         help:  'Expanded.',
         valueFactory: function() { return {}; }
      },
      {
         name:  'values',
         type:  'Object',
         help:  'Values',
         valueFactory: function() { return []; }
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
       this.values.select({put:function(o) {
         sink.put(o);
         var key = self.arg1.f(o);
         var a = o.children;
         if ( a ) for ( var i = 0 ; i < a.length ; i++ ) sink.put(a[i]);
       }}, options);
       return aconstant(sink);
     },
     put: function(obj) {
       var key = this.arg1.f(obj);

       var group = this.groups.hasOwnProperty(key) && this.groups[key];

       if ( ! group ) {
         group = obj.clone();
         if ( this.expanded[key] ) group.children = [];
         this.groups[key] = group;
         group.count = 1;
         this.values.push(group);
       } else {
         group.count++;
       }

       if ( group.children ) group.children.push(obj);
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
var MONTH = function(p) { return {f: function (o) { return o._month = p.f(o).getMonth(); }}; };
