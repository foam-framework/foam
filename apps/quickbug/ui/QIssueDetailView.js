MODEL({
  name: 'QIssueDetailView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'model',
      factory: function() { return QIssue; }
    },
    {
      model_: 'BooleanProperty',
      name: 'saveEnabled',
      defaultValue: false
    },
    {
      name: 'QIssueCommentDAO'
    },
    {
      model_: 'DAOProperty',
      name: 'issueDAO',
      onDAOUpdate: 'onDAOUpdate'
    },
    {
      model_: 'DAOProperty',
      name: 'cursorIssueDAO'
    },
    {
      name: 'url'
    },
    {
      name: 'cursorView',
      factory: function() {
        return this.X.CursorView.create({
          data: this.X.Cursor.create({dao: this.cursorIssueDAO$Proxy})});
      }
    },
    {
      name: 'blockingView',
      factory: function() {
        return this.X.BlockView.create({
          property: QIssue.BLOCKING,
          ids: this.data.blocking});
      }
    },
    {
      name: 'blockedOnView',
      factory: function() {
        return this.X.BlockView.create({
          property: QIssue.BLOCKED_ON,
          ids: this.data.blockedOn});
      }
    },
    'newCommentView'
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isMerged: 100,
      code: function() {
        if ( ! this.data ) return;
        if ( ! this.$ ) return;

        var self = this;
        this.issueDAO.find(this.data.id, {
          put: function(obj) {
            if ( obj.equals(self.data) ) return;
            self.saveEnabled = false;
            self.data.copyFrom(obj);
            self.newCommentView.issue = obj;
            self.saveEnabled = true;
          }
        });
      }
    },
    {
      name: 'doSave',
      code: function() {
        // Don't keep listening if we're no longer around.
        if ( ! this.$ ) throw EventService.UNSUBSCRIBE_EXCEPTION;

        if ( this.saveEnabled ) this.issueDAO.put(this.data);
      }
    }
  ],

  methods: {
    destroy: function() {
      if ( this.data ) this.data.removeListener(this.doSave);
    },
    commentView: function() {
      return this.X.DAOListView.create({
        dao: this.QIssueCommentDAO,
        model: this.X.QIssueComment,
        rowView: 'QIssueCommentView'
      });
    },
    commentCreateView: function() {
      return this.newCommentView = this.X.QIssueCommentCreateView.create({
        dao: this.QIssueCommentDAO,
        issue: this.data
      });
    },
    clView: function() {
      return this.X.QIssueCLView.create({dao: this.QIssueCommentDAO});
    },
    toHTML: function() {
      return '<div id="' + this.id + '">' + this.toInnerHTML() + '</div>';
    },
    updateSubViews: function() {
      this.SUPER();
      this.saveEnabled = true;
    }
  },

  templates: [
    { name: 'toInnerHTML' }
  ]
});


MODEL({
  name: 'QIssueLabelsView',
  extendsModel: 'View',

  properties: [
    {
      name: 'data',
      factory: function() { return SimpleValue.create([]); },
      postSet: function() { this.update(); }
    }
  ],

  methods: {
    toHTML: function() { return '<div id="' + this.id + '"></div>'; },
    initHTML: function() { this.SUPER(); this.update(); }
  },

  listeners: [
    {
      name: 'update',
      animate: true,
      code: function() {
        if ( ! this.$ ) return;

        var value = this.data.sort(function (o1, o2) {
          return o1.toLowerCase().compareTo(o2.toLowerCase());
        });
        var out = "";
        for ( var i = 0; i < value.length; i++ ) {
          var start = value[i].substring(0, value[i].indexOf('-') + 1);
          var rest  = value[i].substring(value[i].indexOf('-') + 1);

          if ( start != 'Restrict-' ) {
            out += '<div><b>' +
              this.strToHTML(start) + '</b>' +
              this.strToHTML(rest) + '</div>';
          }
        }
        this.$.innerHTML = out;
      }
    }
  ]
});


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
            view: QIssueTileView.create({
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
