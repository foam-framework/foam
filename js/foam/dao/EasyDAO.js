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

CLASS({
  package: 'foam.dao',
  name: 'EasyDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'MDAO',
    'foam.core.dao.CloningDAO',
    'foam.core.dao.MergeDAO',
    'foam.core.dao.MigrationDAO',
    'foam.core.dao.StorageDAO',
    'foam.core.dao.SyncDAO',
    'foam.core.dao.SyncTrait',
    'foam.core.dao.sync.PollingSyncDAO',
    'foam.core.dao.sync.SocketSyncDAO',
    'foam.core.dao.VersionNoDAO',
    'foam.dao.CachingDAO',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DeDupDAO',
    'foam.dao.EasyClientDAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    'foam.dao.SeqNoDAO',
    'foam.dao.LoggingDAO',
    'foam.dao.TimingDAO'
  ],

  imports: [ 'document' ],

  help: 'A facade for easy DAO setup.',

  documentation: function() {/*
    <p>If you don't know which $$DOC{ref:'DAO'} implementation to choose, $$DOC{ref:'foam.dao.EasyDAO'} is
    ready to help. Simply <code>this.X.EasyDAO.create()</code> and set the flags
    to indicate what behavior you're looking for. Under the hood, $$DOC{ref:'foam.dao.EasyDAO'}
    will create one or more $$DOC{ref:'DAO'} instances to service your requirements.
    </p>
    <p>Since $$DOC{ref:'foam.dao.EasyDAO'} is a proxy, just use it like you would any other
    $$DOC{ref:'DAO'}, without worrying about the internal $$DOC{ref:'DAO'} doing the
    work.
    </p>
  */},

  properties: [
    {
      name: 'name',
      defaultValueFn: function() { return this.model.id; },
      documentation: "The developer-friendly name for this $$DOC{ref:'.'}."
    },
    {
      type: 'Boolean',
      name: 'seqNo',
      defaultValue: false,
      documentation: "Have $$DOC{ref:'.'} use a sequence number to index items. Note that $$DOC{ref:'.seqNo'} and $$DOC{ref:'.guid'} features are mutually exclusive."
    },
    {
      type: 'Boolean',
      name: 'guid',
      label: 'GUID',
      defaultValue: false,
      documentation: "Have $$DOC{ref:'.'} generate guids to index items. Note that $$DOC{ref:'.seqNo'} and $$DOC{ref:'.guid'} features are mutually exclusive."
    },
    {
      name: 'seqProperty',
      type: 'Property',
      documentation: "The property on your items to use to store the sequence number or guid. This is required for $$DOC{ref:'.seqNo'} or $$DOC{ref:'.guid'} mode."
    },
    {
      type: 'Boolean',
      name: 'cache',
      defaultValue: false,
      documentation: "Enable local caching of the $$DOC{ref:'DAO'}."
    },
    {
      type: 'Boolean',
      name: 'dedup',
      defaultValue: false,
      documentation: "Enable value de-duplication to save memory when caching."
    },
    {
      type: 'Boolean',
      name: 'logging',
      defaultValue: false,
      documentation: "Enable logging on the $$DOC{ref:'DAO'}."
    },
    {
      type: 'Boolean',
      name: 'timing',
      defaultValue: false,
      documentation: "Enable time tracking for concurrent $$DOC{ref:'DAO'} operations."
    },
    {
      type: 'Boolean',
      name: 'contextualize',
      defaultValue: false,
      documentation: "Contextualize objects on .find"
    },
    {
      type: 'Boolean',
      name: 'cloning',
      defaultValue: false,
      documentation: "True to clone results on select"
    },
    {
      name: 'daoType',
      defaultValue: 'foam.dao.IDBDAO',
      documentation: function() { /*
          <p>Selects the basic functionality this $$DOC{ref:'foam.dao.EasyDAO'} should provide.
          You can specify an instance of a DAO model definition such as
          $$DOC{ref:'MDAO'}, or a constant indicating your requirements.</p>
          <p>Choices are:</p>
          <ul>
            <li>$$DOC{ref:'.ALIASES',text:'IDB'}: Use IndexDB for storage.</li>
            <li>$$DOC{ref:'.ALIASES',text:'LOCAL'}: Use local storage (for Chrome Apps, this will use local, non-synced storage).</li>
            <li>$$DOC{ref:'.ALIASES',text:'SYNC'}: Use synchronized storage (for Chrome Apps, this will use Chrome Sync storage).</li>
          </ul>
       */}
    },
    {
      type: 'Boolean',
      name: 'autoIndex',
      defaultValue: false,
      documentation: "Automatically generate an index."
    },
    {
      type: 'Array',
      name: 'migrationRules',
      subType: 'foam.core.dao.MigrationRule',
      documentation: "Creates an internal $$DOC{ref:'MigrationDAO'} and applies the given array of $$DOC{ref:'MigrationRule'}."
    },
    {
      type: 'Boolean',
      name: 'syncWithServer'
    },
    {
      type: 'Boolean',
      name: 'sockets',
      defaultValue: false
    },
    {
      type: 'String',
      name: 'serverUri',
      defaultValueFn: function() {
        return this.document && this.document.location ?
            this.document.location.origin + '/api' :
            '';
      }
    },
    {
      type: 'Boolean',
      name: 'isServer',
      defaultValue: false
    },
    {
      name: 'syncProperty'
    },
    {
      name: 'deletedProperty'
    }
  ],

  constants: {
    // Aliases for daoType
    ALIASES: {
      IDB:   'foam.dao.IDBDAO',
      LOCAL: 'foam.core.dao.StorageDAO', // Switches to 'ChromeStorageDAO' for Chrome Apps
      SYNC:  'foam.core.dao.StorageDAO'  // Switches to 'ChromeSyncStorageDAO' for Chrome Apps
    }
  },

  methods: [
    function init(args) {
      /*
        <p>On initialization, the $$DOC{ref:'.'} creates an appropriate chain of
        internal $$DOC{ref:'DAO'} instances based on the $$DOC{ref:'.'}
        property settings.</p>
        <p>This process is transparent to the developer, and you can use your
        $$DOC{ref:'.'} like any other $$DOC{ref:'DAO'}.</p>
      */
      this.SUPER(args);

      if ( window.chrome && chrome.storage ) {
        this.ALIASES.LOCAL = 'foam.core.dao.ChromeStorageDAO';
        this.ALIASES.SYNC  = 'foam.core.dao.ChromeSyncStorageDAO';
      }

      var daoType  = typeof this.daoType === 'string' ? this.ALIASES[this.daoType] || this.daoType : this.daoType;
      var daoModel = typeof daoType === 'string' ? this.X.lookup(daoType) : daoType;
      var params   = { model: this.model, autoIndex: this.autoIndex };

      if ( ! daoModel ) {
        console.warn("EasyDAO: Unknown DAO Type.  Add '" + daoType + "' to requires: list.");
      }

      if ( this.name  ) params.name = this.name;
      if ( this.seqNo || this.guid ) params.property = this.seqProperty;

      var dao = daoModel.create(params, this.Y);

      if ( MDAO.isInstance(dao) ) {
        this.mdao = dao;
        if ( this.dedup ) dao = this.DeDupDAO.create({delegate: dao}, this.Y);
      } else {
        if ( this.migrationRules && this.migrationRules.length ) {
          dao = this.MigrationDAO.create({
            delegate: dao,
            rules: this.migrationRules,
            name: this.model.id + "_" + daoModel.id + "_" + this.name
          }, this.Y);
        }
        if ( this.cache ) {
          this.mdao = this.MDAO.create(params, this.Y);
          dao = this.CachingDAO.create({
            cache: this.dedup ?
              this.mdao :
              this.DeDupDAO.create({delegate: this.mdao}),
            src: dao,
            model: this.model}, this.Y);
        }
      }

      if ( this.seqNo && this.guid ) throw "EasyDAO 'seqNo' and 'guid' features are mutually exclusive.";

      if ( this.seqNo ) {
        var args = {__proto__: params, delegate: dao, model: this.model};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = this.SeqNoDAO.create(args, this.Y);
      }

      if ( this.guid ) {
        var args = {__proto__: params, delegate: dao, model: this.model};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = this.GUIDDAO.create(args, this.Y);
      }

      var model = this.model;

      if ( this.syncWithServer && this.isServer ) throw "isServer and syncWithServer are mutually exclusive.";

      if ( this.syncWithServer || this.isServer ) {
        if ( ! this.syncProperty || ! this.deletedProperty ) {
          if ( model.traits.indexOf('foam.core.dao.SyncTrait') != -1 ) {
            // TODO(adamvy): This doesn't work without getPrototype();
            // should models be built such that getPrototype() is unnecessary?
            this.syncProperty = model.getPrototype().SYNC_PROPERTY;
            this.deletedProperty = model.getPrototype().DELETED;
          } else {
            throw "Syncing with server requires the foam.core.dao.SyncTrait be applied to your model, '" + this.model.id + "'.";
          }
        }
      }

      if ( this.syncWithServer ) {
        var syncStrategy = this.sockets ? this.SocketSyncDAO : this.PollingSyncDAO;
        dao = syncStrategy.create({
          remoteDAO: this.EasyClientDAO.create({
            serverUri: this.serverUri,
            model: model,
            sockets: this.sockets,
            reconnectPeriod: 5000
          }, this.Y),
          syncProperty: this.syncProperty,
          deletedProperty: this.deletedProperty,
          delegate: dao,
          period: 1000
        }, this.Y);
        dao.syncRecordDAO = foam.dao.EasyDAO.create({
          model: dao.SyncRecord,
          cache: true,
          daoType: this.daoType,
          name: this.name + '_SyncRecords'
        }, this.Y);
      }

      if ( this.isServer ) {
        dao = this.VersionNoDAO.create({
          delegate: dao,
          property: this.syncProperty,
          version: 2
        }, this.Y);
      }

      if ( this.contextualize ) dao = this.ContextualizingDAO.create({
        delegate: dao
      }, this.Y);

      if ( this.cloning ) dao = this.CloningDAO.create({
        delegate: dao
      }, this.Y);


      if ( this.timing  ) dao = this.TimingDAO.create({ name: this.model.plural + 'DAO', delegate: dao }, this.Y);
      if ( this.logging ) dao = this.LoggingDAO.create({ delegate: dao }, this.Y);

      this.delegate = dao;
    },

    function addIndex() {
      /* <p>Only relevant if $$DOC{ref:'.cache'} is true or if $$DOC{ref:'.daoType'}
         was set to $$DOC{ref:'MDAO'}, but harmless otherwise.</p>
         <p>See $$DOC{ref:'MDAO.addIndex', text:'MDAO.addIndex()'}.</p> */
      this.mdao && this.mdao.addIndex.apply(this.mdao, arguments);
      return this;
    },

    function addRawIndex() {
      /* <p>Only relevant if $$DOC{ref:'.cache'} is true or if $$DOC{ref:'.daoType'}
         was set to $$DOC{ref:'MDAO'}, but harmless otherwise.</p>
         <p>See $$DOC{ref:'MDAO.addRawIndex', text:'MDAO.addRawIndex()'}. */
      this.mdao && this.mdao.addRawIndex.apply(this.mdao, arguments);
      return this;
    }
  ]
});
