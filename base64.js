/**
 * @license
 * Copyright 2013 Google Inc. All Rights Reserved.
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
var Base64Decoder = {

  lookup: function(data) {
    var c = data.charCodeAt(0);
    return c == 43 ? 62 :
        c == 47 ? 63 :
        c < 58 ? c + 4 :
        c < 91 ? c - 65 : c - 71;
  },

  create: function(sink, bufsize) {
    bufsize = bufsize || 512;

    return {
      __proto__: this,
      bufsize: bufsize,
      buffer: new ArrayBuffer(bufsize),
      pos: 0,
      chunk: 3,
      sink: sink
    };
  },

  put: function(data) {
    var tmp = 0;
    var view = new DataView(this.buffer);

    for (var i = 0; i < data.length; i++) {
      if (data[i] == '=') break;

      var value = this.lookup(data[i]);
      if (value === undefined) continue; // Be permissive, ignore unknown chars.

      tmp = tmp | (value << (6 * this.chunk));
      if (this.chunk == 0) {
        this.emit(3, view, tmp);
        tmp = 0;
        this.chunk = 3;
      } else {
        this.chunk--;
      }
    }

    if (data[i] == '=') {
      i++;
      if (i < data.length) {
        if (data[i] == '=') {
          this.emit(1, view, tmp);
        }
      } else {
        this.emit(2, view, tmp);
      }
    }
  },

  emit: function(bytes, view, tmp) {
    for (var j = 0; j < bytes; j++) {
      view.setUint8(this.pos, (tmp >> ((2 - j) * 8)) & 0xFF);
      this.pos++;
      if (this.pos >= this.buffer.byteLength) {
        this.sink.put(this.buffer);
        this.buffer = new ArrayBuffer(this.bufsize);
        this.pos = 0;
      }
    }
  },

  eof: function() {
    this.sink.put(this.buffer.slice(0, this.pos));
    this.sink.eof && this.sink.eof();
  }
};
