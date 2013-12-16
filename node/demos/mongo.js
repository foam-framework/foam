
// NB: You'll need to have Mongo running.
// Set the URL below to match the port.
require('../../core/bootFOAMnode');
require('../mongoDAO');

var URL = 'mongodb://localhost:27017/foamDemo';

global.Person = FOAM({
  model_: 'Model',
  name: 'Person',
  properties: [
    { name: 'id' },
    { name: 'name' },
    { name: 'sex', defaultValue: 'M' },
    { model_: 'IntegerProperty', name: 'age' }
  ]
});

var dao = MongoDAO.create({ model: Person, database: URL });

dao.find('2', { put: console.log, error: console.error });


