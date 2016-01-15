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
  name: 'EMailDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'Binding',
    'foam.dao.CachingDAO',
    'foam.dao.ContextualizingDAO',
    'foam.dao.FutureDAO',
    'foam.dao.IDBDAO',
    'MDAO',
    'PersistentContext',
    'com.google.mail.FOAMGMailMessage',
    'com.google.mail.GMailMessageDAO',
    'com.google.mail.GMailToEMailDAO',
    'com.google.mail.Sync',
    'com.google.mail.SyncDecorator',
    'foam.core.dao.MergeDAO',
    'foam.core.dao.PropertyOffloadDAO',
    'foam.core.dao.StripPropertiesDAO',
    'foam.core.dao.CloningDAO',
    'foam.core.dao.VersionNoDAO',
    'foam.lib.email.EMail'
  ],
  exports: [
    'as emailDao'
  ],
  imports: [
    'setInterval'
  ],
  properties: [
    {
      type: 'Boolean',
      name: 'withSync',
      defaultValue: true
    },
    {
      type: 'Int',
      name: 'syncInterval',
      defaultValue: 30000
    },
    {
      name: 'persistentContext',
      lazyFactory: function() {
        var context = {};
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({
            model: this.Binding,
            name: 'EMailDAO-Bindings',
          }),
          predicate: NOT_TRANSIENT,
          context: context
        });
      }
    },
    {
      name: 'remoteDao',
      factory: function() {
        var future = afuture();
        this.persistentContext.bindObject('remoteDao',
                                          this.GMailMessageDAO)(future.set);
        return this.GMailToEMailDAO.create({
          delegate: this.FutureDAO.create({ future: future.get })
        });
      }
    },
    {
      name: 'bodyDAO',
      factory: function() {
        return this.IDBDAO.create({
          model: this.EMail,
          name: 'EMail-Bodies',
          loadOnSelect: false
        })
      }
    },
    {
      name: 'delegate',
      type: 'DAO',
      factory: function() {
        return this.ContextualizingDAO.create({
          delegate: this.VersionNoDAO.create({
            property: this.EMail.CLIENT_VERSION,
            delegate: this.cachingDAO
          })
        });
      }
    },
    {
      name: 'cachingDAO',
      factory: function() {
        return this.PropertyOffloadDAO.create({
          property: this.EMail.BODY,
          offloadDAO: this.bodyDAO,
          delegate: this.CloningDAO.create({
            delegate: this.CachingDAO.create({
              src: this.IDBDAO.create({ model: this.EMail }),
              delegate: this.MDAO.create({ model: this.EMail })
            })
          })
        });
      },
      postSet: function(_, dao) {
        dao.select(COUNT())(function(c) {
          if ( c.count === 0 ) {
            this.StripPropertiesDAO.create({
              delegate: this.remoteDao,
              propertyNames: ['serverVersion']
            }).where(EQ(this.EMail.LABELS, 'INBOX')).limit(100).select(dao);
          }
        }.bind(this));
      }
    },
    {
      name: 'sync',
      factory: function() {
        if ( this.withSync ) {
          var sync = this.Sync.create({
            local: this.SyncDecorator.create({
              delegate: this.MergeDAO.create({
                delegate: this.cachingDAO,
                mergeStrategy: function(ret, oldValue, newValue) {
                  if ( newValue.clientVersion < oldValue.clientVersion ) {
                    newValue.labelIds = oldValue.labelIds;
                    newValue.clientVersion = oldValue.clientVersion;
                  }
                  ret(newValue);
                }
              })
            }),
            remote: this.remoteDao,
            localVersionProp: this.EMail.CLIENT_VERSION,
            remoteVersionProp: this.EMail.SERVER_VERSION,
            deletedProp: this.EMail.DELETED,
            initialSyncWindow: 10
          });

          this.delegate.listen(this.doSync);
          this.setInterval(this.doSync, this.syncInterval);

          return sync;
        }
      }
    }
  ],
  listeners: [
    {
      name: 'doSync',
      isMerged: 1000,
      code: function() {
        this.sync.sync();
      }
    }
  ],
});
