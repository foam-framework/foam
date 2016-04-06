CLASS({
  package: 'foam.dao.swift',
  name: 'ArraySink',
  extends: 'foam.dao.swift.Sink',

  properties: [
    {
      name: 'array',
      swiftType: '[FObject]',
      swiftFactory: 'return []',
    },
  ],

  methods: [
    {
      name: 'put',
      swiftCode: 'array.append(obj)',
    },
    {
      name: 'remove',
      swiftCode: function() {/*
        let index = array.indexOf(obj)
        if index != nil {
          array.removeAtIndex(index!)
        }
      */},
    },
    {
      name: 'reset',
      swiftCode: 'array.removeAll()',
    },
  ],
});
