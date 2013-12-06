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
var vm = require('vm');
var fs = require('fs');

global.document = {};
global.window = global;

var stdlibJs = fs.readFileSync('../core/stdlib.js');
vm.runInThisContext(stdlibJs);
var asyncJs = fs.readFileSync('../core/async.js');
vm.runInThisContext(asyncJs);

describe('aconstant test', function() {
  it('should return the given number 7', function(done) {
    aconstant(7)(function(n) {
      assert.equal(7, n);
      done();
    });
  });
});

var count;
var sequence;

describe('arepeat test', function() {
  it('should repeat 5 times', function(done) {
    count = 0;
    sequence = '';
    arepeat(5, function(ret) {
      ++count;
      sequence += count.toString();
      ret();
    })(function() {
      assert.equal(5, count);
      assert.equal('12345', sequence);
      done();
    });
  });
});

describe('arepeatpar test', function() {
  it('should repeat 6 times', function(done) {
    count = 0;
    arepeatpar(6, function(ret) {
      ++count;
      ret();
    })(function() {
      assert.equal(6, count);
      done();
    });
  });
});

describe('aseq test', function() {
  it('should run function in sequence', function(done) {
    count = 0;
    sequence = '';
    var asyncTester = function(ret) {
      sequence += count.toString();
      ret(++count);
    };

    aseq(asyncTester, asyncTester, asyncTester, asyncTester)(function() {
      assert.equal('0123', sequence);
      done();
    });
  });
});
