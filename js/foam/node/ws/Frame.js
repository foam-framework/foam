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
      name: 'headerState',
      postSet: function(old, f) {
        if ( typeof f !== 'function' ) {
          console.log("Set from", old, "to", f);
        }
      }
    },
    'state',
    ['length_', 0],
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
    function init() {
      console.log("Setting header state");
      this.headerState = this.frameHeader;
      console.log("Set to", this.headerState);
      this.state = this.readHeader;
    },
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

    function frameHeader(byte) {
      this.opcode = byte & 0x0f;
      this.fin = !! ( byte & 0x80 );
      this.rsv1 = !! ( byte & 0x40 );
      this.rsv2  = !! ( byte & 0x20 );
      this.rsv3 = !! ( byte & 0x10 );

      this.headerState = this.maskLength0;
    },

    function maskLength0(byte) {
      this.mask = !! ( byte & 0x80 );
      this.length_ = byte & 0x7f;

      if ( this.length_ == 126 ) {
        this.headerState = this.lengthShort0;
      } else if ( this.length_ === 127 ) {
        this.headerState = this.lengthShort1;
      } else {
        this.headerState = this.maskingKey0;
      }
    },

    function lengthShort0(byte) {
      this.length_ = 0;
      this.length_ += byte << 8;
      this.headerState = this.lengthShort1;
    },

    function lengthShort1(byte) {
      this.length_ += byte;
      this.headerState = this.maskingKey0;
    },

    function lengthLong0(byte) {
      this.length_ = 0;
      if ( byte !== 0 ) this.state = this.tooLarge;
      this.headerState = this.lengthLong1;
    },

    function lengthLong1(byte) {
      if ( byte !== 0 ) this.state = this.tooLarge;
      this.headerState = this.lengthLong2;
    },

    function lengthLong2(byte) {
      if ( byte !== 0 ) this.state = this.tooLarge;
      this.headerState = this.lengthLong3;
    },

    function lengthLong3(byte) {
      if ( byte !== 0 ) this.state = this.tooLarge;
      this.headerState = this.lengthLong4;
    },

    function lengthLong4(byte) {
      this.length_ += byte << 24;
      this.headerState = this.lengthLong5;
    },

    function lengthLong5(byte) {
      this.length_ += byte << 16;
      this.headerState = this.lengthLong6;
    },

    function lengthLong6(byte) {
      this.length_ += byte << 8;
      this.headerState = this.lengthLong7;
    },

    function lengthLong7(byte) {
      this.length_ += byte;
      this.headerState = this.maskingKey0;
    },

    function maskingKey0(byte) {
      this.length = this.length_
      this.buffer = new Buffer(this.length);
      this.bufferPos = 0;
      this.needed = this.length;

      if ( this.mask ) {
        this.masking_key = [];
        this.masking_key.push(byte);
        this.headerState = this.maskingKey1;
      } else {
        this.headerState = this.frameHeader;
        this.state = this.readData;
      }
    },

    function maskingKey1(byte) {
      this.masking_key.push(byte);
      this.headerState = this.maskingKey2;
    },

    function maskingKey2(byte) {
      this.masking_key.push(byte);
      this.headerState = this.maskingKey3;
    },

    function maskingKey3(byte) {
      this.masking_key.push(byte);
      this.headerState = this.frameHeader;
      this.state = this.readData;
    },

    function readHeader(data, i) {
      while ( this.state === this.readHeader &&
              i < data.byteLength ) {
        this.headerState(data.readUInt8(i++));
      }
      return i;
    },

    function readData(data, i) {
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
    },

    function tooLarge(data, i) {
      console.error('WebSocket payload too large');
      this.socket.end();
    },

    function onData(data, i) {
      return this.state(data, i);
    }
  ]
});
