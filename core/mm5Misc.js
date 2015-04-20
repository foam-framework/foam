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
  name: 'UnitTest',
  plural: 'Unit Tests',

  exports: [
    'log',
    'jlog',
    'assert',
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
      model_: 'StringProperty',
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
      view: 'foam.ui.IntFieldView',
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
      model_: 'StringArrayProperty',
      name:  'tags',
      label: 'Tags',
      documentation: 'A list of tags for this test. Gives the environment(s) in which a test can be run. Currently in use: node, web.'
    },
    {
      model_: 'BooleanProperty',
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
            ret(!self.hasFailed());
          };

          if ( this.async ) 
            this.code.call(obj, finished);
          else
            this.code.call(obj);
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


CLASS({
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
      view: 'foam.ui.RegressionTestResultView'
    },
    {
      model_: 'BooleanProperty',
      name: 'regression',
      hidden: true,
      transient: true,
      defaultValue: false,
      documentation: 'Set after $$DOC{ref: ".atest"}: <tt>true</tt> if $$DOC{ref: ".master"} and $$DOC{ref: ".results"} match, <tt>false</tt> if they don\'t.'
    },
    {
      model_: 'BooleanProperty',
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
      action: function() {
        this.regression = this.results;
      }
    }
  ]
});


CLASS({
  name: 'UITest',
  label: 'UI Test',

  extendsModel: 'UnitTest',

  properties: [
    {
      name: 'results',
      view: 'foam.ui.UITestResultView'
    }
  ]
});


CLASS({
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
      name: 'documentation',
      documentation: function() { /*
          The developer documentation.
      */}
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

(function() {
  for ( var i = 0 ; i < Model.templates.length ; i++ )
    Model.templates[i] = JSONUtil.mapToObj(X, Model.templates[i]);

  Model.properties = Model.properties;
  delete Model.instance_.prototype_;
  Model = Model.create(Model);
})();

// Go back over each model so far, assigning the new Model to remove any reference
// to the bootstrap Model, then FOAMalize any features that were missed due to
// the model for that feature type ("Method", "Documentation", etc.) being
// missing previously. This time the preSet for each should be fully operational.
function recopyModelFeatures(m) {
  m.model_ = Model;

  // the preSet for each of these does the work
  m.methods       = m.methods;
  m.templates     = m.templates;
  m.relationships = m.relationships;
  m.properties    = m.properties;
  m.actions       = m.actions;
  m.listeners     = m.listeners;
  m.models        = m.models;
  m.tests         = m.tests;
  m.issues        = m.issues;

  // check for old bootstrap Property instances
  if ( m.properties && m.properties[0] && ! Property.isInstance(m.properties[0]) ) {
    m.properties.forEach(function(p) {
      if ( p.model_.name === 'Property' ) p.model_ = Property;
    });
  }

  // keep copies of the updated lists
  if ( DEBUG ) BootstrapModel.saveDefinition(m);
}

// Update Model in everything we've created so far
for ( var id in USED_MODELS ) {
  recopyModelFeatures(GLOBAL.lookup(id));
}

if ( DEBUG ) {
  for ( var id in UNUSED_MODELS ) {
    recopyModelFeatures(GLOBAL.lookup(id));
  }
}

USED_MODELS['Model'] = true;
