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
    'com.google.ow.content.OrderStream',
    'com.google.ow.content.PreviewStream',
    'com.google.ow.content.Video',
    'com.google.ow.dao.VideoOffloadDAO',
    'com.google.ow.examples.VideoB',
    'com.google.ow.model.ColorableProduct',
    'com.google.ow.model.Envelope',
    'com.google.ow.model.ProductAd',
    'com.google.ow.ui.CustomerOrderCitationView',
    'com.google.ow.ui.CustomerOrderDetailView',
    'com.google.ow.ui.CustomerOrderSummaryView',
    'com.google.ow.ui.EnvelopeCitationView',
    'com.google.ow.ui.EnvelopeDetailView',
    'com.google.ow.ui.MenuView',
    'com.google.ow.ui.MerchantOrderCitationView',
    'com.google.ow.ui.MerchantOrderDetailView',
    'com.google.ow.ui.MerchantOrderSummaryView',
    'com.google.ow.ui.SingleStreamCitationView',
    'com.google.ow.ui.SingleStreamDetailView',
    'com.google.ow.ui.UpdateStreamCitationView',
    'com.google.ow.ui.UpdateStreamDetailView',
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
    'foam.u2.md.ActionButton',
    'foam.u2.md.DAOListView',
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
  imports: [
    'document',
    'currentUserId$',
  ],
  exports: [
    'streamDAO',
    'personDAO',
    'circleDAO', // Note: proxy for currentUser.circles
    'contactsDAO', // Note: proxy for currentUser.contacts
    'currentUser',
    'createStreamItem',
  ],

  properties: [
    {
      name: 'idGenerator',
      lazyFactory: function() {
        return this.IdGenerator.create(null, this.Y);
      },
    },
    ['titleText', 'Lifestream'],
    ['backgroundColor', '#ffffff'],
    ['headerColor', '#3e50b4'],
    {
      name: 'browserConfig',
      lazyFactory: function() {
        var UpdateDetailView = this.UpdateDetailView;
        var browserConfig = this.BrowserConfig.create({
          title$: this.titleText$,
          model: this.Envelope,
          backgroundColor: this.backgroundColor,
          headerColor: this.headerColor,
          dao: this.streamDAO.where(OR(
              NOT(HAS(this.Envelope.SID)),
              EQ(this.Envelope.PROMOTED, true))),
          listView: function(args, X) {
            args.rowView = function(args, X) {
              var obj = args.data || args.data$.get();
              return obj.toE ?
                  obj.toE(this.Y) :
                  obj.toRowE ? obj.toRowE(this.Y) :
                  X.lookup('foam.u2.DetailView').create(args, X);
            };
            return X.lookup('foam.ui.DAOListView').create(args, X);
          }.bind(this),
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
            var envelope = args.data || args.data$.get();
            return envelope.toDetailE ? envelope.toDetailE(X) :
                this.DetailView.create({ data: envelope }, X);
          }.bind(this),
          createFunction: function() { },
          showAdd: false,
        });
        return browserConfig;
      },
    },
    {
      type: 'String',
      name: 'currentUserId',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( ! this.currentUser || nu !== this.currentUser.id ) {
          // There's a delay on boot that caused the fine() to fail. TODO: This listener is pointless
          // after boot, once we have the user loaded.
          this.personDAO.where(EQ(this.Person.ID, nu)).pipe({ put: function(user) {
            this.currentUser = user;
          }.bind(this) });
        }
      },
    },
    {
      name: 'currentUser',
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu ) {
          if ( nu.id !== this.currentUserId ) this.currentUserId = nu.id;
          this.circleDAO.delegate = nu.circles;
          this.contactsDAO.delegate = nu.contacts;
        }
      }
    },
    {
      name: 'streamDAO',
      lazyFactory: function() {
        var dao = this.EasyDAO.create({
          daoType: 'MDAO',
          model: this.Envelope,
          guid: true,
          cloning: true,
          contextualize: true,
          dedup: true,
          sockets: true,
          syncWithServer: true,
          // logging: true,
        }).orderBy(this.Envelope.TIMESTAMP);
        dao.listen({
          put: function(e) {
            console.log('Put', e.toString());
          },
        });
        return dao;
      }
    },
    {
      name: 'personDAO',
      lazyFactory: function() {
        // TODO(markdittmer): This should be an authorized collection of peopl
        // the current user may know about.
        return this.EasyDAO.create({
          daoType: 'MDAO',
          model: this.Person,
          cloning: true,
          contextualize: true,
          dedup: true,
          sockets: true,
          syncWithServer: true,
        });
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
    {
      type: 'Function',
      name: 'createStreamItem',
      hidden: true,
      factory: function() {
        return function(source, data, opt_sid) {
          var srcId = source.id || source;
          var tgtId = this.currentUser.id;
          return this.Envelope.create({
            owner: tgtId,
            source: srcId,
            data: data,
            sid: opt_sid || data.sid || '',
            substreams: data.substreams || [],
          });
        }.bind(this);
      },
    },

  ],

  methods: [
    function init() {
      this.Y.registerModel(this.ActionButton, 'foam.u2.ActionButton');
      this.SUPER();
      var WebSocket = this.AuthenticatedWebSocketDAO.xbind({
        authToken$: this.currentUserId$,
      });
      this.Y.registerModel(WebSocket, 'foam.core.dao.WebSocketDAO');

      // hack to fix missing updates when the server creates new streamDAO items
      // var pollEnvelope = this.Envelope.create({ owner: this.currentUser.id, id: 'pollEnv1212', data: {id:'fake' }, sid: 'fakeSID34343434434' });
      // this.X.setInterval(function() {
      //   pollEnvelope.owner = this.currentUser.id;
      //   this.streamDAO.put(pollEnvelope)
      // }.bind(this), 1000);

      // TODO(markdittmer): Bring this back once we fully u2-ify our MD styles.
      // this.SharedStyles.create(null, this.Y);
    },
  ],
});
