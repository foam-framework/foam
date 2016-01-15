CLASS({
  name: 'Todo',
  tableProperties: [
    "priority",
    "labels",
    "completed",
    "text"
  ],
  properties: [
    {
      type: 'Int',
      name: 'id'
    },
    { name: 'completed', type: 'Boolean' },
    { name: 'text' },
    { type: 'StringArray', name: 'labels' },
    { type: 'Int', name: 'priority' },
    { type: 'Int', name: 'parent' }
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

var TodoDAO = X.lookup('foam.dao.EasyDAO').create({ daoType: 'MDAO', seqNo: true, model: Todo });
TodoDAO.put(Todo.create({ id: 1, text: 'Task 1' }));
TodoDAO.put(Todo.create({ id: 2, text: 'Child task', parent: 1 }));

DetailView.SHOW_RELATIONSHIPS.defaultValue = true;

window.onload = function() {
  FOAM.browse('Todo');
};
