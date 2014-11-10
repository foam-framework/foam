/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

MODEL({
  name: 'PhoneNumber',
  ids: ['type'],
  properties: [
    {
      model_: 'StringProperty',
      name: 'type'
    },
    {
      model_: 'StringProperty',
      name: 'number'
    }
  ]
});

MODEL({
  name: 'Address',
  ids: [ 'type' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'type'
    },
    {
      model_: 'StringProperty',
      name: 'poBox',
      label: 'P.O. Box',
      displayWidth: 70
    },
    {
      model_: 'StringProperty',
      name: 'street',
      displayWidth: 70
    },
    {
      model_: 'StringProperty',
      name: 'localArea',
      displayWidth: 70
    },
    {
      model_: 'StringProperty',
      name: 'city',
      displayWidth: 70
    },
    {
      model_: 'StringProperty',
      name: 'county',
      label: 'County / Area',
      displayWidth: 70
    },
    {
      model_: 'StringProperty',
      name: 'postalCode',
      displayWidth: 12
    },
    {
      model_: 'StringProperty',
      name: 'country',
      displayWidth: 40
    }
  ]
});

MODEL({
  name: 'ContactAvatarNetworkDAO',
  extendsModel: 'AbstractDAO',

  requires: [
    'Contact',
    'XHR'
  ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'baseUrl',
      defaultValue: 'https://www.google.com/m8/feeds/photos/media/default/'
    }
  ],

  methods: {
    find: function(id, sink) {
      var xhr = this.XHR({ responseType: 'blob' });
      var self = this;
      aseq(
        function(ret) {
          xhr.asend(ret, self.baseUrl + id);
        },
        function(ret, blob, xhr) {
          if ( xhr.status === 404 ) {
            blob = '';
          }

          if ( code !== 200 && code !== 404 ) {
            sink && sink.error && sink.error('find', id);
            ret();
            return;
          }

          if ( blob ) {
            var reader = new FileReader();
            reader.onloadend = function() {
              ret(reader.result);
            };
            reader.readAsDataURL(blob);
            return;
          }
          ret();
        },
        function(ret, data) {
          sink && sink.put && sink.put(self.Contact({
            id: id,
            avatar: data
          }));
          ret();
        })(function(){});
    }
  }
});

MODEL({
  name: 'Contact',

  properties: [
    {
      model_: 'StringProperty',
      name: 'id'
    },
    {
      model_: 'StringProperty',
      displayWidth: 50,
      name: 'title'
    },
    {
      model_: 'DateTimeProperty',
      factory: function() { return new Date(); },
      name: 'updated'
    },
    {
      model_: 'StringProperty',
      name: 'prefix'
    },
    {
      model_: 'StringProperty',
      name: 'first'
    },
    {
      model_: 'StringProperty',
      name: 'middle'
    },
    {
      model_: 'StringProperty',
      name: 'last'
    },
    {
      model_: 'StringProperty',
      name: 'suffix'
    },
    {
      model_: 'StringProperty',
      name: 'displayName',
      defaultValueFn: function() {
        // TODO: i18n and add middle/prefix/suffix when applicable.
        if ( this.title.length > 0 )
          return this.title;

        if ( this.first.length > 0 || this.last.length > 0 )
          return this.first + ' ' + this.last;

        return this.email;
      }
    },
    {
      model_: 'EMailProperty',
      name: 'email',
      label: ''
    },
    {
      model_: 'ArrayProperty',
      name: 'phoneNumbers',
      subType: 'PhoneNumber'
    },
    {
      model_: 'ArrayProperty',
      name: 'addresses',
      subType: 'Address'
    },
    {
      model_: 'DateProperty',
      name: 'birthday'
    },
    {
      model_: 'URLProperty',
      displayWidth: 70,
      name: 'url'
    },
    {
      name: 'avatar',
      type: 'String',
      view: 'ImageView',
      defaultValueFn: function() {
        var key = this.title ? this.title[0].toUpperCase() : (
          this.email ? this.email[0].toUpperCase() : '' );
        return this.generateAvatar(key);
      }
    },
    {
      model_: 'StringProperty',
      name: 'note',
      displayHeight: 10
    }
  ],

  methods: {
    // TODO: Does memoize work and help here? It's shared across all instances.
    generateAvatar: memoize(function(letter) {
      if ( letter.length < 1 ) return '';
      return 'data:image/svg+xml;utf-8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="21" height="21"><rect width="21" height="21" x="0" y="0" style="fill:#d40000"/><text x="10" y="17" style="text-anchor:middle;font-size:19;font-style:normal;font-weight:bold;font-family:Arial, sans;fill:#fff">' + letter + '</text></svg>';
    })
  }
});

