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

require('../core/bootFOAMnode.js');

arequire(process.argv[2])(function(model) {
  if ( ! model ) {
    console.log('ERRROR: Could not find model', process.argv[2]);
    process.exit(1);
  }

  function usage(m) {
    console.log(m.id, ' options:');
    for ( var i = 0 ; i < m.properties.length ; i++ ) {
      console.log("  ", m.properties[i].name, ': ', m.properties[i].help);
    }
    console.log('');
    console.log('');
    if ( m.extendsModel ) usage(X.lookup(m.extendsModel));
  }

  if ( process.argv[3] == '--help' ) {
    usage(model);
    return;
  }

  var args = {};
  for ( var i = 3; i < process.argv.length; i++ ) {
    var regex = /[^\\]=/g;
    var matched = regex.exec(process.argv[i]);
    if ( matched ) {
      var key = process.argv[i].substring(0, regex.lastIndex - 1)
      var value = process.argv[i].substring(regex.lastIndex);
    } else {
      key = process.argv[i];
      value = true;
    }

    args[key] = value;
  }

  model.create(args).execute();
});
