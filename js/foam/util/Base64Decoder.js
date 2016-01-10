/*
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
   "package": "foam.util",
   "name": "Base64Decoder",

   "properties": [
      {
         type: 'Int',
         "name": "bufsize",
         "help": "Size of the internal buffer to use.",
         "defaultValue": 512
      },
      {
         model_: "Property",
         "name": "buffer",
         "factory": function () {
        return new ArrayBuffer(this.bufsize);
      }
      },
      {
         type: 'Int',
         "name": "pos",
         "defaultValue": 0
      },
      {
         type: 'Int',
         "name": "chunk",
         "defaultValue": 3
      },
      {
         model_: "Property",
         "name": "sink",
         "factory": function () { return [].sink; }
      }
   ],
   "actions": [],
   "constants": [
      {
         model_: "Constant",
         "name": "TABLE",
         "value":          {
                        "0": 52,
            "1": 53,
            "2": 54,
            "3": 55,
            "4": 56,
            "5": 57,
            "6": 58,
            "7": 59,
            "8": 60,
            "9": 61,
            "A": 0,
            "B": 1,
            "C": 2,
            "D": 3,
            "E": 4,
            "F": 5,
            "G": 6,
            "H": 7,
            "I": 8,
            "J": 9,
            "K": 10,
            "L": 11,
            "M": 12,
            "N": 13,
            "O": 14,
            "P": 15,
            "Q": 16,
            "R": 17,
            "S": 18,
            "T": 19,
            "U": 20,
            "V": 21,
            "W": 22,
            "X": 23,
            "Y": 24,
            "Z": 25,
            "a": 26,
            "b": 27,
            "c": 28,
            "d": 29,
            "e": 30,
            "f": 31,
            "g": 32,
            "h": 33,
            "i": 34,
            "j": 35,
            "k": 36,
            "l": 37,
            "m": 38,
            "n": 39,
            "o": 40,
            "p": 41,
            "q": 42,
            "r": 43,
            "s": 44,
            "t": 45,
            "u": 46,
            "v": 47,
            "w": 48,
            "x": 49,
            "y": 50,
            "z": 51,
            "+": 62,
            "/": 63,
            "-": 62,
            "_": 63
         }
      }
   ],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "lookup",
         "code": function (data) {
      return this.TABLE[data];
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "put",
         "code": function (data) {
      var tmp = 0;
      this.view = new DataView(this.buffer);

      for(var i = 0; i < data.length; i++) {
        if (data[i] == '=') break;

        var value = this.lookup(data[i]);
        if (value === undefined) continue; // Be permissive, ignore unknown characters.

        tmp = tmp | (value << (6*this.chunk));
        if (this.chunk == 0) {
          this.emit(3, tmp);
          tmp = 0;
          this.chunk = 3;
        } else {
          this.chunk -= 1;
        }
      }

      if (data[i] == '=') {
        i++;
        if (i < data.length) {
          if (data[i] == '=') {
            this.emit(1, tmp);
          }
        } else {
          this.emit(2, tmp);
        }
      }
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "emit",
         "code": function (bytes, tmp) {
      for(var j = 0; j < bytes; j++) {
        this.view.setUint8(this.pos,
                           (tmp >> ((2-j)*8)) & 0xFF);
        this.pos += 1;
        if (this.pos >= this.buffer.byteLength ) {
          this.sink.put(this.buffer);
          this.buffer = new ArrayBuffer(this.bufsize);
          this.view = new DataView(this.buffer);
          this.pos = 0;
        }
      }
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "eof",
         "code": function () {
      this.sink.put(this.buffer.slice(0, this.pos));
      this.sink.eof && this.sink.eof();
    },
         "args": []
      }
   ],
   "listeners": [],
   "templates": [],
   "models": [],
   "tests": [],
   "relationships": [],
   "issues": []
});
