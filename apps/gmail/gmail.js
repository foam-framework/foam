/**
 * Material Design GMail.
 **/

CLASS({
  package: 'com.google.mail',
  name: 'EMailExtensionsAgent',
  documentation: 'Modifies some EMail actions to include proper icons.',
  requires: [
    'foam.lib.email.EMail'
  ],
  methods: {
    execute: function() {
      var self = this;
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
        self.EMail[name].copyFrom({iconUrl: 'icons/ic_' + image + '_black_24dp.png', label: ''});
      });
    }
  }
});

CLASS({
  package: 'com.google.mail',
  name: 'QueryParser',
  documentation: 'Provides a modified QueryParser so that label ids are looked up in the EMailLabels DAO',

  requires: [
    'foam.lib.email.EMail'
  ],

  properties: [
    {
      name: 'parser',
      lazyFactory: function() {
        var EMail = this.EMail;
        var parser = {
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

        parser.expr = alt(
          sym('labelMatch'),
          parser.export('expr')
        );

        return parser;
      }
    }
  ]
});

CLASS({
  name: 'MobileController',
  package: 'com.google.mail',
  description: 'Mobile Gmail',
  traits: ['PositionedDOMViewTrait'],

  extendsModel: 'View',

  requires: [
    'AppController',
    'foam.lib.email.EMail',
    'CachingDAO',
    'ContextualizingDAO',
    'DetailView',
    'EMailView',
    'FloatingView',
    'GMailUserInfo',
    'GestureManager',
    'IDBDAO',
    'MDAO',
    'TouchManager',
    'foam.ui.md.ResponsiveAppControllerView',
    'foam.lib.contacts.Contact as Contact',
    'foam.lib.contacts.ContactNetworkDAO as ContactNetworkDAO',
    'CachingDAO',
    'foam.lib.gmail.Sync',
    'foam.lib.gmail.SyncDecorator',
    'foam.core.dao.MergeDAO',
    'foam.core.dao.VersionNoDAO',
    'foam.core.dao.StripPropertiesDAO',
    'PersistentContext',
    'Binding',
    'com.google.mail.FOAMGMailMessage',
    'com.google.mail.GMailMessageDAO',
    'FutureDAO',
    'com.google.mail.GMailToEMailDAO',
    'com.google.mail.GMailRestDAO',
    'com.google.mail.FOAMGMailLabel',
    'BusyStatus',
    'BusyFlagTracker',
    'XHR',
    'com.google.mail.EMailExtensionsAgent',
    'com.google.mail.QueryParser',
    'OAuth2Redirect as EasyOAuth2',
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

  imports: [
    'setInterval'
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
      name: 'busyStatus',
      factory: function() { return this.BusyStatus.create(); }
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
      name: 'controller',
      subType: 'AppController',
      postSet: function(_, controller) {
        var Y = this.controller.X.sub({ data: this.controller });
        var view = this.ResponsiveAppControllerView.create(undefined, Y);
        this.stack.setTopView(view);

        // TODO: Hack for positioned based view delay.
        view.onResize();
      }
    },
    {
      name: 'persistentContext',
      factory: function() {
        var context = {};
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: context
        });
      }
    },
    {
      name: 'remoteDao',
      factory: function() {
        var future = afuture();
        this.persistentContext.bindObject('remoteDao',
                                          this.GMailMessageDAO)(future.set);
        return this.FutureDAO.create({ future: future.get });
      }
    },
    {
      name: 'rawGmailDao',
      factory: function() {
        return this.CachingDAO.create({
          delegate: this.MDAO.create({ model: this.FOAMGMailMessage }),
          src: this.IDBDAO.create({
            model: this.FOAMGMailMessage, useSimpleSerialization: false
          })
        });
      },
      postSet: function(_, dao) {
        dao.select(COUNT())(function(c) {
          if ( c.count === 0 ) {
            this.StripPropertiesDAO.create({
                delegate: this.remoteDao,
                propertyNames: ['historyId']
            }).where(EQ(this.FOAMGMailMessage.LABEL_IDS, 'INBOX')).limit(100).select(dao);
          }
        }.bind(this));
      }
    },
    {
      model_: 'DAOProperty',
      name: 'versionedGmailDao',
      factory: function() {
        return this.VersionNoDAO.create({
          delegate: this.rawGmailDao,
          property: this.FOAMGMailMessage.CLIENT_VERSION
        });
      }
    },
    {
      name: 'emailDao',
      type: 'DAO',
      factory: function() {
        return this.ContextualizingDAO.create({
          delegate: this.CachingDAO.create({
            src: this.GMailToEMailDAO.create({
              delegate: this.versionedGmailDao
            }),
            delegate: this.MDAO.create({ model: this.EMail })
          })
        });
      }
    },
    {
      name: 'emailSync',
      factory: function() {
        var sync = this.Sync.create({
          local: this.SyncDecorator.create({
            delegate: this.MergeDAO.create({
              delegate: this.rawGmailDao,
              mergeStrategy: function(ret, oldValue, newValue) {
                newValue.clientVersion =
                  Math.max(oldValue.clientVersion, newValue.clientVersion);
                ret(newValue);
              }
            })
          }),
          remote: this.remoteDao,
          localVersionProp: this.FOAMGMailMessage.CLIENT_VERSION,
          remoteVersionProp: this.FOAMGMailMessage.HISTORY_ID,
          deletedProp: this.FOAMGMailMessage.DELETED,
          initialSyncWindow: 10
        });

        this.BusyFlagTracker.create({
          busyStatus: this.busyStatus,
          target: sync.syncing$
        });

        return sync;
      }
    },
    {
      name: 'labelDao',
      type: 'DAO',
      factory: function() {
        return this.CachingDAO.create({
          src: this.GMailRestDAO.create({ model: this.FOAMGMailLabel, modelName: 'labels' }),
          delegate: this.MDAO.create({ model: this.FOAMGMailLabel }),
        });
      }
    },
    {
      name: 'contactDAO',
      factory: function() {
        /*
        return this.CachingDAO.create({
          src: this.ContactNetworkDAO.create(),
          cache: this.MDAO.create({ model: this.Contact })
        });
        */
        return this.CachingDAO.create({
          src: this.ContactNetworkDAO.create(),
          delegate: this.IDBDAO.create({
            model: this.Contact,
            useSimpleSerialization: false
          })
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

  constants: {
    SYNC_INTERVAL: 30000
  },

  methods: {
    init: function(args) {
      this.SUPER(args);

      // Install extensions to the EMail model.
      this.EMailExtensionsAgent.create().execute();

      var xhr = this.X.XHR.create({ responseType: 'json' });

      this.versionedGmailDao$Proxy.listen(this.doSync);

      this.setInterval(this.doSync, this.SYNC_INTERVAL);

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

      var sync = this.emailSync;

      this.controller = this.AppController.create({
        model: this.EMail,
        dao: this.emailDao,
        createAction: this.model_.COMPOSE,
        citationView: 'EMailCitationView',
        queryParser: this.QueryParser.create().parser,
        editableCitationViews: true,
        busyStatus: this.busyStatus,
        sortChoices: [
          [ DESC(this.EMail.TIMESTAMP), 'Newest First' ],
          [ this.EMail.TIMESTAMP,       'Oldest First' ],
          [ this.EMail.SUBJECT,         'Subject' ],
        ],
        refreshAction: Action.create({
          name: 'refresh',
          label: '',
          iconUrl: 'icons/ic_refresh_48px.svg',
          isEnabled: function() { return ! sync.syncing; },
          action: function() {
            sync.sync();
          }
        }),
        menuFactory: function() {
          return this.X.MenuView.create({
            topSystemLabelDAO: this.X.LabelDAO
                .where(EQ(this.X.com.google.mail.FOAMGMailLabel.getProperty('type'), 'system'))
                .orderBy(
                  toTop('INBOX'),
                  toTop('STARRED'),
                  toTop('DRAFT')
                )
                .limit(3),
            bottomSystemLabelDAO: this.X.LabelDAO
                .where(AND(EQ(this.X.com.google.mail.FOAMGMailLabel.getProperty('type'), 'system'),
                           NEQ(this.X.com.google.mail.FOAMGMailLabel.ID, 'INBOX'),
                           NEQ(this.X.com.google.mail.FOAMGMailLabel.ID, 'STARRED'),
                           NEQ(this.X.com.google.mail.FOAMGMailLabel.ID, 'UNREAD'),
                           NEQ(this.X.com.google.mail.FOAMGMailLabel.ID, 'DRAFT')))
                .orderBy(toTop('SENT'),
                         toTop('SPAM'),
                         toTop('TRASH')),
            userLabelDAO: this.X.LabelDAO
                .where(NEQ(this.X.com.google.mail.FOAMGMailLabel.getProperty('type'), 'system'))
                .orderBy(this.X.com.google.mail.FOAMGMailLabel.NAME)
          });
        }
      });
      var self = this;
      this.labelDao.where(EQ(this.FOAMGMailLabel.ID, 'INBOX')).select({
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
              id: 'draft_' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16),
              labels: ['DRAFT']
            })
          })
        });
        this.X.stack.pushView(view, undefined, undefined, 'fromRight');
      }
    }
  ],
  listeners: [
    {
      name: 'doSync',
      isMerged: 1000,
      code: function() {
        this.emailSync.sync();
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
    'com.google.mail.FOAMGMailLabel',
    'ProfileView',
    'foam.lib.email.EMail'
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
        var sink = GROUP_BY(this.EMail.LABELS, COUNT());
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
      if ( this.counts.groups[this.data.name] ) this.bindGroup();
      else this.bindCounts();
    },
    bindCounts: function() {
      this.counts.addListener(this.bindGroup);
    }
  },
  listeners: [
    {
      name: 'bindGroup',
      code: function() {
        if ( this.counts.groups[this.data.name] ) {
          this.counts.removeListener(this.bindGroup);
          this.counts.groups[this.data.name].addListener(this.updateCount);
          this.updateCount();
        }
      }
    },
    {
      name: 'updateCount',
      code: function() {
        if ( this.counts.groups[this.data.name] )
          this.count = this.counts.groups[this.data.name].count;
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
