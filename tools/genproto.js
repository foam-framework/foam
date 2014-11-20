/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

require('../core/bootFOAMnode.js');
var fs  = require('fs');

if ( process.argv.length < 4 ) {
  console.log("USAGE: node genproto.js SOURCE_FILE MODEL_NAME [OUTPUT_FILE]")
}

var file = fs.readFileSync(process.argv[2]).toString();
eval(file);

var model = X[process.argv[3]];

var outfile = process.argv[4] || (model.name + '.proto');

fs.writeFileSync(outfile, model.protobufSource());

process.exit();
