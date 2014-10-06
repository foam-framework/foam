/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
MODEL({
  name: 'UnitTest',
  plural: 'Unit Tests',

  documentation: function() {/*
    <p>A basic unit test. $$DOC{ref: ".atest"} is the main method, it executes this test.</p>

    <p>A <tt>UnitTest</tt> may contain child tests, under the $$DOC{ref: ".tests"} $$DOC{ref: "Relationship"}. These tests are run when the parent is, if $$DOC{ref: ".runChildTests"} is truthy (the default).</p>

    <p>After the test has finished running, its $$DOC{ref: ".passed"} and $$DOC{ref: ".failed"} properties count the number of assertions that passed and failed in this <em>subtree</em> (that is, including the children, if run).</p>

    <p>Before the children are run, if $$DOC{ref: ".failed"} is nonzero, $$DOC{ref: ".atest"} will check for <tt>this.X.onTestFailure</tt>. If this function is defined, it will be called with the <tt>UnitTest</tt> object as the first argument. This makes it easy for test runners to hook in their error reporting.</p>

    <p>Test failure is abstracted by the $$DOC{ref: ".hasFailed"} method; this method should always be used, since other subclasses have different definitions of failure.</p>
  */},

  tableProperties: [ 'description', 'passed', 'failed' ],
  properties:
  [
    {
      model_: 'Property',
      name: 'name',
      type: 'String',
      required: true,
      displayWidth: 50,
      documentation: 'The unit test\'s name.'
    },
    {
      model_: 'Property',
      name: 'description',
      type: 'String',
      displayWidth: 70,
      displayHeight: 5,
      defaultValue: '',
      // defaultValueFn: function() { return "Test " + this.name; },
      documentation: 'A multi-line description of the unit test.'
    },
    {
      model_: 'BooleanProperty',
      name: 'disabled',
      documentation: 'When true, this test is ignored. Test runners should exclude disabled tests from their DAOs.',
      defaultValue: false
    },
    {
      model_: 'IntProperty',
      name: 'passed',
      required: true,
      transient: true,
      displayWidth: 8,
      displayHeight: 1,
      view: 'IntFieldView',
      documentation: 'Number of assertions which have passed.'
    },
    {
      model_: 'IntProperty',
      name: 'failed',
      required: true,
      transient: true,
      displayWidth: 8,
      displayHeight: 1,
      documentation: 'Number of assertions which have failed.'
    },
    {
      model_: 'BooleanProperty',
      name: 'async',
      defaultValue: false,
      documentation: 'Set to make this test asynchronoous. Async tests receive a <tt>ret</tt> parameter as their first argument, and $$DOC{ref: ".atest"} will not return until <tt>ret</tt> is called by the test code.'
    },
    {
      model_: 'FunctionProperty',
      name: 'code',
      label: 'Test Code',
      displayWidth: 80,
      displayHeight: 30,
      documentation: 'The code for the test. Should not include the <tt>function() { ... }</tt>, just the body. Should expect a <tt>ret</tt> parameter when the test is async, see $$DOC{ref: ".async", text: "above"}.',
      fromElement: function(e) {
        var txt = e.innerHTML;

        txt =
          txt.trim().startsWith('function') ? txt                               :
          this.async                        ? 'function(ret) {\n' + txt + '\n}' :
                                              'function() {\n'    + txt + '\n}' ;

        return eval('(' + txt + ')');
      },
      preSet: function(_, value) {
        if ( typeof value === 'string' ) {
          if ( value.startsWith('function') ) {
            value = eval('(' + value + ')');
          } else {
            value = new Function(value);
          }
        }

        // Now value is a function either way.
        // We just need to check that if it's async it has an argument.
        if ( typeof value === 'function' && this.async && value.length === 0 ) {
          var str = value.toString();
          return eval('(function(ret)' + str.substring(str.indexOf('{')) + ')');
        } else {
          return value;
        }
      }
    },
    {
      model_: 'BooleanProperty',
      name: 'hasRun',
      transient: true,
      hidden: true,
      defaultValue: false,
      documentation: 'Set after the test has finished executing. Prevents the test from running twice.'
    },
    {
      model_: 'Property',
      name: 'results',
      type: 'String',
      mode: 'read-only',
      view: 'UnitTestResultView',
      transient: true,
      required: true,
      displayWidth: 80,
      displayHeight: 20,
      documentation: 'Log output for this test. Written to by $$DOC{ref: ".log"}, as well as $$DOC{ref: ".assert"} and its friends $$DOC{ref: ".fail"} and $$DOC{ref: ".ok"}.'
    },
    {
      model_: 'StringArrayProperty',
      name:  'tags',
      label: 'Tags',
      documentation: 'A list of tags for this test. Not currently used by our test runners. Could be used in the future to mark what environment (node, browser, OS) this test can run in.'
    },
    {
      name: 'parentTest',
      documentation: 'The parent property used to define the $$DOC{ref: ".tests"} relationship.'
    },
    {
      name: 'runChildTests',
      documentation: 'Whether the nested child tests should be run when this test is. Defaults to <tt>true</tt>, but some test runners set it to <tt>false</tt> so they can integrate with displaying the results.',
      transient: true,
      defaultValue: true
    }
  ],

  relationships: [
    {
      name: 'tests',
      documentation: function() {/*
        <p>Sub-tests of this test.</p>

        <p>Run with the parent test if $$DOC{ref: ".runChildTests"} are set.</p>

        <p>If this relationship is in use, <tt>this.X.UnitTestDAO</tt> must be defined. Test runners will generally want to select all (enabled) tests for <tt>this.X.UnitTestDAO</tt>, but filter only the parentless, top-level tests to execute, letting this relationship handle the children.</p>
      */},
      relatedModel: 'UnitTest',
      relatedProperty: 'parentTest'
    }
  ],

  actions: [
    {
      name:  'test',
      documentation:  'Synchronous helper to run the tests. Simply calls $$DOC{ref: ".atest"}.',
      action: function(obj) { asynchronized(this.atest(), this.LOCK)(function() {}); }
    }
  ],

  methods:{
    // Lock to prevent more than one top-level Test from running at once.
    LOCK: {},

    // Run test asynchronously as an afunc.
    atest: function() {
      var self = this;

      if ( this.hasRun ) return anop;
      this.hasRun = true;

      // Copy the test methods into the context.=
      // The context becomes "this" inside the tests.
      // The UnitTest object itself becomes this.test inside tests.
      this.X = this.X.sub({}, this.name);
      this.X.log    = this.log.bind(this);
      this.X.jlog   = this.jlog.bind(this);
      this.X.assert = this.assert.bind(this);
      this.X.fail   = this.fail.bind(this);
      this.X.ok     = this.ok.bind(this);
      this.X.append = this.append.bind(this);
      this.X.test   = this;

      this.results = '';

      this.passed = 0;
      this.failed = 0;

      var code;
      code = eval('(' + this.code.toString() + ')');

      var afuncs = [];
      var oldLog;

      afuncs.push(function(ret) {
        oldLog = console.log;
        console.log = self.log.bind(self.X);
        ret();
      });

      afuncs.push(this.async ? code.bind(this.X) : code.abind(this.X));

      afuncs.push(function(ret) {
        console.log = oldLog;
        ret();
      });

      if ( this.runChildTests ) {
        // TODO: This is horrendous, but I can't see a better way.
        // It would nest quite neatly if there were afunc DAO ops.
        var future = this.tests.select([].sink);
        afuncs.push(function(ret) {
          future(function(innerTests) {
            var afuncsInner = [];
            innerTests.forEach(function(test) {
              afuncsInner.push(function(ret) {
                test.X = self.X.sub();
                test.atest()(ret);
              });
            });
            if ( afuncsInner.length ) {
              aseq.apply(this, afuncsInner)(ret);
            } else {
              ret();
            }
          });
        });
      }

      afuncs.push(function(ret) {
        self.hasRun = true;
        self.X.onTestFailure && self.hasFailed() && self.X.onTestFailure(self);
        ret();
      });

      return aseq.apply(this, afuncs);
    },
    append: function(s) { this.results += s; },
    log: function(/*arguments*/) {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.append(arguments[i]);
      this.append('\n');
    },
    jlog: function(/*arguments*/) {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.append(JSONUtil.stringify(arguments[i]));
      this.append('\n');
    },
    addHeader: function(name) {
      this.log('<tr><th colspan=2 class="resultHeader">' + name + '</th></tr>');
    },
    assert: function(condition, comment) {
      if ( condition ) this.passed++; else this.failed++;
      this.log(
        (comment ? comment : '(no message)') +
        ' ' +
        (condition ? "<font color=green>OK</font>" : "<font color=red>ERROR</font>"));
    },
    fail: function(comment) {
      this.assert(false, comment);
    },
    ok: function(comment) {
      this.assert(true, comment);
    },
    hasFailed: function() {
      return this.failed > 0;
    }
  }
});

