MODEL({
  package: 'foam.demos.dailycount',
  name: 'CountView',
  extendsModel: 'foam.ui.View',

  requires: [ 'foam.demos.dailycount.DailyCount' ],
  imports: [ 'counts', 'today' ],

  properties: [
    {
      model_: 'IntProperty',
      name: 'count'
    }
  ],

  actions: [
    {
      name: 'incr',
      code: function() {
        var today = this.today();
        this.count++;
        this.counts.put(
          this.DailyCount.create({
            thingID: this.data,
            date: today,
            count: this.count
          }));
       
      }
    }
  ],

  templates: [
    function toHTML() {/*
      $$count{mode: 'read-only'} $$incr
    */}
  ]
});
