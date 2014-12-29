CLASS({
  name: 'Question',
  properties: [
    {
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
      name: 'labels'
    },
    {
      name: 'questionTitle'
    },
    {
      name: 'question'
    },
    {
      name: 'answer'
    },
    {
      name: 'src'
    }
  ]
});
