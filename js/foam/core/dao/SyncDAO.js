/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'SyncDAO',
  extends: 'foam.dao.ProxyDAO',
  properties: [
    {
      name: 'remoteDAO',
      transient: true,
      required: true
    },
    {
      name: 'syncRecordDAO',
      transient: true,
      required: true
    },
    {
      name: 'syncProperty',
      required: true,
      transient: true
    },
    {
      name: 'deletedProperty',
      required: true,
      transient: true
    },
    {
      name: 'model',
      required: true,

      transient: true
    }
  ],
  models: [
    {
      name: 'SyncRecord',
      properties: [
        'id',
        {
          type: 'Int',
          name: 'syncNo',
          defaultValue: -1
        },
        {
          type: 'Boolean',
          name: 'deleted',
          defaultValue: false
        }
      ]
    }
  ],
  methods: [
    function put(obj, sink) {
      this.delegate.put(obj, {
        put: function(o) {
          this.syncRecordDAO.put(
            this.SyncRecord.create({
              id: o.id,
              syncNo: -1
            }));
          sink && sink.put && sink.put(o);
        }.bind(this),
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      })
    },
    function remove(obj, sink) {
      this.delegate.remove(obj, {
        remove: function(o) {
          this.syncRecordDAO.put(
            this.SyncRecord.create({
              id: o.id,
              deleted: true,
              syncNo: -1
            }));
          sink && sink.remove && sink.remove(o);
        }.bind(this),
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      });
    },
    function processFromServer(obj) {
      this.syncRecordDAO.put(
        this.SyncRecord.create({
          id: obj.id,
          syncNo: obj[this.syncProperty.name]
        }));

      if ( obj[this.deletedProperty.name] ) {
        this.delegate.remove(obj)
      } else {
        this.delegate.put(obj, {
          error: function() {
            console.error.apply(console, arguments);
          }
        });
      }
    },
    function syncFromServer(ret) {
      this.syncRecordDAO.select(MAX(this.SyncRecord.SYNC_NO))(function(m) {
        this.remoteDAO
          .where(
            GT(this.syncProperty, m.max))
          .select({
            put: function(obj) {
              this.processFromServer(obj);
            }.bind(this)
          });
      }.bind(this));
    },
    function syncToServer(ret) {
      this.syncRecordDAO.where(EQ(this.SyncRecord.SYNC_NO, -1)).select(GROUP_BY(this.SyncRecord.DELETED,MAP(this.SyncRecord.ID, [].sink)))(function(records) {
        // handle deleted records
        if ( records.groups["true"] ) {
          for ( var i = 0 ; i < records.groups["true"].arg2.length ; i++ ) {
            var id = records.groups["true"].arg2[i];
            var obj = this.model.create({ id: id });
            obj[this.deletedProperty.name] = true;

            this.remoteDAO.put(obj, {
              put: function(obj) {
                this.delegate.remove(obj);
              }.bind(this)
            });
          }
        }

        // sync new records to server.
        if ( records.groups["false"] ) {
          var list = records.groups["false"].arg2;
          for ( var i = 0 ; i < list.length ; i++ ) {
            this.delegate.find(list[i], {
              put: function(obj) {
                this.remoteDAO.put(obj, {
                  put: function(obj) {
                    this.syncRecordDAO.put(
                      this.SyncRecord.create({
                        id: obj.id,
                        syncNo: -1 * obj[this.syncProperty.name],
                      }));
                  }.bind(this)
                });
              }.bind(this)
            });
          }
        }
      }.bind(this));
    },
    function sync() {
      this.syncToServer();
      this.syncFromServer();
    }
  ]
});
