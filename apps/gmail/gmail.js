/**
 * Material Design GMail.
 **/

Object_forEach({
  ARCHIVE:       'archive',
  TRASH:         'delete',
  REPLY:         'reply',
  REPLY_ALL:     'reply_all',
  SPAM:          'report',
  FORWARD:       'forward',
  STAR:          'star',
  MOVE_TO_INBOX: 'inbox',
  SEND:          'send',
  MARK_UNREAD:   'markunread'
}, function(image, name) {
  EMail[name].copyFrom({iconUrl: 'icons/ic_' + image + '_black_24dp.png', label: ''});
});


/** Modify the default QueryParser so that label ids are looked up in the EMailLabels DAO. **/
var queryParser = {
  __proto__: QueryParserFactory(EMail),

  id: sym('string'),

  labelMatch: seq(alt('label','l'), alt(':', '='), sym('valueList'))
}.addActions({
  id: function(v) {
     return OR(
        CONTAINS_IC(EMail.TO, v),
        CONTAINS_IC(EMail.FROM, v),
        CONTAINS_IC(EMail.SUBJECT, v),
        CONTAINS_IC(EMail.BODY, v));
  },

  labelMatch: function(v) {
    var or = OR();
    var values = v[2];
    for ( var i = 0 ; i < values.length ; i++ ) {
      or.args.push(EQ(EMail.LABELS, values[i]))
    }
    return or;
  }
});

queryParser.expr = alt(
  sym('labelMatch'),
  queryParser.export('expr')
);


