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
    var data = JSONUtil.compact.stringify(msg);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", path);
    aseq(
      function(ret) {
        xhr.asend(ret, data);
      },
      function(ret, resp) {
        debugger;
        resp = JSONUtil.parse(resp);
        ret(resp);
      })(ret);
  };
}

// This fetches all the tests up front.
var baseDAO = CachingDAO.create({
  cache: MDAO.create({ model: UnitTest }),
  src: ClientDAO.create({
    asend: asendjson(window.location.origin + '/api'),
    model: UnitTest
  }).where(EQ(UnitTest.DISABLED, false))
});

setTimeout(function() {
  var dao = [];
  window.X.UnitTestDAO = baseDAO;
  baseDAO.where(EQ(UnitTest.PARENT_TEST, '')).select(dao.sink)(function(a) { console.log(a); });
  dao.dao.listen({
    put: function(x) {
      console.warn('master update', x);
    }
  });

  var X = window.X.sub({ asyncCallback: function() { console.log('done'); } });
  var view = X.TestsView.create({
    dao: dao.dao
  });
  document.body.insertAdjacentHTML('beforeend', view.toHTML());
  view.initHTML();
}, 500);

