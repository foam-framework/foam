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
  package: 'com.google.watlobby',
  name: 'AuthApp',
  extends: 'foam.browser.ui.BrowserView',
  requires: [
    'foam.browser.BrowserConfig',
    'foam.dao.auth.Account',
    'com.google.watlobby.AccountCitationView',
    'foam.ui.md.DAOListView',
    'foam.dao.EasyClientDAO',
    'foam.oauth2.GoogleSignIn2 as GoogleSignIn',
    'foam.core.dao.AuthenticatedWebSocketDAO',
    'foam.dao.FutureDAO'
  ],
  imports: [
    'document'
  ],
  properties: [
    {
      name: 'dao',
      factory: function() {
        return
      }
    },
    {
      name: 'dao',
      lazyFactory: function() {
        return this.FutureDAO.create({
          future: this.daoFuture.get
        });
      }
    },
    {
      name: 'daoFuture',
      factory: function() {
        return afuture();
      }
    },
    {
      name: 'auth',
      factory: function() {
        return this.GoogleSignIn.create({
          googleClientId: '495935970762-bmf0no7rttrjnobccog7a4cbnj9irm17.apps.googleusercontent.com',
        });
      },
      postSet: function(_, auth) {
        // TODO(adamvy): there has to be a better way for this.
        auth.alogin(function() {
          var WebSocket = this.AuthenticatedWebSocketDAO.xbind({
            authToken: auth.authToken_.token
          });
          this.Y.registerModel(WebSocket, 'foam.core.dao.WebSocketDAO')

          this.daoFuture.set(this.EasyClientDAO.create({
            daoType: 'MDAO',
            sockets: true,
            serverUri: this.document.location.origin + '/api',
            model: this.Account,
            reconnectPeriod: 5000
          }));
        }.bind(this));
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.BrowserConfig.create({
          title: 'WAT Lobby Users',
          model: this.Account,
          dao: this.dao,
          listView: {
            factory_: 'foam.ui.md.DAOListView',
            rowView: 'com.google.watlobby.AccountCitationView'
          }
        });
      }
    }
  ]
});
