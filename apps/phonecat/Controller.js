FOAModel({
  name: 'Controller',
  properties: [
    {
      name: 'search',
      view: { model_: 'TextFieldView', onKeyMode: true },
      postSet: function() { this.filter(); }
    },
    {
      name: 'order',
      defaultValue: Phone.NAME,
      view: ChoiceView.create({
        choices: [ [ Phone.NAME, 'Alphabetical' ], [ Phone.AGE, 'Newest' ] ]
      }),
      postSet: function() { this.filter(); }
    },
    { name: 'dao', defaultValue: phones },
    { name: 'filteredDAO', model_: 'DAOProperty', view: { model_: 'DAOListView', rowView: 'PhoneCitationView' } },
  ],
  methods: {
    filter: function() {
      this.filteredDAO = this.dao.orderBy(this.order).where(OR(CONTAINS_IC(Phone.NAME, this.search), CONTAINS_IC(Phone.SNIPPET, this.search)));
    },
    init: function() {
      this.SUPER();
      this.filter();
    }
  }
});

FOAModel({ name: 'PhoneCitationView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'PhoneDetailView',   extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'ControllerView',    extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
