MODEL({
  name: 'Test',

  properties: [
    {
      name: 'color',
      label: lm({
        en: 'Color',
        'en-uk': 'Colour',
        sp: 'De Color',
        fr: 'Couleur'
      })
    },
    {
      name: 'province',
      label: lm({
        en:      'State',
        'en-ja': 'Parish',
        'en-ca': 'Province',
        sp:      'Provincia',
        fr:      'Province'
      })
    }
  ]
});

var t = Test.create();
var v = DetailView.create({data: t, title: 'Title' });
t.write(document);
