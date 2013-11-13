var dao = [
  Contact.create({ id: 1, first: 'Adam', last: 'Van Ymeren', email: 'adamvy@google.com' }),
  Contact.create({ id: 2, first: 'Kevin', last: 'Greer', email: 'kgr@google.com' }),
  Contact.create({ id: 3, first: 'Alice', email: 'alice@alice.org' }),
  Contact.create({ id: 4, first: 'Bob', email: 'bob@bob.org' })
];

var ContactListItem = Model.create({
  extendsModel: 'TextFieldView',
  properties: [
    {
      name: 'mode',
      defaultValue: 'read-only'
    }
  ],

  methods: {
    valueToText: function(v) {
      return v ?
        v.first + ' ' + v.last + ' <' + v.email + '>'
        : '';
    }
  }
});

var list = ListView.create({
  model: Contact,
  innerView: ContactListItem
});

document.body.innerHTML = list.toHTML();
list.initHTML();

list.dao = dao;


