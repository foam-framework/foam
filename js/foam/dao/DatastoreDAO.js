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

MODEL({
  package: 'foam.dao',
  name: 'DatastorePropertyTrait',

  documentation: 'Enhances a property model with (de)serialization to Google Cloud Datastore\'s JSON format.',
  properties: [
    {
      name: 'datastoreKey',
      documentation: 'The key that should be used for this property in the datastore. Defaults to the FOAM property\'s name.',
      defaultValueFn: function() { return this.name; }
    }
  ],

  constants: {
    TYPE_MAP: {
      'int': 'integerValue',
      'Int': 'integerValue',
      'String': 'stringValue',
      'string': 'stringValue',
      'Boolean': 'booleanValue',
      'float': 'doubleValue',
      'datetime': 'dateTimeValue'
    }
  },

  methods: {
    fromDatastore: function(json) {
      // Keys, blobs, lists and entities require special handling.
      // I'm not going to handle them for now, but as needed.
      // TODO(braden): Datastore should support Key properties.
      // TODO(braden): Datastore should support list properties.
      // TODO(braden): Datastore should support Entity properties.
      // TODO(braden): Datastore should support Blob properties.
      if ( this.TYPE_MAP[this.type] ) {
        var key = this.TYPE_MAP[this.type];
        return json[key];
      } else {
        console.warn('Skipping property ' + this.name + ' because it has unknown type "' + this.type + '".');
      }
    },
    toDatastore: function(value) {
      if ( this.TYPE_MAP[this.type] ) {
        var key = this.TYPE_MAP[this.type];
        var obj = {};
        obj[key] = value;
        return obj;
      } else {
        console.warn('Skipping property ' + this.name + ' because it has unknown type "' + this.type + '".');
      }
    }
  }
});

MODEL({
  name: 'DatastoreSerializationTrait',
  requires: ['DatastoreKey'],
  methods: {
    // Takes the JSON-parsed object from the Datastore and pulls it apart into
    // the FOAM model.
    fromDatastore: function(json) {
      // Datastore object is a "key" field and "properties" object.
      // Ignoring the key for now, iterate the properties object.
      var key = this.DatastoreKey.create({ path: json.key.path });
      this.id = key.string;

      var properties = this.model_.getRuntimeProperties();
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var prop = properties[i];
        if ( prop.datastoreKey ) {
          this[prop.name] = prop.fromDatastore(json.properties[prop.datastoreKey]);
        }
      }
    },

    toDatastore: function() {
      // Returns the serialized object with its key and properties.
      var json = {
        properties: {}
      };
      if ( this.id ) {
        var key = this.DatastoreKey.create({ string: this.id });
        json.key = { path: key.path };
      }

      var properties = this.model_.getRuntimeProperties();
      for ( var i = 0 ; i < properties.length ; i++ ) {
        var prop = properties[i];
        if ( prop.datastoreKey ) {
          json.properties[prop.datastoreKey] = prop.toDatastore(this[prop.name]);
        }
      }
      return json;
    }
  }
});


MODEL({
  name: 'DatastoreIntProperty',
  extends: 'IntProperty',
  traits: ['DatastorePropertyTrait']
});


MODEL({
  name: 'DatastoreStringProperty',
  extends: 'StringProperty',
  traits: ['DatastorePropertyTrait']
});


MODEL({
  name: 'DatastoreFloatProperty',
  extends: 'FloatProperty',
  traits: ['DatastorePropertyTrait']
});


MODEL({
  name: 'DatastoreDateTimeProperty',
  extends: 'DateTimeProperty',
  traits: ['DatastorePropertyTrait']
});


MODEL({
  name: 'DatastoreBooleanProperty',
  extends: 'BooleanProperty',
  traits: ['DatastorePropertyTrait']
});


