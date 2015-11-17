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
  package: 'foam.node.ws',
  name: 'WebSocket',
  requires: [
    'foam.node.ws.Frame'
  ],
  properties: [
    {
      name: 'socket',
      postSet: function(old, s) {
        if ( old ) {
          old.removeListener('data', this.onData);
          old.removeListener('close', this.onClose);
        }
        this.socket.on('data', this.onData);
        this.socket.on('close', this.onClose);
      }
    },
    'opcode',
    'parts',
    'currentFrame'
  ],
  constants: {
    ON_MESSAGE: ['message'],
    ON_CLOSE: ['close']
  },
  methods: [
    function send(data) {
      if ( typeof data == "string" ) {
        var opcode = 1;
        data = new Buffer(data);
      } else {
        opcode = 2;
      }

      var frame = this.Frame.create({
        fin: 1,
        buffer: data,
        opcode: opcode
      });
      this.socket.write(frame.toData());
    },
    function close() {
      this.socket.end();
    }
  ],
  listeners: [
    {
      name: 'onClose',
      code: function() {
        this.publish(this.ON_CLOSE);
      }
    },
    {
      name: 'onFrame',
      code: function(frame) {
        if ( frame.opcode & 0x8 ) {
          if ( frame.opcode == 8 ) {
            this.socket.end();
          } else if ( frame.opcode == 9 ) {
            var resp = this.Frame.create({
              fin: 1,
              buffer: frame.buffer,
              opcode: 10
            });
            var written = this.socket.write(resp.toData());
          }
          return;
        }

        if ( frame.opcode == 1 || frame.opcode == 2) {
          this.parts = [frame.buffer];
          this.opcode = frame.opcode;
        } else if ( frame.opcode == 0 ) {
          this.parts.push(frame.buffer);
        }

        if ( frame.fin ) {
          var msg = Buffer.concat(this.parts);
          if ( this.opcode == 1 ) {
            msg = msg.toString();
          }
          this.publish(this.ON_MESSAGE, msg);
        }
      }
    },
    {
      name: 'onData',
      code: function(data) {
        var i = 0;
        while ( i < data.length ) {
          if ( ! this.currentFrame ) {
            this.currentFrame = this.Frame.create();
          }

          i = this.currentFrame.onData(data, i);
          if ( this.currentFrame.finished ) {
            var f = this.currentFrame;
            this.currentFrame = null;
            this.onFrame(f);
          }
        }
      }
    }
  ]
});
