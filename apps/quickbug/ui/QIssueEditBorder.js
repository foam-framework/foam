FOAModel({
  name: 'QIssueEditBorder',
  help: 'Wraps a QIssueDetailView in a manner appropriate for its own window.',

  methods: {
    toHTML: function(border, delegate, args) {
      return '<head>' +
        '  <link rel="stylesheet" type="text/css" href="foam.css" />' +
        '  <link rel="stylesheet" type="text/css" href="../../core/foam.css" />' +
        '  <link rel="stylesheet" type="text/css" href="qbug.css" />' +
        '  <title>Quick Bug</title>' +
        '</head>' +
        '<body>' +
        delegate.apply(this, args) +
        '</body>';
    },
    initHTML: function(border, delegate, args) {
      // Enable scrolling in the popup window.
      this.X.document.firstChild.style.overflow = 'auto';
      delegate();
    }
  }
});
