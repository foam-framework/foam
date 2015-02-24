CLASS({
  name: 'NumberFormatter',
  package: 'foam.apps.calc',
  messages: [
    {
      name: 'NaN',
      value: 'Not a number',
      translationHint: 'description of a value that isn\'t a number'
    }
  ],
  constants: [
    {
      name: 'formatNumber',
      todo: multiline(function() {/* Add "infinity" to NumberFormatter
        messages; this requires messages speechLabel support */}),
      value: function(n) {
        // the regex below removes extra zeros from the end,
        // or middle of exponentials
        return typeof n === 'string' ? n :
            Number.isNaN(n)       ? this.NaN :
            ! Number.isFinite(n)  ? '∞' :
            parseFloat(n).toPrecision(12)
            .replace( /(?:(\d+\.\d*[1-9])|(\d+)(?:\.))(?:(?:0+)$|(?:0*)(e.*)$|$)/ ,"$1$2$3");
      }
    }
  ]
});
