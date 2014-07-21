MODEL({
  name: 'Todo',
  tableProperties: [
    "priority",
    "labels",
    "completed",
    "text"
  ],
  properties: [
    { name: 'id' },
    { name: 'completed', model_: 'BooleanProperty' },
    { name: 'text' },
    { model_: 'StringArrayProperty', name: 'labels' },
    { model_: 'IntProperty', name: 'priority' },
    { model_: 'ReferenceProperty', subType: 'Todo', name: 'parent' },
    { model_: 'ArrayProperty', subType: 'Todo', name: 'children', transient: true }
  ]
});


var c = AppController.create({
  model: Todo,
  dao: EasyDAO.create({model: Todo, seqNo: true, cache: true}),
  sortChoices: [
    [ DESC(Todo.ID), 'Default']
  ],
  filterChoices: [
    ['', 'All'],
    [ EQ(Todo.COMPLETED, false), 'Active' ],
    [ EQ(Todo.COMPLETED, true), 'Completed' ]
  ]
});

c.write(document);
