CLASS({
  package: 'foam.demos.olympics',
  name: 'Controller',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.ui.TextFieldView',
    'foam.dao.EasyDAO',
    'foam.demos.olympics.Medal',
    'foam.ui.search.GroupBySearchView'
  ],

  properties: [
    {
      name: 'query',
      defaultValue: TRUE
    },
    {
      model_: 'foam.core.types.DAOProperty',
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
      model_: 'foam.core.types.DAOProperty',
      name: 'filteredDAO',
      view: { factory_: 'foam.ui.TableView', xxxscrollEnabled: true, rows: 30}
    },
    {
      name: 'colorQuery'
    },
    {
      name: 'countryQuery'
    },
    {
      name: 'cityQuery'
    },
    {
      name: 'genderQuery'
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
      
      this.colorQuery = this.GroupBySearchView.create({
        dao: this.dao,
        property: this.Medal.COLOR,
        size: 4
      });

      this.countryQuery = this.GroupBySearchView.create({
        dao: this.dao,
        property: this.Medal.COUNTRY
      });

      this.cityQuery = this.GroupBySearchView.create({
        dao: this.dao,
        property: this.Medal.CITY,
        size: 6
      });

      Events.dynamic(
        function() { self.query; },
        function() { self.filteredDAO = self.dao; /*self.dao.where(self.query);*/ });
    }
  ],

  templates: [
    function toHTML() {/*
      %%colorQuery
      %%countryQuery
      %%cityQuery
      $$query
      $$filteredDAO
    */}
  ]
});
