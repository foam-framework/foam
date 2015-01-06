CLASS({
  name: 'PolymerPrototype',
  package: 'foam.ui.polymer.gen',

  properties: [
    {
      name: 'id'
    },
    {
      name: 'name',
      defaultValue: 'PolymerPrototype'
    },
    {
      name: 'proto',
      factory: function() { return {}; }
    }
  ]
});
