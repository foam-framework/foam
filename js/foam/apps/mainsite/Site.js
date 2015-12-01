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
      name: '$output1',
      getter: function() {
        return this.X.$(this.id + '-output-1');
      }
    },
    {
      name: 'commentary1',
      documentation: 'Filled in when features1 is set.',
      mode: 'read-only',
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
          Storage: function(model) {
            onCall(model);
            return this.HTMLView.create({ data: this.storageHTML() });
          },
          Decoration: function(model) {
            return this.HTMLView.create({ data: this.decorationHTML() });
          },
          More: function(model) {
            return this.HTMLView.create({ data: this.andMoreHTML() });
          },
        };
      }
    },
    {
      name: 'commentary',
      factory: function() {
        return {
          DetailView: 'FOAM can generate default views from a model. They can easily be customized, or replaced altogether.',
          CitationView: 'FOAM can make a reasonable guess at a summary for a model - in this case the "name" property is chosen.',
          Table: 'Tables in a variety of styles. This one is Material Design and supports column resizing and infinite scrolling.',
          Diff: 'diff() shows all the different properties between two objects of the same model. Try changing the Person\'s gender or age!',
          JSON: 'Any FOAM object can be serialized to JSON. Note that default values (eg. "gender" = "M") are omitted, saving space.',
          XML: 'Any FOAM object can be serialized to XML. Note that default values (eg. "gender" = "M") are omitted, saving space.',
          Java: 'FOAM can generate Java source code from a model, and includes a Java library for servers and Android.',
          Swift: 'FOAM can generate Swift source code from a model, and inludes a library for iOS development.',
          Storage: 'FOAM models data storage with the DAO, or Data Access Object. This single, high-level API works with many different storage backends.',
          Decoration: 'Since the DAO API is small and high-level, it is easy to decorate a basic DAO with extra features.',
          More: 'Here\'s a list of some of the other features FOAM supports for every model.',
        };
      }
    },
  ],

  methods: [
    function init() {
      this.SharedStyles.create();
      this.SUPER();
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
          this.$output1.innerHTML = 'Select a feature';
          this.commentary1 = '';
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
            var v = target.call(this, model);
            if (!Array.isArray(v)) v = [v];

            var output = '';
            for (var i = 0; i < v.length; i++) output += v[i].toHTML();
            this.$output1.innerHTML = output;
            for (var i = 0; i < v.length; i++) v[i].initHTML();

            this.commentary1 = this.commentary[feature];
          } catch (e) {
            this.$output1.innerHTML = 'Error rendering view: ' + e;
            return;
          }
        }
      }
    },
  ],

  templates: [
    function CSS() {/*
      .site-container {
        display: flex;
        flex-direction: column;
        font-size: 16px;
        height: 100%;
        margin: 0;
        padding: 0;
        width: 100%;
      }

      .site-header {
        align-items: center;
        background-color: #c53929;
        display: flex;
        flex-shrink: 0;
        height: 48px;
      }
      .site-header a {
        color: #fff;
        margin: 0 16px;
      }
      .site-header a.selected {
        font-weight: bold;
      }

      .site-body {
        overflow-x: hidden;
        overflow-y: auto;
      }
      .site-hero {
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 100px 0;
      }
      .site-hero h1 {
        font-size: 112px;
        font-weight: 300;
      }
      .site-hero h3 {
        font-size: 45px;
        font-weight: normal;
        margin: 1em 0 0;
      }

      .site-punch {
        background-color: #db4437;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
      .site-punch-item {
        color: #fff;
        font-size: 16px;
        margin: 32px 16px;
        width: 300px;
      }

      h3 {
        color: #db4437;
        font-weight: normal;
        font-size: 24px;
        margin-top: 2em;
      }
      .site-punch-item h3 {
        color: #fff;
        margin-top: 0;
      }

      .site-punch-item a {
        color: #1de9b6;
      }

      .site-prose {
        margin: 16px;
      }

      .site-prose ul {
        margin: 8px 0;
      }

      .site-background {
        padding: 8px;
      }

      .site-sample-bottom {
        display: flex;
        margin: 16px;
      }
      .site-sample-features {
        background-color: #db4437;
        color: #fff;
        flex: 3;
      }
      .site-sample-features .dao-selected {
        background-color: #c53929;
      }

      .site-sample-right {
        flex: 7;
      }

      .site-sample-code {
        border: 1px solid #e0e0e0;
        margin: 16px;
      }

      .site-sample-commentary {
        align-items: center;
        background-color: #db4437;
        color: #fff;
        display: flex;
        height: 70px;
        padding: 16px;
        width: 100%;
      }

      .site-sample-output p {
        margin: 16px;
      }
      .site-sample-output pre {
        margin: 1em;
      }
    */},
    function toHTML() {/*
      <div id="%%id" class="site-container">
      <div class="site-header">
        <a class="selected" href="http://foamdev.com/">Home</a>
        <a href="http://foamdev.com/tutorial/0-intro">Tutorials</a>
        <a href="https://github.com/foam-framework/foam">Github</a>
      </div>
      <div class="site-body">
        <div class="site-hero">
          <img src="js/com/google/watlobby/img/foam_red.png" style="opacity: 0.76" />
          <h3>Fast apps fast</h3>
        </div>
        <div class="site-punch">
          <div class="site-punch-item">
            <h3>High-level</h3>
            <p>You write very high-level, declarative <em>models</em>, and FOAM
            builds many features from them: default views, storage,
            serialization, Java and Swift classes, and much more.</p>
          </div>
          <div class="site-punch-item">
            <h3>Compact</h3>
            <p>Your app and FOAM itself are both modeled, keeping your payload small.</p>
            <p>Our <a href="https://foam-framework.github.io/foam/apps/gmail/main.html">Gmail</a> app is 150KB unzipped.</p>
            <p>With so little code to write, FOAM is perfect for rapid app development.</p>
          </div>
          <div class="site-punch-item">
            <h3>Fast</h3>
            <p>FOAM apps are small and load fast &mdash;<br/>even on mobile.</p>
            <p>FOAM's reactive programming is efficient, and fast enough for
            animation &mdash;<br/>even on mobile.</p>
          </div>
        </div>
        <div class="site-background">
          <div class="site-prose">
            <p>FOAM is an open-source modeling framework developed at Google.</p>
            <p>With FOAM, you create a <em>model</em>, and FOAM can support many
            features based on it:</p>
            <ul>
              <li>A (Javascript, Java or Swift) class, with <tt>diff()</tt>, <tt>clone()</tt>, etc.</li>
              <li>Serialization to and from JSON, XML and <a href="https://developers.google.com/protocol-buffers/?hl=en">protocol buffers</a>.</li>
              <li>Storage in many places, from IndexedDB to MongoDB.</li>
              <li>Query parsers and a query optimizer.</li>
              <li>Offline syncing, and many flavours of caching.</li>
              <li>Customizable detail and summary views for HTML, Android and iOS.</li>
            </ul>
            <p>FOAM combines these features with reactive programming and MVC,
            forming a full-stack framework for building modern, cross-platform apps.</p>
            <p>FOAM is in beta. It's production-ready but still under
            heavy development. Expect many new features &mdash; and bugs
            &mdash; as FOAM continues to evolve.</p>
          </div>
          <div class="site-sample">
            <h3>Try FOAM Live</h3>
            <p class="site-prose">Below is a FOAM model you can edit, and a list of FOAM features you can see live in your browser.</p>
            <p class="site-prose">Try uncommenting the <tt>'hometown'</tt> property. Or try changing the <tt>defaultValue</tt> for the <tt>gender</tt> property to <tt>'F'</tt>.</p>
            <div class="site-sample-code">%%editor1</div>
            <div class="site-sample-bottom">
              <div class="site-sample-features">$$features1</div>
              <div class="site-sample-right">
                <div class="site-sample-commentary">$$commentary1</div>
                <div id="<%= this.id %>-output-1" class="site-sample-output"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    */},
    function storageHTML() {/*
      <pre>
dao.where(AND(
    GT(Person.AGE, 30),
    CONTAINS(Person.NAME, 'John')))
  .limit(10)
  .orderBy(Person.NAME)
  .select();
dao.put(myPerson);
dao.find(someID);</pre>
      <p>See the <a href="http://foamdev.com/guides/dao">DAO Guide</a> for more on the API.</p>

      <p>Here are a few of the supported backends:
      <ul>
        <li>Lightning fast in-memory cache</li>
        <li>LocalStorage and IndexedDB in the browser</li>
        <li>MongoDB</li>
        <li>Firebase</li>
        <li>Postgres, SQLite and other SQL databases</li>
        <li>JSON and XML files</li>
      </ul>
    */},
    function andMoreHTML() {/*
      <ul>
        <li><tt>clone()</tt></li>
        <li><tt>copyFrom()</tt></li>
        <li><tt>hashCode()</tt></li>
        <li><tt>compareTo()</tt> and <tt>equals()</tt></li>
        <li>Observer support: Events for changes to a property, or any property</li>
        <li>Query parsers (eg. <tt>age>=30</tt>, <tt>name:John</tt>)</li>
      </ul>
    */},
    function decorationHTML() {/*
      <p>FOAM includes DAO decorators that add these features to any DAO:
        <ul style="margin-top: 0">
          <li>Caching (eager or lazy)</li>
          <li>Offline sync</li>
          <li>Client-server bridge</li>
          <li>Journaling</li>
          <li>Logging</li>
          <li>Performance measurement</li>
        </ul>
      </p>
      <p>It's all the same API, so it's a one-line change to switch from fake
      data in memory to offline-ready syncing from a server into IndexedDB.</p>
    */},
  ]
});