MODEL({
  name: 'Datastore',
  documentation: 'Wrapper for the googleapis calls around the Datastore.',
  properties: [
    {
      name: 'datasetId',
      required: true
    },
    {
      name: 'gapi',
      factory: function() {
        return require('googleapis');
      }
    },
    {
      name: 'clientFuture',
      factory: function() {
        var comp = new this.gapi.auth.Compute();
        var fut = afuture();
        var self = this;
        comp.authorize(function(err) {
          if ( err ) {
            console.error('Google API auth error: ' + err);
            return;
          }
          self.gapi.discover('datastore', 'v1beta2')
              .withAuthClient(comp)
              .execute(function(err, client) {
                if ( err ) {
                  console.error('Google API discovery error: ' + err);
                  return;
                }
                fut.set(client.datastore.withDefaultParams({
                  datasetId: self.datasetId
                }).datasets);
              });
        });
        return fut.get;
      }
    }
  ],

  methods: {
    withClientExecute: function(method, payload) {
      return aseq(
        this.clientFuture,
        function(ret, client) {
          client[method](payload).execute(function(err, res) {
            if (err) {
              console.error('Error in ' + method + ' call: ' + require('util').inspect(err, { depth: null }));
              return;
            }
            ret(res);
          });
        }
      );
    }
  }
});


MODEL({
  name: 'DatastoreKey',
  properties: [
    {
      name: 'path',
      factory: function() { return []; },
      postSet: function(old, nu) {
        delete this.instance_['string'];
      }
    },
    {
      name: 'string',
      getter: function() {
        if ( ! this.instance_['string'] ) {
          var str = '';
          for ( var i = 0 ; i < this.path.length ; i++ ) {
            str += '/' + this.path[i].kind + '/' + this.path[i].id;
          }
          this.instance_['string'] = str;
        }

        return this.instance_['string'];
      },
      setter: function(nu) {
        var parts = nu.split('/');
        var path = [];
        for ( var i = 1 ; i < parts.length ; i += 2 ) {
          path.push({ kind: parts[i], id: parts[i+1] });
        }
        this.path = path;
        this.instance_['string'] = nu; // Needs to be at the end, or it will get overwritten.
      }
    }
  ]
});


