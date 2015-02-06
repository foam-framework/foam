CLASS({
  name: 'File',
  package: 'foam.dao',
  properties: [
    {
      model_: 'StringProperty',
      name: 'path'
    },
    {
      name: 'contents'
    },
    {
      name: 'parent'
    }
  ],
  relationships: [
    {
      name: 'children',
      relatedModel: 'foam.dao.File',
      relatedProperty: 'parent'
    }
  ]
});
