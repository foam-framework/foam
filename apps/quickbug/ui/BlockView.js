/**
 * Display a heirarchical Issue blocking/blocked-on list.
 * Draw the ID with style line-through if issue closed.
 * Display a TileView hover preview.
 **/
MODEL({
  name: 'BlockView',
  extendsModel: 'View',

  properties: [
    {
      name: 'issueDAO',
      scope: 'X',
      // TODO: should be renamed from IssueDAO to issueDAO in X
      defaultValueFn: function() { return this.X.IssueDAO; }
    },
    {
      name: 'property',
      help: 'Property to recurse on.'
    },
    {
      name: 'idSet',
      help: "Set of Issue ID's that have already been seen.",
      factory: function() { return {}; }
    },
    {
      name: 'maxDepth',
      defaultValue: 3
    },
    {
      name: 'ids'
    }
  ],

  methods: {
    toHTML: function(opt_depth) {
      var s = '<div class="blockList">';

      for ( var i = 0 ; i < this.ids.length ; i++ ) {
        var issue = this.ids[i];
        var view = this.X.IssueLink.create({
          issue: issue,
          property: this.property,
          maxDepth: this.maxDepth
        });

        s += '<div>' + view.toHTML() + '</div>'
        this.addChild(s);
      }

      s += '</div>';

      return s;
    }
  }
});
