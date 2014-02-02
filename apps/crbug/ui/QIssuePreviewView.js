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
        var self = this;
        return ArrayListView.create({
          listView: {
            create: function() {
              return DAOKeyView.create({
                model: QIssue,
                dao: self.QIssueDAO,
                view: {
                  create:function() {
                    return QIssueQuickStatusView.create({
                      property: QIssue.BLOCKING
                    });
                  }
                }
              });
            }
          }
        });
      }
    },
    {
      name: 'blockedOnView',
      valueFactory: function() {
        var self = this;
        return ArrayListView.create({
          listView: {
            create: function() {
              return DAOKeyView.create({
                model: QIssue,
                dao: self.QIssueDAO,
                view: {
                  create:function() {
                    return QIssueQuickStatusView.create({
                      property: QIssue.BLOCKED_ON
                    });
                  }
                }
              });
            }
          }
        });
      }
    }
  ],

  methods: {
    updateSubViews: function() {
      this.SUPER();
      var value = this.value.get();
      this.blockingView.value = value.propertyValue('blocking');
      this.blockedOnView.value = value.propertyValue('blockedOn');
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
    {
      name: 'toHTML'
    }
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
 * Display an Issue ID.
 * Draw the ID with style line-through if issue closed.
 * Display a TileView hover preview.
 **/
var QIssueQuickStatusView = FOAM({
  model_: 'Model',
  name: 'QIssueQuickStatusView',
  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'property',
      help: 'Property to recurse on.'
    },
    {
      name: 'visited',
      valueFactory: function() { return {}; }
    },
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create(''); },
      postSet: function(newValue, oldValue) {
        oldValue && oldValue.removeListener(this.update);
        newValue.addListener(this.update);
        this.update();
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<div id="' + this.getID() + '"></div>';
    },
    setValue: function(value) {
      this.value = value;
    },
    initHTML: function() {
      this.SUPER();

      this.$.addEventListener('mouseover', this.startPreview);
      this.$.addEventListener('mouseout', this.endPreview);

      this.update();
    }
  },

  listeners: [
    {
      name: 'startPreview',
      code: function(e) {
        if ( this.currentPreview ) return;

        this.currentPreview = PopupView.create({
          x: e.x+30,
          y: e.y-20,
          view: QIssueTileView.create({
            issue: this.value.value,
            browser: {url: ''}})
        });

        this.currentPreview.open(this);
      }
    },
    {
      name: 'endPreview',
      code: function() {
        if ( ! this.currentPreview ) return;
        this.currentPreview.close();
        this.currentPreview = null;
      }
    },
    {
      name: 'update',
      animate: true,
      code: function() {
        if ( ! this.$ ) return;

        var value = this.value.get();

        if ( ! value ) return;

        var domTitle = DomValue.create(this.$, undefined, 'title');
        var domText = DomValue.create(this.$, undefined, 'textContent');

        var self = this;

        Events.link(value.propertyValue('summary', domTitle));
        Events.map(value.propertyValue('id'), domText, function(value) {
          return 'issue ' + value;
        });
        var updateStatus = function(obj) {
          self.$.style.textDecoration = obj.isOpen() ?
            '' :
            'line-through' ;
        }
        value.addPropertyListener('status', updateStatus);
        updateStatus(value);
      }
    }
  ]
});
