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

var EMailDAO = IDBDAO.create({model: EMail});
var ContactDAO = MDAO.create({ model: Contact });
ContactDAO.addIndex(Contact.EMAIL);
ContactDAO.addIndex(Contact.FIRST);
ContactDAO.addIndex(Contact.LAST);

var XhrFactory = OAuthXhrFactory.create({
  authAgent: ChromeAuthAgent.create({}),
  responseType: "json"
});

ContactDAO = CachingDAO.create(
  ContactDAO,
  IDBDAO.create({ model: Contact }));

ContactDAO.select(COUNT())(function(c) {
  if ( c.count === 0 ) {
    console.log('Importing contacts...');
    importContacts(ContactDAO, XhrFactory);
  }
});
