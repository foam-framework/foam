var QIssuePreviewView = FOAM({
  model_: 'Model',

  name: 'QIssuePreviewView',
  extendsModel: 'DetailView',

  properties: [
    {
      name: 'QIssueCommentDAO'
    },
    {
      name: 'QIssueDAO'
    },
    {
      name: 'blockingView',
      valueFactory: function() {
        return BlockView.create({
          ctx: this,
          property: QIssue.BLOCKING,
          ids: this.value.get().blocking});
      }
    },
    {
      name: 'blockedOnView',
      valueFactory: function() {
        return BlockView.create({
          ctx: this,
          property: QIssue.BLOCKED_ON,
          ids: this.value.get().blockedOn});
      }
    }
  ],

  methods: {
    updateSubViews: function() {
      this.SUPER();
      var value = this.value.get();
      var dao = this.QIssueDAO;
      value.addListener(function(v) {
        dao.put(v);
      });
    },
    commentView: function() {
      return ListView.create({
        dao: this.QIssueCommentDAO,
        view: {
          create: function() {
            return QIssueCommentView.create({
              model: QIssueComment
            });
          }
        }
      });
    }
  },

  templates: [
    { name: 'toHTML' }
  ]
});


var QIssueLabelsView = FOAM({
  model_: 'Model',
  name: 'QIssueLabelsView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create([]); },
      postSet: function(newValue, oldValue) {
        oldValue && oldValue.removeListener(this.update);
        newValue.addListener(this.update);
        this.update();
      }
    }
  ],

  methods: {
    toHTML: function() { return '<div id="' + this.getID() + '"></div>'; },
    initHTML: function() { this.SUPER(); this.update(); },
    setValue: function(value) { this.value = value; }
  },

  listeners: [
    {
      name: 'update',
      animate: true,
      code: function() {
        if ( ! this.$ ) return;

        var value = this.value.get();
        var out = "";
        for ( var i = 0; i < value.length; i++ ) {
          var start = value[i].substring(0, value[i].indexOf('-') + 1);
          var rest = value[i].substring(value[i].indexOf('-') + 1);

          out += '<div><b>' +
            this.strToHTML(start) + '</b>' +
            this.strToHTML(rest) + '</div>';
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
var BlockView = FOAM({
  model_: 'Model',
  name: 'QIssueQuickStatusView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'ctx'
    },
    {
      name: 'QIssueDAO',
      scope: 'ctx',
      defaultValueFn: function() { return this.ctx.QIssueDAO; }
    },
    {
      name: 'property',
      help: 'Property to recurse on.'
    },
    {
      name: 'idSet',
      help: "Set of Issue ID's that have already been seen.",
      valueFactory: function() { return {}; }
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
      if ( ( opt_depth || 0 ) > this.maxDepth ) return '';

      var s = '<div class="blockList">';

      for ( var i = 0 ; i < this.ids.length ; i++ ) {
        var issue = this.ids[i];
        var id = this.nextID();

        if ( this.idSet[issue] ) continue;

        this.idSet[issue] = id;

        s += '<div id="' + id + '">Issue ' + issue + '</div>';

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
        this.QIssueDAO.find(id, { put: function(issue) {
          if ( ! issue.isOpen() ) {
            $(self.idSet[id]).style.textDecoration = 'line-through';
          }
        }});
      }
    }
  },

  listeners: [
    {
      name: 'startPreview',
      code: function(id, e) {
        if ( this.currentPreview ) return;

        var self = this;
        this.QIssueDAO.find(id, { put: function(issue) {
          self.currentPreview = PopupView.create({
            x: e.x+30,
            y: e.y-20,
            view: QIssueTileView.create({
              issue: issue,
              browser: {url: ''}})
          });

          self.currentPreview.open(self.ctx);
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
