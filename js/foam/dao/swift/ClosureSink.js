CLASS({
  package: 'foam.dao.swift',
  name: 'ClosureSink',
  extends: 'foam.dao.swift.Sink',

  properties: [
    {
      model_: 'FunctionProperty',
      name: 'putFn',
    },
    {
      model_: 'FunctionProperty',
      name: 'removeFn',
    },
    {
      model_: 'FunctionProperty',
      name: 'errorFn',
    },
    {
      model_: 'FunctionProperty',
      name: 'eofFn',
    },
    {
      model_: 'FunctionProperty',
      name: 'resetFn',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: 'putFn.call(obj)',
    },
    {
      name: 'remove',
      swiftCode: 'removeFn.call(obj)',
    },
    {
      name: 'reset',
      swiftCode: 'resetFn.call()',
    },
    {
      name: 'eof',
      swiftCode: 'eofFn.call()',
    },
    {
      name: 'error',
      swiftCode: 'errorFn.call()',
    },
  ],
});
