CLASS({
  name: 'JsonTest',
  package: 'test',
  requires: [
    'test.JsonTestEnum',
    'test.JsonTestSubProp',
  ],
  properties: [
    {
      type: 'String',
      name: 'stringProp',
    },
    {
      type: 'Int',
      name: 'intProp',
    },
    {
      type: 'Long',
      name: 'longProp',
    },
    {
      type: 'FObject',
      subType: 'test.JsonTestSubProp',
      name: 'fobjectProp',
    },
    {
      type: 'Array',
      subType: 'test.JsonTestSubProp',
      name: 'fobjectArrayProp',
    },
    {
      type: 'StringArray',
      subType: 'test.JsonTestSubProp',
      name: 'stringArrayProp',
    },
    {
      type: 'Date',
      name: 'dateProp',
    },
    {
      type: 'Enum',
      enum: 'test.JsonTestEnum',
      name: 'enumProp',
    },
  ],
});
