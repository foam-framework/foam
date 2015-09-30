/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'MobileController',
  package: 'com.google.mail',
  description: 'Mobile Gmail',

  extendsModel: 'foam.browser.ui.BrowserView',

  requires: [
    'MDAO',
    'XHR',
    'com.google.mail.ComposeView',
    'com.google.mail.EMailCitationView',
    'com.google.mail.EMailDAO',
    'com.google.mail.EMailView',
    'com.google.mail.FOAMGMailLabel',
    'com.google.mail.GMailRestDAO',
    'com.google.mail.GMailUserInfo',
    'com.google.mail.MenuView',
    'com.google.mail.ProfileView',
    'com.google.mail.QueryParser',
    'foam.dao.CachingDAO',
    'foam.dao.IDBDAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.CannedQuery',
    'foam.lib.contacts.Contact as Contact',
    'foam.lib.contacts.ContactNetworkDAO as ContactNetworkDAO',
    'foam.lib.email.EMail',
    'foam.oauth2.OAuth2RedirectJsonp as Auth',
    'foam.ui.DetailView',
    'foam.ui.ScrollView',
    'foam.util.busy.BusyFlagTracker',
    'foam.util.busy.BusyStatus',
  ],

  exports: [
    'XHR',
    'contactDAO as ContactDAO',
    'labelDao as LabelDAO',
    'emailDao as EMailDAO',
    'profile$ as profile$',
    'openComposeView',
    'as controller'
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
      name: 'busyStatus',
      factory: function() { return this.BusyStatus.create(); }
    },
    {
      name: 'oauth',
      postSet: function(_, v) {
        v.setJsonpFuture(this.X, this.jsonpFuture);
      },
      factory: function() {
        return this.Auth.create({
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
      name: 'cannedQueryDAO',
      documentation: 'Derived from the labelDao above, this DAO wraps the ' +
          'labels into CannedQuery objects for the menu.',
      factory: function() {
        var proxy = this.ProxyDAO.create();
        this.labelDao.listen({
          put: this.buildCannedQueries_,
          remove: this.buildCannedQueries_
        });
        this.buildCannedQueries_();
        return proxy;
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
      name: 'title',
      defaultValue: 'Gmail'
    },
    {
      name: 'cannedQuery',
      factory: function() {
        return this.CannedQuery.create({
          id: 'INBOX',
          label: 'Inbox',
          expression: CONTAINS(this.EMail.LABELS, 'INBOX')
        });
      },
      postSet: function(old, nu) {
        if (nu) this.title = nu.label;
      },
    },
    {
      name: 'data',
      factory: function() {
        var self = this;
        return this.BrowserConfig.create({
          model: this.EMail,
          dao: this.emailDao,
          title$: this.title$,
          headerColor: '#db4437',
          listView: {
            // TODO(braden): Get ScrollView working nicely in the browser.
            factory_: 'foam.ui.ScrollView',
            rowView: 'com.google.mail.EMailCitationView'
          },
          detailView: {
            factory_: 'foam.ui.md.UpdateDetailView',
            immutable: true
          },
          innerDetailView: 'com.google.mail.EMailView',
          queryParser: this.QueryParser.create().parser,
          busyStatus: this.busyStatus,
          sortChoices: [
            [ DESC(this.EMail.TIMESTAMP), 'Newest First' ],
            [ this.EMail.TIMESTAMP,       'Oldest First' ],
            [ this.EMail.SUBJECT,         'Subject' ],
          ],
          menuRowView: 'com.google.mail.MenuLabelCitationView',
          menuHeaderView: function(args) {
            return self.ProfileView.create({ data$: self.profile$ }, self.Y);
          },
          menuFactory: function() {
            var dao = this.X.EMailDAO;
            var sink = GROUP_BY(dao.model.LABELS, COUNT());
            dao.select(sink);
            this.Y.counts = sink;
            return this.model_.MENU_FACTORY.defaultValue.call(this);
          },
          cannedQuery$: this.cannedQuery$,
          cannedQueryDAO$: this.cannedQueryDAO$
        });
      }
    },
    {
      name: 'createView',
      defaultValue: function(args, X) {
        return this.X.com.google.mail.ComposeView.create({
          data: this.X.foam.lib.email.EMail.create({
            id: 'draft_' + Math.floor(Math.random() * 0xFFFFFFFF).toString(16),
            labels: ['DRAFT']
          })
        }, X);
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

      var xhr = this.Y.XHR.create({ responseType: 'json' });

      aseq(function(ret) {
        xhr.asend(ret, 'https://www.googleapis.com/oauth2/v1/userinfo');
      })(function(resp) {
        var user = this.GMailUserInfo.create();
        user.fromJSON(resp);
        this.profile = user;
      }.bind(this));
    },

    /*
    open: function(id) {
      var self = this;
      this.emailDao.find(id, {
        put: function(m) {
          m.markRead(self.controller.Y);
          var v = self.FloatingView.create({
            view: self.EMailView.create({ data: m }, self.controller.Y)
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
    */
  },

  actions: [
    {
      name: 'refresh',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAxUlEQVQ4Ed3BPU7CABgA0G8RykkcCP9cEJxRCCF24CROxksQOxmjJ3CgNbFPQ4wppTHMvBdxgYykMoVPmdQwDsyiiY6tY6VUYk6c0vGEvYWxtpaJlQIvfsQpW7zqRoWhDwdRZ4S9bhxx41fUSbGII+b+RJ0M46gwUxF1CrTjfAq043yeMYnzucddNLDGbdQZKOV6UWOg8OU6Tknxph8V+t6xjCYSj8gtTXUkplZyPLiKZhKpUlVprRX/MbCxkyvsbPTiAn0DBHjsbF9BcVMAAAAASUVORK5CYII=',
      isAvailable: function() { return true; },
      isEnabled: function() {
        this.emailDao;
        if (this.emailDao.withSync) {
          return ! this.emailDao.sync.syncing;
        } else {
          return true;
        }
      },
      code: function() {
        this.emailDao.sync && this.emailDao.sync.sync();
      }
    },
  ],

  listeners: [
    {
      name: 'buildCannedQueries_',
      isMerged: 100,
      code: function() {
        console.log('Building canned queries');
        var dao = this.MDAO.create({ model: this.CannedQuery });
        var self = this;
        var toQuery = function(label, section, order) {
          var cq = self.CannedQuery.create({
            id: label.name,
            label: label.label,
            iconUrl: label.iconUrl,
            expression: CONTAINS(self.EMail.LABELS, label.id)
          });
          if (section) cq.section = section;
          if (order) cq.order = order;
          return cq;
        };

        var fetchLabel = function(id, section, order) {
          self.labelDao.find(id, {
            put: function(label) {
              dao.put(toQuery(label, section, order));
            }
          });
        };

        fetchLabel('INBOX', 1, 1);
        fetchLabel('STARRED', 1, 2);
        fetchLabel('DRAFT', 1, 3);

        fetchLabel('SENT', 2, 1);
        fetchLabel('SPAM', 2, 2);
        fetchLabel('TRASH', 2, 3);
        this.labelDao.where(AND(
            EQ(this.X.com.google.mail.FOAMGMailLabel.getProperty('type'), 'system'),
            NOT(IN(this.X.com.google.mail.FOAMGMailLabel.ID, [
              'INBOX', 'STARRED', 'UNREAD', 'DRAFT', 'SENT', 'SPAM', 'TRASH'
            ])))
        ).select([])(function(arr) {
          arr.forEach(function(label) {
            dao.put(toQuery(label, 2));
          });
        });

        dao.put(this.CannedQuery.create({
          id: 'ALL MAIL',
          label: 'All Mail',
          expression: TRUE,
          section: 3,
          order: 1
        }));

        this.labelDao
            .where(NEQ(this.X.com.google.mail.FOAMGMailLabel.getProperty('type'), 'system'))
            .orderBy(this.X.com.google.mail.FOAMGMailLabel.NAME)
            .select([])(function(arr) {
              arr.forEach(function(label) {
                dao.put(toQuery(label, 3));
              });
            });

        this.cannedQueryDAO.delegate = dao;
      }
    },
    {
      name: 'openComposeView',
      code: function(X, email) {
        X.stack.replaceView(this.ComposeView.create({
          data: email
        }, this.Y));
      }
    },
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
        box-shadow: none;
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
