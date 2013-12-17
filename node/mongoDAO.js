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

    withSink: function(sink, future) {
      var self = this;
      return function(err, result) {
        if (err) sink && sink.error && sink.error(err);
        else if (result == null) {
          sink && sink.eof && sink.eof();
          future.set(sink, err);
        }
        else sink && sink.put && sink.put(self.deserialize(result));
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

    remove: function(query, sink) {
      query = EXPR.isInstance(query) ? query.toMongo() : { _id: query };
      var self = this;
      this.withDB(function(db) {
        db.remove(query, self.withSink(sink));
      });
    },

    select: function(sink, options) {
      var self = this;
      var opts = {};
      var query = null;
      options = options || {};
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
        db.find(query, opts, function(err, cursor) {
          if (err) return sink && sink.error && sink.error(err);
          if (CountExpr.isInstance(sink)) {
            cursor.count(true, function(err, count) {
              if (err) sink && sink.err && sink.err(err);
              sink.count = count;
              future.set(sink);
            });
            return;
          }
          var decorated = self.decorateSink_(sink, { order: options.order });
          var sinkFunc = self.withSink(decorated, future);
          cursor.each(sinkFunc);
        });
      });
      return future.get;
    }
  }
});


// Mix-in toMongo to the various expression models, so that mLang expressions can be
// converted easily to Mongo query objects.
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
  return { $not: this.arg1.toMongo() };
};

DescribeExpr.methods.toMongo = function() { return this.arg1.toMongo(); };

// TODO: These binary expressions assume the left-hand-side value is the field.
EqExpr.methods.toMongo = function() {
  var ret = {};
  ret[this.arg1.toMongo()] = this.arg2.toMongo();
  return ret;
};
InExpr.methods.toMongo = function() {
  var ret = {};
  ret[this.arg1.toMongo()] = { $in: this.arg2 };
  return ret;
};


function binOp(name) {
  return function() {
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
  var field = this.arg1.toMongo();
  var value = this.arg2.toMongo();
  return { $where: function() { return obj[field].indexOf(value) >= 0; } };
};
ContainsICExpr.methods.toMongo = function() {
  var field = this.arg1.toMongo();
  var value = this.arg2.toMongo().toLowerCase();
  return { $where: function() { return obj[field].toLowerCase().indexOf(value) >= 0; } };
};

StartsWithExpr.methods.toMongo = function() {
  var field = this.arg1.toMongo();
  var value = this.arg2.toMongo();
  return { $where: function() { return obj[field].indexOf(value) == 0; } };
};

ConstantExpr.methods.toMongo = function() { return this.arg1; };

Property.getPrototype().toMongo = function() { return this.name; };

