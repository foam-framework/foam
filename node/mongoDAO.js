// Expects FOAM to already be loaded globally, and MongoDB's Node module to be installed.
var mongo = require('mongodb');

global.MongoDAO = FOAM({
  model_: 'Model',
  extendsModel: 'AbstractDAO',

  name: 'MongoDAO',
  label: 'MongoDB DAO',

  properties: [
    {
      name:  'model',
      label: 'Model',
      type:  'Model',
      required: true
    },
    {
      name:  'database',
      label: 'URL for the Database, as used by MongoClient, eg. "mongodb://localhost:27017/example"',
      type:  'String',
      required: true
    },
    {
      name:  'collection',
      label: 'Collection name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.withDB = amemo(this.openDB.bind(this));

      this.serialize = this.FOAMSerialize;
      this.deserialize = this.FOAMDeserialize;
    },

    FOAMDeserialize: function(json) {
      return JSONToObject.visitObject(json);
    },

    FOAMSerialize: function(obj) {
      return ObjectToJSON.visitObject(obj);
    },

    // NB: Returns the collection, not the database connection.
    openDB: function(cc) {
      var self = this;
      mongo.MongoClient.connect(this.database, function(err, db) {
        if (!err) {
          cc(db.collection(self.collection));
        } else {
          console.error(err);
        }
      });
    },

    withSink: function(sink, future, query) {
      var self = this;
      return function(err, result) {
        if (err) sink && sink.error && sink.error(err);
        else if (result === null) {
          sink && sink.eof && sink.eof();
          future && future.set(sink, err || undefined);
        }
        else {
          if (query && query.f && !query.f(result)) {
            console.log('rejecting', result);
            return;
          }
          sink && sink.put && sink.put(self.deserialize(result));
        }
      };
    },

    put: function(value, sink) {
      var serialized = this.serialize(value);
      serialized._id = value.id;
      var self = this;
      this.withDB(function(db) {
        // Use an "upsert" to either overwrite or insert.
        db.save(serialized, {w:1}, function(err, result) {
          if (err) {
            sink && sink.error && sink.error(err);
          } else {
            sink && sink.put && sink.put(value);
          }
        });
      });
    },

    find: function(query, sink) {
      query = EXPR.isInstance(query) ? query.toMongo() : { _id: query };
      var self = this;
      this.withDB(function(db) {
        db.findOne(query, self.withSink(sink));
      });
    },

    removeAll: function(sink, options) {
      var future = afuture();
      var self = this;
      var doRemove = function() {
        var query = null;
        if (options && options.query) query = options.query.toMongo();
        self.withDB(function(db) {
          db.remove(query, function(err, result) {
            if (err) sink && sink.error && sink.error(err);
            else {
              sink && sink.eof && sink.eof();
              future.set();
            }
          });
        });
      };

      if (sink && sink.remove) {
        var arr = [];
        this.select({ put: sink.remove, error: sink.error, eof: doRemove }, options);
      } else {
        doRemove();
      }

      return future.get;
    },

    remove: function(obj, sink) {
      this.withDB(function(db) {
        db.remove({ _id: obj.id }, function(err, result) {
          if (err) sink && sink.error && sink.error(err);
          else sink && sink.remove && sink.remove(obj);
        });
      });
    },

    select: function(sink, options) {
      options = options || {};
      sink = sink || [];

      var self = this;
      var opts = {};
      var query = null;
      if (typeof options.limit !== 'undefined') opts.limit = options.limit;
      if (typeof options.skip  !== 'undefined') opts.skip = options.skip;
      if (typeof options.query !== 'undefined') query = options.query.toMongo();
      // TODO: Sort in Mongo instead of JS.
      // Special handling for SUM, AVG, MIN and MAX.
      // They extract a single field and then process it.
      if (SumExpr.isInstance(sink) || AvgExpr.isInstance(sink)) {
        opts.fields = { model_: 1 };
        opts.fields[sink.arg1.toMongo()] = 1;
      }
      if (MinExpr.isInstance(sink) || MaxExpr.isInstance(sink)) {
        opts.fields = { model_: 1 };
        var field = sink.arg1.toMongo();
        opts.fields[field] = 1;
        opts.sort = [ [field, MinExpr.isInstance(sink) ? 1 : -1 ] ];
        opts.limit = 1;
      }

      var future = afuture();
      this.withDB(function(db) {
        console.log(query, opts);
        db.find(query, opts, function(err, cursor) {
          if (err) return sink && sink.error && sink.error(err);
          if (CountExpr.isInstance(sink)) {
            cursor.count(function(err, count) {
              if (err) sink && sink.err && sink.err(err);
              sink.count = count;
              future.set(sink);
            });
            return;
          }
          var decorated = self.decorateSink_(sink, { order: options.order });
          var sinkFunc = self.withSink(decorated, future, options && options.query);
          cursor.each(sinkFunc);
        });
      });
      return future.get;
    }
  }
});


