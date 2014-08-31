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
      name: 'url',
      scope: 'X',
      defaultValueFn: function() { return this.X.url; }
    },
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
        var id = this.nextID();

        if ( this.idSet[issue] ) continue;

        this.idSet[issue] = id;

        var url = this.url + '/issues/detail?id=' + issue;

        s += '<div><a href="" id="' + id + '">Issue ' + issue + '</a><div>';

        this.on('click',     this.editIssue.bind(this, issue),    id);
        this.on('mouseover', this.startPreview.bind(this, issue), id);
        this.on('mouseout',  this.endPreview,                     id);
      }

      s += '</div>';

      return s;
    },

    initHTML: function() {
      this.SUPER();

      var self = this;

      for ( var i = 0 ; i < this.ids.length ; i++ ) {
        var id = this.ids[i];
        this.issueDAO.find(id, { put: function(issue) {
          if ( ! issue.isOpen() ) {
            $(self.idSet[id]).style.textDecoration = 'line-through';
          }
          if ( self.maxDepth > 1 ) {
            var ids = issue[self.property.name];

            if ( ids.length ) {
              var subView = self.X.BlockView.create({
                property: self.property,
                maxDepth: self.maxDepth-1,
                ids:      ids
              });
              $(self.idSet[id]).insertAdjacentHTML('afterend', '<div style="margin-left:10px;">' + subView.toHTML() + '</div>');
              subView.initHTML();
            }
          }
        }});
      }
    }
  },

  listeners: [
    {
      name: 'editIssue',
      code: function(id) { this.parent.X.browser.location.id = id; }
    },
    {
      name: 'startPreview',
      code: function(id, e) {
        if ( this.currentPreview ) return;

        var self = this;
        this.issueDAO.find(id, { put: function(issue) {
          self.currentPreview = self.X.PopupView.create({
            x: e.x+30,
            y: e.y-20,
            view: self.X.QIssueTileView.create({
              issue: issue,
              browser: {url: ''}})
          });

          self.currentPreview.open(self);
        }});
      }
    },
    {
      name: 'endPreview',
      code: function() {
        if ( ! this.currentPreview ) return;
        this.currentPreview.close();
        this.currentPreview = null;
      }
    }
  ]
});
