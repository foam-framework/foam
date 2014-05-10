FOAModel({
  name: 'AllViews',

  properties: [
    {
      name: 'defaultEverything'
    },
    {
      name: 'defaultValue',
      defaultValue: 'defaultValue'
    },
    {
      name: 'clickToEnableEdit',
      defaultValue: 'click to enable edit',
      view: {
        model_: 'TextFieldView',
        className: 'clickToEnableEdit'
      }
    },
    {
      model_: 'StringProperty',
      name: 'stringProperty'
    },
    {
      model_: 'StringProperty',
      name: 'stringWithWidth',
      displayWidth: 60
    },
    {
      model_: 'StringProperty',
      name: 'stringWithWidthAndHeight',
      displayWidth: 40,
      displayHeight: 5
    },
    {
      model_: 'StringProperty',
      name: 'readOnlyStaticHTML',
      mode: 'read-only',
      defaultValue: '<font color=red><b>BOO!</b></font>'
    },
    {
      model_: 'BooleanProperty',
      name: 'booleanProperty'
    },
    {
      model_: 'BooleanProperty',
      name: 'imageBooleanProperty',
      view: ImageBooleanView.create({
               trueImage: 'data:image/gif;base64,R0lGODlhDwAPAMQfAF9h4RYVnZeQJC0u0lRQU42R6P/7Fv74L05NrRkZxi4tW52XXv71D8nAIWxnjnRxr3NuMJKOluXbBe7kCa2x7UFD1vPoB77D8Jqe6n6B5tvTUr62BMrP8lJPh1xbuv///yH5BAEAAB8ALAAAAAAPAA8AAAWD4CeOWQKMaDpESepi3tFlLgpExlK9RT9ohkYi08N8KhWP8nEwMBwIDyJRSTgO2CaDYcBOCAlMgtDYmhmTDSFQ+HAqgbLZIlAMLqiKw7m1EAYuFQsGEhITEwItKBc/EgIEAhINAUYkCBIQAQMBEGonIwAKa21iCgo7IxQDFRQjF1VtHyEAOw==', //'images/star_on.gif',
               falseImage: 'data:image/gif;base64,R0lGODlhDwAPALMPAP///8zj++r7/7vb/rHW/tPt/9Lk+qzT/rbY/sHh/8Te/N7q+Nzy/7nY/djn+f///yH5BAEAAA8ALAAAAAAPAA8AAARg8MkZjpo4k0KyNwlQBB42MICAfEF7APDRBsYzIEkewGKeDI1DgUckMg6GTdFIqC0QgyUgQVhgGkOi4OBBCJYdzILAywIGNcoOgCAQvowBRpE4kgzCQgPjQCAcEwsNTRIRADs=' //'images/star_off.gif'
             })
    },
    {
      model_: 'DateProperty',
      name: 'dateProperty'
    },
    {
      model_: 'DateTimeProperty',
      name: 'dateTimeProperty'
    },
    {
      model_: 'DateTimeProperty',
      name: 'relativeDateTimeProperty',
      view: 'RelativeDateTimeFieldView',
      defaultValue: new Date(Date.now()-123456)
    },
    {
      model_: 'IntegerProperty',
      name: 'integerProperty',
      defaultValue: 42
    },
    {
      model_: 'FunctionProperty',
      name: 'functionProperty',
      defaultValue: function() { console.log('boo!'); }
    },
<!--
    {
      model_: 'ReferenceProperty',
      name: 'referenceProperty',
      subType: 'Model'
    },
-->
    {
      model_: 'StringArrayProperty',
      name: 'stringArrayProperty',
      defaultValue: ["value1", "value2", "value3"]
    },
    {
      model_: 'EMailProperty',
      name: 'emailProperty'
    },
    {
      model_: 'URLProperty',
      name: 'urlProperty'
    },
    {
      name: 'choiceView',
      view: {
        model_: 'ChoiceView',
        helpText: 'Help Text',
        choices: [ 'Value1', 'Value2', 'Value3' ]
      }
    },
    {
      name: 'choiceViewWithDefaultValue',
      defaultValue: 'Value1',
      view: {
        model_: 'ChoiceView',
        helpText: 'Help Text',
        choices: [ 'Value1', 'Value2', 'Value3' ]
      }
    },
    {
      name: 'choiceViewWithLabels',
      view: {
        model_: 'ChoiceView',
        helpText: 'Help Text',
        choices: [
          [ 'value1', 'Label 1' ],
          [ 'value2', 'Label 2' ],
          [ 'value3', 'Label 3' ]
        ]
      }
    },
    {
      name: 'choiceListView',
      defaultValue: 'value2',
      view: ChoiceListView.create({
        choices: [
          [ 'value1', 'Label 1' ],
          [ 'value2', 'Label 2' ],
          [ 'value3', 'Label 3' ]
        ]
      })
    },
    {
      name: 'verticalChoiceListView',
      defaultValue: 'value2',
      view: ChoiceListView.create({
        orientation: 'vertical',
        choices: [
          [ 'value1', 'Label 1' ],
          [ 'value2', 'Label 2' ],
          [ 'value3', 'Label 3' ]
        ]
      })
    },
    {
      name: 'radioBoxView',
      view: RadioBoxView.create({
         helpText: 'Help Text',
         choices: [
           [ 'value1', 'Label 1' ],
           [ 'value2', 'Label 2' ],
           [ 'value3', 'Label 3' ]
         ]
      })
    },
    {
      model_: 'ArrayProperty',
      name: 'arrayProperty',
      subType: 'Model'
    }
  ]
});

var allViews = AllViews.create();

document.write('<table><tr><td>');
  var dv1 = DetailView.create({model: AllViews, value: SimpleValue.create(allViews)});
  dv1.write(document);
document.write('</td><td>');
  var dv2 = DetailView.create({model: AllViews, value: SimpleValue.create(allViews)});
  dv2.write(document);
document.write('</td></tr></table>');

allViews.addListener(console.log.bind(console));

