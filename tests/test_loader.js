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
var fs = require('fs');
var vm = require('vm');
var path = require('path');
var minijasminelib = require('minijasminenode');

global.FOAM_BOOT_DIR = path.resolve('../core');

// Needed so that scripts can require other nodejs modules.
global.require = require;

var foamLoader = fs.readFileSync(
    path.join(global.FOAM_BOOT_DIR, 'foam_context_loader.js'));
vm.runInThisContext(foamLoader);

var options = {
  specs: process.argv.slice(2),
  onComplete: function(runner, log) {
    if (runner.results().failedCount == 0) {
      console.log('All tests succeeded.');
      process.exit(0);
    } else {
      process.exit(1);
    }
  },
  isVerbose: false,
  showColors: true,
  includeStackTrace: true
};

minijasminelib.executeSpecs(options);
