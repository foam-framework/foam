var remoteDao = [];

var contacts = [
  Contact.create({ id: 1, first: 'Adam', last: 'Van Ymeren', email: 'adamvy@google.com' }),
  Contact.create({ id: 2, first: 'Kevin', last: 'Greer', email: 'kgr@google.com' }),
  Contact.create({ id: 3, first: 'Alice', email: 'alice@alice.org' }),
  Contact.create({ id: 4, first: 'Bob', email: 'bob@bob.org' }),
  Contact.create({ id: 5, first: 'Test', last: 'Contact', email: 'test@test.test' }),
  Contact.create({ id: 6, first: 'John', last: 'Smith', email: 'j.smith@johnsmith.net' }),
  Contact.create({ id: 7, first: 'Somebody', last: 'Else', email: 'nobody@nowhere.org' }),
  Contact.create({ id: 8, first: 'Random', last: 'Joe', email: 'joe.random@there.ca' }),
  Contact.create({ id: 9, first: 'Frank', last: 'Ellis', email: 'frank@test.com' }),
];

function asend(ret, msg) {
  console.log.json(msg);
  window.setTimeout(function() {
    switch ( msg.method ) {
    case 'select':
      var sink = msg.params[0].clone();
      remoteDao.select(sink, msg.params[1])(function(c) {
        ret(c);
      });
      break;
    case 'put':
    case 'remove':
    case 'find':
      remoteDao[msg.method](msg.params[0], {
        put: function(o) {
          ret({
            put: o
          });
        },
        remove: function(o) {
          ret({
            remove: o
          });
        },
        error: function(o) {
          ret({
            error: o
          })
        }
      });
    }
  }, true);
}

var dao = ClientDAO.create({
  model: Contact,
  asend: asend
});

for ( var i = 0; i < contacts.length; i++ ) {
  dao.put(contacts[i], console.log);
}

dao.remove(5);

dao.select(COUNT())(function(c) { console.log(c.count); });
dao.select(GROUP_BY(Contact.EMAIL, COUNT()))(console.log.json);
dao.select({
  put: function(o) {
    if ( o.id === 7 ) console.log(o.last);
  },
  eof: function() {
    console.log('eof');
  }
});

dao.find(3, console.log.json);
