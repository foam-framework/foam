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
  name: 'I18nApp',

  requires: [
    'foam.dao.NodeFileDAO as FileDAO',
    'foam.dao.File',
    'foam.core.dao.OrDAO',
    'node.dao.ModelFileDAO',
    'foam.i18n.GlobalController'
  ],
  imports: [ 'error' ],

  properties: [
    {
      model_: 'StringProperty',
      name: 'appDefinition',
      required: true
    },
    {
      model_: 'StringProperty',
      name: 'targetPath',
      help: multiline(function() {/* Directory to write output files to.  Will
        be created if it doesn't exist. When outputFormat=foamData, this is
        treated as the classpath where data file should be put. For example,
        if targetPath='/foo', and dataId='bar.baz.Messages', then data will be
        stored in /foo/bar/baz/Messages.js. */}),
      required: true
    },
    {
      model_: 'StringArrayProperty',
      name: 'extraClassPaths',
      help: 'List of extra .js hierarchies to load models from.  Paths will be checked in the order given, finally falling back to the main FOAM js/ hierarchy.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      model_: 'foam.core.types.StringEnumProperty',
      name: 'outputFormat',
      choices: [
        ['chrome', 'Chrome messages.json'],
        ['foamData', 'FOAM __DATA(MessageBundle JSON)'],
        ['foamJSON', 'FOAM MessageBundle messages.json']
      ],
      defaultValue: 'chrome'
    },
    {
      model_: 'StringProperty',
      name: 'dataId',
      help: 'Only applies to outputFormat=foamData. Package-qualified ID for data file.',
      defaultValue: 'foam.i18n.messages.Messages'
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
      name: 'i18nController',
      lazyFactory: function() { return this.GlobalController.create(); }
    },
    {
      name: 'visitedModels_',
      lazyFactory: function() { return {}; }
    },
    {
      model_: 'IntProperty',
      name: 'pending_',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu === 0 ) {
          if ( this.outputFormat === 'foamData' ) {
            this.outputFoamData_();
          } else if ( this.outputFormat === 'foamJSON' ) {
            this.outputFoamJSON_();
          } else {
            this.outputChromeMessages_();
          }
        }
      }
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

      var self = this;
      self.X.ModelDAO.find(
          self.appDefinition,
          {
            put: function(app) {
              // Manually manage pending_ count for two top-level async calls.
              this.pending_ += 2;
              // var models =
                  app.extraModels.concat([
                app.defaultView,
                app.controller
              ]).forEach(function(modelId) {
                return arequire(modelId)(self.visitModel_.bind(
                    self, function() { --self.pending_; }));
              });
              // apar.apply(null, models)(self.execute_.bind(self));
            }.bind(this),
            error: function() {
              self.error('ERROR: Failed to load app definition from: ' +
                  self.appDefinition);
            }
          });
    },
    visitModel_: function(ret, model) {
      this.i18nController.extractor.visitModel(model);
      this.visitedModels_[model.id] = true;
      var deps = model.getAllRequires();
      for ( var i = 0; i < deps.length; ++i ) {
        if ( ! this.visitedModels_[deps[i]] ) {
          this.arequire_(deps[i])(function(ret, model) {
            this.visitModel_(ret, model);
          }.bind(this));
        }
      }
      ret(model);
    },
    // Nix most of what's below.
    execute_: function() {
      var i18nController = this.GlobalController.create();



      // Old model latch-loaded models.
      i18nController.visitAllKnownModels([i18nController.extractor]);

      // New ModelFileDAO-loaded models.
      this.X.ModelDAO.select({
        put: function(model) { i18nController.extractor.visitModel(model); },
        eof: this.execute__.bind(this, i18nController)
      });
    },
    arequire_: function(modelId) {
      ++this.pending_;
      var future = afuture();
      var self = this;
      arequire(modelId)(function(model) {
        future.set(function() { --self.pending_; }, model);
      });
      return future.get;
    },
    outputFoamData_: function() {
      var self = this;
      this.i18nController.extractor.amessagesFile(self.dataId, function(str) {
        console.log(self.dataId);
        var filePath = self.dataId.replace(/[.]/g, self.path.sep) + '.js';
        console.log(filePath);
        console.log(self.targetPath + self.path.sep + filePath);
        var file = self.File.create({
          path: self.targetPath + self.path.sep + filePath,
          contents: str
        });
        self.fileDAO.put(file, {
          put: function() { process.exit(0); },
          error: function() {
            self.error('ERROR writing file: ', file.path);
            process.exit(1);
          }
        });
      });
    },
    outputFoamJSON_: function() {
      var self = this;
      this.i18nController.extractor.amessages(function(data) {
        var str = JSONUtil.compact.where(NOT_TRANSIENT).stringify(data);
        var file = self.File.create({
          path: self.targetPath + self.path.sep + 'messages.json',
          contents: str
        });
        self.fileDAO.put(file, {
          put: function() { process.exit(0); },
          error: function() {
            self.error('ERROR writing file: ', file.path);
            process.exit(1);
          }
        });
      });
    },
    outputChromeMessages_: function() {
      var self = this;
      this.i18nController.extractor.achromeMessages(function(data) {
        var str = JSON.stringify(data);
        var file = self.File.create({
          path: self.targetPath + self.path.sep + 'messages.json',
          contents: str
        });
        self.fileDAO.put(file, {
          put: function() { process.exit(0); },
          error: function() {
            self.error('ERROR writing file: ', file.path);
            process.exit(1);
          }
        });
      });
    }
  }
});
