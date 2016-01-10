CLASS({
  name: 'Question',
  properties: [
    {
      type: 'Int',
      name: 'id'
    },
    {
      name: 'questionBy'
    },
    {
      name: 'answerBy'
    },
    {
      type: 'DateTime',
      name: 'created'
    },
    {
      type: 'StringArray',
      name: 'labels'
    },
    {
      type: 'String',
      name: 'title'
    },
    {
      type: 'String',
      name: 'question',
      preSet: function(_, q) { return StringProperty.ADAPT.defaultValue(null, q).trim(); }
    },
    {
      type: 'String',
      name: 'answer',
      preSet: function(_, q) { return StringProperty.ADAPT.defaultValue(null, q).trim(); }
    },
    {
      name: 'src'
    }
  ]
});
