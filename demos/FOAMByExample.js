MODEL({
  name: 'DemoView',
  extendsModel: 'DetailView',
  templates: [ { name: 'toHTML' } ]
});

MODEL({
  name: 'XHRXMLDAO',
  label: 'A read-only DAO that fetches an XML file via XHR and reads its contents',
  extendsModel: 'MDAO',

  properties: ['name'],

  methods: {
    init: function() {
      this.SUPER();

      if ( this.name ) {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.name);

        aseq(
          function(ret) {
            xhr.asend(function(xml) { ret(XMLUtil.parse(xml)); });
          },
          function(ret, xml) {
            xml.dao.select(self);
            ret();
          }
        )(function() { });
      }

      this.addRawIndex({
        execute: function() {},
        bulkLoad: function() {},
        toString: function() { return 'XHRXMLDAO'; },
        plan: function() {
          return { cost: Number.MAX_VALUE };
        },
        put: function() { },
        remove: function() { }
      });
    }
  }
});

var xhrDAO = XHRXMLDAO.create({
  model: UnitTest,
  name: 'FUNTests.xml'
});

setTimeout(function() {
  var dao = [];
  window.X.UnitTestDAO = xhrDAO;
  xhrDAO.where(EQ(UnitTest.PARENT, '')).select(dao.sink)(function(a) { console.log(a); });
  dao.dao.listen({
    put: function(x) {
      console.warn('master update', x);
    }
  });

  var view = DAOListView.create({
    dao: dao.dao,
    rowView: DemoView.xbind({ mode: 'read-only' }),
    mode: 'read-only'
  });
  document.body.insertAdjacentHTML('beforeend', view.toHTML());
  view.initHTML();
}, 500);

