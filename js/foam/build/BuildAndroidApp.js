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
  package: 'foam.build',
  name: 'BuildAndroidApp',

  imports: [
    'log',
    'error'
  ],
  requires: [
    'foam.dao.NodeFileDAO as FileDAO',
    'foam.dao.File',
    'foam.core.dao.OrDAO',
    'node.dao.ModelFileDAO',
    'foam.build.JavaApplication',
    'foam.util.JavaSource',
  ],
  properties: [
    {
      name: 'appDefinition'
    },
    {
      name: 'targetPath',
      help: "Directory to write output files to.  Will be created if it doesn't exist.",
      required: true
    },
    {
      type: 'String',
      name: 'icon'
    },
    {
      type: 'String',
      name: 'version'
    },
    {
      type: 'StringArray',
      name: 'extraFiles',
      help: 'Extra files to both load during the build process, and include in the built image.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      type: 'StringArray',
      name: 'extraBuildFiles',
      help: 'Extra files to load during the build process, but NOT include in the built image.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      type: 'StringArray',
      name: 'models',
      help: 'Models to include and generate code for.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; },
      factory: function() { return []; }
    },
    {
      type: 'StringArray',
      name: 'blacklistModels',
      help: 'Models to unconditionally exclude from the image, even if they are listed as required.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      name: 'path',
      factory: function() { return require('path'); }
    },
    {
      name: 'fs',
      factory: function() {
        return require('fs');
      }
    },
    {
      name: 'fileDAO',
      factory: function() { return this.FileDAO.create(); }
    },
    {
      type: 'StringArray',
      name: 'extraClassPaths',
      help: 'List of extra .js hierarchies to load models from.  Paths will be checked in the order given, finally falling back to the main FOAM js/ hierarchy.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      type: 'String',
      name: 'delegate'
    }
  ],
  methods: {
    execute: function() {
      for ( var i = 0; i < this.extraClassPaths.length ; i++ ) {
        this.X.ModelDAO = this.OrDAO.create({
          delegate: this.ModelFileDAO.create({
            classpath: this.extraClassPaths[i]
          }),
          primary: this.X.ModelDAO
        });
      }

      if ( this.appDefinition ) {
        this.X.ModelDAO.find(this.appDefinition, {
          put: function(d) {
            this.copyFrom(d);
            this.execute_();
          }.bind(this),
          error: function() {
            console.log("App definition failed");
            this.execute_();
          }.bind(this)
        });
      } else {
        this.execute_();
      }
    },
    execute_: function() {
      if ( this.delegate ) {
        arequire(this.delegate)(function(DelegateModel) {
          DelegateModel.create({ builder: this }).buildApp();
        }.bind(this));
      } else {
        this.buildApp();
      }
    },
    buildApp: function() {
      if ( ! this.targetPath ) {
        this.error("targetPath is required");
        process.exit(1);
      }

      var extraBuildFiles = this.extraBuildFiles.concat(this.extraFiles);
      for ( var i = 0 ; i < extraBuildFiles.length ; i++ ) {
        var path = this.getFilePath(extraBuildFiles[i]);
        require(path);
      }

      var seq = [anop];
      for ( var i = 0; i < this.models.length ; i++ ) {
        seq.push(arequire(this.models[i]));
      }

      aseq.apply(null, seq)(this.buildModel.bind(this));
    },
    buildJavaFiles_: function() {
      var models = {};
      var visited = {};
      var error = this.error;
      var self = this;

      function add(require) {
        if ( visited[require] ) return;
        visited[require] = true;

        var model = X.lookup(require);
        if ( ! model ) {
          error("Could not load model: ", require);
        }
        if ( model.package &&
             self.blacklistModels.indexOf(model.id) == -1 ) {
          models[model.id] = model;
        }

        // TODO(braden): Figure out how this should work recursively.
        //model.getAllRequires().forEach(add);
      }

      for ( var i = 0; i < this.models.length ; i++ ) {
        var m = this.models[i];
        while (m) {
          add(m);
          m = this.X.lookup(m).extends;
        }
      }

      var javaSource = this.JavaSource.create();
      var ids = Object.keys(models);
      for ( var i = 0; i < ids.length; i++ ) {
        var model = models[ids[i]];
        var outputFile = this.outputFilename_(model.id);
        model.create();
        this.fs.writeFileSync(outputFile, javaSource.generate(model));
      }
    },
    buildModel: function(model) {
      this.targetPath = this.path.normalize(this.targetPath);
      this.mkdir(this.targetPath);

      this.buildJavaFiles_();
      process.exit(0);
    },
    // Expects some.package.name, returns the destination filename. Any
    // necessary directories will have been created.
    outputFilename_: function(pkg) {
      var parts = pkg.split('.');
      var p = this.targetPath;
      while(parts.length > 1) {
        p = this.path.join(p, parts.shift());
        this.mkdir(p);
      }

      // The final part is the classname.
      return this.path.join(p, parts[0] + '.java');
    },
    mkdir: function(dir) {
      if (this.fs.existsSync(dir)) return;
      this.fs.mkdirSync(dir);
    },
    getFilePath: function(file) {
      var path = file;
      if ( path.slice(-3) !== '.js' ) path += '.js';
      if ( path.charAt(0) !== this.path.sep )
        path = FOAM_BOOT_DIR + this.path.sep + path;
      return path;
    }
  },
});
