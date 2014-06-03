/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
String.fromCharCode = (function() {
  var oldLookup = String.fromCharCode;
  var lookupTable = [];
  return function(a) {
    if (arguments.length == 1) return lookupTable[a] || (lookupTable[a] = oldLookup(a));
    var result = "";
    for (var i = 0; i < arguments.length; i++) {
      result += lookupTable[arguments[i]] || (lookupTable[arguments[i]] = oldLookup(arguments[i]));
    }
    return result;
  };
})();

// WARNING: This is a hastily written UTF-8 decoder it probably has bugs.
var IncrementalUtf8 = {
  create: function() {
    return {
      __proto__: this,
      charcode: undefined,
      remaining: 0,
      string: ''
    };
  },

  reset: function() {
    this.string = '';
    this.remaining = 0;
    this.charcode = undefined;
  },

  put: function(byte) {
    if (this.charcode == undefined) {
      this.charcode = byte;
      if (!(this.charcode & 0x80)) {
        this.remaining = 0;
        this.charcode = (byte & 0x7f) << (6 * this.remaining);
      } else if ((this.charcode & 0xe0) == 0xc0) {
        this.remaining = 1;
        this.charcode = (byte & 0x1f) << (6 * this.remaining);
      } else if ((this.charcode & 0xf0) == 0xe0) {
        this.remaining = 2;
        this.charcode = (byte & 0x0f) << (6 * this.remaining);
      } else if ((this.charcode & 0xf8) == 0xf0) {
        this.remaining = 3;
        this.charcode = (byte & 0x07) << (6 * this.remaining);
      } else if ((this.charcode & 0xfc) == 0xf8) {
        this.remaining = 4;
        this.charcode = (byte & 0x03) << (6 * this.remaining);
      } else if ((this.charcode & 0xfe) == 0xfc) {
        this.remaining = 5;
        this.charcode = (byte & 0x01) << (6 * this.remaining);
      } else throw "Bad charcode value";
    } else if ( this.remaining > 0 ) {
      this.remaining--;
      this.charcode |= (byte & 0x3f) << (6 * this.remaining);
    }

    if ( this.remaining == 0 ) {
      // NOTE: Turns out fromCharCode can't handle all unicode code points.
      // We need fromCodePoint from ES 6 before this will work properly.
      // However it should be good enough for most cases.
      this.string += String.fromCharCode(this.charcode);
      this.charcode = undefined;
    }
  }
};

var utf8tostring = (function() {
  var decoder = IncrementalUtf8.create();

  return function utf8tostring(bytes) {
    for ( var i = 0; i < bytes.length; i++ ) decoder.put(bytes[i]);

    var str = decoder.string;
    decoder.reset();

    return str;
  };
})();

function stringtoutf8(str) {
    var res = [];
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);

        var count = 0;
        if ( code < 0x80 ) {
            res.push(code);
            continue;
        }

        // while(code > (0x40 >> count)) {
        //     res.push(code & 0x3f);
        //     count++;
        //     code = code >> 7;
        // }
        // var header = 0x80 >> count;
        // res.push(code | header)
    }
    return res;
}
