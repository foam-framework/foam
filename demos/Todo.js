FOAModel({
  name: 'Todo',
  properties: [
    { name: 'id' },
    { model_: 'BooleanProperty', name: 'completed' },
    { name: 'text' }
  ]
});

FOAModel({
  name: 'Controller',
  properties: [
    {
      name: 'input',
      postSet: function(_, text) {
        if ( ! text ) return;
        this.todoDAO.put(Todo.create({text: text}));
        this.input = '';
      },
      view: { model_: 'TextFieldView', placeholder: 'What needs to be done?' }
    },
    {
      name: 'todoDAO',
      valueFactory: function() {
        return SeqNoDAO.create({
          property: Todo.ID,
          delegate: CachingDAO.create(MDAO.create({model: Todo})/*.addIndex(Todo.COMPLETED)*/, IDBDAO.create({model: Todo}))
        });
      }
    },
    { name: 'filteredDAO', view: 'ArrayView', subType: 'Todo' },
    { model_: 'IntegerProperty', name: 'completedCount' },
    { model_: 'IntegerProperty', name: 'activeCount' },
    {
      name: 'query',
      postSet: function(_, q) { this.filteredDAO = this.todoDAO.where(q); },
      defaultValue: TRUE,
      view: ChoiceListView.create({
        choices: [
          [ TRUE,                      'All' ],
          [ EQ(Todo.COMPLETED, FALSE), 'Active' ],
          [ EQ(Todo.COMPLETED, TRUE),  'Completed' ]
        ]
      })
    }
  ],
  actions: [
    {
      name: 'toggle',
      action: function() {
        this.todoDAO.select(UPDATE(SET(Todo.COMPLETED, this.activeCount), this.todoDAO));
      }
    },
    {
      name: 'clear',
      isEnabled: function() { return this.completedCount > 0; },
      action: function() { this.todoDAO.where(EQ(Todo.COMPLETED, TRUE)).removeAll(); }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.query = this.query;  // causes filteredDAO to be set
      this.todoDAO.listen(this.onDAOUpdate);
      this.onDAOUpdate();
    }
  },
  listeners: [
    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function() {
        this.todoDAO.select(GROUP_BY(Todo.COMPLETED, COUNT()))(function (counts) {
          this.completedCount = counts.groups['true'];
          this.activeCount    = counts.groups['false'];
        }.bind(this));
      }
    }
  ]
});

FOAModel({ name: 'TodoView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });

FOAModel({
  name: 'TodoControllerView',
  extendsModel: 'DetailView',
  properties: [ { name: 'itemLabel' } ],
  methods: {
    initHTML: function() {
      this.SUPER();
      Events.dynamic(function() {
        this.itemLabel = this.value.value.activeCount == 1 ? 'item' : 'items';
      }.bind(this));
    }
  },
  templates: [ { name: 'toHTML' } ]
});
