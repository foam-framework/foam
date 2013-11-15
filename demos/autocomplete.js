var dao = [
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


EMail.TO.view = {
  create: function() {
    var view = ListValueView.create({
      inputView: ListInputView.create({
        dao: dao,
        property: Contact.EMAIL,
        searchProperties: [Contact.EMAIL, Contact.FIRST, Contact.LAST],
        valueView: StringArrayView.create({}),
        autocompleteView: ListView.create({
          innerView: ContactListTileView
        })
      }),
      valueView: StringArrayView.create({})
    });
    return view;
  }
};

var detail = DetailView.create({model: EMail});
var mail = EMail.create({})
detail.value.set(mail);
detail.write(document);