// Mix-in toMongo to the various expression models, so that mLang expressions can be
// converted easily to Mongo query objects.
// Note that queries we don't understand, such as EQ(Model.FOO, Model.BAR), get
// turned into TRUE.
TRUE.toMongo = function() { return {}; };
FALSE.toMongo = function() { return { ___nonexistent___: 0 }; };
AndExpr.methods.toMongo = function() {
  var total = {};
  this.args.forEach(function(arg) {
    Object_forEach(arg.toMongo(), function(val, key) {
      if (!total[key]) {
        total[key] = val;
      } else {
        console.warn('Query collision: two values for "' + key + '": "' + total[key] + '" and "' + val + '"');
      }
    });
  });
  return total;
};

OrExpr.methods.toMongo = function() {
  return { $or: this.args.map(function(arg) { return arg.toMongo(); }) };
};

NotExpr.methods.toMongo = function() {
  if (this.arg1 === FALSE) return TRUE.toMongo();
  return { $not: this.arg1.toMongo() };
};

DescribeExpr.methods.toMongo = function() { return this.arg1.toMongo(); };

function validArgs(expr) {
  // The only valid case is LHS is a Property, RHS is a Constant.
  if (Property.isInstance(expr.arg1) && ConstantExpr.isInstance(expr.arg2)) {
    return true;
  }
  // Check if it's backwards.
  if (Property.isInstance(expr.arg2) && ConstantExpr.isInstance(expr.arg1)) {
    var temp = expr.arg1;
    expr.arg1 = expr.arg2;
    expr.arg2 = temp;
    return true;
  }

  return false;
}


// TODO: These binary expressions assume the left-hand-side value is the field.
EqExpr.methods.toMongo = function() {
  if(!validArgs(this)) return TRUE.toMongo();
  var ret = {};
  ret[this.arg1.toMongo()] = this.arg2.toMongo();
  return ret;
};
InExpr.methods.toMongo = function() {
  if (!(Property.isInstance(this.arg1) && this.arg2 instanceof Array)) return TRUE.toMongo();
  var ret = {};
  ret[this.arg1.toMongo()] = { $in: this.arg2 };
  return ret;
};


function binOp(name) {
  return function() {
    if (!validArgs(this)) return TRUE.toMongo();
    var inner = {};
    inner[name] = this.arg2.toMongo();
    var ret = {};
    ret[this.arg1.toMongo()] = inner;
    return ret;
  };
}

NeqExpr.methods.toMongo = binOp('$ne');
LtExpr.methods.toMongo = binOp('$lt');
GtExpr.methods.toMongo = binOp('$gt');
LteExpr.methods.toMongo = binOp('$lte');
GteExpr.methods.toMongo = binOp('$gte');

ContainsExpr.methods.toMongo = function() {
  if (!validArgs(this)) return TRUE.toMongo();
  var field = this.arg1.toMongo();
  var value = this.arg2.toMongo();
  var ret = {};
  ret[field] = new RegExp(RegExp.quote(value));
  return ret;
};
ContainsICExpr.methods.toMongo = function() {
  if (!validArgs(this)) return TRUE.toMongo();
  var field = this.arg1.toMongo();
  var value = this.arg2.toMongo().toLowerCase();
  var ret = {};
  ret[field] = new RegExp(RegExp.quote(value), 'i');
  return ret;
};

StartsWithExpr.methods.toMongo = function() {
  if (!validArgs(this)) return TRUE.toMongo();
  var field = this.arg1.toMongo();
  var value = this.arg2.toMongo();
  var ret = {};
  ret[field] = new RegExp('^' + RegExp.quote(value));
  return ret;
};

ConstantExpr.methods.toMongo = function() { return this.arg1; };

Property.getPrototype().toMongo = function() { return this.name; };

