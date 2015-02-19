CLASS({
  package: 'foam.demos',
  name: 'Flow',

  requires: [ 'foam.demos.SolarSystem', 'foam.graphics.Circle' ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.X.registerElement('solar',  'foam.demos.SolarSystem'); 
      this.X.registerElement('circle', 'foam.graphics.Circle'); 
      this.X.registerElement('email', 'com.google.mail.MobileController');
    }
  },

  templates: [
    function toDetailHTML() {/*
      <h1>Flow Demo</h1>

      <circle color="yellow" x="200" y="100" r="80"/><br>

      <circle color="blue" x="200" y="20" r="20"/>

      <solar/>
    */}
  ]
});
