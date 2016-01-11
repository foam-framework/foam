
// NB: You'll need to have Mongo running.
// Set the URL below to match the port.
require('../../core/bootFOAMnode');

var URL = 'mongodb://localhost:27017/foamDemo';

CLASS({
  name: 'Person',
  properties: [
    { name: 'id' },
    { name: 'name' },
    { name: 'sex', defaultValue: 'M' },
    { type: 'Int', name: 'age' }
  ]
});


//var query = AND(EQ(Person.NAME, 'Jim').toMongo(), LT(Person.AGE, 21));
//var query = OR(EQ(Person.NAME, 'John'), NEQ(Person.NAME, 'Mike'), GTE(Person.AGE, 19));
//var query = IN(Person.NAME, ['John', 'Mike']);
//console.log(require('util').inspect(query.toMongo(), false, null));

apar(
  arequire('foam.node.dao.MongoDAO')
)(function(MongoDAO) {
  var dao = MongoDAO.create({ model: Person, database: URL });

  dao.put(Person.create({ id: 1, name: 'John', age: 20 }));
  dao.put(Person.create({ id: 2, name: 'Adam', age: 24 }));
  dao.put(Person.create({ id: 3, name: 'Amie', age: 25, sex: 'F' }));
  dao.put(Person.create({ id: 4, name: 'Mike', age: 19 }));

  dao.where(CONTAINS_IC(Person.NAME, 'a')).select(console.log.json);
});
