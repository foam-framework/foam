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
  name: 'TestRunner',
  package: 'foam.testing',
  requires: [
    'foam.dao.ProxyDAO',
    'foam.testing.XMLResultWriter'
  ],
  imports: ["process"],
  properties: [
    {
      model_: 'StringArrayProperty',
      name: 'targets',
      adapt: function(_, a) {
        if ( ! Array.isArray(a) ) return a.split(',');
        return a;
      }
    },
    {
      model_: 'StringProperty',
      name: 'xmlLogFile'
    },
    {
      model_: 'BooleanProperty',
      name: 'allPassed'
    },
    {
      name: 'fs',
      lazyFactory: function() { return require('fs'); }
    }
  ],
  actions: [
    {
      name: 'execute',
      action: function() {
        // Always declare a test failure unless we get to the end of the test
        // runs and they all passed.
        var finished = false;
        if ( this.process ) {
          this.process.on('exit', function(code) {
            if ( ! finished ) {
              console.error("Premature exit from test runner.");
              process.exit(1);
            } else {
              process.exit(this.allPassed ? 0 : 1);
            }
          }.bind(this));
        }

        var seq = [];

        for ( var i = 0 ; i < this.targets.length ; i++ ) {
          seq.push(arequire(this.targets[i]));
        }

        this.allPassed = true;

        var tests = [];

        aseq(
          aseq.apply(null, seq),
          function(ret) {
            var seq = [];
            for ( var i = 0 ; i < this.targets.length ; i++ ) {
              seq.push((function(model) {
                return aseq(
                  function(ret) {
                    tests = tests.concat(model.tests);
                    ret();
                  },
                  model.atest(),
                  function(ret, passed) {
                    if ( ! passed ) this.allPassed = false;
                    for ( var i = 0 ; i < model.tests.length ; i++ ) {
                      console.log("Test Case: ", model.tests[i].name);
                      console.log(model.tests[i].results);
                    }
                    ret();
                  }.bind(this));
              }.bind(this))(this.X.lookup(this.targets[i])));
            }
            aseq.apply(null, seq)(ret);
          }.bind(this),
          aif(this.xmlLogFile,
              function(ret) {
                var writer = this.XMLResultWriter.create({
                  tests: tests
                });
                var output = writer.toXML();
                this.fs.writeFile(
                  this.xmlLogFile,
                  writer.toXML(),
                  function(err) {
                    if ( err ) throw err;
                    ret();
                  });
              }.bind(this))
        )(function() {
          finished = true;
          process.exit();
        }.bind(this));
      }
    }
  ]
});
