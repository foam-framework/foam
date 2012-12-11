function dump(o) {
   if ( Array.isArray(o) ) return '[' + o.map(dump).join(',') + ']';
   return o ? o.toString() : '<undefined>';
}



var ValueIndex = {
  put: function(oldValue, newValue) { return newValue; },
  remove: function() {},
  plan: (function() {
           var plan = {
             cost: 1,
             execute: function(s, sink) {
               sink.put(s);
             },
             toString: function() { return 'unique'; }
           };

           return function() { return plan; };
         })(),
  select: function(value, sink) { sink.put(value); },
  selectReverse: function(value, sink) { sink.put(value); },
  size:   function(obj) { return 1; }
};


var TreeIndex = {
  create: function(prop, tail) {
    tail = tail || ValueIndex;

    return {
      __proto__: this,
      prop: prop,
      tail: tail
    };
  },

  put: function(oldValue, newValue) {
    return this.putKeyValue(oldValue, this.prop.f(newValue), newValue);
  },

  putKeyValue: function(s, key, value) {
    if ( ! s ) {
      return [key, this.tail.put(null, value), 1];
    }

    var r = this.compare(s[0], key);

    if ( r == 0 ) {
      s[2] -= this.tail.size(s[1]);
      s[1] = this.tail.put(s[1], value);
      s[2] += this.tail.size(s[1]);
    } else if ( r > 0 ) {
      if ( s[3] ) s[2] -= s[3][2];
      s[3] = this.putKeyValue(s[3], key, value);
      s[2] += s[3][2];
    } else {
      if ( s[4] ) s[2] -= s[4][2];
      s[4] = this.putKeyValue(s[4], key, value);
      s[2] += s[4][2];
    }

    return s;
  },

  get: function(s, key) {
    if ( ! s ) return undefined;

    var r = this.compare(s[0], key);

    if ( r === 0 ) return s[1];

    return this.get(r > 0 ? s[3] : s[4], key);
  },

  select: function(s, sink) {
    if ( ! s ) return;
    this.select(s[3], sink);
    this.tail.select(s[1], sink);
    this.select(s[4], sink);
  },

  selectReverse: function(s, sink) {
    if ( ! s ) return;
    this.selectReverse(s[4], sink);
    this.tail.selectReverse(s[1], sink);
    this.selectReverse(s[3], sink);
  },

  size: function(s) { return s[2]; },

  compare: function(o1, o2) {
    return o1.compareTo(o2); //this.prop.compare(o1, o2);
  },

  plan: function(s, sink, options) {
    var query = options && options.query;

    var prop = this.prop;
    var index = this;

    var getEQKey = function (query) {
      if ( query.model_ === EqExpr && query.arg1 === prop ) {
        return query.arg2.f();
      }
      return undefined;
    };

    var getAndKey = function () {
      if ( query.model_ === AndExpr ) {
        for ( var i = 0 ; i < query.args.length ; i++ ) {
          var q = query.args[i];
          var k = getEQKey(q);
          if ( k ) {
            query.args[i] = TRUE;
            query = query.partialEval();
            return k;
          }
        }
      }
      return undefined;
    };

    if ( query ) {
      var key = getEQKey(query) || getAndKey();

      if ( key ) {
        var result = s[1];
        var subPlan = result && this.tail.plan(result, sink, options);
        return {
          cost: result ? subPlan.cost : 0,
          execute: function(s, sink) {
            subPlan.execute(s, sink);
          },
          toString: function() { return 'lookup(key=' + prop.name + ', cost=' + this.cost + ') ' + subPlan.toString(); }
        };
      }
    }

    return {
      cost: this.size(s),
      execute: function() {
        index.select(s, sink);
      },
      toString: function() { return 'scan(key=' + prop.name + ', cost=' + this.cost + ')'; }
    };
  }

};


// [0 key, 1 value, 2 size, 3 left, 4 right]
var OrderedMap = {
  create: function(prop) {
    return {
      __proto__: this,
      root: undefined,
      index: TreeIndex.create(prop)
    };
  },

  putObject: function(value) { this.root = this.index.put(this.root, value); },
  put: function(key, value) { this.root = this.index.putKeyValue(this.root, key, value); },
  get: function(key) { return this.index.get(this.root, key); },
  select: function(sink) { this.index.select(this.root, sink); },
  selectReverse: function(sink) { this.index.selectReverse(this.root, sink); },
  size: function() { return this.index.size(this.root); }
};


var m = OrderedMap.create({compare: StringComparator, f: function(x) { return x;}});

console.log('\nOrderedSet Test');
m.putObject('k');
m.putObject('e');
m.putObject('v');
m.putObject('i');
m.putObject('n');
m.putObject('kevin');
m.putObject('greer');
m.putObject('was');
m.putObject('here');
m.putObject('boo');

m.select(console.log);

console.log(m.get('kevin'));
m.put('kevin', 'greer');
console.log(m.get('kevin'));


var MemoryDAO = FOAM.create({
   model_: 'Model',
   extendsModel: 'AbstractDAO2',

   name: 'MemoryDAO',
   label: 'Memory DAO',

   properties: [
      {
         name:  'model',
         label: 'Model',
         type:  'Model',
         required: true
      }
   ],

   methods: {

    init: function() {
      AbstractPrototype.init.call(this);

      this.index = TreeIndex.create(this.model.getProperty(this.model.ids[0]));
    },

    put: function(obj, sink) {
      this.root = this.index.put(this.root, obj);
      // TODO: notify
    },

    find: function(key, sink) {
      // TODO:
    },

    remove: function(query, sink) {
      // TODO:
    },

    select: function(sink, options) {
      var plan = this.index.plan(this.root, sink, options);
      if ( plan ) {
        console.log(plan.toString());
        plan.execute(this.root, sink);
      }
      sink && sink.eof && sink.eof();
    }

   }
});

console.log('\nMemoryDAO Test');

var d = MemoryDAO.create({model:Issue});

d.put(Issue.create({id:1, severity:'Minor', status:'Open'}));
d.put(Issue.create({id:2, severity:'Major', status:'Closed'}));
d.put(Issue.create({id:3, severity:'Feature', status:'Accepted'}));

d.select(console.log);

d.where(EQ(Issue.ID, 2)).select(console.log);
