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
   "package": "foam.util.encodings",
   "name": "IncrementalUtf8",

   "properties": [
      {
         model_: "Property",
        "name": "charcode",
        defaultValue: null
      },
      {
         model_: "Property",
         "name": "remaining",
         "defaultValue": 0
      },
      {
         model_: "Property",
         "name": "string"
      }
   ],
   "actions": [],
   "constants": [],
   "messages": [],
   "methods": [
      {
         model_: "Method",
         "name": "reset",
         "code": function () {
      this.string = '';
      this.remaining = 0;
      this.charcode = null;
    },
         "args": []
      },
      {
         model_: "Method",
         "name": "put",
         "code": function (byte) {
      if ( byte instanceof ArrayBuffer ) {
        var data = new Uint8Array(byte);
        for ( var i = 0; i < data.length; i++ ) {
          this.put(data[i]);
        }
        return;
      }
      if (this.charcode == null) {
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
    },
         "args": []
      }
   ]
});
