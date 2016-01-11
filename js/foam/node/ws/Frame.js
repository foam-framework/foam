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
  name: 'Frame',
  properties: [
    ['fin', 1],
    ['rsv1',0],
    ['rsv2',0],
    ['rsv3',0],
    ['opcode',1],
    ['mask',0],
    'maskingKey',
    'buffer',
    ['bufferPos', 0],
    ['needed', 0],
    {
      type: 'Boolean',
      name: 'framing',
      defaultValue: true
    },
    {
      type: 'Boolean',
      name: 'finished',
      defaultValue: false
    },
  ],
  methods: [
    function toData() {
      this.length = this.buffer.length;
      var headerSize = this.buffer.length > 65535 ? 10 :
          (this.buffer.length > 125 ? 4 : 2);

      var i = 0;
      var buffer = new Buffer(this.buffer.length + headerSize);
      // FIN = 1, RSV1-3 = 0
      buffer.writeUInt8(
        0x80 +
          this.opcode, i++);

      var length = this.length;
      if ( length > 0xffffffff ) {
        console.error("Too large a frame to support in JS");
      } else if ( length > 65535 ) {
        buffer.writeUInt8(127, i++);
        buffer.writeUInt8(0, i++);
        buffer.writeUInt8(0, i++);
        buffer.writeUInt8(0, i++);
        buffer.writeUInt8(0, i++);
        buffer.writeUInt8((length >> 24) & 0xff, i++)
        buffer.writeUInt8((length >> 16) & 0xff, i++)
        buffer.writeUInt8((length >> 8) & 0xff, i++)
        buffer.writeUInt8((length & 0xff), i++)
      } else if ( length > 125 ) {
        buffer.writeUInt8(126, i++);
        buffer.writeUInt8((length & 0xff00) >> 8, i++)
        buffer.writeUInt8(length & 0xff, i++)
      } else {
        buffer.writeUInt8(length & 0x7f, i++);
      }

      this.buffer.copy(buffer, i);

      return buffer;
    },
    function onData(data, i) {
      if ( this.framing ) {
        var byte = data.readUInt8(i++);
        this.opcode = byte & 0x0f;
        this.fin = !! ( byte & 0x80 );
        this.rsv1 = !! ( byte & 0x40 );
        this.rsv2  = !! ( byte & 0x20 );
        this.rsv3 = !! ( byte & 0x10 );

        byte = data.readUInt8(i++);
        this.mask = !! ( byte & 0x80 );
        var length = byte & 0x7f;

        if ( length == 126 ) {
          length = 0;
          byte = data.readUInt8(i++);
          length += byte << 8;
          byte = data.readUInt8(i++);
          length += byte;
        } else if ( length == 127 ) {
          length = 0;
          var tolarge = false;
          byte = data.readUInt8(i++);
          if ( byte !== 0 ) tolarge = true;
          //length += byte << 56;

          byte = data.readUInt8(i++);
          if ( byte !== 0 ) tolarge = true;
          //length += byte << 48;

          byte = data.readUInt8(i++);
          if ( byte !== 0 ) tolarge = true;
          //length += byte << 40;

          byte = data.readUInt8(i++);
          if ( byte !== 0 ) tolarge = true;
          //length += byte << 32;

          byte = data.readUInt8(i++);
          length += byte << 24;
          byte = data.readUInt8(i++);
          length += byte << 16;
          byte = data.readUInt8(i++);
          length += byte << 8;
          byte = data.readUInt8(i++);
          length += byte;

          if ( tolarge ) {
            console.error("Payload too large.");
            this.socket.end();
            return;
          }
        }
        this.length = length;
        this.buffer = new Buffer(this.length);
        this.bufferPos = 0;
        this.needed = this.length;
        this.framing = false;

        if ( this.mask ) {
          this.masking_key = [];
          byte = data.readUInt8(i++);
          this.masking_key.push(byte);
          byte = data.readUInt8(i++);
          this.masking_key.push(byte);
          byte = data.readUInt8(i++);
          this.masking_key.push(byte);
          byte = data.readUInt8(i++);
          this.masking_key.push(byte);
        }
      }

      var amount = Math.min(data.length - i, this.needed);
      data.copy(this.buffer, this.bufferPos, i, i + amount);

      if ( this.mask ) {
        for ( var j = this.bufferPos ; j < this.bufferPos + amount; j++ ) {
          this.buffer.writeUInt8(this.buffer.readUInt8(j) ^ this.masking_key[j % 4], j);
        }
      }

      this.bufferPos += amount;
      this.needed -= amount;
      i += amount;

      if ( this.needed == 0 ) {
        this.finished = true;
      }

      return i;
    }
  ]
});