CLASS({
  name: 'MGmail',
  description: 'Mobile Gmail',
  traits: ['PositionedDOMViewTrait'],

  extendsModel: 'View',

  requires: [
    'CachingDAO',
    'ContextualizingDAO',
    'DetailView',
    'EMailView',
    'EasyOAuth2',
    'FloatingView',
    'GMailUserInfo',
    'GestureManager',
    'MDAO',
    'TouchManager',
    'foam.ui.layout.ControllerOption',
    'foam.ui.layout.ResponsiveController',
    'foam.ui.md.TwoPane as TwoPane',
    'lib.contacts.Contact as Contact',
    'lib.contacts.ContactNetworkDAO as ContactNetworkDAO'
  ],

  exports: [
    'XHR',
    'touchManager',
    'gestureManager',
    'contactDAO as ContactDAO',
    'labelDao as LabelDAO',
    'emailDao as EMailDAO',
    'profile$ as profile$',
    'as controller',
    'stack'
  ],

  properties: [
    {
      name: 'XHR',
      factory: function() {
        return XHR.xbind({
          authAgent: this.oauth,
          retries: 3,
          delay: 10
        });
      }
    },
    {
      name: 'jsonpFuture',
      factory: function() {
        return deferJsonP(this.X);
      }
    },
    {
      name: 'touchManager',
      factory: function()  { return this.TouchManager.create(); }
    },
    {
      name: 'gestureManager',
      factory: function() { return this.GestureManager.create(); }
    },
    {
      name: 'oauth',
      postSet: function(_, v) {
        v.setJsonpFuture(this.X, this.jsonpFuture);
      },
      factory: function() {
        return this.EasyOAuth2.create({
          clientId: "945476427475-oaso9hq95r8lnbp2rruo888rl3hmfuf8.apps.googleusercontent.com",
          clientSecret: "GTkp929u268_SXAiHitESs-1",
          scopes: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://mail.google.com/",
            'https://www.google.com/m8/feeds'
          ]
        });        
      }
    },
    {
      model_: 'ArrayProperty',
      subType: 'foam.ui.layout.ControllerOption',
      name: 'options',
      factory: function() {
        var self = this;
        return [
          this.ControllerOption.create({
            controller: function() {
              return self.DetailView.create({ data: self.controller}, self.controller.X);
            },
            minWidth: 0
          }),
          this.ControllerOption.create({
            controller: function() {
              return self.TwoPane.create({ data: self.controller }, self.controller.X)
            },
            minWidth: 600
          })
        ]
      }
    },
    {
      name: 'controller',
      subType: 'AppController',
      postSet: function(_, controller) {
        var view = this.ResponsiveController.create({
          options: this.options
        }, controller.X);
        this.stack.setTopView(this.FloatingView.create({ view: view }));

        // TODO: Hack for positioned based view delay.
        view.onResize();
      }
    },
    {
      name: 'emailDao',
      type: 'DAO',
      factory: function() {
        var dao = this.X.LimitedLiveCachingDAO.create({
          cacheLimit: 100,
          src: this.X.GMailToEMailDAO.create({
            delegate: this.X.GMailMessageDAO.create({})
//            delegate: this.X.StoreAndForwardDAO.create({
//              delegate: this.X.GMailMessageDAO.create({})
//            })
          }),
          cache: this.X.CachingDAO.create({
              src: this.X.IDBDAO.create({
                  model: this.X.EMail
              }),
              cache: this.X.MDAO.create({ model: this.X.EMail })
          })
        });
        dao.src
          .limit(100)
          .where(EQ(this.X.EMail.LABELS, "INBOX"))
          .select(dao.cache);
        return ContextualizingDAO.create({ delegate: dao });
      }
    },
    {
      name: 'labelDao',
      type: 'DAO',
      factory: function() {
        return this.X.CachingDAO.create({
          src: this.X.GMailRestDAO.create({ model: FOAMGMailLabel, modelName: 'labels' }),
          cache: this.X.MDAO.create({ model: FOAMGMailLabel }),
        });
      }
    },
    {
      name: 'contactDAO',
      factory: function() {
        return this.CachingDAO.create({
          src: this.ContactNetworkDAO.create(),
          cache: this.MDAO.create({ model: this.Contact })
        });
      }
    },
    {
      name: 'stack',
      subType: 'StackView',
      factory: function() { return this.X.StackView.create(); },
      postSet: function(old, v) {
        if ( old ) {
          Events.unfollow(this.width$, old.width$);
          Events.unfollow(this.height$, old.height$);
        }
        Events.follow(this.width$, v.width$);
        Events.follow(this.height$, v.height$);
      }
    },
    {
      name: 'profile',
      description: 'Profile information of current user.'
    }
  ],

  methods: {
    init: function(args) {
      this.SUPER(args);
      var xhr = this.X.XHR.create({ responseType: 'json' });

      aseq(function(ret) {
        xhr.asend(ret, 'https://www.googleapis.com/oauth2/v1/userinfo');
      })(function(resp) {
        var user = this.GMailUserInfo.create();
        user.fromJSON(resp);
        this.profile = user;
      }.bind(this));
    },

    toHTML: function() { return this.stack.toHTML(); },

    initHTML: function() {
      this.stack.initHTML();

      var toTop = function(id) {
        return {
          compare: function(o1, o2) {
            return o1.id == id ? -1 : o2.id == id ? 1 : 0;
          }
        };
      };

      this.controller = this.X.AppController.create({
        model: EMail,
        dao: this.emailDao,
        createAction: this.model_.COMPOSE,
        citationView: 'EMailCitationView',
        queryParser: queryParser,
        editableCitationViews: true,
        sortChoices: [
          [ DESC(EMail.TIMESTAMP), 'Newest First' ],
          [ EMail.TIMESTAMP,       'Oldest First' ],
          [ EMail.SUBJECT,         'Subject' ],
        ],
        menuFactory: function() {
          return this.X.MenuView.create({
            topSystemLabelDAO: this.X.LabelDAO
                .where(EQ(FOAMGMailLabel.getProperty('type'), 'system'))
                .orderBy(
                  toTop('INBOX'),
                  toTop('STARRED'),
                  toTop('DRAFT')
                )
                .limit(3),
            bottomSystemLabelDAO: this.X.LabelDAO
                .where(AND(EQ(FOAMGMailLabel.getProperty('type'), 'system'),
                           NEQ(FOAMGMailLabel.ID, 'INBOX'),
                           NEQ(FOAMGMailLabel.ID, 'STARRED'),
                           NEQ(FOAMGMailLabel.ID, 'UNREAD'),
                           NEQ(FOAMGMailLabel.ID, 'DRAFT')))
                .orderBy(toTop('SENT'),
                         toTop('SPAM'),
                         toTop('TRASH')),
            userLabelDAO: this.X.LabelDAO
                .where(NEQ(FOAMGMailLabel.getProperty('type'), 'system'))
                .orderBy(FOAMGMailLabel.NAME)
          });
        }
      });
      var self = this;
      this.labelDao.where(EQ(FOAMGMailLabel.ID, 'INBOX')).select({
        put: function(inbox) {
          self.changeLabel(inbox);
        }
      });
    },
    open: function(id) {
      var self = this;
      this.emailDao.find(id, {
        put: function(m) {
          m = m.deepClone();
          m.markRead(self.controller.X);
          var v = self.FloatingView.create({
            view: self.EMailView.create({ data: m }, self.controller.X)
          })
          self.stack.pushView(v, '');
        }
      });
    },
    openEmail: function(email) {
      debugger;
      this.open(email.id);
    },
    changeLabel: function(label) {
      if (label) {
        this.controller.q = 'l:' + label.id;
        this.controller.name = label.label;
      } else {
        this.controller.q = '';
        this.controller.name = 'All Mail';
      }
      this.stack.back();
    },
  },

  actions: [
    {
      model_: 'Action',
      name: 'compose',
      label: '+',
      action: function() {
        var view = this.X.FloatingView.create({
          view: this.X.EMailComposeView.create({
            data: this.X.EMail.create({
              labels: ['DRAFT']
            })
          })
        });
        this.X.stack.pushView(view, undefined, undefined, 'fromRight');
      }
    }
  ]
});


