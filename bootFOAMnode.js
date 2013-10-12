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
var fs = require('fs');
var vm = require('vm');

if (process.argv[2]) {
  var FOAM_BOOT_DIR = process.argv[2] + '/';
} else {
  FOAM_BOOT_DIR = '';
}

var modelsfiles = fs.readFileSync(FOAM_BOOT_DIR + 'FOAMmodels.js', 'utf8');

global.window = global;
global.document = {
  window: global
};

vm.runInThisContext(modelsfiles);

for (var i = 0; i < files.length; i++) {
    console.log("loading ", FOAM_BOOT_DIR + files[i]);
    var filedata = fs.readFileSync(FOAM_BOOT_DIR + files[i] + '.js', 'utf8');
    vm.runInThisContext(filedata, files[i] + ".js");
}

// For command line processing, run as
// $ node bootFOAMnode.js <FOAM_BOOT_DIR> <command> <args>
// Commands are located in the tools subdirectory
// Arguments are passed to the command as a global argv array
if (process.argv[3]) {
  var command = process.argv[3];
  global.argv = process.argv.slice(4);
  global.fs = fs;
  global.vm = vm;
  filedata = fs.readFileSync(FOAM_BOOT_DIR + "tools/" + command + ".js", 'utf8');
  vm.runInThisContext(filedata, "tools/" + command + ".js");
}
