CLASS({
  package: 'com.google.mail',
  name: 'EMailDAO',
  extendsModel: 'ProxyDAO',
  requires: [
    'Binding',
    'CachingDAO',
    'ContextualizingDAO',
    'FutureDAO',
    'IDBDAO',
    'MDAO',
    'PersistentContext',
    'com.google.mail.FOAMGMailMessage',
    'com.google.mail.GMailMessageDAO',
    'com.google.mail.GMailToEMailDAO',
    'com.google.mail.Sync',
    'com.google.mail.SyncDecorator',
    'foam.core.dao.MergeDAO',
    'foam.core.dao.StripPropertiesDAO',
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
      model_: 'BooleanProperty',
      name: 'withSync',
      defaultValue: true
    },
    {
      model_: 'IntProperty',
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
            predicate: NOT_TRANSIENT,
            context: context
          })
        });
      }
    },
    {
      name: 'remoteDao',
      lazyFactory: function() {
        if ( this.withSync ) {
          var future = afuture();
          this.persistentContext.bindObject('remoteDao',
                                            this.GMailMessageDAO)(future.set);
          return this.FutureDAO.create({ future: future.get });
        }
        return this.NullDAO.create();
      }
    },
    {
      name: 'rawGmailDao',
      factory: function() {
        return this.CachingDAO.create({
          delegate: this.MDAO.create({ model: this.FOAMGMailMessage }),
          src: this.IDBDAO.create({
            model: this.FOAMGMailMessage, useSimpleSerialization: false
          })
        });
      },
      postSet: function(_, dao) {
        dao.select(COUNT())(function(c) {
          if ( c.count === 0 ) {
            this.StripPropertiesDAO.create({
              delegate: this.remoteDao,
              propertyNames: ['historyId']
            }).where(EQ(this.FOAMGMailMessage.LABEL_IDS, 'INBOX')).limit(100).select(dao);
          }
        }.bind(this));
      }
    },
    {
      name: 'versionedGmailDao',
      factory: function() {
        return this.VersionNoDAO.create({
          delegate: this.rawGmailDao,
          property: this.FOAMGMailMessage.CLIENT_VERSION
        });
      }
    },
    {
      name: 'delegate',
      type: 'DAO',
      factory: function() {
        return this.ContextualizingDAO.create({
          delegate: this.CachingDAO.create({
            src: this.GMailToEMailDAO.create({
              delegate: this.versionedGmailDao
            }),
            delegate: this.MDAO.create({ model: this.EMail })
          })
        });
      }
    },
    {
      name: 'sync',
      factory: function() {
        if ( this.withSync ) {
          var sync = this.Sync.create({
            local: this.SyncDecorator.create({
              delegate: this.MergeDAO.create({
                delegate: this.rawGmailDao,
                mergeStrategy: function(ret, oldValue, newValue) {
                  newValue.clientVersion =
                    Math.max(oldValue.clientVersion, newValue.clientVersion);
                  ret(newValue);
                }
              })
            }),
            remote: this.remoteDao,
            localVersionProp: this.FOAMGMailMessage.CLIENT_VERSION,
            remoteVersionProp: this.FOAMGMailMessage.HISTORY_ID,
            deletedProp: this.FOAMGMailMessage.DELETED,
            initialSyncWindow: 10
          });

          this.versionedGmailDao.listen(this.doSync);
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
