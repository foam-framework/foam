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
    {
      name:  'lastHistoryId',
      transient: true
    },
    {
      name:  'initialSyncSize',
      defaultValue: 10,
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
      if (message.historyId > this.lastHistoryId) {
        this.lastHistoryId = message.historyId;
      }
      this.dstDAO.put(message);
    },

    forwardSync: function(startHistoryId) {
      var self = this;
      var toSync = {};
      this.historyDao.select({
        put: function(history) {
          for (var i = 0; i < history.messages.length; i++) {
            var messageId = history.messages[i].id;
            toSync[messageId] = 1;
          }
        },
        eof: function() {
               // TODO this is wrong.
          self.isSyncing = false;

          var getMessage = function(messageId) {
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
          };

          for (var messageId in toSync) {
            // TODO: dont always need the full format here. can just do minimal
            self.dstDAO.find(messageId, {
              put: function(email) {
                self.messageDao.find(messageId, {
                  put: function(message) {
                   // TODO: do this better...shouldnt have to talk to emails.
                    email.labels = message.labelIds;
                    email.historyId = message.historyId;
                  }, error: function() {
                    self.dstDAO.remove(messageId);
                  },
                }, {urlParams: ['format=minimal']});
              },
              error: function() {
                self.messageDao.find(messageId, {
                  put: function(message) {
                    self.dstDAO.put(message);
                  },
                });
              }
            });
          }
        },
      }, {urlParams: ['startHistoryId=' + startHistoryId]});
    },
    initialSync: function() {
      var self = this;
      this.threadDao.limit(this.initialSyncSize).select({
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
      });
    },
    sync: function() {
      this.isSyncing = true;
      if (this.lastHistoryId) {
        this.forwardSync(this.lastHistoryId);
      } else {
        this.initialSync();
      }
    },
  }
});

var createGmailSyncAgent = function() {
  var auth = EasyOAuth2.create({
    clientId: "945476427475-oaso9hq95r8lnbp2rruo888rl3hmfuf8.apps.googleusercontent.com",
    clientSecret: "GTkp929u268_SXAiHitESs-1",
    scopes: [
      "https://mail.google.com/"
    ]
  });

  X.registerModel(XHR.xbind({
    authAgent: auth,
    retries: 3,
    delay: 2
  }), 'XHR');

  var messageDao = X.GMailRestDAO.create({
    model: GMailMessage,
  });

  var historyDao = X.GMailRestDAO.create({
    model: GMailHistory,
  });

  var threadDao = X.GMailRestDAO.create({
    model: GMailThread,
  });

  MODEL({
    name: 'EMailAdapterDAO',

    extendsModel: 'ProxyDAO',

    methods: {
      put: function(obj, sink) {
        var headersMap = {};
        var headers = obj.payload.headers || [];
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i];
          headersMap[header.name] = header.value;
        }


        var decode = function (str) {
          var decoder = Base64Decoder.create([]);
          decoder.put(str);
          decoder.eof();
          return decoder.sink;
        }

        var ab2String = function (buffer) {
          var result = '';
          for (var bi = 0; bi < buffer.length; bi++) {
            var view = new Uint8Array(buffer[bi]);
            for (var i = 0; i < buffer[bi].byteLength; ++i) {
              result += String.fromCharCode(view[i]);
            }
          }
          return result;
        }

        var body;
        if (obj.payload && obj.payload.body && obj.payload.body.data) {
          body = ab2String(decode(obj.payload.body.data));
        } else {
          body = '';
          var parts = obj.payload.parts || [];
          for (var i = 0; i < parts.length; i++) {
            if (!obj.payload.parts[i].body.data) {
              continue;
            }
            body = body + ab2String(decode(obj.payload.parts[i].body.data));
          }
        }

        var email = EMail.create({
          id: obj.id,
          convId: obj.threadId,
          timestamp: headersMap['Date'],
          from: headersMap['From'],
          to: headersMap['To'],
          cc: headersMap['Cc'],
          bcc: headersMap['Bcc'],
          replyTo: headersMap['Reply-To'],
          subject: headersMap['Subject'],
          labels: obj.labelIds,
          historyId: obj.historyId,
          // attachments: obj.attachments,
          body: body,
          snippet: obj.snippet,
        });
        this.delegate.put(email, sink);
      }
    }
  });

  var emailAdapterDAO = EMailAdapterDAO.create({
    delegate: MDAO.create({ model: EMail }),
  });

  var gmailSyncManager = GmailSyncManager.create({
    historyDao: historyDao,
    messageDao: messageDao,
    dstDAO: emailAdapterDAO,
    threadDao: threadDao,
  });
  return gmailSyncManager;
};
