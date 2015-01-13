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
  UnitTest.DESCRIPTION.tableWidth = "200px";
  UnitTest.RESULTS.tableWidth     = "300px";
  UnitTest.NAME.lable = '';

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
      t('backspace', 0),
      t('1 backspace', 0),
      t('1 1 backspace', 1),
      t('1 point 1 backspace', 1),
      t('1 sign sign', 1),
      t('1 plus 1 equals', 2),
      t('1 plus 2 equals', 3)
    ]
  });

  tests.test();
  var tView = TableView.create({model: UnitTest, dao: tests.tests, properties: ['name', 'description', 'results', 'passed', 'failed']});
//  tView.write(document);
  $('output').innerHTML = tView.toHTML();
  tView.initHTML();
});
