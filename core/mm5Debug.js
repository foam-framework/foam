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

CLASS({
  name: 'Interface',
  plural: 'Interfaces',

  tableProperties: [
    'package', 'name', 'description'
  ],

  documentation: function() { /*
      <p>$$DOC{ref:'Interface',usePlural:true} specify a set of methods with no
      implementation. $$DOC{ref:'Model',usePlural:true} implementing $$DOC{ref:'Interface'}
      fill in the implementation as needed. This is analogous to
      $$DOC{ref:'Interface',usePlural:true} in object-oriented languages.</p>
    */},

  properties: [
    {
      name: 'id',
      transient: true,
      factory: function() { return this.package ? this.package + '.' + this.name : this.name; }
    },
    {
      name:  'name',
      required: true,
      help: 'Interface name.',
      documentation: function() { /* The identifier used in code to represent this $$DOC{ref:'.'}.
        $$DOC{ref:'.name'} should generally only contain identifier-safe characters.
        $$DOC{ref:'.'} definition names should use CamelCase starting with a capital letter.
         */}
    },
    {
      name:  'package',
      help: 'Interface package.',
      documentation: Model.PACKAGE.documentation
    },
    {
      name: 'extends',
      type: 'Array[String]',
      view: 'foam.ui.StringArrayView',
      help: 'Interfaces extended by this interface.',
      documentation: function() { /*
        The other $$DOC{ref:'Interface',usePlural:true} this $$DOC{ref:'Interface'} inherits
        from. Like a $$DOC{ref:'Model'} instance can $$DOC{ref:'Model.extends'} other
        $$DOC{ref:'Model',usePlural:true},
        $$DOC{ref:'Interface',usePlural:true} should only extend other
        instances of $$DOC{ref:'Interface'}.</p>
        <p>Do not specify <code>extends: 'Interface'</code> unless you are
        creating a new interfacing system.
      */}
    },
    {
      name:  'description',
      type:  'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
      defaultValue: '',
      help: 'The interface\'s description.',
      documentation: function() { /* A human readable description of the $$DOC{ref:'.'}. */ }
    },
    {
      name: 'help',
      label: 'Help Text',
      displayWidth: 70,
      displayHeight: 6,
      view: 'foam.ui.TextAreaView',
      help: 'Help text associated with the argument.',
      documentation: function() { /*
          This $$DOC{ref:'.help'} text informs end users how to use the $$DOC{ref:'.'},
          through field labels or tooltips.
        */}
    },
    {
      type: 'Documentation',
      name: 'documentation',
      labels: ['debug'],
    },
    {
      type: 'Array',
      name: 'methods',
      type: 'Array[Method]',
      subType: 'Method',
      view: 'foam.ui.ArrayView',
      factory: function() { return []; },
      help: 'Methods associated with the interface.',
      documentation: function() { /*
        <p>The $$DOC{ref:'Method',usePlural:true} that the interface requires
        extenders to implement.</p>
        */}
    }
  ],
  templates:[
    {
      model_: 'Template',

      name: 'javaSource',
      description: 'Java Source',
      template: 'public interface <% out(this.name); %>\n' +
        '<% if ( this.extends.length ) { %>   extends <%= this.extends.join(", ") %>\n<% } %>' +
        '{\n<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '   <%= meth.javaSource() %>;\n' +
        '<% } %>' +
        '}'
    },
    {
      model_: 'Template',

      name: 'closureSource',
      description: 'Closure JavaScript Source',
      template:
      'goog.provide(\'<%= this.name %>\');\n' +
        '\n' +
        '/**\n' +
        ' * @interface\n' +
        '<% for ( var i = 0 ; i < this.extends.length ; i++ ) { var ext = this.extends[i]; %>' +
        ' * @extends {<%= ext %>}\n' +
        '<% } %>' +
        ' */\n' +
        '<%= this.name %> = function() {};\n' +
        '<% for ( var i = 0 ; i <  this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '\n<%= meth.closureSource(undefined, this.name) %>\n' +
        '<% } %>'
    },
    {
      model_: 'Template',

      name: 'webIdl',
      description: 'Web IDL Source',
      template:
      'interface <%= this.name %> <% if (this.extends.length) { %>: <%= this.extends[0] %> <% } %>{\n' +
        '<% for ( var i = 0 ; i < this.methods.length ; i++ ) { var meth = this.methods[i]; %>' +
        '  <%= meth.webIdl() %>;\n' +
        '<% } %>' +
        '}'
    }
  ]
});