MODEL({
  name: 'RegressionTest',
  label: 'Regression Test',
  documentation: 'A $$DOC{ref: "UnitTest"} with a "gold master", which is compared with the output of the live test.',

  extendsModel: 'UnitTest',

  properties: [
    {
      name: 'master',
      documentation: 'The "gold" version of the output. Compared with the $$DOC{ref: ".results"} using <tt>.equals()</tt>, and the test passes if they match.'
    },
    {
      name: 'results',
      view: 'RegressionTestResultView'
    },
    {
      model_: 'BooleanProperty',
      name: 'regression',
      hidden: true,
      transient: true,
      defaultValue: false,
      documentation: 'Set after $$DOC{ref: ".atest"}: <tt>true</tt> if $$DOC{ref: ".master"} and $$DOC{ref: ".results"} match, <tt>false</tt> if they don\'t.'
    }
  ],

  actions: [
    {
      name: 'update',
      isEnabled: function() { return ! this.results.equals(this.master); },
      documentation: 'Bound to a button in the <tt>tests/FOAMTests.html</tt> test page, called when the user wants to promote the new live $$DOC{ref: ".results"} to $$DOC{ref: ".master"}.',
      action: function() {
        this.master = this.results;
      }
    }
  ],

  methods: {
    atest: function() {
      // Run SUPER's atest, which returns the unexecuted afunc.
      var sup = this.SUPER();
      // Now we append a last piece that updates regression based on the results.
      return aseq(
        sup,
        function(ret) {
          this.regression = this.hasRun && ! this.results.equals(this.master);
          ret();
        }.bind(this)
      );
    },
    hasFailed: function() {
      return this.regression || this.hasRun && ! this.results.equals(this.master);
    }
  }
});


