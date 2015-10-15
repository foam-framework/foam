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

global.DEBUG = true;

var FOAMargs = process.argv.slice(2);

(function() {
  var args = {
    "classpath": null,
    "flags": null,
    "extraProperties": null
  };

  while (FOAMargs[0].indexOf('--') == 0 ) {
    var keys = Object.keys(args);
    for ( var i = 0; i < keys.length ; i++ ) {
      var argname = keys[i];
      if ( FOAMargs[0].indexOf('--' + keys[i]) == 0 ) {
        var arg = FOAMargs.shift();
        if ( arg[keys[i].length + 2] == '=' ) {
          arg = arg.substring(keys[i].length + 3);
        } else {
          arg = FOAMargs.shift();
        }
        args[keys[i]] = arg;
      }
    }
  }

  if ( args.classpath )
    var CLASSPATH = args.classpath.split(',');

  if ( args.flags ) {
    args.flags = args.flags.split(',');
    var f = {};
    for ( var i = 0 ; i < args.flags.length ; i++ ) {
      f[args.flags[i]] = true;
    }
    global.FLAGS = f;
  }

  if ( args.extraProperties ) global.__EXTRA_PROPERTIES__ = args.extraProperties;

  require('../core/bootFOAMnode.js');

  if ( CLASSPATH ) {
    for ( var i = 0 ; i < CLASSPATH.length ; i++ ) {
      X.ModelDAO = X.foam.core.bootstrap.OrDAO.create({
        delegate: X.node.dao.ModelFileDAO.create({
          classpath: CLASSPATH[i]
        }),
        primary: X.ModelDAO
      });
    }
  }

  arequire(FOAMargs[0])(function(model) {
    if ( ! model ) {
      console.log('ERRROR: Could not find model', FOAMargs[0]);
      process.exit(1);
    }

    function usage(m) {
      console.log(m.id, ' options:');
      for ( var i = 0 ; i < m.properties.length ; i++ ) {
        console.log("  ", m.properties[i].name, ': ', m.properties[i].help);
      }
      console.log('');
      console.log('');
      if ( m.extends ) usage(X.lookup(m.extends));
    }

    if ( FOAMargs[1] == '--help' ) {
      usage(model);
      return;
    }

    var args = {};
    for ( var i = 1; i < FOAMargs.length; i++ ) {
      var regex = /[^\\]=/g;
      var matched = regex.exec(FOAMargs[i]);
      if ( matched ) {
        var key = FOAMargs[i].substring(0, regex.lastIndex - 1)
        var value = FOAMargs[i].substring(regex.lastIndex);
      } else {
        key = FOAMargs[i];
        value = true;
      }

      args[key] = value;
    }

    model.create(args).execute();
  });
})();
