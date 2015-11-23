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
  package: 'com.google.mail',
  name: 'MailClient',
  extends: 'foam.browser.ui.BrowserView',
  requires: [
    'foam.mlang.CannedQuery',
    'com.google.mail.EMailCitationView2',
    'com.google.mail.EMailView2',
    'foam.core.dao.AuthenticatedWebSocketDAO',
    'foam.lib.email.EMail',
    'foam.dao.EasyDAO',
    'com.google.mail.AuthClient',
    'foam.browser.BrowserConfig'
  ],
  properties: [
    {
      name: 'auth',
      factory: function() {
        return this.AuthClient.create({
          clientId: '406725352531-5500665qnpni7257ml84e33smke2ijjd.apps.googleusercontent.com',
          scopes: [
            "openid",
            "profile",
            "email",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.compose"
          ]
        });
      }
    },
    {
      name: 'emailDAOContext',
      factory: function() {
        var Y = this.Y.sub();

        Y.registerModel({
          __proto__: this.AuthenticatedWebSocketDAO.__proto__,
          create: this.makeWebSocketDAO.bind(this)
        }, 'foam.core.dao.WebSocketDAO');
      }
    },
    {
      name: 'emailDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.EMail,
          daoType: 'MDAO',
          guid: true,
          cloning: true,
          contextualize: true,
          syncWithServer: true,
          sockets: true
        });
      }
    },
    {
      name: 'cannedQueryDAO',
      factory: function() {
        var dao = this.EasyDAO.create({
          model: this.CannedQuery,
          seqNo: true,
          daoType: 'MDAO'
        });

        [
          this.CannedQuery.create({
            label: "Inbox",
            order: 1,
            expression: CONTAINS(this.EMail.LABELS, 'INBOX')
          }),
          this.CannedQuery.create({
            label: "All Mail",
            order: 2,
            expression: NOT(OR(
              CONTAINS(this.EMail.LABELS, 'SPAM'),
              CONTAINS(this.EMail.LABELS, 'TRASH'),
              CONTAINS(this.EMail.LABELS, 'SENT')))
          }),
          this.CannedQuery.create({
            label: "Starred",
            order: 3,
            expression: CONTAINS(this.EMail.LABELS, 'STARRED')
          })
        ].select(dao);

        return dao;
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.BrowserConfig.create({
          title: 'GMail Lite',
          model: this.EMail,
          dao: this.emailDAO,
          cannedQueryDAO: this.cannedQueryDAO,
          listView: {
            factory_: 'foam.ui.DAOListView',
            rowView: 'com.google.mail.EMailCitationView2',
            minWidth: 350,
            preferredWidth: 500,
            maxWidth: 500
          },
          innerDetailView: 'com.google.mail.EMailView2'
        });
      }
    }
  ],
  methods: [
    function init() {
      this.SUPER();
      this.auth.go();
    },
    function makeWebSocketDAO(args, X) {
      var dao = this.AuthenticatedWebSocketDAO.create(args, X);
      Events.follow(dao.authToken$, this.auth.idToken$);
      return dao;
    }
  ]
});
