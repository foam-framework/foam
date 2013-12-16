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
var path = require('path');

// Initializing FOAM_BOOT_DIR.
global.FOAM_BOOT_DIR = '';
if (process.argv[2]) {
  global.FOAM_BOOT_DIR = path.normalize(process.argv[2]);
}

// Needed so that scripts run through runInThisContext can require other nodejs
// modules.
global.require = require;

var foamLoader = fs.readFileSync(
    path.join(global.FOAM_BOOT_DIR, 'foam_context_loader.js'));
vm.runInThisContext(foamLoader);

// For command line processing, run as
// $ node bootFOAMnode.js <FOAM_BOOT_DIR> <script> <script args>
// Arguments are passed to the script as a global.argv array.
if (process.argv[3]) {
  var scriptPathname = path.normalize(process.argv[3]);
  global.argv = process.argv.slice(4);
  filedata = fs.readFileSync(scriptPathname);
  vm.runInThisContext(filedata, scriptPathname);
}
