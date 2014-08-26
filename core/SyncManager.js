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
  name: 'SyncManager',

  properties: [
    {
      name:  'queryParser',
      hidden: true,
      transient: true
    },
    {
      name:  'srcDAO',
      label: 'Source DAO',
      type:  'DAO',
      hidden: true,
      transient: true
    },
    {
      name:  'dstDAO',
      label: 'Destination DAO',
      type:  'DAO',
      hidden: true,
      transient: true
    },
    {
      name:  'modifiedProperty',
      type:  'Property',
      hidden: true,
      transient: true
    },
    {
      model_: 'IntProperty',
      name: 'itemsSynced',
      mode2: 'read-only',
      help: 'Number of items synced.'
    },
    {
      model_: 'IntProperty',
      name:  'timesSynced',
      mode2: 'read-only',
      help: 'Number of times sync has been performed.'
    },
    {
      model_: 'IntProperty',
      name:  'syncInterval',
      help: 'Delay after empty sync response.',
      units: 's',
      defaultValue: 60
    },
    {
      model_: 'IntProperty',
      name:  'delay',
      label: 'Delay',
      help:  'Delay after a non-empty sync response.',
      units: 's',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name:  'batchSize',
      help: 'Maximum number of items per sync request; 0 for unlimited.',
      defaultValue: 0
    },
    {
      model_: 'StringProperty',
      name:  'syncStatus',
      displayWidth: 40,
      help: 'Current status of the sync process.',
      transient: true
    },
    {
      model_: 'IntProperty',
      name:  'lastBatchSize',
      help: 'Number of item updates returned in last sync response.',
      transient: true
    },
    {
      model_: 'DateTimeProperty',
      name:  'lastSync',
      help: 'The time of the last sync.',
      factory: function() { return new Date(); }
    },
    {
      model_: 'DateTimeProperty',
      name:  'lastModified',
      help: 'The time of the last sync.',
      factory: function() { return new Date(); },
      transient: true
    },
    {
      model_: 'IntProperty',
      name:  'lastSyncDuration',
      help: 'Duration of last sync request.',
      units: 'ms',
      transient: true
    },
    {
      model_: 'BooleanProperty',
      name:  'enabled',
      mode2: 'read-only',
      help: 'If the Sync Manager is currently enabled to perform periodic sync requests.',
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
      model_: 'StringProperty',
      name:  'lastId',
      help: 'The id of the last item synced.',
      transient: true
    },
    {
      model_: 'StringProperty',
      name: 'query',
      displayWidth: 33,
      displayHeight: 4,
      help: 'Only sync items which match this query.'
    },
    {
      model_: 'IntProperty',
      name: 'maxSyncAge',
      defaultValue: 6 * 24 * 60 * 60 * 1000,
      help: 'How old our database is allowed to be before we just toss it and start over.'
    }
  ],

  actions: [
    {
      name:  'start',
      help:  'Start the Sync Manager.',

      isEnabled: function() {
        var enabled = this.enabled;
        var isSyncing = this.isSyncing;

        return ! this.enabled && ! isSyncing;
      },
      action: function() { this.enabled = true; this.sync(); }
    },
    {
      name:  'forceSync',
      help:  'Perform a single sync request.',

      isEnabled: function() {
        var isSyncing = this.isSyncing;

        return ! isSyncing;
      },
      action: function() {
        clearTimeout(this.timer);
        this.sync();
      }
    },
    {
      name:  'stop',
      help:  'Stop the timer.',

      // TODO: abort current sync
      isEnabled: function() {
        var enabled = this.enabled;
        var isSyncing = this.isSyncing;

        return enabled || isSyncing;
      },
      action: function() {
        this.enabled = false;
        this.abortRequest_ = true;
        clearTimeout(this.timer);
      }
    },
    {
      name:  'reset',
      help:  'Reset the Sync Manager to force a re-sync of all data.',

      isEnabled: function() { return ! this.enabled; },
      action: function(ret) {
        this.itemsSynced = 0;
        this.timesSynced = 0;
        this.lastSyncDuration = 0;
        this.lastId = '';
        this.lastSync = this.model_.LAST_SYNC.factory.call(this);;
        this.lastModified = this.model_.LAST_MODIFIED.factory.call(this);
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;
    },

    doReset: function(ret) {
      console.log("Doing reset...");
      this.reset();
      this.dstDAO.removeAll()(ret)
    },

    sync: function(ret) {
      var self = this;
      aseq(
        function(ret) {
          if ( Date.now() - self.lastSync.getTime() > self.maxSyncAge )
            self.doReset(ret);
          else
            ret();
        },
        (function(ret) {
          var batchSize = this.batchSize;
          var startTime = Date.now();
          var lastBatchSize = 0;

          this.abortRequest_ = false;
          this.isSyncing = true;
          this.syncStatus = 'Syncing...';

          var dao = this.srcDAO;

          if ( this.batchSize > 0 ) dao = dao.limit(batchSize);

          var delay = this.syncInterval;

          if ( this.queryParser && this.query ) {
            var p = this.queryParser.parseString(this.query.replace(/\s+/g, ' '));

            if ( p ) {
              p = p.partialEval();
              // console.log('sync query: ', p.toMQL());
              dao = dao.where(p);
            }
          }

          dao
            .where(GT(this.modifiedProperty, this.lastModified))
            .orderBy(this.modifiedProperty)
            .select({
              put: function(item, _, fc) {
                if ( self.abortRequest_ ) {
                  fc.stop();
                  self.abortRequest_ = false;
                }

                self.itemsSynced++;
                self.lastId = item.id;
                if ( item[self.modifiedProperty.name].compareTo(self.lastModified) > 0 ) {
                  self.lastModified = item[self.modifiedProperty.name];
                  delay = self.delay;
                }
                lastBatchSize++;
                self.dstDAO.find(item.id, {
                  put: function() {
                    self.dstDAO.put(item);
                  }
                });
                self.dstDAO.put(item);
              },
              error: function() {
                debugger;
              }
            })(function() {
              self.timesSynced++;
              self.lastSyncDuration = Date.now() - startTime;
              self.lastBatchSize = lastBatchSize;

              self.syncStatus = '';
              self.lastSync = new Date();
              self.isSyncing = false;

              self.schedule(delay);
              ret();
            });
        }).bind(this))(ret || function(){});
    },

    schedule: function(syncInterval) {
      if ( ! this.enabled ) return;

      this.timer = setTimeout(this.sync.bind(this), syncInterval * 1000);
    }
  }
});
