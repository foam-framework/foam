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
          return this.GMailToEMailDAO.create({
            delegate: this.FutureDAO.create({ future: future.get })
          });
        }
        return this.NullDAO.create();
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
        return this.CachingDAO.create({
          src: this.IDBDAO.create({ model: this.EMail }),
          delegate: this.MDAO.create({ model: this.EMail })
        })
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
                  newValue.clientVersion =
                    Math.max(oldValue.clientVersion, newValue.clientVersion);
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
