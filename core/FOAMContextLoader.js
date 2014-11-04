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

// Initializing FOAM_BOOT_DIR.
var FOAM_BOOT_DIR = global.FOAM_BOOT_DIR || '';

global.window = global;
global.document = global;

// Loading all FOAM models.
var modelsfiles =
    fs.readFileSync(path.join(FOAM_BOOT_DIR, 'FOAMmodels.js'));
vm.runInThisContext(modelsfiles);

for (var loadingLoopIndex = 0; loadingLoopIndex < files.length; loadingLoopIndex++) {
  var filename = files[loadingLoopIndex];

  if ( Array.isArray(filename) ) {
    if ( filename[1]() ) filename = filename[0];
    else continue;
  }

  var filename = filename + '.js';
  var filedata = fs.readFileSync(path.join(FOAM_BOOT_DIR, filename));
  vm.runInThisContext(filedata, filename);
}
