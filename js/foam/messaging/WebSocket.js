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
  package: 'foam.messaging',
  name: 'WebSocket',
  imports: [
    'setTimeout',
    'window',
  ],
  properties: [
    {
      name: 'uri'
    },
    {
      name: 'reconnectPeriod',
      defaultValue: 0
    },
    'reconnectTimer',
    {
      name: 'socket',
      postSet: function(old, s) {
        old && old.removeEventListener("onMessage", this.onMessage);
      }
    }
  ],
  constants: {
    ON_MESSAGE: ['message'],
    ON_CONNECT: ['connect']
  },
  methods: [
    function init() {
      this.SUPER();
      this.connect();
      this.window.addEventListener('online', this.connect);
    },
    function scheduleReconnect() {
      if ( this.reconnectTimer ) return;
      if ( ! this.reconnectPeriod ) return;
      this.reconnectTimer = this.setTimeout(this.connect, this.reconnectPeriod);
    },
    function send(msg) {
      if ( ! this.socket )
        return;
      this.socket.send(msg);
    }
  ],
  listeners: [
    {
      name: 'connect',
      code: function() {
        this.reconnectTimer = 0;
        var socket = new WebSocket(this.uri);
        var self = this;
        socket.addEventListener('open', function() {
          self.socket = socket;
          self.publish(self.ON_CONNECT);
        })
        socket.addEventListener('message', this.onMessage);
        socket.addEventListener('close', function() {
          self.socket = '';
          self.scheduleReconnect();
        });
      }
    },
    {
      name: 'onMessage',
      code: function(msg) {
        this.publish(this.ON_MESSAGE, msg.data);
      }
    }
  ]
});
