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
FOAModel({
  name: 'UnitTest',
  plural: 'Unit Tests',
  tableProperties:
  [
    'description', 'passed', 'failed'
  ],
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
      name:  'scope',
      hidden: true,
      factory: function() { return {}; }
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
        var txt = e.innerHTML.trim();

        txt = txt.startsWith('function') ?
          txt :
          'function(ret) { ' + txt + '}' ;

        return eval('(' + txt + ')');
      }
    },
    {
      model_: 'Property',
      name: 'results',
      type: 'String',
      mode: 'read-only',
      required: true,
      displayWidth: 80,
      displayHeight: 20
    },
    {
      model_: StringArrayProperty,
      name:  'tags',
      label: 'Tags'
    },
    {
      name: 'tests',
      label: 'Unit Tests',
      type: 'Array[Unit Test]',
      subType: 'UnitTest',
      view: 'ArrayView',
      fromElement: function(e) { return DOM.initElementChildren(e); },
      preSet: function(_, tests) {
        if ( Array.isArray(tests) ) return tests;

        var a = [];
        for ( key in tests ) {
          a.push(UnitTest.create({name: key, code: tests[key]}));
        }

        return a;
      },
      factory: function() { return []; },
      help: 'Sub-tests of this test.'
    }
  ],

  actions: [
    {
      model_: 'Action',
      name:  'test',
      help:  'Run the unit tests.',

      action: function(obj) { this.atest()(function() {}); }
    }
  ],

  methods:{
    // Run test as asynchronously as an afunc.
    atest: function() {
      var self = this;

      this.scope.log     = this.log.bind(this);
      this.scope.jlog    = this.jlog.bind(this);
      this.scope.assert  = this.assert.bind(this);
      this.scope.fail    = this.fail.bind(this);
      this.scope.ok      = this.ok.bind(this);

      this.results = '';

      this.passed = 0;
      this.failed = 0;

      var code;
      with ( this.scope ) {
        code = eval('(' + this.code.toString() + ')');
      }

      var afuncs = [];
      var oldConsole;

      afuncs.push(function(ret) {
        oldConsole = console;
        window.console = { __proto__: console, log: self.scope.log };
        ret();
      });

      console.log(this.name + '   ' + this.async);
      afuncs.push(this.async ? code.bind(this) : code.abind(this));

      for ( var i = 0 ; i < this.tests.length ; i++ ) {
        var test = this.tests[i];

        (function(test) {
          afuncs.push(function(ret) {
            test.scope.__proto__ = self.scope;
            test.atest()(ret);
          });
          afuncs.push(function(ret) {
            console.log('finished: ', test.name);
            self.passed += test.passed;
            self.failed += test.failed;
            ret();
          });
        })(test);
      }

      afuncs.push(function(ret) {
        window.console = oldConsole;
        ret();
      });

      return aseq.apply(this, afuncs);
    },
    log: function(/*arguments*/) {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.results += arguments[i];
      this.results += '\n';
    },
    jlog: function(/*arguments*/) {
      for ( var i = 0 ; i < arguments.length ; i++ )
        this.results += JSONUtil.stringify(arguments[i]);
      this.results += '\n';
    },
    addHeader: function(name) {
      this.log('<tr><th colspan=2 class="resultHeader">' + name + '</th></tr>');
    },
    assert: function(condition, comment) {
      if ( condition ) this.passed++; else this.failed++;
      this.log(comment + ' ' + (condition ? "<font color=green>OK</font>" : "<font color=red>ERROR</font>"));
    },
    fail: function(comment) {
      this.assert(false, comment);
    },
    ok: function(comment) {
      this.assert(true, comment);
    }
  }
});


FOAModel({
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
      defaultValueFn: function() { return GLOBAL[this.relatedModel].plural; },
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
     var m = GLOBAL[this.relatedModel];
     return GLOBAL[m.name + 'DAO'];
     },
     JOIN: function(sink, opt_where) {
     var m = GLOBAL[this.relatedModel];
     var dao = GLOBAL[m.name + 'DAO'];
     return MAP(JOIN(
     dao.where(opt_where || TRUE),
     m.getProperty(this.relatedProperty),
     []), sink);
     }
     }*/
});


FOAModel({
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
      model_: 'Property',
      name: 'id',
      label: 'Issue ID',
      type: 'String',
      required: true,
      displayWidth: 12,
      displayHeight: 1,
      defaultValue: 0,
      view: 'IntFieldView',
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
}
        );

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
