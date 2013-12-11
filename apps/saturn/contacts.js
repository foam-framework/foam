/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

var PhoneNumber = FOAM({
    model_: 'Model',

    name: 'PhoneNumber',

    ids: [ 'type' ],

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


var Address = FOAM({
    model_: 'Model',

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

var ContactSmallTileView = FOAM({
  model_: 'Model',

  extendsModel: 'DetailView',

  name: 'ContactSmallTileView',

  methods: {
    toHTML: function() {
      var name = this.createView(Contact.DISPLAY_NAME);
      name.mode = 'read-only';
      var avatar = this.createView(Contact.AVATAR);
      avatar.displayWidth = 21;
      avatar.displayHeight = 21;

      return '<div id="' + this.getID() + '" class="contactSmallTile">' +
        avatar.toHTML() +
        '<div class="contactSmallName">' + name.toHTML() + '</div>' +
        '</div>';
    }
  },
});

var ContactListTileView = Model.create({
  name: 'ContactListTileView',

  extendsModel: 'DetailView',

  methods: {
    toHTML: function() {
      var avatar = this.createView(Contact.AVATAR);
      avatar.displayWidth = 32;
      avatar.displayHeight = 32;
      var name = this.createView(Contact.DISPLAY_NAME);
      name.mode = 'read-only';
      var address = this.createView(Contact.EMAIL);
      address.mode = 'read-only';
      return '<div class="contactTile" id="' + this.getID() + '">' +
        '<div class="contactTileAvatar">' + avatar.toHTML() + '</div>' +
        '<ul class="contactTileDetails"><li>' +
        name.toHTML() + '</li><li class="contactTileAddress">' + address.toHTML() + '</li></ul></div></div>';
    }
  }
});

var AvatarPlaceholderDAO = FOAM({
  model_: 'Model',

  name: 'AvatarPlaceholderDAO',

  extendsModel: 'AbstractPropertyOffloadDAO',

  methods: {
    placeholder: function(contact) {
      // TODO: Should this come from a DAO?  A placeholder DAO?
      if ( ! this.placeholders_ ) this.placeholders_ = {};
      var key = contact.first ? contact.first[0] : contact.email[0];
      if ( ! this.placeholders_[key] ) {
        this.placeholders_[key] = new Blob([
          '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="21" height="21"><rect width="21" height="21" x="0" y="0" style="fill:#d40000"/><text x="10" y="18" style="text-anchor:middle;font-size:19;font-style:normal;font-family:sans;fill:#fff">' + (contact.first ? contact.first[0] : contact.email[0]) + '</text></svg>'], { type: 'image/svg+xml' });
      }
      return this.placeholders_[key];
    }
  }
});

var ContactAvatarNetworkDAO = FOAM({
  model_: 'Model',

  name: 'ContactAvatarNetworkDAO',

  extendsModel: 'AbstractDAO',

  properties: [
    {
      name: 'xhrFactory',
      required: 'true'
    },
    {
      model_: 'StringProperty',
      name: 'baseUrl',
      defaultValue: 'https://www.google.com/m8/feeds/photos/media/default/'
    }
  ],

  methods: {
    find: function(id, sink) {
      var xhr = this.xhrFactory.make();
      var self = this;
      aseq(
        function(ret) {
          xhr.asend(ret, "GET", self.baseUrl + id);
        },
        function(ret, blob, code) {
          if ( code === 404 ) {
            blob = '';
          }

          if ( code !== 200 && code !== 404 ) {
            sink && sink.error && sink.error('find', id);
            ret();
            return;
          }

          sink && sink.put && sink.put(Contact.create({
            id: id,
            avatar: blob
          }));
          ret();
        })(function(){});
    }
  }
});

var Contact = FOAM({
    model_: 'Model',

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
            valueFactory: function() { return new Date(); },
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
            type: 'Blob',
            view:  'BlobImageView'
        },
        {
            model_: 'StringProperty',
            name: 'note',
            displayHeight: 10
        }
    ]
});

function importContacts(dao, xhrFactory) {
  var xhr2 = xhrFactory.make();
  var url = 'https://www.google.com/m8/feeds/contacts/default/full';
  var params = [ 'alt=json', 'max-results=10000' ];
  var f = function(data) {
// TODO: gContact$groupMembershipInfo
     var contacts = data.feed.entry;
     console.log('contacts', contacts);
     contacts.forEach(function(c) {
       var contact = Contact.create({
          id:    c.id ? c.id.$t.split('/').pop() : '',
          title: c.title ? c.title.$t : '',
          email: c.gd$email ? c.gd$email[0].address : '',
          updated: c.updated ? c.updated.$t : ''
       });
       c.gd$phoneNumber && c.gd$phoneNumber.forEach(function(p) {
         contact.phoneNumbers.push(PhoneNumber.create({
            type: p.rel   ? p.rel.replace(/^.*#/,'') :
                  p.label ? p.label                  :
                            'main'                   ,
            number: p.$t
         }));
       });
       c.gd$postalAddress && c.gd$postalAddress.forEach(function(a) {
         contact.addresses.push(Address.create({
            type: a.rel.replace(/^.*#/,''),
            street: a.$t
         }));
       });

       delete c['id'];
       delete c['title'];
       delete c['gd$email'];
       delete c['updated'];
       delete c['link'];
       delete c['category'];
       delete c['gd$phoneNumber'];
       delete c['gd$postalAddress'];

       console.log(contact.toJSON(), c);
       ContactDAO.put(contact);
     });
  };
//  xhr2.responseType = 'text';
  xhr2.asend(f, 'GET', url + '?' + params.join('&'));
}
