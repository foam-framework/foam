=======
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
});
