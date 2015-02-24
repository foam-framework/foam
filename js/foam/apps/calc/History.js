CLASS({
  name: 'History',
  package: 'foam.apps.calc',

  requires: [
    'foam.apps.calc.NumberFormatter'
  ],

  properties: [
    'op',
    {
      name: 'a2',
      preSet: function(_, n) { return this.formatNumber(n); }
    }
  ],
  methods: {
    formatNumber: function(n) {
      var nu = this.NumberFormatter.formatNumber(n) || '0';
      // strip off trailing "."
      return nu.replace(/(.+?)(?:\.$|$)/, "$1");
    }
  }
});
