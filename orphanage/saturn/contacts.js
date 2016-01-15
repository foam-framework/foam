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
            type: 'String',
            name: 'type'
        },
        {
            type: 'String',
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
            type: 'String',
            name: 'type'
        },
        {
            type: 'String',
            name: 'poBox',
            label: 'P.O. Box',
            displayWidth: 70
        },
        {
            type: 'String',
            name: 'street',
            displayWidth: 70
        },
        {
            type: 'String',
            name: 'localArea',
            displayWidth: 70
        },
        {
            type: 'String',
            name: 'city',
            displayWidth: 70
        },
        {
            type: 'String',
            name: 'county',
            label: 'County / Area',
            displayWidth: 70
        },
        {
            type: 'String',
            name: 'postalCode',
            displayWidth: 12
        },
        {
            type: 'String',
            name: 'country',
            displayWidth: 40
        }
    ]
});

var ContactSmallTileView = FOAM({
  model_: 'Model',

  extendsModel: 'foam.ui.DetailView',

  name: 'ContactSmallTileView',

  methods: {
    REMOVE: 'remove',

    toHTML: function() {
      var name = this.createView(Contact.DISPLAY_NAME);
      name.mode = 'read-only';
      name.escapeHTML = true;
      var avatar = this.createView(Contact.AVATAR);
      avatar.displayWidth = 27;
      avatar.displayHeight = 27;

      return '<div id="' + this.id + '" class="contactSmallTile">' +
        '<div class="contactSmallAvatar">' + avatar.toHTML() + '</div>' +
        '<div class="contactSmallName">' + name.toHTML() + '</div>' +
        '<button id="' + this.on('click', this.onRemove) + '" class="contactSmallX">x</button>'
        '</div>';
    }
  },

  listeners: [
    {
      name: 'onRemove',
      code: function() {
        this.publish(this.REMOVE, this.value.get());
      }
    }
  ]
});

var ContactListTileView = Model.create({
  name: 'ContactListTileView',

  extendsModel: 'foam.ui.DetailView',

  templates: [
    {
      name: 'toHTML',
      template: '<% var avatar = this.createView(Contact.AVATAR);' +
        'avatar.displayWidth = 32; avatar.displayHeight = 32;' +
        'var name = this.createView(Contact.DISPLAY_NAME);' +
        'name.mode = "read-only";' +
        'name.escapeHTML = true;' +
        'var address = this.createView(Contact.EMAIL);' +
        'address.mode = "read-only"; %>' +
        '<div class="contactTile" id="<%= this.id %>">' +
        '<%= avatar.toHTML() %>' +
        '<ul class="contactTileDetails">' +
        '<li><%= name.toHTML() %></li>' +
        '<li><%= address.toHTML() %></li>' +
        '</ul></div>'
    }
  ]
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
      type: 'String',
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
          sink && sink.put && sink.put(Contact.create({
            id: id,
            avatar: data
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
            type: 'String',
            name: 'id'
        },

        {
            type: 'String',
            displayWidth: 50,
            name: 'title'
        },

        {
            type: 'DateTime',
            factory: function() { return new Date(); },
            name: 'updated'
        },

        {
            type: 'String',
            name: 'prefix'
        },
        {
            type: 'String',
            name: 'first'
        },
        {
            type: 'String',
            name: 'middle'
        },
        {
            type: 'String',
            name: 'last'
        },
        {
            type: 'String',
            name: 'suffix'
        },
        {
            type: 'String',
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
            type: 'EMail',
            name: 'email',
            label: ''
        },
        {
            type: 'Array',
            name: 'phoneNumbers',
            subType: 'PhoneNumber'
        },
        {
            type: 'Array',
            name: 'addresses',
            subType: 'Address'
        },
        {
            type: 'Date',
            name: 'birthday'
        },
        {
            type: 'URL',
            displayWidth: 70,
            name: 'url'
        },
        {
            name: 'avatar',
            type: 'String',
            view: 'foam.ui.ImageView',
            defaultValueFn: function() {
                var key = this.title ? this.title[0].toUpperCase() : (
                  this.email ? this.email[0].toUpperCase() : '' );
                return this.generateAvatar(key);
            }
        },
        {
            type: 'String',
            name: 'note',
            displayHeight: 10
        }
    ],

  methods: {
    generateAvatar: function(letter) {
      if ( letter.length < 1 ) return '';
      return 'data:image/svg+xml;utf-8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="21" height="21"><rect width="21" height="21" x="0" y="0" style="fill:#d40000"/><text x="10" y="17" style="text-anchor:middle;font-size:19;font-style:normal;font-weight:bold;font-family:Arial, sans;fill:#fff">' + letter + '</text></svg>';
    }
  }
});

// Memoize the avatar to save time generating it.
// TODO: Just set memoize in the method model when that is suppored.
Contact.getPrototype().generateAvatar = memoize(Contact.getPrototype().generateAvatar);


function importContacts(dao, xhrFactory) {
  var xhr2 = xhrFactory.make();
  var url = 'https://www.google.com/m8/feeds/contacts/default/full';
  var params = [ 'alt=json', 'max-results=10000' ];
  var f = function(data) {
// TODO: gContact$groupMembershipInfo
    var contacts = data.feed.entry;
    if ( ! contacts ) {
      console.warn('Error loading contacts: ', data);
      return;
    }
    contacts.forEach(function(c) {
      var contact = Contact.create({
        id:      c.id       ? c.id.$t.split('/').pop() : '',
        title:   c.title    ? c.title.$t : '',
        email:   c.gd$email ? c.gd$email[0].address : '',
        updated: c.updated  ? c.updated.$t : ''
      });
      c.gd$phoneNumber && c.gd$phoneNumber.forEach(function(p) {
        contact.phoneNumbers.push(PhoneNumber.create({
          type:   p.rel ? p.rel.replace(/^.*#/,'') : p.label ? p.label : 'main',
          number: p.$t
        }));
      });
      c.gd$postalAddress && c.gd$postalAddress.forEach(function(a) {
        contact.addresses.push(Address.create({
          type: a.rel.replace(/^.*#/,''),
          street: a.$t
        }));
      });

      c.length = 0;

      ContactDAO.put(contact);
    });
  };
//  xhr2.responseType = 'text';
  xhr2.asend(f, 'GET', url + '?' + params.join('&'));
}
