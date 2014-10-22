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
MODEL({
  name: 'DemoView',
  extendsModel: 'DetailView',
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
  }
});

MODEL({
  name: 'TestsView',
  extendsModel: 'AbstractDAOView',

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
          // Clone the test, so that passes, fails and regression updates don't write into the MDAO.
          var t = test.clone();
          // Prevent the test from recursing; we'll take care of that in this view.
          t.runChildTests = false;
          afuncs.push(function(ret) {
            var Y = self.X.sub({ asyncCallback: ret });
            t.X = self.testScope;
            var view = Y.DemoView.create({ data: t });
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
var clientDAO = ClientDAO.create({
  asend: asendjson(window.location.origin + '/api'),
  model: UnitTest
}).where(AND(EQ(UnitTest.DISABLED, false), CONTAINS(UnitTest.TAGS, 'web')));

// If the query string contains ?ui=1, filter to only UI tests.
if ( window.location.search.indexOf('ui=1') >= 0 ) {
  console.warn('ui found');
  clientDAO = clientDAO.where(CONTAINS(UnitTest.TAGS, 'ui'));
}

var baseDAO = CachingDAO.create({
  cache: MDAO.create({ model: UnitTest }),
  src: clientDAO
});

setTimeout(function() {
  window.X.UnitTestDAO = baseDAO;
  //baseDAO.where(EQ(UnitTest.PARENT_TEST, '')).select(dao.sink)(function(a) { console.log(a); });

  var X = window.X.sub({ asyncCallback: function() { console.log('done'); } });
  var view = X.TestsView.create({
    dao: baseDAO.where(EQ(UnitTest.PARENT_TEST, ''))
  });
  document.body.insertAdjacentHTML('beforeend', view.toHTML());
  view.initHTML();
}, 500);

