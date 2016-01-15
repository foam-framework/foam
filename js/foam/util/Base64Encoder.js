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
  package: "foam.util",
  id: "foam.util.Base64Encoder",
  name: "Base64Encoder",
  properties: [
    {
      name: "table",
      defaultValueFn: function () { return this.TABLE; }
    },
    {
      type: 'Boolean',
      name: "urlSafe",
      postSet: function (_, v) {
        this.table = this.TABLE.clone();
        if ( v ) {
          this.table[62] = '-';
          this.table[63] = '_';
        }
      }
    }
  ],
  constants: {
    TABLE: [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "+",
      "/"
    ]
  },
  "methods": {
    encode: function(b, opt_break) {
      var result = "";
      var out;
      if ( opt_break >= 0 ) {
        var count = 0;
        out = function(c) {
          result += c;
          count = (count + 1) % opt_break;
          if ( count === 0 ) result += "\r\n";
        };
      } else {
        out = function(c) { result += c; };
      }

      var view = new Uint8Array(b);
      for ( var i = 0; i + 2 < b.byteLength; i += 3 ) {
        out(this.table[view[i] >>> 2]);
        out(this.table[((view[i] & 3) << 4) | (view[i+1] >>> 4)]);
        out(this.table[((view[i+1] & 15) << 2) | (view[i+2] >>> 6)]);
        out(this.table[view[i+2] & 63]);
      }

      if ( i < b.byteLength ) {
        out(this.table[view[i] >>> 2]);
        if ( i + 1 < b.byteLength ) {
          out(this.table[((view[i] & 3) << 4) | (view[i+1] >>> 4)]);
          out(this.table[((view[i+1] & 15) << 2)]);
        } else {
          out(this.table[((view[i] & 3) << 4)]);
          out('=');
        }
        out('=');
      }
      return result;
    }
  }
});
