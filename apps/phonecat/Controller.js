MODEL({
  name: 'Controller',
  properties: [
    {
      name: 'search',
      view: { model_: 'TextFieldView', onKeyMode: true },
    },
    {
      name: 'order',
      defaultValue: Phone.NAME,
      view: { model_: 'ChoiceView', choices: [ [ Phone.NAME, 'Alphabetical' ], [ Phone.AGE, 'Newest' ] ] },
    },
    { name: 'dao', defaultValue: phones },
    {
      name: 'filteredDAO',
      model_: 'DAOProperty',
      view: { model_: 'DAOListView', rowView: 'PhoneCitationView', mode: 'read-only' },
      dynamicValue: function() {
        return this.dao.orderBy(this.order).where(CONTAINS_IC(SEQ(Phone.NAME, Phone.SNIPPET), this.search));
      }
    }
  ]
});


MODEL({ name: 'PhoneCitationView', extendsModel: 'DetailView', templates: [
  function toHTML() {/*
      <li class="thumbnail">
        <a href="#{{this.obj.id}}" class="thumb">$$imageUrl</a>
        <a href="#{{this.obj.id}}">$$name{mode: 'read-only'}</a>
        <p>$$snippet{mode: 'read-only'}</p>
      </li>
  */}
]});


MODEL({ name: 'PhoneDetailView',   extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });


MODEL({
  name: 'ControllerView',
  extendsModel: 'DetailView',
  templates: [
    function toHTML() {/*
      <% if ( window.location.hash ) {
        var view = PhoneDetailView.create({model: Phone});
        this.addChild(view);

        this.obj.dao.find(window.location.hash.substring(1), {put: function(phone) {
          view.value.set(phone);
        }});

        return view.toHTML();
      } else { %>
        &nbsp;&nbsp; Search: $$search
        &nbsp;&nbsp; Sort by: $$order
        <p>
        $$filteredDAO{className: 'phones', tagName: 'ul'}
      <% } %>
    */}
 ],
  methods: {
    init: function() {
      this.SUPER();
      window.addEventListener('hashchange', function() {
        this.children = [];
        document.body.innerHTML = this.toHTML();
        this.initHTML();
      }.bind(this));
    }
  }
});