CLASS({
  name: 'GMailUserInfo',
  properties: ['email', 'name', 'avatarUrl'],
  methods: {
    fromJSON: function(obj) {
      this.email = obj.email;
      this.name = obj.name;
      this.avatarUrl = obj.picture + '?sz=50';
    }
  }
});


CLASS({
  name: 'EMailView',
  extendsModel: 'UpdateDetailView',
  properties: [
  ],
  actions: [
    {
      name: 'back',
      isAvailable: function() { return true; },
      label: '',
      iconUrl: 'images/ic_arrow_back_24dp.png'
    },
    {
      name: 'moreActions',
      label: '',
      isEnabled: function() { return true; },
      iconUrl: 'icons/ic_more_horiz_white_24dp.png',
      action: function() {
        var actionSheet = this.X.ActionSheetView.create({
          data: this.data,
          actions: this.data.model_.actions,
        });
        this.X.stack.slideView(actionSheet);
      },
    },
  ],
  templates: [
    function CSS() {/*
      .actionButtonCView-moreActions {
        margin-right: 10px;
      }
    */},
    function toHTML() {/*
      <div id="<%= this.id %>" class="email-view">
        <div class="header">
          $$back{radius: 22, className: 'backButton'}
          $$subject{mode: 'read-only', className: 'subject'}
          $$archive{iconUrl: 'icons/ic_archive_white_24dp.png'}
          $$moveToInbox{iconUrl: 'icons/ic_inbox_white_24dp.png'}
          $$trash{iconUrl: 'icons/ic_delete_white_24dp.png'}
          $$moreActions
        </div>
        <div class="content">
          <div style="display: flex; display: -webkit-flex">
            $$from{model_: 'MDMonogramStringView'}
            <div style='flex: 1; -webkit-flex: 1'>
              $$from{mode: 'read-only', className: 'from', escapeHTML: true}
              <div class='details'>
                $$to{mode: 'read-only'}
                $$cc{mode: 'read-only'}
                <br>
                $$timestamp{ model_: 'RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
              </div>
            </div>
            $$starred{
              model_: 'ImageBooleanView',
              className:  'actionButton',
              trueImage:  'images/ic_star_24dp.png',
              falseImage: 'images/ic_star_outline_24dp.png'
            }
          </div>
          $$body{ mode: 'read-only', className: 'body', escapeHTML: false }
        </div>
      </div>
    */}
  ]
});


