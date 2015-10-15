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
CLASS({
  package: 'foam.node.dao',
  name: 'MongoDAO',
  extends: 'AbstractDAO',
  label: 'MongoDB DAO',
  requires: [
    'AndExpr',
    'ConstantExpr',
    'ContainsExpr',
    'ContainsICExpr',
    'EqExpr',
    'GtExpr',
    'GteExpr',
    'InExpr',
    'LtExpr',
    'LteExpr',
    'NeqExpr',
    'NotExpr',
    'OrExpr',
    'Property',
    'StartsWithExpr',
  ],
  imports: [
    'window',
  ],

  properties: [
    {
      name: 'model',
      required: true
    },
    {
      name: 'database',
      documentation: 'URL for the MongoDB instance, for example "mongodb://localhost:27017/example"',
      required: true
    },
    {
      name: 'collection',
      label: 'Collection Name',
      documentation: 'The name of the Mongo collection for this DAO. Defaults to the plural model name, (eg. if the model is "Todo", collection is "Todos").',
      defaultValueFn: function() {
        return this.model.plural;
      }
    },
    {
      name: 'withDB',
      factory: function() {
        return amemo(this.openDB.bind(this));
      }
    },
    {
      name: 'mongo',
      factory: function() {
        return require('mongodb');
      }
    },
  ],

  methods: [
    function deserialize(json) {
      return JSONToObject.visitObject(json);
    },

    function serialize(obj) {
      return ObjectToJSON.visitObject(obj);
    },

    // NB: Returns the collection, not the database connection.
    function openDB(cc) {
      var self = this;
      this.mongo.MongoClient.connect(this.database, function(err, db) {
        if (!err) {
          cc(db.collection(self.collection));
        } else {
          console.error(err);
        }
      });
    },

    function withSink(sink, future, query) {
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

    function put(value, sink) {
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
            self.notify_('put', [value]);
          }
        });
      });
    },

    function find(query, sink) {
      query = Expr.isInstance(query) ? query.toMongo() : { _id: query };
      var self = this;
      this.withDB(function(db) {
        db.findOne(query, self.withSink(sink));
      });
    },

    function removeAll(sink, options) {
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

      this.select({
        put: function(x) {
          sink && sink.remove && sink.remove(x);
          self.notify_('remove', [x]);
        },
        error: sink && sink.error,
        eof: doRemove
      }, options);

      return future.get;
    },

    function remove(obj, sink) {
      var self = this;
      this.withDB(function(db) {
        db.remove({ _id: obj.id }, function(err, result) {
          if (err) sink && sink.error && sink.error(err);
          else {
            sink && sink.remove && sink.remove(obj);
            self.notify_('remove', [obj]);
          }
        });
      });
    },

    function select(sink, options) {
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
    },

    function setupOverrides_() {
      if (this.window.__MONGO_MLANG_OVERRIDES_INSTALLED__) return;
      this.window.__MONGO_MLANG_OVERRIDES_INSTALLED__ = true;

      TRUE.toMongo = function() { return {}; };
      FALSE.toMongo = function() { return { ___nonexistent___: 0 }; };
      this.AndExpr.methods.toMongo = function() {
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

      this.OrExpr.methods.toMongo = function() {
        return { $or: this.args.map(function(arg) { return arg.toMongo(); }) };
      };

      this.NotExpr.methods.toMongo = function() {
        if (this.arg1 === FALSE) return TRUE.toMongo();
        return { $not: this.arg1.toMongo() };
      };

      function validArgs(expr) {
        // The only valid case is LHS is a Property, RHS is a Constant.
        if (this.Property.isInstance(expr.arg1) && this.ConstantExpr.isInstance(expr.arg2)) {
          return true;
        }
        // Check if it's backwards.
        if (this.Property.isInstance(expr.arg2) && this.ConstantExpr.isInstance(expr.arg1)) {
          var temp = expr.arg1;
          expr.arg1 = expr.arg2;
          expr.arg2 = temp;
          return true;
        }

        return false;
      }


      // TODO: These binary expressions assume the left-hand-side value is the field.
      this.EqExpr.methods.toMongo = function() {
        if(!validArgs(this)) return TRUE.toMongo();
        var ret = {};
        ret[this.arg1.toMongo()] = this.arg2.toMongo();
        return ret;
      };
      this.InExpr.methods.toMongo = function() {
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

      this.NeqExpr.methods.toMongo = binOp('$ne');
      this.LtExpr.methods.toMongo = binOp('$lt');
      this.GtExpr.methods.toMongo = binOp('$gt');
      this.LteExpr.methods.toMongo = binOp('$lte');
      this.GteExpr.methods.toMongo = binOp('$gte');

      var regexQuote = function(str) {
        return (str+'').replace(/[.*+^$[\]\\(){}|-]/g, '\\$&');
      };

      this.ContainsExpr.methods.toMongo = function() {
        if (!validArgs(this)) return TRUE.toMongo();
        var field = this.arg1.toMongo();
        var value = this.arg2.toMongo();
        var ret = {};
        ret[field] = new RegExp(regexQuote(value));
        return ret;
      };
      this.ContainsICExpr.methods.toMongo = function() {
        if (!validArgs(this)) return TRUE.toMongo();
        var field = this.arg1.toMongo();
        var value = this.arg2.toMongo().toLowerCase();
        var ret = {};
        ret[field] = new RegExp(regexQuote(value), 'i');
        return ret;
      };

      this.StartsWithExpr.methods.toMongo = function() {
        if (!validArgs(this)) return TRUE.toMongo();
        var field = this.arg1.toMongo();
        var value = this.arg2.toMongo();
        var ret = {};
        ret[field] = new RegExp('^' + regexQuote(value));
        return ret;
      };

      this.ConstantExpr.methods.toMongo = function() { return this.arg1; };
      this.Property.getPrototype().toMongo = function() { return this.name; };
    },
    function init(args) {
      this.SUPER(args);
      this.setupOverrides_();
    },
  ]
});
