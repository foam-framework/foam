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
    'foam.i18n.GlobalController',
    'foam.i18n.IdGenerator',
    'foam.i18n.MessageGenerator'
  ],
  imports: [ 'error' ],

  properties: [
    {
      type: 'String',
      name: 'appDefinition',
      required: true
    },
    {
      type: 'String',
      name: 'targetPath',
      help: multiline(function() {/* Directory to write output files to.  Will
        be created if it doesn't exist. When outputFormat=foamData, this is
        treated as the classpath where data file should be put. For example,
        if targetPath='/foo', and dataId='bar.baz.Messages', then data will be
        stored in /foo/bar/baz/Messages.js. */}),
      required: true
    },
    {
      type: 'StringArray',
      name: 'extraFiles',
      help: 'Extra files to both load before loading models for i18n.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      type: 'StringArray',
      name: 'extraClassPaths',
      help: 'List of extra .js hierarchies to load models from.  Paths will be checked in the order given, finally falling back to the main FOAM js/ hierarchy.',
      adapt: function(_, s) { if ( typeof s === 'string' ) return s.split(','); return s; }
    },
    {
      type: 'String',
      name: 'extractorModel',
      defaultValue: 'foam.i18n.MessagesExtractor'
    },
    {
      type: 'String',
      name: 'messageGeneratorModel',
      defaultValue: 'foam.i18n.MessageGenerator'
    },
    {
      type: 'String',
      name: 'placeholderModel',
      defaultValue: 'foam.i18n.Placeholder'
    },
    {
      type: 'String',
      name: 'messageModel',
      defaultValue: 'foam.i18n.Message'
    },
    {
      type: 'String',
      name: 'messageBundleModel',
      defaultValue: 'foam.i18n.MessageBundle'
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
      type: 'String',
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
      name: 'i18nController'
    },
    {
      name: 'visitedModels_',
      lazyFactory: function() { return {}; }
    },
    {
      type: 'Int',
      name: 'pending_',
      defaultValue: 0,
      postSet: function(old, nu) {
        if ( old === nu ) return;
        if ( nu === 0 ) {
          if ( this.outputFormat === 'foamData' ) {
            this.outputFoamData_();
          } else if ( this.outputFormat === 'foamJSON' ) {
            this.outputFoamJSON_();
          } else if ( this.outputFormat === 'chrome' ) {
            this.outputChromeMessages_();
          } else {
            this.outputFormat_(this.outputFormat);
          }
        }
      }
    }
  ],

  methods: {
    execute: function() {
      var i;

      for ( i = 0; i < this.extraFiles.length; i++ ) {
        require(this.extraFiles[i]);
      }

      for ( i = 0; i < this.extraClassPaths.length ; i++ ) {
        this.X.ModelDAO = this.OrDAO.create({
          delegate: this.ModelFileDAO.create({
            classpath: this.extraClassPaths[i]
          }),
          primary: this.X.ModelDAO
        });
      }

      apar(this.X.arequire(this.extractorModel),
           this.X.arequire(this.messageGeneratorModel),
           this.X.arequire(this.placeholderModel),
           this.X.arequire(this.messageModel),
           this.X.arequire(this.messageBundleModel))(
               function(Extractor, MessageGenerator, Placeholder, Message,
                        MessageBundle) {
                 var idGenerator = this.IdGenerator.create();
                 this.i18nController = this.GlobalController.create({
                   idGenerator: idGenerator,
                   extractor: Extractor.create({
                     idGenerator: idGenerator,
                     messageGenerator: MessageGenerator.create({
                       idGenerator: idGenerator,
                       placeholderFactory: Placeholder.create.bind(Placeholder),
                       messageFactory: Message.create.bind(Message)
                     }),
                     messageBundleFactory: MessageBundle.create.bind(MessageBundle)
                   })
                 });
                 this.execute_();
               }.bind(this));
    },
    execute_: function() {
      var self = this;
      self.X.ModelDAO.find(
          self.appDefinition,
          {
            put: function(app) {
              if ( ! (app.defaultView || app.controller) ) {
                self.error('ERROR: App definition has neither a default view ' +
                    'nor a controller');
              }

              var models = app.extraModels.slice(0);
              if ( app.defaultView ) models.push(app.defaultView);
              if ( app.controller ) models.push(app.controller);

              // Manually manage pending_ count for top-level async calls.
              this.pending_ = models.length;
              models.forEach(function(modelId) {
                return this.X.arequire(modelId)(self.visitModel_.bind(self));
              });
            }.bind(this),
            error: function() {
              self.error('ERROR: Failed to load app definition from: ' +
                  self.appDefinition);
            }
          });
    },
    visitModel_: function(model) {
      return this.i18nController.extractor.avisitModel(model)(
          this.visitModel__.bind(this));
    },
    visitModel__: function(model) {
      this.visitedModels_[model.id] = true;
      var deps = model.getAllRequires();
      for ( var i = 0; i < deps.length; ++i ) {
        if ( ! this.visitedModels_[deps[i]] ) {
          this.arequire_(deps[i]);
        }
      }
      --this.pending_;
    },
    arequire_: function(modelId) {
      ++this.pending_;
      this.X.arequire(modelId)(this.visitModel_.bind(this));
    },
    outputFoamData_: function() {
      var self = this;
      this.i18nController.extractor.amessagesFile(self.dataId, function(str) {
        var filePath = self.dataId.replace(/[.]/g, self.path.sep) + '.js';
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
    },
    outputFormat_: function(format) {
      var self = this;
      this.i18nController.extractor.ai18n(format, function(data) {
        var file = self.File.create({
          path: self.targetPath + self.path.sep + data.fileName,
          contents: data.str
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
