CLASS({
  package: 'foam.dao.swift',
  name: 'DelayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    A DAO decorator that allows you to add a delay before a method is actually
    called.
  */},

  properties: [
    {
      name: 'putDelay',
      type: 'Int',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
        let dao = delegate
        Delay(Double(putDelay))({ _ in
          dao.put(obj, sink: sink)
        }, nil)
      */},
    },
  ],
});

