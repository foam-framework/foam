CLASS({
  package: 'foam.demos.olympics',
  name: 'Controller',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.ui.TextFieldView',
    'foam.dao.EasyDAO',
    'foam.demos.olympics.Medal',
    'GropuBySearchView'
  ],

  properties: [
    {
      name: 'query',
      defaultValue: TRUE
    },
    {
      name: 'dao',
      factory: function() {
        var Medal = foam.demos.olympics.Medal;
        return foam.dao.EasyDAO.create({
          model: Medal,
          daoType: 'MDAO',
          seqNo: true
        })/*.addIndex(Medal.CITY).addIndex(Medal.COLOR).addIndex(Medal.SPORT)*/;
      }
    },
    {
      name: 'filteredDAO',
      view: { factory_: 'foam.ui.TableView', xxxscrollEnabled: true, rows: 30}
    },
    {
      name: 'colorQuery'
    }
  ],

  methods: [
    function init() {
      this.SUPER();

GLOBAL.ctrl = this;
      var self = this;

      axhr('js/foam/demos/olympics/MedalData.json')(function (data) {
        data.select(self.dao);
      });

      this.colorQuery = GroupBySearchView.create({
        dao: this.dao
      });

      Events.dynamic(
        function() { self.query; },
        function() { self.filteredDAO = self.dao; /*self.dao.where(self.query);*/ });
    }
  ],

  templates: [
    function toHTML() {/*
      %%colorQuery
      $$query
      $$filteredDAO
    */}
  ]
});
