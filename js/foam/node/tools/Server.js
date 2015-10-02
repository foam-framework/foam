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
  package: 'foam.node.tools',
  name: 'Server',
  requires: [
    'foam.node.server.NodeServer',
    'foam.node.server.StaticFileHandler',
    'foam.node.server.FileHandler'
  ],
  exports: [
    'server as HTTPServer'
  ],
  properties: [
    {
      name: 'config',
      documentation: 'A $$DOC{ref:"foam.node.server.ServerConfig"} that ' +
          'describes this server\'s models/DAOs, port, static files, etc.',
    },
    {
      name: 'configModel',
      documentation: 'If set, the server will attempt to load this model and ' +
          'use it as the config. Ignored if $$DOC{ref:".config"} is set.',
    },
    {
      name: 'configFuture',
      factory: function() {
        if (this.config) {
          var c = this.config;
          return function(ret) { ret(c); };
        } else {
          return aseq(
            arequire(this.configModel),
            function(ret, model) {
              var config = model.create();
              this.config = config;
              ret(config);
            }.bind(this)
          );
        }
      }
    },
    {
      model_: 'StringArrayProperty',
      name: 'agents',
      adapt: function(_, v) {
        if ( typeof v === "string" ) return v.split(',');
        return v;
      },
      documentation: 'Name of agents to run or services to create. Usually ' +
          'built from the $$DOC{ref:".config"}.'
    },
    {
      name: 'server',
      hidden: true,
      factory: function() {
        console.log("boot dir is: ", global.FOAM_BOOT_DIR);

        return this.NodeServer.create();
      }
    }
  ],
  methods: [
    function execute() {
      this.configFuture(function() {
        this.configure();
        var self = this;
        for ( var i = 0 ; i < this.agents.length ; i++ ) {
          console.log("Loading ", this.agents[i]);
          arequire(this.agents[i])(function(m) {
            var agent = m.create(undefined, self.Y);
            if ( agent.execute ) agent.execute();
            console.log("Loaded ", m.id);
          });
        }
        this.server.launch();
      }.bind(this));
    },
    function configure() {
      this.server.port = this.config.port;
      var handlers = [];

      // First serve the static files, then static dirs, then DAOs.
      for (var i = 0; i < this.config.staticFiles.length; i++) {
        handlers.push(this.FileHandler.create({
          pathname: this.config.staticFiles[i][0],
          file: this.config.staticFiles[i][1]
        }));
      }

      for (var i = 0; i < this.config.staticDirs.length; i++) {
        handlers.push(this.StaticFileHandler.create({
          prefix: this.config.staticDirs[i][0],
          dir: this.config.staticDirs[i][1]
        }));
      }

      this.server.handlers = handlers;
      for (var i = 0; i < this.config.daos.length; i++) {
        this.server.exportDAO(this.config.daos[i]);
      }
    }
  ]
});