MODEL({
  name: 'DatastoreDAO',
  extends: 'AbstractDAO',
  requires: [
    'DatastoreKey'
  ],

  documentation: function() {/*
    <p>Represents a connection to the Datastore JSON API. Will support all of the DAO operations eventually.</p>
    <p>Keys are represented in the Datastore as one or more (EntityType, ID) pairs. In the DAO, these are handled by keys of the form: <tt>/EntityType1/id1/EntityType2/id2</tt>. Therefore other DAOs see an opaque string ID, as they expect, while the DatastoreDAO can extract the structure.</p>
    <p>$$DOC{ref:".put"} knows how to allocate IDs for new entities without one, and it will prepend any $$DOC{ref:".keyPrefix"} you have defined.</p>
  */},

  imports: [
    'datastore'
  ],
  properties: [
    {
      name: 'model',
      required: true
    },
    {
      name: 'kind',
      documentation: 'The Datastore Entity kind for this DAO. Defaults to the model name.',
      defaultValueFn: function() { return this.model.name; }
    },
    {
      name: 'keyPrefix',
      documentation: 'Set this to a string ("/SomeEntity/someId/AnotherEntity/otherId"), array thus [{ kind: "SomeEntity", id: "someId" }, { kind: "AnotherEntity", id: "otherId" }], or DatastoreKey.',
      factory: function() { return this.DatastoreKey.create(); },
      preSet: function(old, nu) {
        if ( this.DatastoreKey.isInstance(nu) ) return nu;
        if ( Array.isArray(nu) ) return this.DatastoreKey.create({ path: nu });
        if ( typeof nu === 'string' ) return this.DatastoreKey.create({ string: nu });

        console.warn('Unknown keyPrefix! ' + nu);
        return nu;
      }
    }
  ],

  methods: {
    find: function(id, sink) {
      if ( typeof id === 'object' ) id = id.id;
      // id should be the /EntityType1/id1/Type2/id2 string.
      // TODO: Datastore /lookup API supports multiple keys at a time, even for
      // different entities. Could batch these together, and reduce bills.

      // TODO: Lookups can integrate with a transaction, but need not. If they
      // are part of a transaction, they will be consistent with edits made so
      // far in the transaction.
      // Currently ignoring this, and letting the consistency be the default
      // (strong for ancestor queries, ie. those with key length > 1, eventual
      // otherwise.
      var key = this.DatastoreKey.create({ string: id });
      var req = { keys: [{ path: key.path }] };

      aseq(this.datastore.withClientExecute('lookup', req))(function(res) {
        // Response contains "found", "missing" and "deferred" sections.
        // No idea how to handle "deferred", but "found" is put() and "missing"
        // is error().
        if ( res.deferred && res.deferred.length ) {
          // TODO(braden): Handle "deferred".
          console.warn('Deferred response to find(). Not implemented.');
        }

        if ( res.found && res.found.length ) {
          var obj = this.model.create();
          console.log(res.found[0].entity);
          obj.fromDatastore(res.found[0].entity);
          sink && sink.put && sink.put(obj);
        } else if ( res.missing && res.missing.length ) {
          sink && sink.error && sink.error('Failed to find ' + id);
        }
      }.bind(this));
    },

    put: function(obj, sink) {
      aseq(
        this.datastore.withClientExecute('beginTransaction', {}),
        function(ret, res) {
          // This contains the key, if an ID is defined.
          var serialized = obj.toDatastore();

          var requestKey;
          if ( obj.id ) {
            requestKey = 'update';
          } else {
            requestKey = 'insertAutoId';
            var key = this.keyPrefix.deepClone();
            // Augment this key with a final segment, giving the kind.
            key.path.push({ kind: this.kind });
            serialized.key = { path: key.path };
          }

          var req = {
            transaction: res.transaction,
            mode: 'TRANSACTIONAL',
            mutation: {}
          };
          req.mutation[requestKey] = [serialized];
          aseq(this.datastore.withClientExecute('commit', req))(ret);
        }.bind(this)
      )(function(res) {
        // The response contains insertAutoIdKeys, if applicable.
        if ( res && res.mutationResult && res.mutationResult.insertAutoIdKeys ) {
          var key = this.DatastoreKey.create({ path: res.mutationResult.insertAutoIdKeys[0].path });
          obj = obj.clone();
          obj.id = key.string;
        }

        // Send a put.
        this.notify_('put', [obj]);
        sink && sink.put && sink.put(obj);
      }.bind(this));
    },

    remove: function(id, sink) {
      id = id.id || id;
      var key = this.DatastoreKey.create({ string: id });
      aseq(
        this.datastore.withClientExecute('beginTransaction', {}),
        function(ret, res) {
          var req = {
            transaction: res.transaction,
            mode: 'TRANSACTIONAL',
            mutation: {
              delete: [{ path: key.path }]
            }
          };
          this.datastore.withClientExecute('commit', req)(ret);
        }.bind(this)
      )(function(res) {
        if ( res ) {
          sink && sink.remove && sink.remove(id);
          this.notify_('remove', [id]);
        }
      }.bind(this));
    },

    runQuery_: function(options, callback) {
      // Datastore doesn't support OR with a single query, only AND.
      // We also always add a filter on the __key__ for the ancestor, if the
      // prefix is set.
      // TODO(braden): Skip and limit.
      // TODO(braden): Handle OR queries by merging several requests.
      var query = options && options.query;
      var clauses = [];
      if ( query ) {
        query = query.partialEval();
        var q = [query];
        while ( q.length ) {
          var next = q.shift();
          if ( AndExpr.isInstance(next) ) {
            next.args.forEach(function(e) { q.push(e); });
          } else if ( OrExpr.isInstance(next) ) {
            console.warn('Cannot express OR conditions. Skipping the whole clause!');
          } else if ( InExpr.isInstance(next) ) {
            console.warn('Datastore DAO cannot express IN expressions (equivalent to OR). Skipping the whole clause!');
          } else {
            // EQ, LT(E), GT(E).
            var operator = EqExpr.isInstance(next) ? 'equal' :
                LtExpr.isInstance(next) ? 'lessThan' :
                LteExpr.isInstance(next) ? 'lessThanOrEqual' :
                GtExpr.isInstance(next) ? 'greaterThan' :
                GteExpr.isInstance(next) ? 'greaterThanOrEqual' : '';
            if ( operator === '' ) {
              console.warn('Unrecognized operator type: ' + next.model_.name);
              continue;
            }
            var propName = next.arg1.datastoreKey;
            var value = next.arg1.toDatastore(next.arg2.f ? next.arg2.f() : next.arg2);
            clauses.push({
              propertyFilter: {
                operator: operator,
                property: { name: propName },
                value: value
              }
            });
          }
        }
      }

      if ( this.keyPrefix ) {
        // Add ancestor filters for each segment of the prefix.
        clauses.push({
          propertyFilter: {
            operator: 'hasAncestor',
            property: { name: '__key__' },
            value: { keyValue: { path: this.keyPrefix.path } }
          }
        });
      }

      // That's all the clauses. Now to build the whole query.
      var req = {
        query: {
          kinds: [{ name: this.kind }]
        }
      };
      if ( clauses.length === 1 ) {
        req.query.filter = clauses[0];
      } else if ( clauses.length > 1 ) {
        req.query.filter = {
          compositeFilter: {
            operator: 'AND',
            filters: clauses
          }
        };
      }

      if ( options.skip ) req.query.offset = options.skip;
      if ( options.limit ) req.query.limt = options.limit;
      if ( options.order ) {
        req.query.order = options.order.map(function(o) {
          var dir = DescExpr.isInstance(o) ? 'DESCENDING' : 'ASCENDING';
          return {
            property: {
              name: o.arg1 ? o.arg1.datastoreKey : o.datastoreKey
            },
            direction: dir
          };
        });
      }
      if ( options.__datastore_projection )
        req.query.projection = options.__datastore_projection;

      this.datastore.withClientExecute('runQuery', req)(callback);
    },

    select: function(sink, options) {
      var future = afuture();
      this.runQuery_(options, function(res) {
        // TODO(braden): Handle Datastore's pagination of large single requests.
        // We need to follow the DAO API of returning either all the values or
        // up to the limit.
        // We get a batch with some entries, and info about whether there are
        // more.

        var rawEntries = res.batch.entityResults;
        for ( var i = 0 ; i < rawEntries.length ; i++ ) {
          var cooked = this.model.create();
          cooked.fromDatastore(rawEntries[i].entity);
          sink && sink.put && sink.put(cooked);
        }

        sink && sink.eof && sink.eof();
        future.set(sink);
      }.bind(this));
      return future.get;
    },

    removeAll: function(sink, options) {
      var future = afuture();
      var opts = {
        __proto__: options,
        __datastore_projection: [{
          property: { name: '__key__' }
          //aggregationFunction: 'FIRST'
          // TODO(braden): The doc specifies sending the aggregation function,
          // but it causes a 400 in practice because "aggregationFunction not
          // allowed without group by", even though that's not what's happening
          // here. We're aggregating multiple values for one property, not
          // multiple entities.
          // Anyway, projecting just the __key__ works fine without it.
        }]
      };
      this.runQuery_(opts, function(res) {
        aseq(
          this.datastore.withClientExecute('beginTransaction', {}),
          function(ret, trans) {
            var req = {
              transaction: trans.transaction,
              mode: 'TRANSACTIONAL',
              mutation: {}
            };

            req.mutation.delete = res.batch.entityResults.map(function(e) {
              return { path: e.entity.key.path };
            });
            this.datastore.withClientExecute('commit', req)(ret);
          }.bind(this),
          function(ret) {
            // Since there wasn't an error, fire remove for each entity.
            var items = res.batch.entityResults;
            for ( var i = 0 ; i < items.length ; i++ ) {
              var key = this.DatastoreKey.create({ path: items[i].entity.key.path }).string;
              sink && sink.remove && sink.remove(key);
              this.notify_('remove', [key]);
            }
            sink && sink.eof && sink.eof();
            ret(sink);
          }.bind(this)
        )(future.set);
      }.bind(this));
      return future.get;
    }
  }
});
