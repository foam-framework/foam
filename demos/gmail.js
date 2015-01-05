CLASS({
  name: 'GMailSyncDemo',
  requires: [
    'CachingDAO',
    'DelayedDAO',
    'SeqNoDAO',
    'foam.core.dao.CloningDAO',
    'foam.core.dao.Sync',
    'foam.core.dao.MergeDAO',
    'foam.core.dao.VersionNoDAO',
    'EasyOAuth2',
    'FOAMGMailMessage',
    'MDAO',
    'IDBDAO',
    'FutureDAO',
    'GMailMessageDAO',
    'PersistentContext',
    'Binding'
  ],
  properties: [
    {
      name: 'authedXhr',
      hidden: true,
      factory: function() {
        return this.X.XHR.xbind({
          retries: 3,
          delay: 10,
          authAgent: this.EasyOAuth2.create({
            clientId: "945476427475-oaso9hq95r8lnbp2rruo888rl3hmfuf8.apps.googleusercontent.com",
            clientSecret: "GTkp929u268_SXAiHitESs-1",
            scopes: [
              "https://www.googleapis.com/auth/userinfo.profile",
              "https://www.googleapis.com/auth/userinfo.email",
              "https://mail.google.com/",
              'https://www.google.com/m8/feeds'
            ]
          })
        });
      }
    },
    {
      name: 'remoteDao',
      hidden: true,
      factory: function() {
        var future = afuture()
        var Y = this.X.sub({ XHR: this.authedXhr });
        this.persistentContext.bindObject('remoteDao',
                                          Y.GMailMessageDAO)(future.set);
        return this.FutureDAO.create({ future: future.get });
      }
    },
    {
      name: 'persistentContext',
      factory: function() {
        return this.PersistentContext.create({
          dao: this.IDBDAO.create({ model: this.Binding }),
          predicate: NOT_TRANSIENT,
          context: {}
        });
      }
    },
    {
      name: 'localMDao',
      view: 'TableView',
      factory: function() {
        return this.CachingDAO.create({
          cache: this.MDAO.create({ model: this.FOAMGMailMessage }),
          src: this.IDBDAO.create({ model: this.FOAMGMailMessage })
        });
      }
    },
    {
      name: 'localVersionedDao',
      hidden: true,
      factory: function() {
        return this.VersionNoDAO.create({
          delegate: this.localMDao,
          property: this.FOAMGMailMessage.CLIENT_VERSION
        })
      }
    },
    {
      name: 'localMergeDao',
      view: 'DetailView',
      factory: function() {
        return this.MergeDAO.create({
          delegate: this.localMDao,
          mergeStrategy: function(ret, o1, o2) {
            ret(o1);
          }
        });
      }
    },
    {
      name: 'sync',
      view: { factory_: 'DetailView', showActions: true },
      factory: function() {
        return this.Sync.create({
          local: this.localMergeDao,
          remote: this.remoteDao,
          localVersionProp: this.FOAMGMailMessage.CLIENT_VERSION,
          remoteVersionProp: this.FOAMGMailMessage.HISTORY_ID,
          initialSyncWindow: 10
        });
      }
    }
  ],
  methods: {
    init: function(args) {
      this.SUPER(args);
      window.demo = this;
    }
  }
});
