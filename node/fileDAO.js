var fs = require('fs');
require('../core/bootFOAMnode');

FOAModel({
  name: 'NodeJSONFileDAO',

  extendsModel: 'MDAO',

  properties: [
    {
      name:  'name',
      label: 'File Name',
      type:  'String',
      defaultValueFn: function() {
        return this.model.plural + '.json';
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      if (fs.existsSync(this.name)) {
        var content = fs.readFileSync(this.name, { encoding: 'utf-8' });
        JSONUtil.parse(content).select(this);
      }

      this.addRawIndex({
        execute: function() {},
        bulkLoad: function() {},
        toString: function() { return "NodeJSONFileDAO Update"; },
        plan: function() {
          return { cost: Number.MAX_VALUE };
        },
        put: this.updated,
        remove: this.updated
      });
    }
  },

  listeners: [
    {
      name: 'updated',
      isMerged: 100,
      code: function() {
        this.select()(function(a) {
          console.log('writing');
          fs.writeFileSync(this.name, JSONUtil.where(NOT_TRANSIENT).stringify(a), { encoding: 'utf-8' });
        }.bind(this));
      }
    }
  ]
});

// Testing

var Person = FOAM({
  model_: 'Model',
  name: 'Person',
  properties: [
    'id',
    'name',
    { model_: IntegerProperty, name: 'age' },
    { name: 'sex', defaultValue: 'M' }
  ]
});

