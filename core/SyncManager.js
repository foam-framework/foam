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
var SyncManager = FOAM({
  model_: 'Model',

  name: 'SyncManager',

  properties: [
    {
      name:  'srcDAO',
      label: 'Source DAO',
      type:  'DAO',
      hidden: true
    },
    {
      name:  'dstDAO',
      label: 'Destination DAO',
      type:  'DAO',
      hidden: true
    },
    {
      name:  'modifiedProperty',
      type:  'Property',
      hidden: true
    },
    {
      model_: 'IntegerProperty',
      name: 'itemsSynced',
      help: 'Number of items synced.'
    },
    {
      model_: 'IntegerProperty',
      name:  'timesSynced',
      help: 'Number of times sync has been performed.'
    },
    {
      model_: 'IntegerProperty',
      name:  'syncInterval',
      help: 'Delay after empty sync response.',
      units: 's',
      defaultValue: 60
    },
    {
      model_: 'IntegerProperty',
      name:  'delay',
      label: 'Delay',
      help:  'Delay after a non-empty sync response.',
      units: 's',
      defaultValue: 0
    },
    {
      model_: 'IntegerProperty',
      name:  'batchSize',
      help: 'Maximum number of items per sync request.',
      defaultValue: 500
    },
    {
      model_: 'StringProperty',
      name:  'syncStatus',
      displayWidth: 40,
      help: 'Current status of the sync process.'
    },
    {
      model_: 'IntegerProperty',
      name:  'lastBatchSize',
      help: 'Number of item updates returned in last sync response.'
    },
    {
      model_: 'IntegerProperty',
      name:  'lastSyncDuration',
      help: 'Duration of last sync request.',
      units: 'ms'
    },
    {
      model_: 'BooleanProperty',
      name:  'enabled',
      help: 'If the Sync Manager is currently enabled to perform periodic sync requests.'
    },
    {
      model_: 'BooleanProperty',
      name:  'isSyncing',
      help: 'If the Sync Manager is currently syncing.'
    },
    {
      model_: 'StringProperty',
      name:  'lastId',
      help: 'The id of the last item synced.'
    },
    {
      model_: 'DateTimeProperty',
      name:  'lastModified',
      help: 'The last-modified timestamp of the most recently synced item.',
      defaultValue: new Date(0)
    }
  ],

  actions: [
    {
      model_: 'Action',
      name:  'start',
      help:  'Start the Sync Manager.',

      isEnabled: function() { return ! this.enabled; },
      action:    function() { this.enabled = true; this.sync(); }
    },
    {
      model_: 'Action',
      name:  'forceSync',
      help:  'Perform a single sync request.',

      isEnabled: function() { return ! this.enabled; },
      action: function() {
        clearTimeout(this.timer);
        this.sync();
      }
    },
    {
      model_: 'Action',
      name:  'stop',
      help:  'Stop the timer.',

      isEnabled: function() { return this.enabled; },
      action: function() { this.enabled = false; clearTimeout(this.timer); }
    },
    {
      model_: 'Action',
      name:  'reset',
      help:  'Reset the Sync Manager to force a re-sync of all data.',

      isEnabled: function() { return ! this.enabled; },
      action: function() {
        this.copyFrom(SyncManager.create());
        this.lastModified = SyncManager.LAST_MODIFIED.defaultValue;
      }
    }
  ],

  methods: {
    init: function() {
      this.SUPER();
      var self = this;

      this.dstDAO.select(MAX(this.modifiedProperty))(function (max) {
        if ( max.max ) self.lastModified = max.max;
      });
    },

    sync: function() {
      var self = this;
      var batchSize = this.batchSize;
      var startTime = Date.now();

      this.isSyncing = true;
      this.syncStatus = 'Requesting Sync...';
      this.srcDAO
        .limit(batchSize)
        .where(GT(this.modifiedProperty, this.lastModified))
        .select()(function(items) {
          self.syncStatus = 'processing sync data';
          self.timesSynced++;
          self.lastBatchSize = items.length;

          // items.select(console.log.json); // TODO: for debugging, remove
          items.select(self.dstDAO)(function() {
            self.lastSyncDuration = Date.now() - startTime;
            self.syncStatus = 'Processing ' + items.length + ' Sync Response items...';

            self.itemsSynced += items.length;

            if ( items.length ) {
              var item = items[items.length-1];
              self.lastId = item.id;
              self.lastModified = new Date(
                Math.max(
                  self.lastModified.getTime() + 1000,
                  item.updated.getTime()));
            }

            self.syncStatus = 'Finished Syncing ' + items.length + ' items at ' + new Date();;
            self.isSyncing = false;

            self.schedule(items.length ? self.delay : self.syncInterval);
          });
        });
    },

    schedule: function(syncInterval) {
      if ( ! this.enabled ) return;

      this.timer = setTimeout(this.sync.bind(this), syncInterval * 1000);
    }
  }
});
