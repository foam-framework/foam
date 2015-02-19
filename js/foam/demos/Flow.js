CLASS({
  package: 'foam.demos',
  name: 'Flow',

  requires: [ 'foam.demos.SolarSystem', 'foam.graphics.Circle' ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.X.registerElement('solar',  'foam.demos.SolarSystem'); 
      this.X.registerElement('circle', 'foam.graphics.Circle'); 
    }
  },

  templates: [
    function toDetailHTML() {/*
      <h1>Flow Demo</h1>

      <circle color="red" x="200" y="100" r="80"/>

      <solar></solar>
    */}
  ]
});
  