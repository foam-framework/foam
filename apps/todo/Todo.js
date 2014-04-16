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
      setter: function(text) {
        this.todoDAO.put(Todo.create({text: text}));
        this.propertyChange("input", text, "");
      },
      view: { model_: 'TextFieldView', placeholder: 'What needs to be done?' }
    },
    { name: 'todoDAO' },
    { name: 'filteredDAO',    model_: 'DAOProperty', view: { model_: 'DAOListController', rowView: 'View' } },
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
  actions: [
    {
      name: 'toggle',
      action: function() { this.todoDAO.update(SET(Todo.COMPLETED, this.activeCount)); }
    },
    {
      name: 'clear',
      labelFn:   function() { return "Clear completed (" + this.completedCount + ")"; },
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
          this.completedCount = q.groups[true];
          this.activeCount    = q.groups[false];
        }.bind(this));
      }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.todoDAO = EasyDAO.create({model: Todo, seqNo: true, daoType: 'StorageDAO', name: 'todos-foam'});
      this.query = this.query;  // causes filteredDAO to be set
      this.todoDAO.listen(this.onDAOUpdate);
      this.onDAOUpdate();
    }
  }
});

FOAModel({ name: 'View',           extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({ name: 'ControllerView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
