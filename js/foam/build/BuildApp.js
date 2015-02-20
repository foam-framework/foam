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
  name: "BuildApp",
  package: 'foam.build',
  imports: [
    'log',
    'error'
  ],
  requires: [
    'foam.dao.NodeFileDAO as FileDAO',
    'foam.dao.File'
  ],
  properties: [
    {
      name: 'controller',
      help: 'Name of the main controller/model to create',
      required: true
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
      name: 'formatter',
      factory: function() {
        return {
          __proto__: JSONUtil.compact,
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

              if ( prop.name in obj.instance_ ) {
                var val = obj[prop.name];
                if ( val == prop.defaultValue ) continue;
                if ( Array.isArray(val) && ! val.length ) continue;
                if ( ! first ) out(',');
                out(this.keyify(prop.name), ': ');
                this.output(out, val);
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
      var view = this.defaultView ? arequire(this.defaultView) : anop;
      aseq(
        view,
        arequire(this.controller))(this.execute_.bind(this));
    },
    buildCoreJS_: function(ret) {
      var i = 0;
      var self = this;
      var corejs = '';
      var file;
      awhile(
        function() { return i < files.length; },
        aif(
          function() {
            file = files[i++];
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

      function add(require) {
        if ( visited[require] ) return;
        visited[require] = true;

        var model = FOAM.lookup(require, X);
        if ( ! model ) {
          error("Could not load model: ", require);
        }
        if ( model.package ) models[model.id] = model;

        model.getAllRequires().forEach(add);
      };
      add(this.controller);
      if ( this.defaultView ) add(this.defaultView);

      var contents = '';

      var ids = Object.keys(models);
      this.fileDAO.put(this.File.create({
        path: this.targetPath + this.path.sep + 'MANIFEST',
        contents: ids.join('\n')
      }));
      for ( var i = 0; i < ids.length; i++ ) {
        var model = models[ids[i]];
        for ( var j = 0 ; j < model.templates.length ; j++ ) {
          model.templates[j].code = TemplateUtil.compile(model.templates[j]);
          model.templates[j].clearProperty('template');
        }
        contents += 'CLASS(';
        contents += this.formatter.where(NOT_TRANSIENT).stringify(models[ids[i]]);
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

      var self = this;
      aseq(
        function(ret) {
          var file = this.File.create({
            path: this.targetPath + this.path.sep + 'main.html',
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
    function HTML() {/*<html><head><script src="foam.js"></script></head><body><foam model="<%= this.controller %>"<% if ( this.defaultView ) { %> view="<%= this.defaultView %>"<% } %>></foam></body></html>*/}
  ]
});
