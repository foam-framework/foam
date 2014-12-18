CLASS({
  name: 'PolymerComponentTrait',
  package: 'foam.polymer',

  imports: ['warn'],

  methods: {
    installInDocument: function(X, document) {
      var superRtn = this.SUPER.apply(this, arguments);
      if ( ! this.HREF ) return superRtn;

      var l = document.createElement('link');
      l.setAttribute('rel', 'import');
      l.setAttribute('href', this.HREF);
      document.head.appendChild(l);

      return superRtn;
    }
  }
});
