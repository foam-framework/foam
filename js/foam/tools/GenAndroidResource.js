/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  name: 'GenAndroidResource',
  properties: [
    {
      name: 'names',
      help: 'space separated list of model IDs.',
      adapt: function(_, n) {
        if (typeof n == 'string') {
          return n.split(' ').filter(function(s) { return s; });
        }
        return n;
      },
    },
    {
      name: 'prependModelName',
      help: 'Whether or not the model name should be prepended to resources.',
      defaultValue: true,
      adapt: function(_, n) {
        if (n == 'true') return true;
        if (n == 'false') return false;
        return n;
      },
    },
    {
      name: 'outfile',
      require: true
    },
    {
      name: 'template',
      require: true
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    }
  ],
  methods: {
    execute: function() {
      if (!this.outfile) {
        console.log('ERROR: outfile not specified');
        process.exit(1);
      }

      var self = this;
      var i = 0;
      var models = [];
      aseq(
        awhile(
            function() { return i < self.names.length; },
            aseq(
              function(ret) {
                var name = self.names[i];
                console.log('Loading', name);
                this.X.arequire(name)(ret);
              },
              function(ret, m) {
                if (!m) {
                  console.log('ERROR: Could not load model');
                  process.exit(1);
                } else {
                  models.push(m);
                }
                i++;
                ret();
              }
            )
        ),
        function(ret) {
          var template = self.template.create({
            models: models,
            prependModelName: self.prependModelName,
          });
          self.fs.writeFileSync(
            self.outfile,
            template.generate());
          process.exit(0);
        })(function() {});
    }
  }
});
