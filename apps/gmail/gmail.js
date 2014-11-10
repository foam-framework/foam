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


MODEL({
  name: 'MGmail',
  description: 'Mobile Gmail',
  traits: ['PositionedDOMViewTrait'],

  extendsModel: 'View',

  requires: [
    'GMailUserInfo',
    'ContactDAO',
    'EasyOAuth2',
    'TouchManager',
    'GestureManager',
    'XHR'
  ],
  exports: [
    'touchManager',
    'gestureManager',
    'contactDao',
    'authXHR as XHR'
  ],

  properties: [
    {
      name: 'touchManager',
      factory: function() {
        return this.TouchManager();
      }
    },
    {
      name: 'gestureManager',
      factory: function() {
        return this.GestureManager();
      }
    },
    {
      name: 'controller',
      subType: 'AppController',
      postSet: function(_, controller) {
        var view = controller.X.DetailView.create({data: controller});
        this.stack.setTopView(FloatingView.create({ view: view }));
      }
    },
    {
      name: 'oauth',
      factory: function() {
        return this.EasyOAuth2.create({
          clientId: "945476427475-oaso9hq95r8lnbp2rruo888rl3hmfuf8.apps.googleusercontent.com",
          clientSecret: "GTkp929u268_SXAiHitESs-1",
          scopes: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://mail.google.com/"
          ]
        });
      }
    },
    {
      name: 'authXHR',
      factory: function() {
        return this.XHR.xbind({
          authAgent: this.oauth,
          retries: 3,
          delay: 10
        });
      }
    },
    {
      name: 'emailDao',
      type: 'DAO',
      factory: function() {
        return this.X.LimitedLiveCachingDAO.create({
          cacheLimit: 10,
          src: this.X.GMailToEMailDAO.create({
            delegate: this.X.GMailMessageDAO.create({})
          }),
          cache: this.X.CachingDAO.create({
              src: this.X.IDBDAO.create({
                  model: this.X.EMail
              }),
              cache: this.X.MDAO.create({ model: this.X.EMail })
          })
        });
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
      name: 'contactDao',
      type: 'DAO',
      factory: function() {
        return this.ContactDAO();
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
      // TODO: Populate this somehow
      name: 'profile',
      description: 'Profile information of current user.',
      factory: function() {
        var xhr = this.X.XHR.create({ responseType: 'json' });
        aseq(
          function(ret) {
            xhr.asend(ret, 'https://www.googleapis.com/oauth2/v1/userinfo');
          }
        )(function(resp) {
          var user = this.GMailUserInfo.create();
          user.fromJSON(resp);
          this.profile = user;
        }.bind(this));
        return '';
      }
    },
  ],

  methods: {
    toHTML: function() { return this.stack.toHTML(); },

    initHTML: function() {
      this.stack.initHTML();

      var Y = this.X.sub({
        stack: this.stack,
        EMailDAO: this.emailDao,
        mgmail: this, // TODO: this doesn't actually work.
      }, 'GMAIL CONTEXT');

      var toTop = function(id) {
        return {
          compare: function(o1, o2) {
            return o1.id == id ? -1 : o2.id == id ? 1 : 0;
          }
        };
      };

      this.controller = Y.AppController.create({
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
            topSystemLabelDAO: this.X.mgmail.labelDao
                .where(EQ(FOAMGMailLabel.getProperty('type'), 'system'))
                .orderBy(
                  toTop('INBOX'),
                  toTop('STARRED'),
                  toTop('DRAFT')
                )
                .limit(3),
            bottomSystemLabelDAO: this.X.mgmail.labelDao
                .where(AND(EQ(FOAMGMailLabel.getProperty('type'), 'system'),
                           NEQ(FOAMGMailLabel.ID, 'INBOX'),
                           NEQ(FOAMGMailLabel.ID, 'STARRED'),
                           NEQ(FOAMGMailLabel.ID, 'UNREAD'),
                           NEQ(FOAMGMailLabel.ID, 'DRAFT')))
                .orderBy(toTop('SENT'),
                         toTop('SPAM'),
                         toTop('TRASH')),
            userLabelDAO: this.X.mgmail.labelDao
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
    openEmail: function(email) {
      email = email.clone();
      var v = this.controller.X.FloatingView.create({
        view: this.controller.X.EMailView.create({data: email})
      });
      email.markRead(this.controller.X);
      this.stack.pushView(v, '');
    },
    changeLabel: function(label) {
      if (label) {
        this.controller.q = 'l:' + label.id;
        this.controller.name = label.name;
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


MODEL({
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


MODEL({
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


MODEL({
  name: 'EMailCitationView',
  extendsModel: 'DetailView',
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
        this.on('click', function() { this.X.mgmail.openEmail(this.data); }, this.id);
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


MODEL({
  name: 'MenuView',
  extendsModel: 'View',
  traits: ['PositionedDOMViewTrait'],
  requires: [
    'MenuLabelCitationView',
    'FOAMGMailLabel',
    'ImageView',
    'TextFieldView'
  ],
  imports: ['mgmail'],
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
        this.mgmail.emailDao.select(sink);
        return sink;
      }
    }
  ],
  templates: [
    function toInnerHTML() {/*
      <div class="menuView">
        <div class="menuHeader">
          <%= this.ImageView.create({ data: this.mgmail.profile.avatarUrl }) %><br>
          <%= this.TextFieldView.create({ mode: 'read-only', extraClassName: 'name', data: this.mgmail.profile.name }) %><br>
          <%= this.TextFieldView.create({ mode: 'read-only', extraClassName: 'email', data: this.mgmail.profile.email }) %>
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


MODEL({
  name: 'MenuLabelCitationView',
  extendsModel: 'DetailView',
  requires: ['SimpleValue'],
  imports: ['counts'],
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
      <% this.on('click', function() { this.X.mgmail.changeLabel(this.data); }, this.id); %>
    */}
  ]
});


var openComposeView = function(email) {
  var X = mgmail.controller.X;
  var view = X.FloatingView.create({
    view: X.EMailComposeView.create({
      data: email,
    })
  });
  X.stack.pushView(view, undefined, undefined, 'fromRight');
};
