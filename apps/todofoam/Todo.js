FOAModel({
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
    { model_: 'IntegerProperty', name: 'priority' },
    { model_: 'ReferenceProperty', subType: 'Todo', name: 'parent' },
    { model_: 'ArrayProperty', subType: 'Todo', name: 'children', transient: true }
  ]
});

var stack = StackView.create();
stack.write(document);

FOAM.browse(Todo, EasyDAO.create({model: Todo, seqNo: true, cache: true}));
