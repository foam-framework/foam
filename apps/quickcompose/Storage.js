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

console.time('Storage');

var EMailDAO = NullDAO.create({});
var ContactDAO = MDAO.create({ model: Contact });
ContactDAO.addIndex(Contact.EMAIL);
ContactDAO.addIndex(Contact.FIRST);
ContactDAO.addIndex(Contact.LAST);

console.time('authAgent');
var authAgent = ChromeAuthAgent.create({});
console.timeEnd('authAgent');

console.time('JsonXhrFactory');
var JsonXhrFactory = OAuthXhrFactory.create({
  authAgent: authAgent,
  responseType: "json"
});
console.timeEnd('JsonXhrFactory');
console.time('BlobXhrFactory');
var BlobXhrFactory = OAuthXhrFactory.create({
  authAgent: authAgent,
  responseType: "blob"
});
console.timeEnd('BlobXhrFactory');

console.time('ContactAvatarDAO');
var ContactAvatarDAO = LRUCachingDAO.create({
  maxSize: 50,
  delegate: FutureDAO.create(aseq(asleep(200), function(ret) {
    ret(LazyCacheDAO.create({
      cache: IDBDAO.create({ model: Contact, name: 'ContactAvatars2' }),
      delegate: ContactAvatarNetworkDAO.create({
        xhrFactory: BlobXhrFactory
      })
    }));
  }))
});
console.timeEnd('ContactAvatarDAO');

ContactDAO = EasyDAO.create({model: Contact, cache: true})

ContactAvatarDAO = PropertyOffloadDAO.create({
  property: Contact.AVATAR,
  model: Contact,
  offloadDAO: ContactAvatarDAO,
  delegate: ContactDAO,
  loadOnSelect: true
});

aseq(asleep(1000), function() {
  ContactDAO.select(COUNT())(function(c) {
    if ( c.count === 0 ) {
      console.log('Importing contacts...');
      importContacts(ContactDAO, JsonXhrFactory);
    }
  });
})();

var persistentContext = PersistentContext.create({
  dao: IDBDAO.create({model: Binding}),
  predicate: NOT_TRANSIENT,
  context: GLOBAL
});

// Load and persist user info.
persistentContext.bindObject('userInfo', UserInfo, {})(
  aseq(
    asleep(250),
    function(ret) {
      var xhr = JsonXhrFactory.make();
      xhr.asend(ret, "GET", "https://www.googleapis.com/oauth2/v1/userinfo?alt=json");
    },
    function(ret, response) {
      if ( response ) {
        userInfo.email = response.email;
      }
    }));

console.timeEnd('Storage');
