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
  tableProperties: [ 'description', 'passed', 'failed' ],
  properties:
  [
    {
      model_: 'Property',
      name: 'name',
      type: 'String',
      required: true,
      displayWidth: 50,
      help: "The unit test's name."
    },
    {
      model_: 'Property',
      name: 'description',
      type: 'String',
      displayWidth: 70,
      displayHeight: 5,
      defaultValue: '',
      // defaultValueFn: function() { return "Test " + this.name; },
      help: 'A multi-line description of the unit test.'
    },
    {
      model_: 'IntProperty',
      name: 'passed',
      required: true,
      displayWidth: 8,
      displayHeight: 1,
      view: 'IntFieldView',
      help: 'Number of sub-tests to pass.'
    },
    {
      model_: 'IntProperty',
      name: 'failed',
      required: true,
      displayWidth: 8,
      displayHeight: 1,
      help: 'Number of sub-tests to fail.'
    },
    {
      model_: 'BooleanProperty',
      name: 'async',
      defaultValue: false
    },
    {
      model_: 'FunctionProperty',
      name: 'code',
      label: 'Test Code',
      displayWidth: 80,
      displayHeight: 30,
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
      defaultValue: false
    },
    {
      model_: 'Property',
      name: 'results',
      type: 'String',
      mode: 'read-only',
      view: 'UnitTestResultView',
      required: true,
      displayWidth: 80,
      displayHeight: 20
    },
    {
      model_: 'StringArrayProperty',
      name:  'tags',
      label: 'Tags'
    },
    {
      name: 'parent'
    },
    {
      name: 'runChildTests',
      help: 'Whether the nested child tests should be run when this test is. Defaults to true; set to false for UITests.',
      defaultValue: true
    }
  ],

  relationships: [
    {
      name: 'tests',
      label: 'Sub-tests of this test.',
      relatedModel: 'UnitTest',
      relatedProperty: 'parent'
    }
  ],

  actions: [
    {
      name:  'test',
      help:  'Run the unit tests.',

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
      this.X.log    = this.log;
      this.X.jlog   = this.jlog;
      this.X.assert = this.assert;
      this.X.fail   = this.fail;
      this.X.ok     = this.ok;
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
              afuncsInner.push(function(ret) {
                self.passed += test.passed;
                self.failed += test.failed;
                ret();
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
    }
  }
});

MODEL({
  name: 'RegressionTest',
  label: 'Regression Test',
  help: 'A UnitTest with a gold output, which is compared with the output of the live test.',

  extendsModel: 'UnitTest',

  properties: [
    {
      name: 'master'
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
      defaultValue: false
    }
  ],

  actions: [
    {
      name: 'update',
      isEnabled: function() { return ! this.results.equals(this.master); },
      action: function() {
        console.warn('updating test', this.$UID, this.name, this.master, this.results);
        this.master = this.results;
      }
    }
  ]
});


MODEL({
  name: 'Relationship',
  tableProperties: [
    'name', 'label', 'relatedModel', 'relatedProperty'
  ],
  properties: [
    {
      name:  'name',
      type:  'String',
      displayWidth: 30,
      displayHeight: 1,
      defaultValueFn: function() { return GLOBAL[this.relatedModel] ? GLOBAL[this.relatedModel].plural : ''; },
      help: 'The coding identifier for the action.'
    },
    {
      name: 'label',
      type: 'String',
      displayWidth: 70,
      displayHeight: 1,
      defaultValueFn: function() { return this.name.labelize(); },
      help: 'The display label for the action.'
    },
    {
      name: 'help',
      label: 'Help Text',
      type: 'String',
      displayWidth: 70,
      displayHeight: 6,
      defaultValue: '',
      help: 'Help text associated with the relationship.'
    },
    {
      name:  'relatedModel',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
      help: 'The name of the related Model.'
    },
    {
      name:  'relatedProperty',
      type:  'String',
      required: true,
      displayWidth: 30,
      displayHeight: 1,
      defaultValue: '',
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
  properties:
  [
    {
      model_: 'IntProperty',
      name: 'id',
      label: 'Issue ID',
      displayWidth: 12,
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
      help: 'The status of the issue.'
    },
    {
      model_: 'Property',
      name: 'summary',
      type: 'String',
      required: true,
      displayWidth: 70,
      displayHeight: 1,
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
      help: 'Who created the issue.'
    },
    {
      model_: 'Property',
      name: 'assignedTo',
      type: 'String',
      defaultValue: 'kgr',
      displayWidth: 30,
      displayHeight: 1,
      help: 'Who the issue is currently assigned to.'
    },
    {
      model_: 'Property',
      name: 'notes',
      displayWidth: 75,
      displayHeight: 20,
      view: 'TextAreaView',
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
