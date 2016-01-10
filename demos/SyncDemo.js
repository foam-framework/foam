CLASS({
  name: 'Abc',
  properties: [
    {
      type: 'String',
      name: 'id'
    },
    {
      type: 'String',
      name: 'data'
    },
    {
      type: 'StringArray',
      name: 'flags'
    },
    {
      type: 'Int',
      name: 'remoteVersion',
      hidden: true
    },
    {
      type: 'Int',
      name: 'localVersion',
      hidden: true
    }
  ]
});

CLASS({
  name: 'AbcCitationView',
  extends: 'foam.ui.DetailView',
  templates: [
    function toHTML() {/*
      <div style="border 1px grey;" id="%%id">
        $$id{mode:'read-only'}
        <br/>
        Remote version: $$remoteVersion{ mode: 'read-only' }
        <br/>
        Local version: $$localVersion{ mode: 'read-only' }
        <br/>
        Data: $$data{mode: 'read-only'}
        <br/>
        Flags: $$flags{mode: 'read-only'}
      </div>
    */}
  ]
});

CLASS({
  name: 'SyncDemo',
  requires: [
    'AbcCitationView',
    'Abc',
    'foam.dao.SeqNoDAO',
    'GUIDDAO',
    'foam.core.dao.CloningDAO',
    'foam.core.dao.DelayedSelectDAO',
    'foam.core.dao.Sync',
    'foam.core.dao.MergeDAO',
    'foam.core.dao.VersionNoDAO'
  ],

  properties: [
    {
      name: 'localDao',
      factory: function() {
        return this.DelayedSelectDAO.create({
          delegate: this.GUIDDAO.create({
            delegate: this.CloningDAO.create({
              onSelect: true,
              delegate: MDAO.create({ model: this.Abc }),
            })
          })
        });
      },
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'AbcCitationView'
      }
    },
    {
      name: 'remoteDao',
      factory: function() {
        var dao = GUIDDAO.create({
          delegate: this.CloningDAO.create({
            delegate: MDAO.create({ model: this.Abc })
          })
        });
        [
          Abc.create({
            data: 'First object.',
            remoteVersion: 1
          }),
          Abc.create({
            remoteVersion: 2,
            data: 'Second object.',
            flags: ['FLAG_A', 'FLAG_B']
          })
        ].select(dao);
        return this.DelayedSelectDAO.create({
          delegate: dao
        });
      },
      view: {
        factory_: 'foam.ui.DAOListView',
        rowView: 'AbcCitationView'
      }
    },
    {
      name: 'writeRemoteDao',
      hidden: true,
      factory: function() {
        return this.VersionNoDAO.create({
          delegate: this.remoteDao,
          property: this.Abc.REMOTE_VERSION
        });
      }
    },
    {
      name: 'writeLocalDao',
      hidden: true,
      factory: function() {
        return this.VersionNoDAO.create({
          delegate: this.localDao,
          property: this.Abc.LOCAL_VERSION
        });
      }
    },
    {
      name: 'localMergeDao',
      view: 'foam.ui.DetailView',
      factory: function() {
        return this.MergeDAO.create({
          delegate: this.localDao,
          mergeStrategy: function(ret, oldValue, newValue) {
            if ( oldValue.localVersion > newValue.localVersion ) {
              console.log("Appending new data from server.");
              newValue.data = oldValue.data + '<br/>' + newValue.data;
            }
            newValue.localVersion = oldValue.localVersion;
            ret(newValue);
          }
        });
      }
    },
    {
      name: 'syncManager',
      view: 'foam.ui.DetailView',
      factory: function() {
        return this.Sync.create({
          local: this.localMergeDao,
          remote: this.remoteDao,
          remoteVersionProp: this.Abc.REMOTE_VERSION,
          localVersionProp: this.Abc.LOCAL_VERSION
        });
      }
    }
  ],

  actions: [
    {
      name: 'doSync',
      code: function() {
        this.syncManager.sync();
      }
    },
    {
      name: 'addRemoteObject',
      code: function() {
        this.writeRemoteDao.put(
          this.Abc.create({
            data: 'Remote object created at ' + new Date(),
            flags: ['FLAG_A']
          }));
      }
    },
    {
      name: 'mutateRemoteObject',
      code: function() {
        this.writeRemoteDao.limit(1).update(
          SET(this.Abc.DATA, 'Remote object modified at ' + new Date()));
      }
    },
    {
      name: 'mutateLocalObject',
      code: function() {
        this.writeLocalDao.limit(1).update(
          SET(this.Abc.DATA, 'Local object modified at ' + new Date()));
      }
    }
  ]
});