CLASS({
  name: 'UnitTest',
  plural: 'Unit Tests',

  exports: [
    'log',
    'jlog',
    'assert',
    'assertDefined',
    'assertUndefined',
    'assertEquals',
    'assertNotEquals',
    'assertTruthy',
    'assertFalsy',
    'fail',
    'ok',
    'append'
  ],

  documentation: function() {/*
    <p>A basic unit test. $$DOC{ref: ".atest"} is the main method, it executes this test.</p>

    <p>After the test has finished running, its $$DOC{ref: ".passed"} and $$DOC{ref: ".failed"} properties count the number of assertions that passed and failed in this test <em>subtree</em> (that is, including the children, if run).</p>

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
      type: 'String',
      name: 'modelId'
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
      type: 'Boolean',
      name: 'disabled',
      documentation: 'When true, this test is ignored. Test runners should exclude disabled tests from their DAOs.',
      defaultValue: false
    },
    {
      type: 'Int',
      name: 'passed',
      required: true,
      transient: true,
      displayWidth: 8,
      displayHeight: 1,
      view: 'foam.ui.IntFieldView',
      documentation: 'Number of assertions which have passed.'
    },
    {
      type: 'Int',
      name: 'failed',
      required: true,
      transient: true,
      displayWidth: 8,
      displayHeight: 1,
      documentation: 'Number of assertions which have failed.'
    },
    {
      type: 'Boolean',
      name: 'async',
      defaultValue: false,
      documentation: 'Set to make this test asynchronoous. Async tests receive a <tt>ret</tt> parameter as their first argument, and $$DOC{ref: ".atest"} will not return until <tt>ret</tt> is called by the test code.'
    },
    {
      type: 'Function',
      name: 'code',
      label: 'Test Code',
      displayWidth: 80,
      displayHeight: 30,
      documentation: 'The code for the test. Should not include the <tt>function() { ... }</tt>, just the body. Should expect a <tt>ret</tt> parameter when the test is async, see $$DOC{ref: ".async", text: "above"}.',
      fromElement: function(e, p) {
        var txt = e.innerHTML;

        txt =
          txt.trim().startsWith('function') ? txt                               :
          this.async                        ? 'function(ret) {\n' + txt + '\n}' :
                                              'function() {\n'    + txt + '\n}' ;

        this[p.name] = eval('(' + txt + ')');
      },
      adapt: function(_, value) {
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
        }

        return value;
      }
    },
    {
      model_: 'Property',
      name: 'results',
      type: 'String',
      mode: 'read-only',
      view: 'foam.ui.UnitTestResultView',
      transient: true,
      required: true,
      displayWidth: 80,
      displayHeight: 20,
      documentation: 'Log output for this test. Written to by $$DOC{ref: ".log"}, as well as $$DOC{ref: ".assert"} and its friends $$DOC{ref: ".fail"} and $$DOC{ref: ".ok"}.'
    },
    {
      type: 'StringArray',
      name:  'tags',
      label: 'Tags',
      documentation: 'A list of tags for this test. Gives the environment(s) in which a test can be run. Currently in use: node, web.'
    },
    {
      type: 'Boolean',
      name: 'running',
      defaultValue: false
    }
  ],

  methods:{
    atest: function(model) {
      return function(ret) {
        var exception = false;
        try {
          var obj = model.create(undefined, this.Y);
          var self = this;
          this.modelId = model.id;
          var finished = function() {
            obj.testTearDown && obj.testTearDown();
            ret(!self.hasFailed());
          };

          obj.testSetUp && obj.testSetUp();
          if ( this.async )
            this.code.call(obj, finished);
          else {
            this.code.call(obj);
            obj.testTearDown && obj.testTearDown();
          }
        } catch(e) {
          this.fail("Exception thrown: " + e.stack);
          exception = true;
          ret(false);
        }

        if ( ! this.async && ! exception ) finished();
      }.bind(this);
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
      this.log((condition ? 'PASS' : 'FAIL') + ': ' +
          (comment ? comment : '(no message)'));
    },
    massageComment_: function(opt_comment) {
      return opt_comment ? ': ' + opt_comment : '';
    },
    massageArgument_: function(value) {
      return typeof value === 'string' ? '"' + value + '"' : value;
    },
    assertDefined: function(value, opt_comment) {
      this.assert(typeof value !== 'undefined', 'Expected ' +
          this.massageArgument_(value) + ' to be defined' +
          this.massageComment_(opt_comment));
    },
    assertUndefined: function(value, opt_comment) {
      this.assert(typeof value === 'undefined', 'Expected ' +
          this.massageArgument_(value) + ' to be undefined' +
          this.massageComment_(opt_comment));
    },
    assertEquals: function(v1, v2, opt_comment) {
      this.assert(v1 === v2, 'Expected ' + this.massageArgument_(v1) +
          ' to equal ' + this.massageArgument_(v2) +
          this.massageComment_(opt_comment));
    },
    assertNotEquals: function(v1, v2, opt_comment) {
      this.assert(v1 !== v2, 'Expected ' + this.massageArgument_(v1) +
          ' not to equal ' + this.massageArgument_(v2) +
          this.massageComment_(opt_comment));
    },
    assertTruthy: function(value, opt_comment) {
      this.assert(!!value, 'Expected ' + this.massageArgument_(value) +
          ' to be truthy' + this.massageComment_(opt_comment));
    },
    assertFalsy: function(value, opt_comment) {
      this.assert(!value, 'Expected ' + this.massageArgument_(value) +
          ' to be falsy' + this.massageComment_(opt_comment));
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


CLASS({
  name: 'RegressionTest',
  label: 'Regression Test',
  documentation: 'A $$DOC{ref: "UnitTest"} with a "gold master", which is compared with the output of the live test.',

  extends: 'UnitTest',

  properties: [
    {
      name: 'master',
      documentation: 'The "gold" version of the output. Compared with the $$DOC{ref: ".results"} using <tt>.equals()</tt>, and the test passes if they match.'
    },
    {
      name: 'results',
      view: 'foam.ui.RegressionTestResultView'
    },
    {
      type: 'Boolean',
      name: 'regression',
      hidden: true,
      transient: true,
      defaultValue: false,
      documentation: 'Set after $$DOC{ref: ".atest"}: <tt>true</tt> if $$DOC{ref: ".master"} and $$DOC{ref: ".results"} match, <tt>false</tt> if they don\'t.'
    },
    {
      type: 'Boolean',
      name: 'hasRun',
      defaultValue: false,
      transient: true
    }
  ],

  methods: {
    atest: function(model) {
      // Run SUPER's atest, which returns the unexecuted afunc.
      var sup = this.SUPER(model);
      // Now we append a last piece that updates regression based on the results.
      return aseq(
        sup,
        function(ret) {
          this.regression = ! equals(this.results, this.master);
          this.hasRun = true;
          ret(!this.hasFailed());
        }.bind(this)
      );
    },
    hasFailed: function() {
      return this.regression;
    }
  },

  actions: [
    {
      name: 'approve',
      isEnabled: function() { return this.hasRun },
      code: function() {
        this.regression = this.results;
      }
    }
  ]
});


CLASS({
  name: 'UITest',
  label: 'UI Test',

  extends: 'UnitTest',

  properties: [
    {
      name: 'results',
      view: 'foam.ui.UITestResultView'
    }
  ]
});


CLASS({
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
      type: 'Int',
      name: 'id',
      label: 'Issue ID',
      displayWidth: 12,
      documentation: function() { /* $$DOC{ref:'Issue'} unique sequence number. */ },
      help: 'Issue\'s unique sequence number.'
    },
    {
      name: 'severity',
      view: {
        factory_: 'foam.ui.ChoiceView',
        choices: [
          'Feature',
          'Minor',
          'Major',
          'Question'
        ]
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
        factory_: 'foam.ui.ChoiceView',
        choices: [
          'Open',
          'Accepted',
          'Complete',
          'Closed'
        ]
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
      view: 'foam.ui.TextAreaView',
      documentation: function() { /* Notes describing $$DOC{ref:'Issue'}. */ },
      help: 'Notes describing issue.'
    }
  ]
});
