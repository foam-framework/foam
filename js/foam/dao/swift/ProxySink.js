CLASS({
  package: 'foam.dao.swift',
  name: 'ProxySink',
  extends: 'foam.dao.swift.Sink',

  properties: [
    {
      name: 'delegate',
      swiftType: 'Sink?',
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
    {
      name: 'reset',
      swiftCode: 'delegate?.reset()',
    },
    {
      name: 'eof',
      swiftCode: 'delegate?.eof()',
    },
    {
      name: 'error',
      swiftCode: 'delegate?.error()',
    },
  ],
});
