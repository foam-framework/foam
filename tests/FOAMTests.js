/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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
  name: 'DemoView',
  extends: 'foam.ui.DetailView',
  properties: ['childView', 'resultsCallback', 'childrenCallback', 'initHTMLFuture'],
  templates: [ { name: 'toHTML' } ],
  methods: {
    init: function() {
      this.SUPER();
      var self = this;
      var childrenFuture = afuture();
      this.childrenCallback = function() { childrenFuture.set(); };
      this.initHTMLFuture = afuture();

      aseq(
        function(ret) {
          self.resultsCallback = ret;
        },
        self.initHTMLFuture.get,
        function(ret) {
          self.childView.testScope = self.data.X;
          self.childView.initHTML();
          ret();
        },
        childrenFuture.get
      )(this.X.asyncCallback);
    },
    initHTML: function() {
      this.SUPER();
      this.initHTMLFuture.set();
    }
  },

  templates: [
    function toHTML() {/*
      <%
        var test = this.data;
        this.childView = this.X.sub({ asyncCallback: this.childrenCallback }).TestsView.create({
            dao: test.tests
        });
      %>
      <h3>{{test.name}}</h3>
      <% if ( test.description ) { %>
         <div class="description">
           {{test.description}}
         </div>
         <br>
      <% } %>
      <div>Code:</div>
      <pre><div class="code">{{test.code}}</div></pre>
      $$results{ X: this.X.sub({ asyncCallback: this.resultsCallback }) }
      <blockquote><%= this.childView.toHTML() %></blockquote>
      <br>
    */}
  ]
});

CLASS({
  name: 'TestsView',
  extends: 'foam.ui.AbstractDAOView',

  properties: [
    {
      name: 'testScope',
      help: 'I am the context in which the child tests will be run. Defaults to this.X.',
      defaultValueFn: function() { return this.X; }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id"></div>
    */}
  ],

  methods: {
    initHTML: function() {
      this.SUPER();
      // Steps:
      // - select() all the tests.
      // - Asynchronously and in series:
      //   - Set the test's recursion property to false.
      //   - Put the current ret into a subcontext.
      //   - Render a DemoView in that context for the test (calls atest(), eventually returning to the ret I provided).
      //   - DemoView will render a TestsView for the child tests, which may come up empty. It should continue passing down the right asyncCallback.
      var afuncs = [];
      var self = this;
      this.dao.select({
        put: function(test) {
          // Prevent the test from recursing; we'll take care of that in this view.
          test.runChildTests = false;
          afuncs.push(function(ret) {
            var Y = self.X.sub({ asyncCallback: ret });
            test.X = self.testScope;
            var view = Y.DemoView.create({ data: test });
            self.$.insertAdjacentHTML('beforeend', view.toHTML());
            view.initHTML(); // Actually calls atest().
            // The subviews will eventually call the ret().
          });
        }
      })(function() {
        // When the select is all done, we fire our collection of afuncs, eventually calling
        // back to this.X.asyncCallback.
        if ( afuncs.length ) {
          aseq.apply(self, afuncs)(self.X.asyncCallback);
        } else {
          self.X.asyncCallback();
        }
      });
    }
  }
});

// TODO: Use boxes.
function asendjson(path) {
  return function(ret, msg) {
    var data = JSONUtil.compact.where(NOT_TRANSIENT).stringify(msg);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", path);
    aseq(
      function(ret) {
        xhr.asend(ret, data);
      },
      function(ret, resp) {
        resp = JSONUtil.parse(X, resp);
        ret(resp);
      })(ret);
  };
}

// This fetches all the tests up front.
var clientDAO = X.foam.core.dao.ClientDAO.create({
  asend: asendjson(window.location.origin + '/api'),
  model: Model
});

// If the query string contains ?ui=1, filter to only UI tests.
var TEST_FILTER = AND(CONTAINS(UnitTest.TAGS, 'web'), EQ(UnitTest.DISABLED, false));
if ( window.location.search.indexOf('ui=1') >= 0 ) {
  console.warn('ui found');
  TEST_FILTER = AND(TEST_FILTER, CONTAINS(UnitTest.TAGS, 'ui'));
}

var baseDAO = CachingDAO.create({
  cache: MDAO.create({ model: Model }),
  src: clientDAO
});

setTimeout(function() {
  // Select all the models from the model DAO.
  // TODO: This is fine while there's only one, but this should be sure
  // to wait for each model's tests to complete before moving on to the next.
  baseDAO.select({
    put: function(model) {
      _ROOT_X.registerModel(model);
      arequire(model.id)(function() {
        if ( model.tests && model.tests.length ) {
          var X = window.X.sub({
            asyncCallback: function() {
              console.log('done tests for ' + model.name);
            },
            childTestsFilter: TEST_FILTER,
            testUpdateListener: function(){ debugger; baseDAO.put(model); }
          });
          var view = X.TestsView.create({
            dao: model.tests.dao.where(TEST_FILTER)
          });
          document.body.insertAdjacentHTML('beforeend', view.toHTML());
          view.initHTML();
        }
      });
    }
  });
}, 500);