MODEL({
  name: 'ContactDAO',
  extendsModel: 'PropertyOffloadDAO',
  requires: [
    'Contact',
    'Address',
    'PhoneNumber',
    'ContactAvatarNetworkDAO',
    'EasyDAO',
    'FutureDAO',
    'IDBDAO',
    'LazyCacheDAO',
    'LRUCachingDAO',
    'XHR'
  ],

  documentation: function() {/*
    This is a DAO of $$DOC{ref:"Contact", usePlural:true}. It is implemented in three parts:
    <ul>
      <li>Network-backed raw contact DAO.
      <li>Network-backed, LRU-caching avatar DAO
      <li>Combination of the above into a $$DOC{ref:"PropertyOffloadDAO"}
    </ul>
  */},

  properties: [
    {
      name: 'avatarDAO',
      factory: function() {
        return this.LRUCachingDAO({
          maxSize: 50,
          delegate: this.FutureDAO({
            future: aseq(
              asleep(200),
              function(ret) {
                ret(this.LazyCacheDAO({
                  cache: this.IDBDAO({ model: this.Contact, name: 'ContactAvatars' }),
                  delegate: this.ContactAvatarNetworkDAO()
                }));
              }.bind(this)
            )
          })
        });
      }
    },
    {
      name: 'rawContactDAO',
      factory: function() {
        var contactDAO = this.EasyDAO({ model: this.Contact, cache: true });
        contactDAO.addIndex(Contact.EMAIL);
        contactDAO.addIndex(Contact.FIRST);
        contactDAO.addIndex(Contact.LAST);
        return contactDAO;
      }
    },
    {
      name: 'property',
      defaultValueFn: function() { return this.Contact.AVATAR; }
    },
    {
      name: 'model',
      defaultValueFn: function() { return this.Contact; }
    },
    {
      name: 'offloadDAO',
      factory: function() { return this.avatarDAO; }
    },
    {
      name: 'delegate',
      factory: function() { return this.rawContactDAO; }
    },
    {
      name: 'loadOnSelect',
      defaultValue: true
    }
  ],

  methods: {
    init: function() {
      this.SUPER();

      // Prefetch the contacts into this DAO.
      var self = this;
      aseq(
        asleep(1000),
        function(ret) {
          self.select(COUNT())(function(c) {
            if ( c.count === 0 ) {
              console.log('Running contact import...');
              self.importContacts();
            }
          });
        }
      )();
    },

    importContacts: function() {
      var xhr = this.XHR({ responseType: 'json' });
      var self = this;

      aseq(function(ret) {
        xhr.asend(ret, 'https://www.google.com/m8/feeds/contacts/default/full' +
            '?alt=json&max-results=10000');
      })(function(data) {
        var contacts = data.feed.entry;
        if ( ! contacts ) {
          console.warn('Error loading contacts: ', data);
          return;
        }

        contacts.forEach(function(c) {
          var contact = self.Contact({
            id:      c.id       ? c.id.$t.split('/').pop() : '',
            title:   c.title    ? c.title.$t : '',
            email:   c.gd$email ? c.gd$email[0].address : '',
            updated: c.updated  ? c.updated.$t : ''
          });
          c.gd$phoneNumber && c.gd$phoneNumber.forEach(function(p) {
            contact.phoneNumbers.push(self.PhoneNumber({
              type: p.rel ? p.rel.replace(/^.*#/, '') : p.label ? p.label : 'main',
              number: p.$t
            }));
          });
          c.gd$postalAddress && c.gd$postalAddress.forEach(function(a) {
            contact.addresses.push(self.Address({
              type: a.rel.replace(/^.*#/, ''),
              street: a.$t
            }));
          });
          c.length = 0;
          self.put(contact);
        });
      });
    }
  }
});

