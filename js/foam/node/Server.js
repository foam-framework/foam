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
  package: 'foam.node',
  name: 'Server',
  requires: [
    'foam.node.handlers.StaticFileHandler',
    'foam.node.handlers.FileHandler',
    'foam.node.handlers.DAOHandler'
  ],
  exports: [
    'log',
    'exportToContext',
    'exportDAO',
    'exportFile',
    'addHandler',
    'exportDirectory',
  ],
  imports: [
    'log as log_'
  ],
  properties: [
    {
      type: 'StringArray',
      name: 'agents',
      help: 'List of agents to execute once loaded',
      adapt: function(_, v) {
        if ( typeof v === "string" ) return v.split(',');
        return v;
      }
    },
    {
      type: 'Int',
      name: 'port',
      defaultValue: 8000,
      adapt: function(_, v) {
        if ( typeof v == "string" ) return parseInt(v);
        return v;
      }
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'http'
    },
    {
      model_: 'foam.node.NodeRequireProperty',
      name: 'https'
    },
    {
      name: 'keyFile',
    },
    {
      name: 'certFile',
    },
    {
      type: 'Boolean',
      name: 'quiet',
      help: 'Set to true to silence most logs outputs.',
      defaultValue: false,
    },
    {
      name: 'server',
      hidden: true
    },
    {
      type: 'Array',
      name: 'handlers',
      hidden: true
    },
    {
      name: 'daoHandler_',
      lazyFactory: function() { return this.DAOHandler.create({ path: '/api' }); },
      postSet: function(old, handler) {
        if ( old ) {
          this.handlers.removeI(function(p) { return p === old; });
        }
        this.handlers.push(handler);
      }
    }
  ],
  methods: [
    function log() {
      if ( ! this.quiet ) {
        this.log_.apply(null, arguments);
      }
    },
    function execute() {
      if (this.keyFile && this.certFile) {
        var fs = require('fs');
        this.server = this.https.createServer({
          key: fs.readFileSync(this.keyFile),
          cert: fs.readFileSync(this.certFile)
        }, this.onRequest);
      } else {
        this.server = this.http.createServer(this.onRequest);
      }

      this.server.listen(this.port);
      this.server.on('upgrade', this.onUpgrade);

      // TODO Find a better way to default these?
      this.agents.push('foam.node.ServeFOAM');

      for( var i = 0 ; i < this.agents.length ; i++ ) {
        this.log_("Loading ", this.agents[i]);
        var f = arequire(this.agents[i])(function(m) {
          var agent = m.create(undefined, this.Y);
          if ( agent.execute ) {
            agent.execute();
          }
          this.log_("Loaded ", m.id);
        }.bind(this));
      }
    },
    function addHandler(handler) {
      // TODO(adamvy): Not wild about this design, consider a better model for handling
      // oauth.
      this.handlers.push(handler);
    },
    // TODO(markdittmer): We shouldn't be mutating contexts. We should have
    // a robust enough ContextualizingDAO to take care of this.
    function exportToContext(args) {
      Object_forEach(args, function(v, k) {
        this.Y[k] = v;
      }.bind(this));
    },
    function exportDAO(dao, opt_name) {
      opt_name = opt_name || ( dao.model.id + "DAO" );

      if ( ! this.daoHandler_ ) {
        this.daoHandler_ = this.DAOHandler.create({
          path: '/api',
        });
        this.handlers.push(this.daoHandler_);
      }

      this.daoHandler_.daoMap[opt_name] = dao;
      this.log_("Exporting " + opt_name);
    },
    function exportFile(url, filepath) {
      this.handlers.push(
        this.FileHandler.create({
          pathname: url,
          file: filepath
        }));
    },
    function exportDirectory(url, directory) {
      this.handlers.push(
        this.StaticFileHandler.create({
          dir: directory,
          prefix: url
        }));
    }
  ],
  listeners: [
    {
      name: 'onRequest',
      code: function(req, resp) {
        for ( var i = 0 ; i < this.handlers.length ; i++ ) {
          if ( this.handlers[i].handle(req, resp) )
            break;
        }
        if ( i === this.handlers.length ) {
          resp.statusCode = 404;
          resp.end();
        }
      }
    },
    {
      name: 'onUpgrade',
      code: function(req, socket, head) {
        for ( var i = 0 ; i < this.handlers.length ; i++ ) {
          if ( this.handlers[i].upgrade &&
               this.handlers[i].upgrade(req, socket, head) ) {
            break;
          }
        }
        if ( i == this.handlers.length ) {
          socket.end('HTTP/1.1 501 Unimplemented\r\n\r\n');
        }
      }
    }
  ]
});
