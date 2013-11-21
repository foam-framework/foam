var dao = [
  Contact.create({ id: 1, first: 'Adam', last: 'Van Ymeren', email: 'adamvy@google.com' }),
  Contact.create({ id: 2, first: 'Kevin', last: 'Greer', email: 'kgr@google.com' }),
  Contact.create({ id: 3, first: 'Alice', email: 'alice@alice.org' }),
  Contact.create({ id: 4, first: 'Bob', email: 'bob@bob.org' })
];

var list = ArrayTileView.create({
  tileView: ContactSmallTileView,
  dao: DefaultObjectDAO.create({
    delegate: dao,
    factory: function(q) {
      var obj = Contact.create({});
      obj[q.arg1.name] = q.arg2.arg1;
      return obj;
    }
  }),
  property: Contact.EMAIL
});
document.writeln(list.toHTML());
list.initHTML();

list.value.set(['alice@alice.org', 'bob@bob.org', 'adamvy@google.com']);
