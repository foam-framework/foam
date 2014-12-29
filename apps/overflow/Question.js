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
      name: 'question'
    },
    {
      model_: 'StringProperty',
      name: 'answer'
    },
    {
      name: 'src'
    }
  ]
});
