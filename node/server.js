/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
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

var http = require('http');
var fs   = require('fs');
var path = require('path');

MODEL({
  name: 'NodeServer',
  requires: [
    'ErrorHandler',
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
    }
  ],

  methods: {
    launch: function() {
      this.server = require('http').createServer(this.onRequest);
      this.server.listen(this.port);
      console.log('Server running on port ' + this.port);
    },
    attachHandler: function(h) {
      this.handlers.push(h);
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

MODEL({
  name: 'Handler',
  documentation: 'Abstract Handler class. handle() returns true if handled, ' +
      'false if the server should keep looking.',

  properties: [
    {
      name: 'logLevel',
      defaultValue: 3,
      documentation: '0 = none, 1 = errors, 2 = warnings, 3 = normal logging, 4 = verbose'
    }
  ],
  constants: {
    LOG_TITLE: 'Default'
  },

  methods: {
    handle: function() {
      console.warn('Abstract handle call');
      return false;
    },
    send: function(res, status, body) {
      res.statusCode = status;
      res.write(body, 'utf8');
      res.end();
    },
    sendJSON: function(res, status, json) {
      this.send(res, status, JSON.stringify(json));
    },
    mkLogMessage_: function(level, msg) {
      return '[' + (new Date()).toISOString() + '] (' + level + ') [' + this.LOG_TITLE + ']  ' + msg;
    },
    log: function(msg) {
      if ( this.logLevel < 3 ) return;
      console.log(this.mkLogMessage_('II', msg));
    },
    warn: function(msg) {
      if ( this.logLevel < 2 ) return;
      console.warn(this.mkLogMessage_('WW', msg));
    },
    error: function(msg) {
      if ( this.logLevel < 1 ) return;
      console.error(this.mkLogMessage_('EE', msg));
    },
    verbose: function(msg) { 
      if ( this.logLevel < 4 ) return;
      console.log(this.mkLogMessage_('VV', msg));
    }
  }
});

MODEL({
  name: 'StaticFileHandler',
  extendsModel: 'Handler',
  properties: [
    {
      name: 'dir',
      documentation: 'Directory under which to serve files.',
      required: true,
      preSet: function(old, nu) {
        return path.resolve(process.cwd(), nu);
      },
    },
    {
      name: 'prefix',
      documentation: 'URL path prefix. Stripped before searching $$DOC{ref:".dir"}.',
      required: true
    },
    {
      name: 'listDirectories',
      documentation: 'When set to true, the server will list directory ' +
          'contents. When false, returns 404s for directories.',
      defaultValue: true
    }
  ],

  constants: {
    LOG_TITLE: 'static',
    MIME_TYPES: {
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.html': 'text/html',
      __default: 'application/octet-stream'
    }
  },

  methods: {
    send404: function(res, target) {
      this.send(res, 404, 'File not found: ' + target);
    },
    handle: function(req, res) {
      // Try to serve a static file.
      if ( ! this.dir ) return false;

      // Check the URL for the prefix.
      var target = req.url; // eg. /foo/bar/baz.jpg
      if ( target.indexOf(this.prefix) !== 0 ) return false;

      target = target.substring(this.prefix.length);

      // Check and strip the prefix off the URL.
      if ( target.indexOf('?') >= 0 )
        target = target.substring(0, target.indexOf('?'));
      if ( target.indexOf('#') >= 0 )
        target = target.substring(0, target.indexOf('#'));

      this.verbose('Matched prefix, target file: ' + target);

      // String a leading slash, if any.
      if ( target[0] === '/' ) target = target.substring(1);
      target = path.resolve(this.dir, target);
      this.verbose('Target resolved to: ' + target);
      var rel = path.relative(this.dir, target);
      this.verbose('Relative path: ' + target);
      // The relative path can't start with .. or it's outside the dir.
      if ( rel.startsWith('..') ) {
        this.send(res, 404, 'Illegal path: Attempts to leave directory.');
        this.warn('Tried to read static file outside directory: ' + target);
        return true;
      }

      // Now we have a legal filename within our subdirectory.
      // We try to stream the file to the other end.
      if ( ! fs.existsSync(target) ) {
        this.send404(res, target);
        this.warn('File not found: ' + target);
        return true;
      }

      var stats = fs.statSync(target);
      if ( stats.isDirectory() ) {
        if ( ! this.listDirectories ) {
          this.send404(res, target);
          return true;
        }
        // Send the directory listing.
        var title = 'Directory listing for ' + req.url;
        var body = '<html><head><title>' + title + '</title></head><body>';
        body += '<h2>' + title + '</h2><hr /><ul>';

        var files = fs.readdirSync(target);
        for ( var i = 0 ; i < files.length ; i++ ) {
          var st = fs.statSync(path.join(target, files[i]));
          var name = files[i] + (st.isDirectory() ? '/' : '');
          body += '<li><a href="' + name + '">' + name + '</a></li>';
        }
        body += '</ul></body></html>';
        res.setHeader('Content-type', 'text/html');
        res.statusCode = 200;
        res.write(body, 'utf8');
        res.end();
        this.log('200 OK (dir) ' + target);
      } else {
        var ext = path.extname(target);
        var mimetype = this.MIME_TYPES[ext] || this.MIME_TYPES.__default;
        if ( mimetype === this.MIME_TYPES.__default ) {
          this.log('Unknown MIME type: ' + ext);
        }
        res.statusCode = 200;
        res.setHeader('Content-type', mimetype);

        // Open the file as a stream.
        this.log('200 OK ' + target);
        var stream = fs.createReadStream(target);
        stream.pipe(res);
      }
      return true;
    }
  }
});

MODEL({
  name: 'DAOHandler',
  extendsModel: 'Handler',
  properties: [
    {
      name: 'path',
      defaultValue: '/api'
    },
    {
      name: 'daoMap',
      required: true
    }
  ],
  constants: {
    LOG_TITLE: 'DAO'
  },

  methods: {
    handle: function(req, res) {
      if ( req.url !== this.path ) return false;
      var body = '';
      req.on('data', function(data) { body += data; });
      req.on('end', function() {
        var msg = JSONUtil.parse(this.X, body);
        var dao = this.daoMap[msg.subject];
        if (!dao) {
          this.sendJSON(res, 400, { error: 'No such DAO.' });
          this.warn('Requested DAO not found: ' + msg.subject);
          return;
        }

        // Now: we have various parameters in the message and need to parse them.
        // subject gives the DAO name.
        // method is one of: find, select, remove, put.
        // params (an array) is deserialized and passed to the said method.
        // context is an object containing any extra info. Currently unhandled.
        //   May eventually be useful for authentication, authorization, etc.
        var self = this;
        if (msg.method == 'select') {
          dao.select.apply(dao, msg.params)(function(sink) {
            self.log('select() success');
            self.send(res, 200, JSONUtil.stringify(sink));
          });
        } else if (msg.method == 'removeAll') {
          if (msg.params[0]) { // hasSink
            var arr = [];
            dao.removeAll({
              remove: arr.push,
              eof: function() {
                self.log('removeAll() success');
                self.send(res, 200, JSONUtil.stringify(arr));
              }
            }, msg.params[1]);
          } else {
            dao.removeAll({
              eof: function() {
                self.log('removeAll() success');
                self.send(res, 200, JSON.stringify('[]'));
              }
            }, msg.params[1]);
          }
        } else {
          // TODO: Handle cases where the argument is missing.
          dao[msg.method](msg.params[0], {
            put: function(x) {
              self.log(msg.method + '() success');
              self.send(res, 200, JSONUtil.stringify({ put: x }));
            },
            remove: function() {
              self.log('remove() success');
              self.sendJSON(res, 200, { put: 1 });
            },
            error: function(err) {
              self.warn('Error during ' + msg.method + ': ' + err);
              self.sendJSON(res, 200, { error: err });
            }
          });
        }
      }.bind(this));
      return true;
    }
  }
});

