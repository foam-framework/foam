MODEL({
  package: 'foam.demos.dailycount',
  name: 'DailyThing',

  properties: [
    {
      name: 'id'
    },
    {
      name: 'data'
    }
  ],

  templates: [
    function toDetailHTML() {/*
      $$id{mode: 'read-only'} $$data $$id <br>
    */}
  ]
});
