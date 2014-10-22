/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

require('../core/bootFOAMnode');
require('../node/fileDAO');
var path = require('path');

var startTime = process.hrtime();

// Create an XMLFileDAO against FUNTests.xml
var rawDAO = XMLFileDAO.create({ name: path.join(__dirname, 'FUNTests.xml'), model: UnitTest });
global.X.UnitTestDAO = rawDAO;
var dao = rawDAO.where(AND(EQ(UnitTest.DISABLED, false), CONTAINS(UnitTest.TAGS, 'node')));

// Now lets fetch the top-level tests and start executing them.
// We'll let them hand down to their children as they go, too.
var allTests = [];

var failCount = 0;
function onFailure(test) {
  console.log('Test failure: ' + test.name);
  failCount++;
  if ( RegressionTest.isInstance(test) ) {
    console.log('Master:\n=======');
    console.log(test.master);
    console.log('\nResults:\n========');
    console.log(test.results);
  } else {
    console.log('Results:\n========');
    console.log(test.results);
  }
}

global.X.onTestFailure = onFailure;

function testsComplete() {
  console.log('Testing complete. Passed: ' + (allTests.length - failCount) + ',  Failed: ' + failCount);
  var totalTime = process.hrtime(startTime);
  console.log('Test running took ' + totalTime[0] + ' seconds and ' + (totalTime[1]/1000) + ' microseconds');
  process.exit( failCount > 0 ? 1 : 0 );
}

dao.select({ put: function(t) { allTests.push(t.clone()); } })(function() {
  var afuncs = [];
  allTests.dao.where(EQ(UnitTest.PARENT_TEST, '')).select({
    put: function(test) {
      console.log('found ' + test.name);
      afuncs.push(function(ret){
        try {
          test.atest()(ret);
        } catch (e) {
          console.error('Error while executing ' + test.name + ': \n' + e.stack);
          ret();
        }
      });
    },
    eof: function() {
      aseq.apply(null, afuncs)(testsComplete);
    }
  });
});

