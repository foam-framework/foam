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
          delegate: CachingDAO.create(MDAO.create({model: Todo}), IDBDAO.create({model: Todo}))
        });
      }
    },
    { name: 'filteredDAO', view: 'ArrayView', subType: 'Todo' },
    { model_: 'IntegerProperty', name: 'completedCount' },
    { model_: 'IntegerProperty', name: 'activeCount' },
    {
      name: 'query',
      postSet: function(_, p) { this.filteredDAO = this.todoDAO.where(p); },
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
      name: 'toggleCompleted',
      isEnabled: function() {
        var c1 = this.completedCount ? 1 : 0
        var c2 = this.activeCount ? 1 : 0
        return c1 != c2;
      },
      action: function() {
        this.todoDAO.select(UPDATE(SET(Todo.COMPLETED, ! this.completedCount), this.todoDAO));
      }
    },
    {
      name: 'clearCompleted',
      action: function() {
        this.todoDAO.where(EQ(Todo.COMPLETED, TRUE)).select({put: function(todo) {
          this.todoDAO.remove(todo);
        }.bind(this)});
      }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.query = this.query;
      this.todoDAO.listen(this.onDAOUpdate);
      this.onDAOUpdate();
    }
  },
  listeners: [
    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function(evt) {
        this.todoDAO.select(GROUP_BY(Todo.COMPLETED, COUNT()))(function (counts) {
          this.completedCount = counts.groups['true'] || 0;
          this.activeCount    = counts.groups['false'] || 0;
        }.bind(this));
      }
    }
  ]
});
