CLASS({
  package: 'foam.demos',
  name: 'Flow',
  extendsModel: 'View',

  // TODO(kgr): eventually, this shouldn't be required
  requires: [
    'foam.demos.SolarSystem',
    'foam.graphics.Circle',
    'foam.flow.ToC',
    'foam.flow.Section'
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.X.FLOWX = this.X;
      this.X.registerElement('solar',   'foam.demos.SolarSystem'); 
      this.X.registerElement('circle',  'foam.graphics.Circle'); 
      this.X.registerElement('email',   'com.google.mail.MobileController');
      this.X.registerElement('toc',     'foam.flow.ToC');
      this.X.registerElement('section', 'foam.flow.Section');
    }
  },

  templates: [
    function toHTML() {/*
      <h1>Flow Demo</h1>

      <toc/>

      <section title="Chapter 1">
        This is chapter 1.
      </section>

      <section title="Chapter 2">
        This is chapter 2.
      </section>

      <circle color="yellow" x="200" y="100" r="80"/><br>

      <circle color="blue" x="200" y="20" r="20"/>

      <!-- <solar/> -->

    */}
  ]
});
