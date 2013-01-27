/*
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
        map = {
            'A': 0,
            'B': 1,
            'C': 2,
            'D': 3,
            'E': 4,
            'F': 5,
            'G': 6,
            'H': 7,
            'I': 8,
            'J': 9,
            'K': 10,
            'L': 11,
            'M': 12,
            'N': 13,
            'O': 14,
            'P': 15,
            'Q': 16,
            'R': 17,
            'S': 18,
            'T': 19,
            'U': 20,
            'V': 21,
            'W': 22,
            'X': 23,
            'Y': 24,
            'Z': 25,
            'a': 26,
            'b': 27,
            'c': 28,
            'd': 29,
            'e': 30,
            'f': 31,
            'g': 32,
            'h': 33,
            'i': 34,
            'j': 35,
            'k': 36,
            'l': 37,
            'm': 38,
            'n': 39,
            'o': 40,
            'p': 41,
            'q': 42,
            'r': 43,
            's': 44,
            't': 45,
            'u': 46,
            'v': 47,
            'w': 48,
            'x': 49,
            'y': 50,
            'z': 51,
            '0': 52,
            '1': 53,
            '2': 54,
            '3': 55,
            '4': 56,
            '5': 57,
            '6': 58,
            '7': 59,
            '8': 60,
            '9': 61,
            '+': 62,
            '/': 63,
        };
        return map[data];
    },

    create: function(sink, bufsize) {
        bufsize = bufsize || 512;

        return {
            __proto__: this,
            bufsize: bufsize,
            buffer: new ArrayBuffer(bufsize),
            pos: 0,
            chunk: 3,
            sink: sink,
        };
    },

    put: function(data) {
        var tmp = 0;
        var view = new DataView(this.buffer);

        for(var i = 0; i < data.length; i++) {
            if (data[i] == '=') break;

            var value = this.lookup(data[i]);
            if (value === undefined) continue; // Be permissive, ignore unknown characters.

            tmp = tmp | (value << (6*this.chunk));
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
        for(var j = 0; j < bytes; j++) {
            view.setUint8(this.pos,
                          (tmp >> ((2-j)*8)) & 0xFF);
            this.pos++;
            if (this.pos >= this.buffer.byteLength ) {
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
