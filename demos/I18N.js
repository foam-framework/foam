CLASS({
  name: 'Test',

  requires: ['foam.ui.ChoiceListView'],
  
  properties: [
    {
      name: 'color',
      label: lm({
        en: 'Color',
        'en-uk': 'Colour',
        'en-ca': 'Colour',
        es: 'De Color',
        fr: 'Couleur'
      })
    },
    {
      name: 'province',
      label: lm({
        en:      'State',
        'en-ja': 'Parish',
        'en-ca': 'Province',
        'en-uk': 'County',
        es:      'Provincia',
        fr:      'Province'
      })
    },
    {
      name: 'number',
      label: lm({
        en: 'Number',
        es: 'N\u00FAmero',
        fr: 'Nombre'
      }),
      view: {
        factory_: 'foam.ui.ChoiceListView',
        choices: [
          [
            'One',
            lm({
              en: 'One',
              es: 'Uno',
              fr: 'Une'
            })
          ],
          [
            'Two',
            lm({
              en: 'Two',
              es: 'Dos',
              fr: 'Deux'
            })
          ],
          [
            'Three',
            lm({
              en: 'Three',
              es: 'Tres',
              fr: 'Trois'
            })
          ]
        ]
      }
    }
  ]
});

var t = Test.create();

apar( 
  arequire('foam.ui.DetailView'),
  arequire('Test')
  )(function(m) {
  var v = X.foam.ui.DetailView.create({
    data: t,
    title: lm({
      en: 'Edit Test',
      es: 'Editar Prueba',
      fr: 'Modifier Essai'
    })
  });
  document.body.innerHTML = document.body.innerHTML + v.toHTML();
  v.initHTML();
});

