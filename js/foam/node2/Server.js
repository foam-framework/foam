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
  package: 'foam.node2',
  name: 'Server',
  requires: [
    'foam.node.server.StaticFileHandler',
    'foam.node.server.FileHandler',
    'foam.node2.DAOHandler'
  ],
  exports: [
    'as Server',
    'as HTTPServer'
  ],
  imports: [
    'log'
  ],
  properties: [
    {
      model_: 'StringArrayProperty',
      name: 'agents',
      help: 'List of agents to execute once loaded',
      adapt: function(_, v) {
        if ( typeof v === "string" ) return v.split(',');
        return v;
      }
    },
    {
      model_: 'IntProperty',
      name: 'port',
      defaultValue: 8000,
      adapt: function(_, v) {
        if ( typeof v == "string" ) return parseInt(v);
        return v;
      }
    },
    {
      model_: 'foam.node2.NodeRequireProperty',
      name: 'http'
    },
    {
      name: 'server',
      hidden: true
    },
    {
      model_: 'ArrayProperty',
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
    function execute() {
      this.server = this.http.createServer(this.onRequest);
      this.server.listen(this.port);

      // TODO Find a better way to default these?
      this.agents.push('foam.node2.ServeFOAM');

      for( var i = 0 ; i < this.agents.length ; i++ ) {
        this.log("Loading ", this.agents[i]);
        var f = arequire(this.agents[i])(function(m) {
          var agent = m.create(undefined, this.Y);
          if ( agent.execute ) {
            agent.execute();
          }
          this.log("Loaded ", m.id);
        }.bind(this));
      }
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
      this.log("Exporting " + opt_name);
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
    }
  ]
});
