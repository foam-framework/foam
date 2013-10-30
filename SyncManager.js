/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
         name:  'issuesSynced'
      },
      {
         model_: 'IntegerProperty',
         name:  'timesSynced'
      },
      {
         model_: 'IntegerProperty',
         name:  'syncInterval',
         units: 's',
         defaultValue: 60
      },
      {
         model_: 'IntegerProperty',
         name:  'delay',
         label: 'Delay',
         help:  'Interval of time between repeating sync.',
         units: 's',
         defaultValue: 0
      },
      {
         model_: 'IntegerProperty',
         name:  'batchSize',
         defaultValue: 100
      },
      {
         model_: 'StringProperty',
         name:  'syncStatus',
         displayWidth: 60
      },
      {
         model_: 'IntegerProperty',
         name:  'lastBatchSize'
      },
      {
         model_: 'IntegerProperty',
         name:  'lastSyncDuration',
         units: 'ms'
      },
      {
         model_: 'BooleanProperty',
         name:  'isSyncing'
      },
      {
         model_: 'BooleanProperty',
         name:  'enabled'
      },
      {
         model_: 'StringProperty',
         name:  'lastId'
      },
      {
         model_: 'DateTimeProperty',
         name:  'lastModified'
      }
   ],

   actions: [
      {
         model_: 'Action',
         name:  'start',
         label: 'Start',
         help:  'Start the timer.',

         isEnabled:   function() { return ! this.enabled; },
         action:      function() { this.enabled = true; this.sync(); }
      },
      {
         model_: 'Action',
         name:  'forceSync',
         label: 'Force Sync',
         help:  'Force a sync.',

         action: function()      {
           clearTimeout(this.timer);
           this.sync();
         }
      },
      {
         model_: 'Action',
         name:  'stop',
         label: 'Stop',
         help:  'Stop the timer.',

         isEnabled: function()   { return this.enabled; },
         action: function()      { this.enabled = false; clearTimeout(this.timer); }
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
        this.syncStatus = 'syncing...';
        this.srcDAO
          .limit(batchSize)
          .where(GT(this.modifiedProperty, this.lastModified))
          .select()(function(issues) {
            self.syncStatus = 'processing sync data';
            self.timesSynced++;
            self.lastBatchSize = issues.length;

            // issues.select(console.log.json); // TODO: for debugging, remove
            issues.select(self.dstDAO)(function() {
              self.lastSyncDuration = Date.now() - startTime;
              self.syncStatus = '';

              self.issuesSynced += issues.length;

              if ( issues.length ) {
                var issue = issues[issues.length-1];
                self.lastId = issue.id;
                self.lastModified = new Date(
                  Math.max(
                    self.lastModified.getTime() + 1000,
                    issue.updated.getTime()));
              }

              self.isSyncing = false;

              self.schedule(issues.length ?
                self.delay :
                self.syncInterval);
            });
          });
      },
      schedule: function(syncInterval) {
         if ( ! this.enabled ) return;

         this.timer = setTimeout(this.sync.bind(this), syncInterval * 1000);
      }
   }
});
