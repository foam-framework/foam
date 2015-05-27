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
    },
    {
      name: 'disciplineQuery'
    },
    {
      name: 'sportQuery'
    }
  ],

  methods: [
    function init() {
      this.SUPER();

GLOBAL.ctrl = this;
      var self = this;

      axhr('js/foam/demos/olympics/MedalData.json')(function (data) {
        data.limit(2000).select(self.dao);
        self.disciplineQuery.dao = self.sportQuery.dao = self.colorQuery.dao = self.countryQuery.dao = self.cityQuery.dao = self.genderQuery.dao = self.dao;
      });
      
      this.colorQuery = this.GroupBySearchView.create({
        property: this.Medal.COLOR,
        size: 4
      });

      this.countryQuery = this.GroupBySearchView.create({
        property: this.Medal.COUNTRY,
        size: 1
      });

      this.cityQuery = this.GroupBySearchView.create({
        property: this.Medal.CITY,
        size: 1
      });

      this.genderQuery = this.GroupBySearchView.create({
        property: this.Medal.GENDER,
        size: 3
      });

      this.disciplineQuery = this.GroupBySearchView.create({
        property: this.Medal.DISCIPLINE,
        size: 1
      });

      this.sportQuery = this.GroupBySearchView.create({
        property: this.Medal.SPORT,
        size: 1
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
      %%genderQuery
      %%disciplineQuery
      %%sportQuery
      $$query
      $$filteredDAO
    */}
  ]
});
