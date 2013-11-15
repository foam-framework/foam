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
// TODO:

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


var ContactPhoto = FOAM({
    model_: 'Model',

    name: 'Contact',

    properties: [
        {
            model_: 'StringProperty',
            name: 'id'
        },
        {
            model_: 'StringProperty',
            // TODO: switch to ImageView
            name: 'photo'
        }
     ]
});

var ContactListTileView = Model.create({
  name: 'ContactListTileView',

  extendsModel: 'AbstractView',

  properties: [
    {
      name: 'value',
      valueFactory: function() { return SimpleValue.create(); },
      postSet: function(newValue, oldValue) {
        oldValue && oldValue.removeListener(this.paint);
        newValue.addListener(this.paint);
      }
    }
  ],

  methods: {
    toHTML: function() {
      return '<div class="contactTile" id="' + this.getID() + '"><div class="contactTileAvatar"></div><div class="contactTileDetails"></div></div>';
    }
  },

  listeners: [
    {
      name: 'paint',
      code: function() {
        this.$.children[1].textContent = this.value.get().first + ' ' + this.value.get().last + ' <' + this.value.get().email + '>';
      }
    }
  ]
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
            model_: 'URLProperty',
            name: 'avatarUrl',
            defaultValueFn: function() {
              return "https://www.google.com/m8/feeds/photos/media/" +
                this.email + "/" + this.id;
            }
        },
        {
            model_: 'StringProperty',
            name: 'note',
            displayHeight: 10
        }
    ]
});


function importContacts() {
  var xhr2 = xhrFactory.make();
  // TODO: use real email address
//  var url = 'https://www.google.com/m8/feeds/contacts/kgrgreer@gmail.com/full';
  var url = 'https://www.google.com/m8/feeds/contacts/kgr@google.com/full';
  var params = [ 'alt=json', 'max-results=10000' ];
  var f = function(data) {
// TODO: gContact$groupMembershipInfo
     var contacts = JSON.parse(data).feed.entry;
     console.log('contacts', contacts);
     contacts.forEach(function(c) {
       var contact = Contact.create({
          id:    c.id && c.id.$t.split('/').pop(),
          title: c.title && c.title.$t,
          email: c.gd$email && c.gd$email[0].address,
          updated: c.updated && c.updated.$t
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
  xhr2.responseType = 'text';
  xhr2.asend(f, 'GET', url + '?' + params.join('&'));
}
