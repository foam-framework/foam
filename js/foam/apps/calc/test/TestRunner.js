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
  name: 'TestRunner',
  extends: 'foam.ui.View',
  requires: [
    'foam.apps.calc.test.Tests',
    'foam.ui.TableView'
  ],
  properties: [
    {
      name: 'test',
      factory: function() {
        return this.Tests;
      },
      postSet: function(_, t) {
        t.atest()(function(){
          var failed = 0;
          var passed = 0;
          for ( var i = 0; i < this.tests.length ; i++) {
            var t = this.tests[i];
            this.tests[i].name = i + 1;
            if ( t.hasFailed() ) failed++;
            else passed++;
          }

          this.failed = failed;
          this.passed = passed;
        }.bind(this));
      }
    },
    {
      name: 'tests',
      factory: function() {
        return this.test.tests;
      },
    },
    {
      type: 'Int',
      name: 'failed',
      mode: 'read-only'
    },
    {
      type: 'Int',
      name: 'passed',
      mode: 'read-only'
    }
  ],
  templates: [
    function toHTML() {/*
Passed: $$passed Failed: $$failed
<br/>
<%=
  this.TableView.create({
    model: this.Tests.tests[0].model_,
    dao: this.tests,
    scrollEnabled: false,
    rows: 1000,
    properties: ['name', 'description', 'results', 'passed', 'failed']
  })
%>
 */}
  ]
});
