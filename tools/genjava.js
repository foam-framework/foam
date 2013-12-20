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

/**
 * Generates the java source for models specified on command-line and writes them to files.
 */
require('../core/bootFOAMnode.js');
var fs = require('fs');

for ( var i = 2 ; i < process.argv.length ; i++ ) {
  var model = GLOBAL[process.argv[i]];
  var outfile = model.javaClassName + ".java";

  model.create();
  fs.writeFileSync(outfile, model.javaSource());
}

process.exit();
