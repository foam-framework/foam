FOAModel({
  name: 'Todo',
  properties: [
    { name: 'id' },
    { name: 'completed', model_: 'BooleanProperty' },
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
      valueFactory: function() { // return EasyDAO.create({model: Todo, seqNo: true, cache: true, type: StorageDAO})
        return SeqNoDAO.create({
          property: Todo.ID,
          delegate: CachingDAO.create(MDAO.create({model: Todo})/*.addIndex(Todo.COMPLETED)*/, IDBDAO.create({model: Todo}))
        });
      }
    },
    { name: 'filteredDAO',    model_: 'DAOProperty', view: { model_: 'DAOListController', rowView: 'TodoView' } },
    { name: 'completedCount', model_: 'IntegerProperty' },
    { name: 'activeCount',    model_: 'IntegerProperty' },
    {
      name: 'query',
      postSet: function(_, q) { this.filteredDAO = this.todoDAO.where(q); },
      defaultValue: TRUE,
      view: ChoiceListView.create({
        choices: [ [ TRUE, 'All' ], [ NOT(Todo.COMPLETED), 'Active' ], [ Todo.COMPLETED, 'Completed' ] ]
      })
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
  actions: [
    {
      name: 'toggle',
      action: function() { this.todoDAO.select(UPDATE(SET(Todo.COMPLETED, this.activeCount), this.todoDAO)); }
    },
    {
      name: 'clear',
      labelFn:   function() { return 'Clear completed (' + this.completedCount + ')'; },
      isEnabled: function() { return this.completedCount > 0; },
      action:    function() { this.todoDAO.where(Todo.COMPLETED).removeAll(); }
    }
  ],
  listeners: [
    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function() {
        this.todoDAO.select(GROUP_BY(Todo.COMPLETED, COUNT()))(function (q) {
          this.completedCount = q.groups['true'];
          this.activeCount    = q.groups['false'];
        }.bind(this));
      }
    }
  ]
});

FOAModel({ name: 'TodoView',           extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'TodoControllerView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
