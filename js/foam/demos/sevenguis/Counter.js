MODEL({
  package: 'foam.demos.sevenguis',
  name: 'Counter',
  properties: [ { model_: 'IntProperty', name: 'count' } ],
  actions: [ { name: 'incr', action: function() { this.count++; } } ]
});
