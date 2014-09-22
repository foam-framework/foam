
require('../core/bootFOAMnode');
require('../node/fileDAO');
var path = require('path');

// Create an XMLFileDAO against FUNTests.xml
var rawDAO = XMLFileDAO.create({ name: path.join(__dirname, 'FUNTests.xml'), model: UnitTest });
global.X.UnitTestDAO = rawDAO;
var dao = rawDAO.where(EQ(UnitTest.DISABLED, false));

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
  if ( failCount > 0 ) process.exit(1);
}

dao.select({ put: function(t) { allTests.push(t.clone()); } })(function() {
  var afuncs = [];
  allTests.dao.where(EQ(UnitTest.PARENT_TEST, '')).select({
    put: function(test) {
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

