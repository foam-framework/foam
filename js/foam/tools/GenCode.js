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
  name: 'GenCode',
  properties: [
    {
      name: 'name',
      help: 'ID of the model to serialize',
    },
    {
      name: 'names',
      help: 'space separated list of files.',
    },
    {
      name: 'blacklist',
      help: 'space separated list of files to not include (which can happen ' +
          'when adding dependencies).',
    },
    {
      name: 'modelFile',
    },
    {
      name: 'outfolder',
      require: true
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
    {
      name: 'template',
    },
    {
      name: 'fileNameProperty',
      defaultValue: 'name',
    },
    {
      name: 'fileExtension',
    },
    {
      name: 'requiredDeps',
      defaultValue: [],
    },
  ],
  methods: [
    function genCode() {
      var fut = afuture();
      if ( ! this.outfolder) {
        console.log("ERROR: outfolder not specified");
        fut.set(false);
      }

      var blacklist = this.blacklist && this.blacklist.split(' ') || [];
      var modelsGenerated = [];
      var names = this.names && this.names.split(' ') || [];
      names = names.concat(this.requiredDeps);
      names.push(
        // Required if a property is imported.
        'ImportedProperty'
      );
      this.name && names.push(this.name);
      names = names.filter(function(n) { return n; });
      var i = 0;
      awhile(function() { return !fut.isSet() && i < names.length },
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
                var name = names[i];
                console.log("Loading", name);
                this.X.arequire(name)(ret)
              }.bind(this)),
          function(ret, m) {
            if (m.getPrototype) m = m.getPrototype().model_
            if ( !m ) {
              console.log("ERROR: Could not load model");
              fut.set(false);
              ret();
              return;
            }

            var template = this.template.create()
            var destination =
                this.outfolder + '/' + m[this.fileNameProperty] + '.' + this.fileExtension;
            console.log(
                "Writing", m.id, this.fileExtension, "source to", destination);
            this.fs.writeFileSync(
              destination,
              template.generate(m));
            modelsGenerated.push(m);

            var requires = [];
            if (m.getAllRequires) {
              m = template.prepModel(m);
              if (m.getAllRequires) {
                requires = requires.concat(m.getAllRequires());
              }
            }
            requires = requires.concat(this.getExtraRequires(m));

            requires.forEach(function(dep) {
              if (dep && names.indexOf(dep) == -1 &&
                  blacklist.indexOf(dep) == -1) {
                console.log('Adding dependency', dep);
                names.push(dep);
              }
            });

            i++;
            ret();
          }.bind(this))
        )(function(){
          fut.set(modelsGenerated);
        });
      return fut.get;
    },
    function execute() {
      this.genCode()(function(success) {
        process.exit(success ? 0 : 1);
      });
    },
    function getExtraRequires(m) {
      return [];
    },
  ],
});
