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
  name: 'EMailServer',
  requires: [
    'com.google.mail.MobileAgent',
    'com.google.mail.EMailSyncAgent',
    'foam.dao.auth.AdminOnlyAuthorizer',
    'foam.dao.AuthorizedDAO',
    'foam.dao.GoogleAuthDAO',
    'foam.lib.email.EMail',
    'foam.dao.auth.Account',
    'foam.dao.EasyDAO',
    'foam.node.dao.JSONFileDAO',
    'foam.oauth2.OAuth2WebServer',
    'foam.core.dao.VersionNoDAO'
  ],
  imports: [
    'exportDAO',
    'addHandler'
  ],
  exports: [
    'rawAccountDAO as accountDAO',
    'rawEmailDAO as emailDAO',
    'clientId'
  ],
  properties: [
    {
      name: 'clientId',
      defaultValue: '406725352531-5500665qnpni7257ml84e33smke2ijjd.apps.googleusercontent.com'
    },
    {
      name: 'clientSecret',
      defaultValue: 'GTqDAbV5lPGyJ6PgXPodRTjk'
    },
    {
      name: "authServer",
      factory: function() {
        return this.OAuth2WebServer.create({
          clientSecret: this.clientSecret
        });
      }
    },
    {
      name: "rawAccountDAO",
      factory: function() {
        var dao = this.EasyDAO.create({
          model: this.Account,
          daoType: 'MDAO',
          cloning: true
        });

        return dao;
      }
    },
    {
      name: 'accountDAO',
      factory: function() {
        var dao = this.AuthorizedDAO.create({
          delegate: this.rawAccountDAO,
          authorizer: this.AdminOnlyAuthorizer.create({
            accountDAO: this.rawAccountDAO
          })
        });

        dao = this.GoogleAuthDAO.create({
          delegate: dao
        })
      }
    },
    {
      name: 'rawEmailDAO',
      factory: function() {
        var dao = this.EasyDAO.create({
          model: this.EMail,
          daoType: 'MDAO',
          guid: true,
          dedup: true,
          autoIndex: true,
          isServer: true
        });

        return dao;
      }
    },
    {
      name: 'authenticatedEmailDAO',
      factory: function() {
        var dao = this.AuthorizedDAO.create({
          delegate: this.VersionNoDAO.create({
            delegate: this.rawEmailDAO,
            property: this.EMail.CLIENT_VERSION
          }),
          model: this.EMail,
          authorizer: this
        });

        dao = this.GoogleAuthDAO.create({
          delegate: dao
        });

        return dao;
      }
    },
    {
      name: 'agentDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.MobileAgent,
          daoType: this.JSONFileDAO.xbind({
            filename: 'mobile_agents.json',
          }),
          guid: true,
          contextualize: true
        })
      }
    },
  ],
  methods: [
    function init() {
      this.agentDAO.pipe({
        put: function(a) {
          this.agentDAO.find(a.id, {
            put: function(a) {
              a.execute();
            }
          });
        }.bind(this)
      });
      this.rawAccountDAO.pipe({
        put: function(account) {
          this.agentDAO.where(EQ(this.EMailSyncAgent.USER, account.id)).removeAll();
          if ( account.refreshToken ) {
            this.agentDAO.put(
              this.EMailSyncAgent.create({
                user: account.id,
                clientId: this.clientId,
                clientSecret: this.clientSecret,
                refreshToken: account.refreshToken
              }));
          }
        }.bind(this)
      });
    },
    function execute() {
      this.exportDAO(this.authenticatedEmailDAO);
      this.addHandler(this.authServer);
    },
    function massageForPut(ret, X, old, obj) {
      ret(obj);
    },
    function massageForRead(ret, X, obj) {
      ret(obj);
    },
    function decorateForSelect(ret, X, dao) {
      ret(dao);
    },
    function shouldAllowRemove(ret, X, obj) {
      ret(true);
    }
  ]
});
