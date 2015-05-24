CLASS({
  package: 'foam.demos.olympics',
  name: 'Controller',

  requires: [
    'foam.demos.olympics.Medal',
    'foam.demos.olympics.MedalData'
  ],

  properties: [
    {
      name: 'query',
      defaultValue: TRUE
    },
    {
      name: 'dao',
      factory: function() {
        return MDAO.create({model: this.Medal});
      }
    },
    {
      name: 'filteredDAO',
      view: 'foam.ui.TableView'
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      this.MedalData.select(dao);

      Events.dynamic(
        function() { this.query; },
        function() { this.filteredDAO = this.dao.where(this.query); });
    }
  ],

  templates: [
    function toDetailHTML() {/*
      $$query
      $$filteredDAO
    */}
  ]
});
