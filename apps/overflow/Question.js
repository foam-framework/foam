CLASS({
  name: 'Question',
  properties: [
    {
      model_: 'IntProperty',
      name: 'id'
    },
    {
      name: 'questionBy'
    },
    {
      name: 'answerBy'
    },
    {
      model_: 'DateTimeProperty',
      name: 'created'
    },
    {
      model_: 'StringArrayProperty',
      name: 'labels'
    },
    {
      model_: 'StringProperty',
      name: 'title'
    },
    {
      model_: 'StringProperty',
      name: 'question',
      preSet: function(_, q) { return StringProperty.ADAPT.defaultValue(null, q).trim(); }
    },
    {
      model_: 'StringProperty',
      name: 'answer',
      preSet: function(_, q) { return StringProperty.ADAPT.defaultValue(null, q).trim(); }
    },
    {
      name: 'src'
    }
  ]
});
