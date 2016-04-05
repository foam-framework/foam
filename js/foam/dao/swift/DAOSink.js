CLASS({
  package: 'foam.dao.swift',
  name: 'DAOSink',
  extends: 'foam.dao.swift.Sink',

  properties: [
    {
      name: 'delegate',
      swiftType: 'AbstractDAO?',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: 'delegate?.put(obj)',
    },
    {
      name: 'remove',
      swiftCode: 'delegate?.remove(obj)',
    },
  ],
});
