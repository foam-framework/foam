var global = global || this;


function MODEL(m) {
  global[m.name] = m;
  // Insert magic here
}


MODEL({
  name: 'FProto',
  extends: null

  methods: [
    {
      name: 'create',
      code: function() { return { __proto__: this, instance_: {} } },
    },
    {
      name: 'toString',
      code: function() { return 'FProto' + this.model_.name; }
    }
  ]
});


MODEL({
  name: 'FObject',
  extends: 'FProto',

  properties: [
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
    /*
    {
      name: 'createPrototype',
      code: function() {

      }
    }
    */
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
      function(proto) {
        proto[this.name] = this.code;
      }
    }
  ]
});


MODEL({
  name: 'Constant',

  properties: [
    {
      name: 'name'
    },
    {
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'install',
      function(proto) {
        proto[this.name] = this.value;
      }
    }
  ]
});


MODEL({
  name: 'StringProperty',
  extends: 'Property',

  properties: [
    {
      name: 'defaultValue',
      defaultValue: ''
    },
    {
      name: 'preSet',
      defaultValue: function(_, a) {
        return a ? a.toString() : '';
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
        return a.map(function() { return global[this.subType].create(a); });
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


/*
  create: create object then update
  remote create from regular objects or remove from prototypes
  acreate or afromJSON
*/
