// Expects FOAM to already be loaded globally, and MongoDB's Node module to be installed.
var mongo = require('mongodb');

function withSink(sink) {
  return function(err, result) {
    debugger;
    if (err) sink && sink.error && sink.error(err);
    else sink && sink.put && sink.put(result);
  };
}

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

    put: function(value, sink) {
      value._id = value.id;
      this.withDB(function(db) {
        // Use an "upsert" to either overwrite or insert.
        db.save(value, {w:1}, function(err, result) {
          if (err) {
            sink && sink.error && sink.error(err);
          } else {
            sink && sink.put && sink.put(value);
          }
        });
      });
    },

    find: function(query, sink) {
      // Query is either an mLang query or a key.
      // TODO: Assuming its a key for now.
      this.withDB(function(db) {
        db.findOne({ _id: query }, withSink(sink));
      });
    }
  }
});



