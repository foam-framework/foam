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

apar(arequire('Calc'), arequire('TableView'))(function() {

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
      code: 'calc.ac();var ks = "' + input + '".split(" ");for ( var i = 0 ; i < ks.length ; i++ ) calc[ks[i]]();this.assert(calc.a2 == ' + result + ', "Expecting: " + ' + result + ' + " found: " + calc.a2);'
    });
  }
  var tests = UnitTest.create({
    name: 'Tests',
    description: 'ACalc Unit Tests.',
    code: function() { calc = Calc.create(); },
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

    ]
  });

  tests.test();
  var tView = TableView.create({
    model: UnitTest,
    dao: tests.tests,
    scrollEnabled: false,
    rows: 1000,
    properties: ['name', 'description', 'results', 'passed', 'failed']
  });
//  tView.write(document);
  $('output').innerHTML = tView.toHTML();
  tView.initHTML();
});
