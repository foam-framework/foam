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
var assert = require('assert');

function decode(str) {
  var decoder = Base64Decoder.create([]);
  decoder.put(str);
  decoder.eof();
  return decoder.sink;
}

function ab2String(buffer) {
  var view = new Uint8Array(buffer[0]);
  var result = '';
  for (var i = 0; i < buffer[0].byteLength; ++i) {
    result += String.fromCharCode(view[i]);
  }
  return result;
}

function string2ab(str) {
  var buffer = new ArrayBuffer(str.length);
  var view = new Uint8Array(buffer);
  for (var i = 0; i < buffer.byteLength; ++i) {
    view[i] = str.charCodeAt(i);
  }
  return buffer;
}

describe('Base64 test', function() {
  it('zero length', function() {
    var encodedString = Base64Encoder.encode(string2ab(''));
    assert.equal('', encodedString);
    assert.equal('', ab2String(decode(encodedString)));
  });

  it('1 char', function() {
    var encodedString = Base64Encoder.encode(string2ab('A'));
    assert.equal('QQ==', encodedString);
    assert.equal('A', ab2String(decode(encodedString)));
  });

  it('2 chars', function() {
    var encodedString = Base64Encoder.encode(string2ab('AB'));
    assert.equal('QUI=', encodedString);
    assert.equal('AB', ab2String(decode(encodedString)));
  });

  it('3 chars', function() {
    var encodedString = Base64Encoder.encode(string2ab('ABC'));
    assert.equal('QUJD', encodedString);
    assert.equal('ABC', ab2String(decode(encodedString)));
  });

  it('4 chars', function() {
    var encodedString = Base64Encoder.encode(string2ab('ABCD'));
    assert.equal('QUJDRA==', encodedString);
    assert.equal('ABCD', ab2String(decode(encodedString)));
  });

  it('All chars', function() {
    var buffer = new ArrayBuffer(256);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < 256; ++i) {
      view[i] = i;
    }
    var encodedString = Base64Encoder.encode(buffer);
    var EXPECTED_RESULTS =
        'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIj' +
        'JCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZH' +
        'SElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWpr' +
        'bG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6P' +
        'kJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKz' +
        'tLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX' +
        '2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7' +
        '/P3+/w==';
    assert.equal(EXPECTED_RESULTS, encodedString);
    var decodedBuffer = decode(encodedString)[0];
    assert.equal(256, decodedBuffer.byteLength);
    var decodedView = new Uint8Array(decodedBuffer);
    for (var i = 0; i < 256; ++i) {
      assert.equal(i, decodedView[i]);
    }
  });
});

