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
          self.childView.testScope = self.data.__ctx__;
          self.childView.initHTML();
          ret();
        },
        childrenFuture.get
      )(this.__ctx__.asyncCallback);
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
      help: 'I am the context in which the child tests will be run. Defaults to this.__ctx__.',
      defaultValueFn: function() { return this.__ctx__; }
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
            var Y = self.__ctx__.sub({ asyncCallback: ret });
            t.__ctx__ = self.testScope;
            var view = Y.DemoView.create({ data: t });
            self.$.insertAdjacentHTML('beforeend', view.toHTML());
            view.initHTML(); // Actually calls atest().
            // The subviews will eventually call the ret().
          });
        }
      })(function() {
        // When the select is all done, we fire our collection of afuncs, eventually calling
        // back to this.__ctx__.asyncCallback.
        if ( afuncs.length ) {
          aseq.apply(self, afuncs)(self.__ctx__.asyncCallback);
        } else {
          self.__ctx__.asyncCallback();
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
        resp = JSONUtil.parse(__ctx__, resp);
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
  window.__ctx__.UnitTestDAO = baseDAO;
  //baseDAO.where(EQ(UnitTest.PARENT_TEST, '')).select(dao.sink)(function(a) { console.log(a); });

  var __ctx__ = window.__ctx__.sub({ asyncCallback: function() { console.log('done'); } });
  var view = __ctx__.TestsView.create({
    dao: baseDAO.where(EQ(UnitTest.PARENT_TEST, ''))
  });
  document.body.insertAdjacentHTML('beforeend', view.toHTML());
  view.initHTML();
}, 500);

