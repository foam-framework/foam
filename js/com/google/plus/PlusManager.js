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
  name: 'PlusManager',
  package: 'com.google.plus',

  requires: [
    'com.google.plus.Person',
    'com.google.plus.Circle',
    'com.google.plus.ShareableTrait',
    'foam.dao.EasyDAO',
    'com.google.plus.ui.PersonCitationView',
    'com.google.plus.ui.CircleCitationView',
    'foam.ui.md.DAOListView',
    'foam.ui.md.DetailView',
    'foam.ui.ArrayView',
    'foam.dao.ProxyDAO',
    'foam.ui.md.CitationView',
  ],

  exports: [
    'personDAO',
    'circleDAO',
    'streamDAO',
    'createStreamItem',
  ],

  documentation: function() {/* Manages circles setup. Extend into client and
    server versions, where the client only ever sees the currentUser's circles
    and is untrusted, and the server handles filtering out notifications based
    on mutual circleship. */},

  models: [
    {
      name: 'TestStreamItem',
      extends: 'com.google.ow.model.Envelope',
      traits: [ 'com.google.plus.ShareableTrait' ],
      templates: [
        function toDetailHTML() {/*
          <div id="%%id" <%= this.cssClassAttr() %> >
            $$data{ floatingLabel: false, mode: 'read-only' }
          </div>
        */}
      ]
    }
  ],

  properties: [
    {
      name: 'personDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.Person,
          name: 'people',
          daoType: MDAO,
//          cache: true,
          guid: true,
        });
      },
      view: { factory_: 'foam.ui.md.DAOListView', rowView: 'com.google.plus.ui.PersonCitationView' },
    },
    {
      name: 'circleDAO',
      factory: function() {
        return this.ProxyDAO.create({ delegate: [].dao });
      },
      view: { factory_: 'foam.ui.md.DAOListView', rowView: 'com.google.plus.ui.CircleCitationView' },
    },
    {
      type: 'com.google.plus.Person',
      name: 'currentUser',
      postSet: function(old, nu) {
        // if person changed, update personDAO and use the result
        if (! equals(old, nu) ) {
          this.personDAO.put(nu, {
            put: function(p) {
              this.currentUser = p;
              this.circleDAO.delegate = this.currentUser.circles;
            }.bind(this),
            //TODO: error case, keep old?
          });
        }
      },
      view: 'com.google.plus.ui.PersonDetailView',
    },
    {
      name: 'streamDAO',
      factory: function() {
        return this.EasyDAO.create({
          model: this.TestStreamItem,
          name: 'streams',
          daoType: MDAO,
          guid: true,
        });
      },
      view: { factory_: 'foam.ui.md.DAOListView', rowView: 'foam.ui.md.DetailView' },
    },
    {
      type: 'Function',
      name: 'createStreamItem',
      hidden: true,
      factory: function() {
        return function(source, target, data) {
          return this.TestStreamItem.create({
            owner: target,
            source: source,
            data: data,
          });
        }.bind(this);
      },
    },
  ],


  methods: [
    function init() {
      this._populate_test_data_();
    },

    function _populate_test_data_() {
      var self = this;

      // create a current user
      self.currentUser = self.Person.create({
        givenName: 'John',
        middleName: 'Q.',
        familyName: 'Public',
      });

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
        self.createStreamItem(personTestArray[1], self.currentUser, "Data A")
      );
    },
  ],
});
