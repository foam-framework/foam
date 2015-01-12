apar(arequire('DemoView'), arequire('Calc'))(function() {
  var test = FOAM({
    model_: 'UnitTest',
    name: 'Calculator Tests',
    description: 'Comprehensive unit tests for calculator application.',
    view: 'DemoView',
    editable: false,
    code: function() {
      calc = Calc.create();
    },

    tests: [
      {
        model_: 'UnitTest',
        name: '1+2=3',
        description: 'Test addition.',
        code: function() {
          calc['1']();
          calc['plus']();
          calc['2']();
          calc['equals']();
          
          this.assert(calc.a1 == 3, '1+2 != 3');
        }
      }
      ]
  });
  test.test();
  test.write(document, DemoView);
});
