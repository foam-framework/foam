MODEL({
  name: 'QIssuePreviewBorder',
  help: 'Wraps a QIssueDetailView in a manner appropriate for a popup.',

  methods: {
    toHTML: function(border, delegate, args) {
      return '<div id="' + this.id + '" ' +
        'class="QIssuePreview" ' +
        'style="position:absolute;height:500px;width:875px;background:white">' +
        this.toInnerHTML() +
        '</div>';
    }
  }
});
