CLASS({
  package: 'com.google.sweeper',
  name: 'Game',

  extendsModel: 'View',

  requires: [ 'com.google.sweeper.Board' ],

  properties: [
    {
      model: 'IntProperty',
      name: 'time'
    },
    {
      name: 'timer',
      factory: function() { return Timer.create(); }
    },
    {
      name: 'board',
      lazyFactory: function() { return this.Board.create(); }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      this.time$ = this.timer.second$;
      this.timer.start();
    }
  },

  templates: [
    function toHTML() {/*
      $$time{mode: 'read-only'}
      <br>
      %%board
    */}
  ]

});