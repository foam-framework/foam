CLASS({
  package: 'foam.dao.swift',
  name: 'RelaySink',
  extends: 'foam.dao.swift.Sink',

  properties: [
    {
      name: 'relay',
      swiftType: 'AbstractDAO?',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: 'relay?.notify_("put", fObj: obj)',
    },
    {
      name: 'remove',
      swiftCode: 'relay?.notify_("remove", fObj: obj)',
    },
  ],
});
