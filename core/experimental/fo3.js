var FProto = {
  name: 'FProto',
  extends: null,
  create: function() { return { __proto__: this, instance_: {} } },
  toString: function() { return 'FProto' + this.model_.name; }
};


MODEL({
  name: 'FObject',
  extends: 'FProto',

  properties: [
    {
      name: 'model_'
    }
  ],

  methods: [
    {
      name: 'toString',
      code: function() { return this.model_.name; }
    }
  ],

  axioms: [
  ]
});


MODEL({
  name: 'Model',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'extends',
      defaultValue: 'FObject'
    },
    {
      type: 'Array',
      subType: 'Property',
      name: 'properties'
    },
    {
      type: 'Array',
      subType: 'Method',
      name: 'methods'
    },
    {
      name: 'proto',
      // TODO: replace with lazyFactory
      factory: function() {
        return {
          __proto__: FProto,
          model_: this
        }
      }
    }
  ],

  methods: [
    {
      name: 'createPrototype',
      code: function() {

      }
    }
  ]
});


MODEL({
  name: 'Property',

  properties: [
    {
      name: 'type'
    },
    {
      name: 'name'
    },
    {
      name: 'defaultValue'
    },
    {
      name: 'factory'
    },
    {
      name: 'preSet'
    }
  ],

  methods: [
    {
      name: 'install',
      function() {
        // TODO:
      }
    }
  ]
});


MODEL({
  name: 'ArrayProperty',
  extends: 'Property',

  properties: [
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'subType'
    },
    {
      name: 'preSet',
      defaultValue: function(_, a) {
        return a.map(function() { return GLOBAL[this.subType].create(a); });
      }
    }
  ]
});


MODEL({
  name: 'Method',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'code'
    }
  ],

  methods: [
    {
      name: 'install',
      function() {
        // TODO:
      }
    }
  ]
});
