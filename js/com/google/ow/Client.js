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
    'com.google.ow.model.Envelope',
    'com.google.ow.model.Image',
    'com.google.ow.model.ColorableProduct',
    'com.google.ow.model.ProductAd',
    'com.google.ow.ui.EnvelopeCitationView',
    'com.google.plus.Person',
    'com.google.plus.Circle',
    'foam.browser.BrowserConfig',
    'foam.browser.ui.DAOController',
    'foam.dao.EasyDAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.CannedQuery',
    'foam.tutorials.todo.model.Todo',
    'foam.tutorials.todo.ui.TodoCitationView',
    'foam.ui.DAOListView',
    'foam.ui.md.DAOListView',
    'foam.ui.TextFieldView',
    'foam.ui.Tooltip',
    'foam.ui.md.CannedQueryCitationView',
    'foam.ui.md.CheckboxView',
    'foam.ui.md.PopupView',
    'foam.u2.DetailView',
    'com.google.ow.Server', // for fake internal server
    // TODO(markdittmer): Bring this back once we fully u2-ify our MD styles.
    // 'foam.u2.md.SharedStyles',
  ],
  exports: [ 
    'streamDAO',
    'personDAO',
    'circleDAO', // Note: a convenient proxy for currentUser.circles
    'currentUser',
  ],

  properties: [
    {
      name: 'browserConfig',
      lazyFactory: function() {
        return this.BrowserConfig.create({
          title: 'Lifestream',
          model: this.Envelope,
          dao: this.streamDAO.where(NOT(HAS(this.Envelope.SID))),
          listView: {
            factory_: 'foam.ui.md.DAOListView',
            rowView: 'com.google.ow.ui.EnvelopeCitationView'
          },
          cannedQueryDAO: [
            this.CannedQuery.create({
              label: 'All',
              expression: TRUE,
            }),
          ],
          innerDetailView: function(args, X) {
            // TODO(markdittmer): This should be more robust.
            var d = (args.data || args.data$.get()).data;
            return d && d.toDetailE ? d.toDetailE() :
                this.DetailView.create({ data: d }, this.Y);
          }.bind(this)
        });
      },
    },
    {
      name: 'currentUser',
      postSet: function(old, nu) {
        if (nu) {
          this.streamDAO.delegate = this.fakeInternalServer.streamDAO.where(EQ(this.Person.ID, nu.id));
          this.circleDAO.delegate = nu.circles;
        }
      }
    },
    {
      name: 'streamDAO',
      lazyFactory: function() {
        return this.ProxyDAO.create({ delegate: [].dao });
      }
    },
    {
      name: 'personDAO',
      lazyFactory: function() {
        return this.fakeInternalServer.personDAO;
      }
    },
    {
      name: 'circleDAO',
      type: 'com.google.plus.Circle',
      factory: function() {
        return this.ProxyDAO.create({ delegate: [].dao });
      },
    },
    {
      name: 'fakeInternalServer',
      lazyFactory: function() {
        var sX = GLOBAL.sub({
          exportDAO: function(dao) {
            console.log("Fake-exporting fake server dao", dao.name);
          }.bind(this)
        });
        
        var serv = this.Server.create({}, sX);
        
        return serv;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      // TODO(markdittmer): Bring this back once we fully u2-ify our MD styles.
      // this.SharedStyles.create(null, this.Y);
      
      this._populate_test_data_();
    },
    function _populate_test_data_() {
      var self = this;

      // create test user pool
      var personTestArray = [];
      [
        ['Henry', 'Joe', 'Carvil'],
        ['Sammy', 'Davis', 'Junior'],
        ['Herbert', '', 'Hoover'],
        ['Jerry', '', 'Seinfeld'],
        ['Samwise', '', 'Gamgee'],
        ['Norman', 'J', 'Bates'],
        ['Doctor', '', 'Who'],
        ['Charleton', '', 'Heston'],
      ].forEach(function(name) {
        self.personDAO.put(self.Person.create({
          givenName: name[0],
          middleName: name[1],
          familyName: name[2],
        }), {
          put: function(p) { personTestArray.put(p); }
        });
      });
      self.currentUser = personTestArray[0];

      // create some circles for currentUser
      [
        ['family', [0,1,2]],
        ['friends', [3,4]],
        ['neigbors', [4,5,6,7]],
      ].forEach(function(c) {
        var nu = self.Circle.create({
          //owner: self.currentUser.id,
          id: c[0],
          displayName: c[0],
        });
        c[1].forEach(function(pIdx) {
          nu.people.put(personTestArray[pIdx]);
        });
        self.currentUser.circles.put(nu);
      });

      self.streamDAO.put(
        self.Envelope.create({ source: personTestArray[1], owner: self.currentUser, data: "Data A" })
      );
    },
  ],
});
