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
  package: 'foam.core.dao.sync',
  name: 'SocketSyncDAO',
  extends: 'foam.core.dao.SyncDAO',
  help: 'Socket based sync strategy.  Listens on remote dao and syncs on put/remove',
  methods: [
    function init() {
      this.SUPER();
      var self = this;
      this.remoteDAO.listen({
        put: function(o) {
          self.processFromServer(o);
        },
        remove: function(o) {
          debugger;
        },
        reset: function() {
          self.sync();
        }
      });
    },
    function put(obj, sink) {
      var self = this;
      this.SUPER(obj, {
        put: function() {
          self.sync();
          sink && sink.put && sink.put.apply(sink, arguments);
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      });
    },
    function remove(obj, sink) {
      var self = this;
      this.SUPER(obj, {
        remove: function() {
          self.sync();
          sink && sink.remove && sink.remove.apply(sink, arguments);
        },
        error: function() {
          sink && sink.error && sink.error.apply(sink, arguments);
        }
      });
    }
  ],
  listeners: [
    {
      name: 'onConnect',
      code: function() {
        this.sync();
      }
    }
  ]
});
