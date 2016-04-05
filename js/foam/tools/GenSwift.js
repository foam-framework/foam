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
    }
  ],
  methods: {
    execute: function() {
      if ( ! this.outfolder) {
        console.log("ERROR: outfolder not specified");
        process.exit(1);
      }

      var blacklist = this.blacklist && this.blacklist.split(' ') || [];
      var names = this.names && this.names.split(' ') || [];
      names = names.concat([
        // MLangs required by MLang.swift.
        'AndExpr',
        'BINARY',
        'ConstantExpr',
        'EqExpr',
        'Expr',
        'FalseExpr',
        'NARY',
        'TrueExpr',
        'UNARY',
        // Required if a property is imported.
        'ImportedProperty',
        // Required for DAO support and not required by AbstractDAO.
        'FilteredDAO_',
        'foam.dao.swift.ArraySink',
        'foam.dao.swift.ClosureSink',
        'foam.dao.swift.DAOQueryOptions',
        'foam.dao.swift.PredicatedSink',
        'foam.dao.swift.RelaySink',
      ]);
      this.name && names.push(this.name);
      names = names.filter(function(n) { return n; });
      var i = 0;
      awhile(function() { return i < names.length },
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
              process.exit(1);
            }

            var template = this.SwiftSource.create()
            var destination = this.outfolder + '/' + m.name + '.swift';
            console.log("Writing", m.id, "swift source to", destination);
            this.fs.writeFileSync(
              destination,
              template.generate(m));

            if (m.getAllRequires) {
              m = template.prepModel(m);
              m.getAllRequires && m.getAllRequires().forEach(function(dep) {
                if (dep && names.indexOf(dep) == -1 &&
                    blacklist.indexOf(dep) == -1) {
                  console.log('Adding dependency', dep);
                  names.push(dep);
                }
              });
            }

            i++;
            ret();
          }.bind(this))
        )(function(){
          process.exit(0);
        });
    }
  }
});
