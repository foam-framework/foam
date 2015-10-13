CLASS({
  package: 'foam.apps.calc.test',
  name: 'TestRunner',
  extendsModel: 'foam.ui.View',
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
      model_: 'IntProperty',
      name: 'failed',
      mode: 'read-only'
    },
    {
      model_: 'IntProperty',
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
