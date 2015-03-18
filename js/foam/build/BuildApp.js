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
  name: 'BuildApp',

  imports: [
    'log',
    'error'
  ],
  requires: [
    'foam.dao.NodeFileDAO as FileDAO',
    'foam.dao.File',
    'foam.core.dao.OrDAO',
    'node.dao.ModelFileDAO'
  ],
  properties: [
    {
      name: 'controller',
      help: 'Name of the main controller/model to create',
      required: true
    },
    {
      model_: 'StringArrayProperty',
      name: 'coreFiles',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      name: 'defaultView',
      help: "Default view of the controller to use.  If not set, the controller will be used as view (if it is one), or DetailView will be used"
    },
    {
      name: 'targetPath',
      help: "Directory to write output files to.  Will be created if it doesn't exist.",
      required: true
    },
    {
      model_: 'BooleanProperty',
      name: 'precompileTemplates',
      help: 'True to precompile templates of models loaded from the ModelDAO.',
      defaultValue: false
    },
    {
      model_: 'StringArrayProperty',
      name: 'extraFiles',
      help: 'Extra files to both load during the build process, and include in the built image.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      model_: 'StringArrayProperty',
      name: 'extraModels',
      help: 'Extra models to include in the image regardless of if they were arequired or not.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; },
      factory: function() { return ['foam.ui.FoamTagView']; }
    },
    {
      model_: 'StringArrayProperty',
      name: 'blacklistModels',
      help: 'Models to unconditionally exclude from the image, even if they are listed as required.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      model_: 'BooleanProperty',
      name: 'outputManifest',
      defaultValue: false,
      help: 'Set to true to write out a MANIFEST file listing all included models.'
    },
    {
      name: 'htmlFileName',
      help: 'Name of the main html file to produce.',
      defaultValue: 'main.html'
    },
    {
      name: 'formatter',
      factory: function() {
        return {
          __proto__: JSONUtil.compact,
          keys_: {},
          keyify: JSONUtil.prettyModel.keyify,
          outputObject_: function(out, obj, opt_defaultModel) {
            var first = true;

            out('{');
            if ( obj.model_.id !== opt_defaultModel ) {
              this.outputModel_(out, obj);
              first = false;
            }

            if ( Template.isInstance(obj) ) var isTemplate = true;

            for ( var key in obj.model_.properties_ ) {
              var prop = obj.model_.properties_[key];

              if ( ! this.p(prop) && ( ! isTemplate || prop.name !== 'code' ) ) continue;

              if ( prop.name === 'documentation' ) continue;

              if ( prop.name in obj.instance_ ) {
                var val = obj[prop.name];
                if ( Array.isArray(val) && ! val.length ) continue;
                if ( ! first ) out(',');
                out(this.keyify(prop.name), ': ');

                if ( prop.name === 'methods' ) {
                  out('{');
                  var ff = true;
                  for ( var i = 0 ; i < val.length ; i++ ) {
                    if ( ! ff ) out(',');

                    out(this.keyify(val[i].name), ': ');
                    out(val[i].code);
                    ff = false;
                  }
                  out('}');
                } else {
                  this.output(out, val);
                }
                first = false;
              }
            }

            out('}');
          }
        };
      }
    },
    {
      name: 'path',
      factory: function() { return require('path'); }
    },
    {
      name: 'fileDAO',
      factory: function() { return this.FileDAO.create(); }
    },
    {
      model_: 'StringArrayProperty',
      name: 'extraClassPaths',
      help: 'List of extra .js hierarchies to load models from.  Paths will be checked in the order given, finally falling back to the main FOAM js/ hierarchy.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    }
  ],
  methods: {
    execute: function() {
      if ( ! this.targetPath ) {
        this.error("targetPath is required");
        process.exit(1);
      }
      if ( ! this.controller ) {
        this.error("controller is required");
        process.exit(1);
      }

      for ( var i = this.extraClassPaths.length - 1; i >= 0; i-- ) {
        this.X.ModelDAO = this.OrDAO.create({
          primary: this.ModelFileDAO.create({
            classpath: this.extraClassPaths[i]
          }),
          delegate: this.X.ModelDAO
        });
      }

      for ( var i = 0 ; i < this.extraFiles.length ; i++ ) {
        require(FOAM_BOOT_DIR + this.path.sep + this.extraFiles[i] + '.js');
      }

      var view = this.defaultView ? arequire(this.defaultView) : anop;


      var seq = [view];
      for ( var i = 0; i < this.extraModels.length ; i++ ) {
        seq.push(arequire(this.extraModels[i]));
      }

      aseq(
        aseq.apply(null, seq),
        arequire(this.controller))(this.execute_.bind(this));
    },
    buildCoreJS_: function(ret) {
      var i = 0;
      var self = this;
      var corejs = '';
      var file;
      if ( this.coreFiles.length ) var myfiles = this.coreFiles;
      else myfiles = files;
      myfiles = myfiles.concat(this.extraFiles);
      awhile(
        function() { return i < myfiles.length; },
        aif(
          function() {
            file = myfiles[i++];
            if ( Array.isArray(file) ) {
              if ( file[1] != IN_BROWSER ) return false;
              file = file[0];
            }
            return true;
          },
          aseq(
            function(ret) {
              var path = FOAM_BOOT_DIR + this.path.sep + file + '.js';
              this.fileDAO.find(path, {
                put: ret,
                error: function() {
                  self.error.apply(["Error reading file: ", path].concat(arguments));
                }
              });
            }.bind(this),
            function(ret, file) {
              corejs += '\n';
              corejs += file.contents;
              ret();
            })))(function() { ret(corejs); });
    },
    buildAppJS_: function(ret) {
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

        model.getAllRequires().forEach(add);
      };
      add(this.controller);
      if ( this.defaultView ) add(this.defaultView);

      for ( var i = 0; i < this.extraModels.length ; i++ ) {
        add(this.extraModels[i]);
      }

      var contents = '';

      var ids = Object.keys(models);
      if ( this.outputManifest ) {
        this.fileDAO.put(this.File.create({
          path: this.targetPath + this.path.sep + 'MANIFEST',
          contents: ids.join('\n')
        }));
      }

      for ( var i = 0; i < ids.length; i++ ) {
        var model = models[ids[i]];
        if ( this.precompileTemplates ) {
          for ( var j = 0 ; j < model.templates.length ; j++ ) {
            model.templates[j].code = TemplateUtil.compile(model.templates[j]);
            model.templates[j].clearProperty('template');
          }
        }
        contents += 'CLASS(';
        if ( this.precompileTemplates )
          contents += this.formatter.where(NOT_TRANSIENT).stringify(models[ids[i]]);
        else
          contents += JSONUtil.compact.where(NOT_TRANSIENT).stringify(models[ids[i]]);
        contents += ')\n';
      }

      ret(contents);
    },
    execute_: function(model) {
      if ( ! model ) {
        this.error("Could not find model: ", this.controller);
      }
      this.log("Building   ", model.id);
      this.log("Target is: ", this.targetPath);
      this.log(this.precompileTemplates ? '' : 'NOT ', 'pre-compiling templates.');

      var self = this;
      aseq(
        function(ret) {
          var file = this.File.create({
            path: this.targetPath + this.path.sep + this.htmlFileName,
            contents: this.HTML()
          });

          console.log("Writing: ", file.path);
          this.fileDAO.put(file, {
            put: ret,
            error: function() {
              self.error('ERROR writing file: ', file.path);
              process.exit(1);
            }
          });
        }.bind(this),
        apar(
          function(ret) { this.buildCoreJS_(ret); }.bind(this),
          function(ret) { this.buildAppJS_(ret); }.bind(this)),
        function(ret, corejs, appjs) {
          var file = this.File.create({
            path: this.targetPath + this.path.sep + 'foam.js',
            contents: corejs + appjs
          });
          console.log("Writing: ", file.path);
          this.fileDAO.put(file, {
            put: ret,
            error: function() {
              self.error("ERROR writing file: ", file.path);
              process.exit(1);
            }
          });
        }.bind(this)
      )(
        function(){
          process.exit(0);
        });
    }
  },
  templates: [
    function HTML() {/*<html><head><meta charset="utf-8"><script src="foam.js"></script></head><body><foam model="<%= this.controller %>"<% if ( this.defaultView ) { %> view="<%= this.defaultView %>"<% } %>></foam></body></html>*/}
  ]
});
