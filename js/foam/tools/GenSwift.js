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
  name: 'GenSwift',
  requires: [
    'foam.util.swift.SwiftSource',
  ],
  properties: [
    {
      name: 'name',
      help: 'ID of the model to serialize',
      required: true
    },
    {
      name: 'modelFile',
    },
    {
      name: 'outfile',
      require: true
    },
    {
      name: 'viewfile'
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    }
  ],
  methods: {
    execute: function() {
      if ( ! this.outfile ) {
        console.log("ERROR: outfile not specified");
        process.exit(1);
      }

      aseq(
        aif(!!this.modelFile,
            function(ret) {
              console.log("Reading model from", this.modelFile);
              var data = this.fs.readFileSync(this.modelFile).toString();
              var work = [anop];
              var model = JSONUtil.parse(this.X, data, work);

              if ( work.length > 1 ) {
                work.push(aconstant(model));
                aseq.apply(null, work)(ret);
                return;
              }
              ret(model);
            }.bind(this),
            function(ret) {
              console.log("Loading", this.name);
              this.X.arequire(this.name)(ret)
            }.bind(this)),
        function(ret, m) {
          if ( !m ) {
            console.log("ERROR: Could not load model");
            process.exit(1);
          }
          
          var template = this.SwiftSource.create()
          console.log("Writing", m.id, "swift source to", this.outfile);
          this.fs.writeFileSync(
            this.outfile,
            template.generate(m));

          if ( this.viewfile ) {
            console.log("Writing", m.name, "DetailView source to", this.viewfile);
            this.fs.writeFileSync(
              this.viewfile,
              template.genDetailView(m));
          }
          
          process.exit(0);
        }.bind(this))(function(){});
    }
  }
});
