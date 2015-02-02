CLASS({
  name: 'MobileController',
  package: 'com.google.mail',
  description: 'Mobile Gmail',
  traits: ['PositionedDOMViewTrait'],

  extendsModel: 'View',

  requires: [
    'AppController',
    'com.google.mail.MenuView',
    'foam.lib.email.EMail',
    'CachingDAO',
    'ContextualizingDAO',
    'DetailView',
    'com.google.mail.EMailView',
    'com.google.mail.EMailCitationView',
    'com.google.mail.ProfileView',
    'FloatingView',
    'com.google.mail.GMailUserInfo',
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
    'com.google.mail.ComposeView',
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
    'stack',
    'openComposeView'
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

    openComposeView: function(X, email) {
      var view  = X.FloatingView.create({
        view: this.ComposeView.create({
          data: email,
        }, this.controller.X)
      });
      this.stack.pushView(view, undefined, undefined, 'fromRight');
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
        citationView: 'com.google.mail.EMailCitationView',
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
          return self.MenuView.create({
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
          view: this.X.com.google.mail.ComposeView.create({
            data: this.X.foam.lib.email.EMail.create({
              id: 'draft_' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16),
              labels: ['DRAFT']
            })
          }, this.X)
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
