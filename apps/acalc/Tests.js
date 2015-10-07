/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var tests;
apar(arequire('Calc'), arequire('foam.ui.TableView'))(function() {

  UnitTest.RESULTS.tableFormatter = function(val, obj, table) { return val; };
  UnitTest.PASSED.tableFormatter  = function(val) { return (val ? '<font color=green>' : '<font color=black>' ) + val + "</font>"; };
  UnitTest.FAILED.tableFormatter  = function(val) { return (val ? '<font color=red>' : '<font color=black>' ) + val + "</font>"; };
  UnitTest.DESCRIPTION.tableWidth = "30%";
  UnitTest.RESULTS.tableWidth     = "40%";
  UnitTest.PASSED.tableWidth      = "70px";
  UnitTest.FAILED.tableWidth      = "70px";
  UnitTest.NAME.tableLabel        = '#';
  UnitTest.DESCRIPTION.tableLabel = 'Input';

  var num = 1;
  function t(input, result) {
    return UnitTest.create({
      name: num++,
      description: input,
      code: 'this.calc.ac();var ks = "' + input + '".split(" ");for ( var i = 0 ; i < ks.length ; i++ ) this.calc[ks[i]]();this.assert(this.calc.a2 == ' + result + ', "Expecting: " + ' + result + ' + " found: " + this.calc.a2);'
    });
  }
  tests = Model.create({
    name: 'Tests',
    description: 'ACalc Unit Tests.',
    imports: ['assert'],
    properties: [
      {
        name: 'calc',
        factory: function() { return Calc.create(); }
      }
    ],
    tests: [
      t('0', 0),
      t('1', 1),
      t('2', 2),
      t('3', 3),
      t('4', 4),
      t('5', 5),
      t('6', 6),
      t('7', 7),
      t('8', 8),
      t('9', 9),
      t('1 2 3 4 5 6 7 8 9', 123456789),
      t('1 ac', 0),
      t('1 0', 10),
      t('0 1', 1),
      t('minus 1 0 equals', -10),
      t('minus 0 1 equals', -1),
      t('1 2 3', 123),
      t('1 sign', -1),
      t('1 point 0', 1),
      t('1 point 1', 1.1),
      t('1 point 0 1', 1.01),
      t('1 point 0 0 1', 1.001),
      t('1 point point point 0', 1),
      t('1 point point point 1', 1.1),
      t('backspace', 0),
      t('1 backspace', 0),
      t('1 1 backspace', 1),
      t('1 point 1 backspace', 1),
      t('1 sign sign', 1),
      t('0 plus 0 equals', 0),
      t('0 plus 1 equals', 1),
      t('1 plus 0 equals', 1),
      t('1 plus 1 equals', 2),
      t('1 plus 2 equals', 3),
      t('2 plus 1 equals', 3),
      t('1 plus 1 0 plus 1 0 0 equals', 111),
      t('0 minus 0 equals', 0),
      t('0 minus 1 equals', -1),
      t('1 minus 0 equals', 1),
      t('1 minus 1 equals', 0),
      t('1 minus 2 equals', -1),
      t('2 minus 1 equals', 1),
      t('1 minus 1 0 minus 1 0 0 equals', -109),
      t('0 mult 0 equals', 0),
      t('0 mult 1 equals', 0),
      t('1 mult 0 equals', 0),
      t('1 mult 1 equals', 1),
      t('1 mult 2 equals', 2),
      t('2 mult 1 equals', 2),
      t('1 mult 1 0 mult 1 0 0 equals', 1000),
//      t('0 div 0 equals', Number.NaN), // Works, but you can't compare NaN properly
      t('0 div 1 equals', 0),
      t('1 div 0 equals', Number.POSITIVE_INFINITY),
      t('1 div 1 equals', 1),
      t('1 plus 2 equals equals', 5),
      t('1 plus 2 equals equals equals', 7),
      t('1 mult 2 equals equals', 4),
      t('1 mult 2 equals equals equals', 8),
      t('2 square equals', 16),
      t('2 square equals equals', 256),
      t('pi', Math.PI),
      t('e', Math.E),
      t('1 percent', 0.01),
      t('1 0 0 percent', 1),
      t('deg 1 8 0 sin round', 0),
      t('deg 9 0 sin', 1),
      t('rad pi equals sin round', 0),
      t('rad pi div 2 equals sin round', 1),
      t('deg 1 sin asin round', 1),
      t('rad 0 sin asin round', 0),
      t('deg 1 cos acos round', 1),
      t('rad 0 cos acos round', 0),
      t('deg 1 tan atan round', 1),
      t('rad 0 tan atan round', 0),
      t('0 inv', Number.POSITIVE_INFINITY),
      t('1 inv', 1),
      t('1 sign inv', -1),
      t('2 inv', 0.5),
      t('2 sign inv', -0.5),
      t('1 0 inv', 0.1),
      t('0 sqroot', 0),
      t('1 sqroot', 1),
      t('4 sqroot', 2),
      t('1 0 0 sqroot', 10),
      // t('1 sign sqroot', Number.NaN), // Works, but you can't compare NaN properly
      t('0 square', 0),
      t('1 square', 1),
      t('2 square', 4),
      t('1 0 square', 100),
      t('1 sign square', 1),
      t('0 ln', Number.NEGATIVE_INFINITY),
      t('1 ln exp', 1),
      t('2 ln exp', 2),
      t('1 0 ln exp round', 10),
      t('point 1 log round', -1),
      t('0 log', Number.NEGATIVE_INFINITY),
      t('1 log', 0),
      t('1 0 log', 1),
      t('1 0 0 log', 2),
      t('1 0 0 0 log round', 3),
      t('0 exp', 1),
      t('1 exp', Math.E),
      t('2 root 1 0 0 equals', 10),
      t('3 root 2 7 equals', 3),
      t('0 pow 0 equals', 1),
      t('0 pow 1 equals', 0),
      t('1 pow 0 equals', 1),
      t('1 pow 1 equals', 1),
      t('0 pow 2 equals', 0),
      t('1 pow 2 equals', 1),
      t('2 pow 2 equals', 4),
      t('1 sign fact', 1),
      t('0 fact', 1),
      t('1 fact', 1),
      t('2 fact', 2),
      t('3 fact', 6),
      t('4 fact', 24),
      t('1 0 fact', 3628800),
      t('1 0 0 0 fact', Number.POSITIVE_INFINITY),
      t('1 point 5 fact mult 1 0 0 0 equals round', 1329),
      t('5 point 5 fact mult 1 0 0 0 equals round', 287885),
      t('0 mod 2 equals', 0),
      t('1 mod 2 equals', 1),
      t('2 mod 2 equals', 0),
      t('3 mod 2 equals', 1),
      t('4 mod 2 equals', 0),
      t('5 mod 2 equals', 1),
      t('0 mod 3 equals', 0),
      t('1 mod 3 equals', 1),
      t('2 mod 3 equals', 2),
      t('3 mod 3 equals', 0),
      t('4 mod 3 equals', 1),
      t('5 mod 3 equals', 2),
      t('5 p 0 equals', 1),
      t('5 p 1 equals', 5),
      t('5 p 2 equals', 20),
      t('5 p 3 equals', 60),
      t('5 p 4 equals', 120),
      t('5 p 5 equals', 120),
      t('5 c 0 equals', 1),
      t('5 c 1 equals', 5),
      t('5 c 2 equals', 10),
      t('5 c 3 equals', 10),
      t('5 c 4 equals', 5),
      t('5 c 5 equals', 1),
      t('0 round', 0),
      t('1 round', 1),
      t('point 4 round', 0),
      t('point 5 round', 1),
      t('point 6 round', 1),
      t('fetch', 0),
      t('1 store 2 fetch', 1),
      t('1 store 2 store 3 fetch', 2),
      t('1 store 2 store fetch', 2),
      t('1 store plus 1 equals 2 plus fetch equals', 3),
      t('1 2 3 plus 1 equals 1 equals', 1)
    ]
  });

  tests.atest()(function(){});

  var tView = foam.ui.TableView.create({
    model: UnitTest,
    dao: tests.tests,
    scrollEnabled: false,
    rows: 1000,
    properties: ['name', 'description', 'results', 'passed', 'failed']
  });

  X.$('output').innerHTML = tView.toHTML();
  tView.initHTML();

  var failed = 0;
  var passed = 0;
  for ( var i = 0 ; i < tests.tests.length ; i++ ) {
    var t = tests.tests[i];

    if ( t.hasFailed() ) failed++
    else passed++;
  }
  X.$('passed').innerHTML = passed;
  X.$('failed').innerHTML = failed;
});
