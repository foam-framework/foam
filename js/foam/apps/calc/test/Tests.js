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

CLASS({
  package: 'foam.apps.calc.test',
  name: 'Tests',
  description: 'ACalc Unit TEsts.',
  imports: [
    'assert'
  ],
  requires: [
    'foam.apps.calc.Calc'
  ],
  properties: [
    {
      name: 'calc',
      factory: function() { return this.Calc.create(); }
    }
  ],
  tests: [
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '3',
      result: 3
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '4',
      result: 4
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5',
      result: 5
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '6',
      result: 6
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '7',
      result: 7
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '8',
      result: 8
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '9',
      result: 9
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 2 3 4 5 6 7 8 9',
      result: 123456789
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 ac',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0',
      result: 10
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 1',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'minus 1 0 equals',
      result: -10
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'minus 0 1 equals',
      result: -1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 2 3',
      result: 123
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 sign',
      result: -1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 point 0',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 point 1',
      result: 1.1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 point 0 1',
      result: 1.01
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 point 0 0 1',
      result: 1.001
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 point point point 0',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 point point point 1',
      result: 1.1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'backspace',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 backspace',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 1 backspace',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 point 1 backspace',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 sign sign',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 plus 0 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 plus 1 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 plus 0 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 plus 1 equals',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 plus 2 equals',
      result: 3
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 plus 1 equals',
      result: 3
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 plus 1 0 plus 1 0 0 equals',
      result: 111
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 minus 0 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 minus 1 equals',
      result: -1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 minus 0 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 minus 1 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 minus 2 equals',
      result: -1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 minus 1 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 minus 1 0 minus 1 0 0 equals',
      result: -109
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 mult 0 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 mult 1 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 mult 0 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 mult 1 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 mult 2 equals',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 mult 1 equals',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 mult 1 0 mult 1 0 0 equals',
      result: 1000
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 div 0 equals',
      result: Number.NaN
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 div 1 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 div 0 equals',
      result: Number.POSITIVE_INFINITY
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 div 1 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 plus 2 equals equals',
      result: 5
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 plus 2 equals equals equals',
      result: 7
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 mult 2 equals equals',
      result: 4
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 mult 2 equals equals equals',
      result: 8
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 square equals',
      result: 16
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 square equals equals',
      result: 256
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'pi',
      result: Math.PI
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'e',
      result: Math.E
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 percent',
      result: 0.01
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 0 percent',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'deg 1 8 0 sin round',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'deg 9 0 sin',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'rad pi equals sin round',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'rad pi div 2 equals sin round',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'deg 1 sin asin round',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'rad 0 sin asin round',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'deg 1 cos acos round',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'rad 0 cos acos round',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'deg 1 tan atan round',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'rad 0 tan atan round',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 inv',
      result: Number.POSITIVE_INFINITY
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 inv',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 sign inv',
      result: -1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 inv',
      result: 0.5
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 sign inv',
      result: -0.5
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 inv',
      result: 0.1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 sqroot',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 sqroot',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '4 sqroot',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 0 sqroot',
      result: 10
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 sign sqroot',
      result: Number.NaN
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 square',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 square',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 square',
      result: 4
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 square',
      result: 100
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 sign square',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 ln',
      result: Number.NEGATIVE_INFINITY
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 ln exp',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 ln exp',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 ln exp round',
      result: 10
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'point 1 log round',
      result: -1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 log',
      result: Number.NEGATIVE_INFINITY
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 log',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 log',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 0 log',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 0 0 log round',
      result: 3
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 exp',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 exp',
      result: Math.E
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 root 1 0 0 equals',
      result: 10
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '3 root 2 7 equals',
      result: 3
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 pow 0 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 pow 1 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 pow 0 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 pow 1 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 pow 2 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 pow 2 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 pow 2 equals',
      result: 4
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 sign fact',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 fact',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 fact',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 fact',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '3 fact',
      result: 6
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '4 fact',
      result: 24
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 fact',
      result: 3628800
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 0 0 0 fact',
      result: Number.POSITIVE_INFINITY
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 point 5 fact mult 1 0 0 0 equals round',
      result: 1329
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 point 5 fact mult 1 0 0 0 equals round',
      result: 287885
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 mod 2 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 mod 2 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 mod 2 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '3 mod 2 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '4 mod 2 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 mod 2 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 mod 3 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 mod 3 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '2 mod 3 equals',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '3 mod 3 equals',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '4 mod 3 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 mod 3 equals',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 p 0 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 p 1 equals',
      result: 5
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 p 2 equals',
      result: 20
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 p 3 equals',
      result: 60
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 p 4 equals',
      result: 120
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 p 5 equals',
      result: 120
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 c 0 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 c 1 equals',
      result: 5
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 c 2 equals',
      result: 10
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 c 3 equals',
      result: 10
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 c 4 equals',
      result: 5
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '5 c 5 equals',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '0 round',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 round',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'point 4 round',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'point 5 round',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'point 6 round',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: 'fetch',
      result: 0
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 store 2 fetch',
      result: 1
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 store 2 store 3 fetch',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 store 2 store fetch',
      result: 2
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 store plus 1 equals 2 plus fetch equals',
      result: 3
    },
    {
      model_: 'foam.apps.calc.test.CalcTest',
      input: '1 2 3 plus 1 equals 1 equals',
      result: 1
    }
  ]
});
