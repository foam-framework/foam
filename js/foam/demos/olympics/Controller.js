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
      name: 'query'
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
      name: 'fromYear'
    },
    {
      name: 'toYear'
    },
    {
      name: 'color'
    },
    {
      name: 'country'
    },
    {
      name: 'city'
    },
    {
      name: 'gender'
    },
    {
      name: 'discipline'
    },
    {
      name: 'sport'
    },
    {
      name: 'predicate'
    },
    {
      model_: 'StringProperty',
      name: 'sql',
      displayWidth: 30,
      displayHeight: 10
    }
  ],

  methods: [
    function init() {
      this.SUPER();

GLOBAL.ctrl = this;
      var self = this;
      var Medal = this.Medal;

      axhr('js/foam/demos/olympics/MedalData.json')(function (data) {
        data.limit(5000).select(self.dao);
        self.fromYear.dao = self.toYear.dao = self.discipline.dao = self.sport.dao = self.color.dao = self.country.dao = self.city.dao = self.gender.dao = self.dao;
      });
      
      this.fromYear = this.GroupBySearchView.create({
        label: 'From',
        property: Medal.YEAR,
        op: GTE,
        size: 1
      });

      this.toYear = this.GroupBySearchView.create({
        label: 'To',
        property: Medal.YEAR,
        op: LTE,
        size: 1
      });

      this.color = this.GroupBySearchView.create({
        property: Medal.COLOR,
        size: 4
      });

      this.country = this.GroupBySearchView.create({
        property: Medal.COUNTRY,
        size: 1
      });

      this.city = this.GroupBySearchView.create({
        property: Medal.CITY,
        size: 1
      });

      this.gender = this.GroupBySearchView.create({
        property: Medal.GENDER,
        size: 3
      });

      this.discipline = this.GroupBySearchView.create({
        property: Medal.DISCIPLINE,
        size: 1
      });

      this.sport = this.GroupBySearchView.create({
        property: Medal.SPORT,
        size: 1
      });

      Events.dynamic(
        function() {
          self.fromYear.predicate;
          self.toYear.predicate;
          self.color.predicate;
          self.country.predicate;
          self.city.predicate;
          self.gender.predicate;
          self.discipline.predicate;
          self.sport.predicate; },
        function() {
          self.predicate = AND(
            self.fromYear.predicate,
            self.toYear.predicate,
            self.color.predicate,
            self.country.predicate,
            self.city.predicate,
            self.gender.predicate,
            self.discipline.predicate,
            self.sport.predicate
          ).partialEval();

          self.sql = 'SELECT * FROM Medal' +
            (self.predicate !== TRUE ?
              ' WHERE (' + self.predicate.toSQL() + ')' :
              '');
        });
      Events.dynamic(
        function() { self.query; },
        function() { self.filteredDAO = self.dao; /*self.dao.where(self.query);*/ });
    }
  ],

  actions: [
    function clear() {

    }
  ],

  templates: [
    function CSS() {/*
      .medalController {
        display: flex;
      }
      .foamSearchView select {
        width: 300px;
      }
      .tableView {
        width: auto !important;
      }
      .MedalTable {
        width: auto !important;
      }
      .searchPanel {
        margin: 15px;
      }
      .searchResults {
        margin-left: 40px;
      }
      input[name='query'] {
        width: 300px;
      }
    */},
    function toHTML() {/*
      <div class="medalController">
        <div class="searchPanel">
          Search:<br>
          $$query
          %%fromYear %%toYear %%city %%discipline %%sport %%country %%color %%gender
          $$clear<br>
          <br>SQL:<br>$$sql{mode: 'read-only'}
        </div>
        <div class="searchResults">
          $$filteredDAO
        </div>
      </div>
    */}
  ]
});
