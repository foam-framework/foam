var dao = [
  Contact.create({ id: 1, first: 'Adam', last: 'Van Ymeren', email: 'adamvy@google.com' }),
  Contact.create({ id: 2, first: 'Kevin', last: 'Greer', email: 'kgr@google.com' }),
  Contact.create({ id: 3, first: 'Alice', email: 'alice@alice.org' }),
  Contact.create({ id: 4, first: 'Bob', email: 'bob@bob.org' })
];


var list = ListView.create({
  model: Contact,
  innerView: ContactListTileView
});

document.body.innerHTML = list.toHTML();
list.initHTML();

list.dao = dao;

document.body.onkeydown = function(e) {
  if ( e.keyCode === 40 ) list.nextSelection();
  else if ( e.keyCode === 38 ) list.prevSelection();
};
