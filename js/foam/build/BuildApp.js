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
    'node.dao.ModelFileDAO',
    'foam.build.WebApplication',
    'foam.u2.ElementParser'
  ],
  properties: [
    {
      name: 'appDefinition'
    },
    {
      name: 'controller',
      help: 'Name of the main controller/model to create',
    },
    {
      type: 'StringArray',
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
      type: 'Boolean',
      name: 'precompileTemplates',
      help: 'True to precompile templates of models loaded from the ModelDAO.',
      defaultValue: false
    },
    {
      type: 'Boolean',
      name: 'includeFoamCSS',
      defaultValue: false
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
      name: 'resources'
    },
    {
      type: 'Boolean',
      name: 'appcacheManifest',
      defaultValue: false
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
      name: 'extraModels',
      help: 'Extra models to include in the image regardless of if they were arequired or not.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; },
      factory: function() { return ['foam.ui.FoamTagView']; }
    },
    {
      type: 'StringArray',
      name: 'blacklistModels',
      help: 'Models to unconditionally exclude from the image, even if they are listed as required.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      type: 'Boolean',
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
      type: 'StringArray',
      name: 'htmlHeaders'
    },
    {
      name: 'formatter',
      factory: function() {
        return {
          __proto__: JSONUtil.compact,
          formatFunction: function(f) {
            var s = f.code.toString();
            if ( s.startsWith('function ' + f.name + '(') ) return s;
            return s.replace(/function ([^\(]*)\(/, 'function ' + f.name + '(')
          },
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

            var properties = obj.model_.getRuntimeProperties();
            for ( var key in properties ) {
              var prop = properties[key];

              if ( ! this.p(prop) && ( ! isTemplate || prop.name !== 'code' ) ) continue;

              if ( prop.name === 'documentation' ) continue;

              if ( prop.name in obj.instance_ ) {
                var val = obj[prop.name];
                if ( Array.isArray(val) && ! val.length ) continue;
                if ( ! first ) out(',');
                out(this.keyify(prop.name), ': ');

                if ( prop.name === 'methods' ) {
                  out('[');
                  var ff = true;
                  for ( var i = 0 ; i < val.length ; i++ ) {
                    if ( ! ff ) out(',');

                    out(this.formatFunction(val[i]));
                    ff = false;
                  }
                  out(']');
                } else {
                  if ( Array.isArray(val) && prop.subType ) {
                    this.outputArray_(out, val, prop.subType);
                  } else {
                    this.output(out, val);
                  }
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
      type: 'StringArray',
      name: 'extraClassPaths',
      help: 'List of extra .js hierarchies to load models from.  Paths will be checked in the order given, finally falling back to the main FOAM js/ hierarchy.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      type: 'String',
      name: 'locale'
    },
    // TODO(markdittmer): Remove "i18nMessagesPath" when all build processes
    // no longer require it.
    {
      type: 'String',
      name: 'i18nMessagesPath'
    },
    {
      type: 'String',
      name: 'i18nTranslationsPath'
    },
    {
      type: 'StringArray',
      name: 'i18nMessages',
      adapt: function(_, s) {
        if (typeof s === 'string') return s.split(',');
        return s;
      }
    },
    {
      type: 'StringArray',
      name: 'i18nTranslations',
      adapt: function(_, s) {
        if (typeof s === 'string') return s.split(',');
        return s;
      }
    },
    {
      type: 'String',
      name: 'jsFileName',
      getter: function() {
        return 'foam' + (this.locale ? '_' + this.locale : '') + '.js';
      }
    },
    {
      type: 'String',
      name: 'manifestFileName',
      getter: function() {
        return 'app' + (this.locale ? '_' + this.locale : '') + '.manifest';
      }
    },
    {
      name: 'localizedHTMLFileName_',
      getter: function() {
        var match = this.htmlFileName.match(/[.][^.]*$/g);
        var ext = match ? match[0] : '';
        var baseName = this.htmlFileName.slice(0,
            this.htmlFileName.length - ext.length);
        return baseName + (this.locale ? '_' + this.locale : '') + ext;
      }
    },
    {
      type: 'String',
      name: 'delegate'
    }
  ],
  methods: {
    execute: function() {
      this.ElementParser.create();
      
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
        this.X.arequire(this.delegate)(function(DelegateModel) {
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
      if ( ! this.controller ) {
        this.error("controller is required");
        process.exit(1);
      }

      var extraBuildFiles = this.extraBuildFiles.concat(this.extraFiles);
      for ( var i = 0 ; i < extraBuildFiles.length ; i++ ) {
        var path = this.getFilePath(extraBuildFiles[i]);
        require(path);
      }

      var view = this.defaultView ? this.X.arequire(this.defaultView) : anop;


      var seq = [view];
      for ( var i = 0; i < this.extraModels.length ; i++ ) {
        seq.push(this.X.arequire(this.extraModels[i]));
      }

      aseq(
        aseq.apply(null, seq),
        this.X.arequire(this.controller))(this.buildModel.bind(this));
    },
    buildCoreJS_: function(ret) {
      var i = 0;
      var self = this;
      var corejs = '';
      var file;
      var myfiles = this.coreFiles.length ? this.coreFiles : files ;
      myfiles = myfiles.concat(this.extraFiles);
      awhile(
        function() { return i < myfiles.length; },
        aif(
          function() {
            file = myfiles[i++];
            if ( Array.isArray(file) ) {
              if ( ! file[0] ||
                   file[1] == IN_NODEJS || // Exclude nodejs files
                   file[1] == IN_CHROME_APP || // Exclude chrome app files
                   file[0] == '../js/foam/core/bootstrap/BrowserFileDAO' // Exclude BrowserFileDAO, use more portable IE11ModelDAO
                 )
                return false;
              file = file[0];
            }
            return true;
          },
          aseq(
            function(ret) {
              var path = this.getFilePath(file);
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

        // Only CLASS models have requires. Other types (eg. Enums) don't have
        // requires to process.
        if ( model.getAllRequires ) model.getAllRequires().forEach(add);
        else if ( model.model_ ) add(model.model_);
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
        if (model.model_.id === 'Model') {
          // Special case for full CLASS models.
          if ( this.precompileTemplates ) {

            function precompile(model) {
              for ( var j = 0 ; j < model.templates.length ; j++ ) {
                var t = model.templates[j];
                // It's safe to remove leading and trailing whitespace from CSS.
                if ( t.name === 'CSS' ) t.template = t.template.split('\n').map(function(s) { return s.trim(); }).join('\n');
                t.code = TemplateUtil.compile(t, model);
                t.clearProperty('template');
              }
              model.models.forEach(precompile)
            }

            precompile(model);
          }
          contents += 'CLASS(';
          var formatter = this.precompileTemplates ? this.formatter : JSONUtil.compact;
          contents += formatter.where(NOT_TRANSIENT).stringifyObject(models[ids[i]], 'Model');
          contents += ')\n';
        } else {
          // Simple case for other kinds of models (eg. Enums).
          console.log('Outputting ' + model.id + ' which is of model ' + model.model_.id);
          contents += '__DATA(';
          contents += JSONUtil.compact.where(NOT_TRANSIENT).stringifyObject(model);
          contents += ')\n';
        }
      }

      ret(contents);
    },
    buildModel: function(model) {
      if ( ! model ) {
        this.error('Could not find model: ', this.controller);
      }
      this.log('Building   ', model.id);
      this.log('Target is: ', this.targetPath);
      this.log(this.precompileTemplates ? '' : 'NOT ', 'pre-compiling templates.');

      var self = this;
      aseq(
        function(ret) {
          var file = this.File.create({
            path: this.targetPath + this.path.sep + this.localizedHTMLFileName_,
            contents: this.HTML()
          });

          console.log('Writing: ', file.path);
          this.fileDAO.put(file, {
            put: ret,
            error: function() {
              self.error('ERROR writing file: ', file.path);
              process.exit(1);
            }
          });
        }.bind(this),
        aif(this.appcacheManifest,
            function(ret) {
              var file = this.File.create({
                path: this.targetPath + this.path.sep + this.manifestFileName,
                contents: this.MANIFEST()
              });
              console.log('Writing: ', file.path);
              this.fileDAO.put(file, {
                put: ret,
                error: function() {
                  this.error("ERROR writing file: ", file.path);
                  process.exit(1);
                }
              });
            }.bind(this)),
        apar(
          function(ret) { this.buildCoreJS_(ret); }.bind(this),
          function(ret) { this.buildAppJS_(ret); }.bind(this)),
          function(ret, corejs, appjs) {
            var file = this.File.create({
              path: this.targetPath + this.path.sep + this.jsFileName,
              contents: corejs + appjs
            });
            console.log('Writing: ', file.path);
            this.fileDAO.put(file, {
              put: ret,
              error: function() {
                self.error('ERROR writing file: ', file.path);
                process.exit(1);
              }
            });
          }.bind(this)
          )(
        function(){
          process.exit(0);
        });
    },
    getFilePath: function(file) {
      var path = file;
      if ( path.slice(-3) !== '.js' ) path += '.js';
      if ( path.charAt(0) !== this.path.sep )
        path = FOAM_BOOT_DIR + this.path.sep + path;
      return path;
    }
  },
  templates: [
    function HTML() {/*<html<% if ( this.appcacheManifest ) { %> manifest="app.manifest"<% } %>><head><meta charset="utf-8"><%= this.htmlHeaders.join('') %><% if ( this.includeFoamCSS ) { %><link rel="stylesheet" type="text/css" href="foam.css"/><% } %><% if ( this.icon ) { %><link rel="icon" sizes="128x128" href="<%= this.icon %>"/><% } %><script src="%%jsFileName"></script></head><body style="margin:0px"><foam model="<%= this.controller %>"<% if ( this.defaultView ) { %> view="<%= this.defaultView %>"<% } %>></foam></body></html>*/},
    function MANIFEST() {/*CACHE MANIFEST
# version <%= this.version %>
<% if ( this.appDefinition ) { %># hash: <%= this.appDefinition.hashCode() %><% } %>

CACHE:
%%jsFileName
%%localizedHTMLFileName_
<% if ( this.includeFoamCSS ) { %>foam.css<% } %>
<% for ( var i = 0 ; i < this.resources.length ; i++ ) { %><%= this.resources[i] %>
<% } %>

NETWORK:
*
*/}
  ]
});
