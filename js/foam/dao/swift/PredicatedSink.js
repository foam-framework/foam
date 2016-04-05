CLASS({
  package: 'foam.dao.swift',
  name: 'PredicatedSink',
  extends: 'foam.dao.swift.ProxySink',

  properties: [
    {
      name: 'expr',
      swiftType: 'ExprProtocol!',
    },
  ],

  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
        let result = expr.f(obj) as! Bool
        if result {
          delegate?.put(obj)
        }
      */},
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let result = expr.f(obj) as! Bool
        if result {
          delegate?.remove(obj)
        }
      */},
    },
  ],
});
