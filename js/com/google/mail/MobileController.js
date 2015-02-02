CLASS({
  name: 'MobileController',
  package: 'com.google.mail',
  description: 'Mobile Gmail',
  traits: ['PositionedDOMViewTrait'],

  extendsModel: 'View',

  requires: [
    'AppController',
    'BusyFlagTracker',
    'BusyStatus',
    'CachingDAO',
    'DetailView',
    'FloatingView',
    'GestureManager',
    'IDBDAO',
    'MDAO',
    'OAuth2Redirect as EasyOAuth2',
    'TouchManager',
    'XHR',
    'com.google.mail.ComposeView',
    'com.google.mail.EMailCitationView',
    'com.google.mail.EMailDAO',
    'com.google.mail.EMailExtensionsAgent',
    'com.google.mail.EMailView',
    'com.google.mail.FOAMGMailLabel',
    'com.google.mail.GMailRestDAO',
    'com.google.mail.GMailUserInfo',
    'com.google.mail.MenuView',
    'com.google.mail.ProfileView',
    'com.google.mail.QueryParser',
    'foam.lib.contacts.Contact as Contact',
    'foam.lib.contacts.ContactNetworkDAO as ContactNetworkDAO',
    'foam.lib.email.EMail',
    'foam.ui.md.ResponsiveAppControllerView'
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
      name: 'emailDao',
      factory: function() { return this.EMailDAO.create(); },
      postSet: function(_, dao) {
        if ( dao.sync ) {
          this.BusyFlagTracker.create({
            busyStatus: this.busyStatus,
            target: dao.sync.syncing$
          });
        }
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

      var sync = this.emailDao.sync;

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
  ],
  templates: [
    function CSS() {/*
.mdui-app-controller .header {
  background: #db4437;
}

.mdui-app-controller.searchMode .header .search {
  background: #db4437;
}

.header canvas {
  background: #db4437;
}

.email-view .header {
  background: #db4437;
}

input[name=q] {
  background: #db4437;
}

table {
  border-spacing: 0;
}

* {
  box-sizing: border-box;
}

body, tbody, tr, td {
  margin: 0;
  padding: 0;
}

hr {
  border-top: 1px solid rgba(0,0,0,.1);
  border: none;
  height: 1px;
  margin: 0;
  padding: 0;
  background: rgba(0,0,0,.1);
}

a {
  text-decoration: none;
  color: #4285f4;
}

.actionButton {
  padding: 8px;
  vertical-align: middle;
  background: #db4437;
  border: none;
  -webkit-box-shadow: none;
  box-shadown: none;
  opacity: 0.76;
  outline: none;
}

.actionButton img {
  height: 24px;
  opacity: 0.76;
  width: 24px;
}

.popupChoiceList {
  box-shadow: 0 0 2px 2px rgba(0,0,0,.1), 0 0 3px 1px rgba(0,0,0,.1);
  border: none;
  border-radius: 2px;
  padding: 8px 0;
  min-width: 190px;
}

.popupChoiceList li {
  color: rgba(0, 0, 0, 0.54);
  font-size: 16px;
  padding: 16px;
  margin: 0;
  line-height: 16px;
}

.popupChoiceList li.selected {
  color: #e51c23;
}

.star {
  flex-shrink: 0;
  -webkit-flex-shrink: 0;
  height: 24px;
  opacity: 0.76;
  vertical-align: middle;
  width: 24px;
  margin-top: auto;
}

.hide {
  display: none;
}

::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.actionButton-leaveSearchMode, .actionButton-back {
  margin: 4px;
}

.actionButton-leaveSearchMode img, .actionButton-back img {
  margin: 4px;
  opacity: 0.76;
}

select[name=sortOrder] {
  align-self: center;
  -webkit-align-self: center;
  margin: 20px;
}


.swipeAltOuter {
  -webkit-flex-grow: 1;
  flex-grow: 1;
}

.swipeAltInner {
  padding-top: 8px;
}

span[name=projectName] {
  align-self: center;
  -webkit-align-self: center;
  color: white;
  flex: 1.0;
  -webkit-box-flex: 1.0;
  vertical-align: middle;
  font-size: 20px;
  font-weight: 500;
  margin-left: 16px;
}

.stackview {
  height: 100%;
}

.stackview table {
  height: 100%;
}

.stackview_navbar {
  display: none;
}

.stackview_navactions {
  display: none;
}

.stackview-previewarea-td {
  display: none;
}

.stackview-viewarea {
  height: 100%;
}

.actionButton-save {
  border: none;
  margin-right: 40px;
}

.status-icon {
  height: 24px;
  margin: 0 24px 0 0;
  opacity: 0.54;
  padding: 2px;
  width: 24px;
}

select[name=pri], select[name=status] {
  background: white;
  border-color: white;
  width: 250px;
  height: 30px;
  margin-left: 30px;
  margin-top: 16px;
  outline: none;
}

.actionButton-changeProject {
  margin: 4px;
}

.swipeAltHeader {
  height: 36px;
}

.swipeAltHeader li {
  font-size: 14px;
  opacity: 0.8;
  line-height: 48px;
  padding-bottom: 14px;
}

.swipeAltHeader .selected {
  border-bottom: 2px solid #ff3f80;
  color: white;
  font-weight: 500;
  opacity: 1;
}

ul.swipeAltHeader {
  background: #db4437;
  box-shadow: 0 1px 1px rgba(0,0,0,.25);
  color: white;
  height: 48px;
  margin: 0;
  overflow: hidden;
  padding: 0 0 0 56px;
}

.actionButton {
  width: 48px;
  height: 48px;
  background: transparent;
}

.foamChoiceListView {
  padding: 14px 16px;
  margin: 0;
}

.stackview-slidearea {
   box-shadow: 1px 0px 1px 1px rgba(0,0,0,.2);
}


.email-view .monogram-string-view {
  margin: auto 6px auto 0;
}

.email-view .header {
  background: #db4437;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 2;
  box-shadow: 0 1px 1px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.15);
  display: flex;
  display: -webkit-flex;
}

.email-view .header .actionButton {
  margin: 4px;
}

.email-view .from {
  font-size: 14px;
  font-weight: bold;
  display: block;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.email-view .details {
  font-size: 12px;
  color: rgb(119, 119, 119);
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.email-view .content {
  margin-top: 62px;
  margin-left: 18px;
  margin-right: 18px;
  word-break: break-word;
}

.email-view .subject {
  color: #fff;
  display: block;
  font-size: 20px;
  line-height: 28px;
  margin: auto;
  overflow-x: hidden;
  padding: 0px 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  -webkit-box-flex: 1.0;
}

.email-view .body {
  white-space: pre-wrap;
  margin-top: 20px;
  display: block;
}

.email-compose-view .header {
  background: #db4437;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 2;
  box-shadow: 0 1px 1px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.15);
  display: flex;
  display: -webkit-flex;
}

.email-compose-view .header .actionButton {
  margin: 4px;
}

.email-compose-view .content {
  margin-top: 62px;
  margin-left: 6px;
  margin-right: 6px;
}

.email-compose-view .to {
}

.email-compose-view .cc {
}

.email-compose-view .bcc {
}

.email-compose-view .subject {
  color: #fff;
  display: block;
  font-size: 20px;
  line-height: 28px;
  margin: auto;
  overflow-x: hidden;
  padding: 0px 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  -webkit-box-flex: 1.0;
}

.email-compose-view .richtext {
  height: 300px;
}
  */}
  ]
});
