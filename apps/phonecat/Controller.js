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
      view: { model_: 'ChoiceView', choices: [ [ Phone.NAME, 'Alphabetical' ], [ Phone.AGE, 'Newest' ] ] },
      postSet: function() { this.filter(); }
    },
    { name: 'dao', defaultValue: phones },
    { name: 'filteredDAO', model_: 'DAOProperty', view: { model_: 'DAOListView', rowView: 'PhoneCitationView' } },
  ],
  methods: {
    filter: function() {
      this.filteredDAO = this.dao.orderBy(this.order).where(CONTAINS_IC(SEQ(Phone.NAME, Phone.SNIPPET), this.search));
    }
  }
});

FOAModel({ name: 'PhoneCitationView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'PhoneDetailView',   extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({
  name: 'ControllerView',
  extendsModel: 'DetailView',
  templates: [ { name: 'toHTML' } ],
  methods: {
    init: function() {
      this.SUPER();
      window.addEventListener('hashchange', function() {
        document.body.innerHTML = this.toHTML();
        this.initHTML();
      }.bind(this));
    }
  }
});
