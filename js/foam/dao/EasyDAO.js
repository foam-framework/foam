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
  extendsModel: 'foam.dao.ProxyDAO',

  requires: [
    'MDAO',
    'foam.core.dao.CloningDAO',
    'foam.core.dao.SyncTrait',
    'foam.core.dao.MigrationDAO',
    'foam.core.dao.StorageDAO',
    'foam.core.dao.SyncDAO',
    'foam.core.dao.MergeDAO',
    'foam.core.dao.VersionNoDAO',
    'foam.dao.EasyClientDAO',
    'foam.dao.CachingDAO',
    'foam.dao.ContextualizingDAO',
    'foam.dao.DeDupDAO',
    'foam.dao.GUIDDAO',
    'foam.dao.IDBDAO',
    'foam.dao.SeqNoDAO'
  ],

  imports: [
    'document'
  ],

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
      defaultValueFn: function() { return this.model.plural; },
      documentation: "The developer-friendly name for this $$DOC{ref:'.'}."
    },
    {
      model_: 'BooleanProperty',
      name: 'seqNo',
      defaultValue: false,
      documentation: "Have $$DOC{ref:'.'} use a sequence number to index items. Note that $$DOC{ref:'.seqNo'} and $$DOC{ref:'.guid'} features are mutually exclusive."
    },
    {
      model_: 'BooleanProperty',
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
      model_: 'BooleanProperty',
      name: 'cache',
      defaultValue: false,
      documentation: "Enable local caching of the $$DOC{ref:'DAO'}."
    },
    {
      model_: 'BooleanProperty',
      name: 'dedup',
      defaultValue: false,
      documentation: "Enable value de-duplication to save memory when caching."
    },
    {
      model_: 'BooleanProperty',
      name: 'logging',
      defaultValue: false,
      documentation: "Enable logging on the $$DOC{ref:'DAO'}."
    },
    {
      model_: 'BooleanProperty',
      name: 'timing',
      defaultValue: false,
      documentation: "Enable time tracking for concurrent $$DOC{ref:'DAO'} operations."
    },
    {
      model_: 'BooleanProperty',
      name: 'contextualize',
      defaultValue: false,
      documentation: "Contextualize objects on .find"
    },
    {
      model_: 'BooleanProperty',
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
      model_: 'BooleanProperty',
      name: 'autoIndex',
      defaultValue: false,
      documentation: "Automatically generate an index."
    },
    {
      model_: 'ArrayProperty',
      name: 'migrationRules',
      subType: 'foam.core.dao.MigrationRule',
      documentation: "Creates an internal $$DOC{ref:'MigrationDAO'} and applies the given array of $$DOC{ref:'MigrationRule'}."
    },
    {
      model_: 'BooleanProperty',
      name: 'syncWithServer'
    },
    {
      model_: 'StringProperty',
      name: 'serverUri',
      defaultValueFn: function() {
        return this.document.location.origin + '/api'
      }
    },
    {
      model_: 'BooleanProperty',
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
        if ( this.dedup ) dao = this.DeDupDAO.create({delegate: dao});
      } else {
        if ( this.migrationRules && this.migrationRules.length ) {
          dao = this.MigrationDAO.create({
            delegate: dao,
            rules: this.migrationRules,
            name: this.model.name + "_" + daoModel.name + "_" + this.name
          }, this.Y);
        }
        if ( this.cache ) {
          this.mdao = this.MDAO.create(params);
          dao = this.CachingDAO.create({
            cache: this.dedup ?
              this.mdao :
              this.DeDupDAO.create({delegate: this.mdao}),
            src: dao,
            model: this.model});
        }
      }

      if ( this.seqNo && this.guid ) throw "EasyDAO 'seqNo' and 'guid' features are mutually exclusive.";

      if ( this.seqNo ) {
        var args = {__proto__: params, delegate: dao, model: this.model};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = this.SeqNoDAO.create(args);
      }

      if ( this.guid ) {
        var args = {__proto__: params, delegate: dao, model: this.model};
        if ( this.seqProperty ) args.property = this.seqProperty;
        dao = this.GUIDDAO.create(args);
      }

      if ( this.contextualize ) dao = this.ContextualizingDAO.create({
        delegate: dao
      });

      if ( this.cloning ) dao = this.CloningDAO.create({
        delegate: dao
      });

      var model = this.model;

      if ( this.syncWithServer && this.isServer ) throw "isServer and syncWithServer are mutually exclusive.";

      if ( this.syncWithServer || this.isServer ) {
        if ( ! this.syncProperty || ! this.deletedProperty ) {
          if ( model.traits.indexOf('foam.core.dao.SyncTrait') != -1 ) {
            this.syncProperty = model.SYNC_PROPERTY;
            this.deletedProperty = model.DELETED;
          } else {
            throw "Syncing with server requires the foam.core.dao.SyncTrait be applied to your model.";
          }
        }
      }

      if ( this.syncWithServer ) {
        dao = this.SyncDAO.create({
          model: model,
          delegate: dao,
          remoteDAO: this.EasyClientDAO.create({
            serverUri: this.serverUri,
            model: model,
          }),
          syncProperty: this.syncProperty,
          deletedProperty: this.deletedProperty,
          syncRecordDAO: foam.dao.EasyDAO.create({
            model: this.SyncDAO.SyncRecord,
            cache: true,
            daoType: this.daoType,
            name: this.name + '_SyncRecords'
          })
        });
        window.setInterval(function() { this.sync(); }.bind(dao), 1000);
      }

      if ( this.isServer ) {
        dao = this.VersionNoDAO.create({
          delegate: dao,
          property: this.syncProperty,
          version: 2
        });
      }

      if ( this.timing  ) dao = TimingDAO.create(this.name + 'DAO', dao);
      if ( this.logging ) dao = LoggingDAO.create(dao);

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