CLASS({
  name: 'EMailCitationView',
  extendsModel: 'DetailView',
  imports: [
    'controller'
  ],
  properties: [
    { name: 'className', defaultValue: 'email-citation' },
    {
      name: 'preferredHeight',
      help: 'Specifying the preferred height of this view for the ScrollView, since an empty row is too small.',
      defaultValue: 82
    }
  ],
  templates: [
    function CSS() {/*
      .email-citation {
        display: flex;
        display: -webkit-flex;
        border-bottom: solid #B5B5B5 1px;
        padding: 10px 14px 10px 6px;
      }

      .email-citation.unread {
        font-weight: bold;
      }

      .email-citation .from {
        display: block;
        font-size: 17px;
        line-height: 24px;
        white-space: nowrap;
        overflow-x:hidden;
        text-overflow: ellipsis;
        flex-grow: 1;
        -webkit-flex-grow: 1;
      }

      .email-citation .timestamp {
        font-size: 12px;
        color: rgb(17, 85, 204);
        white-space: nowrap;
        flex-shrink: 0;
        -webkit-flex-shrink: 0;
      }

      .email-citation .subject {
        display: block;
        font-size: 13px;
        line-height: 17px;
        overflow-x:hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .email-citation .snippet {
        color: rgb(119, 119, 119);
        display: block;
        font-size: 13px;
        height: 20px;
        overflow-x: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .email-citation .monogram-string-view {
        margin: auto 6px auto 0;
      }
    */},
    function toHTML() {/*
      <%
        var id = this.setClass('unread', function() { return self.data && self.data.unread; }, this.id);
        this.on('click', function() { this.controller.open(this.data.id); }, this.id);
      %>

      <div id="<%= id %>" %%cssClassAttr() >
        $$from{model_: 'MDMonogramStringView'}
        <div style="flex: 1; -webkit-flex: 1">
          <div style="display: flex; display: -webkit-flex">
            $$from{mode: 'read-only', className: 'from', escapeHTML: true}
            $$timestamp{ model_: 'RelativeDateTimeFieldView', mode: 'read-only', className: 'timestamp' }
          </div>
          <div style="display: flex; display: -webkit-flex">
            <div style='flex-grow: 1; -webkit-flex-grow: 1'>
              $$subject{mode: 'read-only', className: 'subject'}
              $$snippet{mode: 'read-only', className: 'snippet'}
              $$labels{mode: 'read-only', className: 'labels'}
            </div>
            $$starred{
              model_: 'ImageBooleanView',
              className:  'star',
              trueImage:  'images/ic_star_24dp.png',
              falseImage: 'images/ic_star_outline_24dp.png'
            }
          </div>
        </div>
      </div>
    */}
   ]
});

CLASS({
  name: 'ProfileView',
  extendsModel: 'DetailView',
  requires: ['GMailUserInfo'],
  properties: [
    {
      model_: 'ModelProperty',
      name: 'model',
      factory: function() { return this.GMailUserInfo; }
    }
  ],
  templates: [
    function toHTML() {/*
      <div id="%%id">
        $$avatarUrl{ model_: 'ImageView' }
        $$name{ mode: 'read-only',  extraClassName: 'name' }
        $$email{ mode: 'read-only', extraClassName: 'email' }
      </div>
    */}
  ]
});

