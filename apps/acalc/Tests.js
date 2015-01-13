apar(arequire('Calc'))(function() {

     var num = 1;
     function t(input, result) {
       return UnitTest.create({
         name: 'Test ' + num++,
         description: input,
         code: 'console.log("Running Test");var ks = "' + input + '".split(" ");for ( var i = 0 ; i < ks.length ; i++ ) calc[ks[i]]();this.assert("Expecting: " + ' + result + ', calc.a2 == ' + result + ');'
       });
     }
     var tests = UnitTest.create({
       name: 'Tests',
       description: 'ACalc Unit Tests.',
       code: function() { calc = Calc.create(); },
       tests: [
         t('0', '1'),
         t('1', '1'),
         t('2', '2'),
         t('1 plus 1 equals', '3'),
         t('1 plus 2 equals', '3')
       ]
     });

     tests.test();
     tests.write(document);
/*
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
*/
});
