FOAModel({
  name: 'Todo',
  properties: [ 'id', { name: 'completed', model_: 'BooleanProperty' }, 'text' ]
});

FOAModel({
  name: 'Controller',
  properties: [
    {
      name: 'input',
      setter: function(text) {
        this.dao.put(Todo.create({text: text}));
        this.propertyChange("input", text, "");
      },
      view: { model_: 'TextFieldView', placeholder: 'What needs to be done?' }
    },
    { name: 'dao' },
    { name: 'filteredDAO',    model_: 'DAOProperty', view: { model_: 'DAOListView', rowView: 'View' } },
    { name: 'completedCount', model_: 'IntegerProperty' },
    { name: 'activeCount',    model_: 'IntegerProperty' },
    {
      name: 'query',
      postSet: function(_, q) { this.filteredDAO = this.dao.where(q); },
      defaultValue: TRUE,
      view: { model_: 'ChoiceListView', choices: [ [ TRUE, 'All' ], [ NOT(Todo.COMPLETED), 'Active' ], [ Todo.COMPLETED, 'Completed' ] ] }
    }
  ],
  actions: [
    {
      name: 'toggle',
      action: function() { this.dao.update(SET(Todo.COMPLETED, this.activeCount)); }
    },
    {
      name: 'clear',
      labelFn:   function() { return "Clear completed (" + this.completedCount + ")"; },
      isEnabled: function() { return this.completedCount; },
      action:    function() { this.dao.where(Todo.COMPLETED).removeAll(); }
    }
  ],
  listeners: [
    {
      name: 'onDAOUpdate',
      isAnimated: true,
      code: function() {
        this.dao.select(GROUP_BY(Todo.COMPLETED, COUNT()))(function (q) {
          this.completedCount = q.groups[true];
          this.activeCount    = q.groups[false];
        }.bind(this));
      }
    }
  ],
  methods: {
    init: function() {
      this.SUPER();
      this.filteredDAO = this.dao = EasyDAO.create({model: Todo, seqNo: true, daoType: 'StorageDAO', name: 'todos-foam'});
      this.dao.listen(this.onDAOUpdate);
      this.onDAOUpdate();
    }
  }
});

FOAModel({ name: 'ControllerView', extendsModel: 'DetailView', templates: [ { name: 'toHTML' } ] });
FOAModel({
  name: 'View',
  extendsModel: 'DetailView',
  templates: [ { name: 'toHTML' } ],
  actions: [ { name: 'remove', label: '', action: function() { this.DAO.remove(this.obj); }}]
});
