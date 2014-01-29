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
    },
    {
      name: 'blockedOnView'
    }
  ],

  methods: {
    updateSubViews: function() {
      this.SUPER();
      var value = this.value.get();
      this.blockingView.value = value.propertyValue('blocking');
      this.blockedOnView.value = value.propertyValue('blockedOn');
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
    },
    blocking: function() {
      var dao = this.QIssueDAO;
      this.blockingView = ArrayListView.create({
        listView: {
          create: function() {
            return DAOKeyView.create({
              model: QIssue,
              dao: dao,
              view: QIssueQuickStatusView
            });
          }
        }
      });
      return this.blockingView;
    },
    blockedOn: function() {
      var dao = this.QIssueDAO;
      this.blockedOnView = ArrayListView.create({
        listView: {
          create: function() {
            return DAOKeyView.create({
              model: QIssue,
              dao: dao,
              view: QIssueQuickStatusView
            });
          }
        }
      });
      return this.blockedOnView;
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

var QIssueQuickStatusView = FOAM({
  model_: 'Model',
  name: 'QIssueQuickStatusView',
  extendsModel: 'AbstractView',

  properties: [
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
      this.update();
    }
  },

  listeners: [
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
        // TODO handle all possible Closed statuses.
        var updateStatus = function(obj) {
          if ( obj.status === 'Fixed' )
            self.$.style.textDecoration = 'line-through';
          else
            self.$.style.textDecoration = '';
        }
        value.addPropertyListener('status', updateStatus);
        updateStatus(value);
      }
    }
  ]
});
