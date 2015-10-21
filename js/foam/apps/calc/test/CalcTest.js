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
  name: 'CalcTest',
  extends: 'UnitTest',
  properties: [
    {
      name: 'name',
      tableLabel: '#'
    },
    {
      name: 'input',
    },
    {
      name: 'description',
      tableWidth: '30%',
      tableLabel: 'input',
      defaultValueFn: function() { return this.input; }
    },
    {
      name: 'result'
    },
    {
      name: 'results',
      tableWidth: '40%',
      tableFormatter: function(val, obj, table) { return val; }
    },
    {
      name: 'passed',
      tableWidth: '70px',
      tableFormatter: function(val) { return (val ? '<font color=green>' : '<font color=black>' ) + val + "</font>"; }
    },
    {
      name: 'failed',
      tableWidth: '70px',
    },
    {
      name: 'code',
      lazyFactory: function() {
        var self = this;
        return function() {
          this.calc.ac();
          var ks = self.input.split(" ");
          for ( var i = 0 ; i < ks.length ; i++ ) this.calc[ks[i]]();
          if ( this.calc.a2 == this.calc.a2 ) {
            // this.calc.a2 is not NaN
            this.assert(this.calc.a2 == self.result, "Expecting: " + self.result + " found: " + this.calc.a2);
          } else {
            // this.calc.a2 is NaN, check if result is as well
            this.assert(self.result != self.result, "Expecting: " + self.result + " found: " + this.calc.a2);
          }
        };
      }
    }
  ]
});
