MODEL({
  name: 'Todo',
  tableProperties: [
    "priority",
    "labels",
    "completed",
    "text"
  ],
  properties: [
    {
      model_: 'IntProperty',
      name: 'id'
    },
    { name: 'completed', model_: 'BooleanProperty' },
    { name: 'text' },
    { model_: 'StringArrayProperty', name: 'labels' },
    { model_: 'IntProperty', name: 'priority' },
    { model_: 'IntProperty', name: 'parent' }
  ],
  relationships: [
    {
      name: 'children',
      label: 'Todos that this Todo depends upon.',
      relatedModel: 'Todo',
      relatedProperty: 'parent'
    }
  ]
});

var TodoDAO = EasyDAO.create({ daoType: 'MDAO', seqNo: true, model: Todo });
TodoDAO.put(Todo.create({ id: 1, text: 'Task 1' }));
TodoDAO.put(Todo.create({ id: 2, text: 'Child task', parent: 1 }));

DetailView.SHOW_RELATIONSHIPS.defaultValue = true;

window.onload = function() {
  FOAM.browse('Todo');
};
