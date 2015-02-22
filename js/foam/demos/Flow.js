CLASS({
  package: 'foam.demos',
  name: 'Flow',
  extendsModel: 'View',

  // TODO(kgr): eventually, this shouldn't be required
  requires: [
    'foam.demos.SolarSystem',
    'foam.graphics.Circle',
    'foam.flow.ToC',
    'foam.flow.Section',
    'foam.flow.CodeSample'
  ],

  exports: [ 'sections' ],

  properties: [
    {
      model_: 'DAOProperty',
      name: 'sections',
      view: 'DAOListView',
      factory: function() { return []; }
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      this.X.registerElement('solar',       'foam.demos.SolarSystem'); 
      this.X.registerElement('circle',      'foam.graphics.Circle'); 
      this.X.registerElement('email',       'com.google.mail.MobileController');
      this.X.registerElement('toc',         'foam.flow.ToC');
      this.X.registerElement('section',     'foam.flow.Section');
      this.X.registerElement('code-sample', 'foam.flow.CodeSample');
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

      <circle color="yellow" x="200" y="50" r="40"/><br>

      <circle color="blue" x="200" y="20" r="20"/>

      <!-- <solar/> -->

      <section title="Chapter 3">
        This is chapter 3.
      </section>

      Sample 1:
      <code-sample code="1+2;"/>

      Sample 2:
      <code-sample>
        42*42;
      </code-sample>

      Sample 3:
      <code-sample>
        <code>"hello world!";</code>
      </code-sample>

      The end.
    */}
  ]
});
