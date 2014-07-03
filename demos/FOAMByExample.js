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

      console.log('loading');
      if ( this.name ) {
        var self = this;
        console.log('looking');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.name);

        aseq(
          function(ret) {
            console.log('pre-send');
            xhr.asend(function(xml) { console.log('get'); ret(XMLUtil.parse(xml)); });
          },
          function(ret, xml) {
            console.log(xml);
            xml.select(self);
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

var dao = XHRXMLDAO.create({
  model: UnitTest,
  name: 'FUNTests.xml'
});

setTimeout(function() {
  var tests = [];
  dao.select({ put: function(x) {
    tests.push(x);
    if ( x.model_.name != 'UITest' ) x.test();
    var v = DemoView.create({ data: x });
    document.body.insertAdjacentHTML('beforeend', v.toHTML());
    v.initHTML();
  } });
}, 500);

