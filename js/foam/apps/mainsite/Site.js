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
  package: 'foam.apps.mainsite',
  name: 'Site',
  extends: 'foam.ui.View',
  requires: [
    'SimpleValue',
    'foam.dao.EasyDAO',
    'foam.flow.AceCodeView',
    'foam.flow.SourceCode',
    'foam.input.touch.GestureManager',
    'foam.input.touch.TouchManager',
    'foam.mlang.CannedQuery',
    'foam.sandbox.IsolatedContext',
    'foam.ui.DAOListView',
    'foam.ui.HTMLView',
    'foam.ui.md.CannedQueryCitationView',
    'foam.ui.md.CitationView',
    'foam.ui.md.DetailView',
    'foam.ui.md.FlexTableView',
    'foam.ui.md.SharedStyles',
    'foam.ui.md.TextFieldView',
    'foam.util.JavaSource',
    'foam.util.swift.SwiftSource',
  ],

  exports: [
    'gestureManager',
    'selectedFeature1 as selection',
    'touchManager',
  ],

  constants: {
    STATIC_OUTPUT: {
      'Storage': true,
      'Decoration': true,
      'More': true
    }
  },

  properties: [
    {
      name: 'touchManager',
      factory: function() {
        return this.TouchManager.create();
      }
    },
    {
      name: 'gestureManager',
      factory: function() {
        return this.GestureManager.create();
      }
    },
    {
      name: 'isolatedContext_',
      hidden: true,
      factory: function() {
        // IsolatedContext is a wrapper, we really want its Y.
        return this.IsolatedContext.create(null, GLOBAL.X).Y;
      }
    },
    {
      name: 'code1',
      factory: function() {
        return this.SourceCode.create({
          code: "CLASS({\n" +
              "  package: 'foam.sandbox',\n" +
              "  name: 'Person',\n" +
              "  properties: [\n" +
              "    {\n" +
              "      name: 'id',\n" +
              "      hidden: true,\n" +
              "    },\n" +
              "    'name',\n" +
              "    //'hometown',\n" +
              "    {\n" +
              "      type: 'Date',\n" +
              "      name: 'birthday'\n" +
              "    },\n" +
              "    {\n" +
              "      type: 'foam.core.types.StringEnum',\n" +
              "      name: 'gender',\n" +
              "      defaultValue: 'M',\n" +
              "      choices: [['M', 'Male'], ['F', 'Female']]\n" +
              "    }\n" +
              "  ]\n" +
              "});\n"
        });
      },
      postSet: function(old, nu) {
        if (old) old.code$.removeListener(this.runSample1);
        if (nu) nu.code$.addListener(this.runSample1);
      },
    },
    {
      name: 'editor1',
      factory: function() {
        return this.AceCodeView.create({
          data$: this.code1$,
          pathToAce: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/ace.js',
          //aceMode: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/mode-javascript.js',
          //aceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/theme-textmate.js',
          aceMinLines: 25,
        });
      }
    },
    {
      type: 'foam.core.types.DAO',
      name: 'features1',
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'foam.ui.md.CannedQueryCitationView'
      },
      factory: function() {
        return [
          this.CannedQuery.create({ expression: 'DetailView', label: 'Detail view' }),
          this.CannedQuery.create({ expression: 'CitationView', label: 'Summary view' }),
          this.CannedQuery.create({ expression: 'Table', label: 'Table view' }),
          this.CannedQuery.create({ expression: 'Diff', label: 'diff() for objects' }),
          this.CannedQuery.create({ expression: 'JSON', label: 'JSON' }),
          this.CannedQuery.create({ expression: 'XML', label: 'XML' }),
          this.CannedQuery.create({ expression: 'Java', label: 'Java' }),
          this.CannedQuery.create({ expression: 'Swift', label: 'Swift' }),
          this.CannedQuery.create({ expression: 'Storage', label: 'Data storage' }),
          this.CannedQuery.create({ expression: 'Decoration', label: 'Storage decoration' }),
          this.CannedQuery.create({ expression: 'More', label: 'and more' }),
        ];
      },
    },
    {
      name: 'selectedFeature1',
      factory: function() { return this.features1[0]; },
      postSet: function(old, nu) {
        this.runSample1();
      },
    },
    {
      name: 'outputFeature_',
      postSet: function(old, nu) {
        // Hides and shows output divs based on the current feature.
        if (old === nu) return;
        // Nothing to do if they're both targeting the live output.
        if (!this.STATIC_OUTPUT[old] && !this.STATIC_OUTPUT[nu]) return;

        this.X.$('site-output-1' + (this.STATIC_OUTPUT[old] ? '-' + old : '')).style.display = 'none';
        this.X.$('site-output-1' + (this.STATIC_OUTPUT[nu] ? '-' + nu : '')).style.display = 'block';
      },
    },
    {
      name: '$output1',
      getter: function() {
        return this.X.$('site-output-1');
      }
    },
    {
      name: 'commentary1',
      documentation: 'Filled in when features1 is set. The ID of the currently-visible commentary div.',
      postSet: function(old, nu) {
        if (old) this.X.$(old).style.display = 'none';
        if (nu) this.X.$(nu).style.display = 'flex';
      },
    },
    {
      name: 'featureImplementations',
      documentation: 'A map for functions that return views as output.',
      factory: function() {
        var args = {
          name: 'John Smith',
          age: 30
        };
        var oldModel, person;
        function onCall(newModel) {
          if (newModel !== oldModel) {
            oldModel = newModel;
            person = newModel.create(person || args);
          }
          return person;
        }
        return {
          DetailView: function(model) {
            onCall(model);
            return this.DetailView.create({ data: person });
          },
          CitationView: function(model) {
            onCall(model);
            return this.CitationView.create({ data: person });
          },
          Table: function(model) {
            onCall(model);
            return this.FlexTableView.create({
              model: model,
              data: [person],
            });
          },
          Diff: function(model) {
            onCall(model);
            var original = person.clone();
            var value = this.SimpleValue.create();
            value.set('<p>Diff: {}</p>');
            person.addListener(function() {
              value.set('<p>Diff: ' + JSON.stringify(original.diff(person)) + '</p>');
            });

            var Y = this.Y.sub();
            Y.registerModel(this.TextFieldView.xbind({ onKeyMode: true }), 'foam.ui.md.TextFieldView');
            Y.registerModel(this.TextFieldView.xbind({ onKeyMode: true }), 'foam.ui.md.IntFieldView');
            return [
              this.DetailView.create({ data: person }, Y),
              this.HTMLView.create({ data$: value })
            ];
          },
          JSON: function(model) {
            onCall(model);
            return this.HTMLView.create({
                data: '<pre>' + JSONUtil.stringify(person) + '</pre>'
            });
          },
          XML: function(model) {
            onCall(model);
            var xml = XMLUtil.stringify(person);
            xml = XMLUtil.escape(xml);
            return this.HTMLView.create({ data: '<pre>' + xml + '</pre>' });
          },
          Java: function(model) {
            var code = this.SourceCode.create({
              language: 'java',
              code: this.JavaSource.create().generate(model)
            });
            return this.AceCodeView.create({
              data: code,
              pathToAce: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/ace.js',
              maxLines: 20
            });
          },
          Swift: function(model) {
            var code = this.SourceCode.create({
              language: 'swift',
              code: this.SwiftSource.create().generate(model)
            });
            return this.AceCodeView.create({
              data: code,
              pathToAce: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.2/ace.js',
              maxLines: 20
            });
          },
        };
      }
    },
  ],

  methods: [
    function init() {
      this.SharedStyles.create();
      this.SUPER();
    },
    // Call this to insert the editor and other live pieces into the existing
    // DOM. This model is only intended to be loaded from the main Github site.
    function injectHTML() {
      this.X.$('site-editor1').innerHTML = this.editor1.toHTML();
      this.addChild(this.editor1);

      var v = this.createTemplateView('features1');
      this.X.$('site-features1').innerHTML = v.toHTML();
      this.addChild(v);
    },
    function initHTML() {
      this.SUPER();
      this.runSample1();
    },
  ],

  listeners: [
    {
      name: 'runSample1',
      isMerged: 250,
      code: function() {
        if (!this.$output1) return;
        var feature = this.selectedFeature1.expression;
        var target = this.featureImplementations[feature];
        if (!target) {
          if (this.STATIC_OUTPUT[feature]) {
            this.outputFeature_ = feature;
            this.commentary1 = 'site-sample-commentary-' + feature;
          } else {
            this.outputFeature_ = '';
            this.$output1.innerHTML = 'Select a feature';
            this.commentary1 = '';
          }
        } else {
          var str = this.code1.code;
          var model;
          var X = this.isolatedContext_;
          try {
            model = eval('(function(X, CLASS){' + str + '; return X.__model;}).call(null, X, function(h, x) { X.__model = X.CLASS(h, x); })');
          } catch (e) {
            this.$output1.innerHTML = 'Error loading model: ' + e;
            return;
          }

          try {
            this.outputFeature_ = feature;
            var v = target.call(this, model);
            if (!Array.isArray(v)) v = [v];

            var output = '';
            for (var i = 0; i < v.length; i++) output += v[i].toHTML();
            this.$output1.innerHTML = output;
            for (var i = 0; i < v.length; i++) v[i].initHTML();

            this.commentary1 = 'site-sample-commentary-' + feature;
          } catch (e) {
            this.outputFeature_ = '';
            this.$output1.innerHTML = 'Error rendering view: ' + e;
            return;
          }
        }
      }
    },
  ],
});
