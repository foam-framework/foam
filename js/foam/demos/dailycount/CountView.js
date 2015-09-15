MODEL({
  package: 'foam.demos.dailycount',
  name: 'CountView',
  extendsModel: 'foam.ui.View',

  requires: [ 'foam.demos.dailycount.DailyCount' ],
  imports: [ 'counts' ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'count'
    }
  ],

  methods: [
    function initHTML() {
      this.SUPER();

      this.updateCount();
    },
    function today() {
      var today = new Date();
      today.setHours(0,0,0,0);
      return today;
    },
    function updateCount(incr) {
      var self  = this;
      var today = this.today();

      this.counts.find(AND(
        EQ(this.DailyCount.THING_ID, this.data),
        EQ(this.DailyCount.DATE, today)), {
          put: function(count) {
            self.count = count.count;
            if ( incr ) {
              self.count = ++count.count;
              self.counts.put(count);
            }
          },
          error: function() {
            if ( incr ) {
              self.count = 1;
              self.counts.put(
                self.DailyCount.create({
                  thingID: self.data,
                  date: today,
                  count: 1
                }));
            }
          }
        });
    }
  ],

  actions: [
    {
      name: 'incr',
      label: '+',
      code: function() { this.updateCount(true); }
    }
  ],

  templates: [
    function toHTML() {/* $$count{mode: 'read-only'} $$incr */}
  ]
});
