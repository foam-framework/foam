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
  name: 'WebSocketDAO',
  requires: [
    'foam.messaging.WebSocket',
  ],
  extends: 'foam.core.dao.ClientDAO',
  properties: [
    {
      name: 'uri'
    },
    {
      name: 'socket',
      factory: function() {
        return this.WebSocket.create({
          uri: this.uri,
          reconnectPeriod: this.reconnectPeriod,
        });
      },
      postSet: function(_, s) {
        s.subscribe(s.ON_MESSAGE, this.onMessage);
        s.subscribe(s.ON_CONNECT, this.onConnect);
      }
    },
    {
      name: 'reconnectPeriod',
      defaultValue: 0
    },
    {
      name: 'msgid',
      defaultValue: 1
    },
    {
      name: 'pending',
      factory: function() { return {}; }
    },
    {
      name: 'json',
      factory: function() {
        return JSONUtil.where(function(prop, obj) {
	  if ( prop.transient || (Property.isInstance(obj) &&
	      prop.name !== 'name' &&
	      prop.name !== 'modelId') ) {
	    return false;
	  }
	  return true;
        });
      }
    },
    {
      name: 'asend',
      factory: function() {
        return function(ret, data) {
          var msg = this.envelope(data);
          this.pending[msg.msgid] = ret;
          this.socket.send(this.json.stringify(msg));
        }
      }
    }
  ],
  methods: [
    function envelope(msg) {
      var msgid = this.msgid;
      this.msgid += 1;
      return {
        msgid: msgid,
        msg: msg
      };
    },
    function remoteListen() {
      var self = this;
      this.asend(function(resp) {
        if ( ! resp ) {
          sink && sink.error && sink.error();
        }
      }, {
        subject: self.subject,
        method: 'listen',
        params: [null, null]
      });
    },
    function listen(sink, options) {
      if ( ! this.daoListeners_.length ) {
        this.remoteListen();
      }
      this.SUPER(sink, options);
    }
  ],
  listeners: [
    {
      name: 'onMessage',
      code: function(_, _, msg) {
        // TODO: unsafe parse
        JSONUtil.aparse(function(data) {
          if ( this.pending[data.msgid] ) {
            var ret = this.pending[data.msgid];
            delete this.pending[data.msgid];
            ret(data.msg);
            return;
          }

          if ( data.msg.notify ) {
            this.notify_(data.msg.notify[0], [data.msg.notify[1]]);
            return;
          }

          console.warn("Unknown response.");
        }.bind(this), this.X, msg);
      }
    },
    {
      name: 'onConnect',
      code: function() {
        this.remoteListen();
        this.notify_('reset', []);
      }
    }
  ]
});