MODEL({
  name: 'Relationship',
  tableProperties: [
    'name', 'label', 'relatedModel', 'relatedProperty'
  ],

  documentation: function() { /*
      $$DOC{ref:'Relationship',usePlural:true} indicate a parent-child relation
      between instances of
      a $$DOC{ref:'Model'} and some child $$DOC{ref:'Model',usePlural:true},
      through the indicated
      $$DOC{ref:'Property',usePlural:true}. If your $$DOC{ref:'Model',usePlural:true}
      build a tree
      structure of instances, they could likely benefit from a declared
      $$DOC{ref:'Relationship'}.
    */},

  properties: [
    {
      name:  'name',
      type:  'String',
      displayWidth: 30,
      displayHeight: 1,
      defaultValueFn: function() { return GLOBAL[this.relatedModel] ? GLOBAL[this.relatedModel].plural : ''; },
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} names should use camelCase staring with a lower case letter.
         */},
      help: 'The coding identifier for the relationship.'
    },
    {
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      documentation: function() { /* A human readable label for the $$DOC{ref:'.'}. May
        contain spaces or other odd characters.
         */},
      help: 'The display label for the relationship.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
      */},
      help: 'Help text associated with the relationship.'
    },
    {
      model_: 'DocumentationProperty',
      name: 'documentation'
    },
    {
      name:  'relatedModel',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      documentation: function() { /* The $$DOC{ref:'Model.name'} of the related $$DOC{ref:'Model'}.*/},
      help: 'The name of the related Model.'
    },
    {
      name:  'relatedProperty',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      documentation: function() { /*
        The join $$DOC{ref:'Property'} of the related $$DOC{ref:'Model'}.
        This is the property that links back to this $$DOC{ref:'Model'} from the other
        $$DOC{ref:'Model',usePlural:true}.
      */},
      help: 'The join property of the related Model.'
    }
  ]/*,
  methods: {
    dao: function() {
      var m = this.X[this.relatedModel];
      return this.X[m.name + 'DAO'];
    },
    JOIN: function(sink, opt_where) {
      var m = this.X[this.relatedModel];
      var dao = this.X[m.name + 'DAO'] || this.X[m.plural];
      return MAP(JOIN(
        dao.where(opt_where || TRUE),
        m.getProperty(this.relatedProperty),
        []), sink);
    }
  }*/
});


