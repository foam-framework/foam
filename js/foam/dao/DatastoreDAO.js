// TODO: Remove this debugging code.
require('../../../core/bootFOAMnode');

MODEL({
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

      for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
        var prop = this.model_.properties[i];
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
        console.log('key found', key.path, key.string);
        json.key = { path: key.path };
      }

      for ( var i = 0 ; i < this.model_.properties.length ; i++ ) {
        var prop = this.model_.properties[i];
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
  extendsModel: 'IntProperty',
  traits: ['DatastorePropertyTrait']
});

MODEL({
  name: 'DatastoreStringProperty',
  extendsModel: 'StringProperty',
  traits: ['DatastorePropertyTrait']
});

MODEL({
  name: 'DatastoreFloatProperty',
  extendsModel: 'FloatProperty',
  traits: ['DatastorePropertyTrait']
});

MODEL({
  name: 'DatastoreDateTimeProperty',
  extendsModel: 'DateTimeProperty',
  traits: ['DatastorePropertyTrait']
});

MODEL({
  name: 'DatastoreBooleanProperty',
  extendsModel: 'BooleanProperty',
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
              console.error('Error in ' + method + ' call: ' + err);
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
  extendsModel: 'AbstractDAO',
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
          console.warn('Deferred response to find(). Handle me somehow.');
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
          console.log('serialized', serialized);

          var requestKey;
          if ( obj.id ) {
            requestKey = 'update';
          } else {
            requestKey = 'insertAutoId';
            var key = this.DatastoreKey.create({ string: this.keyPrefix });
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
          console.log('request', require('util').inspect(req, { depth: null }));
          aseq(this.datastore.withClientExecute('commit', req))(ret);
        }.bind(this)
      )(function(res) {
        // The response contains insertAutoIdKeys, if applicable.
        console.log('response', res);
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

    select: function(sink, options) {
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
            console.log('value: ' + value);
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

      console.log('====== Request ========');
      console.log(require('util').inspect(req, { depth: null }));

      var future = afuture();
      var afunc = aseq(
        this.datastore.withClientExecute('runQuery', req),
        function(ret, res) {
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
          ret(sink);
        }.bind(this)
      )(future.set);
      return future.get;
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
    }
  }
});



// DEBUG: Remove me.
MODEL({
  name: 'Activity',
  traits: ['DatastoreSerializationTrait'],
  properties: [
    {
      name: 'id'
    },
    {
      model_: 'DatastoreStringProperty',
      name: 'title',
      documentation: 'The name of this activity.'
    },
    {
      model_: 'DatastoreBooleanProperty',
      name: 'isDeleted',
      defaultValue: false
    },
    {
      model_: 'DatastoreIntProperty',
      name: 'weight'
    }
  ]
});



// Testing support.
var datastore = X.Datastore.create({ datasetId: 'timetogetherapp' });
X.datastore = datastore;

X.dao = X.DatastoreDAO.create({ model: X.Activity, keyPrefix: '/Couple/1001' });


