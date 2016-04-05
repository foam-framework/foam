CLASS({
  package: 'foam.dao.swift',
  name: 'Sink',

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject',
        },
      ],
      swiftCode: '// Override and implement.',
    },
    {
      name: 'remove',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject',
        },
      ],
      swiftCode: '// Override and implement.',
    },
    {
      name: 'reset',
      swiftCode: '// Override and implement.',
    },
    {
      name: 'eof',
      swiftCode: '// Override and implement.',
    },
    {
      name: 'error',
      swiftCode: '// Override and implement.',
    },
  ],
});
