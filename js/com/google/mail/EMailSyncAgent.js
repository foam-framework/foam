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
  package: 'com.google.mail',
  name: 'EMailSyncAgent',
  extends: 'com.google.mail.MobileAgent',
  requires: [
    'XHR',
    'com.google.mail.IdMapperDAO',
    'foam.dao.LoggingDAO',
    'foam.core.dao.MergeDAO',
    'foam.core.dao.Sync',
    'foam.dao.EasyDAO',
    'foam.core.dao.SyncDAO',
    'foam.dao.NullDAO',
    'foam.dao.LoggingDAO',
    'foam.lib.email.EMail',
    'com.google.mail.FOAMGMailMessage',
    'com.google.mail.GMailMessageDAO',
    'com.google.mail.GMailToEMailDAO',
    'com.google.mail.SyncDecorator',
    'foam.oauth2.OAuth2OnServer'
  ],
  imports: [
    'emailDAO',
    'setInterval',
    'log'
  ],
  properties: [
    'user',
    'clientId',
    'clientSecret',
    'refreshToken',
    'gmailSyncProperty',
    'gmailDeletedProperty'
  ],
  methods: [
    function execute() {
      this.log("Starting sync agent for", this.user);

      var authAgent = this.OAuth2OnServer.create({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        refreshToken: this.refreshToken
      });

      var XHR = this.XHR.xbind({
        authAgent: authAgent,
        retries: 3
      });

      var Y = this.Y.sub();
      Y.registerModel(XHR, 'XHR');

      var dao = this.GMailMessageDAO.create(undefined, Y);
      dao = this.GMailToEMailDAO.create({
        delegate: dao
      });

      var sync = this.Sync.create({
        local: this.IdMapperDAO.create({
          delegate: this.MergeDAO.create({
            delegate: this.emailDAO,
            mergeStrategy: function(ret, oldValue, newValue) {
              if ( newValue.clientVersion < oldValue.clientVersion ) {
                newValue.labelIds = oldValue.labelIds;
                newValue.clientVersion = oldValue.clientVersion;
              }
              ret(newValue);
            }
          }),
        }),
        remote: this.GMailToEMailDAO.create({
          delegate: this.GMailMessageDAO.create(undefined, Y)
        }),
        localVersionProp: this.EMail.CLIENT_VERSION,
        remoteVersionProp: this.EMail.SERVER_VERSION,
        deletedProp: this.EMail.DELETED,
        initialSyncWindow: 1
      });

      sync.sync();
      this.setInterval(sync.sync.bind(sync), 10000);
    }
  ]
});
