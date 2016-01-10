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
  name: 'TopicApp',
  extends: 'foam.browser.ui.BrowserView',

  requires: [
    'com.google.watlobby.Topic',
    'com.google.watlobby.TopicCitationView',
    'com.google.watlobby.TopicDAO',
    'com.google.watlobby.TopicDetailView',
    'foam.browser.BrowserConfig',
    'foam.browser.ui.DAOController',
    'foam.core.dao.AuthenticatedWebSocketDAO',
    'foam.core.dao.ChromeStorageDAO',
    'foam.dao.EasyDAO',
    'foam.dao.FutureDAO',
    'foam.mlang.CannedQuery',
    'foam.oauth2.GoogleSignIn2 as GoogleSignIn',
    'foam.ui.TextFieldView',
    'foam.ui.Tooltip',
    'foam.ui.md.CannedQueryCitationView',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.DAOListView',
    'foam.ui.md.PopupView'
  ],

  imports: [ 'dao' ],

  templates: [
    function CSS() {/*
      body { color: #555; }
      .md-detail-view image-picker { min-height: 250px; }
      .md-detail-view { overflow-y: auto; }
      .md-text-field-input { width: 100%; }
      .md-text-field-label { color: #999; }
      .radioLabel, .toggle-text-indicator { font-size: 16px !important; }
      .toggle-label { color: #333; font-size: 17px; }
    */}
  ],

  properties: [
    {
      type: 'Boolean',
      name: 'clientMode',
      defaultValue: true
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

          this.daoFuture.set(
            this.TopicDAO.create({ clientMode: this.clientMode }));
        }.bind(this));
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.BrowserConfig.create({
          title: 'WAT Lobby Admin',
          model: this.Topic,
          dao: this.dao,
          innerDetailView: 'com.google.watlobby.TopicDetailView',
          listView: {
            factory_: 'foam.ui.md.DAOListView',
            rowView: 'com.google.watlobby.TopicCitationView',
            minWidth: 450,
            preferredWidth: 550,
            maxWidth: 550
          },
          cannedQueryDAO: [
            this.CannedQuery.create({
              label: 'Everything',
              expression: TRUE
            }),
            this.CannedQuery.create({
              label: 'Enabled',
              expression: EQ(this.Topic.ENABLED, true)
            }),
            this.CannedQuery.create({
              label: 'Disabled',
              expression: EQ(this.Topic.ENABLED, false)
            })
          ]
        });
      }
    }
  ]
});