CLASS({
  name: 'MenuView',
  extendsModel: 'View',
  traits: ['PositionedDOMViewTrait'],
  requires: [
    'MenuLabelCitationView',
    'FOAMGMailLabel',
    'ProfileView'
  ],
  imports: [
    'profile$',
    'EMailDAO'
  ],
  exports: ['counts'],
  properties: [
    {
      name: 'topSystemLabelDAO',
      view: { factory_: 'DAOListView', rowView: 'MenuLabelCitationView' }
    },
    {
      name: 'bottomSystemLabelDAO',
      view: { factory_: 'DAOListView', rowView: 'MenuLabelCitationView' }
    },
    {
      name: 'userLabelDAO',
      view: { factory_: 'DAOListView', rowView: 'MenuLabelCitationView' }
    },
    {
      name: 'preferredWidth',
      defaultValue: 280
    },
    {
      name: 'counts',
      factory: function() {
        var sink = GROUP_BY(EMail.LABELS, COUNT());
        this.EMailDAO.select(sink);
        return sink;
      }
    }
  ],
  templates: [
    function toInnerHTML() {/*
      <div class="menuView">
        <div class="menuHeader">
          <%= this.ProfileView.create({ data$: this.profile$ }) %>
        </div>
        $$topSystemLabelDAO
        <hr>
        $$bottomSystemLabelDAO
        <hr>
        <%= this.MenuLabelCitationView.create({
          data: this.FOAMGMailLabel.create({
            id: 'All Mail',
            name: 'All Mail'
          })
        }) %>
        $$userLabelDAO
      </div>
    */},
    function CSS() {/*
      .menuView {
        height: 100%;
        display: block;
        overflow-y: auto;
        background: white;
      }

      .menuHeader {
        background: #db4437;
        box-shadow: 0 3px 6px #888;
        color: white;
        padding: 10px 0 8px 15px;
      }
      .menuHeader:hover {
        background: #db4437 !important;
      }

      .menuHeader img {
        border-radius: 50%;
        margin-bottom: 15px;
      }

      .menuHeader .name {
        font-weight: bold;
      }

      .menuView div:hover {
        background: #e0e0e0;
      }
   */}
  ]
});


CLASS({
  name: 'MenuLabelCitationView',
  extendsModel: 'DetailView',
  requires: ['SimpleValue'],
  imports: [
    'counts',
    'controller'
  ],
  properties: [
    {
      name: 'count',
      view: { factory_: 'TextFieldView', mode: 'read-only', extraClassName: 'count' }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var v = this.SimpleValue.create();
      if ( this.counts.groups && this.counts.groups[this.data.name] ) {
        this.link();
      } else {
        this.counts.addListener(this.link);
      }
    }
  },
  listeners: [
    {
      name: 'link',
      code: function() {
        Events.link(this.counts.groups[this.data.name].count$, this.count$);
      }
    }
  ],
  templates: [
    function CSS() {/*
      .label-row {
        height: 42px;
        line-height: 42px;
        padding-left: 15px;
        display: flex;
        align-items: center;
      }
      .label-row img {
        height: 24px;
        width: 24px;
        opacity: 0.6;
        margin-right: 25px;
        flex-grow: 0;
        flex-shrink: 0;
      }
      .label-row .label {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .label-row .count {
        flex-grow: 0;
        flex-shrink: 0;
        margin-right: 10px;
        text-align: center;
        text-align: right;
        width: 40px;
      }
    */},
    function toHTML() {/*
      <div id="%%id" class="label-row">
        $$iconUrl
        $$label{mode: 'read-only', extraClassName: 'label' }
        $$count
      </div>
      <% this.on('click', function() { this.controller.changeLabel(this.data); }, this.id); %>
    */}
  ]
});


var openComposeView = function(X, email) {
  var view = X.FloatingView.create({
    view: X.EMailComposeView.create({
      data: email,
    })
  });
  X.stack.pushView(view, undefined, undefined, 'fromRight');
};
