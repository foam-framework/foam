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
function utf8tostring(bytes) {
    var first;
    var chars = "";
    var j = 0;
    for (var i = 0; i < bytes.length; i++) {
        var charcode = 0;
        charcode = bytes[i];
        var remaining;
        if (!(charcode & 0x80)) {
            remaining = 0;
            charcode &= 0x7f;
        } else if ((charcode & 0xe0) == 0xc0) {
            remaining = 1;
            charcode &= 0x1f;
        } else if ((charcode & 0xf0) == 0xe0) {
            remaining = 2;
            charcode &= 0x0f;
        } else if ((charcode & 0xf8) == 0xf0) {
            remaining = 3;
            charcode &= 0x07;
        } else if ((charcode & 0xfc) == 0xf8) {
            remaining = 4;
            charcode &= 0x03;
        } else if ((charcode & 0xfe) == 0xfc) {
            remaining = 5;
            charcode &= 0x01;
        } else return undefined;
        for (var j = 0; j < remaining && j + i < bytes.length; j++) {
            charcode |= (bytes[i+j] & 0x7f) << (6 * j);
        }
        // NOTE: Turns out fromCharCode can't handle all unicode code points.
        // We need fromCodePoint from ES 6 before this will work properly.
        // However it should be good enough for most cases.
        chars += String.fromCharCode(charcode);
    }
    return chars;
}

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
