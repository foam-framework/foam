MODEL({
  package: 'foam.demos.dailycount',
  name: 'Controller',
  extendsModel: 'foam.ui.View',

  requires: [
    'foam.dao.EasyDAO',
    'foam.dao.IDBDAO',
    'foam.ui.DetailView',
    'foam.demos.dailycount.DailyCount',
    'foam.demos.dailycount.DailyThing'
  ],

  exports: [ 'counts', 'today' ],
  
  properties: [
    {
      name: 'things',
      view: { factory_: 'foam.ui.DAOListView', rowView: 'foam.ui.DetailView' },
      factory: function() {
        return this.EasyDAO.create({
          model: foam.demos.dailycount.DailyThing,
          cache: true,
          seqNo: true});
      }
    },
    {
      name: 'counts',
      view: 'foam.ui.TableView',
      factory: function() {
        return this.EasyDAO.create({
          model: foam.demos.dailycount.DailyCount,
          cache: true,
          seqNo: true});
      }
    }
  ],

  methods: [
    function today() {
      var today = new Date();
      today.setHours(0,0,0,0);
      return today;
    }
  ],

  actions: [
    {
      name: 'add',
      code: function() { this.things.put(this.DailyThing.create()); }
    }
  ],

  templates: [
    function toHTML() {/*
      $$things
      $$add
      <hr>
      $$counts
    */}
  ]
});
