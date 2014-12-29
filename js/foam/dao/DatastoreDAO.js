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
  properties: [
    {
      name: 'datastoreKeyMap_',
      lazyFactory: function() {
        var ps = this.model_.properties;
        var map = {};
        for ( var i = 0 ; i < ps.length ; i++ ) {
          var prop = ps[i];
          console.log(prop.name + ': ' + prop.datastoreKey);
          if ( prop.datastoreKey ) {
            map[prop.datastoreKey] = prop.name;
          }
        }
        return map;
      }
    }
  ],

  methods: {
    // Takes the JSON-parsed object from the Datastore and pulls it apart into
    // the FOAM model.
    fromDatastore: function(json) {
      // Datastore object is a "key" field and "properties" object.
      // Ignoring the key for now, iterate the properties object.
      var keys = Object.keys(json.properties);
      for ( var i = 0 ; i < keys.length ; i++ ) {
        var foamKey = this.datastoreKeyMap_[keys[i]];
        if ( ! foamKey ) {
          console.warn('Unhandled datastore property: ' + keys[i]);
          continue;
        }
        console.log('Datastore key: ' + keys[i] + ', foamKey: ' + foamKey + ', constant: ' + foamKey.constantize());
        var prop = this.model_[foamKey.constantize()];
        if ( ! prop ) {
          console.warn('Failed to find corresponding FOAM property ' + foamKey + ' for datastore property ' + keys[i]);
          continue;
        }
        this[foamKey] = prop.fromDatastore(json.properties[keys[i]]);
      }
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
  name: 'DatastoreDAO',
  extendsModel: 'AbstractDAO',
  requires: [
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
      name: 'keyPrefix',
      documentation: 'Set this to a string ("/SomeEntity/someId/AnotherEntity/otherId") or [["SomeEntity", "someId"], ["AnotherEntity", "otherId"]].',
      defaultValue: '',
      preSet: function(old, nu) {
        if ( Array.isArray(nu) ) {
          var str = '';
          for ( var i = 0 ; i < nu.length ; i++ ) {
            str += '/' + nu[0] + '/' + nu[1];
          }
          return str;
        }
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
      var keyPath = this.stringToKey(id);
      var req = { keys: [{ path: keyPath }] };

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

    // Turns a string key into a [{ kind: 'MyEntity', id: '123' }, ...] array.
    stringToKey: function(id) {
      var keyParts = id.split('/');
      var keyPath = [];
      // keyParts is, eg. ['', 'Foo', '123', 'Bar', '456'].
      for ( var i = 1 ; i < keyParts.length ; i += 2 ) {
        keyPath.push({
          kind: keyParts[i],
          id: keyParts[i+1]
        });
      }
      return keyPath;
    }
  }
});



// DEBUG: Remove me.
MODEL({
  name: 'Activity',
  traits: ['DatastoreSerializationTrait'],
  properties: [
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

var dao = X.DatastoreDAO.create({ model: X.Activity });
dao.find('/Couple/1001/Activity/7002', console.log.json);

