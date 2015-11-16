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
  package: 'com.google.ow',
  name: 'Client',

  requires: [
    'MDAO',
    'com.google.ow.IdGenerator',
    'com.google.ow.examples.VideoB',
    'com.google.ow.model.ColorableProduct',
    'com.google.ow.model.Envelope',
    'com.google.ow.model.ProductAd',
    'com.google.ow.ui.EnvelopeCitationView',
    'com.google.ow.ui.MenuView',
    'com.google.plus.Circle',
    'com.google.plus.Person',
    'com.google.plus.ShareList',
    'foam.browser.BrowserConfig',
    'foam.browser.ui.DAOController',
    'foam.core.dao.AuthenticatedWebSocketDAO',
    'foam.dao.EasyClientDAO',
    'foam.dao.EasyDAO',
    'foam.dao.FutureDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.ProxyDAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.CannedQuery',
    'foam.mlang.PropertySequence',
    'foam.tutorials.todo.model.Todo',
    'foam.tutorials.todo.ui.TodoCitationView',
    'foam.u2.DAOListView',
    'foam.u2.DetailView',
    'foam.ui.DAOListView',
    'foam.ui.TextFieldView',
    'foam.ui.Tooltip',
    'foam.ui.md.CannedQueryCitationView',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.PopupView',
    'foam.ui.md.UpdateDetailView',
    // TODO(markdittmer): Bring this back once we fully u2-ify our MD styles.
    // 'foam.u2.md.SharedStyles',
  ],
  imports: [ 'document' ],
  exports: [
    'streamDAO',
    'personDAO',
    'circleDAO', // Note: proxy for currentUser.circles
    'contactsDAO', // Note: proxy for currentUser.contacts
    'currentUser$',
  ],

  properties: [
    {
      name: 'idGenerator',
      lazyFactory: function() {
        return this.IdGenerator.create(null, this.Y);
      },
    },
    {
      name: 'browserConfig',
      lazyFactory: function() {
        var UpdateDetailView = this.UpdateDetailView;
        var browserConfig = this.BrowserConfig.create({
          title: 'Lifestream',
          model: this.Envelope,
          dao: this.streamDAO.where(NOT(HAS(this.Envelope.SID))),
          listView: 'foam.u2.DAOListView',
          cannedQueryDAO: [
            this.CannedQuery.create({
              label: 'All',
              expression: TRUE,
            }),
          ],
          menuFactory: function() {
            var view = this.MenuView.create({ data: this }, this.Y);
            view.subscribe(view.MENU_CLOSE, function() {
              browserConfig.publish(browserConfig.MENU_CLOSE);
            });
            return view;
          }.bind(this),
          detailView: function(args, X) {
            var v = UpdateDetailView.create(args, X);
            v.title = (args.data && args.data.data) ? args.data.data.titleText
                        : this.title;
            v.liveEdit = true;
            return v;
          },
          innerDetailView: function(args, X) {
            // TODO(markdittmer): This should be more robust.
            var d = (args.data || args.data$.get()).data;
            return d && d.toDetailE ? d.toDetailE(X) :
                this.DetailView.create({ data: d }, this.Y);
          }.bind(this)
        });
        return browserConfig;
      },
    },
    'currentUserId',
    {
      name: 'currentUser',
      postSet: function(old, nu) {
        if (nu) {
          this.currentUserId = nu.id;
          this.circleDAO.delegate = nu.circles;
          this.contactsDAO.delegate = nu.contacts;
        }
      }
    },
    {
      name: 'streamDAO',
      lazyFactory: function() {
        return this.LoggingDAO.create({ delegate: this.EasyClientDAO.create({
          serverUri: this.document.location.origin + '/api',
          model: this.Envelope,
          sockets: true,
        }, this.Y) }, this.Y);
      }
    },
    {
      name: 'personDAO',
      lazyFactory: function() {
        // TODO(markdittmer): This should be an authorized collection of peopl
        // the current user may know about.
        return this.LoggingDAO.create({ delegate: this.EasyClientDAO.create({
          serverUri: this.document.location.origin + '/api',
          model: this.Person,
          sockets: true,
        }, this.Y) }, this.Y);
      }
    },
    {
      name: 'circleDAO',
      type: 'com.google.plus.Circle',
      factory: function() {
        return this.ProxyDAO.create({ model: this.Circle, delegate: [].dao }, this.Y);
      },
    },
    {
      name: 'contactsDAO',
      type: 'com.google.plus.Person',
      factory: function() {
        return this.ProxyDAO.create({ model: this.Person, delegate: [].dao }, this.Y);
      },
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      var WebSocket = this.AuthenticatedWebSocketDAO.xbind({
        authToken$: this.currentUserId$,
      });
      this.Y.registerModel(WebSocket, 'foam.core.dao.WebSocketDAO');

      // TODO(markdittmer): Bring this back once we fully u2-ify our MD styles.
      // this.SharedStyles.create(null, this.Y);
    },
  ],
});
