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
  name: 'GmailSyncManager',

  properties: [
    {
      name:  'messageDao',
      label: 'Message DAO. Used to get message data.',
      type:  'DAO',
      hidden: true,
      transient: true
    },
    {
      name:  'historyDao',
      label: 'History DAO. Used for forward sync to get all history items since last sync.',
      type:  'DAO',
      hidden: true,
      transient: true
    },
    {
      name:  'dstDAO',
      label: 'Destination DAO. Used to put all of the emails into.',
      type:  'DAO',
      hidden: true,
      transient: true
    },
    {
      name:  'historyProperty',
      type:  'Property',
      hidden: true,
      transient: true
    },
    {
      name:  'threadDao',
      label: 'Thread DAO. Used for looking up all messages in a thread.',
      type:  'DAO',
      hidden: true,
      transient: true
    },
    {
      model_: 'BooleanProperty',
      name:  'isSyncing',
      mode2: 'read-only',
      help: 'If the Sync Manager is currently syncing.',
      transient: true
    },
  ],

  actions: [
    {
      name:  'forceSync',
      help:  'Perform a single sync request.',

      isEnabled: function() {
        return !this.isSyncing;
      },
      action: function() {
        this.sync();
      }
    },
  ],

  methods: {
    putIntoDstDao: function(message) {
      this.dstDAO.put(message);
    },

    forwardSync: function(startHistoryId) {
      var self = this;
      this.historyDao.select({
        put: function(history) {
          for (var i = 0; i < history.messages.length; i++) {
            var messageId = history.messages[i].id;
            // TODO: dont need the full format here. can just do minimal
            self.messageDao.find(messageId, {
              put: function(message) {
                // TODO is there better way to replace? Or just replace the label ids?
                // TODO get all for a thread?
                self.dstDAO.remove(messageId);
                if (message.id) {
                  self.putIntoDstDao(message);
                }
              }
            });
          }
        },
        eof: function() {
               // TODO this is wrong.
          self.isSyncing = false;
        },
      }, {urlParams: ['startHistoryId=' + startHistoryId]});
    },
    initialSync: function() {
      var self = this;
      // TODO: start with more than 10.
      this.threadDao.limit(10).select({
        put: function(thread) {
          self.threadDao.find(thread.id, {
            put: function(fullThread) {
              for (var i = 0; i < fullThread.messages.length; i++) {
                self.putIntoDstDao(fullThread.messages[i]);
              }
            }
          });
        },
        eof: function() {
          self.isSyncing = false;
        }
      }, {urlParams: ['maxResults=1']}); // TODO make this unnecessary.
    },
    sync: function() {
      var self = this;
      self.isSyncing = true;

      self.dstDAO.select(MAX(self.historyProperty))(function (max) {
        if (max.max) {
          self.forwardSync(max.max);
        } else {
          self.initialSync();
        }
      });
    },
  }
});
