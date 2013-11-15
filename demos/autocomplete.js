var dao = [
  Contact.create({ id: 1, first: 'Adam', last: 'Van Ymeren', email: 'adamvy@google.com' }),
  Contact.create({ id: 2, first: 'Kevin', last: 'Greer', email: 'kgr@google.com' }),
  Contact.create({ id: 3, first: 'Alice', email: 'alice@alice.org' }),
  Contact.create({ id: 4, first: 'Bob', email: 'bob@bob.org' })
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
