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

CLASS({
  package: 'foam.tools',
  name: 'GenAndroidJava',
  requires: [
    'foam.util.JavaSource as AndroidJavaSource'
  ],
  properties: [
    {
      name: 'modelNames',
      type: 'StringArray',
      adapt: function(_, a) {
        if ( typeof a == "string" ) {
          return a
            .split(" ")
            .map(function(s) { return s.split(","); })
            .reduce(function(a, b) { return a.concat(b); });
        }
        return a;
      }
    },
    {
      name: 'outfile',
      help: 'The destination file to write the helpful to.',
      required: true
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'fs'
    }
  ],
  methods: [
    function execute() {
      var loads = [];
      for ( var i = 0 ; i < this.modelNames.length ; i++ ) {
        loads.push(arequire(this.modelNames[i]));
      }

      loads.push(
        function(ret) {
          var template = this.AndroidJavaSource.create();

          for ( var i = 0 ; i < this.modelNames.length ; i++ ) {
            if ( ! this.X.lookup(this.modelNames[i]) ) {
              this.error("Could not load model", this.modelNames[i]);
              process.exit(1);
            }
            this.fs.writeFileSync(
              this.outfile,
              template.generate(this.X.lookup(this.modelNames[i])));
          }

          ret();
        }.bind(this));

      aseq.apply(null, loads)(function() {
        process.exit(0);
      });
    }
  ]
});
