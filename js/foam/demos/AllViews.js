CLASS({
  name: 'AllViews',
  package: 'foam.demos',

  properties: [
    {
      name: 'basicProperty'
    },
    {
      model_: 'StringProperty',
      name: 'textField'
    },
    {
      model_: 'StringProperty',
      name: 'textArea',
      displayHeight: 10
    },
    {
      model_: 'StringArrayProperty',
      name: 'stringArrayProperty'
    },
    {
      model_: 'IntProperty',
      name: 'intProperty'
    },
    {
      model_: 'FloatProperty',
      name: 'floatProperty'
    },
    {
      model_: 'BooleanProperty',
      name: 'toggleBoolean'
    },
    {
      model_: 'BooleanProperty',
      name: 'checkboxBoolean'
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'radioChoices',
//      view: 'foam.ui.ChoiceView',
      choices: ['Choice one', 'Choice two', 'Choice three']
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'dropDownChoices',
      view: 'foam.ui.PopupChoiceView',
      choices: ['Choice a', 'Choice b', 'Choice c'],
    }
  ],
  actions: [
    {
      name: 'simpleAction',
      action: function(){}
    },
    {
      name: 'disabledAction',
      isEnabled: function() { return false; }
    },
    {
      name: 'hiddenAction',
      isAvailable: function() { return false; }
    }
  ]
});

