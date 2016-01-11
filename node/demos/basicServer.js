
require('../../core/bootFOAMnode.js');
var daoServer = require('../server');

var Person = FOAM({
  model_: 'Model',
  name: 'Person',
  properties: [
    { name: 'id' },
    { name: 'name' },
    { name: 'sex', defaultValue: 'M' },
    { type: 'Int', name: 'age' }
  ]
});

global.Person = Person;

// In-memory transient DAO.
var dao = MDAO.create({ model: Person });

// Add some rows.
dao.put(Person.create({ id: '1', name: 'John', age: 21 }));
dao.put(Person.create({ id: '2', name: 'Dave', age: 22 }));
dao.put(Person.create({ id: '3', name: 'Steve', age: 23 }));
dao.put(Person.create({ id: '4', name: 'Andy', age: 24 }));

daoServer.launchServer({ 'PersonDAO': dao }, 8080);

