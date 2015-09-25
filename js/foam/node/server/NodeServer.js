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
  package: 'foam.node.server',
  name: 'NodeServer',
  requires: [
    'foam.node.server.DAOHandler',
  ],
  properties: [
    {
      name: 'port',
      defaultValue: 80
    },
    {
      name: 'handlers',
      factory: function() { return []; }
    },
    {
      name: 'server',
      hidden: true,
      transient: true
    },
    {
      name: 'io',
      hidden: true,
      transient: true
    },
    {
      name: 'clients',
      factory: function() { return []; }
    },
    {
      name: 'daoHandler_',
    }
  ],

  methods: {
    launch: function() {
      this.server = require('http').createServer(this.onRequest);
      console.log("About to listen on " + process.env.IP + ":" + process.env.PORT);
      this.server.listen(process.env.PORT, process.env.IP);
      console.log('Server running on port ' + this.port);
      
      this.io = require('socket.io').listen(this.server);
      var sockets = this.clients;
      this.io.on('connection', function(client) {
        sockets.push(client);
        console.log("** CONNECT: " + sockets.length + " connections active");
        client.on('disconnect', function() {
          if (sockets.indexOf(client) > -1) {
            sockets.splice(sockets.indexOf(client), 1);
          }
          console.log("** DISCONNECT: " + sockets.length + " connections remain");
        });
      })
    },
    // This method allows NodeServer (and subclasses) to be launched directly
    // by tools/foam.js.
    execute: function() {
      this.launch();
    },
    attachHandler: function(h) {
      this.handlers.push(h);
    },
    exportDAO: function(dao, opt_name) {
      if ( ! this.daoHandler_ ) {
        this.daoHandler_ = this.DAOHandler.create();
        this.attachHandler(this.daoHandler_);
      }

      opt_name = opt_name || (dao.model.id + 'DAO');
      this.daoHandler_.daoMap[opt_name] = dao;
    },
    broadcast: function(event, data) {
      // this.io.emit(event, data)
      this.clients.forEach(function(socket) {
        socket.emit(event, data);
      });
    }
  },

  listeners: [
    {
      name: 'onRequest',
      code: function(req, res) {
        try {
          // Request received.
          // Iterate down the handlers, waiting for one to return true.
          for ( var i = 0 ; i < this.handlers.length ; i++ ) {
            var h = this.handlers[i];
            if ( h.handle(req, res) ) return;
          }

          // If nothing handled it, return a 404.
          res.statusCode = 404;
          res.write('Error 404: Nothing found');
          res.end();
        } catch(e) {
          res.statusCode = 500;
          res.write('Error 500: ' + e);
          res.end();
        }
      }
    }
  ]
});