MODEL({
  name: 'Issue',
  plural: 'Issues',
  help: 'An issue describes a question, feature request, or defect.',
  ids: [
    'id'
  ],
  tableProperties:
  [
    'id', 'severity', 'status', 'summary', 'assignedTo'
  ],
  documentation: function() { /*
      An issue describes a question, feature request, or defect.
  */},
  properties:
  [
    {
      model_: 'IntProperty',
      name: 'id',
      label: 'Issue ID',
      displayWidth: 12,
      documentation: function() { /* $$DOC{ref:'Issue'} unique sequence number. */ },
      help: 'Issue\'s unique sequence number.'
    },
    {
      name: 'severity',
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Feature',
          'Minor',
          'Major',
          'Question'
        ]});}
      },
      defaultValue: 'String',
      documentation: function() { /* The severity of the issue. */ },
      help: 'The severity of the issue.'
    },
    {
      name: 'status',
      type: 'String',
      required: true,
      view: {
        create: function() { return ChoiceView.create({choices: [
          'Open',
          'Accepted',
          'Complete',
          'Closed'
        ]});}
      },
      defaultValue: 'String',
      documentation: function() { /* The status of the $$DOC{ref:'Issue'}. */ },
      help: 'The status of the issue.'
    },
    {
      model_: 'Property',
      name: 'summary',
      type: 'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      documentation: function() { /* A one line summary of the $$DOC{ref:'Issue'}. */ },
      help: 'A one line summary of the issue.'
    },
    {
      model_: 'Property',
      name: 'created',
      type: 'DateTime',
      required: true,
      displayWidth: 50,
      displayHeight: 1,
      factory: function() { return new Date(); },
      documentation: function() { /* When this $$DOC{ref:'Issue'} was created. */ },
      help: 'When this issue was created.'
    },
    {
      model_: 'Property',
      name: 'createdBy',
      type: 'String',
      defaultValue: 'kgr',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      documentation: function() { /* Who created the $$DOC{ref:'Issue'}. */ },
      help: 'Who created the issue.'
    },
    {
      model_: 'Property',
      name: 'assignedTo',
      type: 'String',
      defaultValue: 'kgr',
      displayWidth: 30,
      displayHeight: 1,
      documentation: function() { /* Who the $$DOC{ref:'Issue'} is currently assigned to. */ },
      help: 'Who the issue is currently assigned to.'
    },
    {
      model_: 'Property',
      name: 'notes',
      displayWidth: 75,
      displayHeight: 20,
      view: 'TextAreaView',
      documentation: function() { /* Notes describing $$DOC{ref:'Issue'}. */ },
      help: 'Notes describing issue.'
    }
  ],
  tests: [
    {
      model_: 'UnitTest',
      description: 'test1',
      code: function() {this.addHeader("header");this.ok("pass");this.fail("fail");}
    }
  ]
});

(function() {
  for ( var i = 0 ; i < Model.templates.length ; i++ )
    Model.templates[i] = JSONUtil.mapToObj(Model.templates[i]);

  (function() {
    var a = Model.properties;
    for ( var i = 0 ; i < a.length ; i++ ) {
      if ( ! Property.isInstance(a[i]) ) {
        a[i] = Property.getPrototype().create(a[i]);
      }
    }
  })();
})();
