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
           name: 'description',
           type: 'String',
           required: true,
           displayWidth: 70,
           displayHeight: 1,
           help: 'A one line description of the unit test.'
        },
        {
           model_: 'Property',
           name: 'passed',
           type: 'Integer',
           required: true,
           displayWidth: 8,
           displayHeight: 1,
           view: 'IntFieldView',
           help: 'Number of sub-tests to pass.'
        },
        {
           model_: 'Property',
           name: 'failed',
           type: 'Integer',
           required: true,
           displayWidth: 8,
           displayHeight: 1,
           help: 'Number of sub-tests to fail.'
        },
        {
           model_: 'Property',
           name: 'results',
           type: 'String',
           mode: 'read-only',
           required: true,
           view: {
              create: function() { return TextFieldView.create({mode:'read-only', escapeHTML: false}); } },
           displayWidth: 80,
           displayHeight: 20
        },
        {
           model_: 'FunctionProperty',
           name: 'code',
           label: 'Test Code',
           required: true,
           displayWidth: 80,
           displayHeight: 30
        }
     ],

     actions: [
      {
         model_: 'Action',
         name:  'test',
         help:  'Run the unit tests.',

         isAvailable: function() { return true; },
         isEnabled:   function() { return true; },
         action:      function(obj) {
            console.log("testing", this);
            this.results = "<table border=1>";

            this.passed = 0;
            this.failed = 0;
            this.code();

            this.append("</table>");
         }
      }
     ],

    methods:{

       append: function(str) {
          this.results = this.results + str;
       },
       addHeader: function(name) {
          this.append('<tr><th colspan=2 class="resultHeader">' + name + '</th></tr>');
       },
       addRow: function(comment, condition) {
           this.append('<tr>' +
             '<td>' + comment + '</td>' +
             '<td>' + (condition ? "<font color=green>OK</font>" : "<font color=red>ERROR</font>") + '</td>' +
             '</tr>');
       },
       assert: function(condition, comment) {
          if ( condition ) this.passed++; else this.failed++;
          this.addRow(comment, condition);
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
           valueFactory: function() { return new Date(); },
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
