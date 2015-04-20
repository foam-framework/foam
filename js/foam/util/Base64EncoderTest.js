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
  package: 'foam.util',
  name: 'Base64EncoderTest',
  requires: [
    'foam.util.Base64Encoder'
  ],
  imports: [
    'assert',
  ],
  properties: [
    {
      name: 'encoder',
      factory: function() { return this.Base64Encoder.create(); }
    }
  ],

  tests: [
    {
      model_: 'UnitTest',
      name: 'testBasicEncode',
      code: function() {
        var master = "/+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var data = new Uint8Array([0xff, 0xe6, 0x9b, 0x71, 0xd7, 0x9f, 0x82, 0x18, 0xa3, 0x92, 0x59, 0xa7, 0xa2, 0x9a, 0xab, 0xb2, 0xdb, 0xaf, 0xc3, 0x1c, 0xb3, 0x00, 0x10, 0x83, 0x10, 0x51, 0x87, 0x20, 0x92, 0x8b, 0x30, 0xd3, 0x8f, 0x41, 0x14, 0x93, 0x51, 0x55, 0x97, 0x61, 0x9d, 0x35, 0xdb, 0x7e, 0x39, 0xeb, 0xbf, 0x3d]);

        this.assert(this.encoder.encode(data) ===
                    master, "Testing basic base64 encoding.");
      }
    },
    {
      model_: 'UnitTest',
      name: 'testUrlSafeEncode',
      code: function() {
        var master = "_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var data = new Uint8Array([0xff, 0xe6, 0x9b, 0x71, 0xd7, 0x9f, 0x82, 0x18, 0xa3, 0x92, 0x59, 0xa7, 0xa2, 0x9a, 0xab, 0xb2, 0xdb, 0xaf, 0xc3, 0x1c, 0xb3, 0x00, 0x10, 0x83, 0x10, 0x51, 0x87, 0x20, 0x92, 0x8b, 0x30, 0xd3, 0x8f, 0x41, 0x14, 0x93, 0x51, 0x55, 0x97, 0x61, 0x9d, 0x35, 0xdb, 0x7e, 0x39, 0xeb, 0xbf, 0x3d]);

        this.encoder.urlSafe = true;
        this.assert(this.encoder.encode(data) ===
                    master, "Testing url safe base64 encoding.")
      }
    },
    {
      model_: 'UnitTest',
      name: 'testOnePadding',
      code: function() {
        var master = "AAE=";
        var data = new Uint8Array([0x00, 0x01]);
        this.assert(this.encoder.encode(data) === master,
                    "Testing encoding with one pad character");
      }
    },
    {
      model_: 'UnitTest',
      name: 'testTwoPadding',
      code: function() {
        var master = "AA==";
        var data = new Uint8Array([0x00]);
        this.assert(this.encoder.encode(data) === master,
                    "Testing encoding with two pad characters");
      }
    }
  ]
});
