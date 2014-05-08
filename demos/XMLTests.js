FOAModel({
  name: 'DemoView',
  extendsModel: 'DetailView',
  templates: [ { name: 'toHTML' } ]
});

arequire('DemoView')(function(DemoView) {
  var test = FOAM({
    model_: 'UnitTest',
    name: 'XMLUtil Tests',
    description: 'Define an example model (see the DAO tests above) and make sure it serializes to and from XML',
    view: 'DemoView',
    editable: false,
    code: function() {
      Person = FOAM({
        model_: 'Model',
        name: 'Person',
        properties: [
          { model_: 'IntegerProperty', name: 'id' },
          { name: 'name' },
          { name: 'sex', defaultValue: 'M' },
          { model_: 'IntegerProperty', name: 'age' },
          { model_: 'ArrayProperty', name: 'kids' },
          { name: 'troublesome"quoted"name' }
        ]
      });

      alice = Person.create({
        id: 1,
        name: 'Alice',
        sex: 'F',
        age: 42,
        kids: ['Emily', 'Bobby</i><i>Injection'],
        'troublesome"quote"name': 'some value'
      });
    },

    tests: [
      {
        model_: 'UnitTest',
        name: 'RoundTrip1',
        description: 'Serialize the alice object and parse it back again',
        code: function() {
          var xml = XMLUtil.stringify([alice]);
          log('<pre>' + XMLUtil.escape(xml) + '</pre>');
          var parsed = XMLUtil.parse(xml)[0];
          jlog('Alice: ', alice);
          jlog('Parsed: ', parsed);
          assert(alice.equals(parsed), 'Objects should match');
          assert(parsed.kids.length === alice.kids.length, 'In particular, the tags should be escaped');
        }
      }
      ]
  });
  test.test();
  test.write(document, DemoView);
});
