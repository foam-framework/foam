/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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

var UserInfo = FOAM({
  model_: 'Model',

  name: 'UserInfo',
  label: 'UserInfo',

  properties: [
    {
      model_: 'StringProperty',
      name: 'email'
    }
  ]
});

var EMailDAO = IDBDAO.create({model: EMail});
var ContactDAO = MDAO.create({ model: Contact });
ContactDAO.addIndex(Contact.EMAIL);
ContactDAO.addIndex(Contact.FIRST);
ContactDAO.addIndex(Contact.LAST);

var authAgent = ChromeAuthAgent.create({});

var JsonXhrFactory = OAuthXhrFactory.create({
  authAgent: authAgent,
  responseType: "json"
});
var BlobXhrFactory = OAuthXhrFactory.create({
  authAgent: authAgent,
  responseType: "blob"
});

var ContactAvatarDAO = LRUCachingDAO.create({
  maxSize: 50,
  delegate: LazyCacheDAO.create({
    cache: IDBDAO.create({ model: Contact, name: 'ContactAvatars2' }),
    delegate: ContactAvatarNetworkDAO.create({
      xhrFactory: BlobXhrFactory
    })
  })
});

ContactDAO = CachingDAO.create(
  ContactDAO,
  IDBDAO.create({ model: Contact }));

ContactAvatarDAO = AvatarPlaceholderDAO.create({
  property: Contact.AVATAR,
  model: Contact,
  offloadDAO: ContactAvatarDAO,
  delegate: ContactDAO,
  loadOnSelect: true
});

ContactDAO.select(COUNT())(function(c) {
  if ( c.count === 0 ) {
    console.log('Importing contacts...');
    importContacts(ContactDAO, JsonXhrFactory);
  }
});

var persistentContext = PersistentContext.create({
  dao: IDBDAO.create({model: Binding}),
  predicate: NOT_TRANSIENT,
  context: GLOBAL
});

// Load and persist user info.
persistentContext.bindObject('userInfo', UserInfo, {})(
  aseq(
    function(ret) {
      var xhr = JsonXhrFactory.make();
      xhr.asend(ret, "GET", "https://www.googleapis.com/oauth2/v1/userinfo?alt=json");
    },
    function(ret, response) {
      if ( response ) {
        userInfo.email = response.email;
      }
    }));
