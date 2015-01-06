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
  package: 'foam.core.dao',
  name: 'Sync',
  properties: [
    {
      name: 'local',
      hidden: true
    },
    {
      name: 'remote',
      hidden: true
    },
    {
      name: 'localVersionProp',
      hidden: true,
    },
    {
      name: 'remoteVersionProp',
      hidden: true,
    },
    {
      model_: 'IntProperty',
      name: 'syncs'
    },
    {
      model_: 'BooleanProperty',
      name: 'syncing',
      defaultValue: false
    },
    {
      model_: 'IntProperty',
      help: 'Number of objects to sync from client if client store is empty.  0 to sync them all',
      name: 'initialSyncWindow',
      defaultValue: 0
    },
    {
      model_: 'IntProperty',
      name: 'syncedFromServer',
    },
    {
      model_: 'IntProperty',
      name: 'syncedFromClient'
    }
  ],
  actions: [
    {
      name: 'sync',
      isEnabled: function() { return ! this.syncing; },
      action: function() {
        this.syncing = true;
        this.syncs += 1;

        var self = this;

        aseq(
          apar(
            aseq(
              function(ret) {
                self.local.select(MAX(self.remoteVersionProp))(function(m) {
                  ret((m && m.max) || 0);
                });
              },
              function(ret, localRemote) {
                var remote = self.remote;
                if ( localRemote == 0 && self.initialSyncWindow > 0 ) {
                  remote = remote.limit(self.initialSyncWindow);
                }
                remote = remote.where(GT(self.remoteVersionProp, localRemote));
                remote.select(SEQ(self.local, COUNT()))(ret);
              }),
            aseq(
              function(ret) {
                self.remote.select(MAX(self.localVersionProp))(function(m) {
                  ret((m && m.max) || 0);
                });
              },
              function(ret, remoteLocal) {
                var local = self.local;
                local = local.where(GT(self.localVersionProp, remoteLocal));
                local.select(SEQ(self.remote, COUNT()))(ret);
              })),
          function(ret, downstream, upstream) {
            self.syncedFromServer += downstream.args[1].count;
            self.syncedFromClient += upstream.args[1].count;
            ret();
          })(function() {
            self.syncing = false;
          });
      }
    }
  ],
});
